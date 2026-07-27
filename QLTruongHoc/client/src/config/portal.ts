export type PortalRoleSlug =
      "parent" | "quan-ly-don-vi" | "giao-vien" | "hoc-vu" | "ke-toan" | "tuyen-sinh" | "he-thong";

export type PortalRoleDefinition = {
      slug: PortalRoleSlug;
      title: string;
      subtitle: string;
      summary: string;
      featuredActions?: Array<{
            label: string;
            description: string;
            to: string;
      }>;
      notices?: Array<{
            title: string;
            detail: string;
      }>;
      quickLinks: Array<{
            label: string;
            description: string;
            to: string;
      }>;
      stats: Array<{
            title: string;
            value: string;
            note: string;
            icon: string;
            tone: "primary" | "secondary" | "success" | "warning" | "info";
      }>;
      nextSteps: Array<{
            title: string;
            detail: string;
      }>;
};

export const portalRoleOrder: Array<{
      role: string;
      slug: PortalRoleSlug;
}> = [
            { role: "phu_huynh", slug: "parent" },
            { role: "quan_ly_don_vi", slug: "quan-ly-don-vi" },
            { role: "giao_vien", slug: "giao-vien" },
            { role: "hoc_vu", slug: "hoc-vu" },
            { role: "ke_toan", slug: "ke-toan" },
            { role: "tu_van", slug: "tuyen-sinh" },
            { role: "tuyen_sinh", slug: "tuyen-sinh" },
            { role: "quan_tri_he_thong", slug: "he-thong" },
      ];

