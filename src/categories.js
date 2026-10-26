export const NEWS_CATEGORIES = [
  "general",
  "business",
  "entertainment",
  "health",
  "science",
  "sports",
  "technology",
];

// Tailwind classes for each category's tag and thumbnail tint.
// The class names are written out in full so Tailwind can find them at build time.
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
