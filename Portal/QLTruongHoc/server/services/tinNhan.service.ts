import { findHocSinhById } from "../db/hocSinh.repository.js";
import { listActiveEnrollmentsByHocSinh, listPhanCongGiaoVien } from "../db/lopHoc.repository.js";
import { listGuardianLinksByHocSinh } from "../db/phuHuynh.repository.js";
import { listThongBaoSuKienByNguoiDung } from "../db/thongBaoSuKien.repository.js";
import {
  createTinNhan,
  listTinNhanByHocSinh,
  listTinNhanThreadsByDonVi,
} from "../db/tinNhan.repository.js";
import { findGuardianChildByHocSinhId, listGuardianChildren } from "./phuHuynh.service.js";
import { notifyNguoiDung } from "./thongBaoSuKien.service.js";

type TinNhanRow = Awaited<ReturnType<typeof listTinNhanByHocSinh>>[number];

async function notifyOtherSide(input: {
  donViId: number;
  hocSinhId: number;
  hocSinhTen: string;
  senderId: number;
  senderIsGuardian: boolean;
}) {
  const nguoiNhanIds = new Set<number>();

  if (input.senderIsGuardian) {
    // Phụ huynh gửi -> báo cho giáo viên đang phụ trách (các) lớp học sinh
    // đang học.
    const activeEnrollments = await listActiveEnrollmentsByHocSinh(input.hocSinhId);
    const lopHocIds = [...new Set(activeEnrollments.map((item) => item.lopHocId))];

    for (const lopHocId of lopHocIds) {
      const phanCong = await listPhanCongGiaoVien(lopHocId);
      for (const item of phanCong) {
        if (item.giaoVien.nguoiDungId) {
          nguoiNhanIds.add(item.giaoVien.nguoiDungId);
        }
      }
    }
  } else {
    // Nhân viên/giáo viên gửi -> báo cho (các) phụ huynh đã liên kết tài
    // khoản.
    const guardianLinks = await listGuardianLinksByHocSinh(input.hocSinhId);

    for (const link of guardianLinks) {
      if (link.phuHuynh.nguoiDungId) {
        nguoiNhanIds.add(link.phuHuynh.nguoiDungId);
      }
    }
  }

  nguoiNhanIds.delete(input.senderId);

  // Người nhận luôn là PHÍA CÒN LẠI so với người gửi (đã lọc ở khối if/else
  // trên) — nên cả nhóm nhận trong 1 lần gọi đều cùng 1 loại giao diện, dẫn
  // link đúng chỗ mở tin nhắn của phía đó: nhân viên -> hộp thư tổng hợp
  // (`/tin-nhan`), phụ huynh -> hộp thư tổng hợp riêng trong Portal
  // (`/portal/parent/nhan-tin`).
  const duongDan = input.senderIsGuardian
    ? `/tin-nhan?hocSinhId=${input.hocSinhId}`
    : `/portal/parent/nhan-tin?hocSinhId=${input.hocSinhId}`;

  await Promise.all(
    [...nguoiNhanIds].map((nguoiNhanId) =>
      notifyNguoiDung({
        donViId: input.donViId,
        nguoiNhanId,
        loaiSuKien: "tin_nhan.moi",
        tieuDe: "Có tin nhắn mới",
        noiDung: `Có tin nhắn mới về học sinh ${input.hocSinhTen}.`,
        duongDan,
      }),
    ),
  );
}

/** Trích `hocSinhId` từ `duongDan` của thông báo `tin_nhan.moi` để đối chiếu chưa đọc theo thread. */
function extractHocSinhIdFromDuongDan(duongDan: string | null, paramName: string) {
  const match = duongDan?.match(new RegExp(`${paramName}=(\\d+)`));
  return match ? Number(match[1]) : null;
}

export async function listTinNhanForStaff(donViId: number, hocSinhId: number) {
  const hocSinh = await findHocSinhById(donViId, hocSinhId);

  if (!hocSinh) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  return listTinNhanByHocSinh(hocSinhId);
}

/**
 * Hộp thư tổng hợp cho nhân viên — mỗi học sinh 1 dòng (tin mới nhất), kèm
 * đánh dấu "chưa đọc" bằng cách đối chiếu với `ThongBaoSuKien` loại
 * `tin_nhan.moi` chưa đọc của người dùng hiện tại (đã có sẵn khi gửi tin —
 * xem `notifyOtherSide`). Không thêm cột trạng thái đọc riêng trên từng tin
 * nhắn — tái dùng cơ chế thông báo đã có, tránh 2 nguồn sự thật.
 */
