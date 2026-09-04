import { useEffect, useState } from "react";
import {
  BarChart3,
  Leaf,
  Recycle,
  AlertTriangle,
  ScanLine,
  TrendingUp,
  Target,
} from "lucide-react";

import { apiJson } from "../utils/api";
import PageLoading from "../components/PageLoading";
import RetryState from "../components/RetryState";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const data = await apiJson("/analytics");

        if (!mounted) {
          return;
        }

        setAnalytics(data || {});
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        console.error(
          "Analytics loading error:",
          requestError
        );

        setError(
          requestError?.message ||
            "Unable to load analytics right now."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, [retryCount]);

  if (loading) {
    return (
      <PageLoading label="Loading analytics…" />
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-[#f5f7f9] px-4 py-7 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <RetryState
            title="Analytics unavailable"
            message={
              error ||
              "No analytics data is available yet."
            }
            onRetry={() =>
              setRetryCount(
                (count) => count + 1
              )
            }
          />
        </div>
      </div>
    );
  }

  const totalScans = safeNumber(
    analytics.total_scans
  );

  const averageConfidence = clamp(
    safeNumber(
      analytics.average_confidence
    ),
    0,
    100
  );

  const lowConfidence = Math.max(
    0,
    safeNumber(
      analytics.low_confidence_scans
    )
  );

  /*
   * Current FastAPI analytics uses `categories`.
   * Older frontend/backend versions used
   * `category_distribution` or `category_counts`,
   * so all supported shapes remain compatible.
   */
  const distribution =
    analytics.category_distribution ||
    analytics.category_counts ||
    analytics.categories ||
    {};

  const getCategoryCount = (category) => {
    const value = distribution?.[category];

    if (typeof value === "number") {
      return Math.max(0, value);
    }

    if (typeof value === "string") {
      return Math.max(
        0,
        safeNumber(value)
      );
    }

    return Math.max(
      0,
      safeNumber(value?.count)
    );
  };

  const recyclable =
    getCategoryCount("Recyclable");

  const organic =
    getCategoryCount("Organic");

  const hazardous =
    getCategoryCount("Hazardous");

  const recyclablePct = getPercentage(
    recyclable,
    totalScans
  );

  const organicPct = getPercentage(
    organic,
    totalScans
  );

  const hazardousPct = getPercentage(
    hazardous,
    totalScans
  );

  const reviewRate = getPercentage(
    lowConfidence,
    totalScans
  );

  const diversionCount =
    recyclable + organic;

  const diversionRate = getPercentage(
    diversionCount,
    totalScans
  );

  /*
   * This used to be useMemo(), but the calculation
   * is inexpensive and does not need memoization.
   *
   * Keeping it as a normal value also guarantees that
   * all React hooks remain above the conditional returns.
   */
  const categoryTotals = [
    ["Recyclable", recyclable],
    ["Organic", organic],
    ["Hazardous", hazardous],
  ];

  const dominantCategory =
    categoryTotals.reduce(
      (current, item) =>
        item[1] > current[1]
          ? item
          : current,
      ["No data", 0]
    );

  const highConfidence = Math.max(
    totalScans - lowConfidence,
    0
  );

  const confidenceLabel =
    averageConfidence >= 85
      ? "Very strong"
      : averageConfidence >= 60
        ? "Strong"
        : averageConfidence >= 40
          ? "Moderate"
          : "Needs attention";

  return (
    <div className="eco-app-page min-h-screen bg-[#f5f7f9] text-[#111c2c]">
      <main
        className="mx-auto max-w-[1250px] px-4 py-7 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10"
        aria-labelledby="analytics-page-title"
      >
        {/* HEADER */}
        <section aria-labelledby="analytics-page-title">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9ead6] bg-[#effaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
            <BarChart3
              size={14}
              aria-hidden="true"
            />
            Waste intelligence
          </div>

          <h1
            id="analytics-page-title"
            className="mt-5 text-[32px] font-black tracking-[-0.05em] sm:text-[38px] md:text-[48px]"
          >
            Waste Analytics
          </h1>

          <p className="mt-3 max-w-[650px] text-[14px] leading-6 text-[#68788b]">
            Understand your scanning activity,
            waste categories, confidence levels,
            and sorting patterns.
          </p>
        </section>

        {/* TOP METRICS */}
        <section
          className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
          aria-label="Analytics summary"
        >
          <MetricCard
            icon={ScanLine}
            label="Total Scans"
            value={totalScans}
            description="Images analyzed"
            iconClass="bg-[#e3f7e1] text-[#2d9b4b]"
          />

          <MetricCard
            icon={Target}
            label="Average Confidence"
            value={`${averageConfidence.toFixed(1)}%`}
            description="Model confidence"
            iconClass="bg-[#e1efff] text-[#3189d7]"
          />

          <MetricCard
            icon={TrendingUp}
            label="High Confidence"
            value={highConfidence}
            description="Reliable predictions"
            iconClass="bg-[#e8f7ef] text-[#087443]"
          />

          <MetricCard
            icon={AlertTriangle}
            label="Needs Review"
            value={lowConfidence}
            description="Low confidence scans"
            iconClass="bg-[#fff0df] text-[#e87918]"
          />
        </section>

        {/* MAIN ANALYTICS GRID */}
        <section className="mt-6 grid gap-4 sm:mt-7 sm:gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* CATEGORY DISTRIBUTION */}
          <div className="rounded-[20px] border border-[#e1e6e9] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
                  Classification
                </p>

                <h2 className="mt-2 text-[23px] font-black tracking-[-0.03em]">
                  Waste Distribution
                </h2>

                <p className="mt-1 text-[11px] text-[#7b8793]">
                  Breakdown of your scanned waste.
                </p>
              </div>

              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]"
                aria-hidden="true"
              >
                <Recycle size={21} />
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <CategoryBar
                icon={Recycle}
                category="Recyclable"
                count={recyclable}
                total={totalScans}
                percentage={recyclablePct}
                iconClass="bg-[#eaf4ff] text-[#3189d7]"
                barClass="bg-[#3189d7]"
              />

              <CategoryBar
                icon={Leaf}
                category="Organic"
                count={organic}
                total={totalScans}
                percentage={organicPct}
                iconClass="bg-[#edf9f0] text-[#14884b]"
                barClass="bg-[#14884b]"
              />

              <CategoryBar
                icon={AlertTriangle}
                category="Hazardous"
                count={hazardous}
                total={totalScans}
                percentage={hazardousPct}
                iconClass="bg-[#fff3e5] text-[#e87918]"
                barClass="bg-[#e87918]"
              />
            </div>
          </div>

          {/* CATEGORY SUMMARY */}
          <div className="rounded-[20px] border border-[#e1e6e9] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
              Category Summary
            </p>

            <h2 className="mt-2 text-[23px] font-black tracking-[-0.03em]">
              Sorting Overview
            </h2>

            <div className="mt-6 space-y-3">
              <SummaryRow
                icon={Recycle}
                label="Recyclable Waste"
                value={recyclable}
                color="text-[#3189d7]"
                bg="bg-[#eaf4ff]"
              />

              <SummaryRow
                icon={Leaf}
                label="Organic Waste"
                value={organic}
                color="text-[#14884b]"
                bg="bg-[#edf9f0]"
              />

              <SummaryRow
                icon={AlertTriangle}
                label="Hazardous Waste"
                value={hazardous}
                color="text-[#e87918]"
                bg="bg-[#fff3e5]"
              />
            </div>

            <div className="mt-6 rounded-xl bg-[#f5faf7] p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dff2e5] text-[#087443]"
                  aria-hidden="true"
                >
                  <Leaf size={17} />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#1b4734]">
                    Keep sorting smart
                  </p>

                  <p className="mt-0.5 text-[9px] leading-4 text-[#718579]">
                    Every correctly classified item
                    contributes to better waste
                    decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DECISION INSIGHTS */}
        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          <InsightCard
            icon={TrendingUp}
            eyebrow="Sorting pattern"
            title={
              dominantCategory[1] > 0
                ? dominantCategory[0]
                : "No data yet"
            }
            value={
              dominantCategory[1] > 0
                ? `${dominantCategory[1]} scans`
                : "Start scanning"
            }
            description={
              dominantCategory[1] > 0
                ? `${getPercentage(
                    dominantCategory[1],
                    totalScans
                  ).toFixed(0)}% of your analyzed waste.`
                : "Your analytics will appear after your first scan."
            }
            iconClass="bg-[#eaf4ff] text-[#3189d7]"
          />

          <InsightCard
            icon={Recycle}
            eyebrow="Recoverable stream"
            title={`${diversionRate.toFixed(0)}%`}
            value={`${diversionCount} scans`}
            description="Recyclable + organic items identified by AI."
            iconClass="bg-[#e8f7ef] text-[#087443]"
          />

          <InsightCard
            icon={AlertTriangle}
            eyebrow="Review rate"
            title={`${reviewRate.toFixed(0)}%`}
            value={`${lowConfidence} scans`}
            description={
              lowConfidence > 0
                ? "Low-confidence results should be verified before disposal."
                : "No scans currently require manual review."
            }
            iconClass="bg-[#fff3e5] text-[#e87918]"
          />
        </section>

        {/* CONFIDENCE ANALYTICS */}
        <section className="mt-5 rounded-[20px] border border-[#e1e6e9] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f7ef] text-[#087443]"
                  aria-hidden="true"
                >
                  <Target size={20} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
                    Model Performance
                  </p>

                  <h2 className="mt-1 text-[21px] font-black">
                    Prediction Confidence
                  </h2>
                </div>
              </div>

              <p className="mt-3 max-w-[560px] text-[11px] leading-5 text-[#74808c]">
                Confidence indicates how strongly the
                AI model supports its predicted waste
                category. Lower-confidence results should
                be manually reviewed before disposal.
              </p>
            </div>

            <div className="w-full min-w-0 md:min-w-[220px] md:max-w-[300px]">
              <div className="flex items-end justify-between gap-4">
                <span className="text-[10px] font-bold text-[#74808c]">
                  Average confidence
                </span>

                <span className="text-[24px] font-black text-[#087443]">
                  {averageConfidence.toFixed(1)}%
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[9px] font-bold text-[#8995a1]">
                  {confidenceLabel} model signal
                </span>

                <span className="text-right text-[9px] font-bold text-[#8995a1]">
                  Review below 60%
                </span>
              </div>

              <div
                className="mt-3 h-3 overflow-hidden rounded-full bg-[#e8edef]"
                role="progressbar"
                aria-label="Average model confidence"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={averageConfidence}
              >
                <div
                  className="h-full rounded-full bg-[#087443] transition-all duration-700"
                  style={{
                    width: `${averageConfidence}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* REVIEW NOTICE */}
        {lowConfidence > 0 && (
          <section
            className="mt-5 rounded-[18px] border border-[#f0d5ae] bg-[#fff9ef] p-5"
            role="note"
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0d9] text-[#dc7615]"
                aria-hidden="true"
              >
                <AlertTriangle size={21} />
              </div>

              <div>
                <h3 className="text-[14px] font-black text-[#70400e]">
                  {lowConfidence} scan
                  {lowConfidence !== 1
                    ? "s"
                    : ""}{" "}
                  need manual review
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-[#8a6840]">
                  These predictions were below the
                  configured confidence threshold. Verify
                  the waste type before disposal.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* DISCLAIMER */}
        <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#033e35] px-5 py-4 text-[10px] leading-5 text-white">
          <Leaf
            size={16}
            className="mt-0.5 shrink-0 text-[#64c96a]"
            aria-hidden="true"
          />

          <p>
            <strong>Eco-Sort AI:</strong>{" "}
            Analytics are based on AI scan results and
            are intended to support better waste-sorting
            decisions. Predictions should be verified
            before disposal, especially for hazardous
            materials.
          </p>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="rounded-[17px] border border-[#e1e6e9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-[13px] ${iconClass}`}
          aria-hidden="true"
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-5 text-[10px] text-[#758291]">
        {label}
      </p>

      <p className="mt-1 text-[25px] font-black tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-[#9aa4ad]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   CATEGORY BAR
========================================================= */

function CategoryBar({
  icon: Icon,
  category,
  count,
  total,
  percentage: suppliedPercentage,
  iconClass,
  barClass,
}) {
  const percentage = clamp(
    suppliedPercentage ??
      (total > 0
        ? (count / total) * 100
        : 0),
    0,
    100
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
            aria-hidden="true"
          >
            <Icon size={17} />
          </div>

          <div className="min-w-0">
            <p className="text-[12px] font-bold">
              {category}
            </p>

            <p className="text-[9px] text-[#8995a1]">
              {count} scan
              {count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <p className="shrink-0 text-[12px] font-black">
          {percentage.toFixed(0)}%
        </p>
      </div>

      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0f1]"
        role="progressbar"
        aria-label={`${category} percentage`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  icon: Icon,
  label,
  value,
  color,
  bg,
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#edf0f1] bg-[#fafbfb] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}
          aria-hidden="true"
        >
          <Icon size={17} />
        </div>

        <span className="text-[11px] font-bold text-[#43515f]">
          {label}
        </span>
      </div>

      <span className="shrink-0 text-[16px] font-black">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   INSIGHT CARD
========================================================= */

function InsightCard({
  icon: Icon,
  eyebrow,
  title,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="rounded-[20px] border border-[#e1e6e9] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          aria-hidden="true"
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
            {eyebrow}
          </p>

          <p className="mt-1 truncate text-[20px] font-black tracking-[-0.03em]">
            {title}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[12px] font-bold text-[#43515f]">
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-5 text-[#7b8793]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function getPercentage(value, total) {
  if (total <= 0) {
    return 0;
  }

  return clamp(
    (value / total) * 100,
    0,
    100
  );
}