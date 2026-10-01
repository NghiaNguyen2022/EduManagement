export function collectGuardianOrganizationIds(
  children: ReadonlyArray<{
    hocSinh: { donViId: number };
    lienKet: { nhanThongBao: boolean };
  }>,
) {
  return Array.from(
    new Set(
      children
        // Quan hệ phụ huynh–học sinh là chốt phạm vi. Không suy luận từ trạng
        // thái tổng thể của học sinh vì phụ huynh vẫn cần xem lịch sử sau khi
        // hoàn thành; quyền nhận được điều khiển rõ bằng `nhanThongBao`.
        .filter(({ lienKet }) => lienKet.nhanThongBao)
        .map(({ hocSinh }) => hocSinh.donViId),
    ),
  );
}