export const portalRoles: PortalRoleDefinition[] = [
      {
            slug: "parent",
            title: "Cổng phụ huynh",
            subtitle: "Theo dõi học tập, lịch học và trao đổi với nhà trường.",
            summary: "Màn hình tổng quan cho phụ huynh/người giám hộ.",
            featuredActions: [
                  {
                        label: "Xem hồ sơ con",
                        description: "Mở thông tin, lớp hiện tại và lịch học của từng con.",
                        to: "/portal/parent",
                  },
                  {
                        label: "Xem lịch học sắp tới",
                        description: "Tập trung vào các buổi học trong 2 tuần tới.",
                        to: "/portal/parent",
                  },
                  {
                        label: "Đọc thông báo mới",
                        description: "Ưu tiên các cập nhật quan trọng từ nhà trường.",
                        to: "/notifications",
                  },
                  {
                        label: "Xem trao đổi với giáo viên",
                        description: "Trao đổi gần đây của từng con đã hiện ngay trong trang này.",
                        to: "/portal/parent",
                  },
            ],
            notices: [
                  {
                        title: "Đã xem được ngay trong trang này",
                        detail:
                              "Học phí, trao đổi gần đây và lịch học của từng con đã hiện ngay trong Portal, nhóm theo từng đơn vị con đang học.",
                  },
                  {
                        title: "Thông báo dùng chung với đơn vị",
                        detail:
                              "Trang Thông báo nội bộ đã mở cho phụ huynh xem/xác nhận đã đọc; chưa lọc riêng theo đúng lớp/con (I05 còn để sau).",
                  },
                  {
                        title: "Chưa có ở bản này",
                        detail: "Chuyên cần (điểm danh) và điểm số/kết quả học tập — để bước sau khi có mô hình dữ liệu phù hợp.",
                  },
            ],
            quickLinks: [
                  {
                        label: "Hồ sơ con",
                        description: "Xem thông tin học sinh và các lớp của con trong portal.",
                        to: "/portal/parent",
                  },
                  {
                        label: "Lịch học",
                        description: "Xem lịch học được tổng hợp cho từng con.",
                        to: "/portal/parent",
                  },
                  {
                        label: "Thông báo",
                        description: "Xem thông báo nội bộ hoặc thông báo riêng.",
                        to: "/notifications",
                  },
                  {
                        label: "Trao đổi phụ huynh",
                        description: "Xem trao đổi gần đây với giáo viên/học vụ theo từng con.",
                        to: "/portal/parent",
                  },
            ],
            stats: [
                  {
                        title: "Học sinh đang theo dõi",
                        value: "1 - 3",
                        note: "Tùy số con đang học trong đơn vị",
                        icon: "🎒",
                        tone: "primary",
                  },
                  {
                        title: "Thông báo cần đọc",
                        value: "Mới nhất",
                        note: "Hiển thị nhanh các cập nhật từ trường",
                        icon: "🔔",
                        tone: "warning",
                  },
                  {
                        title: "Buổi học sắp tới",
                        value: "Hôm nay",
                        note: "Nhắc phụ huynh chuẩn bị cho con đi học",
                        icon: "📅",
                        tone: "success",
                  },
                  {
                        title: "Trao đổi gần nhất",
                        value: "Cập nhật",
                        note: "Các ghi chú từ giáo viên/học vụ",
                        icon: "💬",
                        tone: "info",
                  },
            ],
            nextSteps: [
                  {
                        title: "Xem lịch học hôm nay",
                        detail: "Gắn với học sinh để biết ca học, phòng học và tình trạng điểm danh.",
                  },
                  {
                        title: "Đọc thông báo mới",
                        detail: "Phụ huynh thường cần một nơi riêng để xem các tin quan trọng.",
                  },
                  {
                        title: "Mở luồng trao đổi",
                        detail: "Từ portal này có thể chuyển sang luồng trao đổi với giáo viên/học vụ.",
                  },
            ],
      },
      {
            slug: "quan-ly-don-vi",
            title: "Cổng quản lý đơn vị",
            subtitle: "Tổng quan toàn đơn vị: đào tạo, tuyển sinh, tài chính và việc cần xử lý.",
            summary: "Màn hình điều phối cho người phụ trách đơn vị.",
            quickLinks: [
                  {
                        label: "Học sinh · Học viên",
                        description: "Xem hồ sơ và tình trạng học tập trong đơn vị.",
                        to: "/students",
                  },
                  {
                        label: "Lớp học",
                        description: "Theo dõi lớp đang hoạt động và sĩ số.",
                        to: "/classes",
                  },
                  {
                        label: "Tuyển sinh",
                        description: "Xem lead mới và tỷ lệ chuyển đổi trong tháng.",
                        to: "/admissions",
                  },
                  {
                        label: "Báo cáo tài chính",
                        description: "Doanh thu, công nợ và thu ròng trong khoảng ngày.",
                        to: "/finance/bao-cao",
                  },
                  {
                        label: "Chi phí",
                        description: "Duyệt đề xuất chi và theo dõi chi phí vận hành.",
                        to: "/finance/chi-phi",
                  },
                  {
                        label: "Người dùng",
                        description: "Quản lý tài khoản nhân sự trong đơn vị.",
                        to: "/users",
                  },
                  {
                        label: "Thông báo nội bộ",
                        description: "Gửi thông báo tới nhân sự và phụ huynh trong đơn vị.",
                        to: "/notifications",
                  },
            ],
            stats: [
                  {
                        title: "Học viên đang học",
                        value: "—",
                        note: 'Đang có trạng thái "Đang học"',
                        icon: "🎒",
                        tone: "primary",
                  },
                  {
                        title: "Lớp đang hoạt động",
                        value: "—",
                        note: 'Đang có trạng thái "Đang học"',
                        icon: "🏫",
                        tone: "secondary",
                  },
                  {
                        title: "Công nợ hiện tại",
                        value: "—",
                        note: "Tổng khoản phải thu còn lại",
                        icon: "💳",
                        tone: "warning",
                  },
                  {
                        title: "Lead mới trong tháng",
                        value: "—",
                        note: "Tính từ đầu tháng tới hôm nay",
                        icon: "📈",
                        tone: "success",
                  },
            ],
            nextSteps: [
                  {
                        title: "Xử lý các việc đang chờ",
                        detail: "Rà soát khoản thu quá hạn, đơn xin phép và yêu cầu điều chỉnh đang chờ duyệt.",
                  },
                  {
                        title: "Theo dõi tuyển sinh",
                        detail: "Nắm số lead mới và tỷ lệ chuyển đổi để điều phối đội tư vấn.",
                  },
                  {
                        title: "Rà soát sĩ số lớp",
                        detail: "Phát hiện lớp gần đầy hoặc lớp thiếu học viên để điều chỉnh kế hoạch.",
                  },
            ],
      },
      {
            slug: "giao-vien",
            title: "Cổng giáo viên",
            subtitle: "Quản lý lớp dạy, báo giảng, điểm danh và theo dõi học sinh.",
            summary: "Màn hình làm việc nhanh cho giáo viên.",
            quickLinks: [
                  {
                        label: "Lớp học",
                        description: "Xem các lớp đang phụ trách và lớp liên quan.",
                        to: "/classes",
                  },
                  {
                        label: "Lịch học",
                        description: "Theo dõi lịch giảng dạy trong ngày/tuần.",
                        to: "/schedule",
                  },
                  {
                        label: "Điểm danh",
                        description: "Vào nhanh màn hình điểm danh theo buổi học.",
                        to: "/attendance",
                  },
                  {
                        label: "Trao đổi phụ huynh",
                        description: "Nhật ký trao đổi theo từng học sinh hoặc lớp.",
                        to: "/communications",
                  },
            ],
            stats: [
                  {
                        title: "Lớp đang dạy",
                        value: "—",
                        note: "Lớp chủ nhiệm và lớp hỗ trợ đang phụ trách",
                        icon: "🏫",
                        tone: "primary",
                  },
                  {
                        title: "Buổi dạy hôm nay",
                        value: "—",
                        note: "Số buổi cần điểm danh trong ngày",
                        icon: "✅",
                        tone: "success",
                  },
                  {
                        title: "Báo giảng chờ nhập",
                        value: "—",
                        note: "Buổi đã dạy trong 7 ngày qua chưa ghi báo giảng",
                        icon: "📝",
                        tone: "warning",
                  },
                  {
                        title: "Trao đổi trong tuần",
                        value: "—",
                        note: "Số lượt trao đổi đã ghi nhận trong 7 ngày qua",
                        icon: "💬",
                        tone: "info",
                  },
            ],
            nextSteps: [
                  {
                        title: "Mở lớp phụ trách",
                        detail: "Xem sĩ số và thành phần học sinh của từng lớp đang dạy.",
                  },
                  {
                        title: "Điểm danh buổi hôm nay",
                        detail: "Ghi nhận điểm danh ngay sau khi kết thúc buổi dạy.",
                  },
                  {
                        title: "Bổ sung báo giảng còn thiếu",
                        detail: "Ghi nội dung bài học và bài tập cho các buổi đã dạy nhưng chưa nhập.",
                  },
            ],
      },
      {
            slug: "hoc-vu",
            title: "Cổng học vụ",
            subtitle: "Quản lý lớp học, lịch học, xếp lớp và theo dõi tiến độ đào tạo.",
            summary: "Màn hình điều phối nghiệp vụ học vụ.",
            quickLinks: [
                  {
                        label: "Chương trình đào tạo",
                        description: "Mở danh sách chương trình và cấu trúc học tập.",
                        to: "/classes",
                  },
                  {
                        label: "Lớp học",
                        description: "Quản lý lớp đang chạy, sĩ số và phân công.",
                        to: "/classes",
                  },
                  {
                        label: "Lịch học",
                        description: "Điều phối lịch theo lớp, phòng và giáo viên.",
                        to: "/schedule",
                  },
                  {
                        label: "Thông báo nội bộ",
                        description: "Dùng cho cập nhật vận hành và nhắc việc.",
                        to: "/notifications",
                  },
                  {
                        label: "Đơn xin phép",
                        description: "Xem và xử lý các đơn xin nghỉ của học sinh.",
                        to: "/attendance/xin-phep",
                  },
            ],
            stats: [
                  {
                        title: "Lớp đang hoạt động",
                        value: "—",
                        note: "Cần theo dõi sĩ số và tiến độ học",
                        icon: "🏫",
                        tone: "primary",
                  },
                  {
                        title: "Buổi học nghỉ/hủy tuần này",
                        value: "—",
                        note: "Cần xếp bù hoặc báo lại cho học sinh/giáo viên",
                        icon: "📅",
                        tone: "warning",
                  },
                  {
                        title: "Học sinh đang bảo lưu",
                        value: "—",
                        note: "Cần theo dõi để hỗ trợ quay lại học hoặc kết thúc bảo lưu",
                        icon: "🎒",
                        tone: "info",
                  },
                  {
                        title: "Đơn xin phép chờ duyệt",
                        value: "—",
                        note: "Đơn xin nghỉ của học sinh đang chờ xử lý",
                        icon: "✅",
                        tone: "success",
                  },
            ],
            nextSteps: [
                  {
                        title: "Xem lớp và sĩ số",
                        detail: "Nhìn nhanh lớp nào đang thiếu/đủ học sinh để điều phối.",
                  },
                  {
                        title: "Xếp bù buổi nghỉ/hủy",
                        detail: "Sắp lịch bù và báo lại cho học sinh/giáo viên liên quan.",
                  },
                  {
                        title: "Duyệt đơn xin phép",
                        detail: "Xử lý các đơn xin nghỉ đang chờ duyệt trong ngày.",
                  },
            ],
      },
      {
            slug: "ke-toan",
            title: "Cổng kế toán",
            subtitle: "Theo dõi kỳ thu, công nợ, phiếu thu và báo cáo tài chính.",
            summary: "Màn hình tổng quan cho nghiệp vụ tài chính.",
            quickLinks: [
                  {
                        label: "Kỳ thu học phí",
                        description: "Quản lý các kỳ thu đang mở hoặc cần kiểm tra.",
                        to: "/finance",
                  },
                  {
                        label: "Công nợ học viên",
                        description: "Xem học viên/công nợ theo lớp hoặc theo kỳ.",
                        to: "/finance",
                  },
                  {
                        label: "Phiếu thu",
                        description: "Mở kỳ thu để xem lịch sử thu và các giao dịch phát sinh.",
                        to: "/finance",
                  },
                  {
                        label: "Báo cáo tài chính",
                        description: "Tổng hợp nhanh số thu và tình trạng công nợ.",
                        to: "/finance/bao-cao",
                  },
                  {
                        label: "Yêu cầu điều chỉnh",
                        description: "Theo dõi hoàn phí/chuyển phí/bảo lưu chờ duyệt.",
                        to: "/finance/dieu-chinh",
                  },
                  {
                        label: "Chi phí",
                        description: "Ghi nhận và theo dõi chi phí vận hành.",
                        to: "/finance/chi-phi",
                  },
            ],
            stats: [
                  {
                        title: "Kỳ thu đang mở",
                        value: "—",
                        note: "Tính đến hôm nay",
                        icon: "💳",
                        tone: "primary",
                  },
                  {
                        title: "Tổng công nợ hiện tại",
                        value: "—",
                        note: "Tính đến hôm nay",
                        icon: "📋",
                        tone: "warning",
                  },
                  {
                        title: "Đã thu trong tháng",
                        value: "—",
                        note: "Từ đầu tháng tới hôm nay",
                        icon: "🧾",
                        tone: "success",
                  },
                  {
                        title: "Thu ròng trong tháng",
                        value: "—",
                        note: "Đã trừ hoàn phí, từ đầu tháng tới hôm nay",
                        icon: "📊",
                        tone: "info",
                  },
            ],
            nextSteps: [
                  {
                        title: "Xử lý khoản thu quá hạn",
                        detail: "Rà soát khoản phải thu đã quá hạn thanh toán, nhắc thu hoặc liên hệ phụ huynh/học viên.",
                  },
                  {
                        title: "Duyệt yêu cầu điều chỉnh",
                        detail: "Xử lý các yêu cầu hoàn phí, chuyển phí hoặc bảo lưu đang chờ duyệt.",
                  },
                  {
                        title: "Đối chiếu trước khi chốt báo cáo",
                        detail: "Kiểm tra số thu và công nợ trong tháng trước khi tổng hợp báo cáo tài chính.",
                  },
            ],
      },
      {
            slug: "tuyen-sinh",
            title: "Cổng tuyển sinh",
            subtitle: "Theo dõi lead, hồ sơ đăng ký và chăm sóc khách hàng tiềm năng.",
            summary: "Màn hình làm việc nhanh cho tuyển sinh.",
            quickLinks: [
                  {
                        label: "Lead tuyển sinh",
                        description: "Mở danh sách khách hàng tiềm năng để xử lý tiếp.",
                        to: "/admissions",
                  },
                  {
                        label: "Hồ sơ đăng ký",
                        description: "Theo dõi hồ sơ đã tiếp nhận hoặc chờ bổ sung.",
                        to: "/admissions",
                  },
                  {
                        label: "Học sinh",
                        description: "Xem học sinh đã nhập học và liên kết phụ huynh.",
                        to: "/students",
                  },
                  {
                        label: "Thông báo nội bộ",
                        description: "Tận dụng để nhắc việc và cập nhật cho đội tuyển sinh.",
                        to: "/notifications",
                  },
            ],
            stats: [
                  {
                        title: "Lead mới trong tháng",
                        value: "—",
                        note: "Từ đầu tháng tới hôm nay",
                        icon: "📞",
                        tone: "primary",
                  },
                  {
                        title: "Lead đang chăm sóc",
                        value: "—",
                        note: "Chưa đăng ký, chưa dừng chăm sóc",
                        icon: "📋",
                        tone: "warning",
                  },
                  {
                        title: "Lịch hẹn tư vấn hôm nay",
                        value: "—",
                        note: "Cuộc hẹn cần gọi điện hoặc gặp trực tiếp",
                        icon: "📅",
                        tone: "success",
                  },
                  {
                        title: "Tỷ lệ chuyển đổi",
                        value: "—",
                        note: "Lead đã đăng ký / tổng lead đã tiếp nhận",
                        icon: "📈",
                        tone: "info",
                  },
            ],
            nextSteps: [
                  {
                        title: "Mở danh sách lead",
                        detail: "Ưu tiên xử lý lead mới và lead đang chăm sóc dở dang.",
                  },
                  {
                        title: "Theo dõi hồ sơ",
                        detail: "Chuyển lead đã xác nhận sang hồ sơ đăng ký và học sinh liên quan.",
                  },
                  {
                        title: "Nhắc lịch hẹn hôm nay",
                        detail: "Chuẩn bị trước nội dung cho các cuộc hẹn tư vấn trong ngày.",
                  },
            ],
      },
      {
            slug: "he-thong",
            title: "Cổng quản trị hệ thống",
            subtitle: "Điều phối đơn vị, người dùng, vai trò và nhật ký hệ thống.",
            summary: "Màn hình tổng quan cho quản trị nền tảng.",
            quickLinks: [
                  {
                        label: "Danh mục đơn vị",
                        description: "Quản lý trường, trung tâm và cấu trúc tổ chức.",
                        to: "/organizations",
                  },
                  {
                        label: "Người dùng",
                        description: "Quản lý tài khoản và gán vai trò theo đơn vị.",
                        to: "/users",
                  },
                  {
                        label: "Vai trò · Phân quyền",
                        description: "Xem và chỉnh quyền theo nghiệp vụ.",
                        to: "/roles",
                  },
                  {
                        label: "Nhật ký hệ thống",
                        description: "Tra cứu các thao tác quan trọng.",
                        to: "/audit-logs",
                  },
            ],
            stats: [
                  {
                        title: "Đơn vị đang hoạt động",
                        value: "Toàn hệ thống",
                        note: "Các cơ sở/trường/trung tâm đang mở",
                        icon: "🏢",
                        tone: "primary",
                  },
                  {
                        title: "Người dùng",
                        value: "Tập trung",
                        note: "Điểm vào quản trị tài khoản và phân quyền",
                        icon: "👥",
                        tone: "info",
                  },
                  {
                        title: "Nhật ký cần rà soát",
                        value: "Hôm nay",
                        note: "Audit log phục vụ kiểm tra thay đổi",
                        icon: "📜",
                        tone: "warning",
                  },
                  {
                        title: "Cấu hình hệ thống",
                        value: "Sắp có",
                        note: "Mục cấu hình đã có chỗ sẵn trong menu",
                        icon: "⚙️",
                        tone: "success",
                  },
            ],
            nextSteps: [
                  {
                        title: "Xem đơn vị",
                        detail: "Quản trị hệ thống nên có lối vào nhanh vào Danh mục đơn vị.",
                  },
                  {
                        title: "Quản lý quyền",
                        detail: "Dẫn thẳng sang màn hình vai trò/phân quyền để chỉnh sửa.",
                  },
                  {
                        title: "Tra audit log",
                        detail: "Nơi đầu tiên cần mở khi kiểm tra vấn đề vận hành.",
                  },
            ],
      },
];

