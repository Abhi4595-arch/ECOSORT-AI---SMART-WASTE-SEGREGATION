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
} from "lucide-react";
import { NavLink } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import { API_URL } from "../config";

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch(`${API_URL}/history`);
        const data = await response.json();

        setScans(data.scans || []);
      } catch (error) {
        console.error("History loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const filteredScans = scans.filter((scan) => {
    const matchesSearch = scan.category
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || scan.category === filter;

    return matchesSearch && matchesFilter;
  });

  const highConfidenceCount = scans.filter(
    (scan) => !scan.review_required
  ).length;

  const reviewCount = scans.filter(
    (scan) => Boolean(scan.review_required)
  ).length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#f5f7f9] text-[#111c2c]">

        {/* MAIN */}
        <main className="mx-auto max-w-[1200px] px-5 py-10 md:px-8 lg:px-10">

          {/* TITLE */}
          <section>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9ead6] bg-[#effaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
              <Clock size={14} />
              Your activity
            </div>

            <h1 className="mt-5 text-[38px] font-black tracking-[-0.05em] md:text-[48px]">
              Scan History
            </h1>

            <p className="mt-3 max-w-[600px] text-[14px] leading-6 text-[#68788b]">
              Review your previous waste classifications,
              confidence levels, and disposal recommendations.
            </p>
          </section>

          {/* STATS */}
          <section className="mt-8 grid gap-4 sm:grid-cols-3">

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
          <section className="mt-7 rounded-[18px] border border-[#e1e6e9] bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="relative flex-1">

                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b98a4]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search scan category..."
                  className="w-full rounded-xl border border-[#e0e6e9] bg-[#f8fafb] py-3 pl-11 pr-4 text-[12px] outline-none transition focus:border-[#68b985] focus:bg-white"
                />

              </div>

              <div className="flex flex-wrap gap-2">

                {[
                  "All",
                  "Recyclable",
                  "Organic",
                  "Hazardous",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-xl px-4 py-2.5 text-[11px] font-bold transition ${
                      filter === item
                        ? "bg-[#087443] text-white shadow-md shadow-[#087443]/20"
                        : "border border-[#e1e6e9] bg-white text-[#657281] hover:bg-[#f3f8f5]"
                    }`}
                  >
                    {item}
                  </button>
                ))}

              </div>

            </div>
          </section>

          {/* HISTORY */}
          <section className="mt-5">

            {loading ? (
              <LoadingState />
            ) : filteredScans.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">

                {filteredScans.map((scan, index) => (
                  <HistoryCard
                    key={scan.id || index}
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
            />

            <p>
              <strong>Eco-Sort AI:</strong>{" "}
              Keep scanning, learn from every result, and
              make better waste-sorting decisions.
              AI predictions should always be verified before
              disposal.
            </p>

          </div>

        </main>
      </div>
    </AppLayout>
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
          className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${iconClass}`}
        >
          <Icon size={23} />
        </div>

        <div>

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
  const category = scan.category || "Organic";

  const config = {
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

  const current =
    config[category] || config.Organic;

  const CategoryIcon = current.icon;

  const confidence = Number(
    scan.confidence ?? 0
  ).toFixed(0);

  const isReviewRequired =
    Boolean(scan.review_required);

  return (
    <div className="group rounded-[18px] border border-[#e1e6e9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex flex-col gap-5 md:flex-row md:items-center">

        {/* CATEGORY ICON */}
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: current.background,
          }}
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
              <span className="rounded-full bg-[#fff2df] px-3 py-1 text-[9px] font-bold text-[#c96812]">
                Review Required
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-[#edf9f0] px-3 py-1 text-[9px] font-bold text-[#168b4c]">
                <CheckCircle2 size={11} />
                Verified Confidence
              </span>
            )}

          </div>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-[#758291]">

            <span>
              Scan #{scan.id}
            </span>

            <span>
              {formatDate(scan.timestamp)}
            </span>

            <span>
              Bin:{" "}
              <strong className="text-[#4c5b69]">
                {scan.recommended_bin ||
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

          <p className="text-[9px] text-[#7b8793]">
            {scan.confidence_status ||
              "High Confidence"}
          </p>

        </div>

        {/* ARROW */}
        <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#f3f6f7] text-[#718092] transition group-hover:bg-[#eaf7ef] group-hover:text-[#087443] md:flex">
          <ArrowRight size={17} />
        </div>

      </div>

      {/* DISPOSAL GUIDANCE */}
      {scan.disposal_guidance && (
        <div className="mt-4 rounded-xl border border-[#e5eaed] bg-[#f7fafb] px-4 py-3">

          <div className="flex items-start gap-3">

            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-[#2879bb]"
            />

            <div>

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
      {scan.explanation && (
        <div className="mt-3 rounded-xl border border-[#dceee2] bg-[#f3faf5] px-4 py-3">

          <div className="flex items-start gap-3">

            <SparklesIcon />

            <div>
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
      {scan.hazardous_warning && (
        <div className="mt-3 flex gap-3 rounded-xl border border-[#f1cf8b] bg-[#fff9e9] px-4 py-3">

          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-[#db7412]"
          />

          <div>

            <p className="text-[9px] font-black uppercase tracking-[0.05em] text-[#9d5109]">
              Hazardous Waste Warning
            </p>

            <p className="mt-1 text-[10px] leading-5 text-[#9d642b]">
              Follow authorized disposal procedures
              and do not mix hazardous waste with
              regular household waste.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}


/* =========================================================
   AI EXPLANATION ICON
========================================================= */

function SparklesIcon() {
  return (
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#dff4e6]">
      <Leaf
        size={14}
        className="text-[#16894e]"
      />
    </div>
  );
}


/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="rounded-[18px] border border-[#e1e6e9] bg-white py-20 text-center shadow-sm">

      <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-[#eaf7ee]">

        <ScanLine
          size={27}
          className="text-[#15904d]"
        />

      </div>

      <p className="mt-5 text-sm font-bold">
        Loading scan history...
      </p>

      <p className="mt-2 text-xs text-[#7b8793]">
        Fetching your latest activity.
      </p>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="rounded-[18px] border border-[#e1e6e9] bg-white py-20 text-center shadow-sm">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf7ee]">

        <ScanLine
          size={30}
          className="text-[#15904d]"
        />

      </div>

      <h3 className="mt-5 text-xl font-black">
        No matching scans
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#758291]">
        Try another search or category filter,
        or start a new waste scan.
      </p>

      <NavLink
        to="/scan"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087443] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#096239]"
      >
        <Camera size={15} />
        Start Scanning
      </NavLink>

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
    return timestamp;
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}