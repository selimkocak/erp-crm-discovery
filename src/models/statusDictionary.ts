/**
 * ERP CRM Discovery — Centralized Status Dictionary & Normalizer
 * FAZ-55: Platform Tutarlılığı, Semantik Durum Sözlüğü ve Normalizasyon Motoru
 *
 * MİMARİ İLKELER:
 * 1. Tek Doğruluk Kaynağı: Bulgu, Gereksinim, Risk ve Not durumları için tek sözlük.
 * 2. Platform ve Büyük/Küçük Harf Tutarlılığı: trim(), lowercase, tire/alt çizgi normalizasyonu.
 * 3. Geriye Dönük Uyumluluk (Legacy Support): Eski/farklı veritabanı durum değerlerini tanıma.
 * 4. Kayıt Gizlememe Garantisi: Bilinmeyen durumlar asla filtre dışı bırakılmaz; ham değeriyle gösterilir ve konsola uyarı basılır.
 * 5. Tümü Sekmesi Bütünlüğü: Tümü = Bulgular + Gereksinimler + Riskler + Notlar.
 */

import type { SemanticRecordType } from "../types";

export interface StatusMetadata {
  value: string;
  label: string;
  colorClass: string;
  badgeClass: string;
  isOpen: boolean;
  recordType: SemanticRecordType;
  isUnknown?: boolean;
}

const warnedUnknownStatuses = new Set<string>();

/**
 * Durum değerini normalize eder (trim, lowercase, boşluk/tire -> alt çizgi).
 */
export function normalizeStatusString(raw: string | null | undefined): string {
  if (!raw) return "";
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]/g, ""); // Türkçe ve standart karakterleri korur
}

export const normalizeStatus = normalizeStatusString;

// ─────────────────────────────────────────────────────────────
// Canonical Status Lists
// ─────────────────────────────────────────────────────────────
export const CANONICAL_FINDING_STATUSES = ["open", "confirmed", "resolved"] as const;
export const CANONICAL_REQUIREMENT_STATUSES = ["draft", "confirmed", "out_of_scope", "implemented"] as const;
export const CANONICAL_RISK_STATUSES = ["open", "mitigated", "accepted", "closed"] as const;
export const CANONICAL_NOTE_STATUSES = ["active", "closed"] as const;

// ─────────────────────────────────────────────────────────────
// 1. Bulgular (Findings) Durum Haritası
// ─────────────────────────────────────────────────────────────
const FINDING_STATUS_MAP: Record<string, { label: string; colorClass: string; isOpen: boolean }> = {
  open: { label: "Açık", colorClass: "badge--outline-warning", isOpen: true },
  acik: { label: "Açık", colorClass: "badge--outline-warning", isOpen: true },
  açık: { label: "Açık", colorClass: "badge--outline-warning", isOpen: true },
  aktif: { label: "Açık", colorClass: "badge--outline-warning", isOpen: true },
  active: { label: "Açık", colorClass: "badge--outline-warning", isOpen: true },
  pending: { label: "Açık", colorClass: "badge--outline-warning", isOpen: true },
  todo: { label: "Açık", colorClass: "badge--outline-warning", isOpen: true },
  new: { label: "Yeni", colorClass: "badge--outline-warning", isOpen: true },
  yeni: { label: "Yeni", colorClass: "badge--outline-warning", isOpen: true },

  confirmed: { label: "Teyit Edildi", colorClass: "badge--primary", isOpen: true },
  teyit_edildi: { label: "Teyit Edildi", colorClass: "badge--primary", isOpen: true },
  teyit: { label: "Teyit Edildi", colorClass: "badge--primary", isOpen: true },
  in_review: { label: "İnceleniyor", colorClass: "badge--primary", isOpen: true },
  inceleniyor: { label: "İnceleniyor", colorClass: "badge--primary", isOpen: true },
  onaylandi: { label: "Teyit Edildi", colorClass: "badge--primary", isOpen: true },
  approved: { label: "Teyit Edildi", colorClass: "badge--primary", isOpen: true },

  resolved: { label: "Çözüldü", colorClass: "badge--success", isOpen: false },
  cozuldu: { label: "Çözüldü", colorClass: "badge--success", isOpen: false },
  çözüldü: { label: "Çözüldü", colorClass: "badge--success", isOpen: false },
  closed: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  kapali: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  kapatildi: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  kapatıldı: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  tamamlandi: { label: "Tamamlandı", colorClass: "badge--success", isOpen: false },
  tamamlandı: { label: "Tamamlandı", colorClass: "badge--success", isOpen: false },
  done: { label: "Çözüldü", colorClass: "badge--success", isOpen: false },
};