export async function listTinNhanThreadsForStaff(donViId: number, actorUserId: number) {
  const [threads, recentEvents] = await Promise.all([
    listTinNhanThreadsByDonVi(donViId),
    listThongBaoSuKienByNguoiDung(donViId, actorUserId, 100),
  ]);

  const unreadHocSinhIds = new Set(
    recentEvents
      .filter((event) => event.loaiSuKien === "tin_nhan.moi" && !event.daDoc)
      .map((event) => extractHocSinhIdFromDuongDan(event.duongDan, "hocSinhId"))
      .filter((id): id is number => id !== null),
  );

  return threads.map((thread) => ({
    hocSinh: thread.hocSinh,
    lastMessage: thread.tinNhan,
    coTinChuaDoc: unreadHocSinhIds.has(thread.hocSinh.id),
    lopHoc: thread.lopHoc,
  }));
}

/**
 * Hộp thư tổng hợp cho phụ huynh — mỗi con 1 dòng (tin mới nhất), gom qua
 * mọi hồ sơ `PhuHuynh` liên kết (`listGuardianChildren`). Không lọc theo
 * `donViId` — phụ huynh không neo 1 đơn vị (giống nguyên tắc ở
 * `getParentPortalOverview`).
 */
export async function listTinNhanThreadsForGuardian(userId: number) {
  const children = await listGuardianChildren(userId);

  const threads: { hocSinh: (typeof children)[number]; lastMessage: TinNhanRow }[] = [];

  for (const child of children) {
    const messages = await listTinNhanByHocSinh(child.id);
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) threads.push({ hocSinh: child, lastMessage });
  }

  // Đối chiếu chưa đọc qua mọi đơn vị con đang học (mỗi đơn vị có
  // ThongBaoSuKien riêng theo donViId) — gộp lại thay vì lọc theo 1 đơn vị.
  const unreadHocSinhIds = new Set<number>();
  const donViIds = [...new Set(children.map((child) => child.donViId))];

  await Promise.all(
    donViIds.map(async (donViId) => {
      const events = await listThongBaoSuKienByNguoiDung(donViId, userId, 100);
      for (const event of events) {
        if (event.loaiSuKien !== "tin_nhan.moi" || event.daDoc) continue;
        const hocSinhId = extractHocSinhIdFromDuongDan(event.duongDan, "hocSinhId");
        if (hocSinhId !== null) unreadHocSinhIds.add(hocSinhId);
      }
    }),
  );

  return threads
    .map((thread) => ({
      hocSinh: thread.hocSinh,
      lastMessage: thread.lastMessage,
      coTinChuaDoc: unreadHocSinhIds.has(thread.hocSinh.id),
      lopHoc: null as { id: number; tenLop: string } | null,
    }))
    .sort((a, b) => (a.lastMessage.createdAt < b.lastMessage.createdAt ? 1 : -1));
}

export async function listTinNhanForGuardian(userId: number, hocSinhId: number) {
  const child = await findGuardianChildByHocSinhId(userId, hocSinhId);

  if (!child) {
    throw new Error("Không tìm thấy học sinh trong danh sách con của bạn.");
  }

  return listTinNhanByHocSinh(hocSinhId);
}

export async function sendTinNhanFromStaff(input: {
  donViId: number;
  hocSinhId: number;
  lopHocId?: number | null;
  noiDung: string;
  actorUserId: number;
}) {
  const hocSinh = await findHocSinhById(input.donViId, input.hocSinhId);

  if (!hocSinh) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  return sendTinNhan({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    hocSinhTen: hocSinh.hoTen,
    lopHocId: input.lopHocId ?? null,
    noiDung: input.noiDung,
    nguoiGuiId: input.actorUserId,
    nguoiGuiLaPhuHuynh: false,
  });
}

export async function sendTinNhanFromGuardian(input: {
  hocSinhId: number;
  noiDung: string;
  actorUserId: number;
}) {
  const child = await findGuardianChildByHocSinhId(input.actorUserId, input.hocSinhId);

  if (!child) {
    throw new Error("Không tìm thấy học sinh trong danh sách con của bạn.");
  }

  return sendTinNhan({
    donViId: child.donViId,
    hocSinhId: input.hocSinhId,
    hocSinhTen: child.hoTen,
    lopHocId: null,
    noiDung: input.noiDung,
    nguoiGuiId: input.actorUserId,
    nguoiGuiLaPhuHuynh: true,
  });
}

async function sendTinNhan(input: {
  donViId: number;
  hocSinhId: number;
  hocSinhTen: string;
  lopHocId: number | null;
  noiDung: string;
  nguoiGuiId: number;
  nguoiGuiLaPhuHuynh: boolean;
}) {
  const noiDung = input.noiDung.trim();

  if (!noiDung) {
    throw new Error("Vui lòng nhập nội dung tin nhắn.");
  }

  const created = await createTinNhan({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    lopHocId: input.lopHocId,
    nguoiGuiId: input.nguoiGuiId,
    nguoiGuiLaPhuHuynh: input.nguoiGuiLaPhuHuynh,
    noiDung,
  });

  if (!created) {
    throw new Error("Không thể gửi tin nhắn.");
  }

  await notifyOtherSide({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    hocSinhTen: input.hocSinhTen,
    senderId: input.nguoiGuiId,
    senderIsGuardian: input.nguoiGuiLaPhuHuynh,
  });

  return created;
}
