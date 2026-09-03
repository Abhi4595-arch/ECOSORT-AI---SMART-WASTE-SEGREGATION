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

import AppLayout from "../components/AppLayout";
import { API_URL } from "../config";

export default function EcoImpact() {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImpact() {
      try {
        const response = await fetch(`${API_URL}/eco-impact`);
        const data = await response.json();

        setImpact(data);
      } catch (error) {
        console.error("Eco impact loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadImpact();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    );
  }

  if (!impact) {
    return (
      <AppLayout>
        <ErrorState />
      </AppLayout>
    );
  }

  const totalItems = impact.total_items_sorted || 0;
  const correctlySorted =
    impact.correctly_sorted_items || 0;

  const categoryCounts =
    impact.category_counts || {};

  const recyclable =
    categoryCounts.Recyclable || 0;

  const organic =
    categoryCounts.Organic || 0;

  const hazardous =
    categoryCounts.Hazardous || 0;

  const impactScore = Number(
    impact.eco_impact_score || 0
  );

  const sortingRate =
    totalItems > 0
      ? (correctlySorted / totalItems) * 100
      : 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#f5f7f9] text-[#111c2c]">

        <main className="mx-auto max-w-[1200px] px-5 py-10 md:px-8 lg:px-10">

          <section>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9ead6] bg-[#effaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
              <Leaf size={14} />
              Environmental impact
            </div>

            <h1 className="mt-5 text-[38px] font-black tracking-[-0.05em] md:text-[48px]">
              Eco Impact
            </h1>

            <p className="mt-3 max-w-[650px] text-[14px] leading-6 text-[#68788b]">
              See how your waste-sorting activity contributes
              to better disposal decisions and a cleaner future.
            </p>
          </section>

          <section className="mt-8">
            <div className="relative overflow-hidden rounded-[24px] bg-[#033e35] p-7 text-white shadow-lg md:p-9">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#087443]/30 blur-2xl" />

              <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-[600px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Sparkles size={22} />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#9ed9b0]">
                        Eco Impact Score
                      </p>

                      <h2 className="mt-1 text-[22px] font-black">
                        Your sorting contribution
                      </h2>
                    </div>
                  </div>

                  <p className="mt-5 text-[12px] leading-6 text-[#c4d8d1]">
                    Your score reflects activity recorded by
                    Eco-Sort AI and is intended as an indicative
                    product metric for encouraging better sorting
                    habits.
                  </p>
                </div>

                <div className="flex h-40 w-40 shrink-0 flex-col items-center justify-center rounded-full border-[10px] border-[#64c96a]/30 bg-white/5">
                  <span className="text-[42px] font-black leading-none">
                    {impactScore}
                  </span>

                  <span className="mt-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#a7cfc0]">
                    Impact Score
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <section className="mt-7 grid gap-5 lg:grid-cols-3">
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

          <section className="mt-5 rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]">
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
                  Each scan helps you understand the waste
                  category before disposal. Continue scanning
                  unfamiliar items and manually verify
                  low-confidence results.
                </p>
              </div>

              <div className="min-w-[230px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#758291]">
                    Current progress
                  </span>

                  <span className="text-[15px] font-black text-[#087443]">
                    {sortingRate.toFixed(0)}%
                  </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e8edef]">
                  <div
                    className="h-full rounded-full bg-[#087443] transition-all duration-700"
                    style={{
                      width: `${Math.min(sortingRate, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[20px] border border-[#dceee2] bg-[#f3faf5] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dff2e5] text-[#087443]">
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
                  Keep recyclable materials reasonably clean
                  and dry, separate organic waste from dry
                  recyclables, and always use authorized
                  disposal channels for hazardous materials.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#033e35] px-5 py-4 text-[10px] leading-5 text-white">
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-[#64c96a]"
            />

            <p>
              <strong>Important:</strong>{" "}
              Eco Impact values shown here are indicative
              product metrics based on recorded scan activity.
              They are not scientific measurements of CO₂
              reduction, material weight, or verified
              environmental savings. Hazardous waste should
              always be handled through appropriate disposal
              channels.
            </p>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}

function ImpactMetric({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="rounded-[17px] border border-[#e1e6e9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-[13px] ${iconClass}`}
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

function CategoryImpact({
  icon: Icon,
  title,
  count,
  description,
  iconClass,
}) {
  return (
    <div className="rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${iconClass}`}
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
        <CheckCircle2 size={13} />
        AI classified
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f5f7f9] px-5 py-20">
      <div className="mx-auto max-w-[900px] text-center">
        <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-[#eaf7ee]">
          <Leaf size={30} className="text-[#15904d]" />
        </div>

        <p className="mt-5 text-sm font-bold">
          Loading eco impact...
        </p>

        <p className="mt-2 text-xs text-[#7b8793]">
          Calculating your sorting activity.
        </p>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen bg-[#f5f7f9] px-5 py-20">
      <div className="mx-auto max-w-[600px] rounded-[20px] border border-[#e1e6e9] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0df] text-[#e87918]">
          <AlertTriangle size={27} />
        </div>

        <h2 className="mt-5 text-xl font-black">
          Eco Impact unavailable
        </h2>

        <p className="mt-2 text-xs leading-5 text-[#758291]">
          Unable to load eco impact data. Make sure the
          Eco-Sort AI backend is running.
        </p>
      </div>
    </div>
  );
}
