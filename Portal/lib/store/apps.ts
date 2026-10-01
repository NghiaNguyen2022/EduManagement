import type { RowDataPacket } from "mysql2";
import { execute, queryRows } from "../db/mysql";
import type { Locale } from "../i18n/config";

export type AppTone = "blue" | "amber" | "slate";

export type AppCustomer = {
  name: string;
  role: string;
  roleEn?: string;
};

// Bilingual record as stored/edited in the admin panel.
export type AppRecord = {
  slug: string;
  code: string;
  eyebrowVi: string;
  eyebrowEn: string | null;
  titleVi: string;
  titleEn: string | null;
  descriptionVi: string;
  descriptionEn: string | null;
  longDescriptionVi: string;
  longDescriptionEn: string | null;
  href: string;
  actionVi: string;
  actionEn: string | null;
  tone: AppTone;
  hasDetailPage: boolean;
  highlightsVi: string[];
  highlightsEn: string[] | null;
  customers: AppCustomer[];
  baseRating: number | null;
  sortOrder: number;
};

export type AppRecordInput = Omit<AppRecord, "sortOrder">;

// Locale-resolved shape used by public pages.
export type AppInfo = {
  slug: string;
  code: string;
  eyebrow: string;
  title: string;
  description: string;
  longDescription: string;
  href: string;
  action: string;
  tone: AppTone;
  hasDetailPage: boolean;
  highlights: string[];
  customers: { name: string; role: string }[];
  baseRating: number | null;
};

type AppRow = RowDataPacket & {
  slug: string;
  code: string;
  eyebrow_vi: string;
  eyebrow_en: string | null;
  title_vi: string;
  title_en: string | null;
  description_vi: string;
  description_en: string | null;
  long_description_vi: string;
  long_description_en: string | null;
  href: string;
  action_vi: string;
  action_en: string | null;
  tone: AppTone;
  has_detail_page: number | boolean;
  highlights_vi: string | string[];
  highlights_en: string | string[] | null;
  customers: string | AppCustomer[];
  base_rating: string | number | null;
  sort_order: number;
};

