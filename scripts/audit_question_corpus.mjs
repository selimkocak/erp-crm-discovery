#!/usr/bin/env node
/**
 * ERP CRM Discovery — Question Corpus Audit Engine
 *
 * FAZ-48 Single Source of Truth for Question Pack Quality, Integrity and Duplication Audit.
 * Scans all 34 canonical question packs in question-packs/
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");
const PACKS_DIR = resolve(ROOT_DIR, "question-packs");

function findPackFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPackFiles(fullPath));
    } else if (entry.isFile() && entry.name === "core.json") {
      results.push(fullPath);
    }
  }
  return results;
}

function normalizeTurkishText(text) {
  if (!text) return "";
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?()"'“”‘’/\\-]/g, " ")
    .toLocaleLowerCase("tr");
}

function getTokens(text) {
  const norm = normalizeTurkishText(text);
  const stopWords = new Set(["ve", "veya", "ile", "için", "mi", "mı", "mu", "mü", "nasıl", "hangi", "var", "yok", "bir", "bu", "şu", "da", "de", "ne", "zaman", "kim"]);
  return new Set(norm.split(/\s+/).filter((t) => t.length > 2 && !stopWords.has(t)));
}

function calculateJaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function runCorpusAudit(options = {}) {
  const packFiles = findPackFiles(PACKS_DIR).sort();
  const summary = {
    totalPacks: packFiles.length,
    totalQuestions: 0,
    requiredQuestions: 0,
    optionalQuestions: 0,
    branchingQuestions: 0,
    inPackIdDuplicates: [],
    compositeKeyDuplicates: [],
    branchingErrors: [],
    formattingIssues: [],
    duplicateOptions: [],
    emptyOptions: [],
    exactDuplicates: [],
    probableDuplicates: [],
    intentionalOverlaps: [],
    packsSummary: [],
  };

  const allQuestionsList = []; // array of { packId, bfCode, questionId, text, tokens, process, required, condition }
  const allQuestionsMap = new Map(); // compositeKey -> question
  const normalizedTextMap = new Map(); // normalizedText -> array of { packId, bfCode, questionId, text }

  for (const file of packFiles) {
    let pack;
    try {
      pack = JSON.parse(readFileSync(file, "utf-8"));
    } catch (err) {
      summary.formattingIssues.push({
        file: relative(ROOT_DIR, file),
        error: `JSON Parse Error: ${err.message}`,
      });
      continue;
    }

    const packId = pack.meta?.pack_id || "unknown";
    const bfCode = pack.meta?.business_function_code || "unknown";
    const questions = Array.isArray(pack.questions) ? pack.questions : [];

    const packInfo = {
      packId,
      bfCode,
      name: pack.meta?.name || "",
      version: pack.meta?.version || "",
      questionCount: questions.length,
      requiredCount: 0,
      optionalCount: 0,
      branchingCount: 0,
    };

    const inPackIds = new Set();
    const packQuestionsById = new Map();

    for (const q of questions) {
      packQuestionsById.set(q.id, q);
      summary.totalQuestions++;

      if (q.required) {
        summary.requiredQuestions++;
        packInfo.requiredCount++;
      } else {
        summary.optionalQuestions++;
        packInfo.optionalCount++;
      }

      if (q.condition) {
        summary.branchingQuestions++;
        packInfo.branchingCount++;
      }

      // 1. In-Pack Duplicate ID Check
      if (inPackIds.has(q.id)) {
        summary.inPackIdDuplicates.push({
          packId,
          bfCode,
          questionId: q.id,
        });
      }
      inPackIds.add(q.id);

      // 2. Composite Key Check
      const compositeKey = `${bfCode}::${q.id}`;
      if (allQuestionsMap.has(compositeKey)) {
        summary.compositeKeyDuplicates.push({
          compositeKey,
          packId,
          bfCode,
          questionId: q.id,
        });
      }
      allQuestionsMap.set(compositeKey, { ...q, packId, bfCode });

      // 3. Formatting and Dil Denetimi
      if (q.question) {
        if (q.question.trim() !== q.question) {
          summary.formattingIssues.push({
            packId,
            questionId: q.id,
            type: "whitespace_trim",
            field: "question",
            value: q.question,
          });
        }
        if (q.question.includes("  ")) {
          summary.formattingIssues.push({
            packId,
            questionId: q.id,
            type: "double_space",
            field: "question",
            value: q.question,
          });
        }
      }

      if (q.description) {
        if (q.description.trim() !== q.description) {
          summary.formattingIssues.push({
            packId,
            questionId: q.id,
            type: "whitespace_trim",
            field: "description",
            value: q.description,
          });
        }
        if (q.description.includes("  ")) {
          summary.formattingIssues.push({
            packId,
            questionId: q.id,
            type: "double_space",
            field: "description",
            value: q.description,
          });
        }
      }

      // Options Check
      if (Array.isArray(q.options)) {
        const optionValues = new Set();
        for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
          const opt = q.options[oIdx];
          if (!opt.value || !opt.label || opt.value.trim() === "" || opt.label.trim() === "") {
            summary.emptyOptions.push({
              packId,
              questionId: q.id,
              optionIndex: oIdx,
              opt,
            });
          }
          if (optionValues.has(opt.value)) {
            summary.duplicateOptions.push({
              packId,
              questionId: q.id,
              duplicateValue: opt.value,
            });
          }
          optionValues.add(opt.value);

          if (opt.label && (opt.label.trim() !== opt.label || opt.label.includes("  "))) {
            summary.formattingIssues.push({
              packId,
              questionId: q.id,
              type: "option_whitespace",
              optionValue: opt.value,
              label: opt.label,
            });
          }
        }
      }

      // 4. Text Indexing
      const tokens = getTokens(q.question);
      allQuestionsList.push({
        packId,
        bfCode,
        questionId: q.id,
        text: q.question,
        tokens,
        process: q.process,
        required: q.required,
      });

      const norm = normalizeTurkishText(q.question);
      if (norm) {
        if (!normalizedTextMap.has(norm)) {
          normalizedTextMap.set(norm, []);
        }
        normalizedTextMap.get(norm).push({
          packId,
          bfCode,
          questionId: q.id,
          text: q.question,
        });
      }
    }

    // 5. Branching Integrity Check
    for (const q of questions) {
      if (q.condition) {
        const parentId = q.condition.question_id;
        const triggerValue = q.condition.value;

        if (parentId === q.id) {
          summary.branchingErrors.push({
            packId,
            questionId: q.id,
            error: `Self-triggering branch condition on question ${q.id}`,
          });
          continue;
        }

        const parentQ = packQuestionsById.get(parentId);
        if (!parentQ) {
          summary.branchingErrors.push({
            packId,
            questionId: q.id,
            error: `Parent question '${parentId}' not found in pack '${packId}'`,
          });
          continue;
        }

        if (Array.isArray(parentQ.options)) {
          const hasOption = parentQ.options.some((o) => o.value === triggerValue);
          if (!hasOption) {
            summary.branchingErrors.push({
              packId,
              questionId: q.id,
              error: `Parent option value '${triggerValue}' not found in parent '${parentId}' options`,
            });
          }
        }

        // Check for 2-level loop (A -> B -> A)
        if (parentQ.condition && parentQ.condition.question_id === q.id) {
          summary.branchingErrors.push({
            packId,
            questionId: q.id,
            error: `Circular branching loop between '${q.id}' and '${parentId}'`,
          });
        }
      }
    }

    summary.packsSummary.push(packInfo);
  }

  // 6. Text Exact and High-Similarity Analysis
  for (const [normText, occurrences] of normalizedTextMap.entries()) {
    if (occurrences.length > 1) {
      const distinctBfCodes = new Set(occurrences.map((o) => o.bfCode));
      if (distinctBfCodes.size > 1) {
        summary.intentionalOverlaps.push({
          normalizedText: normText,
          occurrences,
        });
      } else {
        summary.exactDuplicates.push({
          normalizedText: normText,
          occurrences,
        });
      }
    }
  }

  // High token similarity cross-pack search (> 0.80 Jaccard)
  const comparedPairs = new Set();
  for (let i = 0; i < allQuestionsList.length; i++) {
    const qA = allQuestionsList[i];
    for (let j = i + 1; j < allQuestionsList.length; j++) {
      const qB = allQuestionsList[j];
      if (qA.packId === qB.packId) continue; // Same pack

      const pairKey = `${qA.packId}::${qA.questionId}__${qB.packId}::${qB.questionId}`;
      if (comparedPairs.has(pairKey)) continue;
      comparedPairs.add(pairKey);

      const sim = calculateJaccardSimilarity(qA.tokens, qB.tokens);
      if (sim >= 0.80) {
        summary.probableDuplicates.push({
          similarity: sim,
          questionA: { packId: qA.packId, bfCode: qA.bfCode, questionId: qA.questionId, text: qA.text },
          questionB: { packId: qB.packId, bfCode: qB.bfCode, questionId: qB.questionId, text: qB.text },
        });
      }
    }
  }

  return summary;
}

// ── CLI Execution ──
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log("\n=======================================================");
  console.log("ERP CRM Discovery — Soru Külliyatı Denetim Motoru");
  console.log("=======================================================\n");

  const results = runCorpusAudit();

  console.log(`[audit] Toplam Soru Paketi: ${results.totalPacks}`);
  console.log(`[audit] Toplam Soru Sayısı: ${results.totalQuestions}`);
  console.log(`[audit] Zorunlu Sorular: ${results.requiredQuestions} (%${((results.requiredQuestions / results.totalQuestions) * 100).toFixed(1)})`);
  console.log(`[audit] Opsiyonel Sorular: ${results.optionalQuestions} (%${((results.optionalQuestions / results.totalQuestions) * 100).toFixed(1)})`);
  console.log(`[audit] Koşullu (Branching) Sorular: ${results.branchingQuestions}`);

  console.log("\n--- Bütünlük Denetimi ---");
  console.log(`  Paket İçi ID Mükerrerliği: ${results.inPackIdDuplicates.length === 0 ? "✓ 0 (TEMİZ)" : `✗ ${results.inPackIdDuplicates.length} HATA`}`);
  console.log(`  Bileşik Anahtar (bf::id) Çakışması: ${results.compositeKeyDuplicates.length === 0 ? "✓ 0 (TEMİZ)" : `✗ ${results.compositeKeyDuplicates.length} HATA`}`);
  console.log(`  Branching / Koşul Hataları: ${results.branchingErrors.length === 0 ? "✓ 0 (TEMİZ)" : `✗ ${results.branchingErrors.length} HATA`}`);
  console.log(`  Mükerrer Seçenek Değerleri: ${results.duplicateOptions.length === 0 ? "✓ 0 (TEMİZ)" : `✗ ${results.duplicateOptions.length} HATA`}`);
  console.log(`  Boş Seçenekler: ${results.emptyOptions.length === 0 ? "✓ 0 (TEMİZ)" : `✗ ${results.emptyOptions.length} HATA`}`);
  console.log(`  Biçim / Boşluk Uyarısı: ${results.formattingIssues.length === 0 ? "✓ 0 (TEMİZ)" : `⚠ ${results.formattingIssues.length} UYARI`}`);
  console.log(`  Paket İçi Birebir Metin Tekrarı: ${results.exactDuplicates.length === 0 ? "✓ 0 (TEMİZ)" : `⚠ ${results.exactDuplicates.length} BULGU`}`);
  console.log(`  Çapraz Paket Benzerlikler (Jaccard >= 0.80): ${results.probableDuplicates.length} Madde`);

  if (results.probableDuplicates.length > 0) {
    console.log("\n[audit] ℹ Çapraz Paket Benzer Soru Örnekleri (Probable Overlaps / Boundary Candidates):");
    for (const p of results.probableDuplicates.slice(0, 10)) {
      console.log(`  - [%${(p.similarity * 100).toFixed(0)}] ${p.questionA.bfCode}:${p.questionA.questionId} vs ${p.questionB.bfCode}:${p.questionB.questionId}`);
      console.log(`    A: "${p.questionA.text}"`);
      console.log(`    B: "${p.questionB.text}"`);
    }
  }

  if (results.branchingErrors.length > 0) {
    console.error("\n[audit] ✗ KRİTİK BRANCHING HATALARI:");
    for (const err of results.branchingErrors) {
      console.error(`  - [${err.packId}] ${err.questionId}: ${err.error}`);
    }
  }

  if (results.inPackIdDuplicates.length > 0 || results.compositeKeyDuplicates.length > 0 || results.branchingErrors.length > 0) {
    console.error("\n[audit] ✗ Külliyat denetimi kritik hatalar nedeniyle BAŞARISIZ.");
    process.exit(1);
  }

  console.log("\n[audit] ✓ Külliyat yapısal bütünlük denetimi BAŞARIYLA TAMAMLANDI.\n");
  process.exit(0);
}
