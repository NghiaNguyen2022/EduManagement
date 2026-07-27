import { useEffect, useMemo, useState } from "react";

import { CurrencyInput, DateField, SelectField, TextField } from "../components/form";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { OrgLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";
import {
  createChiPhiApi,
  createDanhMucChiPhiApi,
  duyetChiPhiApi,
  duyetDanhMucChiPhiApi,
  getCauHinhTaiChinhDonViApi,
  listChiPhiApi,
  listDanhMucChiPhiApi,
  setDanhMucChiPhiStatusApi,
  updateCauHinhTaiChinhDonViApi,
} from "../features/taiChinh/taiChinhApi";
import type {
  CauHinhTaiChinhDonVi,
  ChiPhiItem,
  DanhMucChiPhiItem,
  LoaiChiPhi,
  LoaiDeXuatChi,
  TrangThaiChiPhi,
} from "../features/taiChinh/taiChinhTypes";

const LOAI_CHI_PHI_LABEL: Record<LoaiChiPhi, string> = {
  luong: "Lương",
  mat_bang: "Mặt bằng",
  dien_nuoc: "Điện nước",
  vat_tu: "Vật tư",
  marketing: "Marketing",
  khac: "Khác",
};

const TRANG_THAI_CHI_PHI_LABEL: Record<TrangThaiChiPhi, string> = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
};

const TRANG_THAI_DUYET_DANH_MUC_LABEL: Record<string, string> = {
  khong_can_duyet: "Không cần duyệt",
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
};

const LOAI_DE_XUAT_LABEL: Record<LoaiDeXuatChi, string> = {
  dinh_ky: "Định kỳ",
  dot_xuat: "Đột xuất",
};

function formatTien(value: string) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

