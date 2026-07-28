import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { DateField, SelectField, TextAreaField } from "../components/form";
import { EntityLink } from "../components/shared/EntityLink";
import { GuardedLink } from "../components/shared/GuardedLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { StatCard } from "../components/shared/StatCard";
import { useAuth } from "../features/auth/AuthContext";
import { getDashboardSummaryApi } from "../features/dashboard/dashboardApi";
import type { DashboardSummary } from "../features/dashboard/dashboardTypes";
import {
      getBaoCaoTaiChinhApi,
      listKyThuApi,
} from "../features/taiChinh/taiChinhApi";
import type {
      BaoCaoTaiChinh,
      KyThuItem,
} from "../features/taiChinh/taiChinhTypes";
import {
      canAccessPortalRole,
      findPortalRole,
      getDefaultLandingPath,
      getDefaultPortalPath,
      getPortalNextSteps,
} from "../config/portal";
import {
      loadParentPortalOverviewApi,
      loadTeacherPortalOverviewApi,
} from "../features/portal/portalApi";
import type {
      ParentPortalChild,
      ParentPortalOverview,
      TeacherPortalOverview,
} from "../features/portal/portalTypes";
import { createDonXinPhepApi } from "../features/xinPhep/xinPhepApi";

function RoleLink({ label, description, to }: { label: string; description: string; to: string }) {
      return (
            <Link className="section-link-card" to={to}>
                  <strong>{label}</strong>
                  <span>{description}</span>
                  <small>Đi tới →</small>
            </Link>
      );
}

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

function formatTyLeChuyenDoi(daDangKy: number, tongLead: number) {
      if (tongLead === 0) return "0%";
      return `${Math.round((daDangKy / tongLead) * 100)}%`;
}

/**
 * Kế toán tổng (đứng ở đơn vị hệ thống) chỉ có vaiTro/quyền tại đúng đơn vị
 * hệ thống — không lan xuống đơn vị con như quyền quản trị hệ thống — nên
 * không thể click vào chi tiết kỳ thu ở từng trường/trung tâm (sẽ bị chặn
 * "Bạn không có quyền truy cập đơn vị này"). Vì vậy gộp `theoKyThu` (đã có
 * sẵn đơn vị sở hữu) thành báo cáo theo đơn vị, chỉ xem — không dẫn link.
 */
