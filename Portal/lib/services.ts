import type { Locale } from "./i18n/config";

export type Service = {
  title: string;
  description: string;
  titleEn: string;
  descriptionEn: string;
};

export const services: Service[] = [
  {
    title: "Tư vấn chuyển đổi số quy trình phòng ban",
    description:
      "Rà soát, chuẩn hoá quy trình vận hành, dữ liệu và công cụ quản lý theo từng phòng ban.",
    titleEn: "Departmental digital transformation consulting",
    descriptionEn:
      "Reviewing and standardizing operating processes, data, and management tools department by department.",
  },
  {
    title: "Tư vấn hệ thống & quy trình quản lý doanh nghiệp",
    description:
      "Thiết kế quy trình nghiệp vụ, kiểm soát vận hành phù hợp với thực tế của doanh nghiệp.",
    titleEn: "Business systems & management process consulting",
    descriptionEn:
      "Designing business workflows and operational controls suited to the reality of your business.",
  },
  {
    title: "Đào tạo Data, Power BI, ERP",
    description:
      "Xây dựng năng lực nội bộ về dữ liệu, báo cáo quản trị và vận hành hệ thống ERP.",
    titleEn: "Data, Power BI, ERP training",
    descriptionEn:
      "Building in-house capability in data, management reporting, and running ERP systems.",
  },
  {
    title: "Đào tạo quy trình phát triển phần mềm cho sinh viên",
    description:
      "Hướng dẫn quy trình làm sản phẩm phần mềm thực tế, từ ý tưởng đến vận hành.",
    titleEn: "Software development process training for students",
    descriptionEn:
      "Guiding the real-world software product process, from idea through to operation.",
  },
  {
    title: "Xây dựng ứng dụng & web app theo yêu cầu",
    description:
      "Phát triển ứng dụng nhỏ, web app phục vụ vận hành — kể cả bằng phương pháp \"vibe coding\" cùng AI.",
    titleEn: "Custom app & web app development",
    descriptionEn:
      "Building small apps and web apps for real operations — including AI-assisted \"vibe coding\".",
  },
  {
    title: "Tư vấn ứng dụng AI vào công việc",
    description:
      "Ứng dụng AI trong công việc văn phòng, hỗ trợ kiểm thử phần mềm và phát triển sản phẩm.",
    titleEn: "AI adoption consulting",
    descriptionEn:
      "Applying AI to office work, supporting software testing and product development.",
  },
];

export function resolveService(service: Service, locale: Locale) {
  return {
    title: locale === "en" ? service.titleEn : service.title,
    description: locale === "en" ? service.descriptionEn : service.description,
  };
}
