export const workApps = [
  {
    slug: "nhat-ky-hien-truong",
    code: "F01",
    title: "Nhật ký hiện trường",
    titleEn: "Field journal",
    audience: "Giám sát · Đội thi công",
    audienceEn: "Supervisors · Field teams",
    description:
      "Từ ảnh và ghi chú đến nhật ký rõ ràng, báo cáo ngày có nguồn và việc cần xử lý.",
    descriptionEn:
      "Turn photos and notes into traceable daily reports and follow-up work.",
    steps: ["Chọn công trình", "Chụp ảnh, ghi chú", "Kiểm tra và gửi"],
    result: "Nhật ký theo công trình, báo cáo ngày và danh sách vướng mắc.",
    scope:
      "Bản demo ghép ghi chú theo mẫu. Không suy diễn tiến độ hoặc khối lượng từ ảnh.",
    locationLabel: "Công trình",
    locations: ["Công trình Minh An — dữ liệu mẫu", "Khu nhà B — dữ liệu mẫu"],
    itemLabel: "Hạng mục",
    items: ["Hoàn thiện tầng 2", "Điện và chiếu sáng", "Cấp thoát nước"],
    sample:
      "Đã kiểm tra khu vực tầng 2. Còn thiếu vật tư ở hạng mục chiếu sáng, cần đội phụ trách xác nhận lịch giao.",
    checklist: [] as string[],
    color: "blue",
  },
  {
    slug: "bao-hong-thiet-bi",
    code: "F03",
    title: "Báo hỏng thiết bị",
    titleEn: "Equipment incidents",
    audience: "Vận hành · Bảo trì · IT",
    audienceEn: "Operations · Maintenance · IT",
    description:
      "Xác định thiết bị, ghi nhận triệu chứng và theo dõi sự cố đến khi người báo xác nhận.",
    descriptionEn:
      "Identify equipment, capture symptoms and track incidents through confirmation.",
    steps: ["Chọn thiết bị", "Ghi nhận triệu chứng", "Theo dõi xử lý"],
    result: "Phiếu sự cố có người tiếp nhận, trạng thái và lịch sử xử lý.",
    scope:
      "Demo dùng danh mục thiết bị mẫu thay cho quét QR. Không chẩn đoán hay hướng dẫn sửa chữa tự động.",
    locationLabel: "Địa điểm",
    locations: ["Trường Minh An — dữ liệu mẫu", "Lưu xá khu B — dữ liệu mẫu"],
    itemLabel: "Thiết bị",
    items: [
      "AC-001 · Điều hòa phòng 201",
      "PJ-002 · Máy chiếu phòng 102",
      "WT-003 · Bơm nước khu B",
    ],
    sample:
      "Điều hòa phòng 201 bật nhưng không làm mát. Đã ghi nhận để bộ phận bảo trì kiểm tra.",
    checklist: [] as string[],
    color: "amber",
  },
  {
    slug: "kiem-tra-trung-bay",
    code: "F02",
    title: "Kiểm tra trưng bày",
    titleEn: "Display checks",
    audience: "Sales · Giám sát bán hàng",
    audienceEn: "Sales · Retail supervisors",
    description:
      "Ghi nhận lần ghé, ảnh kệ và checklist để biết điểm nào cần chỉnh, ai cần theo dõi.",
    descriptionEn:
      "Capture visits, shelf photos and checklists to make follow-up clear.",
    steps: ["Chọn điểm bán", "Chụp ảnh, kiểm tra", "Gửi lần ghé"],
    result: "Lịch sử lần ghé và checklist do nhân viên trực tiếp xác nhận.",
    scope:
      "Demo không nhận diện hay đếm SKU. Chỉ tổng hợp những mục người dùng đã đánh dấu.",
    locationLabel: "Điểm bán",
    locations: [
      "Cửa hàng An Phú — dữ liệu mẫu",
      "Cửa hàng Bình Minh — dữ liệu mẫu",
    ],
    itemLabel: "Khu vực",
    items: ["Kệ chính", "Quầy khuyến mãi", "Khu vực thanh toán"],
    sample:
      "Kệ chính đã được sắp lại. Cần bổ sung nhãn giá và kiểm tra lại vào lần ghé tiếp theo.",
    checklist: [
      "Đúng vị trí trưng bày",
      "Nhãn giá đầy đủ",
      "Kệ sạch và gọn",
      "Vật phẩm chương trình đầy đủ",
    ],
    color: "slate",
  },
] as const;

export type WorkApp = (typeof workApps)[number];
export const getWorkApp = (slug: string) =>
  workApps.find((app) => app.slug === slug);