/**
 * Kế toán tổng (đứng ở hệ thống) không thao tác được ở đơn vị con (xem
 * `getPortalContext`), nên "Định hướng portal" mặc định của kế toán (viết
 * cho người đứng tại 1 đơn vị, có thể tự "xử lý"/"duyệt") không đúng ở đây —
 * đổi thành các bước giám sát/tổng hợp thực sự làm được từ hệ thống.
 */
export function getPortalNextSteps(input: {
      slug: PortalRoleSlug;
      organizationLevel: string;
}) {
      const role = findPortalRole(input.slug);

      if (!role) return [];

      if (input.slug === "ke-toan" && input.organizationLevel === "he_thong") {
            return [
                  {
                        title: "Rà soát đơn vị có công nợ cao",
                        detail: "Dùng bảng kỳ thu theo đơn vị để phát hiện chi nhánh cần nhắc thu sớm.",
                  },
                  {
                        title: "Theo dõi yêu cầu chờ duyệt",
                        detail: "Nắm số lượng hoàn phí/chuyển phí/bảo lưu đang chờ, nhắc kế toán đơn vị xử lý đúng hạn.",
                  },
                  {
                        title: "Tổng hợp báo cáo toàn hệ thống",
                        detail: "Dùng số thu, công nợ và thu ròng gộp để lập báo cáo cuối kỳ cho ban điều hành.",
                  },
            ];
      }

      return role.nextSteps;
}

