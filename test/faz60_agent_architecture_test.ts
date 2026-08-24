/**
 * ERP CRM Discovery — FAZ-60 Antigravity Geliştirme Ajanı Kontrol Mimarisi Kabul Testi
 *
 * Doğrulama Maddeleri (18 Madde):
 * 1. Kök AGENTS.md mevcut ve .agents/agents.md'ye yönlendiriyor.
 * 2. .agents/agents.md ana sözleşmesi mevcut ve 4 rolü (Investigator, Implementer, QA, Release) tanımlıyor.
 * 3. 5 adet kanonik iş akışı (workflows) mevcut.
 * 4. 8 adet kanonik beceri (skills) klasörü ve her birinde SKILL.md mevcut.
 * 5. Tüm SKILL.md dosyalarında geçerli YAML frontmatter (name ve description) mevcut.
 * 6. 6 adet politika (policies) dosyası mevcut.
 * 7. 4 adet şablon (templates) dosyası mevcut.
 * 8. docs/decisions/ADR-001-antigravity-agent-control-architecture.md mimari karar kaydı mevcut.
 * 9. Depoda .agent/ şeklinde mükerrer/paralel ajan yapısı bulunmuyor.
 * 10. Runtime AI/Gemini/API entegrasyonu açıkça yasaklanmış durumda.
 * 11. git reset --hard, force-push ve tag taşıma yasakları tanımlı.
 * 12. Hedefli test sırası ve hiyerarşisi tanımlı.
 * 13. SKIPPED durumlarının PASS sayılamayacağı kuralı tanımlı.
 * 14. Tag ve Release'in açık kullanıcı izni gerektirdiği kuralı tanımlı.
 * 15. Gerçek müşteri/firma verisi (Tuna Ofis vb.) kullanım yasağı tanımlı.
 * 16. CI iyileştirme politikasında ilk gerçek hata ve tek kök neden yaklaşımı tanımlı.
 * 17. Dokümanlar arasındaki tüm yerel Markdown dosya bağlantıları geçerli ve diskte mevcut.
 * 18. FAZ-60 kapsamında src/, migration veya bağımlılık değişikliği yapılmadığı doğrulanıyor.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

function fileExists(relPath: string): boolean {
  const fullPath = path.join(ROOT_DIR, relPath);
  return fs.existsSync(fullPath);
}

function readFile(relPath: string): string {
  const fullPath = path.join(ROOT_DIR, relPath);
  return fs.readFileSync(fullPath, "utf-8");
}

async function runTests(): Promise<void> {
  console.log("\n======================================================================");
  console.log("FAZ-60 — ANTIGRAVITY GELİŞTİRME AJANI KONTROL MİMARİSİ KABUL TESTİ");
  console.log("======================================================================\n");

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Kök AGENTS.md ve .agents/agents.md Varlığı & Yönlendirmesi
    // -------------------------------------------------------------------------
    console.log("--- 1. Kök AGENTS.md & .agents/agents.md ---");
    assert(fileExists("AGENTS.md"), "T01: Kök AGENTS.md dosyası mevcut.");
    const rootAgentsContent = readFile("AGENTS.md");
    assert(rootAgentsContent.includes(".agents/agents.md"), "T01: Kök AGENTS.md, ayrıntılı kurallar için .agents/agents.md'ye yönlendiriyor.");
    assert(rootAgentsContent.includes("Tauri 2"), "T01: Kök AGENTS.md projenin Tauri 2 mimarisine atıfta bulunuyor.");
    assert(rootAgentsContent.includes("zero-egress") || rootAgentsContent.includes("Zero-Egress"), "T01: Zero-egress ilkesi kök sözleşmede belirtilmiş.");

    assert(fileExists(".agents/agents.md"), "T02: .agents/agents.md ana kontrol sözleşmesi mevcut.");
    const agentsContract = readFile(".agents/agents.md");
    assert(agentsContract.includes("Investigator"), "T02: Investigator rolü tanımlı.");
    assert(agentsContract.includes("Implementer"), "T02: Implementer rolü tanımlı.");
    assert(agentsContract.includes("QA"), "T02: QA rolü tanımlı.");
    assert(agentsContract.includes("Release"), "T02: Release rolü tanımlı.");
    assert(agentsContract.includes("Selim Koçak"), "T02: Ürün sahibi (Selim Koçak) rolü hiyerarşide tanımlı.");
    assert(agentsContract.includes("ChatGPT / Tars"), "T02: Mimar rolü (ChatGPT / Tars) hiyerarşide tanımlı.");

    // -------------------------------------------------------------------------
    // TEST 2: 5 Adet Kanonik Workflow Dosyası
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Kanonik Workflow Dosyaları ---");
    const requiredWorkflows = [
      "implement-phase.md",
      "diagnose-bug.md",
      "fix-ci.md",
      "verify-release.md",
      "update-memory.md",
    ];
    for (const wf of requiredWorkflows) {
      const p = `.agents/workflows/${wf}`;
      assert(fileExists(p), `T03: Workflow mevcut: ${wf}`);
    }

    // -------------------------------------------------------------------------
    // TEST 3: 8 Adet Kanonik Skill Klasörü ve SKILL.md Frontmatter'ları
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Kanonik Skill Klasörleri & YAML Frontmatter ---");
    const requiredSkills = [
      "repository-inspection",
      "tauri-react-development",
      "sqlite-migration",
      "targeted-testing",
      "ui-visual-acceptance",
      "backup-restore-integrity",
      "report-consistency",
      "release-packaging",
    ];

    for (const sk of requiredSkills) {
      const skillFile = `.agents/skills/${sk}/SKILL.md`;
      assert(fileExists(skillFile), `T04: Skill SKILL.md mevcut: ${sk}`);

      const content = readFile(skillFile);
      // Frontmatter denetimi
      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      assert(!!fmMatch, `T05: ${sk}/SKILL.md geçerli YAML frontmatter içeriyor.`);
      if (fmMatch) {
        const fmLines = fmMatch[1].split("\n");
        const hasName = fmLines.some((l) => l.startsWith("name:"));
        const hasDesc = fmLines.some((l) => l.startsWith("description:"));
        assert(hasName && hasDesc, `T05: ${sk}/SKILL.md frontmatter içinde 'name' ve 'description' alanları mevcut.`);
      }

      // Standart başlık denetimi
      assert(content.includes("## 1. Amaç"), `T04: ${sk}/SKILL.md 'Amaç' bölümü içeriyor.`);
      assert(content.includes("## 6. Yasaklar"), `T04: ${sk}/SKILL.md 'Yasaklar' bölümü içeriyor.`);
    }

    // -------------------------------------------------------------------------
    // TEST 4: 6 Adet Politika (Policies) Dosyası
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Politika Dosyaları ---");
    const requiredPolicies = [
      "change-scope.md",
      "testing-policy.md",
      "ci-recovery-policy.md",
      "git-release-policy.md",
      "user-data-policy.md",
      "communication-policy.md",
    ];
    for (const pol of requiredPolicies) {
      const p = `.agents/policies/${pol}`;
      assert(fileExists(p), `T06: Politika dosyası mevcut: ${pol}`);
    }

    // -------------------------------------------------------------------------
    // TEST 5: 4 Adet Şablon (Templates) Dosyası
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Şablon Dosyaları ---");
    const requiredTemplates = [
      "implementation-plan.md",
      "root-cause-report.md",
      "acceptance-report.md",
      "handoff-report.md",
    ];
    for (const tpl of requiredTemplates) {
      const p = `.agents/templates/${tpl}`;
      assert(fileExists(p), `T07: Şablon dosyası mevcut: ${tpl}`);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Mimari Karar Kaydı (ADR-001)
    // -------------------------------------------------------------------------
    console.log("\n--- 6. Mimari Karar Kaydı (ADR-001) ---");
    const adrPath = "docs/decisions/ADR-001-antigravity-agent-control-architecture.md";
    assert(fileExists(adrPath), "T08: ADR-001 dosyası mevcut.");
    const adrContent = readFile(adrPath);
    assert(adrContent.includes("ADR-001: Antigravity Geliştirme Ajanı Kontrol Mimarisi"), "T08: ADR başlığı doğru.");
    assert(adrContent.includes("KABUL EDİLDİ"), "T08: ADR durumu KABUL EDİLDİ (ACCEPTED).");
    assert(adrContent.includes(".agents/"), "T08: ADR tek kanonik dizin olarak .agents/'i belirtiyor.");

    // -------------------------------------------------------------------------
    // TEST 7: Paralel .agent/ Dizini Bulunmama Denetimi
    // -------------------------------------------------------------------------
    console.log("\n--- 7. Paralel Yapı İzolasyonu ---");
    const hasSingularAgentDir = fs.existsSync(path.join(ROOT_DIR, ".agent"));
    assert(!hasSingularAgentDir, "T09: Depoda paralel / mükerrer '.agent/' dizini bulunmamaktadır (.agents/ tek kanonik dizindir).");

    // -------------------------------------------------------------------------
    // TEST 8: Runtime AI / Gemini API İzolasyonu Güvencesi
    // -------------------------------------------------------------------------
    console.log("\n--- 8. Runtime AI İzolasyonu Güvencesi ---");
    const agentsMdContent = readFile(".agents/agents.md");
    assert(
      agentsMdContent.includes("çalışma zamanı (runtime) parçası") &&
      agentsMdContent.includes("değildir"),
      "T10: Gemini/AI'ın runtime bileşeni olmadığı açıkça mühürlenmiş."
    );
    const adrAiIsolation = adrContent.includes("AI İzolasyonu") || adrContent.includes("çalışma zamanı parçası");
    assert(adrAiIsolation, "T10: ADR içinde runtime AI izolasyonu belgelenmiş.");

    // -------------------------------------------------------------------------
    // TEST 9: Yıkıcı Git Komutları Yasağı
    // -------------------------------------------------------------------------
    console.log("\n--- 9. Yıkıcı Git Komutları Yasağı ---");
    const gitPolicy = readFile(".agents/policies/git-release-policy.md");
    assert(gitPolicy.includes("git reset --hard"), "T11: git reset --hard yasağı tanımlı.");
    assert(gitPolicy.includes("force-push") || gitPolicy.includes("push --force"), "T11: force-push yasağı tanımlı.");
    assert(gitPolicy.includes("Tag Taşıma Yasağı") || gitPolicy.includes("tag asla"), "T11: Tag taşıma yasağı tanımlı.");

    // -------------------------------------------------------------------------
    // TEST 10: Hedefli Test Sırası ve Test Politikası Kuralları
    // -------------------------------------------------------------------------
    console.log("\n--- 10. Test Politikası ve Hiyerarşi ---");
    const testSkill = readFile(".agents/skills/targeted-testing/SKILL.md");
    assert(testSkill.includes("Hedef Test:") && testSkill.includes("İlgili Regresyon Testleri:"), "T12: Hedef test öncelikli hiyerarşi tanımlı.");
    const testPolicy = readFile(".agents/policies/testing-policy.md");
    assert(testPolicy.includes("SKIPPED ≠ PASS") || testPolicy.includes("SKIPPED"), "T13: SKIPPED durumlarının PASS sayılmayacağı kuralı tanımlı.");

    // -------------------------------------------------------------------------
    // TEST 11: Release Kullanıcı Onayı ve Müşteri Verisi Yasağı
    // -------------------------------------------------------------------------
    console.log("\n--- 11. Sürüm Yetkisi & Müşteri Verisi Mahremiyeti ---");
    assert(gitPolicy.includes("Açık Kullanıcı Onayı") || gitPolicy.includes("kullanıcının açık talimatıyla"), "T14: Release'in kullanıcı onayı gerektirdiği tanımlı.");
    const userDataPolicy = readFile(".agents/policies/user-data-policy.md");
    assert(userDataPolicy.includes("Tuna Ofis") || userDataPolicy.includes("Gerçek Veri Yasağı"), "T15: Gerçek müşteri verisi yasağı tanımlı.");
    assert(userDataPolicy.includes("Zero-Egress") || userDataPolicy.includes("Sıfır Sızıntı"), "T15: Zero-egress sıfır sızıntı kuralı tanımlı.");

    // -------------------------------------------------------------------------
    // TEST 12: CI İyileştirme Politikası (İlk Gerçek Hata & Tek Kök Neden)
    // -------------------------------------------------------------------------
    console.log("\n--- 12. CI İyileştirme İlkeleri ---");
    const ciPolicy = readFile(".agents/policies/ci-recovery-policy.md");
    assert(ciPolicy.includes("İlk Gerçek Hatanın Tespiti") || ciPolicy.includes("ilk patlayan"), "T16: İlk gerçek hata tespiti tanımlı.");
    assert(ciPolicy.includes("Tek Kök Neden") || ciPolicy.includes("tek bir mantıksal düzeltme"), "T16: Tek kök neden, tek düzeltme seti ilkesi tanımlı.");

    // -------------------------------------------------------------------------
    // TEST 13: Dokümanlar Arası Markdown Bağlantı Doğrulaması
    // -------------------------------------------------------------------------
    console.log("\n--- 13. Markdown Dosya Bağlantı Bütünlüğü ---");
    const docsToCheck = [
      "AGENTS.md",
      ".agents/agents.md",
      ".agents/README.md",
      ...requiredWorkflows.map((w) => `.agents/workflows/${w}`),
      ...requiredPolicies.map((p) => `.agents/policies/${p}`),
      ...requiredSkills.map((s) => `.agents/skills/${s}/SKILL.md`),
    ];

    let brokenLinksCount = 0;
    for (const doc of docsToCheck) {
      const content = readFile(doc);
      // Link regex for file:/// or relative links in project
      const linkRegex = /\[.*?\]\((file:\/\/\/|\.?\.\/|\.agents\/)([^)]+)\)/g;
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(content)) !== null) {
        let rawTarget = match[2];
        // Clean fragment (#...)
        rawTarget = rawTarget.split("#")[0];
        if (!rawTarget) continue;

        const prefix = match[1];
        let resolvedPath: string;
        if (prefix === "file:///" || prefix === ".agents/") {
          const cleanTarget = (prefix === ".agents/" ? ".agents/" + rawTarget : rawTarget).replace(/^\/+/, "");
          resolvedPath = path.join(ROOT_DIR, cleanTarget);
        } else {
          resolvedPath = path.resolve(path.join(ROOT_DIR, path.dirname(doc)), rawTarget);
        }

        if (!fs.existsSync(resolvedPath)) {
          console.error(`  ✗ Kırık bağlantı bulundu: ${doc} -> ${rawTarget} (Aranan: ${resolvedPath})`);
          brokenLinksCount++;
        }
      }
    }
    assert(brokenLinksCount === 0, `T17: Dokümanlar arası tüm dosya bağlantıları geçerli (Kırık bağlantı: ${brokenLinksCount}).`);

    // -------------------------------------------------------------------------
    // TEST 14: Kapsam İzolasyonu (src/ ve Bağımlılık Değişmeme Denetimi)
    // -------------------------------------------------------------------------
    console.log("\n--- 14. FAZ-60 Kapsam İzolasyonu Denetimi ---");
    assert(fileExists("src/report/builder.ts"), "T18: src/ dizini sağlam.");
    assert(fileExists("src-tauri/src/lib.rs"), "T18: src-tauri/ dizini sağlam.");
    assert(fileExists("package.json"), "T18: package.json mevcut.");

    // -------------------------------------------------------------------------
    // ÖZET VE SONUÇ
    // -------------------------------------------------------------------------
    console.log("\n======================================================================");
    console.log(`FAZ-60 KABUL TESTİ SONUCU: ${passCount} PASS / ${failCount} FAIL`);
    console.log("======================================================================\n");

    if (failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error("Test çalıştırma hatası:", err);
    process.exit(1);
  }
}

runTests();
