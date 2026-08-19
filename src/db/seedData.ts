/**
 * ERP CRM Discovery — Database Seed Data
 *
 * TEK KAYNAK: data/business-functions.json
 * (Generated consumer: src/generated/businessFunctions.ts)
 *
 * Bu dosya elle business function tanımlamaz; generate edilen registry'yi kullanır.
 */

import { BUSINESS_FUNCTION_REGISTRY } from "../generated/businessFunctions";

export interface SeedBusinessFunction {
  code: string;
  name_tr: string;
  name_en: string;
  category: string;
  sort_order: number;
}

/**
 * Canonical registry'den türetilen seed listesi.
 * `category` alanı Türkçe kategori adını kullanır (DB standardı).
 */
export const INITIAL_BUSINESS_FUNCTIONS: SeedBusinessFunction[] =
  BUSINESS_FUNCTION_REGISTRY
    .filter((bf) => bf.is_active)
    .map((bf) => ({
      code: bf.code,
      name_tr: bf.name_tr,
      name_en: bf.name_en,
      category: bf.category_tr,
      sort_order: bf.sort_order,
    }));