export function findPortalRole(slug: string) {
      return portalRoles.find((item) => item.slug === slug) ?? null;
}

export function getDefaultPortalSlug(roles: string[]) {
      for (const item of portalRoleOrder) {
            if (roles.includes(item.role)) {
                  return item.slug;
            }
      }

      return "he-thong" satisfies PortalRoleSlug;
}

export function getDefaultPortalPath(roles: string[]) {
      return `/portal/${getDefaultPortalSlug(roles)}`;
}

export function canAccessPortalRole(slug: PortalRoleSlug, roles: string[]) {
      return portalRoleOrder.some((item) => item.slug === slug && roles.includes(item.role));
}

export function getPortalContext(input: {
      slug: PortalRoleSlug;
      organizationLevel: string;
      educationType: string | null;
}) {
      const isSystem = input.organizationLevel === "he_thong";

      if (input.slug === "quan-ly-don-vi") {
            return isSystem
                  ? null
                  : {
                          title: "Quản lý đơn vị",
                          details: [
                                "Xem và điều phối toàn bộ đơn vị: đào tạo, tuyển sinh, tài chính, nhân sự.",
                                "Không giới hạn theo một mảng nghiệp vụ như các vai trò chuyên môn khác.",
                                "Chỉ trong phạm vi đơn vị đang đứng, không xem được đơn vị khác.",
                          ],
                    };
      }

      if (input.slug === "ke-toan") {
            // Kế toán tổng (đứng ở hệ thống) đã có báo cáo theo đơn vị và các thẻ
            // số liệu để tự nói lên phạm vi xem gộp — không cần thêm khối mô tả
            // scope riêng nữa. Kế toán tại đơn vị vẫn giữ khối này vì có thao tác
            // thực (lập/thu/điều chỉnh), cần nói rõ ranh giới trước khi bắt tay vào.
            return isSystem
                  ? null
                  : {
                          title: "Kế toán vận hành tại đơn vị",
                          details: [
                                "Lập khoản thu, kỳ thu và khoản phải thu cho học sinh.",
                                "Thu tiền, theo dõi công nợ, hoàn/chuyển/bảo lưu phí.",
                                "Báo cáo chỉ trong phạm vi đơn vị đang làm việc.",
                          ],
                    };
      }

      if (input.slug === "giao-vien" && input.educationType === "mam_non") {
            return {
                  title: "Giáo viên mầm non",
                  details: [
                        "Làm việc theo lớp được phân công: lịch, điểm danh và báo giảng.",
                        "Theo dõi xin phép/vắng học và ghi nhận nhận xét từng trẻ.",
                        "Hồ sơ sức khỏe, đón/trả và đánh giá phát triển đang là module chuyên biệt kế tiếp.",
                  ],
            };
      }

      if (input.slug === "giao-vien" && input.educationType === "ngoai_ngu") {
            return {
                  title: "Giáo viên trung tâm ngoại ngữ",
                  details: [
                        "Làm việc theo lớp được phân công: lịch dạy, điểm danh và báo giảng.",
                        "Theo dõi bài học, bài tập và trao đổi theo học viên/lớp.",
                        "Điểm kiểm tra và kỹ năng nghe/nói/đọc/viết đang là module chuyên biệt kế tiếp.",
                  ],
            };
      }

      if (input.slug === "hoc-vu") {
            return input.educationType === "mam_non"
                  ? {
                          title: "Học vụ mầm non",
                          details: [
                                "Quản lý lớp, giáo viên, lịch, xếp trẻ và tình trạng học.",
                                "Theo dõi điểm danh, đơn xin phép và trao đổi phụ huynh.",
                                "Điều phối hồ sơ sức khỏe và đón/trả sau khi module chuyên biệt hoàn thành.",
                          ],
                    }
                  : {
                          title: "Học vụ trung tâm",
                          details: [
                                "Quản lý chương trình, cấp độ, lớp, giáo viên và lịch phòng.",
                                "Xếp/chuyển lớp, theo dõi sĩ số, điểm danh và báo giảng.",
                                "Theo dõi tiến độ chương trình sau khi cấu trúc chương/bài hoàn thành.",
                          ],
                    };
      }

      if (input.slug === "tuyen-sinh") {
            return input.educationType === "ngoai_ngu"
                  ? {
                          title: "Tư vấn · tuyển sinh ngoại ngữ",
                          details: [
                                "Tiếp nhận lead, nhu cầu khóa học và lịch sử chăm sóc.",
                                "Chuyển đổi lead thành học viên/phụ huynh.",
                                "Kiểm tra đầu vào và gợi ý trình độ là module chuyên biệt kế tiếp.",
                          ],
                    }
                  : {
                          title: "Tư vấn · tuyển sinh tại đơn vị",
                          details: [
                                "Tiếp nhận lead, nhu cầu nhập học và lịch sử chăm sóc.",
                                "Xác nhận đăng ký, sinh mã học sinh và liên kết phụ huynh.",
                                "Theo dõi số lead mới và hồ sơ đã chuyển đổi.",
                          ],
                    };
      }

      return null;
}

/**
 * Quản trị hệ thống dùng Dashboard tổng hợp làm trang chính. Các portal
 * nghiệp vụ đã có dữ liệu theo vai trò nên được dùng làm landing tương ứng;
 * portal hệ thống vẫn có thể mở trực tiếp khi cần xem khung điều hướng.
 */
export function getDefaultLandingPath(roles: string[]) {
      if (roles.includes("quan_tri_he_thong")) {
            return "/dashboard";
      }

      return portalRoleOrder.some((item) => roles.includes(item.role))
            ? getDefaultPortalPath(roles)
            : "/dashboard";
}
