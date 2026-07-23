import { useEffect, useState } from "react";

import { DateField, SelectField } from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import { listGiaoVienApi } from "../features/giaoVien/giaoVienApi";
import type { GiaoVienItem } from "../features/giaoVien/giaoVienTypes";
import { listThoiKhoaBieuApi } from "../features/lichHoc/lichHocApi";
import type { ThoiKhoaBieuItem } from "../features/lichHoc/lichHocTypes";

const TRANG_THAI_BUOI_HOC_LABEL: Record<string, string> = {
  du_kien: "Dự kiến",
  da_hoc: "Đã học",
  nghi: "Nghỉ",
  huy: "Huỷ",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function SchedulePage() {
  const { auth } = useAuth();
  const isHeThong = auth?.currentOrganization?.loaiDonVi === "he_thong";

  const [items, setItems] = useState<ThoiKhoaBieuItem[]>([]);
  const [teachers, setTeachers] = useState<GiaoVienItem[]>([]);
  const [range, setRange] = useState({
    tuNgay: todayIso(),
    denNgay: addDaysIso(todayIso(), 7),
  });
  const [giaoVienId, setGiaoVienId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [rows, teacherRows] = await Promise.all([
        listThoiKhoaBieuApi({
          tuNgay: range.tuNgay,
          denNgay: range.denNgay,
          giaoVienId: giaoVienId ? Number(giaoVienId) : undefined,
        }),
        listGiaoVienApi(),
      ]);

      setItems(rows);
      setTeachers(teacherRows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải thời khóa biểu.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [
    range.tuNgay,
    range.denNgay,
    giaoVienId,
    auth?.currentOrganization?.id,
  ]);

  const groupedByDay = new Map<string, ThoiKhoaBieuItem[]>();

  for (const item of items) {
    const list = groupedByDay.get(item.buoiHoc.ngayHoc) ?? [];
    list.push(item);
    groupedByDay.set(item.buoiHoc.ngayHoc, list);
  }

  const days = [...groupedByDay.keys()].sort();

  return (
    <div className="page-stack">
      <PageHeader
        title="Lịch học"
        subtitle={
          isHeThong
            ? "Đơn vị hệ thống không tổ chức lớp/lịch học riêng — vào đúng một trường/trung tâm để xem thời khóa biểu"
            : "Thời khóa biểu theo lớp và giáo viên trong đơn vị đang làm việc"
        }
      />

      {error ? <div className="form-error">{error}</div> : null}

      <SectionCard title="Bộ lọc">
        <div className="user-toolbar">
          <DateField
            label="Từ ngày"
            value={range.tuNgay}
            onChange={(value) => setRange({ ...range, tuNgay: value })}
          />

          <DateField
            label="Đến ngày"
            value={range.denNgay}
            onChange={(value) => setRange({ ...range, denNgay: value })}
          />

          <SelectField
            label="Giáo viên"
            value={giaoVienId}
            placeholder="Tất cả giáo viên"
            options={teachers.map((teacher) => ({
              value: String(teacher.id),
              label: `${teacher.hoTen} (${teacher.maGiaoVien})`,
            }))}
            onChange={setGiaoVienId}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Buổi học"
        subtitle={
          loading
            ? "Đang tải dữ liệu..."
            : `${items.length} buổi trong khoảng đã chọn`
        }
      >
        {days.length === 0 && !loading ? (
          <div className="empty-cell">
            {isHeThong
              ? "Đơn vị hệ thống không tổ chức lớp học, nên không có lịch học ở đây. Chuyển sang một trường/trung tâm cụ thể ở Topbar để xem."
              : "Không có buổi học nào trong khoảng ngày này."}
          </div>
        ) : (
          <div className="class-list">
            {days.map((day) => (
              <div key={day}>
                <strong>{day}</strong>

                {(groupedByDay.get(day) ?? []).map((item) => (
                  <div
                    className="class-row"
                    key={item.buoiHoc.id}
                  >
                    <div className="class-row__time">
                      {item.buoiHoc.gioBatDau.slice(0, 5)} -{" "}
                      {item.buoiHoc.gioKetThuc.slice(0, 5)}
                    </div>

                    <div className="class-row__main">
                      <strong>
                        {item.lopHocTenLop} ({item.lopHocMaLop})
                      </strong>
                      <span>
                        {item.giaoVienHoTen || "Chưa phân công giáo viên"}
                      </span>
                    </div>

                    <div className="class-row__room">
                      {item.buoiHoc.phongHoc || "—"}
                    </div>

                    <span>
                      {TRANG_THAI_BUOI_HOC_LABEL[item.buoiHoc.trangThai]}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
