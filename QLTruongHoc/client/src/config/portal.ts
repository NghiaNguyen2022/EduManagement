export type PortalRoleSlug =
      "parent" | "giao-vien" | "hoc-vu" | "ke-toan" | "tuyen-sinh" | "he-thong";

export type PortalRoleDefinition = {
      slug: PortalRoleSlug;
      title: string;
      subtitle: string;
      summary: string;
      highlight: string;
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
            highlight: "Tập trung vào học sinh, lịch học, thông báo và trao đổi.",
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
            slug: "giao-vien",
            title: "Cổng giáo viên",
            subtitle: "Quản lý lớp dạy, báo giảng, điểm danh và theo dõi học sinh.",
            summary: "Màn hình làm việc nhanh cho giáo viên.",
            highlight: "Ưu tiên lịch dạy, lớp phụ trách, điểm danh và ghi nhận buổi dạy.",
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
                        value: "Theo phân công",
                        note: "Danh sách lớp chủ nhiệm và lớp hỗ trợ",
                        icon: "🏫",
                        tone: "primary",
                  },
                  {
                        title: "Buổi cần điểm danh",
                        value: "Hôm nay",
                        note: "Nhấn vào để mở màn hình điểm danh",
                        icon: "✅",
                        tone: "success",
                  },
                  {
                        title: "Báo giảng chờ nhập",
                        value: "Trong ngày",
                        note: "Dùng cho ghi nhận nội dung dạy và phản hồi",
                        icon: "📝",
                        tone: "warning",
                  },
                  {
                        title: "Trao đổi cần xử lý",
                        value: "Mới nhất",
                        note: "Các ghi chú với phụ huynh hoặc học vụ",
                        icon: "💬",
                        tone: "info",
                  },
            ],
            nextSteps: [
                  {
                        title: "Mở lớp phụ trách",
                        detail: "Đưa giáo viên vào đúng lớp để xem sĩ số và thành phần học sinh.",
                  },
                  {
                        title: "Chấm điểm danh",
                        detail: "Portal nên đi thẳng tới luồng làm việc trong buổi dạy hiện tại.",
                  },
                  {
                        title: "Ghi báo giảng",
                        detail: "Sau buổi học, ghi nhanh nội dung và kết quả để học vụ theo dõi.",
                  },
            ],
      },
      {
            slug: "hoc-vu",
            title: "Cổng học vụ",
            subtitle: "Quản lý lớp học, lịch học, xếp lớp và theo dõi tiến độ đào tạo.",
            summary: "Màn hình điều phối nghiệp vụ học vụ.",
            highlight: "Tập trung vào lớp học, chương trình, lịch học và điều phối vận hành.",
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
                        value: "Nhiều lớp",
                        note: "Cần theo dõi sĩ số và tiến độ học",
                        icon: "🏫",
                        tone: "primary",
                  },
                  {
                        title: "Lịch học cần điều chỉnh",
                        value: "Tuần này",
                        note: "Thay đổi phòng, ca hoặc giáo viên phụ trách",
                        icon: "📅",
                        tone: "warning",
                  },
                  {
                        title: "Học sinh cần hỗ trợ",
                        value: "Theo lớp",
                        note: "Liên quan xếp lớp, chuyển lớp hoặc theo dõi tiến độ",
                        icon: "🎒",
                        tone: "info",
                  },
                  {
                        title: "Tác vụ ưu tiên",
                        value: "Hôm nay",
                        note: "Các đầu việc cần xử lý ngay trong ca làm việc",
                        icon: "✅",
                        tone: "success",
                  },
            ],
            nextSteps: [
                  {
                        title: "Xem lớp và sĩ số",
                        detail: "Nơi học vụ cần nhìn nhanh lớp nào đang thiếu/đủ học sinh.",
                  },
                  {
                        title: "Điều chỉnh thời khóa biểu",
                        detail: "Portal nên dẫn vào lịch học để xử lý thay đổi trong ngày.",
                  },
                  {
                        title: "Theo dõi thông báo",
                        detail: "Tập trung vào thông báo nội bộ và luồng điều phối nghiệp vụ.",
                  },
            ],
      },
      {
            slug: "ke-toan",
            title: "Cổng kế toán",
            subtitle: "Theo dõi kỳ thu, công nợ, phiếu thu và báo cáo tài chính.",
            summary: "Màn hình tổng quan cho nghiệp vụ tài chính.",
            highlight: "Ưu tiên kỳ thu, công nợ, phiếu thu và báo cáo tổng hợp.",
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
            ],
            stats: [
                  {
                        title: "Kỳ thu đang mở",
                        value: "Hiện tại",
                        note: "Dùng để theo dõi khoản phải thu",
                        icon: "💳",
                        tone: "primary",
                  },
                  {
                        title: "Công nợ cần xử lý",
                        value: "Theo dõi",
                        note: "Mục tiêu là vào việc nhanh ngay khi mở portal",
                        icon: "📋",
                        tone: "warning",
                  },
                  {
                        title: "Phiếu thu gần nhất",
                        value: "Trong ngày",
                        note: "Giúp kiểm tra giao dịch phát sinh",
                        icon: "🧾",
                        tone: "success",
                  },
                  {
                        title: "Báo cáo chốt ngày",
                        value: "Tổng hợp",
                        note: "Phục vụ đối soát nhanh trong ca làm việc",
                        icon: "📊",
                        tone: "info",
                  },
            ],
            nextSteps: [
                  {
                        title: "Mở kỳ thu",
                        detail: "Portal kế toán nên dẫn tới những kỳ đang cần thao tác ngay.",
                  },
                  {
                        title: "Xem công nợ theo lớp",
                        detail: "Cần một lối vào ngắn để rà soát công nợ học viên.",
                  },
                  {
                        title: "Xuất báo cáo",
                        detail: "Đây là nơi phù hợp để thêm báo cáo tổng hợp sau này.",
                  },
            ],
      },
      {
            slug: "tuyen-sinh",
            title: "Cổng tuyển sinh",
            subtitle: "Theo dõi lead, hồ sơ đăng ký và chăm sóc khách hàng tiềm năng.",
            summary: "Màn hình làm việc nhanh cho tuyển sinh.",
            highlight: "Ưu tiên lead, hồ sơ đăng ký và lịch chăm sóc trong ngày.",
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
                        title: "Lead mới",
                        value: "Trong ngày",
                        note: "Những khách hàng tiềm năng cần gọi lại",
                        icon: "📞",
                        tone: "primary",
                  },
                  {
                        title: "Hồ sơ chờ xử lý",
                        value: "Ưu tiên",
                        note: "Cần bổ sung giấy tờ hoặc xác nhận",
                        icon: "📋",
                        tone: "warning",
                  },
                  {
                        title: "Lịch hẹn tư vấn",
                        value: "Hôm nay",
                        note: "Điểm vào nhanh cho tác vụ gọi điện và hẹn gặp",
                        icon: "📅",
                        tone: "success",
                  },
                  {
                        title: "Tỷ lệ chuyển đổi",
                        value: "Theo dõi",
                        note: "Portal giúp tập trung vào hoạt động bán hàng/tiếp nhận",
                        icon: "📈",
                        tone: "info",
                  },
            ],
            nextSteps: [
                  {
                        title: "Mở danh sách lead",
                        detail: "Portal phải cho vào được ngay màn hình xử lý khách hàng tiềm năng.",
                  },
                  {
                        title: "Theo dõi hồ sơ",
                        detail: "Từ portal có thể chuyển sang hồ sơ và học sinh liên quan.",
                  },
                  {
                        title: "Nhắc việc chăm sóc",
                        detail: "Giúp đội tuyển sinh nhìn nhanh việc cần gọi lại/hẹn gặp.",
                  },
            ],
      },
      {
            slug: "he-thong",
            title: "Cổng quản trị hệ thống",
            subtitle: "Điều phối đơn vị, người dùng, vai trò và nhật ký hệ thống.",
            summary: "Màn hình tổng quan cho quản trị nền tảng.",
            highlight: "Ưu tiên đơn vị, người dùng, phân quyền và audit log.",
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

      if (input.slug === "ke-toan") {
            return isSystem
                  ? {
                          title: "Kế toán tổng hợp toàn hệ thống",
                          details: [
                                "Xem gộp khoản thu, kỳ thu, công nợ và báo cáo của các đơn vị.",
                                "Không lập kỳ thu, phiếu thu hoặc điều chỉnh tại đơn vị hệ thống.",
                                "Muốn thao tác nghiệp vụ phải chuyển sang đúng trường/trung tâm.",
                          ],
                    }
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
