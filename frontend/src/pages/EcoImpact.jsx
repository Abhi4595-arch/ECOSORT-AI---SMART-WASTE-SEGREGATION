import { useEffect, useState } from "react";
import {
  Leaf,
  Recycle,
  Apple,
  AlertTriangle,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { apiJson } from "../utils/api";
import PageLoading from "../components/PageLoading";
import RetryState from "../components/RetryState";

export default function EcoImpact() {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadImpact() {
      setLoading(true);
      setError("");

      try {
        const data = await apiJson("/eco-impact");

        if (!mounted) return;

        setImpact(data || {});
      } catch (requestError) {
        if (!mounted) return;

        console.error("Eco impact loading error:", requestError);
        setError(
          requestError?.message ||
            "Unable to load eco impact right now."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadImpact();

    return () => {
      mounted = false;
    };
  }, [retryCount]);

  if (loading) {
    return <PageLoading label="Loading eco impact…" />;
  }

  if (error || !impact) {
    return (
      <div className="min-h-screen bg-[#f5f7f9] px-4 py-7 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <RetryState
            title="Eco impact unavailable"
            message={
              error || "No eco impact data is available yet."
            }
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        </div>
      </div>
    );
  }

  const totalItems = Math.max(
    0,
    safeNumber(impact.total_items_sorted)
  );

  const correctlySorted = Math.min(
    totalItems,
    Math.max(0, safeNumber(impact.correctly_sorted_items))
  );

  const categoryCounts = normalizeCategoryCounts(impact);

  const recyclable = categoryCounts.Recyclable;
  const organic = categoryCounts.Organic;
  const hazardous = categoryCounts.Hazardous;

  const impactScore = clamp(
    safeNumber(impact.eco_impact_score),
    0,
    100
  );

  const sortingRate =
    totalItems > 0
      ? Math.min((correctlySorted / totalItems) * 100, 100)
      : 0;

  return (
    <div className="eco-app-page eco-page-enter min-h-screen bg-[#f5f7f9] text-[#111c2c]">
      <main
        className="mx-auto max-w-[1200px] px-4 py-7 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10"
        aria-labelledby="eco-impact-page-title"
      >
        {/* HEADER */}
        <section aria-labelledby="eco-impact-page-title">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9ead6] bg-[#effaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
            <Leaf size={14} aria-hidden="true" />
            Environmental impact
          </div>

          <h1
            id="eco-impact-page-title"
            className="mt-5 text-[32px] font-black tracking-[-0.05em] sm:text-[38px] md:text-[48px]"
          >
            Eco Impact
          </h1>

          <p className="mt-3 max-w-[650px] text-[14px] leading-6 text-[#68788b]">
            See how your waste-sorting activity contributes to
            better disposal decisions and a cleaner future.
          </p>
        </section>

        {/* IMPACT SCORE */}
        <section className="mt-8" aria-label="Eco Impact Score">
          <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#043f35_0%,#075b46_52%,#087443_100%)] p-7 text-white shadow-[0_18px_45px_rgba(4,63,53,0.16)] md:p-9">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#64c96a]/20 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-[600px]">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner"
                    aria-hidden="true"
                  >
                    <Sparkles size={22} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#a9e5b7]">
                      Eco Impact Score
                    </p>

                    <h2 className="mt-1 text-[22px] font-black">
                      Your sorting contribution
                    </h2>
                  </div>
                </div>

                <p className="mt-5 max-w-[560px] text-[12px] leading-6 text-[#d4e9e2]">
                  Your score reflects activity recorded by Eco-Sort
                  AI and is intended as an indicative product metric
                  for encouraging better sorting habits.
                </p>
              </div>

              <div
                className="flex h-40 w-40 shrink-0 flex-col items-center justify-center self-center rounded-full border-[10px] border-[#8be19a]/55 bg-white/10 shadow-[0_0_0_8px_rgba(255,255,255,0.035),0_12px_35px_rgba(0,0,0,0.12)] md:self-auto"
                aria-label={`Eco Impact Score ${impactScore}`}
              >
                <span className="text-[42px] font-black leading-none">
                  {impactScore}
                </span>

                <span className="mt-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#d7eee5]">
                  Impact Score
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* TOP METRICS */}
        <section
          className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Eco impact metrics"
        >
          <ImpactMetric
            icon={Recycle}
            label="Items Sorted"
            value={totalItems}
            description="Total waste scans"
            iconClass="bg-[#e8f7ef] text-[#087443]"
          />

          <ImpactMetric
            icon={CheckCircle2}
            label="Sorted Successfully"
            value={correctlySorted}
            description="Non-review results"
            iconClass="bg-[#e3f7e1] text-[#2d9b4b]"
          />

          <ImpactMetric
            icon={TrendingUp}
            label="Sorting Rate"
            value={`${sortingRate.toFixed(0)}%`}
            description="Indicative success rate"
            iconClass="bg-[#e1efff] text-[#3189d7]"
          />

          <ImpactMetric
            icon={Leaf}
            label="Eco Score"
            value={impactScore}
            description="Current contribution"
            iconClass="bg-[#edf9f0] text-[#14884b]"
          />
        </section>

        {/* CATEGORY IMPACT */}
        <section
          className="mt-7 grid gap-5 lg:grid-cols-3"
          aria-label="Waste category impact"
        >
          <CategoryImpact
            icon={Recycle}
            title="Recyclable"
            count={recyclable}
            description="Items identified for recyclable waste streams."
            iconClass="bg-[#eaf4ff] text-[#3189d7]"
          />

          <CategoryImpact
            icon={Apple}
            title="Organic"
            count={organic}
            description="Items identified for organic or wet waste streams."
            iconClass="bg-[#edf9f0] text-[#14884b]"
          />

          <CategoryImpact
            icon={AlertTriangle}
            title="Hazardous"
            count={hazardous}
            description="Items requiring safer, authorized disposal."
            iconClass="bg-[#fff3e5] text-[#e87918]"
          />
        </section>

        {/* SORTING PROGRESS */}
        <section className="eco-card eco-card-hover mt-5 rounded-[20px] border border-[#e1e6e9] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]"
                  aria-hidden="true"
                >
                  <Target size={20} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
                    Sorting Progress
                  </p>

                  <h2 className="mt-1 text-[21px] font-black">
                    Keep improving your sorting habits
                  </h2>
                </div>
              </div>

              <p className="mt-3 max-w-[600px] text-[11px] leading-5 text-[#758291]">
                Each scan helps you understand the waste category
                before disposal. Continue scanning unfamiliar items
                and manually verify low-confidence results.
              </p>
            </div>

            <div className="w-full min-w-0 md:min-w-[230px] md:max-w-[300px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-[#758291]">
                  Current progress
                </span>

                <span className="text-[15px] font-black text-[#087443]">
                  {sortingRate.toFixed(0)}%
                </span>
              </div>

              <div
                className="mt-3 h-3 overflow-hidden rounded-full bg-[#e8edef]"
                role="progressbar"
                aria-label="Sorting success rate"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={sortingRate}
              >
                <div
                  className="h-full rounded-full bg-[#087443] transition-all duration-700"
                  style={{
                    width: `${sortingRate}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ECO TIP */}
        <section className="eco-surface mt-5 rounded-[20px] border border-[#dceee2] bg-[#f3faf5] p-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dff2e5] text-[#087443]"
              aria-hidden="true"
            >
              <Leaf size={21} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
                Eco Tip
              </p>

              <h3 className="mt-1 text-[16px] font-black text-[#173d2d]">
                Sort first. Dispose responsibly.
              </h3>

              <p className="mt-2 text-[11px] leading-5 text-[#667a6e]">
                Keep recyclable materials reasonably clean and dry,
                separate organic waste from dry recyclables, and
                always use authorized disposal channels for
                hazardous materials.
              </p>
            </div>
          </div>
        </section>

        {/* DISCLAIMER */}
        <div
          className="mt-7 flex items-start gap-3 rounded-xl bg-[#033e35] px-5 py-4 text-[10px] leading-5 text-white"
          role="note"
        >
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-[#64c96a]"
            aria-hidden="true"
          />

          <p>
            <strong>Important:</strong>{" "}
            Eco Impact values shown here are indicative product
            metrics based on recorded scan activity. They are not
            scientific measurements of CO₂ reduction, material
            weight, or verified environmental savings. Hazardous
            waste should always be handled through appropriate
            disposal channels.
          </p>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   IMPACT METRIC
========================================================= */

function ImpactMetric({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="eco-card eco-card-hover rounded-[17px] border border-[#e1e6e9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-[13px] ${iconClass}`}
        aria-hidden="true"
      >
        <Icon size={21} />
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
   CATEGORY IMPACT
========================================================= */

function CategoryImpact({
  icon: Icon,
  title,
  count,
  description,
  iconClass,
}) {
  return (
    <div className="eco-card eco-card-hover rounded-[20px] border border-[#e1e6e9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${iconClass}`}
          aria-hidden="true"
        >
          <Icon size={23} />
        </div>

        <span className="text-[25px] font-black">
          {count}
        </span>
      </div>

      <h3 className="mt-5 text-[16px] font-black">
        {title}
      </h3>

      <p className="mt-2 text-[10px] leading-5 text-[#758291]">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-[9px] font-bold text-[#087443]">
        <CheckCircle2 size={13} aria-hidden="true" />
        AI classified
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeCategoryCounts(data) {
  const candidates = [
    data?.category_counts,
    data?.category_distribution,
    data?.categories,
    data?.waste_category_counts,
    data?.categoryCount,
  ];

  const source =
    candidates.find(
      (value) => value && typeof value === "object" && !Array.isArray(value)
    ) || {};

  const read = (name, directKeys = []) => {
    const aliases = [
      name,
      name.toLowerCase(),
      name.toUpperCase(),
      `${name.toLowerCase()}_count`,
      ...directKeys,
    ];

    for (const key of aliases) {
      if (source[key] !== undefined && source[key] !== null) {
        const value = source[key];

        if (value && typeof value === "object") {
          if (value.count !== undefined) {
            return Math.max(0, safeNumber(value.count));
          }

          if (value.total !== undefined) {
            return Math.max(0, safeNumber(value.total));
          }
        }

        return Math.max(0, safeNumber(value));
      }
    }

    return 0;
  };

  return {
    Recyclable: Math.max(
      read("Recyclable", ["recyclable_items"]),
      safeNumber(data?.recyclable_items)
    ),
    Organic: Math.max(
      read("Organic", ["organic_items"]),
      safeNumber(data?.organic_items)
    ),
    Hazardous: Math.max(
      read("Hazardous", ["hazardous_items"]),
      safeNumber(data?.hazardous_items)
    ),
  };
}

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}