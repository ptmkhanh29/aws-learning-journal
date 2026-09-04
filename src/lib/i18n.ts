export const locales = ["en", "vi"] as const;

export type Locale = (typeof locales)[number];
export type LocalizedText = Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function text(value: LocalizedText, locale: Locale) {
  return value[locale];
}

export const dictionary = {
  en: {
    siteName: "Khanh Phan",
    tagline: "Engineering notes, experiments & builds.",
    nav: { journal: "Journal", notes: "Notes", labs: "Labs", aws: "AWS", practice: "Practice", about: "About" },
    search: "Search",
    theme: "Switch theme",
    menu: "Open menu",
    close: "Close",
    authEntry: "Log in / Sign up",
    profile: "Profile",
    progress: "Practice progress",
    saved: "Saved questions",
    wrong: "Wrong answers",
    settings: "Settings",
    signout: "Sign out",
    read: "Read entry",
    browse: "Browse all",
    footerLine: "Notes on what I learn, build, break, and eventually understand.",
    noResults: "No notes match that search yet.",
  },
  vi: {
    siteName: "Khanh Phan",
    tagline: "Ghi chép kỹ thuật, thử nghiệm & dự án.",
    nav: { journal: "Nhật ký", notes: "Ghi chú", labs: "Thực hành", aws: "AWS", practice: "Ôn tập", about: "Giới thiệu" },
    search: "Tìm kiếm",
    theme: "Đổi giao diện",
    menu: "Mở menu",
    close: "Đóng",
    authEntry: "Đăng nhập / Đăng ký",
    profile: "Hồ sơ",
    progress: "Tiến độ ôn tập",
    saved: "Câu hỏi đã lưu",
    wrong: "Câu trả lời sai",
    settings: "Cài đặt",
    signout: "Đăng xuất",
    read: "Đọc bài",
    browse: "Xem tất cả",
    footerLine: "Ghi lại những gì mình học, xây dựng, làm sai và hiểu lại cho đúng.",
    noResults: "Chưa có ghi chú nào khớp với từ khóa.",
  },
} as const;

export function pathForLocale(pathname: string, locale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${locale}`;
  if (isLocale(parts[0])) parts[0] = locale;
  else parts.unshift(locale);
  return `/${parts.join("/")}`;
}