function parseJson<T>(value: string | T | null, fallback: T): T {
  if (value === null) return fallback;
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function mapRow(row: AppRow): AppRecord {
  return {
    slug: row.slug,
    code: row.code,
    eyebrowVi: row.eyebrow_vi,
    eyebrowEn: row.eyebrow_en,
    titleVi: row.title_vi,
    titleEn: row.title_en,
    descriptionVi: row.description_vi,
    descriptionEn: row.description_en,
    longDescriptionVi: row.long_description_vi,
    longDescriptionEn: row.long_description_en,
    href: row.href,
    actionVi: row.action_vi,
    actionEn: row.action_en,
    tone: row.tone,
    hasDetailPage: Boolean(row.has_detail_page),
    highlightsVi: parseJson(row.highlights_vi, []),
    highlightsEn: parseJson(row.highlights_en, null),
    customers: parseJson(row.customers, []),
    baseRating: row.base_rating === null ? null : Number(row.base_rating),
    sortOrder: row.sort_order,
  };
}

export function resolveApp(record: AppRecord, locale: Locale): AppInfo {
  const en = locale === "en";
  return {
    slug: record.slug,
    code: record.code,
    eyebrow: (en && record.eyebrowEn) || record.eyebrowVi,
    title: (en && record.titleEn) || record.titleVi,
    description: (en && record.descriptionEn) || record.descriptionVi,
    longDescription: (en && record.longDescriptionEn) || record.longDescriptionVi,
    href: record.href,
    action: (en && record.actionEn) || record.actionVi,
    tone: record.tone,
    hasDetailPage: record.hasDetailPage,
    highlights:
      (en && record.highlightsEn && record.highlightsEn.length > 0
        ? record.highlightsEn
        : record.highlightsVi) ?? [],
    customers: record.customers.map((customer) => ({
      name: customer.name,
      role: (en && customer.roleEn) || customer.role,
    })),
    baseRating: record.baseRating,
  };
}

const SEED_APPS: AppRecordInput[] = [
  {
    slug: "eduman",
    code: "EDU",
    eyebrowVi: "Đang vận hành",
    eyebrowEn: "In operation",
    titleVi: "Quản lý trường học",
    titleEn: "School Management",
    descriptionVi:
      "Nền tảng quản lý tuyển sinh, học vụ, giáo viên, tài chính và kết nối phụ huynh.",
    descriptionEn:
      "Admissions, academics, teaching staff, finance, and parent-connection platform.",
    longDescriptionVi:
      "Hệ thống quản lý trường học tập trung, giúp ban giám hiệu và phòng ban vận hành tuyển sinh, học vụ, nhân sự giáo viên và tài chính trên cùng một nền tảng, đồng thời giữ liên lạc thông suốt với phụ huynh.",
    longDescriptionEn:
      "A centralized school management system that helps leadership and departments run admissions, academics, teaching staff, and finance on one platform while keeping communication with parents seamless.",
    href: "https://vireon.vn/app-portal/edu-demo/",
    actionVi: "Mở ứng dụng",
    actionEn: "Open app",
    tone: "blue",
    hasDetailPage: true,
    highlightsVi: [
      "Quản lý tuyển sinh và hồ sơ học sinh tập trung",
      "Theo dõi học vụ, điểm số và thời khóa biểu",
      "Quản lý nhân sự giáo viên và bảng lương",
      "Cổng thông tin kết nối phụ huynh theo thời gian thực",
    ],
    highlightsEn: [
      "Centralized admissions and student record management",
      "Academic tracking: grades, timetables, progress",
      "Teaching staff management and payroll",
      "Real-time parent communication portal",
    ],
    customers: [
      { name: "Trường TH-THCS Minh Khai", role: "Trường phổ thông liên cấp", roleEn: "K-12 school" },
      {
        name: "Hệ thống giáo dục Ánh Dương",
        role: "Chuỗi trường mầm non - tiểu học",
        roleEn: "Preschool–primary school network",
      },
      { name: "Trường THPT Nguyễn Trãi", role: "Trường trung học phổ thông", roleEn: "High school" },
    ],
    baseRating: 4.6,
  },
  {
    slug: "residenceman",
    code: "RC",
    eyebrowVi: "Đang vận hành",
    eyebrowEn: "In operation",
    titleVi: "Quản lý lưu xá",
    titleEn: "Residence Management",
    descriptionVi:
      "Số hóa hồ sơ lưu trú, sinh hoạt, kỷ luật và công tác quản lý lưu xá.",
    descriptionEn:
      "Digitizes residency records, daily activity, discipline, and dormitory operations.",
    longDescriptionVi:
      "Số hóa toàn bộ nghiệp vụ quản lý lưu xá: hồ sơ lưu trú, theo dõi sinh hoạt nội trú, xử lý kỷ luật và báo cáo vận hành cho ban quản lý ký túc xá, lưu xá sinh viên.",
    longDescriptionEn:
      "Digitizes the full residence-management workflow: residency records, daily activity tracking, discipline handling, and operational reporting for dormitory and student-residence management boards.",
    href: "https://vireon.vn/app-portal/residence-management",
    actionVi: "Mở ứng dụng",
    actionEn: "Open app",
    tone: "amber",
    hasDetailPage: true,
    highlightsVi: [
      "Quản lý hồ sơ lưu trú và phân bổ phòng ở",
      "Theo dõi sinh hoạt và điểm danh nội trú",
      "Ghi nhận và xử lý kỷ luật minh bạch",
      "Báo cáo vận hành lưu xá theo thời gian thực",
    ],
    highlightsEn: [
      "Residency records and room-allocation management",
      "Daily activity tracking and roll call",
      "Transparent discipline logging and handling",
      "Real-time operational reporting",
    ],
    customers: [
      { name: "Ký túc xá Đại học Kinh tế", role: "Ký túc xá sinh viên", roleEn: "University dormitory" },
      { name: "Lưu xá Nữ sinh Hòa Bình", role: "Lưu xá nội trú", roleEn: "Student residence hall" },
    ],
    baseRating: 4.4,
  },
  {
    slug: "coming-soon",
    code: "+",
    eyebrowVi: "Sẵn sàng mở rộng",
    eyebrowEn: "Ready to expand",
    titleVi: "Ứng dụng tiếp theo",
    titleEn: "Next application",
    descriptionVi:
      "Các công cụ số mới sẽ được bổ sung vào hub theo nhu cầu vận hành thực tế.",
    descriptionEn: "New digital tools will be added to the hub based on real operating needs.",
    longDescriptionVi: "",
    longDescriptionEn: "",
    href: "#roadmap",
    actionVi: "Xem định hướng",
    actionEn: "See roadmap",
    tone: "slate",
    hasDetailPage: false,
    highlightsVi: [],
    highlightsEn: [],
    customers: [],
    baseRating: null,
  },
];

let seedPromise: Promise<void> | null = null;

async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const rows = await queryRows<RowDataPacket[]>("SELECT COUNT(*) AS count FROM apps");
      if (Number((rows[0] as { count: number }).count) > 0) return;
      for (let i = 0; i < SEED_APPS.length; i += 1) {
        await insertRecord(SEED_APPS[i], i);
      }
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

async function insertRecord(input: AppRecordInput, sortOrder: number): Promise<void> {
  const now = new Date();
  await execute(
    `INSERT INTO apps (
      slug, code, eyebrow_vi, eyebrow_en, title_vi, title_en,
      description_vi, description_en, long_description_vi, long_description_en,
      href, action_vi, action_en, tone, has_detail_page,
      highlights_vi, highlights_en, customers, base_rating, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.slug,
      input.code,
      input.eyebrowVi,
      input.eyebrowEn,
      input.titleVi,
      input.titleEn,
      input.descriptionVi,
      input.descriptionEn,
      input.longDescriptionVi,
      input.longDescriptionEn,
      input.href,
      input.actionVi,
      input.actionEn,
      input.tone,
      input.hasDetailPage,
      JSON.stringify(input.highlightsVi),
      input.highlightsEn ? JSON.stringify(input.highlightsEn) : null,
      JSON.stringify(input.customers),
      input.baseRating,
      sortOrder,
      now,
      now,
    ],
  );
}

export async function listAppRecords(): Promise<AppRecord[]> {
  await ensureSeeded();
  return (
    await queryRows<AppRow[]>("SELECT * FROM apps ORDER BY sort_order ASC, created_at ASC")
  ).map(mapRow);
}

export async function getAppRecord(slug: string): Promise<AppRecord | null> {
  await ensureSeeded();
  const rows = await queryRows<AppRow[]>("SELECT * FROM apps WHERE slug = ? LIMIT 1", [slug]);
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function listApps(locale: Locale): Promise<AppInfo[]> {
  return (await listAppRecords()).map((record) => resolveApp(record, locale));
}

export async function getAppBySlug(slug: string, locale: Locale): Promise<AppInfo | undefined> {
  const record = await getAppRecord(slug);
  if (!record || !record.hasDetailPage) return undefined;
  return resolveApp(record, locale);
}

export async function createApp(input: AppRecordInput): Promise<AppRecord> {
  const rows = await queryRows<RowDataPacket[]>(
    "SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM apps",
  );
  const nextOrder = Number((rows[0] as { maxOrder: number }).maxOrder) + 1;
  await insertRecord(input, nextOrder);
  return (await getAppRecord(input.slug)) as AppRecord;
}

export async function updateApp(
  slug: string,
  input: Omit<AppRecordInput, "slug">,
): Promise<AppRecord | null> {
  const existing = await getAppRecord(slug);
  if (!existing) return null;
  await execute(
    `UPDATE apps SET
      code=?, eyebrow_vi=?, eyebrow_en=?, title_vi=?, title_en=?,
      description_vi=?, description_en=?, long_description_vi=?, long_description_en=?,
      href=?, action_vi=?, action_en=?, tone=?, has_detail_page=?,
      highlights_vi=?, highlights_en=?, customers=?, base_rating=?, updated_at=?
    WHERE slug=?`,
    [
      input.code,
      input.eyebrowVi,
      input.eyebrowEn,
      input.titleVi,
      input.titleEn,
      input.descriptionVi,
      input.descriptionEn,
      input.longDescriptionVi,
      input.longDescriptionEn,
      input.href,
      input.actionVi,
      input.actionEn,
      input.tone,
      input.hasDetailPage,
      JSON.stringify(input.highlightsVi),
      input.highlightsEn ? JSON.stringify(input.highlightsEn) : null,
      JSON.stringify(input.customers),
      input.baseRating,
      new Date(),
      slug,
    ],
  );
  return getAppRecord(slug);
}

export async function deleteApp(slug: string): Promise<boolean> {
  return (await execute("DELETE FROM apps WHERE slug = ?", [slug])).affectedRows > 0;
}
