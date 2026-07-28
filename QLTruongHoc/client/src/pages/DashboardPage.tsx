import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { EntityLink, OrgLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { StatCard } from "../components/shared/StatCard";
import { useAuth } from "../features/auth/AuthContext";
import { getDashboardSummaryApi } from "../features/dashboard/dashboardApi";
import type { DashboardSummary } from "../features/dashboard/dashboardTypes";
import { listDonViApi } from "../features/donVi/donViApi";
import type { DonViItem } from "../features/donVi/donViTypes";

function formatTien(value: string) {
      return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

function formatToday() {
      return new Intl.DateTimeFormat("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date());
}

const ADMIN_QUICK_LINKS = [
      {
            label: "Danh mục đơn vị",
            description: "Quản lý trường, trung tâm, cơ sở theo cấu trúc cha-con.",
            to: "/organizations",
      },
      {
            label: "Người dùng",
            description: "Tạo tài khoản nhân sự, khoá/mở, đặt lại mật khẩu.",
            to: "/users",
      },
      {
            label: "Vai trò · Phân quyền",
            description: "Xem và chỉnh quyền theo từng vai trò nghiệp vụ.",
            to: "/roles",
      },
      {
            label: "Nhật ký hệ thống",
            description: "Tra cứu các thao tác quan trọng trên toàn hệ thống.",
            to: "/audit-logs",
      },
      {
            label: "Báo cáo tài chính",
            description: "Doanh thu, công nợ và thu ròng gộp toàn hệ thống.",
            to: "/finance/bao-cao",
      },
];

export function DashboardPage() {
      const { auth } = useAuth();
      const navigate = useNavigate();
      const isHeThong = auth?.currentOrganization?.loaiDonVi === "he_thong";

      const [summary, setSummary] = useState<DashboardSummary | null>(null);
      const [units, setUnits] = useState<DonViItem[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState("");

      useEffect(() => {
            let active = true;

            setLoading(true);
            setError("");

            getDashboardSummaryApi()
                  .then((data) => {
                        if (!active) return;
                        setSummary(data);
                  })
                  .catch((loadError) => {
                        if (!active) return;
                        setError(
                              loadError instanceof Error ? loadError.message : "Không thể tải số liệu tổng quan.",
                        );
                  })
                  .finally(() => {
                        if (!active) return;
                        setLoading(false);
                  });

            return () => {
                  active = false;
            };
      }, [auth?.currentOrganization?.id]);

      useEffect(() => {
            if (!isHeThong) {
                  setUnits([]);
                  return;
            }

            let active = true;

            listDonViApi()
                  .then((rows) => {
                        if (active) setUnits(rows);
                  })
                  .catch(() => {
                        if (active) setUnits([]);
                  });

            return () => {
                  active = false;
            };
      }, [isHeThong]);

      const unitsByTrangThai = {
            hoat_dong: units.filter((unit) => unit.trangThai === "hoat_dong").length,
            tam_ngung: units.filter((unit) => unit.trangThai === "tam_ngung").length,
            ngung_hoat_dong: units.filter((unit) => unit.trangThai === "ngung_hoat_dong").length,
      };

      const lichChungTheoDonVi = useMemo(() => {
            const map = new Map<
                  number,
                  { donVi: DashboardSummary["lichChungHomNay"][number]["donVi"]; items: DashboardSummary["lichChungHomNay"] }
            >();

            for (const item of summary?.lichChungHomNay ?? []) {
                  const group = map.get(item.donVi.id) ?? { donVi: item.donVi, items: [] };
                  group.items.push(item);
                  map.set(item.donVi.id, group);
            }

            return Array.from(map.values());
      }, [summary?.lichChungHomNay]);

      const tongCongTheoDonVi = useMemo(() => {
            const rows = summary?.theoDonVi ?? [];

            return rows.reduce(
                  (acc, row) => ({
                        doanhThu: acc.doanhThu + Number(row.doanhThu),
                        congNo: acc.congNo + Number(row.congNo),
                        hocSinhBaoLuu: acc.hocSinhBaoLuu + row.hocSinhBaoLuu,
                        leadMoi: acc.leadMoi + row.leadMoi,
                  }),
                  { doanhThu: 0, congNo: 0, hocSinhBaoLuu: 0, leadMoi: 0 },
            );
      }, [summary?.theoDonVi]);

      const summaryCards = [
            {
                  title: "Học sinh đang học",
                  value: summary?.hocSinhDangHoc ?? 0,
                  note: 'Đang có trạng thái "Đang học"',
                  icon: "♙",
                  tone: "primary" as const,
            },
            {
                  title: "Lớp đang hoạt động",
                  value: summary?.lopDangHoc ?? 0,
                  note: 'Đang có trạng thái "Đang học"',
                  icon: "▣",
                  tone: "secondary" as const,
            },
            {
                  title: "Công nợ hiện tại",
                  value: summary ? formatTien(summary.congNoHienTai) : "—",
                  note: "Tổng khoản phải thu còn lại",
                  icon: "▤",
                  tone: "warning" as const,
            },
            {
                  title: "Khách hàng tiềm năng mới trong tháng",
                  value: summary?.leadMoiThangNay ?? 0,
                  note: "Tính từ đầu tháng tới hôm nay",
                  icon: "✓",
                  tone: "success" as const,
            },
      ];

      // Mầm non dùng "trẻ" thay "học viên" theo cách xưng hô thống nhất giữa
      // các màn tổng quan, tránh mỗi màn dùng một cách gọi khác nhau.
      const isMamNon = auth?.currentOrganization?.loaiHinhDaoTao === "mam_non";
      const nguoiHocLabel = isMamNon ? "Trẻ" : "Học viên";

      const quyModonViCards = [
            {
                  title: `${nguoiHocLabel} đang học`,
                  value: summary?.hocSinhDangHoc ?? 0,
                  note: 'Đang có trạng thái "Đang học"',
                  icon: "♙",
                  tone: "primary" as const,
            },
            {
                  title: "Giáo viên đang hoạt động",
                  value: summary?.giaoVienHoatDong ?? 0,
                  note: "Đang có trạng thái hoạt động",
                  icon: "🧑‍🏫",
                  tone: "info" as const,
            },
            {
                  title: "Lớp đang hoạt động",
                  value: summary?.lopDangHoc ?? 0,
                  note: 'Đang có trạng thái "Đang học"',
                  icon: "▣",
                  tone: "secondary" as const,
            },
      ];

      const vanHanhCards = [
            {
                  title: "Công nợ hiện tại",
                  value: summary ? formatTien(summary.congNoHienTai) : "—",
                  note: "Tổng khoản phải thu còn lại",
                  icon: "▤",
                  tone: "warning" as const,
            },
            {
                  title: "Khách hàng tiềm năng mới trong tháng",
                  value: summary?.leadMoiThangNay ?? 0,
                  note: "Tính từ đầu tháng tới hôm nay",
                  icon: "✓",
                  tone: "success" as const,
            },
      ];

      return (
            <>
                  <PageHeader
                        title="Bảng điều hành"
                        subtitle={
                              isHeThong
                                    ? "Tổng quan toàn hệ thống — theo dõi đơn vị, người dùng và dữ liệu gộp toàn trường/trung tâm"
                                    : "Theo dõi nhanh tình hình tuyển sinh, lớp học, học viên và vận hành trong ngày"
                        }
                        action={
                              isHeThong ? null : (
                                    <button className="primary-button" onClick={() => navigate("/admissions")}>
                                          + Tiếp nhận học viên
                                    </button>
                              )
                        }
                  />

                  {error ? <div className="form-error">{error}</div> : null}

                  {isHeThong ? (
                        <section className="summary-grid">
                              {summaryCards.map((card) => (
                                    <StatCard
                                          key={card.title}
                                          title={card.title}
                                          value={card.value}
                                          note={card.note}
                                          icon={card.icon}
                                          tone={card.tone}
                                    />
                              ))}
                        </section>
                  ) : (
                        <>
                              <h3 className="dashboard-section-label">Quy mô đơn vị</h3>

                              <section className="summary-grid summary-grid--compact">
                                    {quyModonViCards.map((card) => (
                                          <StatCard
                                                key={card.title}
                                                title={card.title}
                                                value={card.value}
                                                note={card.note}
                                                icon={card.icon}
                                                tone={card.tone}
                                          />
                                    ))}
                              </section>

                              <h3 className="dashboard-section-label">Tình hình vận hành</h3>

                              <section className="summary-grid summary-grid--halves">
                                    {vanHanhCards.map((card) => (
                                          <StatCard
                                                key={card.title}
                                                title={card.title}
                                                value={card.value}
                                                note={card.note}
                                                icon={card.icon}
                                                tone={card.tone}
                                          />
                                    ))}
                              </section>
                        </>
                  )}

                  {!isHeThong ? (
                        <section className="dashboard-grid">
                              <SectionCard title="Cần chú ý" className="section-card--wide">
                                    {loading ? (
                                          <div className="empty-cell">Đang tải...</div>
                                    ) : (
                                          <div>
                                                <div className="attention-row">
                                                      <div>
                                                            <div className="attention-row__label">Khoản thu sắp đến hạn</div>
                                                            <div className="attention-row__detail">Hạn thanh toán trong 7 ngày tới</div>
                                                      </div>
                                                      <div className="attention-row__value">
                                                            {summary?.khoanThuTheoHan.sapDenHan.soLuong ?? 0} khoản ·{" "}
                                                            {formatTien(summary?.khoanThuTheoHan.sapDenHan.tongTien ?? "0")}
                                                      </div>
                                                </div>

                                                <div className="attention-row">
                                                      <div>
                                                            <div className="attention-row__label">Khoản thu quá hạn</div>
                                                            <div className="attention-row__detail">Đã qua hạn thanh toán, chưa thu đủ</div>
                                                      </div>
                                                      <div className="attention-row__value">
                                                            {summary?.khoanThuTheoHan.quaHan.soLuong ?? 0} khoản ·{" "}
                                                            {formatTien(summary?.khoanThuTheoHan.quaHan.tongTien ?? "0")}
                                                      </div>
                                                </div>

                                                <div className="attention-row">
                                                      <div>
                                                            <div className="attention-row__label">Đơn xin phép chờ duyệt</div>
                                                            <div className="attention-row__detail">Đơn xin nghỉ của học sinh chưa xử lý</div>
                                                      </div>
                                                      <div className="attention-row__value">
                                                            {summary?.donXinPhepChoDuyet ?? 0} đơn
                                                      </div>
                                                </div>
                                          </div>
                                    )}
                              </SectionCard>

                              <SectionCard
                                    title="Sĩ số lớp"
                                    subtitle="Sĩ số hiện tại so với sĩ số tối đa của từng lớp đang học"
                              >
                                    {loading ? (
                                          <div className="empty-cell">Đang tải...</div>
                                    ) : (summary?.siSoTheoLop.length ?? 0) === 0 ? (
                                          <div className="empty-cell">Chưa có lớp nào đang học.</div>
                                    ) : (
                                          <div className="user-table-wrap">
                                                <table className="user-table">
                                                      <thead>
                                                            <tr>
                                                                  <th>Lớp</th>
                                                                  <th>Sĩ số hiện tại</th>
                                                                  <th>Sĩ số tối đa</th>
                                                            </tr>
                                                      </thead>

                                                      <tbody>
                                                            {summary!.siSoTheoLop.map((item) => (
                                                                  <tr key={item.id}>
                                                                        <td>
                                                                              <strong>{item.tenLop}</strong>
                                                                              <small>{item.maLop}</small>
                                                                        </td>
                                                                        <td>{item.siSoHienTai}</td>
                                                                        <td>{item.siSoToiDa ?? "Không giới hạn"}</td>
                                                                  </tr>
                                                            ))}
                                                      </tbody>
                                                </table>
                                          </div>
                                    )}
                              </SectionCard>
                        </section>
                  ) : null}

                  {isHeThong ? (
                        <>
                              <SectionCard
                                    title="Tổng quan theo đơn vị"
                                    subtitle="Doanh thu, công nợ, học sinh bảo lưu và khách hàng tiềm năng mới trong tháng — theo từng trường/trung tâm"
                                    className="section-card--wide"
                              >
                                    {loading ? (
                                          <div className="empty-cell">Đang tải...</div>
                                    ) : (summary?.theoDonVi.length ?? 0) === 0 ? (
                                          <div className="empty-cell">Chưa có đơn vị nào để tổng hợp.</div>
                                    ) : (
                                          <div className="user-table-wrap">
                                                <table className="user-table">
                                                      <thead>
                                                            <tr>
                                                                  <th>Đơn vị</th>
                                                                  <th>Doanh thu</th>
                                                                  <th>Công nợ</th>
                                                                  <th>Học sinh bảo lưu</th>
                                                                  <th>Khách hàng tiềm năng mới</th>
                                                            </tr>
                                                      </thead>

                                                      <tbody>
                                                            {summary!.theoDonVi.map((row) => (
                                                                  <tr key={row.donVi.id}>
                                                                        <td>
                                                                              <OrgLink donVi={row.donVi} to="/dashboard" />
                                                                        </td>
                                                                        <td>{formatTien(row.doanhThu)}</td>
                                                                        <td>{formatTien(row.congNo)}</td>
                                                                        <td>{row.hocSinhBaoLuu}</td>
                                                                        <td>{row.leadMoi}</td>
                                                                  </tr>
                                                            ))}
                                                      </tbody>

                                                      <tfoot>
                                                            <tr className="user-table__total-row">
                                                                  <td>Tổng cộng</td>
                                                                  <td>{formatTien(String(tongCongTheoDonVi.doanhThu))}</td>
                                                                  <td>{formatTien(String(tongCongTheoDonVi.congNo))}</td>
                                                                  <td>{tongCongTheoDonVi.hocSinhBaoLuu}</td>
                                                                  <td>{tongCongTheoDonVi.leadMoi}</td>
                                                            </tr>
                                                      </tfoot>
                                                </table>
                                          </div>
                                    )}
                              </SectionCard>

                              <SectionCard
                                    title="Lịch chung hôm nay theo đơn vị"
                                    subtitle={formatToday()}
                                    actions={
                                          <button type="button" className="text-button" onClick={() => navigate("/schedule")}>
                                                Xem thời khóa biểu
                                          </button>
                                    }
                                    className="section-card--wide"
                              >
                                    {loading ? (
                                          <div className="empty-cell">Đang tải...</div>
                                    ) : lichChungTheoDonVi.length === 0 ? (
                                          <div className="empty-cell">Không có buổi học nào hôm nay ở bất kỳ đơn vị nào.</div>
                                    ) : (
                                          <div className="page-stack">
                                                {lichChungTheoDonVi.map((group) => (
                                                      <div key={group.donVi.id}>
                                                            <strong>{group.donVi.tenDonVi}</strong>

                                                            <div className="class-list">
                                                                  {group.items.map((item) => (
                                                                        <div className="class-row" key={item.buoiHoc.id}>
                                                                              <div className="class-row__time">
                                                                                    {item.buoiHoc.gioBatDau.slice(0, 5)} – {item.buoiHoc.gioKetThuc.slice(0, 5)}
                                                                              </div>
                                                                              <div className="class-row__main">
                                                                                    <strong>{item.lopHocTenLop}</strong>
                                                                                    <span>{item.giaoVienHoTen || "Chưa phân công"}</span>
                                                                              </div>
                                                                              <div className="class-row__room">{item.buoiHoc.phongHoc || "—"}</div>
                                                                        </div>
                                                                  ))}
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    )}
                              </SectionCard>

                              <SectionCard
                                    title="Tổng quan đơn vị"
                                    subtitle={`${units.length} đơn vị trong toàn hệ thống`}
                                    actions={
                                          <button type="button" className="text-button" onClick={() => navigate("/organizations")}>
                                                Xem Danh mục đơn vị
                                          </button>
                                    }
                                    className="section-card--wide"
                              >
                                    <div className="summary-grid summary-grid--compact">
                                          <StatCard
                                                title="Đang hoạt động"
                                                value={unitsByTrangThai.hoat_dong}
                                                icon="✓"
                                                tone="success"
                                          />
                                          <StatCard
                                                title="Tạm ngưng"
                                                value={unitsByTrangThai.tam_ngung}
                                                icon="◌"
                                                tone="warning"
                                          />
                                          <StatCard
                                                title="Ngừng hoạt động"
                                                value={unitsByTrangThai.ngung_hoat_dong}
                                                icon="✕"
                                                tone="danger"
                                          />
                                    </div>
                              </SectionCard>

                              <SectionCard
                                    title="Lối vào nhanh cho quản trị"
                                    subtitle="Các nghiệp vụ quản trị hệ thống dùng nhiều nhất"
                                    className="section-card--wide"
                              >
                                    <div className="portal-link-grid">
                                          {ADMIN_QUICK_LINKS.map((item) => (
                                                <Link className="section-link-card" to={item.to} key={item.label}>
                                                      <strong>{item.label}</strong>
                                                      <span>{item.description}</span>
                                                      <small>Đi tới →</small>
                                                </Link>
                                          ))}
                                    </div>
                              </SectionCard>
                        </>
                  ) : (
                        <SectionCard
                              title="Lịch học hôm nay"
                              subtitle={formatToday()}
                              actions={
                                    <button type="button" className="text-button" onClick={() => navigate("/schedule")}>
                                          Xem thời khóa biểu
                                    </button>
                              }
                              className="section-card--wide"
                        >
                              <div className="class-list">
                                    {loading ? (
                                          <div className="empty-cell">Đang tải...</div>
                                    ) : (summary?.lichHocHomNay.length ?? 0) === 0 ? (
                                          <div className="empty-cell">Không có buổi học nào hôm nay.</div>
                                    ) : (
                                          summary!.lichHocHomNay.map((item) => (
                                                <div className="class-row" key={item.buoiHoc.id}>
                                                      <div className="class-row__time">
                                                            {item.buoiHoc.gioBatDau.slice(0, 5)} – {item.buoiHoc.gioKetThuc.slice(0, 5)}
                                                      </div>
                                                      <div className="class-row__main">
                                                            <strong>{item.lopHocTenLop}</strong>
                                                            <span>{item.giaoVienHoTen || "Chưa phân công"}</span>
                                                      </div>
                                                      <div className="class-row__room">{item.buoiHoc.phongHoc || "—"}</div>
                                                      <button
                                                            type="button"
                                                            className="secondary-button"
                                                            onClick={() => navigate("/attendance")}
                                                      >
                                                            Điểm danh
                                                      </button>
                                                </div>
                                          ))
                                    )}
                              </div>
                        </SectionCard>
                  )}
            </>
      );
}