// ─────────────────────────────────────────────────────────────
// 2. Gereksinimler (Requirements) Durum Haritası
// ─────────────────────────────────────────────────────────────
const REQUIREMENT_STATUS_MAP: Record<string, { label: string; colorClass: string; isOpen: boolean }> = {
  draft: { label: "Taslak", colorClass: "badge--outline-secondary", isOpen: true },
  taslak: { label: "Taslak", colorClass: "badge--outline-secondary", isOpen: true },
  new: { label: "Taslak", colorClass: "badge--outline-secondary", isOpen: true },
  yeni: { label: "Taslak", colorClass: "badge--outline-secondary", isOpen: true },
  acik: { label: "Taslak", colorClass: "badge--outline-secondary", isOpen: true },
  açık: { label: "Taslak", colorClass: "badge--outline-secondary", isOpen: true },

  confirmed: { label: "Kapsamda", colorClass: "badge--success", isOpen: true },
  kapsamda: { label: "Kapsamda", colorClass: "badge--success", isOpen: true },
  in_scope: { label: "Kapsamda", colorClass: "badge--success", isOpen: true },
  onaylandi: { label: "Kapsamda", colorClass: "badge--success", isOpen: true },
  onaylandı: { label: "Kapsamda", colorClass: "badge--success", isOpen: true },
  approved: { label: "Kapsamda", colorClass: "badge--success", isOpen: true },

  out_of_scope: { label: "Kapsam Dışı", colorClass: "badge--outline-danger", isOpen: false },
  kapsam_disi: { label: "Kapsam Dışı", colorClass: "badge--outline-danger", isOpen: false },
  kapsam_dışı: { label: "Kapsam Dışı", colorClass: "badge--outline-danger", isOpen: false },
  kapsamdisi: { label: "Kapsam Dışı", colorClass: "badge--outline-danger", isOpen: false },
  kapsamdışı: { label: "Kapsam Dışı", colorClass: "badge--outline-danger", isOpen: false },
  iptal: { label: "Kapsam Dışı", colorClass: "badge--outline-danger", isOpen: false },
  rejected: { label: "Reddedildi", colorClass: "badge--outline-danger", isOpen: false },

  implemented: { label: "Karşılandı", colorClass: "badge--info", isOpen: false },
  karsilandi: { label: "Karşılandı", colorClass: "badge--info", isOpen: false },
  karşılandı: { label: "Karşılandı", colorClass: "badge--info", isOpen: false },
  tamamlandi: { label: "Karşılandı", colorClass: "badge--info", isOpen: false },
  tamamlandı: { label: "Karşılandı", colorClass: "badge--info", isOpen: false },
  completed: { label: "Karşılandı", colorClass: "badge--info", isOpen: false },
  done: { label: "Karşılandı", colorClass: "badge--info", isOpen: false },
};

