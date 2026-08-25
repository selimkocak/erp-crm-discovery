/**
 * ERP CRM Discovery — Microsoft Word (.docx) Exporter
 *
 * Generates rich, fully editable .docx documents from ReportModel.
 * Preserves Turkish characters, option-specific notes, general notes,
 * findings, requirements, risks, project notes, and executive summaries.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from "docx";
import { formatStatusLabel, type ReportModel } from "../report/types";
import { formatProjectStatus } from "../report/formatters";
import { resolveAttachmentFileUrlFromRelative } from "../storage/attachmentLinks";

// Design Tokens (Word Hex)
const COLOR_PRIMARY = "0284C7";    // Sky Blue 600
const COLOR_DARK = "0F172A";       // Slate 900
const COLOR_MUTED = "64748B";      // Slate 500
const COLOR_BORDER = "CBD5E1";     // Slate 300
const COLOR_BG_LIGHT = "F8FAFC";   // Slate 50
const COLOR_SUCCESS = "16A34A";    // Green 600
const COLOR_WARNING = "D97706";    // Amber 600

const FONT_FAMILY = "Calibri";

function createTableCell(
  text: string,
  options: {
    isHeader?: boolean;
    bold?: boolean;
    italics?: boolean;
    color?: string;
    widthPercent?: number;
    bgColor?: string;
  } = {}
): TableCell {
  const { isHeader, bold, italics, color = COLOR_DARK, widthPercent, bgColor } = options;

  return new TableCell({
    width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    shading: bgColor ? { fill: bgColor, type: ShadingType.CLEAR } : (isHeader ? { fill: "F1F5F9", type: ShadingType.CLEAR } : undefined),
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
    },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isHeader || bold,
            italics,
            size: isHeader ? 20 : 19, // 10pt / 9.5pt
            color: isHeader ? "334155" : color,
            font: FONT_FAMILY,
          }),
        ],
      }),
    ],
  });
}

function createAttachmentTableCell(
  originalFileName: string,
  fileUrl: string,
  fileExtension: string,
  sizeStr: string,
  relativePath: string
): TableCell {
  return new TableCell({
    width: { size: 26, type: WidthType.PERCENTAGE },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
    },
    children: [
      new Paragraph({
        children: [
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: `📎 ${originalFileName}`,
                bold: true,
                size: 19,
                color: "0F766E", // Teal 700
                underline: {},
                font: FONT_FAMILY,
              }),
            ],
            link: fileUrl,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 20 },
        children: [
          new TextRun({
            text: `[${fileExtension.toUpperCase()} • ${sizeStr}]`,
            size: 16,
            color: COLOR_MUTED,
            font: FONT_FAMILY,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 20 },
        children: [
          new TextRun({
            text: relativePath,
            size: 14,
            italics: true,
            color: "94A3B8",
            font: FONT_FAMILY,
          }),
        ],
      }),
    ],
  });
}

function createCalloutBox(title: string, content: string, borderColor: string = COLOR_PRIMARY): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
      left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLOR_BG_LIGHT, type: ShadingType.CLEAR },
            margins: { top: 140, bottom: 140, left: 200, right: 160 },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 21,
                    color: COLOR_DARK,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              ...content.split("\n").map(
                (line) =>
                  new Paragraph({
                    spacing: { after: 60 },
                    children: [
                      new TextRun({
                        text: line,
                        size: 20,
                        color: "334155",
                        font: FONT_FAMILY,
                      }),
                    ],
                  })
              ),
            ],
          }),
        ],
      }),
    ],
  });
}

export async function buildDocxBuffer(report: ReportModel): Promise<Uint8Array> {
  const { metadata, profile, company, scope, businessFunctions, projectNotes, summaryStats } = report;

  const docChildren: (Paragraph | Table)[] = [];

  // ── Cover Section ────────────────────────────────────────────────────────
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "ERP / CRM ÖN ANALİZ RAPORU",
          bold: true,
          size: 36, // 18pt
          color: COLOR_PRIMARY,
          font: FONT_FAMILY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: metadata.projectName,
          bold: true,
          size: 26, // 13pt
          color: COLOR_DARK,
          font: FONT_FAMILY,
        }),
      ],
    })
  );

  // Draft / Interim Banner
  if (!metadata.isComplete) {
    const draftText = metadata.draftLabel || `ARA RAPOR — Analiz %${metadata.progressPercent ?? 0} tamamlandı`;
    docChildren.push(
      createCalloutBox(
        draftText,
        "Bu doküman ara/taslak niteliğindedir ve henüz tamamlanmamış süreç değerlendirmeleri içerebilir.",
        COLOR_WARNING
      ),
      new Paragraph({ spacing: { after: 200 } })
    );
  }

  // Cover Meta Table
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createTableCell("Firma:", { bold: true, widthPercent: 20 }),
            createTableCell(company.companyName, { bold: true, widthPercent: 30 }),
            createTableCell("Rapor Tarihi:", { bold: true, widthPercent: 20 }),
            createTableCell(metadata.generatedAt, { widthPercent: 30 }),
          ],
        }),
        new TableRow({
          children: [
            createTableCell("Analiz Durumu:", { bold: true, widthPercent: 20 }),
            createTableCell(formatProjectStatus(metadata.projectStatus), { widthPercent: 30 }),
            createTableCell("İş Fonksiyonları:", { bold: true, widthPercent: 20 }),
            createTableCell(`${summaryStats.totalFunctions} Fonksiyon (${summaryStats.completedFunctions} Tamamlandı)`, { widthPercent: 30 }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 250 } })
  );

  // KPI Highlights Table
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createTableCell(`Bulgular: ${summaryStats.totalFindings}`, { isHeader: true, bgColor: "E0F2FE", color: "0369A1" }),
            createTableCell(`Gereksinimler: ${summaryStats.totalRequirements}`, { isHeader: true, bgColor: "DCFCE7", color: "15803D" }),
            createTableCell(`Açık Riskler: ${summaryStats.openRisks} / ${summaryStats.totalRisks}`, { isHeader: true, bgColor: "FEE2E2", color: "B91C1C" }),
            createTableCell(`Cevaplanan Sorular: ${summaryStats.answeredQuestions} / ${summaryStats.totalQuestions}`, { isHeader: true, bgColor: "FEF3C7", color: "B45309" }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 300 } })
  );

  // ── Section 1: Yönetici Özeti ─────────────────────────────────────────────
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
      children: [
        new TextRun({
          text: "1. Yönetici Özeti & Stratejik Değerlendirme",
          bold: true,
          size: 28,
          color: COLOR_PRIMARY,
          font: FONT_FAMILY,
        }),
      ],
    }),
    createCalloutBox(
      "Yönetici Özeti",
      profile.executive_summary || "Yönetici özeti henüz girilmedi.",
      COLOR_PRIMARY
    ),
    new Paragraph({ spacing: { after: 140 } })
  );

  if (profile.overall_assessment) {
    docChildren.push(
      createCalloutBox(
        "Genel Değerlendirme & Dönüşüm Önerisi",
        profile.overall_assessment,
        COLOR_SUCCESS
      ),
      new Paragraph({ spacing: { after: 200 } })
    );
  }

  // ── Section 2: Firma Profili ──────────────────────────────────────────────
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
      children: [
        new TextRun({
          text: "2. Firma Profili & Künye",
          bold: true,
          size: 28,
          color: COLOR_PRIMARY,
          font: FONT_FAMILY,
        }),
      ],
    })
  );

  const companyRows: TableRow[] = [
    new TableRow({
      children: [
        createTableCell("Firma Adı", { bold: true, widthPercent: 30 }),
        createTableCell(company.companyName, { widthPercent: 70 }),
      ],
    }),
  ];

  if (company.tradeName) {
    companyRows.push(
      new TableRow({
        children: [
          createTableCell("Ticari Unvan", { bold: true, widthPercent: 30 }),
          createTableCell(company.tradeName, { widthPercent: 70 }),
        ],
      })
    );
  }
  if (company.city) {
    companyRows.push(
      new TableRow({
        children: [
          createTableCell("Şehir / Ülke", { bold: true, widthPercent: 30 }),
          createTableCell(`${company.city}, ${company.country}`, { widthPercent: 70 }),
        ],
      })
    );
  }
  if (company.employeeCount) {
    companyRows.push(
      new TableRow({
        children: [
          createTableCell("Çalışan Sayısı", { bold: true, widthPercent: 30 }),
          createTableCell(company.employeeCount, { widthPercent: 70 }),
        ],
      })
    );
  }
  if (company.businessSector) {
    companyRows.push(
      new TableRow({
        children: [
          createTableCell("Sektör / Faaliyet", { bold: true, widthPercent: 30 }),
          createTableCell(company.businessSector, { widthPercent: 70 }),
        ],
      })
    );
  }
  if (company.hasBranches) {
    const branchText =
      company.hasBranches === "yes"
        ? (company.branchCount ? `Evet (${company.branchCount} Şube / Lokasyon)` : "Evet (Çok Lokasyonlu)")
        : "Hayır (Tek Lokasyon)";
    companyRows.push(
      new TableRow({
        children: [
          createTableCell("Şubeli / Çok Lokasyonlu Yapı", { bold: true, widthPercent: 30 }),
          createTableCell(branchText, { widthPercent: 70 }),
        ],
      })
    );
  }
  if (company.taxNumber) {
    companyRows.push(
      new TableRow({
        children: [
          createTableCell("Vergi Numarası", { bold: true, widthPercent: 30 }),
          createTableCell(company.taxNumber, { widthPercent: 70 }),
        ],
      })
    );
  }
  if (company.notes) {
    companyRows.push(
      new TableRow({
        children: [
          createTableCell("Firma Notları", { bold: true, widthPercent: 30 }),
          createTableCell(company.notes, { widthPercent: 70 }),
        ],
      })
    );
  }

  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: companyRows,
    }),
    new Paragraph({ spacing: { after: 200 } })
  );

  // ── Section 3: Analiz Kapsamı ─────────────────────────────────────────────
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
      children: [
        new TextRun({
          text: "3. Analiz Kapsamı & İlerleme",
          bold: true,
          size: 28,
          color: COLOR_PRIMARY,
          font: FONT_FAMILY,
        }),
      ],
    })
  );

  const scopeRows: TableRow[] = [
    new TableRow({
      children: [
        createTableCell("İş Fonksiyonu", { isHeader: true, widthPercent: 30 }),
        createTableCell("Kategori", { isHeader: true, widthPercent: 20 }),
        createTableCell("Firma Departmanı", { isHeader: true, widthPercent: 25 }),
        createTableCell("Durum & İlerleme", { isHeader: true, widthPercent: 25 }),
      ],
    }),
  ];

  for (const s of scope) {
    const statusLabel = formatStatusLabel(s.status);
    const statusText = s.hasPack
      ? `${statusLabel} (%${s.progressPercentage})`
      : `${statusLabel} (Soru paketi yok)`;

    scopeRows.push(
      new TableRow({
        children: [
          createTableCell(s.nameTr, { bold: true }),
          createTableCell(s.category),
          createTableCell(s.departmentName || "—"),
          createTableCell(statusText),
        ],
      })
    );
  }

  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: scopeRows,
    }),
    new Paragraph({ spacing: { after: 200 } })
  );

  // ── Section 3.1: Proje Takvimi & Zaman Planı (FAZ-59) ────────────────────
  if (report.scheduleSummary) {
    const sched = report.scheduleSummary;

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({
            text: "3.1 Proje Takvimi & İş Fonksiyonu Zaman Planı",
            bold: true,
            size: 28,
            color: COLOR_PRIMARY,
            font: FONT_FAMILY,
          }),
        ],
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: "Genel Proje Takvimi",
            bold: true,
            size: 22,
            color: COLOR_DARK,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    const projSchedRows: TableRow[] = [
      new TableRow({
        children: [
          createTableCell("Planlanan Tarih Aralığı", { bold: true, widthPercent: 30 }),
          createTableCell(sched.projectSchedule.plannedRangeSummary || "—", { widthPercent: 70 }),
        ],
      }),
      new TableRow({
        children: [
          createTableCell("Gerçekleşen Tarih Aralığı", { bold: true, widthPercent: 30 }),
          createTableCell(sched.projectSchedule.actualRangeSummary || "—", { widthPercent: 70 }),
        ],
      }),
      new TableRow({
        children: [
          createTableCell("Takvim Durumu", { bold: true, widthPercent: 30 }),
          createTableCell(`${sched.projectSchedule.scheduleStatusLabel} (${sched.projectSchedule.delaySummary})`, { widthPercent: 70 }),
        ],
      }),
    ];

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: projSchedRows,
      }),
      new Paragraph({ spacing: { after: 150 } }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: "İş Fonksiyonları Zaman Çizelgesi",
            bold: true,
            size: 22,
            color: COLOR_DARK,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    const funcSchedRows: TableRow[] = [
      new TableRow({
        children: [
          createTableCell("İş Fonksiyonu", { isHeader: true, widthPercent: 24 }),
          createTableCell("Süreç Durumu", { isHeader: true, widthPercent: 16 }),
          createTableCell("Planlanan Tarih", { isHeader: true, widthPercent: 20 }),
          createTableCell("Gerçekleşen Tarih", { isHeader: true, widthPercent: 20 }),
          createTableCell("Takvim Durumu", { isHeader: true, widthPercent: 20 }),
        ],
      }),
    ];

    for (const fs of sched.functionSchedules) {
      funcSchedRows.push(
        new TableRow({
          children: [
            createTableCell(fs.nameTr, { bold: true }),
            createTableCell(formatStatusLabel(fs.processStatus)),
            createTableCell(fs.plannedRangeSummary || "—"),
            createTableCell(fs.actualRangeSummary || "—"),
            createTableCell(`${fs.scheduleStatusLabel} (${fs.delaySummary || "—"})`),
          ],
        })
      );
    }

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: funcSchedRows,
      }),
      new Paragraph({ spacing: { after: 200 } })
    );
  }

  // ── Section 3.2: Saha İstasyonları ve Makine Envanteri (FAZ-62B) ─────────
  if (report.otStationsSummary && report.otStationsSummary.totalStations > 0) {
    const otSummary = report.otStationsSummary;

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({
            text: "3.2 Saha İstasyonları ve Makine Envanteri (OT/IT)",
            bold: true,
            size: 28,
            color: COLOR_PRIMARY,
            font: FONT_FAMILY,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({
            text: `Toplam ${otSummary.totalStations} istasyon (${otSummary.activeStations} aktif), ${otSummary.areaCount} üretim alanı ve ${otSummary.lineCount} üretim hattında yapılandırılmıştır.`,
            size: 20,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    const stationHeaderRow = new TableRow({
      tableHeader: true,
      children: [
        createTableCell("İstasyon Kodu", { isHeader: true, widthPercent: 20 }),
        createTableCell("İstasyon Adı", { isHeader: true, widthPercent: 25 }),
        createTableCell("Alan / Hat", { isHeader: true, widthPercent: 25 }),
        createTableCell("Makine & PLC", { isHeader: true, widthPercent: 20 }),
        createTableCell("Durum", { isHeader: true, widthPercent: 10 }),
      ],
    });

    const stationDataRows: TableRow[] = otSummary.stations.map(
      (st) =>
        new TableRow({
          children: [
            createTableCell(st.stationCode, { bold: true, widthPercent: 20 }),
            createTableCell(st.stationName, { widthPercent: 25 }),
            createTableCell([st.areaName, st.lineName].filter(Boolean).join(" / ") || "—", { widthPercent: 25 }),
            createTableCell([st.machineName, st.plcOrController].filter(Boolean).join(" | ") || "—", { widthPercent: 20 }),
            createTableCell(st.status, { widthPercent: 10 }),
          ],
        })
    );

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [stationHeaderRow, ...stationDataRows],
      })
    );
  }

  // ── Section 3.3: OT Veri Gereksinimleri, Alarm ve Kalite Cihazları Matrisi (FAZ-62C) ──
  if (report.otMatrixSummary) {
    const matrixSummary = report.otMatrixSummary;

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({
            text: "3.3 OT Veri Gereksinimleri, Alarm ve Kalite Cihazları Matrisi",
            bold: true,
            size: 28,
            color: COLOR_PRIMARY,
            font: FONT_FAMILY,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({
            text: `Toplam ${matrixSummary.stats.totalDataRequirements} veri gereksinimi (${matrixSummary.stats.criticalDataRequirements} kritik), ${matrixSummary.stats.totalAlarms} alarm (${matrixSummary.stats.safetyCriticalAlarms} safety kritik) ve ${matrixSummary.stats.totalQualityDevices} kalite cihazı (${matrixSummary.stats.automatedTransferDevices} otomatik aktarım) analiz edilmiştir.`,
            size: 20,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    // 3.3.1 Veri Gereksinimleri
    if (matrixSummary.dataRequirements.length > 0) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
          children: [
            new TextRun({
              text: "3.3.1 OT Veri Gereksinimi & Karar/Aksiyon Matrisi",
              bold: true,
              size: 22,
              color: COLOR_DARK,
              font: FONT_FAMILY,
            }),
          ],
        })
      );

      const dataHeaderRow = new TableRow({
        tableHeader: true,
        children: [
          createTableCell("İstasyon", { isHeader: true, widthPercent: 15 }),
          createTableCell("Ölçüm / Sinyal", { isHeader: true, widthPercent: 20 }),
          createTableCell("Veri Amacı & Desteklenen Karar", { isHeader: true, widthPercent: 25 }),
          createTableCell("Tetiklenen Aksiyon", { isHeader: true, widthPercent: 20 }),
          createTableCell("Kaynak & Sıklık", { isHeader: true, widthPercent: 12 }),
          createTableCell("Kritiklik", { isHeader: true, widthPercent: 8 }),
        ],
      });

      const dataRows: TableRow[] = matrixSummary.dataRequirements.map(
        (d) =>
          new TableRow({
            children: [
              createTableCell(`${d.stationCode}\n(${d.stationName})`, { bold: true }),
              createTableCell(`${d.measurementName}${d.dataCategory ? `\n[${d.dataCategory}]` : ""}`),
              createTableCell(`Amaç: ${d.purpose}\nKarar: ${d.decisionSupported}`),
              createTableCell(`${d.requiredAction}${d.businessValue ? `\nDeğer: ${d.businessValue}` : ""}`),
              createTableCell(`${d.sourceName || d.sourceType || "—"}\n(${[d.collectionMethod, d.frequency].filter(Boolean).join(" • ") || "—"})`),
              createTableCell(d.criticality.toUpperCase()),
            ],
          })
      );

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [dataHeaderRow, ...dataRows],
        }),
        new Paragraph({ spacing: { after: 150 } })
      );
    }

    // 3.3.2 Alarm ve Safety
    if (matrixSummary.alarmRequirements.length > 0) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
          children: [
            new TextRun({
              text: "3.3.2 Alarm ve Safety Gereksinimleri",
              bold: true,
              size: 22,
              color: COLOR_DARK,
              font: FONT_FAMILY,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "⚠️ Güvenlik ve Yetki Sınırı Notu: Safety kritiklik işareti yalnızca saha keşif ve danışmanlık amaçlıdır. ERP/CRM sistemi safety PLC yerine geçmez ve sahaya doğrudan durdurma komutu iletmez.",
              italics: true,
              size: 18,
              color: "B45309",
              font: FONT_FAMILY,
            }),
          ],
        })
      );

      const alarmHeaderRow = new TableRow({
        tableHeader: true,
        children: [
          createTableCell("İstasyon", { isHeader: true, widthPercent: 15 }),
          createTableCell("Alarm Adı & Kodu", { isHeader: true, widthPercent: 22 }),
          createTableCell("Tetikleme Koşulu", { isHeader: true, widthPercent: 23 }),
          createTableCell("Ciddiyet & Safety", { isHeader: true, widthPercent: 15 }),
          createTableCell("Sorumlu & SLA", { isHeader: true, widthPercent: 12 }),
          createTableCell("Gerekli Aksiyon", { isHeader: true, widthPercent: 13 }),
        ],
      });

      const alarmRows: TableRow[] = matrixSummary.alarmRequirements.map(
        (a) =>
          new TableRow({
            children: [
              createTableCell(`${a.stationCode}\n(${a.stationName})`, { bold: true }),
              createTableCell(`${a.alarmName}${a.alarmCode ? `\n[${a.alarmCode}]` : ""}`),
              createTableCell(a.triggerCondition || "—"),
              createTableCell(`${a.severity.toUpperCase()}${a.safetyCritical ? "\n🚨 SAFETY KRİTİK" : ""}`),
              createTableCell(`${a.responsibleRole || "—"}${a.responseSla ? `\nSLA: ${a.responseSla}` : ""}`),
              createTableCell(`${a.requiredAction || "—"}${a.escalationRequired ? "\n(Eskalasyon Var)" : ""}`),
            ],
          })
      );

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [alarmHeaderRow, ...alarmRows],
        }),
        new Paragraph({ spacing: { after: 150 } })
      );
    }

    // 3.3.3 Kalite Cihazları
    if (matrixSummary.qualityDevices.length > 0) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
          children: [
            new TextRun({
              text: "3.3.3 Kalite Ölçüm Cihazları ve Entegrasyon Profili",
              bold: true,
              size: 22,
              color: COLOR_DARK,
              font: FONT_FAMILY,
            }),
          ],
        })
      );

      const qualityHeaderRow = new TableRow({
        tableHeader: true,
        children: [
          createTableCell("İstasyon", { isHeader: true, widthPercent: 15 }),
          createTableCell("Cihaz & Model", { isHeader: true, widthPercent: 25 }),
          createTableCell("Format & Arayüz", { isHeader: true, widthPercent: 20 }),
          createTableCell("Veri Yetenekleri", { isHeader: true, widthPercent: 25 }),
          createTableCell("Entegrasyon & Hedef", { isHeader: true, widthPercent: 15 }),
        ],
      });

      const qualityRows: TableRow[] = matrixSummary.qualityDevices.map(
        (q) => {
          const capList = [
            q.passFailAvailable ? "PASS/FAIL" : null,
            q.measurementValuesAvailable ? "Ölçüm Değeri" : null,
            q.lotBatchAvailable ? "Lot/Parti" : null,
            q.productCodeAvailable ? "Ürün Kodu" : null,
            q.operatorAvailable ? "Operatör" : null,
          ].filter(Boolean).join(", ") || "—";

          return new TableRow({
            children: [
              createTableCell(`${q.stationCode}\n(${q.stationName})`, { bold: true }),
              createTableCell(`${q.deviceName}\n${[q.deviceType, q.manufacturer, q.model].filter(Boolean).join(" • ") || "—"}`),
              createTableCell(`${q.outputFormat || "—"}\n(${q.interfaceType || "—"})`),
              createTableCell(capList),
              createTableCell(`${q.integrationMethod || "Manuel"}\n-> ${q.targetSystem || "ERP/QM"}`),
            ],
          });
        }
      );

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [qualityHeaderRow, ...qualityRows],
        }),
        new Paragraph({ spacing: { after: 200 } })
      );
    }
  }

  // ── Section 4: Süreç Haritaları, Süreç Sadelik ve Kullanıcı Benimsemesi (FAZ-63) ──
  if (report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0) {
    const pmapSummary = report.processMapsSummary;

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({
            text: "4. Süreç Haritaları, Süreç Sadelik ve Kullanıcı Benimsemesi",
            bold: true,
            size: 28,
            color: COLOR_PRIMARY,
            font: FONT_FAMILY,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({
            text: `Toplam ${pmapSummary.stats.totalMaps} model süreç, ${pmapSummary.stats.totalNodes} süreç adımı, ${pmapSummary.stats.highAdoptionRiskCount} yüksek benimseme riski, ${pmapSummary.stats.simplificationOpportunityCount} sadeleştirme fırsatı, ${pmapSummary.stats.totalApprovals} onay adımı ve ${pmapSummary.stats.totalHandoffs} el değiştirme (handoff) analiz edilmiştir.`,
            size: 20,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    // Her süreç haritası için adımlar tablosu
    for (let mIdx = 0; mIdx < pmapSummary.maps.length; mIdx++) {
      const pm = pmapSummary.maps[mIdx];

      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
          children: [
            new TextRun({
              text: `4.1.${mIdx + 1} ${pm.name}${pm.processArea ? ` (${pm.processArea})` : ""}`,
              bold: true,
              size: 22,
              color: COLOR_DARK,
              font: FONT_FAMILY,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `Süreç Sahibi: ${pm.ownerRole || "—"} | Durum: ${pm.status} | Adım Sayısı: ${pm.nodes.length}${pm.description ? `\nAçıklama: ${pm.description}` : ""}`,
              size: 18,
              color: COLOR_MUTED,
              italics: true,
              font: FONT_FAMILY,
            }),
          ],
        })
      );

      if (pm.nodes.length > 0) {
        const stepHeaderRow = new TableRow({
          tableHeader: true,
          children: [
            createTableCell("Sıra", { isHeader: true, widthPercent: 8 }),
            createTableCell("Adım & Tip", { isHeader: true, widthPercent: 22 }),
            createTableCell("Sorumlu (Dep / Rol)", { isHeader: true, widthPercent: 20 }),
            createTableCell("Girdi & Çıktı", { isHeader: true, widthPercent: 20 }),
            createTableCell("Metrikler & Riskler", { isHeader: true, widthPercent: 18 }),
            createTableCell("Benimseme Riski", { isHeader: true, widthPercent: 12 }),
          ],
        });

        const stepRows: TableRow[] = pm.nodes.map((n) => {
          const metricsStr = [
            `Onay: ${n.approvalCount}`,
            `Handoff: ${n.handoffCount}`,
            n.duplicateDataEntry ? "⚠️ Mükerrer Veri" : null,
            n.bypassPossible ? "🚨 Bypass Riski" : null,
            n.valueAdded ? "Katma Değerli" : "İsraf/Bekleme",
          ].filter(Boolean).join("\n");

          return new TableRow({
            children: [
              createTableCell(`${n.stepOrder}`, { bold: true }),
              createTableCell(`${n.name}\n[${n.nodeType}]${n.otStationCode ? `\n(🏭 ${n.otStationCode})` : ""}`),
              createTableCell(`${n.responsibleRole || "—"}${n.responsibleDepartment ? `\n(${n.responsibleDepartment})` : ""}`),
              createTableCell(`G: ${n.inputDescription || "—"}\nÇ: ${n.outputDescription || "—"}`),
              createTableCell(metricsStr),
              createTableCell(
                n.adoptionRisk === "high" ? "🚨 YÜKSEK" : n.adoptionRisk === "medium" ? "⚠️ ORTA" : "✅ DÜŞÜK",
                { bold: true, bgColor: n.adoptionRisk === "high" ? "FEF2F2" : n.adoptionRisk === "medium" ? "FFFBEB" : "F0FDF4" }
              ),
            ],
          });
        });

        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [stepHeaderRow, ...stepRows],
          }),
          new Paragraph({ spacing: { after: 120 } })
        );
      }
    }

    // 4.2 Sadeleştirme & Güvenlik Sınırı Notu
    docChildren.push(
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "⚠️ Süreç Sadeleştirme ve Kontrol Güvenlik İlkesi: Basit süreç, kontrolsüz süreç değildir. Finansal kontrol, kalite, iş güvenliği, mevzuat ve görevler ayrılığı (SoD) kontrolleri sadeleştirme adına kaldırılamaz. Yalnızca gereksiz tekrar, bekleme, belirsizlik ve kullanıcı yükü azaltılabilir.",
            italics: true,
            size: 18,
            color: "B45309",
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  }

  // ── Section 5 / 4: İş Fonksiyonları Detay Analizi ──────────────────────────────
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
      children: [
        new TextRun({
          text: report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0
            ? "5. İş Fonksiyonları & Süreç Analizleri"
            : "4. İş Fonksiyonları & Süreç Analizleri",
          bold: true,
          size: 28,
          color: COLOR_PRIMARY,
          font: FONT_FAMILY,
        }),
      ],
    })
  );

  for (let fIdx = 0; fIdx < businessFunctions.length; fIdx++) {
    const fn = businessFunctions[fIdx];

    // Function Title
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        pageBreakBefore: fIdx > 0,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: `4.${fIdx + 1} ${fn.nameTr}`,
            bold: true,
            size: 24,
            color: COLOR_PRIMARY,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    // Meta details
    docChildren.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: `Firma Departmanı: ${fn.departmentName || "—"} | Sorumlu: ${fn.responsiblePerson || "—"} | Durum: ${formatStatusLabel(fn.status)} | İlerleme: %${fn.progressPercentage}`,
            size: 18,
            color: COLOR_MUTED,
            italics: true,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    // Processes and Questions
    if (fn.processes.length === 0) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: fn.packId
                ? "Bu fonksiyonda henüz cevaplanmış soru bulunmuyor."
                : "Bu fonksiyon için henüz soru paketi tanımlanmadı.",
              italics: true,
              size: 19,
              color: COLOR_MUTED,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    } else {
      for (let pIdx = 0; pIdx < fn.processes.length; pIdx++) {
        const proc = fn.processes[pIdx];

        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 },
            children: [
              new TextRun({
                text: `4.${fIdx + 1}.${pIdx + 1} ${proc.name}`,
                bold: true,
                size: 21,
                color: COLOR_DARK,
                font: FONT_FAMILY,
              }),
            ],
          })
        );

        for (const q of proc.questions) {
          // Question Header
          const questionHeaderRuns: TextRun[] = [
            new TextRun({
              text: `[${q.id}] `,
              bold: true,
              size: 19,
              color: COLOR_PRIMARY,
              font: FONT_FAMILY,
            }),
          ];

          if (q.isCustom) {
            questionHeaderRuns.push(
              new TextRun({
                text: `[Özel Soru] `,
                bold: true,
                size: 17,
                color: COLOR_WARNING,
                font: FONT_FAMILY,
              })
            );
          }

          if (q.followup) {
            questionHeaderRuns.push(
              new TextRun({
                text: q.followup.flagType === "critical" ? `[🔴 Kritik Takip] ` : `[🟡 Sonra Dön] `,
                bold: true,
                size: 17,
                color: q.followup.flagType === "critical" ? "DC2626" : COLOR_WARNING,
                font: FONT_FAMILY,
              })
            );
          }

          questionHeaderRuns.push(
            new TextRun({
              text: q.questionText,
              bold: true,
              size: 19,
              color: COLOR_DARK,
              font: FONT_FAMILY,
            })
          );

          docChildren.push(
            new Paragraph({
              spacing: { before: 80, after: 40 },
              children: questionHeaderRuns,
            })
          );

          if (q.description) {
            docChildren.push(
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: q.description,
                    italics: true,
                    size: 17,
                    color: COLOR_MUTED,
                    font: FONT_FAMILY,
                  }),
                ],
              })
            );
          }

          // Answers
          if (q.formattedAnswer.selectedOptions.length > 0) {
            for (const opt of q.formattedAnswer.selectedOptions) {
              const optText = opt.note ? `• ${opt.label} — Açıklama: ${opt.note}` : `• ${opt.label}`;
              docChildren.push(
                new Paragraph({
                  spacing: { after: 30 },
                  indent: { left: 300 },
                  children: [
                    new TextRun({
                      text: optText,
                      size: 19,
                      color: COLOR_DARK,
                      font: FONT_FAMILY,
                    }),
                  ],
                })
              );
            }
          }

          if (q.formattedAnswer.textValue) {
            docChildren.push(
              new Paragraph({
                spacing: { after: 30 },
                indent: { left: 300 },
                children: [
                  new TextRun({
                    text: q.formattedAnswer.textValue,
                    size: 19,
                    color: COLOR_DARK,
                    font: FONT_FAMILY,
                  }),
                ],
              })
            );
          }

          if (q.formattedAnswer.generalNote) {
            docChildren.push(
              new Paragraph({
                spacing: { after: 40 },
                indent: { left: 300 },
                children: [
                  new TextRun({
                    text: `Genel Not: ${q.formattedAnswer.generalNote}`,
                    italics: true,
                    size: 18,
                    color: "475569",
                    font: FONT_FAMILY,
                  }),
                ],
              })
            );
          }

          if (q.attachments && q.attachments.length > 0) {
            docChildren.push(
              new Paragraph({
                spacing: { before: 40, after: 20 },
                indent: { left: 300 },
                children: [
                  new TextRun({
                    text: `Ek Kanıtlar (${q.attachments.length}):`,
                    bold: true,
                    size: 17,
                    color: "0F766E",
                    font: FONT_FAMILY,
                  }),
                ],
              })
            );
            for (const att of q.attachments) {
              const sizeStr =
                att.fileSize < 1024 * 1024
                  ? `${(att.fileSize / 1024).toFixed(1)} KB`
                  : `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`;
              // Windows: relative → appLocalDataDir → backslash absolute → file:/// RFC-8089 encode
              const fileUrl = att.fileUrl || await resolveAttachmentFileUrlFromRelative(att.relativePath);
              docChildren.push(
                new Paragraph({
                  spacing: { after: 20 },
                  indent: { left: 450 },
                  children: [
                    new ExternalHyperlink({
                      children: [
                        new TextRun({
                          text: `📎 ${att.originalFileName} `,
                          bold: true,
                          size: 17,
                          color: "0F766E",
                          underline: {},
                          font: FONT_FAMILY,
                        }),
                      ],
                      link: fileUrl,
                    }),
                    new TextRun({
                      text: `[${att.fileExtension.toUpperCase()}, ${sizeStr}]`,
                      size: 16,
                      color: COLOR_MUTED,
                      font: FONT_FAMILY,
                    }),
                    att.description
                      ? new TextRun({
                          text: ` — ${att.description}`,
                          italics: true,
                          size: 16,
                          color: "475569",
                          font: FONT_FAMILY,
                        })
                      : new TextRun({ text: "" }),
                  ],
                })
              );
            }
          }

          if (!q.formattedAnswer.isAnswered) {
            docChildren.push(
              new Paragraph({
                spacing: { after: 40 },
                indent: { left: 300 },
                children: [
                  new TextRun({
                    text: "Cevaplanmadı",
                    italics: true,
                    size: 18,
                    color: COLOR_MUTED,
                    font: FONT_FAMILY,
                  }),
                ],
              })
            );
          }
        }
      }
    }

    // Function Findings
    if (fn.findings.length > 0) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 180, after: 60 },
          children: [
            new TextRun({
              text: `Tespit Edilen Bulgular (${fn.findings.length})`,
              bold: true,
              size: 20,
              color: "0369A1",
              font: FONT_FAMILY,
            }),
          ],
        })
      );
      for (const f of fn.findings) {
        docChildren.push(
          createCalloutBox(
            `BULGU [${f.priority.toUpperCase()} / ${f.status.toUpperCase()}]: ${f.title}`,
            f.description + (f.questionId ? `\n(Kaynak Soru: ${f.questionId}${f.sourceQuestionText ? ` - ${f.sourceQuestionText}` : ""})` : ""),
            "0284C7"
          ),
          new Paragraph({ spacing: { after: 60 } })
        );
      }
    }

    // Function Requirements
    if (fn.requirements.length > 0) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 180, after: 60 },
          children: [
            new TextRun({
              text: `İş Gereksinimleri (${fn.requirements.length})`,
              bold: true,
              size: 20,
              color: "15803D",
              font: FONT_FAMILY,
            }),
          ],
        })
      );
      for (const r of fn.requirements) {
        docChildren.push(
          createCalloutBox(
            `GEREKSİNİM [${r.priority.toUpperCase()} / ${r.status.toUpperCase()}]: ${r.title}`,
            r.description + (r.questionId ? `\n(Kaynak Soru: ${r.questionId}${r.sourceQuestionText ? ` - ${r.sourceQuestionText}` : ""})` : ""),
            "16A34A"
          ),
          new Paragraph({ spacing: { after: 60 } })
        );
      }
    }

    // Function Risks
    if (fn.risks.length > 0) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 180, after: 60 },
          children: [
            new TextRun({
              text: `Tespit Edilen Riskler (${fn.risks.length})`,
              bold: true,
              size: 20,
              color: "B91C1C",
              font: FONT_FAMILY,
            }),
          ],
        })
      );
      for (const rsk of fn.risks) {
        const riskBody = `${rsk.description}\nEtki: ${rsk.impact.toUpperCase()} | Olasılık: ${rsk.probability.toUpperCase()} | Durum: ${rsk.status.toUpperCase()}${rsk.mitigationNote ? `\nÖnlem Planı: ${rsk.mitigationNote}` : ""}${rsk.questionId ? `\n(Kaynak Soru: ${rsk.questionId}${rsk.sourceQuestionText ? ` - ${rsk.sourceQuestionText}` : ""})` : ""}`;
        docChildren.push(
          createCalloutBox(
            `RİSK: ${rsk.title}`,
            riskBody,
            "DC2626"
          ),
          new Paragraph({ spacing: { after: 60 } })
        );
      }
    }

    // Function Notes
    if (fn.notes.length > 0) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 180, after: 60 },
          children: [
            new TextRun({
              text: `Görüşme Notları (${fn.notes.length})`,
              bold: true,
              size: 20,
              color: COLOR_MUTED,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
      for (const n of fn.notes) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 240 },
            children: [
              new TextRun({
                text: `• ${n.note}${n.questionId ? ` (Kaynak: ${n.questionId})` : ""}`,
                size: 19,
                color: COLOR_DARK,
                font: FONT_FAMILY,
              }),
            ],
          })
        );
      }
    }
  }

  // ── Section 5: Veri Sahipliği, Yetkiler ve Sorumluluk Matrisi (FAZ-64 / dataGovernanceSummary) ──
  if (report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0) {
    const dgSummary = report.dataGovernanceSummary;
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({
            text: "5. Veri Sahipliği, Yetkiler ve Sorumluluk Matrisi",
            bold: true,
            size: 28,
            color: COLOR_PRIMARY,
            font: FONT_FAMILY,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({
            text: `Toplam ${dgSummary.stats.totalAssets} veri varlığı, ${dgSummary.stats.unassignedOwnerCount} sahipsiz veri, ${dgSummary.stats.criticalAssetCount} kritik veri, ${dgSummary.stats.sodConflictCount} SoD çatışma uyarısı, ${dgSummary.stats.totalAccessRules} erişim kuralı ve ${dgSummary.stats.totalApprovals} onay kuralı incelenmiştir.`,
            size: 20,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    // 5.1 Veri Varlıkları ve Sorumluluk Matrisi
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: "5.1 Veri Varlıkları, Sahiplik ve Görevler Ayrılığı Matrisi",
            bold: true,
            size: 22,
            color: COLOR_DARK,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    const assetHeaderRow = new TableRow({
      tableHeader: true,
      children: [
        createTableCell("Veri Varlığı & Domain", { isHeader: true, widthPercent: 25 }),
        createTableCell("Tip / Kayıt Sistemi", { isHeader: true, widthPercent: 15 }),
        createTableCell("Veri Sahibi (Owner)", { isHeader: true, widthPercent: 18 }),
        createTableCell("Veri Sorumlusu (Steward)", { isHeader: true, widthPercent: 18 }),
        createTableCell("Teknik Emanetçi (Custodian)", { isHeader: true, widthPercent: 14 }),
        createTableCell("Kritiklik / SoD", { isHeader: true, widthPercent: 10 }),
      ],
    });

    const assetRows: TableRow[] = dgSummary.assets.map((ast) => {
      const tags = [
        ast.masterData ? "Ana Veri" : null,
        ast.financialData ? "Finansal" : null,
        ast.personalData ? "KVKK" : null,
        ast.qualityOrSafetyData ? "Kalite/Güvenlik" : null,
      ].filter(Boolean).join(", ");

      const sodText = ast.hasSodRisk ? `\n⚠️ SoD: ${ast.sodRiskMessage || "Çatışma"}` : "";

      return new TableRow({
        children: [
          createTableCell(`${ast.assetName}${ast.domain ? `\n(${ast.domain})` : ""}${tags ? `\n[${tags}]` : ""}`, { bold: true }),
          createTableCell(`${ast.assetType}\n(${ast.systemOfRecord || "ERP"})`),
          createTableCell(ast.ownerRole || "Tanımsız", { bold: Boolean(ast.ownerRole) }),
          createTableCell(ast.stewardRole || "Tanımsız"),
          createTableCell(ast.technicalCustodianRole || "Tanımsız"),
          createTableCell(
            `${ast.criticality}${sodText}`,
            {
              bold: true,
              bgColor: ast.hasSodRisk ? "FEF2F2" : ast.criticality === "CRITICAL" ? "FFFBEB" : "FFFFFF",
              color: ast.hasSodRisk ? "B91C1C" : "334155",
            }
          ),
        ],
      });
    });

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [assetHeaderRow, ...assetRows],
      }),
      new Paragraph({ spacing: { after: 120 } })
    );

    // 5.2 Erişim ve Yetki Kuralları
    if (dgSummary.accessRules.length > 0) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
          children: [
            new TextRun({
              text: "5.2 Rol ve Grup Bazlı Erişim / Yetki Kuralları",
              bold: true,
              size: 22,
              color: COLOR_DARK,
              font: FONT_FAMILY,
            }),
          ],
        })
      );

      const accessHeaderRow = new TableRow({
        tableHeader: true,
        children: [
          createTableCell("Erişen Rol / Grup", { isHeader: true, widthPercent: 22 }),
          createTableCell("İlgili Veri Varlığı", { isHeader: true, widthPercent: 24 }),
          createTableCell("Erişim Seviyesi", { isHeader: true, widthPercent: 14 }),
          createTableCell("Organizasyon Kapsamı", { isHeader: true, widthPercent: 16 }),
          createTableCell("Onay Gereksinimi", { isHeader: true, widthPercent: 12 }),
          createTableCell("Limit / Çatışma Notu", { isHeader: true, widthPercent: 12 }),
        ],
      });

      const accessRows: TableRow[] = dgSummary.accessRules.map((acc) => {
        return new TableRow({
          children: [
            createTableCell(`${acc.actorName}\n(${acc.actorType})`, { bold: true }),
            createTableCell(`${acc.assetName}${acc.domain ? `\n(${acc.domain})` : ""}`),
            createTableCell(acc.accessLevel, { bold: true }),
            createTableCell(`${acc.scopeType}${acc.scopeValue ? `\n(${acc.scopeValue})` : ""}`),
            createTableCell(acc.approvalRequired ? `Onay Şartı\n(${acc.approvalRole || "Yönetici"})` : "Doğrudan"),
            createTableCell(
              [
                acc.taskSeparationRequired ? "⚠️ SoD Zorunlu" : null,
                acc.limitDescription || null,
                acc.conflictNote || null,
              ].filter(Boolean).join("\n") || "—",
              { bgColor: acc.taskSeparationRequired ? "FEF2F2" : "FFFFFF" }
            ),
          ],
        });
      });

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [accessHeaderRow, ...accessRows],
        }),
        new Paragraph({ spacing: { after: 120 } })
      );
    }

    // 5.3 Onay Kuralları ve Limit Kademeleri
    if (dgSummary.approvals.length > 0) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
          children: [
            new TextRun({
              text: "5.3 Onay Kuralları ve Limit Kademeleri",
              bold: true,
              size: 22,
              color: COLOR_DARK,
              font: FONT_FAMILY,
            }),
          ],
        })
      );

      const apprHeaderRow = new TableRow({
        tableHeader: true,
        children: [
          createTableCell("Sıra", { isHeader: true, widthPercent: 8 }),
          createTableCell("Onay Adı", { isHeader: true, widthPercent: 26 }),
          createTableCell("İlgili Varlık / Süreç", { isHeader: true, widthPercent: 26 }),
          createTableCell("Onaylayan Rol", { isHeader: true, widthPercent: 20 }),
          createTableCell("Eşik / Limit", { isHeader: true, widthPercent: 12 }),
          createTableCell("SoD", { isHeader: true, widthPercent: 8 }),
        ],
      });

      const apprRows: TableRow[] = dgSummary.approvals.map((appr) => {
        return new TableRow({
          children: [
            createTableCell(`${appr.approvalOrder}`, { bold: true }),
            createTableCell(`${appr.approvalName}${appr.mandatory ? "\n[Zorunlu Onay]" : ""}`, { bold: true }),
            createTableCell(`${appr.assetName || "—"}${appr.processMapName ? `\n(🗺️ ${appr.processMapName})` : ""}`),
            createTableCell(appr.approvalRole, { bold: true }),
            createTableCell(appr.thresholdDescription || "Tüm Tutarlar"),
            createTableCell(appr.separationOfDuties ? "Ayrılık Şart" : "—"),
          ],
        });
      });

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [apprHeaderRow, ...apprRows],
        }),
        new Paragraph({ spacing: { after: 120 } })
      );
    }

    // 5.4 Yönetişim ve SoD İlkesi Notu
    docChildren.push(
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "⚠️ Yönetişim ve Görevler Ayrılığı (SoD) İlkeleri: Veri varlığı sahibi, sorumlusu ve teknik emanetçisinin aynı role verilmesi kurumsal hata, tekil yetki suistimali ve denetim riskini artırır. Sistem bu durumları 'görevler ayrılığı değerlendirilmelidir' uyarısıyla raporlar. Bu matris yalnızca keşif ve danışmanlık amaçlı yönetişim modelini kaydeder; canlı kullanıcı hesabı veya parola yönetim sistemi içermez.",
            italics: true,
            size: 18,
            color: COLOR_PRIMARY,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  } else if (report.governance) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({
            text: "5. Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi",
            bold: true,
            size: 28,
            color: COLOR_PRIMARY,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  }

  // ── Section 6/5: Proje Notları & Açık Konular ───────────────────────────────
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
      children: [
        new TextRun({
          text: report.governance ? "6. Proje Notları & Açık Konular" : "5. Proje Notları & Açık Konular",
          bold: true,
          size: 28,
          color: COLOR_PRIMARY,
          font: FONT_FAMILY,
        }),
      ],
    })
  );


  // Açık Sorular ve Teyit Bekleyen Saha Başlıkları Tablosu (FAZ-9)
  if (report.followups && report.followups.length > 0) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: `Açık Sorular & Teyit Bekleyen Konular (${report.followups.length})`,
            bold: true,
            size: 22,
            color: "B45309",
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    const followupRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          createTableCell("Durum / Öncelik", { isHeader: true, widthPercent: 22, bgColor: "FEF3C7", color: "92400E" }),
          createTableCell("İş Fonksiyonu & Süreç", { isHeader: true, widthPercent: 28, bgColor: "FEF3C7", color: "92400E" }),
          createTableCell("Soru", { isHeader: true, widthPercent: 30, bgColor: "FEF3C7", color: "92400E" }),
          createTableCell("Takip Notu / Gerekçe", { isHeader: true, widthPercent: 20, bgColor: "FEF3C7", color: "92400E" }),
        ],
      }),
    ];

    for (const fol of report.followups) {
      const isCritical = fol.flagType === "critical";
      followupRows.push(
        new TableRow({
          children: [
            createTableCell(isCritical ? "🔴 Kritik Takip" : "🟡 Sonra Dön", {
              bgColor: isCritical ? "FEE2E2" : "FFFBEB",
              color: isCritical ? "991B1B" : "92400E",
              bold: true,
            }),
            createTableCell(`${fol.businessFunctionNameTr}\n(${fol.processName})`, {
              bgColor: "FFFFFF",
            }),
            createTableCell(`[${fol.questionId}]\n${fol.questionText}`, {
              bgColor: "FFFFFF",
              bold: true,
            }),
            createTableCell(fol.note || "Açıklama girilmedi.", {
              bgColor: "FFFFFF",
              italics: !fol.note,
            }),
          ],
        })
      );
    }

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: followupRows,
      }),
      new Paragraph({ spacing: { after: 180 } })
    );
  }

  if (profile.open_topics) {
    docChildren.push(
      createCalloutBox(
        "Açık Konular & Karar Bekleyen Başlıklar",
        profile.open_topics,
        COLOR_WARNING
      ),
      new Paragraph({ spacing: { after: 140 } })
    );
  }

  const globalNotes = projectNotes.filter((n) => !n.businessFunctionCode);
  if (globalNotes.length > 0) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [
          new TextRun({
            text: "Genel Proje Notları",
            bold: true,
            size: 21,
            color: COLOR_DARK,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
    for (const gn of globalNotes) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: 240 },
          children: [
            new TextRun({
              text: `• ${gn.note}`,
              size: 19,
              color: COLOR_DARK,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }
  }

  // 6. Kanıt Dokümanları ve Ekler Dizini (FAZ-33)
  if (report.attachments && report.attachments.length > 0) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 240, after: 80 },
        children: [
          new TextRun({
            text: `Kanıt Dokümanları ve Ekler Dizini (${report.attachments.length})`,
            bold: true,
            size: 22,
            color: COLOR_PRIMARY,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    const attachmentRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          createTableCell("İş Fonksiyonu / Süreç", { isHeader: true, widthPercent: 24 }),
          createTableCell("Soru", { isHeader: true, widthPercent: 30 }),
          createTableCell("Dosya Adı & Tür", { isHeader: true, widthPercent: 26 }),
          createTableCell("Açıklama", { isHeader: true, widthPercent: 20 }),
        ],
      }),
    ];

    for (const att of report.attachments) {
      const sizeStr =
        att.fileSize < 1024 * 1024
          ? `${(att.fileSize / 1024).toFixed(1)} KB`
          : `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`;
      // Windows: relative → appLocalDataDir → backslash absolute → file:/// RFC-8089 encode
      const fileUrl = att.fileUrl || await resolveAttachmentFileUrlFromRelative(att.relativePath);
      attachmentRows.push(
        new TableRow({
          children: [
            createTableCell(`${att.businessFunctionNameTr}\n(${att.processName})`, {
              bgColor: "FFFFFF",
            }),
            createTableCell(`[${att.questionId}]\n${att.questionText}`, {
              bgColor: "FFFFFF",
              bold: true,
            }),
            createAttachmentTableCell(
              att.originalFileName,
              fileUrl,
              att.fileExtension,
              sizeStr,
              att.relativePath
            ),
            createTableCell(att.description || "Açıklama girilmedi.", {
              bgColor: "FFFFFF",
              italics: !att.description,
            }),
          ],
        })
      );
    }

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: attachmentRows,
      }),
      new Paragraph({ spacing: { after: 180 } })
    );
  }

  // 7. Rapor Kapanış ve Atıf Notu (Sade ve Profesyonel)
  docChildren.push(
    new Paragraph({
      spacing: { before: 360, after: 60 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      },
      children: [
        new TextRun({
          text: "ERP CRM Discovery tarafından oluşturulmuştur.",
          size: 16,
          color: COLOR_MUTED,
          font: FONT_FAMILY,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "Geliştirici ve bakımcı: Selim Koçak  •  İletişim: selimkocak@gmail.com",
          size: 15,
          color: COLOR_MUTED,
          font: FONT_FAMILY,
        }),
      ],
    })
  );

  // Document Assembly with Headers & Footers
  const doc = new Document({
    creator: "ERP CRM Discovery",
    title: metadata.title,
    description: metadata.projectName,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1200,   // ~2.1 cm
              bottom: 1200,
              left: 1200,
              right: 1200,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${metadata.title} — ${company.companyName}`,
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `ERP CRM Discovery • ${metadata.generatedAt} • Sayfa `,
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT_FAMILY,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT_FAMILY,
                  }),
                  new TextRun({
                    text: " / ",
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT_FAMILY,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const arrayBuf = await blob.arrayBuffer();
  return new Uint8Array(arrayBuf);
}
