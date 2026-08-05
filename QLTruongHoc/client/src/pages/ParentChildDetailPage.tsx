import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { DateField, SelectField, TextAreaField } from "../components/form";
import { ChatPanel } from "../components/shared/ChatPanel";
import { PageHeader } from "../components/shared/PageHeader";
import { PhotoGallery } from "../components/shared/PhotoGallery";
import { SectionCard } from "../components/shared/SectionCard";
import { TabBar } from "../components/shared/TabBar";
import { loadParentPortalOverviewApi } from "../features/portal/portalApi";
import type { ParentPortalChild } from "../features/portal/portalTypes";
import { createDonXinPhepApi } from "../features/xinPhep/xinPhepApi";

function formatDay(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function formatTien(value: string) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

function formatDelta(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

const KHOAN_PHAI_THU_TRANG_THAI_LABEL: Record<string, string> = {
  chua_thu: "Chưa thu",
  thu_mot_phan: "Thu một phần",
  da_thu_du: "Đã thu đủ",
};

const NGUOI_GUI_LABEL: Record<string, string> = {
  giao_vien: "Giáo viên",
  phu_huynh: "Phụ huynh",
  hoc_vu: "Học vụ",
  khac: "Khác",
};

const XIN_PHEP_TRANG_THAI_LABEL: Record<string, string> = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
};

const LOAI_DANH_GIA_LABEL: Record<string, string> = {
  giua_ky: "Giữa kỳ",
  cuoi_ky: "Cuối kỳ",
  khac: "Khác",
  theo_thang: "Theo tháng",
  theo_quy: "Theo quý",
  theo_nam: "Theo năm",
};

const LINH_VUC_PHAT_TRIEN_LABEL: Record<string, string> = {
  the_chat: "Thể chất",
  nhan_thuc: "Nhận thức",
  ngon_ngu: "Ngôn ngữ",
  tinh_cam_ky_nang_xa_hoi: "Tình cảm - Kỹ năng xã hội",
  tham_my: "Thẩm mỹ",
};

const LOAI_GHI_NHAN_SUC_KHOE_LABEL: Record<string, string> = {
  theo_tuan: "Theo tuần",
  theo_thang: "Theo tháng",
  theo_quy: "Theo quý",
  khac: "Khác",
};

const TRANG_THAI_HOC_SINH_LABEL: Record<string, string> = {
  tiep_nhan: "Tiếp nhận",
  dang_hoc: "Đang học",
  bao_luu: "Bảo lưu",
  ngung_hoc: "Ngừng học",
  hoan_thanh: "Hoàn thành",
};

function ChildLeaveRequestForm({
  hocSinhId,
  activeClasses,
  onCreated,
}: {
  hocSinhId: number;
  activeClasses: ParentPortalChild["activeClasses"];
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [lopHocId, setLopHocId] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [lyDo, setLyDo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const lopHocOptions = activeClasses.map((item) => ({
    value: item.lopHoc.id,
    label: item.lopHoc.tenLop,
  }));

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    try {
      await createDonXinPhepApi({
        hocSinhId,
        lopHocId: Number(lopHocId),
        tuNgay,
        denNgay,
        lyDo,
      });
      setLopHocId("");
      setTuNgay("");
      setDenNgay("");
      setLyDo("");
      setOpen(false);
      onCreated();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Không thể gửi đơn xin phép.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="text-button" onClick={() => setOpen(true)}>
        + Gửi đơn xin phép mới
      </button>
    );
  }

  return (
    <div className="portal-leave-form">
      {error ? <div className="form-error">{error}</div> : null}

      <SelectField
        label="Lớp"
        required
        value={lopHocId}
        options={lopHocOptions}
        placeholder="-- Chọn lớp --"
        onChange={setLopHocId}
      />

      <DateField label="Từ ngày" value={tuNgay} onChange={setTuNgay} />
      <DateField label="Đến ngày" value={denNgay} onChange={setDenNgay} min={tuNgay || undefined} />

      <TextAreaField label="Lý do" value={lyDo} onChange={setLyDo} rows={2} />

      <div className="portal-leave-form__actions">
        <button type="button" className="text-button" disabled={submitting} onClick={() => setOpen(false)}>
          Huỷ
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={submitting || !lopHocId || !tuNgay || !denNgay || !lyDo.trim()}
          onClick={() => void handleSubmit()}
        >
          {submitting ? "Đang gửi..." : "Gửi đơn"}
        </button>
      </div>
    </div>
  );
}

type TabId =
  | "hoc-tap"
  | "suc-khoe"
  | "hoat-dong"
  | "hoc-phi"
  | "xin-phep"
  | "trao-doi"
  | "tin-nhan";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "hoc-tap", label: "Học tập" },
  { id: "suc-khoe", label: "Sức khỏe" },
  { id: "hoat-dong", label: "Ảnh hoạt động" },
  { id: "hoc-phi", label: "Học phí" },
  { id: "xin-phep", label: "Xin phép" },
  { id: "trao-doi", label: "Trao đổi" },
  { id: "tin-nhan", label: "Nhắn tin" },
];

