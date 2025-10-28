import React from 'react';

export const CameraIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

export const BeakerIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4.5 3h15" />
    <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
    <path d="M6 14h12" />
  </svg>
);

export const ImageIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

export const FilmHolderIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" stroke="currentColor" strokeWidth="4">
    <rect x="5" y="20" width="90" height="95" rx="5" />
    <path d="M 30 20 L 30 5 L 70 5 L 70 20" />
  </svg>
);

export const DevTankIcon = ({ className, onClick }: { className?: string; onClick?: () => void; }) => (
  <svg onClick={onClick} viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3">
    {/* Body */}
    <path d="M 20 90 C 20 95, 80 95, 80 90 L 80 30 C 80 25, 20 25, 20 30 Z" />
    {/* Lid */}
    <path d="M 15 30 L 85 30" />
    <path d="M 30 30 C 30 20, 70 20, 70 30" />
    {/* Knob */}
    <path d="M 45 20 L 55 20 L 55 10 L 45 10 Z" />
    <path d="M 50 10 L 50 5" />
  </svg>
);
