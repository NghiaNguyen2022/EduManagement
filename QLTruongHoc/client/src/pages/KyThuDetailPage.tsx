import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  CurrencyInput,
  DateField,
  SelectField,
  TextField,
} from "../components/form";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import { listLopHocApi } from "../features/lopHoc/lopHocApi";
import type { LopHocItem } from "../features/lopHoc/lopHocTypes";
import {
  useGuardedNavigate,
  useUnsavedChangesGuard,
} from "../features/navigation/UnsavedChangesContext";
import {
  capNhatGiamTruApi,
  dongKyThuApi,
  getKyThuDetailApi,
  listDanhMucKhoanThuApi,
  listKhoanPhaiThuApi,
  listPhieuThuApi,
  moKyThuApi,
  setKhoanApDungKyThuApi,
  sinhKhoanPhaiThuApi,
  thuTienApi,
  updateKyThuApi,
} from "../features/taiChinh/taiChinhApi";
import type {
  DanhMucKhoanThuItem,
  KhoanPhaiThuItem,
  KyThuDetail,
  KyThuFormInput,
  LoaiKy,
  PhieuThuItem,
} from "../features/taiChinh/taiChinhTypes";

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

const KHOAN_PHAI_THU_TRANG_THAI_LABEL: Record<string, string> = {
  chua_thu: "Chưa thu",
  thu_mot_phan: "Thu một phần",
  da_thu_du: "Đã thu đủ",
};

const PHUONG_THUC_LABEL: Record<string, string> = {
  tien_mat: "Tiền mặt",
  chuyen_khoan: "Chuyển khoản",
  the: "Thẻ",
  khac: "Khác",
};

function formatTien(value: string) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

type ActivePanel =
  | { type: "thu_tien"; item: KhoanPhaiThuItem }
  | { type: "mien_giam"; item: KhoanPhaiThuItem }
  | { type: "lich_su"; item: KhoanPhaiThuItem };

type ChonKhoanThu = {
  danhMucKhoanThuId: number;
  chon: boolean;
  soTien: number | null;
};

