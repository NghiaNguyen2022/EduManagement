import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";

import { EntityLink } from "../components/shared/EntityLink";
import { GuardedLink } from "../components/shared/GuardedLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { StatCard } from "../components/shared/StatCard";
import { TabBar } from "../components/shared/TabBar";
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
      ParentPortalOverview,
      TeacherPortalOverview,
} from "../features/portal/portalTypes";

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

export function PortalLandingPage() {
      const { auth } = useAuth();
      const { roleSlug } = useParams();
      const location = useLocation();
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

      // Sidebar portal phụ huynh điều hướng bằng hash trên cùng route
      // (/portal/parent#tong-quan...), nhưng React Router không tự cuộn tới
      // anchor khi chỉ đổi hash trên cùng path — phải tự scrollIntoView.
      // Chạy lại khi parentOverview đổi vì các anchor chỉ được render sau khi
      // có dữ liệu (children.map(...)), nên lần đầu vào trang có hash sẵn thì
      // phần tử đích có thể chưa tồn tại lúc effect chạy.
      useEffect(() => {
            if (!isParentPortal || !location.hash) return;

            const id = location.hash.slice(1);
            const element = document.getElementById(id);

            if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
      }, [isParentPortal, location.hash, parentOverview]);

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
                  {
                        title: "Nhắn tin",
                        value: "Mở hộp thư",
                        note: "Xem tất cả hội thoại với nhà trường ở 1 chỗ",
                        icon: "💬",
                        tone: "secondary" as const,
                        to: "/portal/parent/nhan-tin",
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
                              {stats.map((stat) =>
                                    "to" in stat && stat.to ? (
                                          <Link key={stat.title} to={stat.to} className="stat-card-link">
                                                <StatCard
                                                      title={stat.title}
                                                      value={stat.value}
                                                      note={stat.note}
                                                      icon={stat.icon}
                                                      tone={stat.tone}
                                                />
                                          </Link>
                                    ) : (
                                          <StatCard
                                                key={stat.title}
                                                title={stat.title}
                                                value={stat.value}
                                                note={stat.note}
                                                icon={stat.icon}
                                                tone={stat.tone}
                                          />
                                    ),
                              )}
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
                                                                        ? `${group.children.length} con đang theo học tại đơn vị này — chọn 1 con để xem đầy đủ`
                                                                        : "Chọn con để xem đầy đủ thông tin"
                                                            }
                                                            className="section-card--wide"
                                                      >
                                                            <div className="portal-child-grid">
                                                                  {group.children.map((child) => (
                                                                        <Link
                                                                              key={child.hocSinh.id}
                                                                              to={`/portal/parent/con/${child.hocSinh.id}`}
                                                                              className="portal-child-card portal-child-card--link"
                                                                        >
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
                                                                                    <span>
                                                                                          {child.activeClasses[0]?.lopHoc.tenLop ?? "Chưa có lớp"}
                                                                                    </span>
                                                                              </div>

                                                                              {child.absenceSummary.unexcused > 0 ? (
                                                                                    <div className="notice-banner notice-banner--danger">
                                                                                          <span className="notice-banner__icon" aria-hidden="true">
                                                                                                ⚠️
                                                                                          </span>
                                                                                          <strong>
                                                                                                Vắng {child.absenceSummary.unexcused} buổi chưa rõ lý do
                                                                                          </strong>
                                                                                    </div>
                                                                              ) : null}

                                                                              <div className="portal-child-summary-card__stats">
                                                                                    <span>
                                                                                          📊 {child.thanhTich.length + child.danhGia.length} kết quả
                                                                                    </span>
                                                                                    <span>🩺 {child.sucKhoe.length} bản ghi sức khỏe</span>
                                                                                    <span>📷 {child.hoatDong.length} hoạt động</span>
                                                                              </div>

                                                                              <span className="text-button">Xem chi tiết →</span>
                                                                        </Link>
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
