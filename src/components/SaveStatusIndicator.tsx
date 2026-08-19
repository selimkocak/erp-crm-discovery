import React from "react";
import { CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";

interface SaveStatusIndicatorProps {
  status: "saved" | "saving" | "error" | "idle";
  lastSavedAt?: Date | null;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSavedAt,
}) => {
  if (status === "idle") return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        fontSize: "0.75rem",
        color:
          status === "saved"
            ? "var(--success-text)"
            : status === "saving"
            ? "var(--primary)"
            : "var(--danger-text)",
        backgroundColor:
          status === "saved"
            ? "var(--success-bg)"
            : status === "saving"
            ? "var(--primary-subtle)"
            : "var(--danger-bg)",
        padding: "0.25rem 0.625rem",
        borderRadius: "var(--radius-full)",
        border: `1px solid ${
          status === "saved"
            ? "var(--success-border)"
            : status === "saving"
            ? "var(--primary-border)"
            : "var(--danger-border)"
        }`,
      }}
    >
      {status === "saving" && <RefreshCw size={12} className="animate-spin" />}
      {status === "saved" && <CheckCircle2 size={12} />}
      {status === "error" && <AlertCircle size={12} />}

      <span>
        {status === "saving" && "Kaydediliyor..."}
        {status === "saved" &&
          `Değişiklikler kaydedildi ${
            lastSavedAt
              ? `(${lastSavedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })})`
              : ""
          }`}
        {status === "error" && "Kaydetme hatası!"}
      </span>
    </div>
  );
};