export function KyThuDetailPage() {
  const { id } = useParams();
  const navigate = useGuardedNavigate();
  const { auth } = useAuth();

  const [detail, setDetail] = useState<KyThuDetail | null>(null);
  const [khoanThuList, setKhoanThuList] = useState<DanhMucKhoanThuItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [infoForm, setInfoForm] = useState<KyThuFormInput | null>(null);
  const [loadedInfoForm, setLoadedInfoForm] =
    useState<KyThuFormInput | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);

  const [chonKhoanThu, setChonKhoanThu] = useState<ChonKhoanThu[]>([]);
  const [loadedChonKhoanThu, setLoadedChonKhoanThu] = useState<
    ChonKhoanThu[]
  >([]);
  const [savingKhoanThu, setSavingKhoanThu] = useState(false);

  const [confirmAction, setConfirmAction] = useState<
    "mo" | "dong" | null
  >(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const [lopHocList, setLopHocList] = useState<LopHocItem[]>([]);
  const [sinhLopHocId, setSinhLopHocId] = useState("");
  const [sinhBusy, setSinhBusy] = useState(false);

  const [khoanPhaiThuList, setKhoanPhaiThuList] = useState<
    KhoanPhaiThuItem[]
  >([]);
  const [loadingKhoanPhaiThu, setLoadingKhoanPhaiThu] = useState(false);

  const [activePanel, setActivePanel] = useState<ActivePanel | null>(null);
  const [panelError, setPanelError] = useState("");
  const [panelBusy, setPanelBusy] = useState(false);

  const [payAmount, setPayAmount] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState("tien_mat");
  const [payNote, setPayNote] = useState("");

  const [discountAmount, setDiscountAmount] = useState<number | null>(
    null,
  );

  const [phieuThuList, setPhieuThuList] = useState<PhieuThuItem[]>([]);
  const [loadingPhieuThu, setLoadingPhieuThu] = useState(false);

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("tai_chinh.quan_ly")
    );
  }, [auth]);

  useUnsavedChangesGuard(
    activePanel !== null ||
      (loadedInfoForm !== null &&
        JSON.stringify(infoForm) !== JSON.stringify(loadedInfoForm)) ||
      JSON.stringify(chonKhoanThu) !== JSON.stringify(loadedChonKhoanThu),
  );

  async function loadKhoanPhaiThu() {
    if (!id) return;

    setLoadingKhoanPhaiThu(true);

    try {
      const rows = await listKhoanPhaiThuApi(Number(id));
      setKhoanPhaiThuList(rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách khoản phải thu.",
      );
    } finally {
      setLoadingKhoanPhaiThu(false);
    }
  }

  async function loadData() {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const [detailData, khoanThuRows, lopHocRows] = await Promise.all([
        getKyThuDetailApi(Number(id)),
        listDanhMucKhoanThuApi(),
        listLopHocApi(),
      ]);

      setDetail(detailData);
      setKhoanThuList(khoanThuRows);
      setLopHocList(lopHocRows);

      const nextInfoForm = {
        maKyThu: detailData.kyThu.maKyThu,
        tenKyThu: detailData.kyThu.tenKyThu,
        loaiKy: detailData.kyThu.loaiKy,
        tuNgay: detailData.kyThu.tuNgay,
        denNgay: detailData.kyThu.denNgay,
        hanThanhToan: detailData.kyThu.hanThanhToan ?? "",
      };
      setInfoForm(nextInfoForm);
      setLoadedInfoForm(nextInfoForm);

      const apDungMap = new Map(
        detailData.khoanApDung.map((item) => [
          item.danhMucKhoanThuId,
          item,
        ]),
      );

      const nextChonKhoanThu = khoanThuRows.map((item) => {
        const apDung = apDungMap.get(item.id);
        return {
          danhMucKhoanThuId: item.id,
          chon: Boolean(apDung),
          soTien: apDung
            ? Number(apDung.soTien)
            : item.soTienMacDinh
              ? Number(item.soTienMacDinh)
              : null,
        };
      });
      setChonKhoanThu(nextChonKhoanThu);
      setLoadedChonKhoanThu(nextChonKhoanThu);

      if (detailData.kyThu.trangThai !== "nhap") {
        const khoanPhaiThuRows = await listKhoanPhaiThuApi(Number(id));
        setKhoanPhaiThuList(khoanPhaiThuRows);
      }
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
  }, [id, auth?.currentOrganization?.id]);

  async function handleSaveInfo(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!infoForm || !id) return;

    setError("");
    setNotice("");
    setSavingInfo(true);

    try {
      await updateKyThuApi(Number(id), infoForm);
      setNotice("Đã cập nhật thông tin kỳ thu.");
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể cập nhật kỳ thu.",
      );
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleSaveKhoanApDung() {
    if (!id) return;

    setError("");
    setNotice("");
    setSavingKhoanThu(true);

    try {
      const danhSach = chonKhoanThu
        .filter((item) => item.chon)
        .map((item) => ({
          danhMucKhoanThuId: item.danhMucKhoanThuId,
          soTien: item.soTien ?? 0,
        }));

      await setKhoanApDungKyThuApi(Number(id), danhSach);
      setNotice("Đã cập nhật khoản thu áp dụng.");
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể cập nhật khoản thu áp dụng.",
      );
    } finally {
      setSavingKhoanThu(false);
    }
  }

  async function handleConfirmAction() {
    if (!id || !confirmAction) return;

    setConfirmBusy(true);
    setConfirmError("");

    try {
      if (confirmAction === "mo") {
        await moKyThuApi(Number(id));
        setNotice("Đã mở kỳ thu.");
      } else {
        await dongKyThuApi(Number(id));
        setNotice("Đã đóng kỳ thu.");
      }

      setConfirmAction(null);
      await loadData();
    } catch (actionError) {
      setConfirmError(
        actionError instanceof Error
          ? actionError.message
          : "Không thể thực hiện thao tác.",
      );
    } finally {
      setConfirmBusy(false);
    }
  }

  async function handleSinhKhoanPhaiThu() {
    if (!id || !sinhLopHocId) return;

    setError("");
    setNotice("");
    setSinhBusy(true);

    try {
      const result = await sinhKhoanPhaiThuApi(
        Number(id),
        Number(sinhLopHocId),
      );
      setNotice(
        `Đã sinh khoản phải thu: ${result.daTao} học sinh mới, bỏ qua ${result.boQua} (đã có sẵn) trên tổng ${result.tongSoHocSinh} học sinh đang học.`,
      );
      await loadKhoanPhaiThu();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể sinh khoản phải thu.",
      );
    } finally {
      setSinhBusy(false);
    }
  }

  function openPanel(panel: ActivePanel) {
    setActivePanel(panel);
    setPanelError("");

    if (panel.type === "thu_tien") {
      setPayAmount(Number(panel.item.conLai));
      setPayMethod("tien_mat");
      setPayNote("");
    } else if (panel.type === "mien_giam") {
      setDiscountAmount(Number(panel.item.giamTru));
    } else {
      setPhieuThuList([]);
      setLoadingPhieuThu(true);
      listPhieuThuApi(panel.item.id)
        .then(setPhieuThuList)
        .catch((loadError) =>
          setPanelError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải lịch sử thu.",
          ),
        )
        .finally(() => setLoadingPhieuThu(false));
    }
  }

  function closePanel() {
    setActivePanel(null);
    setPanelError("");
  }

  async function handleSubmitThuTien() {
    if (activePanel?.type !== "thu_tien" || payAmount === null) return;

    setPanelBusy(true);
    setPanelError("");

    try {
      await thuTienApi(activePanel.item.id, {
        soTien: payAmount,
        phuongThuc: payMethod,
        ghiChu: payNote.trim() || undefined,
      });
      setNotice(`Đã ghi nhận thu tiền cho ${activePanel.item.hocSinh.hoTen}.`);
      closePanel();
      await loadKhoanPhaiThu();
    } catch (submitError) {
      setPanelError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể ghi nhận thu tiền.",
      );
    } finally {
      setPanelBusy(false);
    }
  }

  async function handleSubmitMienGiam() {
    if (activePanel?.type !== "mien_giam" || discountAmount === null) return;

    setPanelBusy(true);
    setPanelError("");

    try {
      await capNhatGiamTruApi(activePanel.item.id, discountAmount);
      setNotice(`Đã cập nhật giảm trừ cho ${activePanel.item.hocSinh.hoTen}.`);
      closePanel();
      await loadKhoanPhaiThu();
    } catch (submitError) {
      setPanelError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể cập nhật giảm trừ.",
      );
    } finally {
      setPanelBusy(false);
    }
  }

  if (loading || !detail || !infoForm) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Kỳ thu"
          subtitle={error || "Đang tải dữ liệu..."}
        />
      </div>
    );
  }

  const dangNhap = detail.kyThu.trangThai === "nhap";
  const dangMo = detail.kyThu.trangThai === "da_mo";

  return (
    <div className="page-stack">
      <PageHeader
        title={detail.kyThu.tenKyThu}
        subtitle={`Mã kỳ thu ${detail.kyThu.maKyThu}`}
        action={
          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/finance")}
          >
            ← Tài chính
          </button>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard
        title="Trạng thái"
        subtitle={`Hiện tại: ${KY_THU_TRANG_THAI_LABEL[detail.kyThu.trangThai]}`}
        actions={
          canManage ? (
            <div className="row-actions">
              {dangNhap ? (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setConfirmAction("mo")}
                >
                  Mở kỳ thu
                </button>
              ) : null}

              {dangMo ? (
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => setConfirmAction("dong")}
                >
                  Đóng kỳ thu
                </button>
              ) : null}
            </div>
          ) : null
        }
      >
        <p>
          {dangNhap
            ? "Kỳ thu đang ở dạng nháp, có thể sửa thông tin và khoản thu áp dụng."
            : dangMo
              ? "Kỳ thu đang mở."
              : "Kỳ thu đã đóng, không thể thay đổi."}
        </p>
      </SectionCard>

      <SectionCard
        title="Thông tin kỳ thu"
        subtitle={
          dangNhap
            ? undefined
            : "Kỳ thu đã mở/đóng, không thể sửa thông tin."
        }
      >
        <form className="user-create-form" onSubmit={handleSaveInfo}>
          <TextField
            label="Mã kỳ thu"
            value={infoForm.maKyThu}
            disabled
            onChange={() => {}}
          />

          <TextField
            label="Tên kỳ thu"
            value={infoForm.tenKyThu}
            required
            disabled={!dangNhap || !canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, tenKyThu: value })
            }
          />

          <SelectField
            label="Loại kỳ"
            value={infoForm.loaiKy}
            required
            disabled={!dangNhap || !canManage}
            options={Object.entries(LOAI_KY_LABEL).map(
              ([value, label]) => ({ value, label }),
            )}
            onChange={(value) =>
              setInfoForm({ ...infoForm, loaiKy: value as LoaiKy })
            }
          />

          <DateField
            label="Từ ngày"
            value={infoForm.tuNgay}
            required
            disabled={!dangNhap || !canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, tuNgay: value })
            }
          />

          <DateField
            label="Đến ngày"
            value={infoForm.denNgay}
            required
            disabled={!dangNhap || !canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, denNgay: value })
            }
          />

          <DateField
            label="Hạn thanh toán"
            value={infoForm.hanThanhToan}
            disabled={!dangNhap || !canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, hanThanhToan: value })
            }
          />

          {dangNhap && canManage ? (
            <button
              type="submit"
              className="primary-button"
              disabled={savingInfo}
            >
              {savingInfo ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          ) : null}
        </form>
      </SectionCard>

      <SectionCard
        title="Khoản thu áp dụng"
        subtitle={
          dangNhap
            ? "Chọn khoản thu và số tiền áp dụng cho kỳ này."
            : `${detail.khoanApDung.length} khoản thu áp dụng`
        }
      >
        {dangNhap && canManage ? (
          <>
            <div className="user-table-wrap">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Áp dụng</th>
                    <th>Khoản thu</th>
                    <th>Số tiền</th>
                  </tr>
                </thead>

                <tbody>
                  {khoanThuList
                    .filter((item) => item.trangThai === "hoat_dong")
                    .map((item) => {
                      const chon = chonKhoanThu.find(
                        (row) => row.danhMucKhoanThuId === item.id,
                      );

                      return (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={chon?.chon ?? false}
                              onChange={(event) =>
                                setChonKhoanThu((current) =>
                                  current.map((row) =>
                                    row.danhMucKhoanThuId === item.id
                                      ? { ...row, chon: event.target.checked }
                                      : row,
                                  ),
                                )
                              }
                            />
                          </td>
                          <td>
                            <strong>{item.tenKhoanThu}</strong>
                            <small>{item.maKhoanThu}</small>
                          </td>
                          <td>
                            <CurrencyInput
                              value={chon?.soTien ?? null}
                              disabled={!chon?.chon}
                              onChange={(value) =>
                                setChonKhoanThu((current) =>
                                  current.map((row) =>
                                    row.danhMucKhoanThuId === item.id
                                      ? { ...row, soTien: value }
                                      : row,
                                  ),
                                )
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="primary-button"
              disabled={savingKhoanThu}
              onClick={() => void handleSaveKhoanApDung()}
            >
              {savingKhoanThu ? "Đang lưu..." : "Lưu khoản thu áp dụng"}
            </button>
          </>
        ) : (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Khoản thu</th>
                  <th>Số tiền</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>

              <tbody>
                {detail.khoanApDung.map((item) => (
                  <tr key={item.danhMucKhoanThuId}>
                    <td>
                      <strong>{item.tenKhoanThu}</strong>
                      <small>{item.maKhoanThu}</small>
                    </td>
                    <td>
                      {Number(item.soTien).toLocaleString("vi-VN")} ₫
                    </td>
                    <td>{item.ghiChu || "—"}</td>
                  </tr>
                ))}

                {detail.khoanApDung.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty-cell">
                      Chưa có khoản thu áp dụng.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {dangMo && canManage ? (
        <SectionCard
          title="Sinh khoản phải thu"
          subtitle="Chọn lớp học để sinh khoản phải thu cho từng học sinh đang học trong lớp (bỏ qua học sinh đã có sẵn)."
        >
          <div className="user-toolbar">
            <SelectField
              value={sinhLopHocId}
              placeholder="Chọn lớp học"
              options={lopHocList.map((item) => ({
                value: String(item.id),
                label: `${item.tenLop} (${item.maLop})`,
              }))}
              onChange={setSinhLopHocId}
            />

            <button
              type="button"
              className="primary-button"
              disabled={!sinhLopHocId || sinhBusy}
              onClick={() => void handleSinhKhoanPhaiThu()}
            >
              {sinhBusy ? "Đang sinh..." : "Sinh khoản phải thu"}
            </button>
          </div>
        </SectionCard>
      ) : null}

      {!dangNhap ? (
        <SectionCard
          title="Khoản phải thu"
          subtitle={
            loadingKhoanPhaiThu
              ? "Đang tải dữ liệu..."
              : `${khoanPhaiThuList.length} học sinh`
          }
        >
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Tổng tiền</th>
                  <th>Giảm trừ</th>
                  <th>Đã thu</th>
                  <th>Còn lại</th>
                  <th>Trạng thái</th>
                  {dangMo && canManage ? <th>Thao tác</th> : null}
                </tr>
              </thead>

              <tbody>
                {khoanPhaiThuList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.hocSinh.hoTen}</strong>
                      <small>{item.hocSinh.maHocSinh}</small>
                    </td>
                    <td>{formatTien(item.tongTien)}</td>
                    <td>{formatTien(item.giamTru)}</td>
                    <td>{formatTien(item.daThu)}</td>
                    <td>{formatTien(item.conLai)}</td>
                    <td>
                      <span
                        className={`status-badge status-badge--${item.trangThai}`}
                      >
                        {KHOAN_PHAI_THU_TRANG_THAI_LABEL[item.trangThai]}
                      </span>
                    </td>
                    {dangMo && canManage ? (
                      <td>
                        <div className="row-actions">
                          {item.trangThai !== "da_thu_du" ? (
                            <button
                              type="button"
                              className="text-button"
                              onClick={() =>
                                openPanel({ type: "thu_tien", item })
                              }
                            >
                              Thu tiền
                            </button>
                          ) : null}

                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              openPanel({ type: "mien_giam", item })
                            }
                          >
                            Miễn giảm
                          </button>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              openPanel({ type: "lich_su", item })
                            }
                          >
                            Lịch sử thu
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}

                {!loadingKhoanPhaiThu && khoanPhaiThuList.length === 0 ? (
                  <tr>
                    <td colSpan={dangMo && canManage ? 7 : 6} className="empty-cell">
                      Chưa có khoản phải thu nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : null}

      {activePanel ? (
        <SectionCard
          title={
            activePanel.type === "thu_tien"
              ? `Thu tiền — ${activePanel.item.hocSinh.hoTen}`
              : activePanel.type === "mien_giam"
                ? `Miễn giảm — ${activePanel.item.hocSinh.hoTen}`
                : `Lịch sử thu — ${activePanel.item.hocSinh.hoTen}`
          }
          actions={
            <button type="button" className="text-button" onClick={closePanel}>
              Đóng
            </button>
          }
        >
          {panelError ? <div className="form-error">{panelError}</div> : null}

          {activePanel.type === "thu_tien" ? (
            <div className="user-create-form">
              <p>Còn phải thu: {formatTien(activePanel.item.conLai)}</p>

              <CurrencyInput
                label="Số tiền thu"
                value={payAmount}
                max={Number(activePanel.item.conLai)}
                onChange={setPayAmount}
              />

              <SelectField
                label="Phương thức"
                value={payMethod}
                options={Object.entries(PHUONG_THUC_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
                onChange={setPayMethod}
              />

              <TextField
                label="Ghi chú"
                value={payNote}
                onChange={setPayNote}
              />

              <button
                type="button"
                className="primary-button"
                disabled={panelBusy || !payAmount}
                onClick={() => void handleSubmitThuTien()}
              >
                {panelBusy ? "Đang lưu..." : "Xác nhận thu tiền"}
              </button>
            </div>
          ) : null}

          {activePanel.type === "mien_giam" ? (
            <div className="user-create-form">
              <p>Tổng tiền: {formatTien(activePanel.item.tongTien)}</p>
              <p>Đã thu: {formatTien(activePanel.item.daThu)}</p>

              <CurrencyInput
                label="Số tiền giảm trừ"
                value={discountAmount}
                onChange={setDiscountAmount}
              />

              <button
                type="button"
                className="primary-button"
                disabled={panelBusy || discountAmount === null}
                onClick={() => void handleSubmitMienGiam()}
              >
                {panelBusy ? "Đang lưu..." : "Lưu giảm trừ"}
              </button>
            </div>
          ) : null}

          {activePanel.type === "lich_su" ? (
            <div className="user-table-wrap">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Số phiếu</th>
                    <th>Ngày thu</th>
                    <th>Số tiền</th>
                    <th>Phương thức</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>

                <tbody>
                  {phieuThuList.map((phieu) => (
                    <tr key={phieu.id}>
                      <td>{phieu.soPhieu}</td>
                      <td>{phieu.ngayThu}</td>
                      <td>{formatTien(phieu.soTien)}</td>
                      <td>{PHUONG_THUC_LABEL[phieu.phuongThuc]}</td>
                      <td>{phieu.ghiChu || "—"}</td>
                    </tr>
                  ))}

                  {!loadingPhieuThu && phieuThuList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-cell">
                        Chưa có phiếu thu nào.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}
        </SectionCard>
      ) : null}

      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction === "mo" ? "Mở kỳ thu" : "Đóng kỳ thu"
        }
        message={
          confirmAction === "mo"
            ? "Sau khi mở, không thể sửa thông tin hoặc khoản thu áp dụng của kỳ thu này nữa. Tiếp tục?"
            : "Sau khi đóng, kỳ thu không thể mở lại. Tiếp tục?"
        }
        danger={confirmAction === "dong"}
        busy={confirmBusy}
        error={confirmError}
        onConfirm={() => void handleConfirmAction()}
        onCancel={() => {
          setConfirmAction(null);
          setConfirmError("");
        }}
      />
    </div>
  );
}
