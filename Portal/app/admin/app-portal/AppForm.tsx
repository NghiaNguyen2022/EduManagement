"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppCustomer, AppRecord, AppTone } from "@/lib/store/apps";

type Props = {
  mode: "create" | "edit";
  initialApp?: AppRecord;
};

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function customersToText(customers: AppCustomer[]): string {
  return customers.map((c) => [c.name, c.role, c.roleEn ?? ""].join(" | ")).join("\n");
}

function textToCustomers(value: string): AppCustomer[] {
  return linesToList(value).map((line) => {
    const [name, role, roleEn] = line.split("|").map((part) => part.trim());
    return { name: name ?? "", role: role ?? "", roleEn: roleEn || undefined };
  });
}

export default function AppForm({ mode, initialApp }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(initialApp?.slug ?? "");
  const [code, setCode] = useState(initialApp?.code ?? "");
  const [href, setHref] = useState(initialApp?.href ?? "");
  const [tone, setTone] = useState<AppTone>(initialApp?.tone ?? "blue");
  const [hasDetailPage, setHasDetailPage] = useState(initialApp?.hasDetailPage ?? true);
  const [baseRating, setBaseRating] = useState(
    initialApp?.baseRating != null ? String(initialApp.baseRating) : "",
  );
  const [eyebrowVi, setEyebrowVi] = useState(initialApp?.eyebrowVi ?? "Đang vận hành");
  const [eyebrowEn, setEyebrowEn] = useState(initialApp?.eyebrowEn ?? "In operation");
  const [titleVi, setTitleVi] = useState(initialApp?.titleVi ?? "");
  const [titleEn, setTitleEn] = useState(initialApp?.titleEn ?? "");
  const [descriptionVi, setDescriptionVi] = useState(initialApp?.descriptionVi ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initialApp?.descriptionEn ?? "");
  const [longDescriptionVi, setLongDescriptionVi] = useState(initialApp?.longDescriptionVi ?? "");
  const [longDescriptionEn, setLongDescriptionEn] = useState(initialApp?.longDescriptionEn ?? "");
  const [actionVi, setActionVi] = useState(initialApp?.actionVi ?? "Mở ứng dụng");
  const [actionEn, setActionEn] = useState(initialApp?.actionEn ?? "Open app");
  const [highlightsVi, setHighlightsVi] = useState(
    (initialApp?.highlightsVi ?? []).join("\n"),
  );
  const [highlightsEn, setHighlightsEn] = useState(
    (initialApp?.highlightsEn ?? []).join("\n"),
  );
  const [customersText, setCustomersText] = useState(
    customersToText(initialApp?.customers ?? []),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      slug: slug.trim(),
      code: code.trim(),
      href: href.trim(),
      tone,
      hasDetailPage,
      baseRating: baseRating.trim() ? Number(baseRating) : null,
      eyebrowVi,
      eyebrowEn: eyebrowEn || null,
      titleVi,
      titleEn: titleEn || null,
      descriptionVi,
      descriptionEn: descriptionEn || null,
      longDescriptionVi,
      longDescriptionEn: longDescriptionEn || null,
      actionVi,
      actionEn: actionEn || null,
      highlightsVi: linesToList(highlightsVi),
      highlightsEn: highlightsEn.trim() ? linesToList(highlightsEn) : null,
      customers: textToCustomers(customersText),
    };

    const endpoint = mode === "create" ? "/api/admin/apps" : `/api/admin/apps/${slug}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Không thể lưu ứng dụng.");
        return;
      }

      router.push("/admin/app-portal");
      router.refresh();
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-field">
        <label htmlFor="app-slug">Slug (định danh URL, không đổi được sau khi tạo)</label>
        <input
          id="app-slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          disabled={mode === "edit"}
          placeholder="vd: quan-ly-kho"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="app-code">Mã hiển thị (2-3 ký tự, vd: EDU)</label>
        <input id="app-code" value={code} onChange={(event) => setCode(event.target.value)} required />
      </div>

      <div className="form-field">
        <label htmlFor="app-href">Đường dẫn mở ứng dụng</label>
        <input
          id="app-href"
          value={href}
          onChange={(event) => setHref(event.target.value)}
          placeholder="https://..."
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="app-tone">Màu sắc thẻ</label>
        <select id="app-tone" value={tone} onChange={(event) => setTone(event.target.value as AppTone)}>
          <option value="blue">Xanh dương</option>
          <option value="amber">Vàng cam</option>
          <option value="slate">Xám</option>
        </select>
      </div>

      <label className="form-checkbox">
        <input
          type="checkbox"
          checked={hasDetailPage}
          onChange={(event) => setHasDetailPage(event.target.checked)}
        />
        Có trang chi tiết (/app-portal/{slug || "slug"}) và nhận đánh giá
      </label>

      <div className="form-field">
        <label htmlFor="app-rating">Điểm đánh giá khởi điểm (1-5, để trống nếu chưa có)</label>
        <input
          id="app-rating"
          value={baseRating}
          onChange={(event) => setBaseRating(event.target.value)}
          placeholder="4.5"
        />
      </div>

      <div className="form-field">
        <label htmlFor="app-eyebrow-vi">Trạng thái (VI)</label>
        <input id="app-eyebrow-vi" value={eyebrowVi} onChange={(event) => setEyebrowVi(event.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="app-eyebrow-en">Trạng thái (EN)</label>
        <input id="app-eyebrow-en" value={eyebrowEn} onChange={(event) => setEyebrowEn(event.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="app-title-vi">Tên ứng dụng (VI)</label>
        <input id="app-title-vi" value={titleVi} onChange={(event) => setTitleVi(event.target.value)} required />
      </div>
      <div className="form-field">
        <label htmlFor="app-title-en">Tên ứng dụng (EN)</label>
        <input id="app-title-en" value={titleEn} onChange={(event) => setTitleEn(event.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="app-desc-vi">Mô tả ngắn (VI)</label>
        <textarea
          id="app-desc-vi"
          value={descriptionVi}
          onChange={(event) => setDescriptionVi(event.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="app-desc-en">Mô tả ngắn (EN)</label>
        <textarea id="app-desc-en" value={descriptionEn} onChange={(event) => setDescriptionEn(event.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="app-long-vi">Mô tả chi tiết (VI)</label>
        <textarea
          id="app-long-vi"
          value={longDescriptionVi}
          onChange={(event) => setLongDescriptionVi(event.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="app-long-en">Mô tả chi tiết (EN)</label>
        <textarea
          id="app-long-en"
          value={longDescriptionEn}
          onChange={(event) => setLongDescriptionEn(event.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="app-action-vi">Nhãn nút hành động (VI)</label>
        <input id="app-action-vi" value={actionVi} onChange={(event) => setActionVi(event.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="app-action-en">Nhãn nút hành động (EN)</label>
        <input id="app-action-en" value={actionEn} onChange={(event) => setActionEn(event.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="app-highlights-vi">Tính năng nổi bật (VI, mỗi dòng một tính năng)</label>
        <textarea
          id="app-highlights-vi"
          value={highlightsVi}
          onChange={(event) => setHighlightsVi(event.target.value)}
          rows={4}
        />
      </div>
      <div className="form-field">
        <label htmlFor="app-highlights-en">Tính năng nổi bật (EN, mỗi dòng một tính năng)</label>
        <textarea
          id="app-highlights-en"
          value={highlightsEn}
          onChange={(event) => setHighlightsEn(event.target.value)}
          rows={4}
        />
      </div>

      <div className="form-field">
        <label htmlFor="app-customers">
          Khách hàng tiêu biểu (mỗi dòng: Tên | Vai trò (VI) | Vai trò (EN, không bắt buộc))
        </label>
        <textarea
          id="app-customers"
          value={customersText}
          onChange={(event) => setCustomersText(event.target.value)}
          rows={4}
          placeholder="Trường THPT Nguyễn Trãi | Trường trung học phổ thông | High school"
        />
      </div>

      <div className="form-actions">
        <button className="button-submit" type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : mode === "create" ? "Tạo ứng dụng" : "Lưu thay đổi"}
        </button>
        <Link className="button-ghost" href="/admin/app-portal">
          Huỷ
        </Link>
      </div>
    </form>
  );
}
