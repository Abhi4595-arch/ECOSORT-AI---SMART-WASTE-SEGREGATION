import { useEffect, useState } from "react";
import {
  ScanLine,
  History as HistoryIcon,
  BarChart3,
  Leaf,
  Trophy,
  ShieldCheck,
  TrendingUp,
  Recycle,
  AlertTriangle,
  Camera,
  Info,
  Target,
  ArrowRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { API_URL } from "../config";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [ecoScore, setEcoScore] = useState(null);
  const [impact, setImpact] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          analyticsRes,
          historyRes,
          scoreRes,
          impactRes,
          gameRes,
        ] = await Promise.all([
          fetch(`${API_URL}/analytics`),
          fetch(`${API_URL}/history`),
          fetch(`${API_URL}/eco-score`),
          fetch(`${API_URL}/eco-impact`),
          fetch(`${API_URL}/gamification`),
        ]);

        const [
          analyticsData,
          historyData,
          scoreData,
          impactData,
          gameData,
        ] = await Promise.all([
          analyticsRes.json(),
          historyRes.json(),
          scoreRes.json(),
          impactRes.json(),
          gameRes.json(),
        ]);

        setAnalytics(analyticsData);
        setHistory(historyData.scans || []);
        setEcoScore(scoreData);
        setImpact(impactData);
        setGamification(gameData);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const latestScan = history[0] || null;

  const totalScans = analytics?.total_scans ?? 0;
  const averageConfidence = analytics?.average_confidence ?? 0;
  const lowConfidence = analytics?.low_confidence_scans ?? 0;

  const highConfidence = Math.max(
    totalScans - lowConfidence,
    0
  );

  const recyclable =
    analytics?.category_counts?.Recyclable ?? 0;

  const organic =
    analytics?.category_counts?.Organic ?? 0;

  const hazardous =
    analytics?.category_counts?.Hazardous ?? 0;

  const recyclablePercentage =
    analytics?.category_percentages?.Recyclable ?? 0;

  const organicPercentage =
    analytics?.category_percentages?.Organic ?? 0;

  const hazardousPercentage =
    analytics?.category_percentages?.Hazardous ?? 0;

  const score = Math.round(
    ecoScore?.eco_sort_score ?? 0
  );

  const points = gamification?.points ?? 0;

  const level =
    gamification?.level ||
    ecoScore?.level ||
    "Eco Beginner";

  const nextLevelPoints =
    gamification?.next_level_points ?? null;

  const nextLevel =
    gamification?.next_level ||
    ecoScore?.next_level ||
    "Maximum level reached";

  const levelProgress = Math.min(
    100,
    Math.max(0, Number(gamification?.progress_percentage ?? 0))
  );

  const pointsToNext =
    gamification?.points_to_next_level ?? null;

  const badges = gamification?.badges || [];

  const latestCategory =
    latestScan?.category || "Organic";

  const categoryConfig = {
    Recyclable: {
      color: "#3189d7",
      soft: "#eaf4ff",
      icon: Recycle,
    },

    Organic: {
      color: "#14884b",
      soft: "#edf9f0",
      icon: Leaf,
    },

    Hazardous: {
      color: "#e87918",
      soft: "#fff3e5",
      icon: AlertTriangle,
    },
  };

  const config =
    categoryConfig[latestCategory] ||
    categoryConfig.Organic;

  const CategoryIcon = config.icon;

  const mostCommon = getMostCommon(
    recyclable,
    organic,
    hazardous
  );

  const mostCommonPercentage =
    getMostCommonPercentage(
      recyclable,
      organic,
      hazardous,
      recyclablePercentage,
      organicPercentage,
      hazardousPercentage
    );

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#f5f7f9] text-[#111c2c]">

        {/* TOP AREA */}
        <section className="px-5 pt-8 md:px-8 lg:px-9">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">

            <div>
              <h1 className="text-[29px] font-black tracking-[-0.045em]">
                Hello, Eco Warrior!
                <span className="ml-2">🌱</span>
              </h1>

              <p className="mt-2 text-[14px] text-[#68788b]">
                Your actions today shape a cleaner tomorrow.
              </p>
            </div>

            <div className="flex items-center gap-5">

              {/* Score */}
              <div className="hidden items-center gap-3 rounded-[15px] border border-[#e1e6e9] bg-white px-5 py-3 shadow-sm sm:flex">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef8e8]">
                  <Leaf
                    size={28}
                    className="text-[#62a74b]"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-bold">
                    Eco-Sort Score
                  </p>

                  <p className="mt-0.5 text-[24px] font-black leading-none">
                    {loading ? "--" : score}

                    <span className="ml-1 text-[13px] text-[#718092]">
                      / 100
                    </span>
                  </p>
                </div>
              </div>

              {/* Profile */}
              <NavLink
                to="/profile"
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#06352c] text-[#72c866]">
                  <Leaf size={22} />
                </div>

                <div className="hidden sm:block">
                  <p className="text-[13px] font-bold">
                    Eco Warrior
                  </p>

                  <p className="text-[10px] text-[#718092]">
                    {level}
                  </p>
                </div>
              </NavLink>
            </div>
          </div>
        </section>

        {/* METRIC CARDS */}
        <section className="grid gap-4 px-5 pt-7 sm:grid-cols-2 md:px-8 lg:grid-cols-4 lg:px-9">

          <MetricCard
            icon={ScanLine}
            iconClass="bg-[#dcf7da] text-[#2fa14d]"
            label="Total Scans"
            value={loading ? "--" : totalScans}
            subtitle="All time"
          />

          <MetricCard
            icon={ShieldCheck}
            iconClass="bg-[#dceeff] text-[#2381cf]"
            label="High Confidence Scans"
            value={loading ? "--" : highConfidence}
            subtitle="Scans ≥ 60%"
          />

          <MetricCard
            icon={TrendingUp}
            iconClass="bg-[#e9e2ff] text-[#7251db]"
            label="Average Confidence"
            value={
              loading
                ? "--"
                : `${Number(averageConfidence).toFixed(0)}%`
            }
            subtitle="Across all scans"
          />

          <MetricCard
            icon={Leaf}
            iconClass="bg-[#fff0c8] text-[#e6a400]"
            label="Estimated Diversion"
            value={
              loading
                ? "--"
                : Number(
                    impact?.eco_impact_score ?? 0
                  ).toFixed(1)
            }
            subtitle="Diversion Units"
          />
        </section>

        {/* MAIN CONTENT */}
        <section className="grid gap-5 px-5 py-5 md:px-8 lg:grid-cols-[1.65fr_.9fr] lg:px-9">

          {/* LATEST SCAN */}
          <div className="rounded-[18px] border border-[#e0e6e9] bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-black">
                Latest Scan Result
              </h2>

              <span className="rounded-lg bg-[#f0f3f5] px-3 py-1.5 text-[9px] text-[#657281]">
                {latestScan
                  ? "Latest"
                  : "No scans yet"}
              </span>
            </div>

            {latestScan ? (
              <div className="mt-5 grid gap-6 md:grid-cols-[.85fr_1fr]">

                {/* Image Placeholder */}
                <div>
                  <div className="relative flex h-[285px] items-center justify-center overflow-hidden rounded-xl bg-[#edf2ef]">

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_65%,white,transparent_38%)]" />

                    <div className="relative flex h-36 w-28 items-center justify-center rounded-[18px] bg-[#17241f] shadow-2xl">

                      <div className="flex h-28 w-24 items-center justify-center rounded-[13px] bg-[#28352f]">

                        <CategoryIcon
                          size={51}
                          className={
                            latestCategory === "Hazardous"
                              ? "text-[#e87918]"
                              : latestCategory === "Recyclable"
                              ? "text-[#3189d7]"
                              : "text-[#27a257]"
                          }
                        />

                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-[8px] font-semibold text-[#56636e] backdrop-blur">
                      Latest AI scan
                    </div>
                  </div>

                  <NavLink
                    to="/scan"
                    className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-[#65bb80] py-2.5 text-[12px] font-bold text-[#087443] transition hover:bg-[#eff9f2]"
                  >
                    <Camera size={15} />
                    Scan Another
                  </NavLink>
                </div>

                {/* Result Details */}
                <div>

                  <div className="flex items-start gap-3">

                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{
                        background: config.soft,
                      }}
                    >
                      <CategoryIcon
                        size={22}
                        style={{
                          color: config.color,
                        }}
                      />
                    </div>

                    <div>
                      <p className="text-[11px] text-[#647384]">
                        AI Classification
                      </p>

                      <h3
                        className="mt-1 text-[23px] font-black"
                        style={{
                          color: config.color,
                        }}
                      >
                        {latestCategory}
                      </h3>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">

                    <span className="rounded-lg bg-[#fff0dc] px-3 py-2 text-[11px] font-bold text-[#d26b13]">
                      {Number(
                        latestScan.confidence ?? 0
                      ).toFixed(0)}
                      % Confidence
                    </span>

                    <span className="rounded-full bg-[#eef1f4] px-3 py-1.5 text-[9px] font-medium text-[#657281]">
                      {latestScan.confidence_status ||
                        "High Confidence"}
                    </span>
                  </div>

                  {/* Confidence Message */}
                  {latestScan.review_required ? (

                    <div className="mt-4 rounded-xl border border-[#f2c76d] bg-[#fff9e9] p-4">
                      <div className="flex gap-3">

                        <AlertTriangle
                          size={18}
                          className="mt-0.5 shrink-0 text-[#ee7f0e]"
                        />

                        <div>
                          <p className="text-[11px] font-black text-[#a84c00]">
                            Low Confidence —
                            Manual Verification Required
                          </p>

                          <p className="mt-2 text-[10px] leading-5 text-[#a96325]">
                            The AI confidence is below the
                            review threshold. Please verify
                            the item before disposal.
                          </p>
                        </div>
                      </div>
                    </div>

                  ) : (

                    <div className="mt-4 rounded-xl border border-[#ccebd5] bg-[#f0faf3] p-4">
                      <div className="flex gap-3">

                        <ShieldCheck
                          size={18}
                          className="mt-0.5 shrink-0 text-[#168b4c]"
                        />

                        <div>
                          <p className="text-[11px] font-black text-[#087443]">
                            High Confidence Result
                          </p>

                          <p className="mt-2 text-[10px] leading-5 text-[#5d7667]">
                            The AI has enough confidence
                            to provide a disposal
                            recommendation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disposal */}
                  <div className="mt-3 rounded-xl border border-[#dfe7ed] bg-[#f7fafc] p-4">

                    <div className="flex gap-3">

                      <Info
                        size={18}
                        className="mt-0.5 shrink-0 text-[#2377c7]"
                      />

                      <div>
                        <p className="text-[11px] font-black text-[#184c83]">
                          Disposal Recommendation
                        </p>

                        <p className="mt-2 text-[10px] leading-5 text-[#64768a]">
                          {latestScan.disposal_guidance ||
                            "Follow the recommended disposal guidance."}
                        </p>
                      </div>

                    </div>
                  </div>

                  <NavLink
                    to="/history"
                    className="mt-5 flex items-center gap-2 text-[11px] font-bold text-[#087443]"
                  >
                    View Full History
                    <ArrowRight size={14} />
                  </NavLink>

                </div>
              </div>
            ) : (
              <EmptyScan />
            )}
          </div>

          {/* ECO SCORE */}
          <div className="rounded-[18px] border border-[#e0e6e9] bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-black">
                Eco-Sort Score
              </h2>

              <Info
                size={17}
                className="text-[#84909c]"
              />
            </div>

            <div className="mt-5 flex items-center justify-between">

              <div>
                <div className="flex items-end gap-2">
                  <span className="text-[50px] font-black leading-none text-[#07864b]">
                    {loading ? "--" : score}
                  </span>

                  <span className="mb-1 text-[16px] font-bold">
                    / 100
                  </span>
                </div>

                <p className="mt-4 max-w-[230px] text-[11px] leading-5 text-[#68788a]">
                  Your score reflects scan quality
                  and your contribution.
                </p>
              </div>

              <div className="relative hidden h-[105px] w-[100px] sm:block">

                <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#e6f4dd]">
                  <Leaf
                    size={38}
                    className="text-[#5da64b]"
                  />
                </div>

                <span className="absolute left-1 top-2 text-[#d99d16]">
                  ✦
                </span>

                <span className="absolute right-1 top-5 text-[#d99d16]">
                  ✦
                </span>

                <span className="absolute right-0 bottom-4 text-[#d99d16]">
                  ✦
                </span>

                <span className="absolute left-2 bottom-3 text-[#d99d16]">
                  ✦
                </span>

              </div>
            </div>

            <div className="my-5 border-t border-[#e8ecef]" />

            <h3 className="text-[12px] font-black">
              Score Breakdown
            </h3>

            {ecoScore?.score_breakdown ? (
              <div className="space-y-1">
                <ScoreFactor
                  label="AI Confidence"
                  value={ecoScore.score_breakdown.ai_confidence ?? 0}
                  weight={ecoScore.weights?.ai_confidence ?? 50}
                  description="Average confidence across your scans"
                />

                <ScoreFactor
                  label="Sorting Reliability"
                  value={ecoScore.score_breakdown.sorting_reliability ?? 0}
                  weight={ecoScore.weights?.sorting_reliability ?? 25}
                  description="Share of scans above the review threshold"
                />

                <ScoreFactor
                  label="Safe Handling"
                  value={ecoScore.score_breakdown.safe_handling ?? 0}
                  weight={ecoScore.weights?.safe_handling ?? 15}
                  description="Safe disposal signals across scans"
                />

                <ScoreFactor
                  label="Consistency"
                  value={ecoScore.score_breakdown.consistency ?? 0}
                  weight={ecoScore.weights?.consistency ?? 10}
                  description="Rewards continued scanning activity"
                />
              </div>
            ) : (
              <div className="rounded-xl bg-[#f7faf8] p-4 text-[10px] leading-5 text-[#68788a]">
                Score breakdown will appear after the Eco-Sort Score service
                returns its detailed factors.
              </div>
            )}

            <div className="mt-5 rounded-xl border border-[#dcebe1] bg-[#f5faf6] p-3">
              <div className="flex items-start gap-2">
                <Target
                  size={15}
                  className="mt-0.5 shrink-0 text-[#087443]"
                />
                <div>
                  <p className="text-[10px] font-black text-[#087443]">
                    {ecoScore?.next_level
                      ? `Next: ${ecoScore.next_level}`
                      : "Keep improving"}
                  </p>
                  <p className="mt-1 text-[9px] leading-4 text-[#68788a]">
                    {ecoScore?.points_to_next_level != null
                      ? `${ecoScore.points_to_next_level} score points needed for the next level.`
                      : "Keep scanning and sorting carefully to improve your score."}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-[8px] leading-4 text-[#84908a]">
              Product metric based on AI confidence and sorting activity — not a
              measure of actual recycling accuracy.
            </p>

            <div className="mt-6 border-t border-[#e8ecef] pt-5">
              <NavLink
                to="/analytics"
                className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#087443]"
              >
                How it works?
                <ArrowRight size={14} />
              </NavLink>
            </div>
          </div>
        </section>

        {/* LOWER SECTION */}
        <section className="grid gap-5 px-5 pb-5 md:px-8 lg:grid-cols-[1.65fr_.9fr] lg:px-9">

          {/* ANALYTICS */}
          <div className="rounded-[18px] border border-[#e0e6e9] bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-black">
                Waste Analytics
              </h2>

              <NavLink
                to="/analytics"
                className="text-[10px] font-bold text-[#087443]"
              >
                View Analytics
              </NavLink>
            </div>

            <div className="mt-5 grid items-center gap-6 md:grid-cols-[170px_1fr]">

              {/* Donut */}
              <div className="relative mx-auto h-[155px] w-[155px]">

                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      #3189d7 0 ${recyclablePercentage}%,
                      #55a943 ${recyclablePercentage}% ${
                        recyclablePercentage +
                        organicPercentage
                      }%,
                      #ee7514 ${
                        recyclablePercentage +
                        organicPercentage
                      }% ${
                        recyclablePercentage +
                        organicPercentage +
                        hazardousPercentage
                      }%,
                      #d9dee3 ${
                        recyclablePercentage +
                        organicPercentage +
                        hazardousPercentage
                      }% 100%
                    )`,
                  }}
                />

                <div className="absolute inset-[23px] flex flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-[22px] font-black">
                    {totalScans}
                  </span>

                  <span className="text-[9px] text-[#657281]">
                    Total Scans
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-4">

                <LegendRow
                  color="#55a943"
                  label="Recyclable"
                  value={recyclable}
                  percentage={recyclablePercentage}
                />

                <LegendRow
                  color="#3189d7"
                  label="Organic"
                  value={organic}
                  percentage={organicPercentage}
                />

                <LegendRow
                  color="#ee7514"
                  label="Hazardous"
                  value={hazardous}
                  percentage={hazardousPercentage}
                />

                <LegendRow
                  color="#aeb8c1"
                  label="Uncertain"
                  value={lowConfidence}
                  percentage={
                    totalScans
                      ? Math.round(
                          (lowConfidence /
                            totalScans) *
                            100
                        )
                      : 0
                  }
                />

              </div>

              {/* Most Common */}
              <div className="rounded-xl bg-[#edf8f0] p-5 md:col-span-2">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                    <Leaf
                      size={18}
                      className="text-[#54a449]"
                    />
                  </div>

                  <div>
                    <p className="text-[9px] text-[#62756a]">
                      Most Common
                    </p>

                    <p className="text-[16px] font-black text-[#087443]">
                      {mostCommon}
                    </p>
                  </div>

                </div>

                <p className="mt-3 text-[10px] text-[#62756a]">
                  {mostCommonPercentage}% of total scans
                </p>
              </div>
            </div>
          </div>

          {/* GAMIFICATION */}
          <div className="rounded-[18px] border border-[#e0e6e9] bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <h2 className="text-[17px] font-black">
                Gamification
              </h2>

              <NavLink
                to="/gamification"
                className="flex items-center gap-1 text-[10px] font-bold text-[#087443]"
              >
                View All
                <ArrowRight size={13} />
              </NavLink>

            </div>

            <div className="mt-5 flex items-center gap-4">

              <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-4 border-[#d6a727] bg-[#eff7df]">

                <Trophy
                  size={34}
                  className="text-[#639c44]"
                />

              </div>

              <div className="flex-1">

                <p className="text-[9px] text-[#677688]">
                  Current Level
                </p>

                <p className="mt-1 text-[15px] font-black text-[#087443]">
                  {level}
                </p>

                <p className="mt-1 text-[9px] text-[#677688]">
                  {points} points · {nextLevelPoints !== null ? `Next: ${nextLevel}` : "Max level"}
                </p>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#dce2e6]">

                  <div
                    className="h-full rounded-full bg-[#168b4c] transition-all duration-700"
                    style={{
                      width: `${levelProgress}%`,
                    }}
                  />

                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#e8ecef] pt-4">

              <p className="text-[12px] font-black">
                Recent Badges
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">

                {badges.length > 0 ? (

                  badges.slice(0, 3).map(
                    (badge, index) => (
                      <div
                        key={index}
                        className="text-center"
                      >

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#d8b73e] bg-[#fff9dd]">

                          <Trophy
                            size={20}
                            className="text-[#8ba542]"
                          />

                        </div>

                        <p className="mt-2 line-clamp-2 text-[8px] font-semibold">
                          {typeof badge === "string"
                            ? badge
                            : badge.name || "Badge"}
                        </p>

                      </div>
                    )
                  )

                ) : (

                  <>
                    <Badge
                      icon={ScanLine}
                      label="First Scan"
                    />

                    <Badge
                      icon={Target}
                      label="5 Scans"
                    />

                    <Badge
                      icon={ShieldCheck}
                      label="High Confidence"
                    />
                  </>
                )}

              </div>
            </div>
          </div>
        </section>

        {/* DISCLAIMER */}
        <div className="mx-5 mb-5 rounded-lg bg-[#033e35] px-5 py-3 text-[9px] leading-5 text-white md:mx-8 lg:mx-9">

          <Leaf
            size={14}
            className="mr-2 inline text-[#64c96a]"
          />

          <strong>Disclaimer:</strong>{" "}
          AI predictions may not always be 100% accurate.
          Please verify before disposal. Eco Impact is an
          estimate, not a real-world measurement.

        </div>
      </div>
    </AppLayout>
  );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon: Icon,
  iconClass,
  label,
  value,
  subtitle,
}) {
  return (
    <div className="rounded-[16px] border border-[#e1e6e9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-center gap-4">

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${iconClass}`}
        >
          <Icon size={24} />
        </div>

        <div>

          <p className="text-[11px] text-[#637183]">
            {label}
          </p>

          <p className="mt-1 text-[25px] font-black leading-none">
            {value}
          </p>

          <p className="mt-2 text-[9px] text-[#778594]">
            {subtitle}
          </p>

        </div>
      </div>
    </div>
  );
}


