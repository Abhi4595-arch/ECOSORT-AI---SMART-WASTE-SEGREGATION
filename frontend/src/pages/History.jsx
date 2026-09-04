import { useEffect, useState } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Leaf,
  Recycle,
  AlertTriangle,
  Search,
  ScanLine,
  ShieldCheck,
  Clock,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { apiJson } from "../utils/api";
import PageLoading from "../components/PageLoading";
import RetryState from "../components/RetryState";

const FILTERS = ["All", "Recyclable", "Organic", "Hazardous"];

const CATEGORY_CONFIG = {
  Recyclable: {
    icon: Recycle,
    color: "#3189d7",
    background: "#eaf4ff",
  },
  Organic: {
    icon: Leaf,
    color: "#14884b",
    background: "#edf9f0",
  },
  Hazardous: {
    icon: AlertTriangle,
    color: "#e87918",
    background: "#fff3e5",
  },
};

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const data = await apiJson("/history");

        if (!mounted) return;

        const historyItems = Array.isArray(data?.scans)
          ? data.scans
          : Array.isArray(data)
            ? data
            : [];

        setScans(historyItems);
      } catch (requestError) {
        if (!mounted) return;

        console.error(
          "History loading error:",
          requestError
        );

        setError(
          requestError?.message ||
            "Unable to load scan history right now."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [retryCount]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredScans = scans.filter((scan) => {
    const category = String(scan?.category || "").toLowerCase();
    const bin = String(scan?.recommended_bin || "").toLowerCase();
    const guidance = String(scan?.disposal_guidance || "").toLowerCase();
    const explanation = String(scan?.explanation || "").toLowerCase();

    const matchesSearch =
      !normalizedSearch ||
      category.includes(normalizedSearch) ||
      bin.includes(normalizedSearch) ||
      guidance.includes(normalizedSearch) ||
      explanation.includes(normalizedSearch);

    const matchesFilter =
      filter === "All" || scan?.category === filter;

    return matchesSearch && matchesFilter;
  });

  const highConfidenceCount = scans.filter(
    (scan) => !Boolean(scan?.review_required)
  ).length;

  const reviewCount = scans.filter(
    (scan) => Boolean(scan?.review_required)
  ).length;

  const categoryCounts = FILTERS.slice(1).reduce(
    (result, category) => {
      result[category] = scans.filter(
        (scan) => scan?.category === category
      ).length;

      return result;
    },
    {}
  );

  const hasActiveFilters =
    search.trim().length > 0 ||
    filter !== "All";

  const clearFilters = () => {
    setSearch("");
    setFilter("All");
  };

  return (
    <div className="eco-app-page min-h-screen bg-[#f5f7f9] text-[#111c2c]">
      <main
        className="mx-auto max-w-[1200px] px-4 py-7 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10"
        aria-labelledby="history-page-title"
      >
        {/* TITLE */}
        <section aria-labelledby="history-page-title">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9ead6] bg-[#effaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
            <Clock
              size={14}
              aria-hidden="true"
            />
            <span>Your activity</span>
          </div>

          <h1
            id="history-page-title"
            className="mt-5 text-[32px] font-black tracking-[-0.05em] sm:text-[38px] md:text-[48px]"
          >
            Scan History
          </h1>

          <p className="mt-3 max-w-[600px] text-[14px] leading-6 text-[#68788b]">
            Review your previous waste classifications,
            confidence levels, and disposal recommendations.
          </p>
        </section>

        {/* STATS */}
        <section
          className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4"
          aria-label="Scan history statistics"
        >
          <HistoryStat
            icon={ScanLine}
            label="Total Scans"
            value={scans.length}
            iconClass="bg-[#e3f7e1] text-[#2d9b4b]"
          />

          <HistoryStat
            icon={ShieldCheck}
            label="High Confidence"
            value={highConfidenceCount}
            iconClass="bg-[#e1efff] text-[#3189d7]"
          />

          <HistoryStat
            icon={AlertTriangle}
            label="Needs Review"
            value={reviewCount}
            iconClass="bg-[#fff0df] text-[#e87918]"
          />
        </section>

        {/* SEARCH + FILTER */}
        <section
          className="mt-5 rounded-[18px] border border-[#e1e6e9] bg-white p-4 shadow-sm sm:mt-7"
          aria-label="Search and filter scan history"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b98a4]"
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search category, bin, or guidance..."
                aria-label="Search scan history"
                className="w-full rounded-xl border border-[#e0e6e9] bg-[#f8fafb] py-3 pl-11 pr-11 text-[12px] outline-none transition focus:border-[#68b985] focus:bg-white focus:ring-2 focus:ring-[#68b985]/20"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#758291] transition hover:bg-[#edf4ef] hover:text-[#087443] focus:outline-none focus:ring-2 focus:ring-[#68b985]/40"
                >
                  <X
                    size={14}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by waste category"
            >
              {FILTERS.map((item) => {
                const isActive = filter === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={isActive}
                    className={`min-h-10 rounded-xl px-4 py-2.5 text-[11px] font-bold transition focus:outline-none focus:ring-2 focus:ring-[#68b985]/40 ${
                      isActive
                        ? "bg-[#087443] text-white shadow-md shadow-[#087443]/20"
                        : "border border-[#e1e6e9] bg-white text-[#657281] hover:bg-[#f3f8f5]"
                    }`}
                  >
                    {item}

                    {item !== "All" && (
                      <span
                        className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[8px] ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-[#f0f4f2] text-[#77848e]"
                        }`}
                      >
                        {categoryCounts[item] || 0}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && !loading && !error && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf0f2] pt-3">
              <p className="text-[10px] text-[#7b8793]">
                Showing{" "}
                <strong className="text-[#44515e]">
                  {filteredScans.length}
                </strong>{" "}
                of{" "}
                <strong className="text-[#44515e]">
                  {scans.length}
                </strong>{" "}
                scans
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-[10px] font-bold text-[#087443] transition hover:bg-[#edf8f1] focus:outline-none focus:ring-2 focus:ring-[#68b985]/40"
              >
                <X
                  size={13}
                  aria-hidden="true"
                />
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* HISTORY */}
        <section
          className="mt-5"
          aria-label="Previous waste scans"
          aria-live="polite"
        >
          {loading ? (
            <PageLoading label="Loading scan history…" />
          ) : error ? (
            <RetryState
              title="Couldn’t load scan history"
              message={error}
              onRetry={() =>
                setRetryCount(
                  (count) => count + 1
                )
              }
            />
          ) : filteredScans.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClear={clearFilters}
            />
          ) : (
            <div className="space-y-3">
              {filteredScans.map((scan, index) => (
                <HistoryCard
                  key={
                    scan?.id ??
                    `scan-${index}`
                  }
                  scan={scan}
                />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#033e35] px-5 py-4 text-[10px] leading-5 text-white">
          <Leaf
            size={16}
            className="mt-0.5 shrink-0 text-[#64c96a]"
            aria-hidden="true"
          />

          <p>
            <strong>Eco-Sort AI:</strong>{" "}
            Keep scanning, learn from every result, and make
            better waste-sorting decisions. AI predictions
            should always be verified before disposal.
          </p>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function HistoryStat({
  icon: Icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="rounded-[16px] border border-[#e1e6e9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${iconClass}`}
          aria-hidden="true"
        >
          <Icon size={23} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] text-[#68788b]">
            {label}
          </p>

          <p className="mt-1 text-[25px] font-black">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HISTORY CARD
========================================================= */

function HistoryCard({ scan }) {
  const category =
    scan?.category || "Organic";

  const current =
    CATEGORY_CONFIG[category] ||
    CATEGORY_CONFIG.Organic;

  const CategoryIcon = current.icon;

  const rawConfidence = Number(scan?.confidence ?? 0);

  const normalizedConfidence =
    Number.isFinite(rawConfidence) && rawConfidence >= 0 && rawConfidence <= 1
      ? rawConfidence * 100
      : rawConfidence;

  const confidence = Number.isFinite(normalizedConfidence)
    ? Math.max(0, Math.min(100, normalizedConfidence)).toFixed(0)
    : "0";

  const confidenceValue = Number(confidence);

  const isReviewRequired = Boolean(
    scan?.review_required
  );

  const confidenceStatus =
    scan?.confidence_status ||
    (isReviewRequired
      ? "Manual Review"
      : "High Confidence");

  return (
    <article className="group rounded-[18px] border border-[#e1e6e9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        {/* CATEGORY ICON */}
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: current.background,
          }}
          aria-hidden="true"
        >
          <CategoryIcon
            size={29}
            style={{
              color: current.color,
            }}
          />
        </div>

        {/* INFORMATION */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="text-[18px] font-black"
              style={{
                color: current.color,
              }}
            >
              {category}
            </h3>

            {isReviewRequired ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff2df] px-3 py-1 text-[9px] font-bold text-[#c96812]">
                <AlertTriangle
                  size={11}
                  aria-hidden="true"
                />
                Review Required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#edf9f0] px-3 py-1 text-[9px] font-bold text-[#168b4c]">
                <CheckCircle2
                  size={11}
                  aria-hidden="true"
                />
                Verified Confidence
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-[#758291]">
            <span>
              Scan #{scan?.id ?? "—"}
            </span>

            <span>
              {formatDate(scan?.timestamp || scan?.created_at)}
            </span>

            <span>
              Bin:{" "}
              <strong className="text-[#4c5b69]">
                {scan?.recommended_bin ||
                  "Not specified"}
              </strong>
            </span>
          </div>
        </div>

        {/* CONFIDENCE */}
        <div className="min-w-[125px] md:text-right">
          <p className="text-[9px] uppercase tracking-[0.08em] text-[#8995a1]">
            Confidence
          </p>

          <p
            className={`mt-1 text-[22px] font-black ${
              isReviewRequired
                ? "text-[#e87918]"
                : "text-[#087443]"
            }`}
          >
            {confidence}%
          </p>

          <div
            className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#edf0f2] md:ml-auto md:max-w-[100px]"
            role="progressbar"
            aria-label="Prediction confidence"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={confidenceValue}
          >
            <div
              className={`h-full rounded-full transition-all ${
                isReviewRequired
                  ? "bg-[#e87918]"
                  : "bg-[#168b4c]"
              }`}
              style={{
                width: `${confidenceValue}%`,
              }}
            />
          </div>

          <p className="mt-1 text-[9px] text-[#7b8793]">
            {confidenceStatus}
          </p>
        </div>

        {/* ARROW */}
        <div
          className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#f3f6f7] text-[#718092] transition group-hover:bg-[#eaf7ef] group-hover:text-[#087443] md:flex"
          aria-hidden="true"
        >
          <ArrowRight size={17} />
        </div>
      </div>

      {/* DISPOSAL GUIDANCE */}
      {scan?.disposal_guidance && (
        <div className="mt-4 rounded-xl border border-[#e5eaed] bg-[#f7fafb] px-4 py-3">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-[#2879bb]"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.05em] text-[#365e80]">
                Disposal Guidance
              </p>

              <p className="mt-1 text-[10px] leading-5 text-[#68788b]">
                {scan.disposal_guidance}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EXPLANATION */}
      {scan?.explanation && (
        <div className="mt-3 rounded-xl border border-[#dceee2] bg-[#f3faf5] px-4 py-3">
          <div className="flex items-start gap-3">
            <SparklesIcon />

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.05em] text-[#087443]">
                AI Explanation
              </p>

              <p className="mt-1 text-[10px] leading-5 text-[#687b70]">
                {scan.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HAZARDOUS WARNING */}
      {scan?.hazardous_warning && (
        <div className="mt-3 flex gap-3 rounded-xl border border-[#f1cf8b] bg-[#fff9e9] px-4 py-3">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-[#db7412]"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.05em] text-[#9d5109]">
              Hazardous Waste Warning
            </p>

            <p className="mt-1 text-[10px] leading-5 text-[#9d642b]">
              Follow authorized disposal procedures and do
              not mix hazardous waste with regular household
              waste.
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   AI EXPLANATION ICON
========================================================= */

function SparklesIcon() {
  return (
    <div
      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#dff4e6]"
      aria-hidden="true"
    >
      <Leaf
        size={14}
        className="text-[#16894e]"
      />
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasFilters,
  onClear,
}) {
  return (
    <div className="rounded-[18px] border border-[#e1e6e9] bg-white py-20 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf7ee]">
        <ScanLine
          size={30}
          className="text-[#15904d]"
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-5 text-xl font-black">
        {hasFilters
          ? "No matching scans"
          : "No scans yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#758291]">
        {hasFilters
          ? "Try another search or category filter, or clear your filters to see all scans."
          : "Start scanning waste to build your classification history and track your progress."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dfe7e2] bg-white px-5 py-3 text-xs font-bold text-[#087443] transition hover:bg-[#f3f8f5] focus:outline-none focus:ring-2 focus:ring-[#68b985]/40"
          >
            <X
              size={15}
              aria-hidden="true"
            />
            Clear Filters
          </button>
        )}

        <NavLink
          to="/scan"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#087443] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#096239] focus:outline-none focus:ring-2 focus:ring-[#68b985]/50 focus:ring-offset-2"
        >
          <Camera
            size={15}
            aria-hidden="true"
          />
          Start Scanning
        </NavLink>
      </div>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(timestamp) {
  if (!timestamp) {
    return "Date unavailable";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}