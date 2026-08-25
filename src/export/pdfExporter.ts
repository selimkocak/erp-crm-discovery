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
import { formatStatusLabel, type ReportModel } from "../report/types";
import { formatProjectStatus } from "../report/formatters";
import { registerPdfFonts, PDF_FONT_FAMILY } from "./fonts/fontBundle";
import { resolveAttachmentFileUrlFromRelative } from "../storage/attachmentLinks";

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
  doc.text(`${company.companyName} • ${metadata.generatedAt} • ${formatProjectStatus(metadata.projectStatus)}`, pageWidth / 2, currentY, { align: "center" });
  currentY += 7;

  if (!metadata.isComplete) {
    const draftText = metadata.draftLabel || `ARA RAPOR — Analiz %${metadata.progressPercent ?? 0} tamamlandı`;
    doc.setFont(PDF_FONT_FAMILY, "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(217, 119, 6); // Amber 600
    doc.text(draftText, pageWidth / 2, currentY, { align: "center" });
    currentY += 7;
  } else {
    currentY += 3;
  }

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
  if (company.businessSector) companyBody.push(["Sektör / Faaliyet", company.businessSector]);
  if (company.hasBranches) {
    const branchText =
      company.hasBranches === "yes"
        ? (company.branchCount ? `Evet (${company.branchCount} Şube / Lokasyon)` : "Evet (Çok Lokasyonlu)")
        : "Hayır (Tek Lokasyon)";
    companyBody.push(["Şubeli / Çok Lokasyonlu Yapı", branchText]);
  }
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

  const scopeBody: string[][] = scope.map((s) => {
    const statusLabel = formatStatusLabel(s.status);
    return [
      s.nameTr,
      s.category,
      s.departmentName || "—",
      s.hasPack ? `${statusLabel} (%${s.progressPercentage})` : `${statusLabel} (Paket yok)`,
    ];
  });

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

  // ── Section 3.1: Proje Takvimi & Zaman Planı (FAZ-59) ────────────────────
  if (report.scheduleSummary) {
    const sched = report.scheduleSummary;
    checkPageBreak(35);
    doc.setFont(PDF_FONT_FAMILY, "bold");
    doc.setFontSize(13);
    doc.setTextColor(2, 132, 199);
    doc.text("3.1 Proje Takvimi & İş Fonksiyonu Zaman Planı", marginX, currentY);
    currentY += 6;

    // Project overview table
    const projSchedBody: string[][] = [
      ["Planlanan Tarih Aralığı", sched.projectSchedule.plannedRangeSummary || "—"],
      ["Gerçekleşen Tarih Aralığı", sched.projectSchedule.actualRangeSummary || "—"],
      ["Takvim Durumu", `${sched.projectSchedule.scheduleStatusLabel} (${sched.projectSchedule.delaySummary})`],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [["Proje Takvim Parametresi", "Değer"]],
      body: projSchedBody,
      theme: "plain",
      styles: { font: PDF_FONT_FAMILY, fontSize: 8.5 },
      headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 8.5 },
      bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 8.5, cellPadding: 2.5 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 5;

    // Function schedules table
    const funcSchedBody: string[][] = sched.functionSchedules.map((fs) => [
      fs.nameTr,
      formatStatusLabel(fs.processStatus),
      fs.plannedRangeSummary || "—",
      fs.actualRangeSummary || "—",
      fs.scheduleStatusLabel,
      fs.delaySummary || "—",
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [["İş Fonksiyonu", "Süreç Durumu", "Planlanan Tarih", "Gerçekleşen Tarih", "Takvim Durumu", "Sapma / Kalan"]],
      body: funcSchedBody,
      theme: "striped",
      styles: { font: PDF_FONT_FAMILY, fontSize: 8 },
      headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 8 },
      bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 8, cellPadding: 2 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Section 3.2: Saha İstasyonları ve Makine Envanteri (FAZ-62B) ─────────
  if (report.otStationsSummary && report.otStationsSummary.totalStations > 0) {
    const otSummary = report.otStationsSummary;
    checkPageBreak(35);
    doc.setFont(PDF_FONT_FAMILY, "bold");
    doc.setFontSize(13);
    doc.setTextColor(2, 132, 199);
    doc.text("3.2 Saha İstasyonları ve Makine Envanteri (OT/IT)", marginX, currentY);
    currentY += 6;

    const stationTableBody: string[][] = otSummary.stations.map((st) => [
      st.stationCode,
      st.stationName,
      [st.areaName, st.lineName].filter(Boolean).join(" / ") || "—",
      [st.machineName, st.plcOrController].filter(Boolean).join(" | ") || "—",
      st.status,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [["İstasyon Kodu", "İstasyon Adı", "Alan / Hat", "Makine & PLC", "Durum"]],
      body: stationTableBody,
      theme: "striped",
      styles: { font: PDF_FONT_FAMILY, fontSize: 8 },
      headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 8 },
      bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 8, cellPadding: 2 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Section 3.3: OT Veri Gereksinimleri, Alarm ve Kalite Cihazları (FAZ-62C) ──
  if (report.otMatrixSummary) {
    const matrixSummary = report.otMatrixSummary;
    checkPageBreak(35);
    doc.setFont(PDF_FONT_FAMILY, "bold");
    doc.setFontSize(13);
    doc.setTextColor(2, 132, 199);
    doc.text("3.3 OT Veri Gereksinimleri, Alarm ve Kalite Cihazları Matrisi", marginX, currentY);
    currentY += 6;

    // 3.3.1 Veri Gereksinimleri
    if (matrixSummary.dataRequirements.length > 0) {
      checkPageBreak(25);
      doc.setFont(PDF_FONT_FAMILY, "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("3.3.1 OT Veri Gereksinimi & Karar/Aksiyon Matrisi", marginX, currentY);
      currentY += 5;

      const dataRows = matrixSummary.dataRequirements.map((d) => [
        `${d.stationCode}\n(${d.stationName})`,
        `${d.measurementName}${d.dataCategory ? `\n[${d.dataCategory}]` : ""}`,
        `Amaç: ${d.purpose}\nKarar: ${d.decisionSupported}`,
        `${d.requiredAction}${d.businessValue ? `\nDeğer: ${d.businessValue}` : ""}`,
        `${d.sourceName || d.sourceType || "—"}\n(${[d.collectionMethod, d.frequency].filter(Boolean).join(" • ") || "—"})`,
        d.criticality.toUpperCase(),
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX, right: marginX },
        head: [["İstasyon", "Ölçüm / Sinyal", "Veri Amacı & Desteklenen Karar", "Tetiklenen Aksiyon", "Kaynak & Sıklık", "Kritiklik"]],
        body: dataRows,
        theme: "striped",
        styles: { font: PDF_FONT_FAMILY, fontSize: 7.5 },
        headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 7.5 },
        bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 7.5, cellPadding: 2 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // 3.3.2 Alarm ve Safety
    if (matrixSummary.alarmRequirements.length > 0) {
      checkPageBreak(25);
      doc.setFont(PDF_FONT_FAMILY, "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("3.3.2 Alarm ve Safety Gereksinimleri", marginX, currentY);
      currentY += 4.5;

      doc.setFont(PDF_FONT_FAMILY, "normal");
      doc.setFontSize(7);
      doc.setTextColor(180, 83, 9);
      doc.text("⚠️ Güvenlik ve Yetki Sınırı Notu: Safety kritiklik işareti yalnızca saha keşif ve danışmanlık amaçlıdır. ERP/CRM sistemi safety PLC yerine geçmez.", marginX, currentY);
      currentY += 4.5;

      const alarmRows = matrixSummary.alarmRequirements.map((a) => [
        `${a.stationCode}\n(${a.stationName})`,
        `${a.alarmName}${a.alarmCode ? `\n[${a.alarmCode}]` : ""}`,
        a.triggerCondition || "—",
        `${a.severity.toUpperCase()}${a.safetyCritical ? "\n🚨 SAFETY" : ""}`,
        `${a.responsibleRole || "—"}${a.responseSla ? `\nSLA: ${a.responseSla}` : ""}`,
        `${a.requiredAction || "—"}${a.escalationRequired ? "\n(Eskalasyon)" : ""}`,
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX, right: marginX },
        head: [["İstasyon", "Alarm Adı & Kodu", "Tetikleme Koşulu", "Ciddiyet & Safety", "Sorumlu & SLA", "Gerekli Aksiyon"]],
        body: alarmRows,
        theme: "striped",
        styles: { font: PDF_FONT_FAMILY, fontSize: 7.5 },
        headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [254, 243, 199], textColor: [146, 64, 14], fontSize: 7.5 },
        bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 7.5, cellPadding: 2 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // 3.3.3 Kalite Cihazları
    if (matrixSummary.qualityDevices.length > 0) {
      checkPageBreak(25);
      doc.setFont(PDF_FONT_FAMILY, "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("3.3.3 Kalite Ölçüm Cihazları ve Entegrasyon Profili", marginX, currentY);
      currentY += 5;

      const qualityRows = matrixSummary.qualityDevices.map((q) => {
        const capList = [
          q.passFailAvailable ? "PASS/FAIL" : null,
          q.measurementValuesAvailable ? "Ölçüm" : null,
          q.lotBatchAvailable ? "Lot" : null,
          q.productCodeAvailable ? "Ürün" : null,
          q.operatorAvailable ? "Operatör" : null,
        ].filter(Boolean).join(", ") || "—";

        return [
          `${q.stationCode}\n(${q.stationName})`,
          `${q.deviceName}\n${[q.deviceType, q.manufacturer, q.model].filter(Boolean).join(" • ") || "—"}`,
          `${q.outputFormat || "—"}\n(${q.interfaceType || "—"})`,
          capList,
          `${q.integrationMethod || "Manuel"}\n-> ${q.targetSystem || "ERP/QM"}`,
        ];
      });

      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX, right: marginX },
        head: [["İstasyon", "Cihaz & Model", "Format & Arayüz", "Veri Yetenekleri", "Entegrasyon & Hedef"]],
        body: qualityRows,
        theme: "striped",
        styles: { font: PDF_FONT_FAMILY, fontSize: 7.5 },
        headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 7.5 },
        bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 7.5, cellPadding: 2 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // ── Section 4: Süreç Haritaları, Süreç Sadelik ve Kullanıcı Benimsemesi (FAZ-63) ──
  if (report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0) {
    const pmapSummary = report.processMapsSummary;
    checkPageBreak(35);
    doc.setFont(PDF_FONT_FAMILY, "bold");
    doc.setFontSize(13);
    doc.setTextColor(2, 132, 199);
    doc.text("4. Süreç Haritaları, Süreç Sadelik ve Kullanıcı Benimsemesi", marginX, currentY);
    currentY += 6;

    doc.setFont(PDF_FONT_FAMILY, "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Toplam ${pmapSummary.stats.totalMaps} model süreç, ${pmapSummary.stats.totalNodes} adım, ${pmapSummary.stats.highAdoptionRiskCount} yüksek risk, ${pmapSummary.stats.simplificationOpportunityCount} sadeleştirme fırsatı, ${pmapSummary.stats.totalApprovals} onay, ${pmapSummary.stats.totalHandoffs} handoff.`,
      marginX,
      currentY
    );
    currentY += 6;

    for (let mIdx = 0; mIdx < pmapSummary.maps.length; mIdx++) {
      const pm = pmapSummary.maps[mIdx];
      checkPageBreak(25);
      doc.setFont(PDF_FONT_FAMILY, "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`4.1.${mIdx + 1} ${pm.name}${pm.processArea ? ` (${pm.processArea})` : ""}`, marginX, currentY);
      currentY += 4.5;

      doc.setFont(PDF_FONT_FAMILY, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Sahip: ${pm.ownerRole || "—"} | Durum: ${pm.status} | Adım: ${pm.nodes.length}${pm.description ? ` | ${pm.description}` : ""}`, marginX, currentY);
      currentY += 4.5;

      if (pm.nodes.length > 0) {
        const stepRows = pm.nodes.map((n) => {
          const metricsStr = [
            `Onay: ${n.approvalCount}`,
            `Handoff: ${n.handoffCount}`,
            n.duplicateDataEntry ? "Mükerrer" : null,
            n.bypassPossible ? "Bypass" : null,
          ].filter(Boolean).join(", ");

          return [
            `${n.stepOrder}`,
            `${n.name}\n[${n.nodeType}]${n.otStationCode ? ` (🏭 ${n.otStationCode})` : ""}`,
            `${n.responsibleRole || "—"}${n.responsibleDepartment ? `\n(${n.responsibleDepartment})` : ""}`,
            `G: ${n.inputDescription || "—"}\nÇ: ${n.outputDescription || "—"}`,
            metricsStr,
            n.adoptionRisk === "high" ? "🚨 YÜKSEK" : n.adoptionRisk === "medium" ? "⚠️ ORTA" : "✅ DÜŞÜK",
          ];
        });

        autoTable(doc, {
          startY: currentY,
          margin: { left: marginX, right: marginX },
          head: [["Sıra", "Adım & Tip", "Sorumlu", "Girdi & Çıktı", "Metrikler", "Benimseme Riski"]],
          body: stepRows,
          theme: "striped",
          styles: { font: PDF_FONT_FAMILY, fontSize: 7.5 },
          headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 7.5 },
          bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 7.5, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 42 },
            2: { cellWidth: 35 },
            3: { cellWidth: 40 },
            4: { cellWidth: 32 },
            5: { cellWidth: "auto" },
          },
        });
        currentY = (doc as any).lastAutoTable.finalY + 6;
      }
    }

    checkPageBreak(15);
    doc.setFont(PDF_FONT_FAMILY, "normal");
    doc.setFontSize(7);
    doc.setTextColor(180, 83, 9);
    doc.text(
      "⚠️ Güvenlik ve Kontrol Sınırı: Finansal kontrol, kalite, iş güvenliği ve görevler ayrılığı kontrolleri sadeleştirme adına kaldırılamaz.",
      marginX,
      currentY
    );
    currentY += 6;
  }

  // ── Section 5 / 4: İş Fonksiyonları Detay Analizi ──────────────────────────────
  checkPageBreak(35);
  doc.setFont(PDF_FONT_FAMILY, "bold");
  doc.setFontSize(13);
  doc.setTextColor(2, 132, 199);
  doc.text(
    report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0
      ? "5. İş Fonksiyonları & Süreç Analizleri"
      : "4. İş Fonksiyonları & Süreç Analizleri",
    marginX,
    currentY
  );
  currentY += 6;

  for (let fIdx = 0; fIdx < businessFunctions.length; fIdx++) {
    const fn = businessFunctions[fIdx];
    checkPageBreak(30);

    doc.setFont(PDF_FONT_FAMILY, "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`4.${fIdx + 1} ${fn.nameTr}`, marginX, currentY);
    currentY += 5;

    doc.setFont(PDF_FONT_FAMILY, "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Departman: ${fn.departmentName || "—"} | Sorumlu: ${fn.responsiblePerson || "—"} | Durum: ${formatStatusLabel(fn.status)} | İlerleme: %${fn.progressPercentage}`, marginX, currentY);
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
          let qPrefix = `[${q.id}]`;
          if (q.isCustom) qPrefix += ` [Özel Soru]`;
          if (q.followup) {
            qPrefix += q.followup.flagType === "critical" ? ` [🔴 Kritik Takip]` : ` [🟡 Sonra Dön]`;
          }
          doc.text(qPrefix, marginX + 4, currentY);

          doc.setTextColor(15, 23, 42);
          const qPrefixWidth = Math.max(22, doc.getTextWidth(qPrefix) + 3);
          const qLines = doc.splitTextToSize(q.questionText, pageWidth - marginX * 2 - qPrefixWidth - 3);
          doc.text(qLines, marginX + 4 + qPrefixWidth, currentY);
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

          if (q.attachments && q.attachments.length > 0) {
            checkPageBreak(8);
            doc.setFont(PDF_FONT_FAMILY, "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(15, 118, 110);
            const attStr = `Ek Kanıtlar (${q.attachments.length}): ` +
              q.attachments.map((a) => `${a.originalFileName} [${a.fileExtension.toUpperCase()}]`).join(", ");
            const attLines = doc.splitTextToSize(attStr, pageWidth - marginX * 2 - 30);
            doc.text(attLines, marginX + 26, currentY);
            currentY += attLines.length * 3.5;
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

  // ── Section 5: Veri Sahipliği, Yetkiler ve Sorumluluk Matrisi (FAZ-64 / dataGovernanceSummary) ──
  if (report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0) {
    const dgSummary = report.dataGovernanceSummary;
    checkPageBreak(35);
    doc.setFont(PDF_FONT_FAMILY, "bold");
    doc.setFontSize(13);
    doc.setTextColor(2, 132, 199);
    doc.text("5. Veri Sahipliği, Yetkiler ve Sorumluluk Matrisi", marginX, currentY);
    currentY += 6;

    doc.setFont(PDF_FONT_FAMILY, "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Toplam ${dgSummary.stats.totalAssets} veri varlığı, ${dgSummary.stats.unassignedOwnerCount} sahipsiz veri, ${dgSummary.stats.criticalAssetCount} kritik veri, ${dgSummary.stats.sodConflictCount} SoD çatışması, ${dgSummary.stats.totalAccessRules} erişim kuralı, ${dgSummary.stats.totalApprovals} onay kuralı.`,
      marginX,
      currentY
    );
    currentY += 6;

    // 5.1 Varlıklar Tablosu
    const assetRows = dgSummary.assets.map((ast) => {
      const tags = [
        ast.masterData ? "Ana" : null,
        ast.financialData ? "Fin" : null,
        ast.personalData ? "KVKK" : null,
        ast.qualityOrSafetyData ? "Kalite" : null,
      ].filter(Boolean).join("/");

      return [
        `${ast.assetName}${ast.domain ? `\n(${ast.domain})` : ""}${tags ? ` [${tags}]` : ""}`,
        `${ast.assetType}\n(${ast.systemOfRecord || "ERP"})`,
        ast.ownerRole || "Tanımsız",
        ast.stewardRole || "Tanımsız",
        ast.technicalCustodianRole || "Tanımsız",
        ast.criticality,
        ast.hasSodRisk ? "⚠️ Çatışma" : "Uygun",
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [["Veri Varlığı", "Tip/Sistem", "Veri Sahibi", "Sorumlu", "Emanetçi", "Kritiklik", "SoD"]],
      body: assetRows,
      theme: "striped",
      styles: { font: PDF_FONT_FAMILY, fontSize: 7.5 },
      headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 7.5 },
      bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 24 },
        2: { cellWidth: 26 },
        3: { cellWidth: 26 },
        4: { cellWidth: 26 },
        5: { cellWidth: 16 },
        6: { cellWidth: "auto" },
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 6;

    // 5.2 Erişim Kuralları
    if (dgSummary.accessRules.length > 0) {
      checkPageBreak(25);
      doc.setFont(PDF_FONT_FAMILY, "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text("5.2 Rol / Grup Bazlı Erişim ve Yetki Kuralları", marginX, currentY);
      currentY += 4.5;

      const accessRows = dgSummary.accessRules.map((acc) => [
        `${acc.actorName}\n(${acc.actorType})`,
        `${acc.assetName}${acc.domain ? `\n(${acc.domain})` : ""}`,
        acc.accessLevel,
        `${acc.scopeType}${acc.scopeValue ? `\n(${acc.scopeValue})` : ""}`,
        acc.approvalRequired ? `Onay Şartı\n(${acc.approvalRole || "Yönetici"})` : "Doğrudan",
        [
          acc.taskSeparationRequired ? "⚠️ SoD Zorunlu" : null,
          acc.limitDescription || null,
          acc.conflictNote || null,
        ].filter(Boolean).join(", ") || "—",
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX, right: marginX },
        head: [["Erişen Rol/Grup", "Veri Varlığı", "Erişim Seviyesi", "Kapsam", "Onay Şartı", "Limit / Not"]],
        body: accessRows,
        theme: "striped",
        styles: { font: PDF_FONT_FAMILY, fontSize: 7.5 },
        headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 7.5 },
        bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 7, cellPadding: 2 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // 5.3 Onay Kuralları
    if (dgSummary.approvals.length > 0) {
      checkPageBreak(25);
      doc.setFont(PDF_FONT_FAMILY, "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text("5.3 Onay Kuralları ve Limit Kademeleri", marginX, currentY);
      currentY += 4.5;

      const apprRows = dgSummary.approvals.map((appr) => [
        `${appr.approvalOrder}`,
        `${appr.approvalName}${appr.mandatory ? " (Zorunlu)" : ""}`,
        `${appr.assetName || "—"}${appr.processMapName ? `\n(🗺️ ${appr.processMapName})` : ""}`,
        appr.approvalRole,
        appr.thresholdDescription || "Tüm Tutarlar",
        appr.separationOfDuties ? "Ayrılık Şart" : "—",
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX, right: marginX },
        head: [["Sıra", "Onay Adı", "İlgili Varlık / Süreç", "Onaylayan Rol", "Eşik / Limit", "SoD"]],
        body: apprRows,
        theme: "striped",
        styles: { font: PDF_FONT_FAMILY, fontSize: 7.5 },
        headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 7.5 },
        bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 42 },
          2: { cellWidth: 42 },
          3: { cellWidth: 35 },
          4: { cellWidth: 26 },
          5: { cellWidth: "auto" },
        },
      });
      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    checkPageBreak(15);
    doc.setFont(PDF_FONT_FAMILY, "normal");
    doc.setFontSize(7);
    doc.setTextColor(30, 58, 138);
    doc.text(
      "⚠️ Görevler Ayrılığı (SoD) İlkesi: Veri varlığı sahibi, sorumlusu ve teknik emanetçisi aynı rolde toplandığında hata ve denetim riski oluşur. Bu rapor keşif ve danışmanlık amaçlıdır.",
      marginX,
      currentY
    );
    currentY += 6;
  } else if (report.governance) {
    checkPageBreak(30);
    doc.setFont(PDF_FONT_FAMILY, "bold");
    doc.setFontSize(13);
    doc.setTextColor(2, 132, 199);
    doc.text("5. Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi", marginX, currentY);
    currentY += 6;
  }

  // ── Section 6/5: Proje Notları & Açık Konular ───────────────────────────────
  checkPageBreak(30);
  doc.setFont(PDF_FONT_FAMILY, "bold");
  doc.setFontSize(13);
  doc.setTextColor(2, 132, 199);
  doc.text(report.governance ? "6. Proje Notları & Açık Konular" : "5. Proje Notları & Açık Konular", marginX, currentY);
  currentY += 6;

  // Açık Sorular ve Teyit Bekleyen Saha Başlıkları Tablosu (FAZ-9)
  if (report.followups && report.followups.length > 0) {
    checkPageBreak(25);
    const folRows = report.followups.map((fol) => [
      fol.flagType === "critical" ? "🔴 Kritik Takip" : "🟡 Sonra Dön",
      `${fol.businessFunctionNameTr}\n(${fol.processName})`,
      `[${fol.questionId}]\n${fol.questionText}`,
      fol.note || "Açıklama girilmedi.",
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [[`Açık Sorular & Teyit Bekleyen Konular (${report.followups.length})`, "İş Fonksiyonu & Süreç", "Soru", "Takip Notu / Gerekçe"]],
      body: folRows,
      theme: "grid",
      styles: { font: PDF_FONT_FAMILY },
      headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [254, 243, 199], textColor: [146, 64, 14], fontSize: 8 },
      bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 7.5, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 34 },
        2: { cellWidth: 65 },
        3: { cellWidth: "auto" },
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

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

  // 6. Kanıt Dokümanları ve Ekler Dizini (FAZ-33)
  if (report.attachments && report.attachments.length > 0) {
    checkPageBreak(25);
    doc.setFont(PDF_FONT_FAMILY, "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110);
    doc.text(`6. Kanıt Dokümanları ve Ekler Dizini (${report.attachments.length})`, marginX, currentY);
    currentY += 5;

    const attachmentUrlMap = new Map<number, string>();
    const attRows: string[][] = [];
    for (let idx = 0; idx < report.attachments.length; idx++) {
      const a = report.attachments[idx];
      const sizeStr =
        a.fileSize < 1024 * 1024
          ? `${(a.fileSize / 1024).toFixed(1)} KB`
          : `${(a.fileSize / (1024 * 1024)).toFixed(1)} MB`;
      // Windows: relative → appLocalDataDir → backslash absolute → file:/// RFC-8089 encode
      const fileUrl = a.fileUrl || await resolveAttachmentFileUrlFromRelative(a.relativePath);
      attachmentUrlMap.set(idx, fileUrl);
      attRows.push([
        `${a.businessFunctionNameTr}\n(${a.processName})`,
        `[${a.questionId}]\n${a.questionText}`,
        `📎 ${a.originalFileName}\n[${a.fileExtension.toUpperCase()} • ${sizeStr}]`,
        a.description || "—",
      ]);
    }


    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [["İş Fonksiyonu / Süreç", "Soru", "Dosya Adı, Tür & Yol", "Açıklama"]],
      body: attRows,
      theme: "grid",
      styles: { font: PDF_FONT_FAMILY },
      headStyles: { font: PDF_FONT_FAMILY, fontStyle: "bold", fillColor: [240, 253, 250], textColor: [15, 118, 110], fontSize: 8 },
      bodyStyles: { font: PDF_FONT_FAMILY, fontStyle: "normal", fontSize: 7.5, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 48 },
        2: { cellWidth: 55, textColor: [15, 118, 110] },
        3: { cellWidth: "auto" },
      },
      didDrawCell: (data: any) => {
        if (data.section === "body" && data.column.index === 2) {
          const url = attachmentUrlMap.get(data.row.index);
          if (url) {
            doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
              url,
            });
          }
        }
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // ── Rapor Kapanış ve Atıf Notu (Sade ve Profesyonel) ────────────────────────
  if (currentY + 14 > pageHeight - 16) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY += 4;
  }
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 4;

  doc.setFont(PDF_FONT_FAMILY, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("ERP CRM Discovery tarafından oluşturulmuştur.", marginX, currentY);
  currentY += 3.5;
  doc.text("Geliştirici ve bakımcı: Selim Koçak  •  İletişim: selimkocak@gmail.com", marginX, currentY);

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
