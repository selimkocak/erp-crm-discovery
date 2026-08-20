import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckSquare, Square, Building, Briefcase } from "lucide-react";
import { getMasterBusinessFunctions, createProject } from "../db/client";
import { hasQuestionPack } from "../engine/loader";
import type { BusinessFunction, CreateProjectPayload } from "../types";

interface NewProjectViewProps {
  onCancel: () => void;
  onProjectCreated: (projectId: string) => void;
}

export const NewProjectView: React.FC<NewProjectViewProps> = ({
  onCancel,
  onProjectCreated,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [projectName, setProjectName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [tradeName, setTradeName] = useState<string>("");
  const [taxNumber, setTaxNumber] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("Türkiye");
  const [employeeCount, setEmployeeCount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Functions Selection
  const [allFunctions, setAllFunctions] = useState<BusinessFunction[]>([]);
  const [selectedFunctionIds, setSelectedFunctionIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoadingFunctions, setIsLoadingFunctions] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setIsLoadingFunctions(true);
        const data = await getMasterBusinessFunctions();
        setAllFunctions(data);
      } catch (err: any) {
        console.error("Fonksiyonlar yüklenirken hata:", err);
      } finally {
        setIsLoadingFunctions(false);
      }
    };
    loadMasterData();
  }, []);

  // Validation
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setErrorMessage("Lütfen analiz / proje adını belirtin.");
      return;
    }
    if (!companyName.trim()) {
      setErrorMessage("Lütfen firma adını belirtin.");
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const toggleFunctionSelection = (id: string) => {
    setSelectedFunctionIds((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedFunctionIds(allFunctions.map((f) => f.id));
  };

  const handleClearAll = () => {
    setSelectedFunctionIds([]);
  };

  const handleSubmit = async () => {
    if (selectedFunctionIds.length === 0) {
      alert("Lütfen analiz kapsamına alınacak en az bir iş fonksiyonu seçin.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload: CreateProjectPayload = {
        projectName: projectName.trim(),
        company: {
          company_name: companyName.trim(),
          trade_name: tradeName.trim() || undefined,
          tax_number: taxNumber.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || "Türkiye",
          employee_count: employeeCount.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        selectedFunctionIds,
      };

      const newProjectId = await createProject(payload);
      onProjectCreated(newProjectId);
    } catch (err: any) {
      console.error("Proje kaydedilirken hata:", err);
      setErrorMessage(err?.message || "Proje veritabanına kaydedilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categories list
  const categories = Array.from(new Set(allFunctions.map((f) => f.category)));
  const filteredFunctions =
    selectedCategory === "all"
      ? allFunctions
      : allFunctions.filter((f) => f.category === selectedCategory);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Step Indicator */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: step === 1 ? "var(--primary-subtle)" : "var(--bg-surface)",
            border: `1px solid ${step === 1 ? "var(--primary-border)" : "var(--border-subtle)"}`,
            color: step === 1 ? "var(--primary)" : "var(--text-muted)",
          }}
        >
          <div
            style={{
              width: "1.75rem",
              height: "1.75rem",
              borderRadius: "50%",
              backgroundColor: step === 1 ? "var(--primary)" : "var(--border-medium)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            1
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Firma Profili</div>
            <div style={{ fontSize: "0.75rem" }}>Temel şirket ve proje bilgileri</div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: step === 2 ? "var(--primary-subtle)" : "var(--bg-surface)",
            border: `1px solid ${step === 2 ? "var(--primary-border)" : "var(--border-subtle)"}`,
            color: step === 2 ? "var(--primary)" : "var(--text-muted)",
          }}
        >
          <div
            style={{
              width: "1.75rem",
              height: "1.75rem",
              borderRadius: "50%",
              backgroundColor: step === 2 ? "var(--primary)" : "var(--border-medium)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            2
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>İş Fonksiyonu Seçimi</div>
            <div style={{ fontSize: "0.75rem" }}>Analiz kapsamındaki departmanlar</div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            backgroundColor: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            color: "var(--danger-text)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.25rem",
            fontSize: "0.875rem",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Step 1: Firma Profili */}
      {step === 1 && (
        <form onSubmit={handleProceedToStep2} className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Building size={20} style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Firma ve Proje Künyesi</h3>
          </div>

          <div className="form-group">
            <label htmlFor="projectName">
              Analiz / Proje Adı <span className="required">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              className="form-control"
              placeholder="Örn: 2026 ERP & CRM Ön Değerlendirme Analizi"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="companyName">
                Firma Adı <span className="required">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                className="form-control"
                placeholder="Örn: Akın Makina San. ve Tic. A.Ş."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tradeName">Ticari Unvan / Marka</label>
              <input
                id="tradeName"
                type="text"
                className="form-control"
                placeholder="Örn: Akın Machinery"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="taxNumber">Vergi Numarası / Dairesi</label>
              <input
                id="taxNumber"
                type="text"
                className="form-control"
                placeholder="Örn: 1234567890 - Zincirlikuyu VD"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="employeeCount">Çalışan Sayısı Aralığı</label>
              <select
                id="employeeCount"
                className="form-control"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
              >
                <option value="">Seçiniz</option>
                <option value="1-20">1 - 20 Çalışan</option>
                <option value="21-50">21 - 50 Çalışan</option>
                <option value="51-250">51 - 250 Çalışan</option>
                <option value="251-1000">251 - 1000 Çalışan</option>
                <option value="1000+">1000+ Çalışan</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">Şehir</label>
              <input
                id="city"
                type="text"
                className="form-control"
                placeholder="Örn: İstanbul / Bursa"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Ülke</label>
              <input
                id="country"
                type="text"
                className="form-control"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Firma ve Proje Notları / Arka Plan</label>
            <textarea
              id="notes"
              className="form-control"
              placeholder="Mevcut kullanılan yazılımlar, analiz hedefleri veya özel notlar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              Devam Et
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Step 2: İş Fonksiyonu Seçimi */}
      {step === 2 && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Briefcase size={20} style={{ color: "var(--primary)" }} />
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>İş Fonksiyonlarını Seçin</h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  {projectName} — {companyName}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: selectedFunctionIds.length > 0 ? "var(--primary)" : "var(--text-muted)",
                  backgroundColor: "var(--primary-subtle)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--primary-border)",
                }}
              >
                {selectedFunctionIds.length} / {allFunctions.length} Fonksiyon Seçildi
              </span>
            </div>
          </div>

          {/* Quick Selection Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "1rem 0" }}>
            <div className="category-filter-bar">
              <button
                className={`filter-chip ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                Tümü ({allFunctions.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-chip ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                onClick={handleSelectAll}
              >
                <CheckSquare size={14} />
                Tümünü Seç
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                onClick={handleClearAll}
              >
                <Square size={14} />
                Temizle
              </button>
            </div>
          </div>

          {/* Grid of Business Functions */}
          {isLoadingFunctions ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              İş fonksiyonları yükleniyor...
            </p>
          ) : (
            <div className="function-grid">
              {filteredFunctions.map((fn) => {
                const isSelected = selectedFunctionIds.includes(fn.id);
                return (
                  <div
                    key={fn.id}
                    className={`function-card ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleFunctionSelection(fn.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by container onClick
                    />
                    <div className="function-info">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
                        <span className="function-name">{fn.name_tr}</span>
                        {!hasQuestionPack(fn.code) && (
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              padding: "0.125rem 0.375rem",
                              borderRadius: "3px",
                              background: "var(--bg-subtle, #f1f5f9)",
                              color: "var(--text-muted, #64748b)",
                              fontWeight: 500,
                            }}
                            title="Soru paketi geliştirme aşamasındadır"
                          >
                            Hazırlanıyor
                          </span>
                        )}
                      </div>
                      <span className="function-category">
                        {fn.category} • {fn.name_en}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} />
              Geri (Firma Bilgileri)
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedFunctionIds.length === 0}
            >
              {isSubmitting ? (
                "Kaydediliyor..."
              ) : (
                <>
                  <Check size={16} />
                  Analizi Oluştur ({selectedFunctionIds.length} Fonksiyon)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
