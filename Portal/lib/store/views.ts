import type { RowDataPacket } from "mysql2";
import { execute, queryRows } from "../db/mysql";

export type ViewKind = "site" | "post" | "app";

export type ViewStats = {
  today: number;
  week: number;
  month: number;
  total: number;
};

const ICT_OFFSET_MS = 7 * 60 * 60 * 1000;

function startOfIctDay(date: Date, daysAgo = 0): Date {
  const ict = new Date(date.getTime() + ICT_OFFSET_MS);
  ict.setUTCHours(0, 0, 0, 0);
  ict.setUTCDate(ict.getUTCDate() - daysAgo);
  return new Date(ict.getTime() - ICT_OFFSET_MS);
}

function startOfIctWeek(date: Date): Date {
  const ict = new Date(date.getTime() + ICT_OFFSET_MS);
  const day = ict.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  return startOfIctDay(date, diffToMonday);
}

function startOfIctMonth(date: Date): Date {
  const ict = new Date(date.getTime() + ICT_OFFSET_MS);
  const startOfMonthIct = new Date(Date.UTC(ict.getUTCFullYear(), ict.getUTCMonth(), 1));
  return new Date(startOfMonthIct.getTime() - ICT_OFFSET_MS);
}

export async function recordView(kind: ViewKind, refKey: string | null = null): Promise<void> {
  await execute(
    "INSERT INTO page_views (id, kind, ref_key, created_at) VALUES (?, ?, ?, ?)",
    [crypto.randomUUID(), kind, refKey, new Date()],
  );
}

export async function getSiteViewStats(): Promise<ViewStats> {
  const now = new Date();
  const rows = await queryRows<(RowDataPacket & { bucket: string; count: number })[]>(
    `SELECT
        SUM(created_at >= ?) AS today,
        SUM(created_at >= ?) AS week,
        SUM(created_at >= ?) AS month,
        COUNT(*) AS total
      FROM page_views`,
    [startOfIctDay(now), startOfIctWeek(now), startOfIctMonth(now)],
  );
  const row = rows[0] as unknown as {
    today: number | null;
    week: number | null;
    month: number | null;
    total: number | null;
  };
  return {
    today: Number(row?.today ?? 0),
    week: Number(row?.week ?? 0),
    month: Number(row?.month ?? 0),
    total: Number(row?.total ?? 0),
  };
}

export async function getViewCount(kind: ViewKind, refKey: string): Promise<number> {
  const rows = await queryRows<RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM page_views WHERE kind = ? AND ref_key = ?",
    [kind, refKey],
  );
  return Number((rows[0] as { count: number }).count);
}

export async function getViewCounts(
  kind: ViewKind,
  refKeys: string[],
): Promise<Map<string, number>> {
  if (refKeys.length === 0) return new Map();
  const placeholders = refKeys.map(() => "?").join(", ");
  const rows = await queryRows<RowDataPacket[]>(
    `SELECT ref_key, COUNT(*) AS count FROM page_views WHERE kind = ? AND ref_key IN (${placeholders}) GROUP BY ref_key`,
    [kind, ...refKeys],
  );
  return new Map(
    (rows as unknown as { ref_key: string; count: number }[]).map((row) => [
      row.ref_key,
      Number(row.count),
    ]),
  );
}