// ─────────────────────────────────────────────────────────────
// 3. Riskler (Risks) Durum Haritası
// ─────────────────────────────────────────────────────────────
const RISK_STATUS_MAP: Record<string, { label: string; colorClass: string; isOpen: boolean }> = {
  open: { label: "Açık Risk", colorClass: "badge--danger", isOpen: true },
  open_risk: { label: "Açık Risk", colorClass: "badge--danger", isOpen: true },
  acik: { label: "Açık Risk", colorClass: "badge--danger", isOpen: true },
  açık: { label: "Açık Risk", colorClass: "badge--danger", isOpen: true },
  acik_risk: { label: "Açık Risk", colorClass: "badge--danger", isOpen: true },
  açık_risk: { label: "Açık Risk", colorClass: "badge--danger", isOpen: true },
  active: { label: "Açık Risk", colorClass: "badge--danger", isOpen: true },
  aktif: { label: "Açık Risk", colorClass: "badge--danger", isOpen: true },
  pending: { label: "Açık Risk", colorClass: "badge--danger", isOpen: true },

  mitigated: { label: "Önlem Alındı", colorClass: "badge--info", isOpen: false },
  onlem_alindi: { label: "Önlem Alındı", colorClass: "badge--info", isOpen: false },
  önlem_alındı: { label: "Önlem Alındı", colorClass: "badge--info", isOpen: false },
  onlem: { label: "Önlem Alındı", colorClass: "badge--info", isOpen: false },
  önlem: { label: "Önlem Alındı", colorClass: "badge--info", isOpen: false },
  kontrol_altinda: { label: "Önlem Alındı", colorClass: "badge--info", isOpen: false },
  kontrol_altında: { label: "Önlem Alındı", colorClass: "badge--info", isOpen: false },

  accepted: { label: "Kabul Edildi", colorClass: "badge--warning", isOpen: false },
  kabul_edildi: { label: "Kabul Edildi", colorClass: "badge--warning", isOpen: false },
  kabul: { label: "Kabul Edildi", colorClass: "badge--warning", isOpen: false },
  tolerated: { label: "Kabul Edildi", colorClass: "badge--warning", isOpen: false },

  closed: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  kapatildi: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  kapatıldı: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  kapali: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  kapalı: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  resolved: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  cozuldu: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
  çözüldü: { label: "Kapatıldı", colorClass: "badge--success", isOpen: false },
};

// ─────────────────────────────────────────────────────────────
// 4. Proje Notları (Notes) Durum Haritası
// ─────────────────────────────────────────────────────────────
const NOTE_STATUS_MAP: Record<string, { label: string; colorClass: string; isOpen: boolean }> = {
  active: { label: "Aktif", colorClass: "badge--outline-secondary", isOpen: true },
  aktif: { label: "Aktif", colorClass: "badge--outline-secondary", isOpen: true },
  open: { label: "Aktif", colorClass: "badge--outline-secondary", isOpen: true },
  acik: { label: "Aktif", colorClass: "badge--outline-secondary", isOpen: true },
  açık: { label: "Aktif", colorClass: "badge--outline-secondary", isOpen: true },
  note: { label: "Aktif", colorClass: "badge--outline-secondary", isOpen: true },
  not: { label: "Aktif", colorClass: "badge--outline-secondary", isOpen: true },

  closed: { label: "Kapatıldı", colorClass: "badge--muted", isOpen: false },
  kapatildi: { label: "Kapatıldı", colorClass: "badge--muted", isOpen: false },
  kapatıldı: { label: "Kapatıldı", colorClass: "badge--muted", isOpen: false },
  kapali: { label: "Kapatıldı", colorClass: "badge--muted", isOpen: false },
  kapalı: { label: "Kapatıldı", colorClass: "badge--muted", isOpen: false },
  archived: { label: "Arşivlendi", colorClass: "badge--muted", isOpen: false },
  arsiv: { label: "Arşivlendi", colorClass: "badge--muted", isOpen: false },
  arşiv: { label: "Arşivlendi", colorClass: "badge--muted", isOpen: false },
};

/**
 * Belirtilen kayıt türü ve durum metni için metadata döndürür.
 * Bilinmeyen durum değerlerinde kaydı gizlemez, güvenli etiket üretir ve konsola uyarı basar.
 */
