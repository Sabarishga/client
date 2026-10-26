export const NEWS_CATEGORIES = [
  "general",
  "business",
  "entertainment",
  "health",
  "science",
  "sports",
  "technology",
];

export const CATEGORY_STYLES = {
  general: "bg-slate-100 text-slate-700",
  business: "bg-emerald-100 text-emerald-800",
  entertainment: "bg-pink-100 text-pink-800",
  health: "bg-red-100 text-red-800",
  science: "bg-indigo-100 text-indigo-800",
  sports: "bg-amber-100 text-amber-800",
  technology: "bg-sky-100 text-sky-800",
};

export const categoryStyle = (category) =>
  CATEGORY_STYLES[String(category || "").toLowerCase()] ||
  CATEGORY_STYLES.general;
