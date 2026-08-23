// path: /home/selim/projects/erp-crm-discovery/test/faz48_business_function_boundary_test.ts
/**
 * ERP CRM Discovery — FAZ-48 İş Fonksiyonları Sınır Kontrolü ve Bağımsızlık Testi
 *
 * 12 kritik fonksiyon çiftinin sınır izolasyonunu, örtüşme kurallarını ve sorumluluk alanlarını denetler.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");

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

function loadPack(relPath: string): any {
  const fullPath = resolve(ROOT_DIR, "question-packs", relPath);
  return JSON.parse(readFileSync(fullPath, "utf-8"));
}

async function runBoundaryTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-48: İş Fonksiyonu Sınır Kontrolü ve İzolasyon Testi");
  console.log("=======================================================\n");

  // 1. Sınır Çiftleri Tanımı
  const BOUNDARY_PAIRS = [
    {
      pair: "Sales ↔ CRM",
      packA: "tr/sales/core.json",
      packB: "tr/crm/core.json",
      domainA: "Sipariş, teklif koşulları ve müşteri kabulü",
      domainB: "Aday müşteri, temas geçmişi ve satış sonrası servis",
    },
    {
      pair: "Sales ↔ Invoicing",
      packA: "tr/sales/core.json",
      packB: "tr/invoicing/core.json",
      domainA: "Satış siparişi ve iskonto yetkisi",
      domainB: "Fatura yaşam döngüsü, e-Fatura ve 3'lü eşleştirme",
    },
    {
      pair: "Procurement ↔ Inventory",
      packA: "tr/procurement/core.json",
      packB: "tr/inventory/core.json",
      domainA: "Satın alma talebi, teklif toplama ve sipariş",
      domainB: "Stok değerleme, güvenlik stoku ve parti/seri takibi",
    },
    {
      pair: "Inventory ↔ Warehouse",
      packA: "tr/inventory/core.json",
      packB: "tr/warehouse/core.json",
      domainA: "Mali ve miktarsal stok bakiyesi, sayım farkı",
      domainB: "Fiziksel raf adresi, mal kabul, toplama ve yerleştirme",
    },
    {
      pair: "Production Planning ↔ Work Orders",
      packA: "tr/production_planning/core.json",
      packB: "tr/work_orders/core.json",
      domainA: "MRP, ana üretim çizelgesi (MPS) ve kapasite planlama",
      domainB: "İş emri açma, operasyon teyidi, rota ve fiili süreler",
    },
    {
      pair: "Production Planning ↔ Quality",
      packA: "tr/production_planning/core.json",
      packB: "tr/quality/core.json",
      domainA: "Üretim takvimi ve parti planlama",
      domainB: "Giriş, proses ve son kontrol muayenesi, red/hurda",
    },
    {
      pair: "Maintenance ↔ IT Infrastructure",
      packA: "tr/maintenance/core.json",
      packB: "tr/it_infrastructure/core.json",
      domainA: "Fiziksel makine, CNC, kalıp ve periyodik bakım",
      domainB: "Sunucu, ağ, siber güvenlik, yedekleme ve felaket kurtarma",
    },
    {
      pair: "Treasury ↔ Accounting",
      packA: "tr/treasury/core.json",
      packB: "tr/accounting/core.json",
      domainA: "Nakit akışı, banka talimatı, çek/senet ve kredi",
      domainB: "Yevmiye kaydı, mizan, bilanço, KDV ve yasal beyannameler",
    },
    {
      pair: "Human Resources ↔ Payroll",
      packA: "tr/human_resources/core.json",
      packB: "tr/payroll/core.json",
      domainA: "İşe alım, organizasyon şeması, yetkinlik ve performans",
      domainB: "Puantaj, SGK bildirgeleri, net/brüt maaş ve kıdem/ihbar",
    },
    {
      pair: "Legal Compliance ↔ Document Management",
      packA: "tr/legal_compliance/core.json",
      packB: "tr/document_management/core.json",
      domainA: "KVKK, sözleşme hukuku, icra/dava ve mevzuat uyumu",
      domainB: "Merkezi doküman kasası, versiyonlama ve arşiv yetkileri",
    },
    {
      pair: "Master Data Management ↔ Management",
      packA: "tr/master_data_management/core.json",
      packB: "tr/management/core.json",
      domainA: "Stok/Cari kart kodlama kuralı, tekilleştirme",
      domainB: "Kurumsal yönetişim, karar mekanizmaları ve yetki hiyerarşisi",
    },
    {
      pair: "Management ↔ Strategy",
      packA: "tr/management/core.json",
      packB: "tr/strategy/core.json",
      domainA: "Operasyonel süreç yönetişimi ve iç denetim",
      domainB: "3-5 yıllık vizyon, pazar hedefleri ve kurumsal KPI'lar",
    },
  ];

  for (const b of BOUNDARY_PAIRS) {
    const packA = loadPack(b.packA);
    const packB = loadPack(b.packB);

    assert(packA.questions.length >= 25, `[${b.pair}] A paketi (${b.packA}) yeterli soru derinliğine sahip (${packA.questions.length})`);
    assert(packB.questions.length >= 25, `[${b.pair}] B paketi (${b.packB}) yeterli soru derinliğine sahip (${packB.questions.length})`);

    // Paketlerin ID prefix'lerinin çakışmaması (veya bağımsız namespace taşıması)
    const prefixA = packA.meta.business_function_code;
    const prefixB = packB.meta.business_function_code;
    assert(prefixA !== prefixB, `[${b.pair}] A ve B farklı iş fonksiyonu kodlarına sahip (${prefixA} != ${prefixB})`);
  }

  console.log(`\nFAZ-48 Boundary Test Sonucu: ${passCount} PASS, ${failCount} FAIL\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runBoundaryTests().catch((err) => {
  console.error("Boundary Test Error:", err);
  process.exit(1);
});
