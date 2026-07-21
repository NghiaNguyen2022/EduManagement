import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
import {
  dongKyThuApi,
  getKyThuDetailApi,
  listDanhMucKhoanThuApi,
  moKyThuApi,
  setKhoanApDungKyThuApi,
  updateKyThuApi,
} from "../features/taiChinh/taiChinhApi";
import type {
  DanhMucKhoanThuItem,
  KyThuDetail,
  KyThuFormInput,
  LoaiKy,
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

type ChonKhoanThu = {
  danhMucKhoanThuId: number;
  chon: boolean;
  soTien: number | null;
};

export function KyThuDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [detail, setDetail] = useState<KyThuDetail | null>(null);
  const [khoanThuList, setKhoanThuList] = useState<DanhMucKhoanThuItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [infoForm, setInfoForm] = useState<KyThuFormInput | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);

  const [chonKhoanThu, setChonKhoanThu] = useState<ChonKhoanThu[]>([]);
  const [savingKhoanThu, setSavingKhoanThu] = useState(false);

  const [confirmAction, setConfirmAction] = useState<
    "mo" | "dong" | null
  >(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("tai_chinh.quan_ly")
    );
  }, [auth]);

  async function loadData() {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const [detailData, khoanThuRows] = await Promise.all([
        getKyThuDetailApi(Number(id)),
        listDanhMucKhoanThuApi(),
      ]);

      setDetail(detailData);
      setKhoanThuList(khoanThuRows);
      setInfoForm({
        maKyThu: detailData.kyThu.maKyThu,
        tenKyThu: detailData.kyThu.tenKyThu,
        loaiKy: detailData.kyThu.loaiKy,
        tuNgay: detailData.kyThu.tuNgay,
        denNgay: detailData.kyThu.denNgay,
        hanThanhToan: detailData.kyThu.hanThanhToan ?? "",
      });

      const apDungMap = new Map(
        detailData.khoanApDung.map((item) => [
          item.danhMucKhoanThuId,
          item,
        ]),
      );

      setChonKhoanThu(
        khoanThuRows.map((item) => {
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
        }),
      );
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
