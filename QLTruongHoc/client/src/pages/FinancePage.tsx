import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  CurrencyInput,
  DateField,
  SelectField,
  TextField,
} from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  createDanhMucKhoanThuApi,
  createKyThuApi,
  listCongNoApi,
  listDanhMucKhoanThuApi,
  listKyThuApi,
} from "../features/taiChinh/taiChinhApi";
import type {
  DanhMucKhoanThuFormInput,
  DanhMucKhoanThuItem,
  KhoanPhaiThuItem,
  KyThuFormInput,
  KyThuItem,
  LoaiKhoanThu,
  LoaiKy,
} from "../features/taiChinh/taiChinhTypes";

function formatTien(value: string) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

const LOAI_KHOAN_THU_LABEL: Record<LoaiKhoanThu, string> = {
  hoc_phi: "Học phí",
  tien_an: "Tiền ăn",
  dich_vu: "Dịch vụ",
  tai_lieu: "Tài liệu",
  khac: "Khác",
};

const LOAI_KY_LABEL: Record<LoaiKy, string> = {
  thang: "Theo tháng",
  khoa_hoc: "Theo khóa học",
  hoc_ky: "Theo học kỳ",
  dot: "Theo đợt",
};

const KY_THU_TRANG_THAI_LABEL: Record<string, string> = {
  nhap: "Nháp",
  da_mo: "Đang mở",
  da_dong: "Đã đóng",
};

const emptyKhoanThuForm: DanhMucKhoanThuFormInput = {
  maKhoanThu: "",
  tenKhoanThu: "",
  loaiKhoanThu: "hoc_phi",
  soTienMacDinh: null,
  batBuoc: true,
};

const emptyKyThuForm: KyThuFormInput = {
  maKyThu: "",
  tenKyThu: "",
  loaiKy: "thang",
  tuNgay: "",
  denNgay: "",
  hanThanhToan: "",
};

