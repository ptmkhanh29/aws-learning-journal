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
    siteName: "AWS Learning Journal",
    nav: { journal: "Journal", notes: "Notes", labs: "Labs", aws: "AWS", practice: "Practice", about: "About" },
    search: "Search",
    theme: "Switch theme",
    menu: "Open menu",
    close: "Close",
    login: "Log in",
    signup: "Sign up",
    profile: "Profile",
    progress: "Practice progress",
    saved: "Saved questions",
    wrong: "Wrong answers",
    settings: "Settings",
    signout: "Sign out",
    read: "Read entry",
    browse: "Browse all",
    footerLine: "Learning AWS, writing down what I misunderstood, and correcting it as I go.",
    noResults: "No notes match that search yet.",
  },
  vi: {
    siteName: "Nhật ký học AWS",
    nav: { journal: "Nhật ký", notes: "Ghi chú", labs: "Thực hành", aws: "AWS", practice: "Ôn tập", about: "Giới thiệu" },
    search: "Tìm kiếm",
    theme: "Đổi giao diện",
    menu: "Mở menu",
    close: "Đóng",
    login: "Đăng nhập",
    signup: "Tạo tài khoản",
    profile: "Hồ sơ",
    progress: "Tiến độ ôn tập",
    saved: "Câu hỏi đã lưu",
    wrong: "Câu trả lời sai",
    settings: "Cài đặt",
    signout: "Đăng xuất",
    read: "Đọc bài",
    browse: "Xem tất cả",
    footerLine: "Học AWS, ghi lại những gì mình hiểu sai rồi sửa dần.",
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
