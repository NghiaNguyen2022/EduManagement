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
  addLeadActivityApi,
  confirmLeadRegistrationApi,
  getLeadDetailApi,
  markLeadNotContinuingApi,
  reopenLeadApi,
  updateLeadApi,
} from "../features/lead/leadApi";
import type {
  ConfirmRegistrationInput,
  LeadActivityFormInput,
  LeadDetail,
  LeadFormInput,
} from "../features/lead/leadTypes";

const TRANG_THAI_LABEL: Record<string, string> = {
  moi: "Mới",
  dang_cham_soc: "Đang chăm sóc",
  da_hen_lich: "Đã hẹn lịch",
  da_hoc_thu: "Đã học thử",
  da_dang_ky: "Đã đăng ký",
  khong_tiep_tuc: "Không tiếp tục",
};

const NGUON_LABEL: Record<string, string> = {
  gioi_thieu: "Giới thiệu",
  facebook: "Facebook",
  website: "Website",
  walk_in: "Walk-in",
  khac: "Khác",
};

const LOAI_HOAT_DONG_LABEL: Record<string, string> = {
  goi_dien: "Gọi điện",
  gap_truc_tiep: "Gặp trực tiếp",
  nhan_tin: "Nhắn tin",
  hen_lich: "Hẹn lịch",
  hoc_thu: "Học thử",
  khac: "Khác",
};

const MOI_QUAN_HE_LABEL: Record<string, string> = {
  cha: "Cha",
  me: "Mẹ",
  ong: "Ông",
  ba: "Bà",
  nguoi_giam_ho: "Người giám hộ",
  khac: "Khác",
};

const emptyActivityForm: LeadActivityFormInput = {
  loaiHoatDong: "",
  noiDung: "",
  ketQua: "",
  trangThaiMoi: "",
};

const emptyConfirmForm: ConfirmRegistrationInput = {
  hoTenHocVien: "",
  ngaySinh: "",
  gioiTinh: "",
  diaChiHocVien: "",
  ngayNhapHoc: "",
  moiQuanHe: "",
};