/* =========================================================
   SCORE BAR
========================================================= */

function ScoreFactor({
  label,
  value,
  weight,
  description,
}) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const safeWeight = Math.max(0, Number(weight) || 0);
  const weightedContribution = (safeValue * safeWeight) / 100;

  return (
    <div className="mt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold text-[#1c2a24]">
              {label}
            </p>
            <span className="rounded-full bg-[#edf6f0] px-2 py-0.5 text-[8px] font-black text-[#087443]">
              {safeWeight}% weight
            </span>
          </div>

          <p className="mt-1 text-[9px] text-[#73808e]">
            {description}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] font-black text-[#263b32]">
            {Math.round(safeValue)}%
          </p>
          <p className="mt-0.5 text-[8px] text-[#8a9690]">
            +{weightedContribution.toFixed(1)} pts
          </p>
        </div>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e1e6e9]">
        <div
          className="h-full rounded-full bg-[#168b4c] transition-all duration-700"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}


function ScoreBar({
  label,
  value,
  max,
  description,
}) {
  const percentage =
    max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="mt-5">

      <div className="flex justify-between">

        <div>
          <p className="text-[11px] font-bold">
            {label}
          </p>

          <p className="mt-1 text-[9px] text-[#73808e]">
            {description}
          </p>
        </div>

        <p className="text-[11px] font-bold">
          {value} / {max}
        </p>

      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e1e6e9]">

        <div
          className="h-full rounded-full bg-[#168b4c] transition-all duration-700"
          style={{
            width: `${Math.min(
              100,
              percentage
            )}%`,
          }}
        />

      </div>
    </div>
  );
}