function firstDayOfMonth() {
  return `${new Date().toISOString().slice(0, 7)}-01`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyDanhMucForm = { tenChiPhi: "", loaiChiPhi: "khac" as LoaiChiPhi };
const emptyChiPhiForm = {
  danhMucChiPhiId: "",
  soTien: null as number | null,
  ngayChi: today(),
  moTa: "",
  loaiDeXuat: "dinh_ky" as LoaiDeXuatChi,
};

type PendingDuyet = {
  chiPhi: ChiPhiItem;
  quyetDinh: "duyet" | "tu_choi";
};

type PendingDuyetDanhMuc = {
  danhMuc: DanhMucChiPhiItem;
  quyetDinh: "duyet" | "tu_choi";
};

export function ChiPhiPage() {
  const { auth } = useAuth();
  const isHeThong = auth?.currentOrganization?.loaiDonVi === "he_thong";

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      !isHeThong &&
      (permissions.includes("he_thong.quan_tri") || permissions.includes("tai_chinh.quan_ly"))
    );
  }, [auth, isHeThong]);

  const canDuyet = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      !isHeThong &&
      (permissions.includes("he_thong.quan_tri") || permissions.includes("tai_chinh.duyet"))
    );
  }, [auth, isHeThong]);

  // Chỉ quản lý đơn vị/quản trị hệ thống cấu hình được — kế toán không tự
  // cấp quyền tự chủ cho chính mình (xem docs/analysis/CHI_PHI_CAU_HINH_DUYET.md).
  const canConfigDuyet = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      !isHeThong &&
      (permissions.includes("he_thong.quan_tri") || permissions.includes("don_vi.quan_ly"))
    );
  }, [auth, isHeThong]);

  const [cauHinh, setCauHinh] = useState<CauHinhTaiChinhDonVi | null>(null);
  const [savingCauHinh, setSavingCauHinh] = useState(false);
  const [pendingDuyetDanhMuc, setPendingDuyetDanhMuc] = useState<PendingDuyetDanhMuc | null>(null);

  const [danhMucList, setDanhMucList] = useState<DanhMucChiPhiItem[]>([]);
  const [chiPhiList, setChiPhiList] = useState<ChiPhiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [tuNgay, setTuNgay] = useState(firstDayOfMonth());
  const [denNgay, setDenNgay] = useState(today());
  const [trangThai, setTrangThai] = useState<TrangThaiChiPhi | "">("cho_duyet");

  const [showDanhMucForm, setShowDanhMucForm] = useState(false);
  const [danhMucForm, setDanhMucForm] = useState(emptyDanhMucForm);
  const [savingDanhMuc, setSavingDanhMuc] = useState(false);

  const [showChiPhiForm, setShowChiPhiForm] = useState(false);
  const [chiPhiForm, setChiPhiForm] = useState(emptyChiPhiForm);
  const [savingChiPhi, setSavingChiPhi] = useState(false);

  const [pendingDuyet, setPendingDuyet] = useState<PendingDuyet | null>(null);
  const [duyetBusy, setDuyetBusy] = useState(false);
  const [duyetError, setDuyetError] = useState("");

  useUnsavedChangesGuard(
    JSON.stringify(danhMucForm) !== JSON.stringify(emptyDanhMucForm) ||
      JSON.stringify(chiPhiForm) !== JSON.stringify(emptyChiPhiForm),
  );

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [danhMucRows, chiPhiRows] = await Promise.all([
        isHeThong ? Promise.resolve([]) : listDanhMucChiPhiApi(),
        listChiPhiApi({ tuNgay, denNgay, trangThai: trangThai || undefined }),
      ]);
      setDanhMucList(danhMucRows);
      setChiPhiList(chiPhiRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.currentOrganization?.id, tuNgay, denNgay, trangThai]);

  useEffect(() => {
    if (isHeThong) {
      setCauHinh(null);
      return;
    }

    getCauHinhTaiChinhDonViApi()
      .then(setCauHinh)
      .catch(() => setCauHinh(null));
  }, [auth?.currentOrganization?.id, isHeThong]);

  async function handleSaveCauHinh() {
    if (!cauHinh) return;

    setError("");
    setNotice("");
    setSavingCauHinh(true);

    try {
      const updated = await updateCauHinhTaiChinhDonViApi({
        duyetDanhMucChiPhi: cauHinh.duyetDanhMucChiPhi,
        duyetChiDinhKy: cauHinh.duyetChiDinhKy,
        duyetChiDotXuat: cauHinh.duyetChiDotXuat,
      });
      setCauHinh(updated);
      setNotice("Đã lưu cấu hình duyệt chi.");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Không thể lưu cấu hình duyệt chi.",
      );
    } finally {
      setSavingCauHinh(false);
    }
  }

  async function handleConfirmDuyetDanhMuc() {
    if (!pendingDuyetDanhMuc) return;

    setDuyetBusy(true);
    setDuyetError("");

    try {
      await duyetDanhMucChiPhiApi(pendingDuyetDanhMuc.danhMuc.id, {
        quyetDinh: pendingDuyetDanhMuc.quyetDinh,
      });
      setPendingDuyetDanhMuc(null);
      await loadData();
    } catch (submitError) {
      setDuyetError(
        submitError instanceof Error ? submitError.message : "Không thể xử lý danh mục chi phí.",
      );
    } finally {
      setDuyetBusy(false);
    }
  }

  async function handleCreateDanhMuc(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingDanhMuc(true);

    try {
      const created = await createDanhMucChiPhiApi(danhMucForm);
      setNotice(`Đã tạo danh mục chi phí ${created.maChiPhi}.`);
      setDanhMucForm(emptyDanhMucForm);
      setShowDanhMucForm(false);
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể tạo danh mục chi phí.");
    } finally {
      setSavingDanhMuc(false);
    }
  }

  async function handleToggleDanhMucStatus(item: DanhMucChiPhiItem) {
    setError("");
    setNotice("");

    try {
      const trangThaiMoi = item.trangThai === "hoat_dong" ? "ngung_ap_dung" : "hoat_dong";
      await setDanhMucChiPhiStatusApi(item.id, trangThaiMoi);
      setNotice(`Đã đổi trạng thái ${item.tenChiPhi}.`);
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Không thể đổi trạng thái danh mục chi phí.",
      );
    }
  }

  async function handleCreateChiPhi(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!chiPhiForm.danhMucChiPhiId) {
      setError("Vui lòng chọn danh mục chi phí.");
      return;
    }

    setSavingChiPhi(true);

    try {
      await createChiPhiApi({
        danhMucChiPhiId: Number(chiPhiForm.danhMucChiPhiId),
        soTien: chiPhiForm.soTien ?? 0,
        ngayChi: chiPhiForm.ngayChi,
        moTa: chiPhiForm.moTa || undefined,
        loaiDeXuat: chiPhiForm.loaiDeXuat,
      });
      setNotice("Đã tạo đề xuất chi, chờ duyệt.");
      setChiPhiForm(emptyChiPhiForm);
      setShowChiPhiForm(false);
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể tạo đề xuất chi.");
    } finally {
      setSavingChiPhi(false);
    }
  }

  async function handleConfirmDuyet() {
    if (!pendingDuyet) return;

    setDuyetBusy(true);
    setDuyetError("");

    try {
      await duyetChiPhiApi(pendingDuyet.chiPhi.id, { quyetDinh: pendingDuyet.quyetDinh });
      setPendingDuyet(null);
      await loadData();
    } catch (submitError) {
      setDuyetError(
        submitError instanceof Error ? submitError.message : "Không thể xử lý đề xuất chi.",
      );
    } finally {
      setDuyetBusy(false);
    }
  }

  const tongChi = chiPhiList.reduce((sum, item) => sum + Number(item.soTien), 0);

  return (
    <div className="page-stack">
      <PageHeader
        title="Chi phí"
        subtitle={
          isHeThong
            ? "Xem gộp chi phí của tất cả đơn vị (chỉ xem — đề xuất tại đúng đơn vị)"
            : "Đề xuất và duyệt chi phí vận hành tại đơn vị — chỉ tính vào báo cáo sau khi được duyệt"
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      {canConfigDuyet && cauHinh ? (
        <SectionCard
          title="Cấu hình duyệt chi"
          subtitle="Bật để bắt buộc quản lý đơn vị duyệt trước, tắt để kế toán tự chủ không cần duyệt"
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", marginBottom: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={cauHinh.duyetDanhMucChiPhi}
                onChange={(event) =>
                  setCauHinh({ ...cauHinh, duyetDanhMucChiPhi: event.target.checked })
                }
              />
              Danh mục chi phí cần duyệt
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={cauHinh.duyetChiDinhKy}
                onChange={(event) =>
                  setCauHinh({ ...cauHinh, duyetChiDinhKy: event.target.checked })
                }
              />
              Đề xuất chi định kỳ cần duyệt
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={cauHinh.duyetChiDotXuat}
                onChange={(event) =>
                  setCauHinh({ ...cauHinh, duyetChiDotXuat: event.target.checked })
                }
              />
              Đề xuất chi đột xuất cần duyệt
            </label>
          </div>

          <button
            type="button"
            className="primary-button"
            disabled={savingCauHinh}
            onClick={() => void handleSaveCauHinh()}
          >
            {savingCauHinh ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </SectionCard>
      ) : null}

      {!isHeThong ? (
        <SectionCard
          title="Danh mục chi phí"
          subtitle={`${danhMucList.length} danh mục`}
          actions={
            canManage ? (
              <button
                type="button"
                className="text-button"
                onClick={() => setShowDanhMucForm((current) => !current)}
              >
                {showDanhMucForm ? "Đóng" : "Thêm danh mục"}
              </button>
            ) : null
          }
        >
          {showDanhMucForm ? (
            <form className="user-create-form" onSubmit={handleCreateDanhMuc}>
              <TextField
                label="Tên chi phí"
                value={danhMucForm.tenChiPhi}
                required
                onChange={(value) => setDanhMucForm({ ...danhMucForm, tenChiPhi: value })}
              />

              <SelectField
                label="Loại chi phí"
                value={danhMucForm.loaiChiPhi}
                required
                options={Object.entries(LOAI_CHI_PHI_LABEL).map(([value, label]) => ({
                  value,
                  label,
                }))}
                onChange={(value) =>
                  setDanhMucForm({ ...danhMucForm, loaiChiPhi: value as LoaiChiPhi })
                }
              />

              <button type="submit" className="primary-button" disabled={savingDanhMuc}>
                {savingDanhMuc ? "Đang lưu..." : "Tạo danh mục"}
              </button>
            </form>
          ) : (
            <div className="user-table-wrap">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Chi phí</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Duyệt</th>
                    {canManage || canDuyet ? <th>Thao tác</th> : null}
                  </tr>
                </thead>

                <tbody>
                  {danhMucList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.tenChiPhi}</strong>
                        <small>{item.maChiPhi}</small>
                      </td>
                      <td>{LOAI_CHI_PHI_LABEL[item.loaiChiPhi]}</td>
                      <td>
                        <span className={`status-badge status-badge--${item.trangThai}`}>
                          {item.trangThai === "hoat_dong" ? "Hoạt động" : "Ngừng áp dụng"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-badge--${item.trangThaiDuyet}`}>
                          {TRANG_THAI_DUYET_DANH_MUC_LABEL[item.trangThaiDuyet]}
                        </span>
                      </td>
                      {canManage || canDuyet ? (
                        <td>
                          <div className="row-actions">
                            {canManage ? (
                              <button
                                type="button"
                                className="text-button"
                                onClick={() => void handleToggleDanhMucStatus(item)}
                              >
                                {item.trangThai === "hoat_dong" ? "Ngừng áp dụng" : "Kích hoạt"}
                              </button>
                            ) : null}
                            {canDuyet && item.trangThaiDuyet === "cho_duyet" ? (
                              item.nguoiTaoId === auth?.user.id ? (
                                <small>Không thể tự duyệt</small>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="text-button"
                                    onClick={() =>
                                      setPendingDuyetDanhMuc({ danhMuc: item, quyetDinh: "duyet" })
                                    }
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    type="button"
                                    className="text-button"
                                    onClick={() =>
                                      setPendingDuyetDanhMuc({
                                        danhMuc: item,
                                        quyetDinh: "tu_choi",
                                      })
                                    }
                                  >
                                    Từ chối
                                  </button>
                                </>
                              )
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}

                  {danhMucList.length === 0 ? (
                    <tr>
                      <td colSpan={canManage || canDuyet ? 5 : 4} className="empty-cell">
                        Chưa có danh mục chi phí nào.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      ) : null}

      <SectionCard
        title="Danh sách đề xuất chi"
        subtitle={loading ? "Đang tải dữ liệu..." : `${chiPhiList.length} khoản · Tổng ${formatTien(String(tongChi))}`}
        actions={
          canManage ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setShowChiPhiForm((current) => !current)}
            >
              {showChiPhiForm ? "Đóng" : "Đề xuất chi"}
            </button>
          ) : null
        }
      >
        <div className="user-toolbar">
          <DateField label="Từ ngày" value={tuNgay} onChange={setTuNgay} />
          <DateField label="Đến ngày" value={denNgay} onChange={setDenNgay} />
          <SelectField
            label="Trạng thái"
            value={trangThai}
            placeholder="Tất cả"
            options={[
              { value: "cho_duyet", label: "Chờ duyệt" },
              { value: "da_duyet", label: "Đã duyệt" },
              { value: "tu_choi", label: "Từ chối" },
            ]}
            onChange={(value) => setTrangThai(value as TrangThaiChiPhi | "")}
          />
        </div>

        {showChiPhiForm ? (
          <form className="user-create-form" onSubmit={handleCreateChiPhi}>
            <SelectField
              label="Danh mục chi phí"
              value={chiPhiForm.danhMucChiPhiId}
              required
              options={danhMucList
                .filter(
                  (item) =>
                    item.trangThai === "hoat_dong" &&
                    item.trangThaiDuyet !== "cho_duyet" &&
                    item.trangThaiDuyet !== "tu_choi",
                )
                .map((item) => ({ value: String(item.id), label: item.tenChiPhi }))}
              onChange={(value) => setChiPhiForm({ ...chiPhiForm, danhMucChiPhiId: value })}
            />

            <SelectField
              label="Loại đề xuất"
              value={chiPhiForm.loaiDeXuat}
              required
              options={Object.entries(LOAI_DE_XUAT_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(value) =>
                setChiPhiForm({ ...chiPhiForm, loaiDeXuat: value as LoaiDeXuatChi })
              }
            />

            <CurrencyInput
              label="Số tiền"
              value={chiPhiForm.soTien}
              onChange={(value) => setChiPhiForm({ ...chiPhiForm, soTien: value })}
            />

            <DateField
              label="Ngày chi"
              value={chiPhiForm.ngayChi}
              required
              onChange={(value) => setChiPhiForm({ ...chiPhiForm, ngayChi: value })}
            />

            <TextField
              label="Mô tả"
              value={chiPhiForm.moTa}
              onChange={(value) => setChiPhiForm({ ...chiPhiForm, moTa: value })}
            />

            <button type="submit" className="primary-button" disabled={savingChiPhi}>
              {savingChiPhi ? "Đang lưu..." : "Tạo đề xuất"}
            </button>
          </form>
        ) : (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Ngày chi</th>
                  <th>Chi phí</th>
                  <th>Loại chi phí</th>
                  <th>Loại đề xuất</th>
                  <th>Số tiền</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Người tạo</th>
                  <th>Người duyệt</th>
                  {isHeThong ? <th>Đơn vị</th> : null}
                  {canDuyet ? <th>Thao tác</th> : null}
                </tr>
              </thead>

              <tbody>
                {chiPhiList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.ngayChi}</td>
                    <td>
                      <strong>{item.danhMuc.tenChiPhi}</strong>
                      <small>{item.danhMuc.maChiPhi}</small>
                    </td>
                    <td>{LOAI_CHI_PHI_LABEL[item.danhMuc.loaiChiPhi]}</td>
                    <td>{LOAI_DE_XUAT_LABEL[item.loaiDeXuat]}</td>
                    <td>{formatTien(item.soTien)}</td>
                    <td>{item.moTa ?? "—"}</td>
                    <td>
                      <span className={`status-badge status-badge--${item.trangThai}`}>
                        {TRANG_THAI_CHI_PHI_LABEL[item.trangThai]}
                      </span>
                    </td>
                    <td>{item.nguoiTao.hoTen}</td>
                    <td>{item.nguoiDuyet?.hoTen ?? "—"}</td>
                    {isHeThong ? (
                      <td>
                        <OrgLink donVi={item.donVi} to="/finance/chi-phi" />
                      </td>
                    ) : null}
                    {canDuyet ? (
                      <td>
                        {item.trangThai === "cho_duyet" && !isHeThong ? (
                          item.nguoiTaoId === auth?.user.id ? (
                            <small>Không thể tự duyệt đề xuất của mình</small>
                          ) : (
                            <div className="row-actions">
                              <button
                                type="button"
                                className="text-button"
                                onClick={() =>
                                  setPendingDuyet({ chiPhi: item, quyetDinh: "duyet" })
                                }
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                className="text-button"
                                onClick={() =>
                                  setPendingDuyet({ chiPhi: item, quyetDinh: "tu_choi" })
                                }
                              >
                                Từ chối
                              </button>
                            </div>
                          )
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                ))}

                {chiPhiList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        7 + (isHeThong ? 1 : 0) + (canDuyet ? 1 : 0) + 2
                      }
                      className="empty-cell"
                    >
                      Không có khoản chi nào trong khoảng thời gian này.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={pendingDuyet !== null}
        title={pendingDuyet?.quyetDinh === "duyet" ? "Duyệt đề xuất chi" : "Từ chối đề xuất chi"}
        message={
          pendingDuyet
            ? `${pendingDuyet.quyetDinh === "duyet" ? "Duyệt" : "Từ chối"} đề xuất chi ${
                pendingDuyet.chiPhi.danhMuc.tenChiPhi
              }: ${formatTien(pendingDuyet.chiPhi.soTien)} ngày ${pendingDuyet.chiPhi.ngayChi}?`
            : ""
        }
        confirmLabel={pendingDuyet?.quyetDinh === "duyet" ? "Duyệt" : "Từ chối"}
        danger={pendingDuyet?.quyetDinh === "tu_choi"}
        busy={duyetBusy}
        error={duyetError}
        onConfirm={() => void handleConfirmDuyet()}
        onCancel={() => {
          setPendingDuyet(null);
          setDuyetError("");
        }}
      />

      <ConfirmDialog
        open={pendingDuyetDanhMuc !== null}
        title={
          pendingDuyetDanhMuc?.quyetDinh === "duyet"
            ? "Duyệt danh mục chi phí"
            : "Từ chối danh mục chi phí"
        }
        message={
          pendingDuyetDanhMuc
            ? `${pendingDuyetDanhMuc.quyetDinh === "duyet" ? "Duyệt" : "Từ chối"} danh mục ${
                pendingDuyetDanhMuc.danhMuc.tenChiPhi
              } (${pendingDuyetDanhMuc.danhMuc.maChiPhi})?`
            : ""
        }
        confirmLabel={pendingDuyetDanhMuc?.quyetDinh === "duyet" ? "Duyệt" : "Từ chối"}
        danger={pendingDuyetDanhMuc?.quyetDinh === "tu_choi"}
        busy={duyetBusy}
        error={duyetError}
        onConfirm={() => void handleConfirmDuyetDanhMuc()}
        onCancel={() => {
          setPendingDuyetDanhMuc(null);
          setDuyetError("");
        }}
      />
    </div>
  );
}
