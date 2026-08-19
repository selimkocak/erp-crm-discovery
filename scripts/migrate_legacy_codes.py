#!/usr/bin/env python3
"""
ERP CRM Discovery — Production DB Legacy → Canonical Code Migration

SCOPE NOTICE:
Development / legacy database maintenance tool.
Not part of application startup migration pipeline.

Çalıştır: python3 scripts/migrate_legacy_codes.py

Bu script idempotent'tir: birden fazla çalıştırılabilir.
Canonical code zaten ayarlanmışsa hiçbir şey yapmaz.
Transaction içinde çalışır — hata durumunda rollback yapılır.
"""

import sqlite3
import os
import sys
from datetime import datetime

DB_PATH = os.path.expanduser("~/.local/share/com.erpcrm.discovery/erp_discovery.db")

# Legacy → Canonical mapping (data/business-functions.json'dan türetilmiştir)
LEGACY_TO_CANONICAL = {
    "GENEL_YNT":  "MANAGEMENT",
    "STRTJK_PLN": "STRATEGY",
    "IK_YNT":     "HUMAN_RESOURCES",
    "BRDJ_PLN":   "PAYROLL",
    "EGITIM_GLS": "TRAINING",
    "MUH_GNL":    "ACCOUNTING",
    "BGJL_YNT":   "BUDGET_REPORTING",
    "KAS_YNT":    "TREASURY",
    "STOK_YNT":   "INVENTORY",
    "DEPO_YNT":   "WAREHOUSE",
    "SEVK_YNT":   "LOGISTICS",
    "SATIN_YNT":  "PROCUREMENT",
    "TEDR_YNT":   "SUPPLIER_MANAGEMENT",
    "SATIS_YNT":  "SALES",
    "MJT_YNT":    "CRM",
    "TKF_YNT":    "PROPOSALS",
    "PZRLM_YNT":  "MARKETING",
    "URETIM_PLN": "PRODUCTION_PLANNING",
    "IS_EMR":     "WORK_ORDERS",
    "KAL_KNT":    "QUALITY",
    "BKM_YNT":    "MAINTENANCE",
    "FATURA_GDR": "INVOICING",
    "PROJ_YNT":   "PROJECT_MANAGEMENT",
    "ITHALAT":    "IMPORT",
    "IHRACAT":    "EXPORT",
    "E_TICARET":  "ECOMMERCE",
    "VARLIK_YNT": "ASSET_MANAGEMENT",
    "BELGE_YNT":  "DOCUMENT_MANAGEMENT",
    "IT_ALTYAP":  "INFORMATION_TECHNOLOGY",
    "HUKUK_UYM":  "LEGAL_COMPLIANCE",
    "RPRLY_ANL":  "REPORTING_ANALYTICS",
}


def migrate(db_path: str) -> None:
    if not os.path.exists(db_path):
        print(f"DB bulunamadı: {db_path}")
        print("Uygulama hiç çalıştırılmamış olabilir. Migration gerekmiyor.")
        return

    con = sqlite3.connect(db_path)
    con.execute("PRAGMA foreign_keys = OFF")  # Migration süresince FK kapat

    try:
        # Mevcut kodları oku
        existing = {
            row[0]: row[1]
            for row in con.execute("SELECT code, id FROM business_functions")
        }

        updates_bf = 0
        updates_qa = 0
        updates_qss = 0
        updates_pbf = 0
        skipped = 0

        with con:  # transaction
            for legacy_code, canonical_code in LEGACY_TO_CANONICAL.items():
                if legacy_code not in existing:
                    # Zaten canonical veya hiç yok
                    if canonical_code not in existing:
                        skipped += 1
                    continue

                old_id = existing[legacy_code]
                new_id = f"bf_{canonical_code.lower()}"

                # ── 1. project_business_functions (FK güncelle) ─────────────
                pbf_count = con.execute(
                    "UPDATE project_business_functions SET business_function_id=? WHERE business_function_id=?",
                    (new_id, old_id)
                ).rowcount
                updates_pbf += pbf_count

                # ── 2. question_answers ──────────────────────────────────────
                qa_count = con.execute(
                    "UPDATE question_answers SET business_function_code=? WHERE business_function_code=?",
                    (canonical_code, legacy_code)
                ).rowcount
                updates_qa += qa_count

                # ── 3. question_session_state ────────────────────────────────
                qss_count = con.execute(
                    "UPDATE question_session_state SET business_function_code=? WHERE business_function_code=?",
                    (canonical_code, legacy_code)
                ).rowcount
                updates_qss += qss_count

                # ── 4. business_functions (PK + code güncelle) ──────────────
                con.execute(
                    "UPDATE business_functions SET id=?, code=? WHERE code=?",
                    (new_id, canonical_code, legacy_code)
                )
                updates_bf += 1
                print(f"  ✓ {legacy_code:15s} → {canonical_code}")

            if skipped:
                print(f"  (zaten canonical: {skipped} kayıt atlandı)")

        con.execute("PRAGMA foreign_keys = ON")

        print(f"\nMigration özeti:")
        print(f"  business_functions güncellemesi: {updates_bf}")
        print(f"  project_business_functions FK:   {updates_pbf}")
        print(f"  question_answers:                {updates_qa}")
        print(f"  question_session_state:          {updates_qss}")

        # Doğrulama
        final_count = con.execute("SELECT COUNT(*) FROM business_functions").fetchone()[0]
        sales_row = con.execute(
            "SELECT code, name_tr FROM business_functions WHERE code='SALES'"
        ).fetchone()

        print(f"\nDoğrulama:")
        print(f"  Toplam business_functions: {final_count}")
        if sales_row:
            print(f"  SALES: {sales_row[1]} ✓")
        else:
            print("  SALES: BULUNAMADI ✗")

    except Exception as e:
        print(f"HATA: {e}")
        con.rollback()
        sys.exit(1)
    finally:
        con.close()


if __name__ == "__main__":
    print(f"=== Legacy → Canonical Migration ===")
    print(f"DB: {DB_PATH}")
    print(f"Tarih: {datetime.now().isoformat()}")
    print()
    migrate(DB_PATH)
    print("\nMigration tamamlandı.")
