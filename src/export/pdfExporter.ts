/**
 * ERP CRM Discovery — Portable Document Format (.pdf) Exporter
 *
 * Generates clean, searchable, multi-page A4 PDF documents from ReportModel
 * using jsPDF and jspdf-autotable with embedded TrueType Unicode font
 * (Liberation Sans) for full Turkish character support (Ç, Ğ, İ, Ö, Ş, Ü, ç, ğ, ı, ö, ş, ü).
 * 100% Offline with zero external network or runtime dependencies.
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportModel } from "../report/types";
import { registerPdfFonts, PDF_FONT_FAMILY } from "./fonts/fontBundle";

export async function buildPdfBuffer(report: ReportModel): Promise<Uint8Array> {
  const { metadata, profile, company, scope, businessFunctions, projectNotes, summaryStats } = report;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Register embedded TrueType Unicode fonts (Regular & Bold)
  registerPdfFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  let currentY = 18;

  function checkPageBreak(neededHeight: number): void {
    if (currentY + neededHeight > pageHeight - 16) {
      doc.addPage();
      currentY = 18;
    }
  }

  // ── Cover / Header ───────────────────────────────────────────────────────
  doc.setFont(PDF_FONT_FAMILY, "bold");
  doc.setFontSize(18);
  doc.setTextColor(2, 132, 199); // Sky Blue 600
  doc.text("ERP / CRM ÖN ANALİZ RAPORU", pageWidth / 2, currentY, { align: "center" });
  currentY += 8;

  doc.setFont(PDF_FONT_FAMILY, "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(metadata.projectName, pageWidth / 2, currentY, { align: "center" });
  currentY += 6;

  doc.setFont(PDF_FONT_FAMILY, "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`${company.companyName} • ${metadata.generatedAt} • ${metadata.projectStatus.toUpperCase()}`, pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  // KPI Summary Band Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [["İş Fonksiyonları", "Bulgular", "Gereksinimler", "Açık Riskler", "Cevaplanan Sorular"]],
    body: [[
      `${summaryStats.totalFunctions} (${summaryStats.completedFunctions} Bitti)`,
      `${summaryStats.totalFindings} Bulgu`,
      `${summaryStats.totalRequirements} Gereksinim`,
      `${summaryStats.openRisks} / ${summaryStats.totalRisks}`,
      `${summaryStats.answeredQuestions} / ${summaryStats.totalQuestions}`,
    ]],
    theme: "grid",
    styles: {
      font: PDF_FONT_FAMILY,
      fontStyle: "normal",
    },
    headStyles: {
      font: PDF_FONT_FAMILY,
      fontStyle: "bold",
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      font: PDF_FONT_FAMILY,
      fontStyle: "normal",
      fontSize: 9,
      halign: "center",
      textColor: [15, 23, 42],
    },
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ── Section 1: Yönetici Özeti ─────────────────────────────────────────────
  checkPageBreak(30);
  doc.setFont(PDF_FONT_FAMILY, "bold");
  doc.setFontSize(13);
  doc.setTextColor(2, 132, 199);
  doc.text("1. Yönetici Özeti & Stratejik Değerlendirme", marginX, currentY);
  currentY += 6;

  // Executive Summary Box
  const execSummary = profile.executive_summary || "Yönetici özeti henüz girilmedi.";
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [["Yönetici Özeti"]],
    body: [[execSummary]],
    theme: "plain",
    styles: {
      font: PDF_FONT_FAMILY,
    },
    headStyles: {
      font: PDF_FONT_FAMILY,
      fontStyle: "bold",
      fillColor: [240, 249, 255],
      textColor: [2, 132, 199],
      fontSize: 9.5,
    },
    bodyStyles: {
      font: PDF_FONT_FAMILY,
      fontStyle: "normal",
      fillColor: [248, 250, 252],
      textColor: [51, 65, 85],
      fontSize: 9,
      cellPadding: 4,
    },
  });
  currentY = (doc as any).lastAutoTable.finalY + 4;

  if (profile.overall_assessment) {
    checkPageBreak(25);
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [["Genel Değerlendirme & Dönüşüm Önerisi"]],
      body: [[profile.overall_assessment]],
      theme: "plain",
      styles: {
        font: PDF_FONT_FAMILY,
      },
      headStyles: {
        font: PDF_FONT_FAMILY,
        fontStyle: "bold",
        fillColor: [220, 252, 231],
        textColor: [21, 128, 61],
        fontSize: 9.5,
      },
      bodyStyles: {
        font: PDF_FONT_FAMILY,
        fontStyle: "normal",
        fillColor: [248, 250, 252],
        textColor: [51, 65, 85],
        fontSize: 9,
        cellPadding: 4,
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // ── Section 2: Firma Profili ──────────────────────────────────────────────
  checkPageBreak(35);
  doc.setFont(PDF_FONT_FAMILY, "bold");
  doc.setFontSize(13);
  doc.setTextColor(2, 132, 199);
  doc.text("2. Firma Profili & Künye", marginX, currentY);
  currentY += 6;

  const companyBody: string[][] = [["Firma Adı", company.companyName]];
  if (company.tradeName) companyBody.push(["Ticari Unvan", company.tradeName]);
  if (company.city) companyBody.push(["Şehir / Ülke", `${company.city}, ${company.country}`]);
  if (company.employeeCount) companyBody.push(["Çalışan Sayısı", company.employeeCount]);
  if (company.taxNumber) companyBody.push(["Vergi Numarası", company.taxNumber]);
  if (company.notes) companyBody.push(["Firma Notları", company.notes]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    body: companyBody,
    theme: "grid",
    styles: {
      font: PDF_FONT_FAMILY,
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold", textColor: [71, 85, 105], fillColor: [248, 250, 252] },
      1: { textColor: [15, 23, 42] },
    },
    bodyStyles: { font: PDF_FONT_FAMILY, fontSize: 8.5, cellPadding: 2.5 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ── Section 3: Analiz Kapsamı ─────────────────────────────────────────────
  checkPageBreak(35);
  doc.setFont(PDF_FONT_FAMILY, "bold");
  doc.setFontSize(13);
  doc.setTextColor(2, 132, 199);
  doc.text("3. Analiz Kapsamı & İlerleme", marginX, currentY);
  currentY += 6;

  const scopeBody: string[][] = scope.map((s) => [
    `${s.nameTr} (${s.code})`,
    s.category,
    s.departmentName || "—",
    s.hasPack ? `${s.status.toUpperCase()} (%${s.progressPercentage})` : `${s.status.toUpperCase()} (Paket yok)`,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [["İş Fonksiyonu", "Kategori", "Firma Departmanı", "Durum & İlerleme"]],
    body: scopeBody,
    theme: "striped",
    styles: {
      font: PDF_FONT_FAMILY,
    },
    headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 8.5 },
    bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 8.5, cellPadding: 2.5 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ── Section 4: İş Fonksiyonları Detay Analizi ──────────────────────────────
  checkPageBreak(35);
  doc.setFont(PDF_FONT_FAMILY, "bold");
  doc.setFontSize(13);
  doc.setTextColor(2, 132, 199);
  doc.text("4. İş Fonksiyonları & Süreç Analizleri", marginX, currentY);
  currentY += 6;

  for (let fIdx = 0; fIdx < businessFunctions.length; fIdx++) {
    const fn = businessFunctions[fIdx];
    checkPageBreak(30);

    doc.setFont(PDF_FONT_FAMILY, "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`4.${fIdx + 1} ${fn.nameTr} (${fn.code})`, marginX, currentY);
    currentY += 5;

    doc.setFont(PDF_FONT_FAMILY, "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Departman: ${fn.departmentName || "—"} | Sorumlu: ${fn.responsiblePerson || "—"} | Durum: ${fn.status.toUpperCase()} | İlerleme: %${fn.progressPercentage}`, marginX, currentY);
    currentY += 6;

    // Processes and Questions
    if (fn.processes.length === 0) {
      doc.setFont(PDF_FONT_FAMILY, "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(fn.packId ? "Bu fonksiyonda henüz cevaplanmış soru bulunmuyor." : "Bu fonksiyon için henüz soru paketi tanımlanmadı.", marginX + 2, currentY);
      currentY += 6;
    } else {
      for (let pIdx = 0; pIdx < fn.processes.length; pIdx++) {
        const proc = fn.processes[pIdx];
        checkPageBreak(25);

        doc.setFont(PDF_FONT_FAMILY, "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`4.${fIdx + 1}.${pIdx + 1} ${proc.name}`, marginX + 2, currentY);
        currentY += 5;

        for (const q of proc.questions) {
          checkPageBreak(20);

          // Soru Metni
          doc.setFont(PDF_FONT_FAMILY, "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(2, 132, 199);
          doc.text(`[${q.id}]`, marginX + 4, currentY);

          doc.setTextColor(15, 23, 42);
          const qLines = doc.splitTextToSize(q.questionText, pageWidth - marginX * 2 - 25);
          doc.text(qLines, marginX + 22, currentY);
          currentY += qLines.length * 4 + 1;

          // Cevaplar
          doc.setFont(PDF_FONT_FAMILY, "normal");
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);

          if (q.formattedAnswer.selectedOptions.length > 0) {
            for (const opt of q.formattedAnswer.selectedOptions) {
              checkPageBreak(8);
              const optStr = opt.note ? `• ${opt.label} (Açıklama: ${opt.note})` : `• ${opt.label}`;
              const optLines = doc.splitTextToSize(optStr, pageWidth - marginX * 2 - 30);
              doc.text(optLines, marginX + 26, currentY);
              currentY += optLines.length * 3.8;
            }
          }

          if (q.formattedAnswer.textValue) {
            checkPageBreak(8);
            const tLines = doc.splitTextToSize(q.formattedAnswer.textValue, pageWidth - marginX * 2 - 30);
            doc.text(tLines, marginX + 26, currentY);
            currentY += tLines.length * 3.8;
          }

          if (q.formattedAnswer.generalNote) {
            checkPageBreak(8);
            doc.setFont(PDF_FONT_FAMILY, "normal");
            doc.text(`Genel Not: ${q.formattedAnswer.generalNote}`, marginX + 26, currentY);
            currentY += 4;
          }

          currentY += 2;
        }
      }
    }

    // Function Findings
    if (fn.findings.length > 0) {
      checkPageBreak(25);
      const fRows = fn.findings.map((f) => [
        `[${f.priority.toUpperCase()}] ${f.title}`,
        f.description + (f.questionId ? `\n(Kaynak: ${f.questionId})` : ""),
      ]);
      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX + 2, right: marginX },
        head: [[`Tespit Edilen Bulgular (${fn.findings.length})`, "Açıklama & Kaynak"]],
        body: fRows,
        theme: "grid",
        styles: { font: PDF_FONT_FAMILY },
        headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [224, 242, 254], textColor: [3, 105, 161], fontSize: 8 },
        bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 8, cellPadding: 2 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 4;
    }

    // Function Requirements
    if (fn.requirements.length > 0) {
      checkPageBreak(25);
      const rRows = fn.requirements.map((r) => [
        `[${r.priority.toUpperCase()}] ${r.title}`,
        r.description + (r.questionId ? `\n(Kaynak: ${r.questionId})` : ""),
      ]);
      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX + 2, right: marginX },
        head: [[`İş Gereksinimleri (${fn.requirements.length})`, "Kapsam Tanımı & Kaynak"]],
        body: rRows,
        theme: "grid",
        styles: { font: PDF_FONT_FAMILY },
        headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [220, 252, 231], textColor: [21, 128, 61], fontSize: 8 },
        bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 8, cellPadding: 2 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 4;
    }

    // Function Risks
    if (fn.risks.length > 0) {
      checkPageBreak(25);
      const rskRows = fn.risks.map((rsk) => [
        rsk.title,
        `Etki: ${rsk.impact} | Olasılık: ${rsk.probability}`,
        rsk.mitigationNote || "—",
      ]);
      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX + 2, right: marginX },
        head: [["Risk Başlığı", "Derecelendirme", "Önlem / Eylem Planı"]],
        body: rskRows,
        theme: "grid",
        styles: { font: PDF_FONT_FAMILY },
        headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [254, 226, 226], textColor: [185, 28, 28], fontSize: 8 },
        bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 8, cellPadding: 2 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 4;
    }

    currentY += 4;
  }

  // ── Section 5: Proje Notları & Açık Konular ───────────────────────────────
  checkPageBreak(30);
  doc.setFont(PDF_FONT_FAMILY, "bold");
  doc.setFontSize(13);
  doc.setTextColor(2, 132, 199);
  doc.text("5. Proje Notları & Açık Konular", marginX, currentY);
  currentY += 6;

  if (profile.open_topics) {
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [["Açık Konular & Karar Bekleyen Başlıklar"]],
      body: [[profile.open_topics]],
      theme: "plain",
      styles: { font: PDF_FONT_FAMILY },
      headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [254, 243, 199], textColor: [180, 83, 9], fontSize: 9 },
      bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fillColor: [248, 250, 252], textColor: [51, 65, 85], fontSize: 8.5, cellPadding: 3 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  const globalNotes = projectNotes.filter((n) => !n.businessFunctionCode);
  if (globalNotes.length > 0) {
    const gnRows = globalNotes.map((gn) => [`• ${gn.note}`]);
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [["Genel Proje Notları"]],
      body: gnRows,
      theme: "plain",
      styles: { font: PDF_FONT_FAMILY },
      headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 8.5, cellPadding: 2 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // ── Page Numbers & Running Headers ────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont(PDF_FONT_FAMILY, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    // Running Header (except first page)
    if (i > 1) {
      doc.text(`${metadata.title} — ${company.companyName}`, marginX, 10);
      doc.text(metadata.generatedAt, pageWidth - marginX, 10, { align: "right" });
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, 12, pageWidth - marginX, 12);
    }

    // Running Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);
    doc.text("ERP CRM Discovery • Açık Kaynak & Offline-First Ön Analiz", marginX, pageHeight - 7);
    doc.text(`Sayfa ${i} / ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: "right" });
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
