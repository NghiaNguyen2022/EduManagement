import type { ReactNode } from "react";

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const sidebarIcons: Record<string, ReactNode> = {
  dashboard: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="3" width="7.5" height="9" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.6" />
      <rect x="13.5" y="12" width="7.5" height="9" rx="1.6" />
      <rect x="3" y="15.5" width="7.5" height="5.5" rx="1.6" />
    </svg>
  ),

  admissions: (
    <svg {...ICON_PROPS}>
      <path d="M3 4h18l-6.75 8v6l-4.5 2v-8L3 4Z" />
    </svg>
  ),

  students: (
    <svg {...ICON_PROPS}>
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="M6.5 10.75V16c0 1.66 2.46 3 5.5 3s5.5-1.34 5.5-3v-5.25" />
      <path d="M21 8v6.5" />
    </svg>
  ),

  teachers: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="4" width="18" height="12" rx="1.6" />
      <path d="m7 9 2.7 1.9L13 8l4 2.6" />
      <path d="M9 20h6" />
      <path d="M12 16v4" />
    </svg>
  ),

  classes: (
    <svg {...ICON_PROPS}>
      <path d="M4 21V9.5L12 4l8 5.5V21" />
      <path d="M9.25 21v-6.5h5.5V21" />
      <path d="M4 21h16" />
    </svg>
  ),

  schedule: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  ),

  attendance: (
    <svg {...ICON_PROPS}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3.3h6a1 1 0 0 1 1 1V6H8V4.3a1 1 0 0 1 1-1Z" />
      <path d="m9 13.2 2.1 2.1L15.5 11" />
    </svg>
  ),

  finance: (
    <svg {...ICON_PROPS}>
      <path d="M3 7.2A2.2 2.2 0 0 1 5.2 5h11.6A2.2 2.2 0 0 1 19 7.2V9h1.2A1.8 1.8 0 0 1 22 10.8v6.4A1.8 1.8 0 0 1 20.2 19H5.2A2.2 2.2 0 0 1 3 16.8V7.2Z" />
      <circle cx="17.1" cy="13.9" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  ),

  notifications: (
    <svg {...ICON_PROPS}>
      <path d="M6 9.5A6 6 0 0 1 12 4a6 6 0 0 1 6 5.5V14l2 3H4l2-3V9.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  ),

  communications: (
    <svg {...ICON_PROPS}>
      <path d="M4 5.5h12A3.5 3.5 0 0 1 19.5 9v6A3.5 3.5 0 0 1 16 18.5H9l-5 3v-3.5A3.5 3.5 0 0 1 0.5 14V9A3.5 3.5 0 0 1 4 5.5Z" />
      <path d="M7 9.5h8" />
      <path d="M7 12.5h5" />
    </svg>
  ),

  organizations: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="4.6" r="2" />
      <circle cx="5" cy="19.4" r="2" />
      <circle cx="19" cy="19.4" r="2" />
      <path d="M12 6.6v4.9" />
      <path d="M12 11.5 5 17.5" />
      <path d="M12 11.5l7 6" />
    </svg>
  ),

  users: (
    <svg {...ICON_PROPS}>
      <circle cx="9" cy="8" r="3.1" />
      <path d="M3.2 20c1.2-3.7 3.3-5.6 5.8-5.6s4.6 1.9 5.8 5.6" />
      <circle cx="17.3" cy="8.6" r="2.3" />
      <path d="M15.4 14.5c2.3.35 3.9 2.1 4.9 5.5" />
    </svg>
  ),

  roles: (
    <svg {...ICON_PROPS}>
      <path d="M12 3 5.3 5.8v5.1c0 4.9 2.85 8.35 6.7 9.8 3.85-1.45 6.7-4.9 6.7-9.8V5.8L12 3Z" />
      <path d="m9.3 12.4 1.9 1.9 3.5-3.9" />
    </svg>
  ),

  "audit-logs": (
    <svg {...ICON_PROPS}>
      <circle cx="11.2" cy="12.4" r="8" />
      <path d="M11.2 7.6v4.8l3.6 1.8" />
      <path d="M6.8 3.4 4.4 5.6" />
    </svg>
  ),

  settings: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.6v2.7M12 18.7v2.7M4.1 6.1l1.95 1.85M17.95 16.05l1.95 1.85M2.6 12h2.7M18.7 12h2.7M4.1 17.9l1.95-1.85M17.95 7.95l1.95-1.85" />
    </svg>
  ),

  default: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="8.5" />
    </svg>
  ),
};
