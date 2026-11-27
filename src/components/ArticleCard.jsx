import { useState } from "react";
import { categoryStyle } from "../categories";

const BREAKING_WINDOW_MS = 6 * 60 * 60 * 1000;

export const isBreaking = (publishedAt) => {
  const time = new Date(publishedAt || 0).getTime();
  return Date.now() - time < BREAKING_WINDOW_MS && time <= Date.now() + 60 * 1000;
};

export const timeAgo = (value) => {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "";
  const minutes = Math.round((Date.now() - time) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const safeHref = (url) => (/^https?:\/\//i.test(url || "") ? url : undefined);

function PlaceholderIcon({ className = "h-8 w-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-5-5-8 8" />
    </svg>
  );
}

/** Shows the article image, or a tidy placeholder if there is none or it fails to load. */
export function ArticleImage({ src, category, className = "" }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed && safeHref(src);
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${categoryStyle(category)} ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <PlaceholderIcon />
      )}
    </div>
  );
}

export function Badge({ tone = "red", children }) {
  const tones = {
    red: "bg-red-600 text-white",
    brand: "bg-brand text-white",
  };
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function ArticleCard({ article, isNew = false, compact = false }) {
  const href = safeHref(article.url);
  const breaking = isBreaking(article.publishedAt);

  return (
    <article
      className={`rounded-2xl border bg-white ${
        isNew ? "border-brand ring-1 ring-brand/30" : "border-gray-200"
      } ${compact ? "p-4" : "p-5"}`}
    >
      <div
        className={`flex flex-col-reverse gap-4 ${
          compact ? "" : "sm:flex-row-reverse sm:items-start sm:gap-5"
        }`}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-600">
            {breaking && <Badge>Breaking</Badge>}
            {isNew && <Badge tone="brand">New</Badge>}
            <span className="font-semibold text-slate-800">
              {article.source?.name || "Unknown source"}
            </span>
            {article.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <time
                  dateTime={article.publishedAt}
                  title={new Date(article.publishedAt).toLocaleString()}
                >
                  {timeAgo(article.publishedAt)}
                </time>
              </>
            )}
            {article.category && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${categoryStyle(article.category)}`}
              >
                {article.category}
              </span>
            )}
          </div>
          <h3
            className={`font-serif font-semibold leading-tight tracking-tight text-slate-900 ${
              compact ? "text-[18px]" : "text-[21px]"
            }`}
          >
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {article.title}
              </a>
            ) : (
              article.title
            )}
          </h3>
          {article.description && !compact && (
            <p className="line-clamp-2 text-[15px] leading-normal text-gray-700">
              {article.description}
            </p>
          )}
        </div>
        <ArticleImage
          src={article.imageUrl}
          category={article.category}
          className={compact ? "h-36 w-full" : "h-36 w-full sm:h-24 sm:w-32"}
        />
      </div>
    </article>
  );
}