function groupBaoCaoKyThuTheoDonVi(
      items: Array<{
            kyThu: { trangThai: string };
            donVi?: { id: number; maDonVi: string; tenDonVi: string };
            phaiThu: string;
            daThu: string;
            conLai: string;
      }>,
) {
      const map = new Map<
            number,
            { donVi: { id: number; maDonVi: string; tenDonVi: string }; soLuong: number; phaiThu: number; daThu: number; conLai: number }
      >();

      for (const item of items) {
            if (item.kyThu.trangThai !== "da_mo" || !item.donVi) continue;

            const existing = map.get(item.donVi.id) ?? {
                  donVi: item.donVi,
                  soLuong: 0,
                  phaiThu: 0,
                  daThu: 0,
                  conLai: 0,
            };

            existing.soLuong += 1;
            existing.phaiThu += Number(item.phaiThu);
            existing.daThu += Number(item.daThu);
            existing.conLai += Number(item.conLai);
            map.set(item.donVi.id, existing);
      }

      return Array.from(map.values()).sort((left, right) =>
            left.donVi.tenDonVi.localeCompare(right.donVi.tenDonVi),
      );
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
                  <DateField
                        label="Đến ngày"
                        value={denNgay}
                        onChange={setDenNgay}
                        min={tuNgay || undefined}
                  />

                  <TextAreaField label="Lý do" value={lyDo} onChange={setLyDo} rows={2} />

                  <div className="portal-leave-form__actions">
                        <button
                              type="button"
                              className="text-button"
                              disabled={submitting}
                              onClick={() => setOpen(false)}
                        >
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

export function PortalLandingPage() {
      const { auth } = useAuth();
      const { roleSlug } = useParams();
      const [parentOverview, setParentOverview] = useState<ParentPortalOverview | null>(null);
      const [parentLoading, setParentLoading] = useState(false);
      const [parentError, setParentError] = useState("");
      const [workspaceSummary, setWorkspaceSummary] = useState<DashboardSummary | null>(null);
      const [teacherOverview, setTeacherOverview] = useState<TeacherPortalOverview | null>(null);
      const [teacherError, setTeacherError] = useState("");
      const [financeOverview, setFinanceOverview] = useState<{
            periods: KyThuItem[];
            report: BaoCaoTaiChinh;
      } | null>(null);
      const [financeError, setFinanceError] = useState("");

      const portalRole = roleSlug ? findPortalRole(roleSlug) : null;
      const isParentPortal = portalRole?.slug === "parent";

      async function refreshOverview() {
            try {
                  const data = await loadParentPortalOverviewApi();
                  setParentOverview(data);
            } catch (error) {
                  setParentError(
                        error instanceof Error ? error.message : "Không thể tải portal phụ huynh.",
                  );
            }
      }

      useEffect(() => {
            if (!isParentPortal) {
                  setParentOverview(null);
                  setParentError("");
                  setParentLoading(false);
                  return;
            }

            let active = true;

            setParentLoading(true);
            setParentError("");

            loadParentPortalOverviewApi()
                  .then((data) => {
                        if (!active) return;
                        setParentOverview(data);
                  })
                  .catch((error) => {
                        if (!active) return;
                        setParentError(error instanceof Error ? error.message : "Không thể tải portal phụ huynh.");
                  })
                  .finally(() => {
                        if (!active) return;
                        setParentLoading(false);
                  });

            return () => {
                  active = false;
            };
      }, [isParentPortal, auth?.currentOrganization?.id]);

      useEffect(() => {
            if (!portalRole || isParentPortal) {
                  setWorkspaceSummary(null);
                  return;
            }

            getDashboardSummaryApi()
                  .then(setWorkspaceSummary)
                  .catch(() => setWorkspaceSummary(null));
      }, [portalRole?.slug, isParentPortal, auth?.currentOrganization?.id]);

      useEffect(() => {
            if (portalRole?.slug !== "teacher") {
                  setTeacherOverview(null);
                  setTeacherError("");
                  return;
            }

            let active = true;

            loadTeacherPortalOverviewApi()
                  .then((data) => {
                        if (!active) return;
                        setTeacherOverview(data);
                        setTeacherError("");
                  })
                  .catch((error) => {
                        if (!active) return;
                        setTeacherOverview(null);
                        setTeacherError(
                              error instanceof Error ? error.message : "Không thể tải dữ liệu giáo viên.",
                        );
                  });

            return () => {
                  active = false;
            };
      }, [portalRole?.slug, auth?.currentOrganization?.id]);

      useEffect(() => {
            if (portalRole?.slug !== "accountant") {
                  setFinanceOverview(null);
                  setFinanceError("");
                  return;
            }

            let active = true;
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const lastDay = String(new Date(year, now.getMonth() + 1, 0).getDate()).padStart(2, "0");

            Promise.all([
                  listKyThuApi(),
                  getBaoCaoTaiChinhApi(`${year}-${month}-01`, `${year}-${month}-${lastDay}`),
            ])
                  .then(([periods, report]) => {
                        if (!active) return;
                        setFinanceOverview({ periods, report });
                        setFinanceError("");
                  })
                  .catch((error) => {
                        if (!active) return;
                        setFinanceOverview(null);
                        setFinanceError(
                              error instanceof Error ? error.message : "Không thể tải dữ liệu tài chính.",
                        );
                  });

            return () => {
                  active = false;
            };
      }, [portalRole?.slug, auth?.currentOrganization?.id]);

      if (!auth?.currentOrganization) {
            return <Navigate to="/" replace />;
      }

      if (!portalRole) {
            return <Navigate to={getDefaultPortalPath(auth.currentOrganization.vaiTro)} replace />;
      }

      if (!canAccessPortalRole(portalRole.slug, auth.currentOrganization.vaiTro)) {
            return <Navigate to={getDefaultLandingPath(auth.currentOrganization.vaiTro)} replace />;
      }

      if (isParentPortal) {
            const children = parentOverview?.children ?? [];
            const totalClasses = children.reduce((sum, child) => sum + child.activeClasses.length, 0);

            const stats = [
                  {
                        title: "Con đang theo dõi",
                        value: children.length,
                        note: "Số học sinh liên kết với tài khoản này",
                        icon: "🎒",
                        tone: "primary" as const,
                  },
                  {
                        title: "Lớp đang học",
                        value: totalClasses,
                        note: "Tổng số lớp hiện tại của các con",
                        icon: "🏫",
                        tone: "success" as const,
                  },
                  {
                        title: "Buổi sắp tới",
                        value: parentOverview?.upcomingSessions.length ?? 0,
                        note: "Các buổi học trong 2 tuần tới",
                        icon: "📅",
                        tone: "warning" as const,
                  },
                  {
                        title: "Thành tích & kết quả",
                        value: children.reduce(
                              (sum, child) => sum + child.thanhTich.length + child.danhGia.length,
                              0,
                        ),
                        note: "Chứng chỉ và kết quả học tập đã ghi nhận cho các con",
                        icon: "📊",
                        tone: "info" as const,
                  },
            ];

            return (
                  <>
                        <PageHeader
                              title={portalRole.title}
                              subtitle={
                                    parentOverview ? `Xin chào, ${parentOverview.parent.hoTen}` : portalRole.subtitle
                              }
                        />

                        {parentError ? <div className="form-error">{parentError}</div> : null}

                        <section className="summary-grid parent-portal-anchor" id="tong-quan">
                              {stats.map((stat) => (
                                    <StatCard
                                          key={stat.title}
                                          title={stat.title}
                                          value={stat.value}
                                          note={stat.note}
                                          icon={stat.icon}
                                          tone={stat.tone}
                                    />
                              ))}
                        </section>

                        {parentLoading ? (
                              <SectionCard title="Đang tải dữ liệu phụ huynh">
                                    <div className="empty-cell">
                                          Đang lấy thông tin con, lịch học và trạng thái điểm số...
                                    </div>
                              </SectionCard>
                        ) : null}

                        {parentOverview ? (
                              <>
                                    <SectionCard
                                          title="Thông tin chung"
                                          subtitle="Thông tin của bạn — dùng chung cho mọi đơn vị con đang theo học, không gắn với một đơn vị cụ thể"
                                    >
                                          <div className="portal-parent-info parent-portal-anchor" id="thong-tin-phu-huynh">
                                                <div>
                                                      <span>Họ tên</span>
                                                      <strong>{parentOverview.parent.hoTen}</strong>
                                                      <small>{parentOverview.parent.maPhuHuynh}</small>
                                                </div>
                                                <div>
                                                      <span>Số điện thoại</span>
                                                      <strong>{parentOverview.parent.dienThoai}</strong>
                                                </div>
                                                <div>
                                                      <span>Email</span>
                                                      <strong>{parentOverview.parent.email || "—"}</strong>
                                                </div>
                                                <div>
                                                      <span>Nghề nghiệp</span>
                                                      <strong>{parentOverview.parent.ngheNghiep || "—"}</strong>
                                                </div>
                                          </div>
                                    </SectionCard>

                                    <section
                                          className="dashboard-grid portal-grid--single-column parent-portal-anchor"
                                          id="lich-hoc"
                                    >
                                          <SectionCard
                                                title="Buổi học sắp tới"
                                                subtitle="Tổng hợp nhanh theo tất cả các con và đơn vị, xem chi tiết theo từng đơn vị ở bên dưới"
                                                className="section-card--wide"
                                          >
                                                {parentOverview.upcomingSessions.length === 0 ? (
                                                      <div className="empty-cell">Chưa có buổi học nào trong 2 tuần tới.</div>
                                                ) : (
                                                      <div className="portal-upcoming-list">
                                                            {parentOverview.upcomingSessions.map((item) => (
                                                                  <div
                                                                        className="portal-upcoming-row"
                                                                        key={`${item.childCode}-${item.session.buoiHoc.id}`}
                                                                  >
                                                                        <div>
                                                                              <strong>{item.childName}</strong>
                                                                              <small>{item.childCode}</small>
                                                                              <small>{item.childOrganization.tenDonVi}</small>
                                                                        </div>
                                                                        <div>
                                                                              <strong>{item.session.lopHocTenLop}</strong>
                                                                              <small>{item.session.giaoVienHoTen || "Chưa phân công"}</small>
                                                                        </div>
                                                                        <div>
                                                                              <strong>
                                                                                    {formatDateTime(
                                                                                          `${item.session.buoiHoc.ngayHoc}T${item.session.buoiHoc.gioBatDau}`,
                                                                                    )}
                                                                              </strong>
                                                                              <small>{item.session.buoiHoc.phongHoc || "—"}</small>
                                                                        </div>
                                                                  </div>
                                                            ))}
                                                      </div>
                                                )}
                                          </SectionCard>
                                    </section>

                                    <div className="parent-portal-anchor" id="thong-tin-con">
                                          {parentOverview.organizations.map((group) => (
                                                <section className="dashboard-grid portal-grid--single-column" key={group.donVi.id}>
                                                      <SectionCard
                                                            title={group.donVi.tenDonVi}
                                                            subtitle={
                                                                  group.children.length > 1
                                                                        ? `${group.children.length} con đang theo học tại đơn vị này`
                                                                        : "Chi tiết con đang theo học tại đơn vị này"
                                                            }
                                                            className="section-card--wide"
                                                      >
                                                            <div className="portal-child-grid">
                                                                  {group.children.map((child) => (
                                                                        <article className="portal-child-card" key={child.hocSinh.id}>
                                                                              <header className="portal-child-card__header">
                                                                                    <div>
                                                                                          <strong>{child.hocSinh.hoTen}</strong>
                                                                                          <small>{child.hocSinh.maHocSinh}</small>
                                                                                    </div>
                                                                                    <span>
                                                                                          {child.lienKet.laLienHeChinh ? "Liên hệ chính" : "Liên hệ phụ"}
                                                                                    </span>
                                                                              </header>

                                                                              <div className="portal-child-card__meta">
                                                                                    <span>Ngày sinh: {child.hocSinh.ngaySinh || "—"}</span>
                                                                                    <span>Trạng thái: {child.hocSinh.trangThai}</span>
                                                                                    <span>Đón trẻ: {child.lienKet.duocDonTre ? "Có" : "Không"}</span>
                                                                              </div>

                                                                              {child.absenceSummary.unexcused > 0 ? (
                                                                                    <div className="notice-banner notice-banner--danger">
                                                                                          <span className="notice-banner__icon" aria-hidden="true">
                                                                                                ⚠️
                                                                                          </span>
                                                                                          <div>
                                                                                                <strong>
                                                                                                      Con vắng học {child.absenceSummary.unexcused} buổi chưa rõ lý do
                                                                                                      gần đây
                                                                                                </strong>
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

                                                                              <div
                                                                                    className="portal-fee-box parent-portal-anchor"
                                                                                    id={`thanh-tich-${child.hocSinh.id}`}
                                                                              >
                                                                                    <strong>Chứng chỉ / Thành tích</strong>
                                                                                    {child.thanhTich.length === 0 ? (
                                                                                          <div className="empty-cell">Chưa có chứng chỉ/thành tích nào.</div>
                                                                                    ) : (
                                                                                          child.thanhTich.map((item) => (
                                                                                                <div className="portal-fee-row" key={item.id}>
                                                                                                      <span>{item.tenThanhTich}</span>
                                                                                                      <strong>{item.ketQua || "—"}</strong>
                                                                                                      <small>
                                                                                                            {item.ngayDat || "—"}
                                                                                                            {item.noiCap ? ` · ${item.noiCap}` : ""}
                                                                                                      </small>
                                                                                                </div>
                                                                                          ))
                                                                                    )}
                                                                              </div>

                                                                              <div
                                                                                    className="portal-fee-box parent-portal-anchor"
                                                                                    id={`ket-qua-${child.hocSinh.id}`}
                                                                              >
                                                                                    <strong>Kết quả học tập</strong>
                                                                                    {child.danhGia.length === 0 ? (
                                                                                          <div className="empty-cell">Chưa có kết quả học tập nào.</div>
                                                                                    ) : (
                                                                                          child.danhGia.map((item) => (
                                                                                                <div className="portal-fee-row" key={item.id}>
                                                                                                      <span>
                                                                                                            {item.lopHoc.tenLop} · {LOAI_DANH_GIA_LABEL[item.loaiDanhGia]}
                                                                                                      </span>
                                                                                                      <strong>
                                                                                                            {item.diemSo ? `${item.diemSo} điểm` : item.xepLoai || "—"}
                                                                                                      </strong>
                                                                                                      <small>
                                                                                                            {item.ngayDanhGia}
                                                                                                            {item.nhanXet ? ` · ${item.nhanXet}` : ""}
                                                                                                      </small>
                                                                                                </div>
                                                                                          ))
                                                                                    )}
                                                                              </div>

                                                                              <div className="portal-child-schedule">
                                                                                    <strong>Lịch học gần tới</strong>
                                                                                    {child.schedules.length === 0 ? (
                                                                                          <div className="empty-cell">
                                                                                                Chưa có lịch học được sinh cho các lớp của con.
                                                                                          </div>
                                                                                    ) : (
                                                                                          child.schedules.slice(0, 4).map((item) => (
                                                                                                <div className="portal-schedule-row" key={item.buoiHoc.id}>
                                                                                                      <span>{formatDay(item.buoiHoc.ngayHoc)}</span>
                                                                                                      <strong>
                                                                                                            {item.buoiHoc.gioBatDau.slice(0, 5)} -{" "}
                                                                                                            {item.buoiHoc.gioKetThuc.slice(0, 5)} · {item.lopHocTenLop}
                                                                                                      </strong>
                                                                                                      <small>
                                                                                                            {item.giaoVienHoTen || "Chưa phân công"} ·{" "}
                                                                                                            {item.buoiHoc.phongHoc || "—"}
                                                                                                      </small>
                                                                                                </div>
                                                                                          ))
                                                                                    )}
                                                                              </div>

                                                                              <div
                                                                                    className="portal-fee-box parent-portal-anchor"
                                                                                    id={`hoc-phi-${child.hocSinh.id}`}
                                                                              >
                                                                                    <strong>Học phí</strong>
                                                                                    {child.khoanPhaiThu.length === 0 ? (
                                                                                          <div className="empty-cell">Chưa có khoản phải thu nào.</div>
                                                                                    ) : (
                                                                                          child.khoanPhaiThu.map((item) => {
                                                                                                const conLai =
                                                                                                      Number(item.tongTien) - Number(item.giamTru) - Number(item.daThu);

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
                                                                                          })
                                                                                    )}
                                                                              </div>

                                                                              <div
                                                                                    className="portal-fee-box parent-portal-anchor"
                                                                                    id={`xin-phep-${child.hocSinh.id}`}
                                                                              >
                                                                                    <strong>Xin phép nghỉ</strong>
                                                                                    {child.donXinPhep.length === 0 ? (
                                                                                          <div className="empty-cell">Chưa gửi đơn xin phép nào.</div>
                                                                                    ) : (
                                                                                          child.donXinPhep.map((item) => (
                                                                                                <div className="portal-fee-row" key={item.id}>
                                                                                                      <span>
                                                                                                            {item.tenLop} · {item.tuNgay} - {item.denNgay}
                                                                                                      </span>
                                                                                                      <strong>{item.lyDo}</strong>
                                                                                                      <small>{XIN_PHEP_TRANG_THAI_LABEL[item.trangThai]}</small>
                                                                                                </div>
                                                                                          ))
                                                                                    )}
                                                                                    <ChildLeaveRequestForm
                                                                                          hocSinhId={child.hocSinh.id}
                                                                                          activeClasses={child.activeClasses}
                                                                                          onCreated={() => void refreshOverview()}
                                                                                    />
                                                                              </div>

                                                                              <div
                                                                                    className="portal-exchange-box parent-portal-anchor"
                                                                                    id={`trao-doi-${child.hocSinh.id}`}
                                                                              >
                                                                                    <strong>Trao đổi gần đây</strong>
                                                                                    {child.traoDoi.length === 0 ? (
                                                                                          <div className="empty-cell">Chưa có trao đổi nào.</div>
                                                                                    ) : (
                                                                                          child.traoDoi.map((item) => (
                                                                                                <div className="portal-exchange-row" key={item.id}>
                                                                                                      <span>{formatDateTime(item.createdAt)}</span>
                                                                                                      <strong>
                                                                                                            {NGUOI_GUI_LABEL[item.nguoiGuiVaiTro] ?? item.nguoiGuiVaiTro}
                                                                                                      </strong>
                                                                                                      <small>{item.noiDung}</small>
                                                                                                </div>
                                                                                          ))
                                                                                    )}
                                                                              </div>
                                                                        </article>
                                                                  ))}
                                                            </div>
                                                      </SectionCard>
                                                </section>
                                          ))}
                                    </div>
                              </>
                        ) : null}
                  </>
            );
      }

      const workspaceStats = portalRole.stats.map((stat, index) => {
            if (portalRole.slug === "accountant" && financeOverview) {
                  if (index === 0) {
                        return {
                              ...stat,
                              value: financeOverview.periods.filter((period) => period.trangThai === "da_mo").length,
                        };
                  }
                  if (index === 1) {
                        return { ...stat, value: formatTien(financeOverview.report.tongCongNo) };
                  }
                  if (index === 2) {
                        return {
                              ...stat,
                              value: formatTien(financeOverview.report.tongThu),
                              note: `${financeOverview.report.soPhieuThu} phiếu thu, từ đầu tháng tới hôm nay`,
                        };
                  }
                  if (index === 3) {
                        return { ...stat, value: formatTien(financeOverview.report.tongThuRong) };
                  }
            }

            if (!workspaceSummary) return stat;

            if (portalRole.slug === "admissions") {
                  if (index === 0) return { ...stat, value: workspaceSummary.leadMoiThangNay };
                  if (index === 1) return { ...stat, value: workspaceSummary.leadDangXuLy };
                  if (index === 2) return { ...stat, value: workspaceSummary.lichHenTuVanHomNay };
                  if (index === 3) {
                        return {
                              ...stat,
                              value: formatTyLeChuyenDoi(
                                    workspaceSummary.tyLeChuyenDoiLead.daDangKy,
                                    workspaceSummary.tyLeChuyenDoiLead.tongLead,
                              ),
                              note: `${workspaceSummary.tyLeChuyenDoiLead.daDangKy}/${workspaceSummary.tyLeChuyenDoiLead.tongLead} khách hàng tiềm năng đã đăng ký`,
                        };
                  }
            }

            if (portalRole.slug === "academic-affairs") {
                  if (index === 0) return { ...stat, value: workspaceSummary.lopDangHoc };
                  if (index === 1) return { ...stat, value: workspaceSummary.buoiHocCanDieuChinh };
                  if (index === 2) return { ...stat, value: workspaceSummary.hocSinhBaoLuu };
                  if (index === 3) return { ...stat, value: workspaceSummary.donXinPhepChoDuyet };
                  if (index === 4) return { ...stat, value: workspaceSummary.hocSinhChoXepLop };
            }

            if (portalRole.slug === "unit-manager") {
                  if (index === 0) return { ...stat, value: workspaceSummary.hocSinhDangHoc };
                  if (index === 1) return { ...stat, value: workspaceSummary.lopDangHoc };
                  if (index === 2) return { ...stat, value: formatTien(workspaceSummary.congNoHienTai) };
                  if (index === 3) return { ...stat, value: workspaceSummary.leadMoiThangNay };
            }

            if (portalRole.slug === "teacher" && teacherOverview) {
                  if (index === 0) return { ...stat, value: teacherOverview.classes.length };
                  if (index === 1) return { ...stat, value: teacherOverview.sessionsHomNay };
                  if (index === 2) return { ...stat, value: teacherOverview.baoGiangChoNhap };
                  if (index === 3) return { ...stat, value: teacherOverview.traoDoiGanDay };
            }

            return stat;
      });
      const portalNextSteps = getPortalNextSteps({
            slug: portalRole.slug,
            organizationLevel: auth.currentOrganization.loaiDonVi,
      });

      return (
            <>
                  <PageHeader title={portalRole.title} subtitle={portalRole.subtitle} />

                  <section className="summary-grid">
                        {workspaceStats.map((stat) => (
                              <StatCard
                                    key={stat.title}
                                    title={stat.title}
                                    value={stat.value}
                                    note={stat.note}
                                    icon={stat.icon}
                                    tone={stat.tone}
                              />
                        ))}
                  </section>

                  {portalRole.slug === "teacher" && teacherError ? (
                        <div className="form-error">{teacherError}</div>
                  ) : null}

                  {portalRole.slug === "accountant" && financeError ? (
                        <div className="form-error">{financeError}</div>
                  ) : null}

                  {portalRole.slug === "accountant" ? (
                        <section className="dashboard-grid">
                              <SectionCard title="Cần chú ý">
                                    <div>
                                          {auth.currentOrganization.loaiDonVi === "he_thong" ? (
                                                <div className="attention-row">
                                                      <div>
                                                            <div className="attention-row__label">Khoản thu sắp đến hạn</div>
                                                            <div className="attention-row__detail">Hạn thanh toán trong 7 ngày tới</div>
                                                      </div>
                                                      <div className="attention-row__value">
                                                            {workspaceSummary?.khoanThuTheoHan.sapDenHan.soLuong ?? 0} khoản ·{" "}
                                                            {formatTien(workspaceSummary?.khoanThuTheoHan.sapDenHan.tongTien ?? "0")}
                                                      </div>
                                                </div>
                                          ) : (
                                                <GuardedLink
                                                      to="/finance?filter=sap_den_han"
                                                      className="attention-row attention-row--link"
                                                >
                                                      <div>
                                                            <div className="attention-row__label">Khoản thu sắp đến hạn</div>
                                                            <div className="attention-row__detail">Hạn thanh toán trong 7 ngày tới</div>
                                                      </div>
                                                      <div className="attention-row__value">
                                                            <span>
                                                                  {workspaceSummary?.khoanThuTheoHan.sapDenHan.soLuong ?? 0} khoản ·{" "}
                                                                  {formatTien(workspaceSummary?.khoanThuTheoHan.sapDenHan.tongTien ?? "0")}
                                                            </span>
                                                            <small className="attention-row__action">Xem chi tiết →</small>
                                                      </div>
                                                </GuardedLink>
                                          )}

                                          {auth.currentOrganization.loaiDonVi === "he_thong" ? (
                                                <div className="attention-row">
                                                      <div>
                                                            <div className="attention-row__label">Khoản thu quá hạn</div>
                                                            <div className="attention-row__detail">Đã qua hạn thanh toán, chưa thu đủ</div>
                                                      </div>
                                                      <div className="attention-row__value">
                                                            {workspaceSummary?.khoanThuTheoHan.quaHan.soLuong ?? 0} khoản ·{" "}
                                                            {formatTien(workspaceSummary?.khoanThuTheoHan.quaHan.tongTien ?? "0")}
                                                      </div>
                                                </div>
                                          ) : (
                                                <GuardedLink to="/finance?filter=qua_han" className="attention-row attention-row--link">
                                                      <div>
                                                            <div className="attention-row__label">Khoản thu quá hạn</div>
                                                            <div className="attention-row__detail">Đã qua hạn thanh toán, chưa thu đủ</div>
                                                      </div>
                                                      <div className="attention-row__value">
                                                            <span>
                                                                  {workspaceSummary?.khoanThuTheoHan.quaHan.soLuong ?? 0} khoản ·{" "}
                                                                  {formatTien(workspaceSummary?.khoanThuTheoHan.quaHan.tongTien ?? "0")}
                                                            </span>
                                                            <small className="attention-row__action">Xem chi tiết →</small>
                                                      </div>
                                                </GuardedLink>
                                          )}

                                          <GuardedLink to="/finance/dieu-chinh" className="attention-row attention-row--link">
                                                <div>
                                                      <div className="attention-row__label">Yêu cầu điều chỉnh chờ duyệt</div>
                                                      <div className="attention-row__detail">Hoàn phí / chuyển phí / bảo lưu đang chờ xử lý</div>
                                                </div>
                                                <div className="attention-row__value">
                                                      <span>{workspaceSummary?.dieuChinhChoDuyet ?? 0} yêu cầu</span>
                                                      <small className="attention-row__action">Xem chi tiết →</small>
                                                </div>
                                          </GuardedLink>

                                          <GuardedLink to="/students" className="attention-row attention-row--link">
                                                <div>
                                                      <div className="attention-row__label">Học sinh mới chưa lập khoản phải thu</div>
                                                      <div className="attention-row__detail">Đã xác nhận đăng ký nhưng chưa từng có khoản phải thu/đặt cọc nào</div>
                                                </div>
                                                <div className="attention-row__value">
                                                      <span>{workspaceSummary?.hocSinhChuaCoKhoanPhaiThu ?? 0} học sinh</span>
                                                      <small className="attention-row__action">Xem chi tiết →</small>
                                                </div>
                                          </GuardedLink>
                                    </div>
                              </SectionCard>

                              {auth.currentOrganization.loaiDonVi === "he_thong" ? (
                                    <SectionCard
                                          title="Kỳ thu đang mở theo đơn vị"
                                          subtitle="Kế toán tổng chỉ xem gộp — vào từng đơn vị để thao tác chi tiết"
                                    >
                                          <div className="user-table-wrap">
                                                <table className="user-table">
                                                      <thead>
                                                            <tr>
                                                                  <th>Đơn vị</th>
                                                                  <th>Kỳ đang mở</th>
                                                                  <th>Phải thu</th>
                                                                  <th>Đã thu</th>
                                                                  <th>Còn lại</th>
                                                            </tr>
                                                      </thead>
                                                      <tbody>
                                                            {groupBaoCaoKyThuTheoDonVi(financeOverview?.report.theoKyThu ?? []).map((row) => (
                                                                  <tr key={row.donVi.id}>
                                                                        <td>{row.donVi.tenDonVi}</td>
                                                                        <td>{row.soLuong}</td>
                                                                        <td>{formatTien(row.phaiThu.toFixed(2))}</td>
                                                                        <td>{formatTien(row.daThu.toFixed(2))}</td>
                                                                        <td>{formatTien(row.conLai.toFixed(2))}</td>
                                                                  </tr>
                                                            ))}
                                                            {groupBaoCaoKyThuTheoDonVi(financeOverview?.report.theoKyThu ?? []).length === 0 ? (
                                                                  <tr>
                                                                        <td colSpan={5} className="empty-cell">
                                                                              Không có kỳ thu nào đang mở.
                                                                        </td>
                                                                  </tr>
                                                            ) : null}
                                                      </tbody>
                                                </table>
                                          </div>
                                    </SectionCard>
                              ) : (
                                    <SectionCard
                                          title="Kỳ thu đang mở"
                                          subtitle={`${financeOverview?.periods.filter((period) => period.trangThai === "da_mo").length ?? 0} kỳ đang mở`}
                                    >
                                          <div className="portal-action-grid">
                                                {(financeOverview?.periods ?? [])
                                                      .filter((period) => period.trangThai === "da_mo")
                                                      .map((period) => (
                                                            <EntityLink
                                                                  key={period.id}
                                                                  to={`/finance/ky-thu/${period.id}`}
                                                                  donVi={period.donVi}
                                                                  className="section-link-card"
                                                            >
                                                                  <strong>{period.tenKyThu}</strong>
                                                                  <span>
                                                                        {period.hanThanhToan ? `Hạn thanh toán: ${period.hanThanhToan}` : period.maKyThu}
                                                                  </span>
                                                                  <small>Đi tới →</small>
                                                            </EntityLink>
                                                      ))}
                                                {(financeOverview?.periods ?? []).filter((period) => period.trangThai === "da_mo")
                                                      .length === 0 ? (
                                                      <div className="empty-cell">Không có kỳ thu nào đang mở.</div>
                                                ) : null}
                                          </div>
                                    </SectionCard>
                              )}
                        </section>
                  ) : null}

                  {portalRole.slug === "unit-manager" ? (
                        <>
                              <SectionCard
                                    title="Cần chú ý"
                                    subtitle="Việc đang chờ xử lý trên cả 3 mảng nghiệp vụ trong đơn vị"
                              >
                                    <div>
                                          <GuardedLink to="/finance?filter=qua_han" className="attention-row attention-row--link">
                                                <div>
                                                      <div className="attention-row__label">Khoản thu quá hạn</div>
                                                      <div className="attention-row__detail">Đã qua hạn thanh toán, chưa thu đủ</div>
                                                </div>
                                                <div className="attention-row__value">
                                                      <span>
                                                            {workspaceSummary?.khoanThuTheoHan.quaHan.soLuong ?? 0} khoản ·{" "}
                                                            {formatTien(workspaceSummary?.khoanThuTheoHan.quaHan.tongTien ?? "0")}
                                                      </span>
                                                      <small className="attention-row__action">Xem chi tiết →</small>
                                                </div>
                                          </GuardedLink>

                                          <GuardedLink to="/attendance/xin-phep" className="attention-row attention-row--link">
                                                <div>
                                                      <div className="attention-row__label">Đơn xin phép chờ duyệt</div>
                                                      <div className="attention-row__detail">Đơn xin nghỉ của học sinh chưa xử lý</div>
                                                </div>
                                                <div className="attention-row__value">
                                                      <span>{workspaceSummary?.donXinPhepChoDuyet ?? 0} đơn</span>
                                                      <small className="attention-row__action">Xem chi tiết →</small>
                                                </div>
                                          </GuardedLink>

                                          <GuardedLink to="/finance/dieu-chinh" className="attention-row attention-row--link">
                                                <div>
                                                      <div className="attention-row__label">Yêu cầu điều chỉnh chờ duyệt</div>
                                                      <div className="attention-row__detail">Hoàn phí / chuyển phí / bảo lưu đang chờ xử lý</div>
                                                </div>
                                                <div className="attention-row__value">
                                                      <span>{workspaceSummary?.dieuChinhChoDuyet ?? 0} yêu cầu</span>
                                                      <small className="attention-row__action">Xem chi tiết →</small>
                                                </div>
                                          </GuardedLink>

                                          <GuardedLink to="/finance/chi-phi" className="attention-row attention-row--link">
                                                <div>
                                                      <div className="attention-row__label">Đề xuất chi chờ duyệt</div>
                                                      <div className="attention-row__detail">Chi phí dịch vụ, mua sắm... đang chờ duyệt trước khi ghi nhận</div>
                                                </div>
                                                <div className="attention-row__value">
                                                      <span>{workspaceSummary?.chiPhiChoDuyet ?? 0} đề xuất</span>
                                                      <small className="attention-row__action">Xem chi tiết →</small>
                                                </div>
                                          </GuardedLink>

                                          <GuardedLink to="/schedule" className="attention-row attention-row--link">
                                                <div>
                                                      <div className="attention-row__label">Buổi học cần điều chỉnh</div>
                                                      <div className="attention-row__detail">Buổi nghỉ/hủy trong 7 ngày tới chưa xếp bù</div>
                                                </div>
                                                <div className="attention-row__value">
                                                      <span>{workspaceSummary?.buoiHocCanDieuChinh ?? 0} buổi</span>
                                                      <small className="attention-row__action">Xem chi tiết →</small>
                                                </div>
                                          </GuardedLink>

                                          <GuardedLink to="/students" className="attention-row attention-row--link">
                                                <div>
                                                      <div className="attention-row__label">Học sinh đang bảo lưu</div>
                                                      <div className="attention-row__detail">Cần theo dõi để hỗ trợ quay lại học hoặc kết thúc bảo lưu</div>
                                                </div>
                                                <div className="attention-row__value">
                                                      <span>{workspaceSummary?.hocSinhBaoLuu ?? 0} học sinh</span>
                                                      <small className="attention-row__action">Xem chi tiết →</small>
                                                </div>
                                          </GuardedLink>

                                          <GuardedLink to="/students" className="attention-row attention-row--link">
                                                <div>
                                                      <div className="attention-row__label">Học sinh mới chưa lập khoản phải thu</div>
                                                      <div className="attention-row__detail">Đã xác nhận đăng ký nhưng chưa từng có khoản phải thu/đặt cọc nào</div>
                                                </div>
                                                <div className="attention-row__value">
                                                      <span>{workspaceSummary?.hocSinhChuaCoKhoanPhaiThu ?? 0} học sinh</span>
                                                      <small className="attention-row__action">Xem chi tiết →</small>
                                                </div>
                                          </GuardedLink>
                                    </div>
                              </SectionCard>

                              <SectionCard
                                    title="Tuyển sinh trong tháng"
                                    subtitle="Phễu tuyển sinh của đơn vị, tính từ đầu tháng tới hôm nay"
                              >
                                    <div className="summary-grid summary-grid--compact">
                                          <StatCard
                                                title="Khách hàng tiềm năng đang chăm sóc"
                                                value={workspaceSummary?.leadDangXuLy ?? 0}
                                                note="Chưa đăng ký, chưa dừng chăm sóc"
                                                icon="📋"
                                                tone="warning"
                                          />
                                          <StatCard
                                                title="Lịch hẹn tư vấn hôm nay"
                                                value={workspaceSummary?.lichHenTuVanHomNay ?? 0}
                                                icon="📅"
                                                tone="info"
                                          />
                                          <StatCard
                                                title="Tỷ lệ chuyển đổi"
                                                value={formatTyLeChuyenDoi(
                                                      workspaceSummary?.tyLeChuyenDoiLead.daDangKy ?? 0,
                                                      workspaceSummary?.tyLeChuyenDoiLead.tongLead ?? 0,
                                                )}
                                                note={`${workspaceSummary?.tyLeChuyenDoiLead.daDangKy ?? 0}/${workspaceSummary?.tyLeChuyenDoiLead.tongLead ?? 0} khách hàng tiềm năng đã đăng ký`}
                                                icon="📈"
                                                tone="success"
                                          />
                                    </div>
                              </SectionCard>
                        </>
                  ) : null}

                  {portalRole.slug === "teacher" && teacherOverview ? (
                        <section className="dashboard-grid">
                              <SectionCard
                                    title={`Lớp được phân công · ${teacherOverview.teacher.hoTen}`}
                                    subtitle={`${teacherOverview.teacher.maGiaoVien} · ${teacherOverview.teacher.chuyenMon || "Chưa cập nhật chuyên môn"
                                          }`}
                              >
                                    <div className="portal-action-grid">
                                          {teacherOverview.classes.map((item) => (
                                                <RoleLink
                                                      key={item.assignment.id}
                                                      label={item.class.tenLop}
                                                      description={`${item.class.maLop} · ${item.assignment.vaiTro}`}
                                                      to={`/classes/${item.class.id}`}
                                                />
                                          ))}
                                          {teacherOverview.classes.length === 0 ? (
                                                <div className="empty-cell">Chưa có lớp đang được phân công.</div>
                                          ) : null}
                                    </div>
                              </SectionCard>

                              <SectionCard
                                    title="Lịch dạy 7 ngày tới"
                                    subtitle={`${teacherOverview.sessions.length} buổi được phân công`}
                              >
                                    <div className="portal-upcoming-list">
                                          {teacherOverview.sessions.slice(0, 8).map((item) => (
                                                <div className="portal-schedule-row" key={item.buoiHoc.id}>
                                                      <span>{formatDay(item.buoiHoc.ngayHoc)}</span>
                                                      <strong>
                                                            {item.buoiHoc.gioBatDau.slice(0, 5)} -{" "}
                                                            {item.buoiHoc.gioKetThuc.slice(0, 5)} · {item.lopHocTenLop}
                                                      </strong>
                                                      <small>{item.buoiHoc.phongHoc || "Chưa có phòng"}</small>
                                                </div>
                                          ))}
                                          {teacherOverview.sessions.length === 0 ? (
                                                <div className="empty-cell">Không có lịch dạy trong 7 ngày tới.</div>
                                          ) : null}
                                    </div>
                              </SectionCard>
                        </section>
                  ) : null}

                  <section className="dashboard-grid">
                        <SectionCard
                              title="Lối vào nhanh"
                              subtitle={portalRole.summary}
                              className="section-card--wide"
                        >
                              <div className="portal-link-grid">
                                    {portalRole.quickLinks.map((item) => (
                                          <RoleLink
                                                key={item.label}
                                                label={item.label}
                                                description={item.description}
                                                to={item.to}
                                          />
                                    ))}
                              </div>
                        </SectionCard>

                        <SectionCard
                              title="Định hướng portal"
                              subtitle="Những bước nên làm tiếp trong bản khung này."
                        >
                              <div className="portal-step-list">
                                    {portalNextSteps.map((step, index) => (
                                          <article className="portal-step" key={step.title}>
                                                <span className="portal-step__index">0{index + 1}</span>
                                                <div>
                                                      <strong>{step.title}</strong>
                                                      <p>{step.detail}</p>
                                                </div>
                                          </article>
                                    ))}
                              </div>
                        </SectionCard>
                  </section>

                  {portalRole.featuredActions || portalRole.notices ? (
                        <section className="dashboard-grid portal-grid--single-column">
                              {portalRole.featuredActions ? (
                                    <SectionCard
                                          title="Tác vụ nhanh"
                                          subtitle="Những chức năng phụ huynh dùng nhiều nhất, đi thẳng vào màn hiện có."
                                          className="section-card--wide"
                                    >
                                          <div className="portal-action-grid">
                                                {portalRole.featuredActions.map((item) => (
                                                      <RoleLink
                                                            key={item.label}
                                                            label={item.label}
                                                            description={item.description}
                                                            to={item.to}
                                                      />
                                                ))}
                                          </div>
                                    </SectionCard>
                              ) : null}

                              {portalRole.notices ? (
                                    <SectionCard
                                          title="Ghi chú triển khai"
                                          subtitle="Mình giữ các màn này ở mức an toàn, chưa đụng sang phần phân quyền mới."
                                    >
                                          <div className="portal-note-list">
                                                {portalRole.notices.map((item) => (
                                                      <article className="portal-note" key={item.title}>
                                                            <strong>{item.title}</strong>
                                                            <p>{item.detail}</p>
                                                      </article>
                                                ))}
                                          </div>
                                    </SectionCard>
                              ) : null}
                        </section>
                  ) : null}
            </>
      );
}
