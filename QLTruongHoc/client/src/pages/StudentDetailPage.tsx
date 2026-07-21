import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DateField,
  SelectField,
  TextField,
} from "../components/form";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  addGuardianApi,
  createGuardianAccountApi,
  getHocSinhDetailApi,
  removeGuardianApi,
  setHocSinhTrangThaiApi,
  updateGuardianApi,
  updateHocSinhApi,
} from "../features/hocSinh/hocSinhApi";
import type {
  GuardianFormInput,
  GuardianLinkItem,
  HocSinhDetail,
  HocSinhFormInput,
  TrangThaiHocSinh,
} from "../features/hocSinh/hocSinhTypes";

const TRANG_THAI_LABEL: Record<string, string> = {
  tiep_nhan: "Tiếp nhận",
  dang_hoc: "Đang học",
  bao_luu: "Bảo lưu",
  ngung_hoc: "Ngừng học",
  hoan_thanh: "Hoàn thành",
};

const MOI_QUAN_HE_LABEL: Record<string, string> = {
  cha: "Cha",
  me: "Mẹ",
  ong: "Ông",
  ba: "Bà",
  nguoi_giam_ho: "Người giám hộ",
  khac: "Khác",
};

const emptyGuardianForm: GuardianFormInput = {
  dienThoai: "",
  hoTen: "",
  ngaySinh: "",
  gioiTinh: "",
  email: "",
  ngheNghiep: "",
  diaChi: "",
  moiQuanHe: "",
  laLienHeChinh: false,
  duocDonTre: true,
  nhanThongBao: true,
  nhanThongTinHocPhi: true,
};

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const studentId = Number(id);

  const [detail, setDetail] = useState<HocSinhDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [infoForm, setInfoForm] = useState<HocSinhFormInput | null>(
    null,
  );
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [guardianForm, setGuardianForm] = useState<GuardianFormInput>(
    emptyGuardianForm,
  );
  const [savingGuardian, setSavingGuardian] = useState(false);
  const [pendingRemove, setPendingRemove] =
    useState<GuardianLinkItem | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [creatingAccountLinkId, setCreatingAccountLinkId] =
    useState<number | null>(null);

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("hoc_sinh.quan_ly")
    );
  }, [auth]);

  const canCreateGuardianAccount = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("hoc_sinh.quan_ly") ||
      permissions.includes("tuyen_sinh.quan_ly")
    );
  }, [auth]);

  async function loadDetail() {
    setLoading(true);
    setError("");

    try {
      const data = await getHocSinhDetailApi(studentId);
      setDetail(data);
      setInfoForm({
        hoTen: data.hocSinh.hoTen,
        tenThuongGoi: data.hocSinh.tenThuongGoi ?? "",
        ngaySinh: data.hocSinh.ngaySinh ?? "",
        gioiTinh: data.hocSinh.gioiTinh ?? "",
        diaChi: data.hocSinh.diaChi ?? "",
        ngayNhapHoc: data.hocSinh.ngayNhapHoc ?? "",
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải học sinh.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isInteger(studentId) && studentId > 0) {
      void loadDetail();
    }
  }, [studentId, auth?.currentOrganization?.id]);

  async function handleSaveInfo(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!infoForm) return;

    setError("");
    setNotice("");
    setSavingInfo(true);

    try {
      await updateHocSinhApi(studentId, infoForm);
      setNotice("Đã cập nhật hồ sơ học sinh.");
      await loadDetail();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Không thể cập nhật.",
      );
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleChangeStatus(trangThai: TrangThaiHocSinh) {
    setError("");
    setNotice("");
    setSavingStatus(true);

    try {
      await setHocSinhTrangThaiApi(studentId, trangThai);
      setNotice(
        `Đã đổi trạng thái sang ${TRANG_THAI_LABEL[trangThai]}.`,
      );
      await loadDetail();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Không thể đổi trạng thái.",
      );
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleAddGuardian(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingGuardian(true);

    try {
      const result = await addGuardianApi(
        studentId,
        guardianForm,
      );
      setNotice(
        `Đã thêm phụ huynh ${result.guardian.hoTen} (${result.guardian.maPhuHuynh}).`,
      );
      setGuardianForm(emptyGuardianForm);
      await loadDetail();
    } catch (guardianError) {
      setError(
        guardianError instanceof Error
          ? guardianError.message
          : "Không thể thêm phụ huynh.",
      );
    } finally {
      setSavingGuardian(false);
    }
  }

  async function handleSetPrimary(link: GuardianLinkItem) {
    setError("");
    setNotice("");

    try {
      await updateGuardianApi(studentId, link.lienKetId, {
        moiQuanHe: link.moiQuanHe,
        laLienHeChinh: true,
        duocDonTre: link.duocDonTre,
        nhanThongBao: link.nhanThongBao,
        nhanThongTinHocPhi: link.nhanThongTinHocPhi,
      });
      setNotice(`Đã đặt ${link.phuHuynh.hoTen} làm liên hệ chính.`);
      await loadDetail();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Không thể cập nhật liên hệ chính.",
      );
    }
  }

  async function handleCreateAccount(link: GuardianLinkItem) {
    setCreatingAccountLinkId(link.lienKetId);
    setError("");
    setNotice("");

    try {
      const result = await createGuardianAccountApi(
        studentId,
        link.lienKetId,
      );

      if (result.created) {
        setNotice(
          `Đã tạo tài khoản cho ${link.phuHuynh.hoTen}. Tên đăng nhập: ${result.tenDangNhap} · Mật khẩu tạm: ${result.temporaryPassword} (hiển thị một lần duy nhất).`,
        );
      } else {
        setNotice(
          `${link.phuHuynh.hoTen} đã có tài khoản đăng nhập: ${result.tenDangNhap ?? "(không xác định)"}.`,
        );
      }

      await loadDetail();
    } catch (accountError) {
      setError(
        accountError instanceof Error
          ? accountError.message
          : "Không thể tạo tài khoản đăng nhập.",
      );
    } finally {
      setCreatingAccountLinkId(null);
    }
  }

  async function executeRemoveGuardian() {
    if (!pendingRemove) return;

    setRemoveBusy(true);
    setError("");
    setNotice("");

    try {
      await removeGuardianApi(studentId, pendingRemove.lienKetId);
      setNotice(`Đã gỡ liên kết với ${pendingRemove.phuHuynh.hoTen}.`);
      setPendingRemove(null);
      await loadDetail();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Không thể gỡ liên kết.",
      );
    } finally {
      setRemoveBusy(false);
    }
  }

  if (loading || !detail || !infoForm) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Học sinh"
          subtitle={error || "Đang tải dữ liệu..."}
        />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={detail.hocSinh.hoTen}
        subtitle={`Mã học sinh ${detail.hocSinh.maHocSinh}`}
        action={
          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/students")}
          >
            ← Danh sách học sinh
          </button>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard
        title="Trạng thái"
        subtitle={`Hiện tại: ${TRANG_THAI_LABEL[detail.hocSinh.trangThai]}`}
      >
        {canManage ? (
          <SelectField
            value={detail.hocSinh.trangThai}
            options={Object.entries(TRANG_THAI_LABEL).map(
              ([value, label]) => ({ value, label }),
            )}
            onChange={(value) =>
              void handleChangeStatus(
                value as TrangThaiHocSinh,
              )
            }
            disabled={savingStatus}
          />
        ) : null}
      </SectionCard>

      <SectionCard
        title="Thông tin học sinh"
        subtitle="Chỉnh sửa hồ sơ cơ bản"
      >
        <form className="user-create-form" onSubmit={handleSaveInfo}>
          <TextField
            label="Họ tên"
            value={infoForm.hoTen}
            required
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, hoTen: value })
            }
          />

          <TextField
            label="Tên thường gọi"
            value={infoForm.tenThuongGoi}
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, tenThuongGoi: value })
            }
          />

          <DateField
            label="Ngày sinh"
            value={infoForm.ngaySinh}
            required
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, ngaySinh: value })
            }
          />

          <SelectField
            label="Giới tính"
            value={infoForm.gioiTinh}
            placeholder="Chọn giới tính"
            disabled={!canManage}
            options={[
              { value: "nam", label: "Nam" },
              { value: "nu", label: "Nữ" },
              { value: "khac", label: "Khác" },
            ]}
            onChange={(value) =>
              setInfoForm({
                ...infoForm,
                gioiTinh: value as HocSinhFormInput["gioiTinh"],
              })
            }
          />

          <TextField
            label="Địa chỉ"
            value={infoForm.diaChi}
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, diaChi: value })
            }
          />

          <DateField
            label="Ngày nhập học"
            value={infoForm.ngayNhapHoc}
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, ngayNhapHoc: value })
            }
          />

          {canManage ? (
            <button
              type="submit"
              className="primary-button"
              disabled={savingInfo}
            >
              {savingInfo ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          ) : null}
        </form>
      </SectionCard>

      <SectionCard
        title="Phụ huynh · Người giám hộ"
        subtitle={`${detail.phuHuynh.length} người liên kết`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Phụ huynh</th>
                <th>Quan hệ</th>
                <th>Liên hệ chính</th>
                <th>Được đón trẻ</th>
                <th>Tài khoản</th>
                {canManage || canCreateGuardianAccount ? (
                  <th>Thao tác</th>
                ) : null}
              </tr>
            </thead>

            <tbody>
              {detail.phuHuynh.map((link) => (
                <tr key={link.lienKetId}>
                  <td>
                    <strong>{link.phuHuynh.hoTen}</strong>
                    <small>
                      {link.phuHuynh.dienThoai} ·{" "}
                      {link.phuHuynh.maPhuHuynh}
                    </small>
                  </td>

                  <td>{MOI_QUAN_HE_LABEL[link.moiQuanHe]}</td>

                  <td>
                    {link.laLienHeChinh ? (
                      <span className="status-badge status-badge--hoat_dong">
                        Liên hệ chính
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>{link.duocDonTre ? "Có" : "Không"}</td>

                  <td>
                    {link.phuHuynh.nguoiDungId ? (
                      <span className="status-badge status-badge--hoat_dong">
                        Đã có tài khoản
                      </span>
                    ) : (
                      "Chưa có"
                    )}
                  </td>

                  {canManage || canCreateGuardianAccount ? (
                    <td>
                      <div className="row-actions">
                        {canManage && !link.laLienHeChinh ? (
                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              void handleSetPrimary(link)
                            }
                          >
                            Đặt liên hệ chính
                          </button>
                        ) : null}

                        {canCreateGuardianAccount &&
                        !link.phuHuynh.nguoiDungId ? (
                          <button
                            type="button"
                            className="text-button"
                            disabled={
                              creatingAccountLinkId ===
                              link.lienKetId
                            }
                            onClick={() =>
                              void handleCreateAccount(link)
                            }
                          >
                            {creatingAccountLinkId ===
                            link.lienKetId
                              ? "Đang tạo..."
                              : "Tạo tài khoản đăng nhập"}
                          </button>
                        ) : null}

                        {canManage ? (
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => {
                              setError("");
                              setPendingRemove(link);
                            }}
                          >
                            Gỡ liên kết
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}

              {detail.phuHuynh.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      canManage || canCreateGuardianAccount ? 6 : 5
                    }
                    className="empty-cell"
                  >
                    Chưa có phụ huynh liên kết.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {canManage ? (
        <SectionCard
          title="Thêm phụ huynh"
          subtitle="Nhập số điện thoại trước — nếu đã có phụ huynh với số này trong đơn vị, hệ thống sẽ tái sử dụng hồ sơ cũ."
        >
          <form
            className="user-create-form"
            onSubmit={handleAddGuardian}
          >
            <TextField
              label="Số điện thoại"
              type="tel"
              value={guardianForm.dienThoai}
              required
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  dienThoai: value,
                })
              }
            />

            <TextField
              label="Họ tên (nếu là phụ huynh mới)"
              value={guardianForm.hoTen}
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  hoTen: value,
                })
              }
            />

            <SelectField
              label="Mối quan hệ"
              value={guardianForm.moiQuanHe}
              required
              placeholder="Chọn mối quan hệ"
              options={Object.entries(MOI_QUAN_HE_LABEL).map(
                ([value, label]) => ({ value, label }),
              )}
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  moiQuanHe:
                    value as GuardianFormInput["moiQuanHe"],
                })
              }
            />

            <TextField
              label="Email"
              type="email"
              value={guardianForm.email}
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  email: value,
                })
              }
            />

            <TextField
              label="Nghề nghiệp"
              value={guardianForm.ngheNghiep}
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  ngheNghiep: value,
                })
              }
            />

            <TextField
              label="Địa chỉ"
              value={guardianForm.diaChi}
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  diaChi: value,
                })
              }
            />

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={guardianForm.laLienHeChinh}
                onChange={(event) =>
                  setGuardianForm({
                    ...guardianForm,
                    laLienHeChinh: event.target.checked,
                  })
                }
              />
              Đặt làm liên hệ chính
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={guardianForm.duocDonTre}
                onChange={(event) =>
                  setGuardianForm({
                    ...guardianForm,
                    duocDonTre: event.target.checked,
                  })
                }
              />
              Được đón trẻ
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={guardianForm.nhanThongBao}
                onChange={(event) =>
                  setGuardianForm({
                    ...guardianForm,
                    nhanThongBao: event.target.checked,
                  })
                }
              />
              Nhận thông báo
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={guardianForm.nhanThongTinHocPhi}
                onChange={(event) =>
                  setGuardianForm({
                    ...guardianForm,
                    nhanThongTinHocPhi: event.target.checked,
                  })
                }
              />
              Nhận thông tin học phí
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={savingGuardian}
            >
              {savingGuardian ? "Đang lưu..." : "Thêm phụ huynh"}
            </button>
          </form>
        </SectionCard>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title="Gỡ liên kết phụ huynh"
        message={`Gỡ liên kết giữa học sinh và ${pendingRemove?.phuHuynh.hoTen ?? ""}?`}
        confirmLabel="Gỡ liên kết"
        danger
        busy={removeBusy}
        error={pendingRemove ? error : ""}
        onConfirm={() => void executeRemoveGuardian()}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
}