/* =========================================================
   LEGEND
========================================================= */

function LegendRow({
  color,
  label,
  value,
  percentage,
}) {
  return (
    <div className="flex items-center justify-between gap-5">

      <div className="flex items-center gap-2">

        <span
          className="h-3 w-3 rounded-full"
          style={{
            background: color,
          }}
        />

        <span className="text-[11px] font-semibold">
          {label}
        </span>

      </div>

      <span className="text-[10px] text-[#536171]">
        {value}
        <span className="text-[#7a8793]">
          {" "}({percentage}%)
        </span>
      </span>

    </div>
  );
}


/* =========================================================
   BADGE
========================================================= */

function Badge({
  icon: Icon,
  label,
}) {
  return (
    <div className="text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#d8b73e] bg-[#fff9dd]">

        <Icon
          size={20}
          className="text-[#8ba542]"
        />

      </div>

      <p className="mt-2 text-[8px] font-semibold">
        {label}
      </p>

    </div>
  );
}


/* =========================================================
   EMPTY SCAN
========================================================= */

function EmptyScan() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf7ee]">

        <ScanLine
          size={30}
          className="text-[#15904d]"
        />

      </div>

      <h3 className="mt-5 text-lg font-black">
        No scans yet
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-[#758291]">
        Start your first waste scan and
        your latest result will appear here.
      </p>

      <NavLink
        to="/scan"
        className="mt-5 rounded-xl bg-[#087443] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#096239]"
      >
        Start Scanning
      </NavLink>

    </div>
  );
}


/* =========================================================
   MOST COMMON
========================================================= */

function getMostCommon(
  recyclable,
  organic,
  hazardous
) {
  if (
    recyclable === 0 &&
    organic === 0 &&
    hazardous === 0
  ) {
    return "No Data";
  }

  if (
    recyclable >= organic &&
    recyclable >= hazardous
  ) {
    return "Recyclable";
  }

  if (
    organic >= recyclable &&
    organic >= hazardous
  ) {
    return "Organic";
  }

  return "Hazardous";
}


/* =========================================================
   MOST COMMON PERCENTAGE
========================================================= */

function getMostCommonPercentage(
  recyclable,
  organic,
  hazardous,
  recyclablePercentage,
  organicPercentage,
  hazardousPercentage
) {
  if (
    recyclable === 0 &&
    organic === 0 &&
    hazardous === 0
  ) {
    return 0;
  }

  if (
    recyclable >= organic &&
    recyclable >= hazardous
  ) {
    return recyclablePercentage;
  }

  if (
    organic >= recyclable &&
    organic >= hazardous
  ) {
    return organicPercentage;
  }

  return hazardousPercentage;
}