export function getStatusMetadata(
  recordType: SemanticRecordType,
  rawStatus: string | null | undefined
): StatusMetadata {
  const norm = normalizeStatusString(rawStatus);

  let map: Record<string, { label: string; colorClass: string; isOpen: boolean }> = FINDING_STATUS_MAP;
  let fallbackLabel = "Açık";
  let fallbackColor = "badge--outline-secondary";

  switch (recordType) {
    case "finding":
      map = FINDING_STATUS_MAP;
      fallbackLabel = "Açık";
      break;
    case "requirement":
      map = REQUIREMENT_STATUS_MAP;
      fallbackLabel = "Taslak";
      break;
    case "risk":
      map = RISK_STATUS_MAP;
      fallbackLabel = "Açık Risk";
      fallbackColor = "badge--danger";
      break;
    case "note":
      map = NOTE_STATUS_MAP;
      fallbackLabel = "Aktif";
      break;
  }

  // Boş veya tanımsız ise varsayılan açık döner
  if (!norm) {
    return {
      value: "open",
      label: fallbackLabel,
      colorClass: fallbackColor,
      badgeClass: fallbackColor,
      isOpen: true,
      recordType,
    };
  }

  const found = map[norm];
  if (found) {
    return {
      value: norm,
      label: found.label,
      colorClass: found.colorClass,
      badgeClass: found.colorClass,
      isOpen: found.isOpen,
      recordType,
    };
  }

  // Bilinmeyen durum değeri: Kayıt gizlenmez, etiket normalize edilmiş ham değer yapılır
  const warnKey = `${recordType}:${norm}`;
  if (!warnedUnknownStatuses.has(warnKey)) {
    console.warn(`[StatusDictionary] Bilinmeyen durum değeri (${recordType}): "${rawStatus}" (norm: "${norm}")`);
    warnedUnknownStatuses.add(warnKey);
  }

  const displayLabel = rawStatus && rawStatus.trim() ? rawStatus.trim() : norm;

  return {
    value: norm,
    label: displayLabel,
    colorClass: "badge--outline-secondary",
    badgeClass: "badge--outline-secondary",
    isOpen: true,
    recordType,
    isUnknown: true,
  };
}

export const getStatusMeta = getStatusMetadata;

export function getStatusLabel(
  recordType: SemanticRecordType,
  rawStatus: string | null | undefined
): string {
  return getStatusMetadata(recordType, rawStatus).label;
}

export function getStatusBadgeClass(
  recordType: SemanticRecordType,
  rawStatus: string | null | undefined
): string {
  return getStatusMetadata(recordType, rawStatus).badgeClass;
}

/**
 * Belirtilen durumun açık (open/in-scope/active) olup olmadığını kontrol eder.
 */
export function isStatusOpen(
  recordType: SemanticRecordType,
  rawStatus: string | null | undefined
): boolean {
  return getStatusMetadata(recordType, rawStatus).isOpen;
}

/**
 * Formlar için standart durum seçeneklerini döndürür.
 */
export function getStandardStatusOptions(recordType: SemanticRecordType): { value: string; label: string }[] {
  switch (recordType) {
    case "finding":
      return [
        { value: "open", label: "Açık" },
        { value: "confirmed", label: "Teyit Edildi" },
        { value: "resolved", label: "Çözüldü" },
      ];
    case "requirement":
      return [
        { value: "draft", label: "Taslak" },
        { value: "confirmed", label: "Kapsamda" },
        { value: "out_of_scope", label: "Kapsam Dışı" },
        { value: "implemented", label: "Karşılandı" },
      ];
    case "risk":
      return [
        { value: "open", label: "Açık Risk" },
        { value: "mitigated", label: "Önlem Alındı" },
        { value: "accepted", label: "Kabul Edildi" },
        { value: "closed", label: "Kapatıldı" },
      ];
    case "note":
      return [
        { value: "active", label: "Aktif" },
        { value: "closed", label: "Kapatıldı / Arşiv" },
      ];
  }
}
