export type EducationThemeConfig = {
  app: {
    name: string;
    subtitle: string;
    shortName: string;
  };

  typography: {
    fontFamily: string;
    pageTitleSize: string;
    pageTitleWeight: number;
    pageSubtitleSize: string;
    sectionTitleSize: string;
    bodySize: string;
    smallSize: string;
  };

  layout: {
    pageMaxWidth: string;
    contentPaddingDesktop: string;
    contentPaddingTablet: string;
    contentPaddingMobile: string;
    sidebarWidth: string;
    sidebarCollapsedWidth: string;
    topbarHeight: string;
  };

  radius: {
    small: string;
    medium: string;
    large: string;
    pill: string;
  };

  shadow: {
    none: string;
    soft: string;
    medium: string;
    strong: string;
  };

  colors: {
    background: string;
    backgroundSoft: string;
    surface: string;
    surfaceSoft: string;
    border: string;
    borderStrong: string;

    text: string;
    textMuted: string;
    textSoft: string;

    primary: string;
    primaryHover: string;
    primarySoft: string;
    primaryStrong: string;

    secondary: string;
    secondarySoft: string;

    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerHover: string;
    dangerSoft: string;
    info: string;
    infoSoft: string;

    sidebarBackground: string;
    sidebarBackgroundAlt: string;
    sidebarText: string;
    sidebarTextMuted: string;
    sidebarActive: string;
    sidebarActiveText: string;
  };

  pagination: {
    defaultPageSize: number;
    pageSizeOptions: number[];
    compactPageSize: number;
  };

  cards: {
    defaultShadow: "none" | "soft" | "medium" | "strong";
    defaultRadius: "small" | "medium" | "large";
    statisticVariant: "soft" | "outlined" | "filled";
    statisticIconSize: string;
  };

  pageHeader: {
    align: "left" | "center";
    showSubtitle: boolean;
    actionPlacement: "right" | "below";
  };
};

export const educationAppearance: EducationThemeConfig = {
  app: {
    name: "Quản lý Trường học",
    subtitle: "Nền tảng quản lý trường học và trung tâm đào tạo",
    shortName: "EduCenter",
  },

  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    pageTitleSize: "clamp(30px, 3vw, 42px)",
    pageTitleWeight: 800,
    pageSubtitleSize: "15px",
    sectionTitleSize: "18px",
    bodySize: "14px",
    smallSize: "12px",
  },

  layout: {
    pageMaxWidth: "1500px",
    contentPaddingDesktop: "32px 34px 52px",
    contentPaddingTablet: "28px 20px 44px",
    contentPaddingMobile: "22px 16px 36px",
    sidebarWidth: "276px",
    sidebarCollapsedWidth: "88px",
    topbarHeight: "82px",
  },

  radius: {
    small: "10px",
    medium: "14px",
    large: "18px",
    pill: "999px",
  },

  shadow: {
    none: "none",
    soft: "0 10px 26px rgba(31, 94, 137, 0.07)",
    medium: "0 16px 38px rgba(31, 94, 137, 0.10)",
    strong: "0 22px 54px rgba(31, 94, 137, 0.16)",
  },

  colors: {
    background: "#f3f9fc",
    backgroundSoft: "#eef7fb",
    surface: "#ffffff",
    surfaceSoft: "#f7fbfd",
    border: "#d9eaf2",
    borderStrong: "#bdd9e7",

    text: "#1d2b36",
    textMuted: "#607483",
    textSoft: "#8295a2",

    primary: "#2f9ed8",
    primaryHover: "#238bc2",
    primarySoft: "#e6f5fc",
    primaryStrong: "#166b9b",

    secondary: "#55b8a6",
    secondarySoft: "#e8f8f4",

    success: "#2fa76f",
    successSoft: "#e8f7ef",
    warning: "#e2a23a",
    warningSoft: "#fff6e2",
    danger: "#d95d58",
    dangerHover: "#c44b46",
    dangerSoft: "#fdeeed",
    info: "#4f8fe7",
    infoSoft: "#edf4fe",

    sidebarBackground: "#173d5a",
    sidebarBackgroundAlt: "#102f47",
    sidebarText: "#eaf7ff",
    sidebarTextMuted: "#9dc2d6",
    sidebarActive: "#2f9ed8",
    sidebarActiveText: "#ffffff",
  },

  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    compactPageSize: 7,
  },

  cards: {
    defaultShadow: "soft",
    defaultRadius: "large",
    statisticVariant: "soft",
    statisticIconSize: "46px",
  },

  pageHeader: {
    align: "center",
    showSubtitle: true,
    actionPlacement: "right",
  },
};