/**
 * Sổ tay của bé — trang riêng cho 1 con, thay cho việc nhồi hết tab của mọi
 * con vào 1 trang tổng quan. Tự gọi lại API overview và lọc đúng con theo
 * `hocSinhId` trên URL — chấp nhận gọi lại API (payload nhỏ, phụ huynh
 * thường chỉ 1-3 con) thay vì chuyền state phức tạp qua route.
 */
export function ParentChildDetailPage() {
  const { hocSinhId } = useParams();
  const navigate = useNavigate();
  const childId = Number(hocSinhId);

  const [child, setChild] = useState<ParentPortalChild | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("hoc-tap");

  async function loadChild() {
    try {
      const overview = await loadParentPortalOverviewApi();
      const found = overview.children.find((item) => item.hocSinh.id === childId);

      if (!found) {
        setError("Không tìm thấy học sinh trong danh sách con của bạn.");
        setChild(null);
        return;
      }

      setChild(found);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải hồ sơ con.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    void loadChild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader title="Sổ tay của bé" subtitle="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="page-stack">
        <PageHeader title="Sổ tay của bé" subtitle={error || "Không tìm thấy học sinh."} />
        <Link className="text-button" to="/portal/parent">
          ← Quay lại danh sách con
        </Link>
      </div>
    );
  }

  const tabBadges: Record<TabId, number> = {
    "hoc-tap": child.thanhTich.length + child.danhGia.length,
    "suc-khoe": child.sucKhoe.length,
    "hoat-dong": child.hoatDong.length,
    "hoc-phi": child.khoanPhaiThu.length,
    "xin-phep": child.donXinPhep.length,
    "trao-doi": child.traoDoi.length,
    "tin-nhan": 0,
  };

  return (
    <div className="page-stack">
      <PageHeader
        title={child.hocSinh.hoTen}
        subtitle={child.hocSinh.maHocSinh}
        action={
          <div className="row-actions">
            <button type="button" className="text-button" onClick={() => navigate("/portal/parent")}>
              ← Danh sách con
            </button>
            <Link className="text-button" to={`/portal/parent/nhan-tin?hocSinhId=${child.hocSinh.id}`}>
              💬 Xem trong Hộp thư tổng hợp
            </Link>
          </div>
        }
      />

      <SectionCard>
        <div className="portal-child-card__meta">
          <span>Ngày sinh: {child.hocSinh.ngaySinh || "—"}</span>
          <span>
            Trạng thái: {TRANG_THAI_HOC_SINH_LABEL[child.hocSinh.trangThai] ?? child.hocSinh.trangThai}
          </span>
          <span>Đón trẻ: {child.lienKet.duocDonTre ? "Có" : "Không"}</span>
          <span>{child.lienKet.laLienHeChinh ? "Liên hệ chính" : "Liên hệ phụ"}</span>
        </div>

        {child.absenceSummary.unexcused > 0 ? (
          <div className="notice-banner notice-banner--danger">
            <span className="notice-banner__icon" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <strong>Vắng học {child.absenceSummary.unexcused} buổi chưa rõ lý do gần đây</strong>
              <p>
                {child.absences
                  .filter((item) => item.trangThai === "vang_khong_phep")
                  .slice(0, 5)
                  .map((item) => `${item.ngayHoc} · ${item.tenLop}`)
                  .join(" — ")}
              </p>
            </div>
          </div>
        ) : null}

        <div className="portal-class-list">
          {child.activeClasses.length === 0 ? (
            <div className="empty-cell">Chưa có lớp đang học.</div>
          ) : (
            child.activeClasses.map((item) => (
              <div className="portal-class-chip" key={item.enrollmentId}>
                <strong>{item.lopHoc.tenLop}</strong>
                <span>{item.lopHoc.maLop}</span>
                <small>
                  {item.ngayVaoLop} · {item.trangThai}
                </small>
              </div>
            ))
          )}
        </div>

        <div className="portal-child-schedule">
          <strong>Lịch học gần tới</strong>
          {child.schedules.length === 0 ? (
            <div className="empty-cell">Chưa có lịch học được sinh cho các lớp của con.</div>
          ) : (
            child.schedules.slice(0, 4).map((item) => (
              <div className="portal-schedule-row" key={item.buoiHoc.id}>
                <span>{formatDay(item.buoiHoc.ngayHoc)}</span>
                <strong>
                  {item.buoiHoc.gioBatDau.slice(0, 5)} - {item.buoiHoc.gioKetThuc.slice(0, 5)} ·{" "}
                  {item.lopHocTenLop}
                </strong>
                <small>
                  {item.giaoVienHoTen || "Chưa phân công"} · {item.buoiHoc.phongHoc || "—"}
                </small>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <TabBar
        tabs={TABS.map((tab) => ({ ...tab, badge: tabBadges[tab.id] }))}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />

      {activeTab === "hoc-tap" ? (
        <>
          <SectionCard title="Chứng chỉ / Thành tích">
            {child.thanhTich.length === 0 ? (
              <div className="empty-cell">Chưa có chứng chỉ/thành tích nào.</div>
            ) : (
              <div className="portal-fee-box">
                {child.thanhTich.map((item) => (
                  <div className="portal-fee-row" key={item.id}>
                    <span>{item.tenThanhTich}</span>
                    <strong>{item.ketQua || "—"}</strong>
                    <small>
                      {item.ngayDat || "—"}
                      {item.noiCap ? ` · ${item.noiCap}` : ""}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Kết quả học tập / Đánh giá phát triển">
            {child.danhGia.length === 0 ? (
              <div className="empty-cell">Chưa có kết quả học tập nào.</div>
            ) : (
              <div className="portal-fee-box">
                {child.danhGia.map((item) => (
                  <div className="portal-fee-row" key={item.id}>
                    <span>
                      {item.lopHoc ? `${item.lopHoc.tenLop} · ` : ""}
                      {LOAI_DANH_GIA_LABEL[item.loaiDanhGia]}
                      {item.linhVucPhatTrien ? ` · ${LINH_VUC_PHAT_TRIEN_LABEL[item.linhVucPhatTrien]}` : ""}
                    </span>
                    <strong>{item.diemSo ? `${item.diemSo} điểm` : item.xepLoai || "—"}</strong>
                    <small>
                      {item.ngayDanhGia}
                      {item.nhanXet ? ` · ${item.nhanXet}` : ""}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      ) : null}

      {activeTab === "suc-khoe" ? (
        <SectionCard
          title="Sổ sức khỏe theo kỳ"
          subtitle="Chiều cao, cân nặng theo tuần/tháng/quý — số trong ngoặc là chênh lệch so với lần đo trước"
        >
          {child.sucKhoe.length === 0 ? (
            <div className="empty-cell">Chưa có bản ghi sổ sức khỏe nào.</div>
          ) : (
            <div className="user-table-wrap">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Kỳ</th>
                    <th>Ngày</th>
                    <th>Chiều cao</th>
                    <th>Cân nặng</th>
                    <th>Dị ứng / Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {child.sucKhoe.map((item, index) => {
                    const prev = child.sucKhoe[index + 1];
                    const heightDelta =
                      prev?.chieuCaoCm && item.chieuCaoCm
                        ? Number(item.chieuCaoCm) - Number(prev.chieuCaoCm)
                        : null;
                    const weightDelta =
                      prev?.canNangKg && item.canNangKg
                        ? Number(item.canNangKg) - Number(prev.canNangKg)
                        : null;

                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="health-log__period">
                            {LOAI_GHI_NHAN_SUC_KHOE_LABEL[item.loaiGhiNhan]}
                          </span>
                        </td>
                        <td>{item.ngayGhiNhan}</td>
                        <td>
                          {item.chieuCaoCm ? `${item.chieuCaoCm} cm` : "—"}
                          {heightDelta ? ` (${formatDelta(heightDelta)})` : ""}
                        </td>
                        <td>
                          {item.canNangKg ? `${item.canNangKg} kg` : "—"}
                          {weightDelta ? ` (${formatDelta(weightDelta)})` : ""}
                        </td>
                        <td>{[item.diUngBenhNen, item.ghiChu].filter(Boolean).join(" · ") || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      ) : null}

      {activeTab === "hoat-dong" ? (
        <SectionCard title="Ảnh hoạt động lớp">
          <PhotoGallery items={child.hoatDong} />
        </SectionCard>
      ) : null}

      {activeTab === "hoc-phi" ? (
        <SectionCard title="Học phí">
          {child.khoanPhaiThu.length === 0 ? (
            <div className="empty-cell">Chưa có khoản phải thu nào.</div>
          ) : (
            <div className="portal-fee-box">
              {child.khoanPhaiThu.map((item) => {
                const conLai = Number(item.tongTien) - Number(item.giamTru) - Number(item.daThu);

                return (
                  <div className="portal-fee-row" key={item.id}>
                    <span>{item.tenKyThu}</span>
                    <strong>{formatTien(item.tongTien)}</strong>
                    <small>
                      {KHOAN_PHAI_THU_TRANG_THAI_LABEL[item.trangThai]}
                      {conLai > 0 ? ` · Còn lại ${formatTien(String(conLai))}` : ""}
                    </small>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      ) : null}

      {activeTab === "xin-phep" ? (
        <SectionCard title="Xin phép nghỉ">
          {child.donXinPhep.length === 0 ? (
            <div className="empty-cell">Chưa gửi đơn xin phép nào.</div>
          ) : (
            <div className="portal-fee-box">
              {child.donXinPhep.map((item) => (
                <div className="portal-fee-row" key={item.id}>
                  <span>
                    {item.tenLop} · {item.tuNgay} - {item.denNgay}
                  </span>
                  <strong>{item.lyDo}</strong>
                  <small>{XIN_PHEP_TRANG_THAI_LABEL[item.trangThai]}</small>
                </div>
              ))}
            </div>
          )}
          <ChildLeaveRequestForm
            hocSinhId={child.hocSinh.id}
            activeClasses={child.activeClasses}
            onCreated={() => void loadChild()}
          />
        </SectionCard>
      ) : null}

      {activeTab === "trao-doi" ? (
        <SectionCard title="Trao đổi với nhà trường" subtitle="5 ghi chú gần nhất do giáo viên/học vụ ghi">
          {child.traoDoi.length === 0 ? (
            <div className="empty-cell">Chưa có trao đổi nào.</div>
          ) : (
            <div className="portal-exchange-box">
              {child.traoDoi.map((item) => (
                <div className="portal-exchange-row" key={item.id}>
                  <span>{formatDateTime(item.createdAt)}</span>
                  <strong>{NGUOI_GUI_LABEL[item.nguoiGuiVaiTro] ?? item.nguoiGuiVaiTro}</strong>
                  <small>{item.noiDung}</small>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ) : null}

      {activeTab === "tin-nhan" ? (
        <SectionCard title="Nhắn tin với giáo viên" subtitle="Trao đổi trực tiếp — thay thế nhắn tin qua Zalo">
          <ChatPanel hocSinhId={child.hocSinh.id} />
        </SectionCard>
      ) : null}
    </div>
  );
}
