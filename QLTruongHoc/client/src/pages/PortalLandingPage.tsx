import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { DateField, SelectField, TextAreaField } from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { StatCard } from "../components/shared/StatCard";
import { useAuth } from "../features/auth/AuthContext";
import { findPortalRole, getDefaultPortalPath } from "../config/portal";
import { loadParentPortalOverviewApi } from "../features/portal/portalApi";
import type { ParentPortalChild, ParentPortalOverview } from "../features/portal/portalTypes";
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

  if (!auth?.currentOrganization) {
    return <Navigate to="/" replace />;
  }

  if (!portalRole) {
    return <Navigate to={getDefaultPortalPath(auth.currentOrganization.vaiTro)} replace />;
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
        title: "Điểm số",
        value: "Chưa có",
        note: "Hệ thống hiện chưa có nguồn dữ liệu điểm số",
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
          action={<span className="text-button">{portalRole.highlight}</span>}
        />

        {parentError ? <div className="form-error">{parentError}</div> : null}

        <section className="summary-grid">
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
              <div className="portal-parent-info">
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

            <section className="dashboard-grid portal-grid--single-column">
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

                        <div className="portal-score-box">
                          <strong>{child.scores.title}</strong>
                          <p>{child.scores.detail}</p>
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

                        <div className="portal-fee-box">
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

                        <div className="portal-fee-box">
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

                        <div className="portal-exchange-box">
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
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={portalRole.title}
        subtitle={portalRole.subtitle}
        action={<span className="text-button">{portalRole.highlight}</span>}
      />

      <section className="summary-grid">
        {portalRole.stats.map((stat) => (
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
            {portalRole.nextSteps.map((step, index) => (
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
