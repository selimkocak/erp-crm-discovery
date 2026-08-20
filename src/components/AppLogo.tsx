import React from "react";

interface AppLogoProps {
  size?: number;
  className?: string;
  withContainer?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  className = "",
  withContainer = true,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      className={`app-logo ${className}`}
      style={{ display: "block", flexShrink: 0 }}
      aria-label="ERP CRM Discovery Logo"
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#08101E" />
          <stop offset="50%" stop-color="#0F2445" />
          <stop offset="100%" stop-color="#0A182E" />
        </linearGradient>

        <linearGradient id="logoNexusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F0FF" />
          <stop offset="45%" stop-color="#0284C7" />
          <stop offset="100%" stop-color="#14B8A6" />
        </linearGradient>

        <linearGradient id="logoPathGrad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8" />
          <stop offset="50%" stop-color="#0EA5E9" />
          <stop offset="100%" stop-color="#06B6D4" />
        </linearGradient>

        <radialGradient id="logoCoreGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="35%" stop-color="#E0F2FE" />
          <stop offset="65%" stop-color="#38BDF8" />
          <stop offset="85%" stop-color="#0284C7" />
          <stop offset="100%" stop-color="#0F2445" />
        </radialGradient>

        <linearGradient id="logoGlassBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35" />
          <stop offset="50%" stop-color="#38BDF8" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.5" />
        </linearGradient>

        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#00F0FF" flood-opacity="0.25" />
        </filter>
      </defs>

      {withContainer && (
        <>
          <rect x="36" y="36" width="952" height="952" rx="224" ry="224" fill="url(#logoBgGrad)" />
          <rect x="36" y="36" width="952" height="952" rx="224" ry="224" fill="none" stroke="url(#logoGlassBorder)" stroke-width="8" />
        </>
      )}

      <g filter="url(#logoShadow)">
        {/* Orbital Diamond Loop */}
        <path
          d="M 512 216 L 808 512 L 512 808 L 216 512 Z"
          fill="none"
          stroke="url(#logoPathGrad)"
          stroke-width="26"
          stroke-linejoin="round"
          stroke-linecap="round"
          opacity="0.85"
        />

        {/* Radial Convergence Pathways */}
        <line x1="512" y1="216" x2="512" y2="368" stroke="url(#logoNexusGrad)" stroke-width="32" stroke-linecap="round" />
        <line x1="808" y1="512" x2="656" y2="512" stroke="url(#logoNexusGrad)" stroke-width="32" stroke-linecap="round" />
        <line x1="512" y1="808" x2="512" y2="656" stroke="url(#logoNexusGrad)" stroke-width="32" stroke-linecap="round" />
        <line x1="216" y1="512" x2="368" y2="512" stroke="url(#logoNexusGrad)" stroke-width="32" stroke-linecap="round" />

        {/* Center Nexus Ring & Core */}
        <circle cx="512" cy="512" r="144" fill="#0B172E" stroke="url(#logoNexusGrad)" stroke-width="22" />
        <circle cx="512" cy="512" r="76" fill="url(#logoCoreGlow)" />
        <circle cx="512" cy="512" r="28" fill="#FFFFFF" />

        {/* 4 Satellite Process Nodes */}
        <circle cx="512" cy="216" r="54" fill="#08101E" stroke="url(#logoNexusGrad)" stroke-width="16" />
        <circle cx="512" cy="216" r="24" fill="#FFFFFF" />

        <circle cx="808" cy="512" r="54" fill="#08101E" stroke="url(#logoNexusGrad)" stroke-width="16" />
        <circle cx="808" cy="512" r="24" fill="#FFFFFF" />

        <circle cx="512" cy="808" r="54" fill="#08101E" stroke="url(#logoNexusGrad)" stroke-width="16" />
        <circle cx="512" cy="808" r="24" fill="#FFFFFF" />

        <circle cx="216" cy="512" r="54" fill="#08101E" stroke="url(#logoNexusGrad)" stroke-width="16" />
        <circle cx="216" cy="512" r="24" fill="#FFFFFF" />
      </g>
    </svg>
  );
};
