import { useEffect, useMemo, useState } from "react";

import { SelectField, TextAreaField, TextField } from "../components/form";
import { OrgLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";
import {
  confirmThongBaoDaDocApi,
  createThongBaoApi,
  listThongBaoApi,
} from "../features/thongBao/thongBaoApi";
import type {
  PhamViThongBao,
  ThongBaoFormInput,
  ThongBaoItem,
} from "../features/thongBao/thongBaoTypes";

const emptyForm: ThongBaoFormInput = {
  tieuDe: "",
  noiDung: "",
  tepDinhKemTen: "",
  tepDinhKemUrl: "",
  phamVi: "toan_truong",
  doiTuong: "",
};

const PHAM_VI_LABEL: Record<PhamViThongBao, string> = {
  toan_truong: "Toàn trường",
  theo_lop: "Theo lớp",
  ca_nhan: "Cá nhân",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export function ThongBaoPage() {
  const { auth } = useAuth();

  const [items, setItems] = useState<ThongBaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [phamViFilter, setPhamViFilter] = useState("all");
  const [form, setForm] = useState<ThongBaoFormInput>(emptyForm);
  const [busyReadId, setBusyReadId] = useState<number | null>(null);

  const isHeThong = auth?.currentOrganization?.loaiDonVi === "he_thong";

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];

    return (
      !isHeThong &&
      (permissions.includes("he_thong.quan_tri") ||
        permissions.includes("don_vi.quan_ly") ||
        permissions.includes("tuyen_sinh.quan_ly") ||
        permissions.includes("lop_hoc.quan_ly") ||
        permissions.includes("tai_chinh.quan_ly"))
    );
  }, [auth, isHeThong]);

  useUnsavedChangesGuard(JSON.stringify(form) !== JSON.stringify(emptyForm));

  const filteredItems = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.tieuDe.toLowerCase().includes(keyword) ||
        item.maThongBao.toLowerCase().includes(keyword) ||
        item.noiDung.toLowerCase().includes(keyword) ||
        (item.doiTuong ?? "").toLowerCase().includes(keyword);

      const matchesPhamVi = phamViFilter === "all" || item.phamVi === phamViFilter;

      return matchesSearch && matchesPhamVi;
    });
  }, [items, searchText, phamViFilter]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const rows = await listThongBaoApi();
      setItems(rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [auth?.currentOrganization?.id]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const created = await createThongBaoApi(form);
      setNotice(`Đã tạo thông báo ${created.maThongBao}.`);
      setForm(emptyForm);
      await loadData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Không thể tạo thông báo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkRead(id: number) {
    setBusyReadId(id);
    setError("");

    try {
      await confirmThongBaoDaDocApi(id);
      setNotice("Đã xác nhận đọc thông báo.");
      await loadData();
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : "Không thể xác nhận đã đọc.");
    } finally {
      setBusyReadId(null);
    }
  }

  return (
    <div className="page-stack thong-bao-page">
      <PageHeader
        title="Thông báo nội bộ"
        subtitle={
          isHeThong
            ? "Xem gộp thông báo của các đơn vị đang hoạt động"
            : "Quản lý thông báo nội bộ trong đơn vị đang làm việc"
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      {canManage ? (
        <SectionCard
          className="thong-bao-card thong-bao-card--form"
          title="Tạo thông báo"
          subtitle="Phạm vi dùng để chuẩn bị cho I03-I05, hiện lưu dạng nội bộ trong đơn vị."
        >
          <form className="thong-bao-form" onSubmit={handleCreate}>
            <div className="thong-bao-form__grid">
              <div className="thong-bao-form__field thong-bao-form__field--span-3">
                <TextField
                  label="Tiêu đề"
                  value={form.tieuDe}
                  required
                  onChange={(value) => setForm({ ...form, tieuDe: value })}
                />
              </div>

              <div className="thong-bao-form__field thong-bao-form__field--span-2">
                <SelectField
                  label="Phạm vi"
                  value={form.phamVi}
                  options={Object.entries(PHAM_VI_LABEL).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      phamVi: value as PhamViThongBao,
                    })
                  }
                />
              </div>

              <div className="thong-bao-form__field thong-bao-form__field--span-5">
                <TextAreaField
                  label="Nội dung"
                  value={form.noiDung}
                  required
                  rows={7}
                  onChange={(value) => setForm({ ...form, noiDung: value })}
                />
              </div>

              <div className="thong-bao-form__field thong-bao-form__field--span-3">
                <TextField
                  label="Đối tượng áp dụng"
                  value={form.doiTuong}
                  placeholder="Ví dụ: Lớp Mầm 1, học sinh Nguyễn Văn A"
                  helpText="Bắt buộc khi chọn theo lớp hoặc cá nhân."
                  onChange={(value) => setForm({ ...form, doiTuong: value })}
                />
              </div>

              <div className="thong-bao-form__field thong-bao-form__field--span-2">
                <TextField
                  label="Tên đính kèm"
                  value={form.tepDinhKemTen}
                  placeholder="Ví dụ: Thong-bao-khai-giang.pdf"
                  helpText="Để trống nếu chưa cần đính kèm tài liệu/hình ảnh."
                  onChange={(value) => setForm({ ...form, tepDinhKemTen: value })}
                />
              </div>

              <div className="thong-bao-form__field thong-bao-form__field--span-5">
                <TextField
                  label="Liên kết đính kèm"
                  value={form.tepDinhKemUrl}
                  placeholder="https://... hoặc đường dẫn file ảnh/tài liệu"
                  helpText="Nên là liên kết trực tiếp tới file hoặc hình ảnh."
                  onChange={(value) => setForm({ ...form, tepDinhKemUrl: value })}
                />
              </div>
            </div>

            <div className="thong-bao-form__actions">
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? "Đang tạo..." : "Tạo thông báo"}
              </button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        className="thong-bao-card thong-bao-card--list"
        title="Danh sách thông báo"
        subtitle={loading ? "Đang tải dữ liệu..." : `${filteredItems.length} thông báo`}
      >
        <div className="thong-bao-toolbar">
          <TextField
            type="search"
            value={searchText}
            placeholder="Tìm theo mã, tiêu đề, nội dung hoặc đối tượng"
            onChange={setSearchText}
          />

          <SelectField
            value={phamViFilter}
            options={[
              { value: "all", label: "Tất cả phạm vi" },
              ...Object.entries(PHAM_VI_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            onChange={setPhamViFilter}
          />
        </div>

        <div className="user-table-wrap">
          <table className="user-table thong-bao-table">
            <thead>
              <tr>
                <th>Thông báo</th>
                <th>Phạm vi</th>
                <th>Đối tượng</th>
                <th>Ngày tạo</th>
                {isHeThong ? <th>Đơn vị</th> : null}
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="thong-bao-table__main-cell">
                    <strong>{item.maThongBao}</strong>
                    <small className="thong-bao-table__title">{item.tieuDe}</small>
                    <small className="thong-bao-table__content">{item.noiDung}</small>
                    {item.tepDinhKemUrl ? (
                      <small className="thong-bao-table__attachment">
                        <a
                          href={item.tepDinhKemUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="thong-bao-attachment-link"
                        >
                          {item.tepDinhKemTen || "Mở tệp đính kèm"}
                        </a>
                      </small>
                    ) : null}
                    <div className="thong-bao-row-actions">
                      <span
                        className={[
                          "thong-bao-read-badge",
                          item.daDocAt
                            ? "thong-bao-read-badge--read"
                            : "thong-bao-read-badge--unread",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {item.daDocAt ? "Đã đọc" : "Chưa đọc"}
                      </span>

                      {!item.daDocAt ? (
                        <button
                          type="button"
                          className="secondary-button thong-bao-read-button"
                          disabled={busyReadId === item.id}
                          onClick={() => void handleMarkRead(item.id)}
                        >
                          {busyReadId === item.id ? "Đang lưu..." : "Xác nhận đã đọc"}
                        </button>
                      ) : (
                        <small className="thong-bao-row-actions__meta">
                          Lúc {formatDateTime(item.daDocAt)}
                        </small>
                      )}
                    </div>
                  </td>

                  <td>{PHAM_VI_LABEL[item.phamVi]}</td>
                  <td>{item.doiTuong ?? "—"}</td>
                  <td>{formatDateTime(item.createdAt)}</td>
                  {isHeThong ? (
                    <td>
                      <OrgLink donVi={item.donVi} to="/notifications" />
                    </td>
                  ) : null}
                </tr>
              ))}

              {!loading && filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={isHeThong ? 5 : 4} className="empty-cell">
                    Chưa có thông báo nào phù hợp.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
