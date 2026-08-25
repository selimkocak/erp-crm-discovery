/**
 * ERP CRM Discovery — Repository Factory & Environment Detection
 *
 * Çalışma ortamını (Tauri Desktop vs Browser Test Mode) tespit eder
 * ve uygun AppRepository singleton örneğini döndürür.
 */

import type { AppRepository } from "./AppRepository";
import { TauriRepository } from "./TauriRepository";
import { BrowserTestRepository } from "./BrowserTestRepository";

/**
 * Çalışma ortamının gerçek bir Tauri Masaüstü kabuğu olup olmadığını tespit eder.
 */
export function isTauriEnvironment(): boolean {
  // Node.js / tsx ortamında çalışan testler için SQLite (TauriRepository) varsayılandır
  if (typeof window === "undefined") {
    return true;
  }

  // Açıkça VITE_BROWSER_TEST_MODE belirtilmişse tarayıcı moduna zorla
  try {
    if (
      typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_BROWSER_TEST_MODE === "true"
    ) {
      return false;
    }
  } catch {
    // import.meta erişimi olmayan ortamlar için yutulur
  }

  if ((window as any).__VITE_BROWSER_TEST_MODE__ === true) {
    return false;
  }

  // Resmi Tauri 2 IPC ve runtime kontrolleri
  return Boolean(
    (window as any).__TAURI_INTERNALS__ ||
    (window as any).__TAURI__ ||
    (window as any).__TAURI_METADATA__
  );
}

let repositoryInstance: AppRepository | null = null;

/**
 * Aktif çalışma ortamına uygun AppRepository örneğini singleton olarak döndürür.
 */
export function getRepository(): AppRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  if (isTauriEnvironment()) {
    repositoryInstance = new TauriRepository();
  } else {
    console.info("[ERP Discovery] Browser Test Mode aktif — BrowserTestRepository yüklendi.");
    repositoryInstance = new BrowserTestRepository();
  }

  return repositoryInstance as AppRepository;
}

/**
 * Testler ve özel harness senaryoları için repository örneğini değiştirir / sıfırlar.
 */
export function setRepositoryForTesting(repo: AppRepository | null): void {
  repositoryInstance = repo;
}
