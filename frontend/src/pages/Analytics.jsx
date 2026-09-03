import { useEffect, useState } from "react";
import {
  BarChart3,
  Leaf,
  Recycle,
  AlertTriangle,
  Trash2,
  ScanLine,
  TrendingUp,
  Target,
} from "lucide-react";

import AppLayout from "../components/AppLayout";

import { API_URL } from "../config";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch(`${API_URL}/analytics`);
        const data = await response.json();

        setAnalytics(data);
      } catch (error) {
        console.error("Analytics loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    );
  }

  if (!analytics) {
    return (
      <AppLayout>
        <ErrorState />
      </AppLayout>
    );
  }

  const totalScans = analytics.total_scans || 0;
  const averageConfidence = Number(
    analytics.average_confidence || 0
  );

  const lowConfidence = analytics.low_confidence_scans || 0;

  const distribution =
    analytics.category_distribution ||
    analytics.category_counts ||
    {};

  const recyclable = distribution.Recyclable || 0;
  const organic = distribution.Organic || 0;
  const hazardous = distribution.Hazardous || 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#f5f7f9] text-[#111c2c]">

        <main className="mx-auto max-w-[1250px] px-5 py-10 md:px-8 lg:px-10">

          {/* HEADER */}
          <section>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9ead6] bg-[#effaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
              <BarChart3 size={14} />
              Waste intelligence
            </div>

            <h1 className="mt-5 text-[38px] font-black tracking-[-0.05em] md:text-[48px]">
              Waste Analytics
            </h1>

            <p className="mt-3 max-w-[650px] text-[14px] leading-6 text-[#68788b]">
              Understand your scanning activity, waste
              categories, confidence levels, and sorting
              patterns.
            </p>

          </section>

          {/* TOP METRICS */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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
              value={Math.max(
                totalScans - lowConfidence,
                0
              )}
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
          <section className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">

            {/* CATEGORY DISTRIBUTION */}
            <div className="rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

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

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]">
                  <Recycle size={21} />
                </div>

              </div>

              <div className="mt-8 space-y-5">

                <CategoryBar
                  icon={Recycle}
                  category="Recyclable"
                  count={recyclable}
                  total={totalScans}
                  iconClass="bg-[#eaf4ff] text-[#3189d7]"
                  barClass="bg-[#3189d7]"
                />

                <CategoryBar
                  icon={Leaf}
                  category="Organic"
                  count={organic}
                  total={totalScans}
                  iconClass="bg-[#edf9f0] text-[#14884b]"
                  barClass="bg-[#14884b]"
                />

                <CategoryBar
                  icon={AlertTriangle}
                  category="Hazardous"
                  count={hazardous}
                  total={totalScans}
                  iconClass="bg-[#fff3e5] text-[#e87918]"
                  barClass="bg-[#e87918]"
                />

              </div>

            </div>

            {/* CATEGORY SUMMARY */}
            <div className="rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm">

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

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dff2e5] text-[#087443]">
                    <Leaf size={17} />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-[#1b4734]">
                      Keep sorting smart
                    </p>

                    <p className="mt-0.5 text-[9px] leading-4 text-[#718579]">
                      Every correctly classified item
                      contributes to better waste decisions.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* CONFIDENCE ANALYTICS */}
          <section className="mt-5 rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f7ef] text-[#087443]">
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
                  Confidence indicates how strongly the AI
                  model supports its predicted waste category.
                  Lower-confidence results should be manually
                  reviewed before disposal.
                </p>

              </div>

              <div className="min-w-[220px]">

                <div className="flex items-end justify-between">

                  <span className="text-[10px] font-bold text-[#74808c]">
                    Average confidence
                  </span>

                  <span className="text-[24px] font-black text-[#087443]">
                    {averageConfidence.toFixed(1)}%
                  </span>

                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e8edef]">

                  <div
                    className="h-full rounded-full bg-[#087443] transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        averageConfidence,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </section>

          {/* REVIEW NOTICE */}
          {lowConfidence > 0 && (
            <section className="mt-5 rounded-[18px] border border-[#f0d5ae] bg-[#fff9ef] p-5">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0d9] text-[#dc7615]">
                  <AlertTriangle size={21} />
                </div>

                <div>

                  <h3 className="text-[14px] font-black text-[#70400e]">
                    {lowConfidence} scan
                    {lowConfidence !== 1 ? "s" : ""} need
                    manual review
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-[#8a6840]">
                    These predictions were below the configured
                    confidence threshold. Verify the waste type
                    before disposal.
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
            />

            <p>
              <strong>Eco-Sort AI:</strong>{" "}
              Analytics are based on AI scan results and are
              intended to support better waste-sorting decisions.
              Predictions should be verified before disposal,
              especially for hazardous materials.
            </p>

          </div>

        </main>
      </div>
    </AppLayout>
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
  iconClass,
  barClass,
}) {
  const percentage =
    total > 0 ? (count / total) * 100 : 0;

  return (
    <div>

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
          >
            <Icon size={17} />
          </div>

          <div>

            <p className="text-[12px] font-bold">
              {category}
            </p>

            <p className="text-[9px] text-[#8995a1]">
              {count} scan{count !== 1 ? "s" : ""}
            </p>

          </div>

        </div>

        <p className="text-[12px] font-black">
          {percentage.toFixed(0)}%
        </p>

      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0f1]">

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
    <div className="flex items-center justify-between rounded-xl border border-[#edf0f1] bg-[#fafbfb] p-3">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${color}`}
        >
          <Icon size={17} />
        </div>

        <span className="text-[11px] font-bold text-[#43515f]">
          {label}
        </span>

      </div>

      <span className="text-[16px] font-black">
        {value}
      </span>

    </div>
  );
}


/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f5f7f9] px-5 py-20">

      <div className="mx-auto max-w-[900px] text-center">

        <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-[#eaf7ee]">

          <BarChart3
            size={30}
            className="text-[#15904d]"
          />

        </div>

        <p className="mt-5 text-sm font-bold">
          Loading analytics...
        </p>

        <p className="mt-2 text-xs text-[#7b8793]">
          Analyzing your waste-sorting activity.
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   ERROR
========================================================= */

function ErrorState() {
  return (
    <div className="min-h-screen bg-[#f5f7f9] px-5 py-20">

      <div className="mx-auto max-w-[600px] rounded-[20px] border border-[#e1e6e9] bg-white p-10 text-center shadow-sm">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0df] text-[#e87918]">

          <AlertTriangle size={27} />

        </div>

        <h2 className="mt-5 text-xl font-black">
          Analytics unavailable
        </h2>

        <p className="mt-2 text-xs leading-5 text-[#758291]">
          Unable to load analytics from the Eco-Sort AI
          backend. Make sure the FastAPI server is running.
        </p>

      </div>

    </div>
  );
}