export function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const leadId = Number(id);

  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [infoForm, setInfoForm] = useState<LeadFormInput | null>(
    null,
  );
  const [savingInfo, setSavingInfo] = useState(false);
  const [activityForm, setActivityForm] =
    useState<LeadActivityFormInput>(emptyActivityForm);
  const [savingActivity, setSavingActivity] = useState(false);
  const [notContinuingReason, setNotContinuingReason] = useState("");
  const [pendingNotContinuing, setPendingNotContinuing] =
    useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [confirmForm, setConfirmForm] =
    useState<ConfirmRegistrationInput>(emptyConfirmForm);
  const [confirming, setConfirming] = useState(false);
  const [showConfirmForm, setShowConfirmForm] = useState(false);

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("tuyen_sinh.quan_ly")
    );
  }, [auth]);

  async function loadDetail() {
    setLoading(true);
    setError("");

    try {
      const data = await getLeadDetailApi(leadId);
      setDetail(data);
      setInfoForm({
        hoTen: data.lead.hoTen,
        soDienThoai: data.lead.soDienThoai,
        email: data.lead.email ?? "",
        nguon: data.lead.nguon,
        doTuoiHoacTrinhDo: data.lead.doTuoiHoacTrinhDo ?? "",
        nhuCau: data.lead.nhuCau ?? "",
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải lead.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isInteger(leadId) && leadId > 0) {
      void loadDetail();
    }
  }, [leadId]);

  const isLocked =
    detail?.lead.trangThai === "da_dang_ky" ||
    detail?.lead.trangThai === "khong_tiep_tuc";

  async function handleSaveInfo(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!infoForm) return;

    setError("");
    setNotice("");
    setSavingInfo(true);

    try {
      await updateLeadApi(leadId, infoForm);
      setNotice("Đã cập nhật thông tin lead.");
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

  async function handleAddActivity(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingActivity(true);

    try {
      await addLeadActivityApi(leadId, activityForm);
      setNotice("Đã ghi nhận hoạt động chăm sóc.");
      setActivityForm(emptyActivityForm);
      await loadDetail();
    } catch (activityError) {
      setError(
        activityError instanceof Error
          ? activityError.message
          : "Không thể ghi nhận hoạt động.",
      );
    } finally {
      setSavingActivity(false);
    }
  }

  async function executeMarkNotContinuing() {
    setBusyAction(true);
    setError("");
    setNotice("");

    try {
      await markLeadNotContinuingApi(leadId, notContinuingReason);
      setNotice("Đã đánh dấu lead không tiếp tục.");
      setPendingNotContinuing(false);
      setNotContinuingReason("");
      await loadDetail();
    } catch (markError) {
      setError(
        markError instanceof Error
          ? markError.message
          : "Không thể đánh dấu không tiếp tục.",
      );
    } finally {
      setBusyAction(false);
    }
  }

  async function handleReopen() {
    setBusyAction(true);
    setError("");
    setNotice("");

    try {
      await reopenLeadApi(leadId);
      setNotice("Đã mở lại lead.");
      await loadDetail();
    } catch (reopenError) {
      setError(
        reopenError instanceof Error
          ? reopenError.message
          : "Không thể mở lại lead.",
      );
    } finally {
      setBusyAction(false);
    }
  }

  async function handleConfirmRegistration(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setConfirming(true);

    try {
      await confirmLeadRegistrationApi(leadId, confirmForm);
      setNotice("Đã xác nhận đăng ký, tạo hồ sơ học sinh thành công.");
      setShowConfirmForm(false);
      await loadDetail();
    } catch (confirmError) {
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : "Không thể xác nhận đăng ký.",
      );
    } finally {
      setConfirming(false);
    }
  }

  if (loading || !detail || !infoForm) {
    return (
      <div className="page-stack">
        <PageHeader title="Lead" subtitle={error || "Đang tải dữ liệu..."} />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={detail.lead.hoTen}
        subtitle={`Mã lead ${detail.lead.maLead} · ${TRANG_THAI_LABEL[detail.lead.trangThai]}`}
        action={
          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/admissions")}
          >
            ← Danh sách lead
          </button>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      {detail.lead.trangThai === "da_dang_ky" ? (
        <SectionCard title="Đã xác nhận đăng ký">
          <p>
            Lead này đã chuyển đổi thành học sinh (mã học sinh nội bộ #
            {detail.lead.hocSinhId}). Xem chi tiết tại trang Học sinh.
          </p>
        </SectionCard>
      ) : null}

      {canManage && detail.lead.trangThai === "khong_tiep_tuc" ? (
        <SectionCard
          title="Không tiếp tục"
          subtitle={detail.lead.lyDoKhongTiepTuc ?? undefined}
        >
          <button
            type="button"
            className="primary-button"
            disabled={busyAction}
            onClick={() => void handleReopen()}
          >
            Mở lại lead
          </button>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Thông tin lead"
        subtitle={isLocked ? "Đã khoá — không thể sửa" : undefined}
      >
        <form className="user-create-form" onSubmit={handleSaveInfo}>
          <TextField
            label="Họ tên người liên hệ"
            value={infoForm.hoTen}
            required
            disabled={!canManage || isLocked}
            onChange={(value) =>
              setInfoForm({ ...infoForm, hoTen: value })
            }
          />

          <TextField
            label="Số điện thoại"
            type="tel"
            value={infoForm.soDienThoai}
            required
            disabled={!canManage || isLocked}
            onChange={(value) =>
              setInfoForm({ ...infoForm, soDienThoai: value })
            }
          />

          <TextField
            label="Email"
            type="email"
            value={infoForm.email}
            disabled={!canManage || isLocked}
            onChange={(value) =>
              setInfoForm({ ...infoForm, email: value })
            }
          />

          <SelectField
            label="Nguồn"
            value={infoForm.nguon}
            disabled={!canManage || isLocked}
            options={Object.entries(NGUON_LABEL).map(
              ([value, label]) => ({ value, label }),
            )}
            onChange={(value) =>
              setInfoForm({
                ...infoForm,
                nguon: value as LeadFormInput["nguon"],
              })
            }
          />

          <TextField
            label="Độ tuổi / trình độ quan tâm"
            value={infoForm.doTuoiHoacTrinhDo}
            disabled={!canManage || isLocked}
            onChange={(value) =>
              setInfoForm({
                ...infoForm,
                doTuoiHoacTrinhDo: value,
              })
            }
          />

          <TextField
            label="Nhu cầu"
            value={infoForm.nhuCau}
            disabled={!canManage || isLocked}
            onChange={(value) =>
              setInfoForm({ ...infoForm, nhuCau: value })
            }
          />

          {canManage && !isLocked ? (
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

      {canManage && !isLocked ? (
        <SectionCard
          title="Ghi nhận hoạt động chăm sóc"
          subtitle="Có thể đổi trạng thái lead cùng lúc, trừ đã đăng ký."
        >
          <form
            className="user-create-form"
            onSubmit={handleAddActivity}
          >
            <SelectField
              label="Loại hoạt động"
              value={activityForm.loaiHoatDong}
              required
              placeholder="Chọn loại hoạt động"
              options={Object.entries(LOAI_HOAT_DONG_LABEL).map(
                ([value, label]) => ({ value, label }),
              )}
              onChange={(value) =>
                setActivityForm({
                  ...activityForm,
                  loaiHoatDong:
                    value as LeadActivityFormInput["loaiHoatDong"],
                })
              }
            />

            <TextField
              label="Nội dung"
              value={activityForm.noiDung}
              required
              onChange={(value) =>
                setActivityForm({
                  ...activityForm,
                  noiDung: value,
                })
              }
            />

            <TextField
              label="Kết quả"
              value={activityForm.ketQua}
              onChange={(value) =>
                setActivityForm({
                  ...activityForm,
                  ketQua: value,
                })
              }
            />

            <SelectField
              label="Đổi trạng thái (tuỳ chọn)"
              value={activityForm.trangThaiMoi}
              placeholder="Giữ nguyên trạng thái"
              options={[
                "moi",
                "dang_cham_soc",
                "da_hen_lich",
                "da_hoc_thu",
              ].map((value) => ({
                value,
                label: TRANG_THAI_LABEL[value],
              }))}
              onChange={(value) =>
                setActivityForm({
                  ...activityForm,
                  trangThaiMoi:
                    value as LeadActivityFormInput["trangThaiMoi"],
                })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={savingActivity}
            >
              {savingActivity ? "Đang lưu..." : "Ghi nhận"}
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Lịch sử chăm sóc"
        subtitle={`${detail.hoatDong.length} hoạt động`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Loại</th>
                <th>Nội dung</th>
                <th>Kết quả</th>
              </tr>
            </thead>

            <tbody>
              {detail.hoatDong.map((item) => (
                <tr key={item.id}>
                  <td>{item.thoiGian}</td>
                  <td>{LOAI_HOAT_DONG_LABEL[item.loaiHoatDong]}</td>
                  <td>{item.noiDung}</td>
                  <td>{item.ketQua ?? "—"}</td>
                </tr>
              ))}

              {detail.hoatDong.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    Chưa có hoạt động nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {canManage && !isLocked ? (
        <SectionCard
          title="Xác nhận đăng ký"
          subtitle="Tạo hồ sơ học sinh và liên kết phụ huynh từ thông tin lead."
        >
          {!showConfirmForm ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => setShowConfirmForm(true)}
            >
              Xác nhận đăng ký
            </button>
          ) : (
            <form
              className="user-create-form"
              onSubmit={handleConfirmRegistration}
            >
              <TextField
                label="Họ tên học viên"
                value={confirmForm.hoTenHocVien}
                required
                onChange={(value) =>
                  setConfirmForm({
                    ...confirmForm,
                    hoTenHocVien: value,
                  })
                }
              />

              <DateField
                label="Ngày sinh học viên"
                value={confirmForm.ngaySinh}
                required
                onChange={(value) =>
                  setConfirmForm({
                    ...confirmForm,
                    ngaySinh: value,
                  })
                }
              />

              <SelectField
                label="Giới tính"
                value={confirmForm.gioiTinh}
                placeholder="Chọn giới tính"
                options={[
                  { value: "nam", label: "Nam" },
                  { value: "nu", label: "Nữ" },
                  { value: "khac", label: "Khác" },
                ]}
                onChange={(value) =>
                  setConfirmForm({
                    ...confirmForm,
                    gioiTinh:
                      value as ConfirmRegistrationInput["gioiTinh"],
                  })
                }
              />

              <TextField
                label="Địa chỉ học viên"
                value={confirmForm.diaChiHocVien}
                onChange={(value) =>
                  setConfirmForm({
                    ...confirmForm,
                    diaChiHocVien: value,
                  })
                }
              />

              <DateField
                label="Ngày nhập học"
                value={confirmForm.ngayNhapHoc}
                onChange={(value) =>
                  setConfirmForm({
                    ...confirmForm,
                    ngayNhapHoc: value,
                  })
                }
              />

              <SelectField
                label={`Mối quan hệ của ${detail.lead.hoTen} với học viên`}
                value={confirmForm.moiQuanHe}
                required
                placeholder="Chọn mối quan hệ"
                options={Object.entries(MOI_QUAN_HE_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
                onChange={(value) =>
                  setConfirmForm({
                    ...confirmForm,
                    moiQuanHe:
                      value as ConfirmRegistrationInput["moiQuanHe"],
                  })
                }
              />

              <div className="row-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={confirming}
                >
                  {confirming
                    ? "Đang xác nhận..."
                    : "Tạo học sinh và xác nhận"}
                </button>

                <button
                  type="button"
                  className="text-button"
                  onClick={() => setShowConfirmForm(false)}
                  disabled={confirming}
                >
                  Huỷ
                </button>
              </div>
            </form>
          )}
        </SectionCard>
      ) : null}

      {canManage && !isLocked ? (
        <SectionCard title="Không tiếp tục">
          <div className="user-create-form">
            <TextField
              label="Lý do"
              value={notContinuingReason}
              onChange={setNotContinuingReason}
            />

            <button
              type="button"
              className="danger-button"
              disabled={busyAction || !notContinuingReason.trim()}
              onClick={() => {
                setError("");
                setPendingNotContinuing(true);
              }}
            >
              Đánh dấu không tiếp tục
            </button>
          </div>
        </SectionCard>
      ) : null}

      <ConfirmDialog
        open={pendingNotContinuing}
        title="Đánh dấu không tiếp tục"
        message={`Lead ${detail.lead.hoTen} sẽ chuyển sang trạng thái không tiếp tục với lý do: "${notContinuingReason}".`}
        confirmLabel="Xác nhận"
        danger
        busy={busyAction}
        error={pendingNotContinuing ? error : ""}
        onConfirm={() => void executeMarkNotContinuing()}
        onCancel={() => setPendingNotContinuing(false)}
      />
    </div>
  );
}
