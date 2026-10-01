import { CONTACT_EMAIL, CONTACT_ZALO_PHONE_DISPLAY, CONTACT_ZALO_URL } from "./site-config";
import type { Locale } from "./i18n/config";

export type Channel = {
  code: string;
  title: string;
  description: string;
  descriptionEn: string;
  href: string;
};

export const channels: Channel[] = [
  {
    code: "Za",
    title: "Zalo",
    description: `Chat trực tiếp qua Zalo (${CONTACT_ZALO_PHONE_DISPLAY}) để được tư vấn nhanh.`,
    descriptionEn: `Chat directly on Zalo (${CONTACT_ZALO_PHONE_DISPLAY}) for a quick consultation.`,
    href: CONTACT_ZALO_URL,
  },
  {
    code: "@",
    title: "Email",
    description: `Gửi email tới ${CONTACT_EMAIL} để được hỗ trợ.`,
    descriptionEn: `Email ${CONTACT_EMAIL} for support.`,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    code: "YT",
    title: "YouTube",
    description: "Video hướng dẫn kỹ thuật, ERP, dữ liệu và giải pháp vận hành.",
    descriptionEn: "Technical how-to videos on ERP, data, and operating solutions.",
    href: "https://www.youtube.com/@Technical_Solution_ERP",
  },
  {
    code: "in",
    title: "LinkedIn",
    description: "Kết nối chuyên môn và theo dõi các chia sẻ về chuyển đổi số.",
    descriptionEn: "Professional networking and updates on digital transformation.",
    href: "https://www.linkedin.com/in/nghia-nguyen-790108139/",
  },
  {
    code: "f",
    title: "Facebook",
    description: "Kết nối và cập nhật các hoạt động, nội dung chia sẻ mới.",
    descriptionEn: "Connect and keep up with activity and new content.",
    href: "https://www.facebook.com/nghia.nguyennhuu.3",
  },
];

export function resolveChannel(channel: Channel, locale: Locale) {
  return {
    code: channel.code,
    title: channel.title,
    description: locale === "en" ? channel.descriptionEn : channel.description,
    href: channel.href,
  };
}