export function FinancePage() {
  const { auth } = useAuth();

  const [khoanThuList, setKhoanThuList] = useState<DanhMucKhoanThuItem[]>(
    [],
  );
  const [kyThuList, setKyThuList] = useState<KyThuItem[]>([]);
  const [congNoList, setCongNoList] = useState<KhoanPhaiThuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showKhoanThuForm, setShowKhoanThuForm] = useState(false);
  const [khoanThuForm, setKhoanThuForm] = useState(emptyKhoanThuForm);
  const [savingKhoanThu, setSavingKhoanThu] = useState(false);

  const [showKyThuForm, setShowKyThuForm] = useState(false);
  const [kyThuForm, setKyThuForm] = useState(emptyKyThuForm);
  const [savingKyThu, setSavingKyThu] = useState(false);

  const isHeThong =
    auth?.currentOrganization?.loaiDonVi === "he_thong";

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      !isHeThong &&
      (permissions.includes("he_thong.quan_tri") ||
        permissions.includes("tai_chinh.quan_ly"))
    );
  }, [auth, isHeThong]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [khoanThuRows, kyThuRows, congNoRows] = await Promise.all([
        listDanhMucKhoanThuApi(),
        listKyThuApi(),
        isHeThong ? Promise.resolve([]) : listCongNoApi(),
      ]);
      setKhoanThuList(khoanThuRows);
      setKyThuList(kyThuRows);
      setCongNoList(congNoRows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải dữ liệu.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [auth?.currentOrganization?.id]);

  async function handleCreateKhoanThu(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingKhoanThu(true);

    try {
      const created = await createDanhMucKhoanThuApi(khoanThuForm);
      setNotice(`Đã tạo khoản thu ${created.maKhoanThu}.`);
      setKhoanThuForm(emptyKhoanThuForm);
      setShowKhoanThuForm(false);
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể tạo khoản thu.",
      );
    } finally {
      setSavingKhoanThu(false);
    }
  }

  async function handleCreateKyThu(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingKyThu(true);

    try {
      const created = await createKyThuApi(kyThuForm);
      setNotice(`Đã tạo kỳ thu ${created.maKyThu}.`);
      setKyThuForm(emptyKyThuForm);
      setShowKyThuForm(false);
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể tạo kỳ thu.",
      );
    } finally {
      setSavingKyThu(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Tài chính"
        subtitle={
          isHeThong
            ? "Xem gộp khoản thu và kỳ thu của tất cả đơn vị (chỉ xem — đơn vị hệ thống không thu tiền)"
            : "Quản lý danh mục khoản thu và kỳ thu học phí trong đơn vị đang làm việc"
        }
        action={
          <Link to="/finance/bao-cao" className="text-button">
            Báo cáo tài chính
          </Link>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard
        title="Danh mục khoản thu"
        subtitle={`${khoanThuList.length} khoản thu`}
        actions={
          canManage ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setShowKhoanThuForm((current) => !current)}
            >
              {showKhoanThuForm ? "Đóng" : "Thêm khoản thu"}
            </button>
          ) : null
        }
      >
        {showKhoanThuForm ? (
          <form
            className="user-create-form"
            onSubmit={handleCreateKhoanThu}
          >
            <TextField
              label="Mã khoản thu"
              value={khoanThuForm.maKhoanThu}
              required
              placeholder="VD: HP-THANG"
              onChange={(value) =>
                setKhoanThuForm({ ...khoanThuForm, maKhoanThu: value })
              }
            />

            <TextField
              label="Tên khoản thu"
              value={khoanThuForm.tenKhoanThu}
              required
              onChange={(value) =>
                setKhoanThuForm({ ...khoanThuForm, tenKhoanThu: value })
              }
            />

            <SelectField
              label="Loại khoản thu"
              value={khoanThuForm.loaiKhoanThu}
              required
              options={Object.entries(LOAI_KHOAN_THU_LABEL).map(
                ([value, label]) => ({ value, label }),
              )}
              onChange={(value) =>
                setKhoanThuForm({
                  ...khoanThuForm,
                  loaiKhoanThu: value as LoaiKhoanThu,
                })
              }
            />

            <CurrencyInput
              label="Số tiền mặc định"
              value={khoanThuForm.soTienMacDinh}
              onChange={(value) =>
                setKhoanThuForm({
                  ...khoanThuForm,
                  soTienMacDinh: value,
                })
              }
            />

            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={khoanThuForm.batBuoc}
                onChange={(event) =>
                  setKhoanThuForm({
                    ...khoanThuForm,
                    batBuoc: event.target.checked,
                  })
                }
              />
              Bắt buộc
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={savingKhoanThu}
            >
              {savingKhoanThu ? "Đang lưu..." : "Tạo khoản thu"}
            </button>
          </form>
        ) : (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Khoản thu</th>
                  <th>Loại</th>
                  <th>Số tiền mặc định</th>
                  <th>Bắt buộc</th>
                  <th>Trạng thái</th>
                  {isHeThong ? <th>Đơn vị</th> : null}
                </tr>
              </thead>

              <tbody>
                {khoanThuList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.tenKhoanThu}</strong>
                      <small>{item.maKhoanThu}</small>
                    </td>
                    <td>{LOAI_KHOAN_THU_LABEL[item.loaiKhoanThu]}</td>
                    <td>
                      {item.soTienMacDinh
                        ? `${Number(item.soTienMacDinh).toLocaleString("vi-VN")} ₫`
                        : "—"}
                    </td>
                    <td>{item.batBuoc === "co" ? "Có" : "Không"}</td>
                    <td>
                      <span
                        className={`status-badge status-badge--${item.trangThai}`}
                      >
                        {item.trangThai === "hoat_dong"
                          ? "Hoạt động"
                          : "Ngừng áp dụng"}
                      </span>
                    </td>
                    {isHeThong ? (
                      <td>{item.donVi?.tenDonVi ?? "—"}</td>
                    ) : null}
                  </tr>
                ))}

                {khoanThuList.length === 0 ? (
                  <tr>
                    <td colSpan={isHeThong ? 6 : 5} className="empty-cell">
                      Chưa có khoản thu nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Kỳ thu"
        subtitle={
          loading ? "Đang tải dữ liệu..." : `${kyThuList.length} kỳ thu`
        }
        actions={
          canManage ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setShowKyThuForm((current) => !current)}
            >
              {showKyThuForm ? "Đóng" : "Thêm kỳ thu"}
            </button>
          ) : null
        }
      >
        {showKyThuForm ? (
          <form className="user-create-form" onSubmit={handleCreateKyThu}>
            <TextField
              label="Mã kỳ thu"
              value={kyThuForm.maKyThu}
              required
              placeholder="VD: HP-T8-2026"
              onChange={(value) =>
                setKyThuForm({ ...kyThuForm, maKyThu: value })
              }
            />

            <TextField
              label="Tên kỳ thu"
              value={kyThuForm.tenKyThu}
              required
              onChange={(value) =>
                setKyThuForm({ ...kyThuForm, tenKyThu: value })
              }
            />

            <SelectField
              label="Loại kỳ"
              value={kyThuForm.loaiKy}
              required
              options={Object.entries(LOAI_KY_LABEL).map(
                ([value, label]) => ({ value, label }),
              )}
              onChange={(value) =>
                setKyThuForm({ ...kyThuForm, loaiKy: value as LoaiKy })
              }
            />

            <DateField
              label="Từ ngày"
              value={kyThuForm.tuNgay}
              required
              onChange={(value) =>
                setKyThuForm({ ...kyThuForm, tuNgay: value })
              }
            />

            <DateField
              label="Đến ngày"
              value={kyThuForm.denNgay}
              required
              onChange={(value) =>
                setKyThuForm({ ...kyThuForm, denNgay: value })
              }
            />

            <DateField
              label="Hạn thanh toán"
              value={kyThuForm.hanThanhToan}
              onChange={(value) =>
                setKyThuForm({ ...kyThuForm, hanThanhToan: value })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={savingKyThu}
            >
              {savingKyThu ? "Đang lưu..." : "Tạo kỳ thu"}
            </button>
          </form>
        ) : (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Kỳ thu</th>
                  <th>Loại kỳ</th>
                  <th>Thời gian áp dụng</th>
                  <th>Hạn thanh toán</th>
                  <th>Trạng thái</th>
                  {isHeThong ? <th>Đơn vị</th> : null}
                </tr>
              </thead>

              <tbody>
                {kyThuList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {isHeThong ? (
                        <strong>{item.tenKyThu}</strong>
                      ) : (
                        <Link
                          to={`/finance/ky-thu/${item.id}`}
                          className="text-button"
                        >
                          <strong>{item.tenKyThu}</strong>
                        </Link>
                      )}
                      <small>{item.maKyThu}</small>
                    </td>
                    <td>{LOAI_KY_LABEL[item.loaiKy]}</td>
                    <td>
                      {item.tuNgay} → {item.denNgay}
                    </td>
                    <td>{item.hanThanhToan || "—"}</td>
                    <td>
                      <span
                        className={`status-badge status-badge--${item.trangThai}`}
                      >
                        {KY_THU_TRANG_THAI_LABEL[item.trangThai]}
                      </span>
                    </td>
                    {isHeThong ? (
                      <td>{item.donVi?.tenDonVi ?? "—"}</td>
                    ) : null}
                  </tr>
                ))}

                {!loading && kyThuList.length === 0 ? (
                  <tr>
                    <td colSpan={isHeThong ? 6 : 5} className="empty-cell">
                      Chưa có kỳ thu nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {!isHeThong ? (
        <SectionCard
          title="Công nợ"
          subtitle={`${congNoList.length} khoản còn phải thu`}
        >
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Kỳ thu</th>
                  <th>Còn lại</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {congNoList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.hocSinh.hoTen}</strong>
                      <small>{item.hocSinh.maHocSinh}</small>
                    </td>
                    <td>
                      {item.kyThu ? (
                        <Link
                          to={`/finance/ky-thu/${item.kyThu.id}`}
                          className="text-button"
                        >
                          {item.kyThu.tenKyThu}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{formatTien(item.conLai)}</td>
                    <td>
                      <span
                        className={`status-badge status-badge--${item.trangThai}`}
                      >
                        {item.trangThai === "chua_thu"
                          ? "Chưa thu"
                          : "Thu một phần"}
                      </span>
                    </td>
                  </tr>
                ))}

                {congNoList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      Không còn khoản nào phải thu.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
