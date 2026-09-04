import { useEffect, useState } from "react";
import {
  ScanLine,
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
  BarChart3,
  Globe2,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { apiJson } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import RetryState from "../components/RetryState";

export default function Dashboard() {
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [ecoScore, setEcoScore] = useState(null);
  const [impact, setImpact] = useState(null);
  const [gamification, setGamification] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [
          analyticsData,
          historyData,
          scoreData,
          impactData,
          gameData,
        ] = await Promise.all([
          apiJson("/analytics"),
          apiJson("/history"),
          apiJson("/eco-score"),
          apiJson("/eco-impact"),
          apiJson("/gamification"),
        ]);

        if (cancelled) return;

        setAnalytics(analyticsData);
        setHistory(
          Array.isArray(historyData?.scans)
            ? historyData.scans
            : []
        );
        setEcoScore(scoreData);
        setImpact(impactData);
        setGamification(gameData);
      } catch (err) {
        if (cancelled) return;

        console.error("Dashboard error:", err);

        setError(
          err?.message ||
            "Unable to load your dashboard right now."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const latestScan = history[0] || null;

  const totalScans = Math.max(
    0,
    Number(analytics?.total_scans ?? 0)
  );

  const averageConfidence = clamp(
    Number(analytics?.average_confidence ?? 0),
    0,
    100
  );

  const lowConfidence = Math.max(
    0,
    Number(analytics?.low_confidence_scans ?? 0)
  );

  const highConfidence = Math.max(
    totalScans - lowConfidence,
    0
  );

  const recyclable = Math.max(
    0,
    Number(analytics?.category_counts?.Recyclable ?? 0)
  );

  const organic = Math.max(
    0,
    Number(analytics?.category_counts?.Organic ?? 0)
  );

  const hazardous = Math.max(
    0,
    Number(analytics?.category_counts?.Hazardous ?? 0)
  );

  const recyclablePercentage = clamp(
    Number(
      analytics?.category_percentages?.Recyclable ?? 0
    ),
    0,
    100
  );

  const organicPercentage = clamp(
    Number(
      analytics?.category_percentages?.Organic ?? 0
    ),
    0,
    100
  );

  const hazardousPercentage = clamp(
    Number(
      analytics?.category_percentages?.Hazardous ?? 0
    ),
    0,
    100
  );

  const score = clamp(
    Math.round(Number(ecoScore?.eco_sort_score ?? 0)),
    0,
    100
  );

  const points = Math.max(
    0,
    Number(gamification?.points ?? 0)
  );

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

  const levelProgress = clamp(
    Number(
      gamification?.progress_percentage ?? 0
    ),
    0,
    100
  );

  const badges = Array.isArray(gamification?.badges)
    ? gamification.badges
    : [];

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

  const firstName =
    user?.name?.trim()?.split(/\s+/)[0] ||
    "Eco Warrior";

  const chartTotal =
    recyclablePercentage +
    organicPercentage +
    hazardousPercentage;

  const normalizedRecyclablePercentage =
    chartTotal > 100
      ? (recyclablePercentage / chartTotal) * 100
      : recyclablePercentage;

  const normalizedOrganicPercentage =
    chartTotal > 100
      ? (organicPercentage / chartTotal) * 100
      : organicPercentage;

  const normalizedHazardousPercentage =
    chartTotal > 100
      ? (hazardousPercentage / chartTotal) * 100
      : hazardousPercentage;

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f7f9] px-5 py-10 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <RetryState
            title="Dashboard unavailable"
            message={error}
            onRetry={() =>
              setRetryCount((count) => count + 1)
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="eco-app-page min-h-screen bg-[#f5f7f9] text-[#111c2c]">
      {/* =====================================================
          TOP AREA
      ====================================================== */}

      <section
        className="px-5 pt-8 md:px-8 lg:px-9"
        aria-labelledby="dashboard-heading"
      >
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <h1
              id="dashboard-heading"
              className="text-[29px] font-black tracking-[-0.045em]"
            >
              Hello, {firstName}!
              <span
                className="ml-2"
                aria-hidden="true"
              >
                🌱
              </span>
            </h1>

            <p className="mt-2 text-[14px] text-[#68788b]">
              Your actions today shape a cleaner tomorrow.
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* SCORE */}

            <NavLink
              to="/analytics"
              aria-label={`View Eco-Sort Score: ${score} out of 100`}
              className="hidden items-center gap-3 rounded-[15px] border border-[#e1e6e9] bg-white px-5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2 sm:flex"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef8e8]"
                aria-hidden="true"
              >
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
            </NavLink>

            {/* PROFILE */}

            <NavLink
              to="/profile"
              aria-label="Open your profile"
              className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#06352c] text-[#72c866]"
                aria-hidden="true"
              >
                <Leaf size={22} />
              </div>

              <div className="hidden sm:block">
                <p className="text-[13px] font-bold">
                  {user?.name || "Eco Warrior"}
                </p>

                <p className="text-[10px] text-[#718092]">
                  {level}
                </p>
              </div>
            </NavLink>
          </div>
        </div>
      </section>

      {/* =====================================================
          METRIC CARDS
      ====================================================== */}

      <section
        className="grid gap-4 px-5 pt-7 sm:grid-cols-2 md:px-8 lg:grid-cols-4 lg:px-9"
        aria-label="Dashboard metrics"
      >
        <DashboardMetricLink
          to="/history"
          icon={ScanLine}
          iconClass="bg-[#dcf7da] text-[#2fa14d]"
          label="Total Scans"
          value={loading ? "--" : totalScans}
          subtitle="View scan history"
        />

        <DashboardMetricLink
          to="/analytics"
          icon={ShieldCheck}
          iconClass="bg-[#dceeff] text-[#2381cf]"
          label="High Confidence Scans"
          value={loading ? "--" : highConfidence}
          subtitle="Scans ≥ 60%"
        />

        <DashboardMetricLink
          to="/analytics"
          icon={TrendingUp}
          iconClass="bg-[#e9e2ff] text-[#7251db]"
          label="Average Confidence"
          value={
            loading
              ? "--"
              : `${averageConfidence.toFixed(0)}%`
          }
          subtitle="View analytics"
        />

        <DashboardMetricLink
          to="/eco-impact"
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
          subtitle="View Eco Impact"
        />
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="grid gap-5 px-5 py-5 md:px-8 lg:grid-cols-[1.65fr_.9fr] lg:px-9">
        {/* LATEST SCAN */}

        <div className="rounded-[18px] border border-[#e0e6e9] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#84909c]">
                AI result
              </p>

              <h2 className="mt-1 text-[17px] font-black">
                Latest Scan Result
              </h2>
            </div>

            <span className="rounded-lg bg-[#f0f3f5] px-3 py-1.5 text-[9px] font-bold text-[#657281]">
              {latestScan
                ? "Latest scan"
                : "No scans yet"}
            </span>
          </div>

          {latestScan ? (
            <div className="mt-5 grid gap-5 md:grid-cols-[.8fr_1.2fr]">
              {/* VISUAL */}

              <div>
                <div className="relative flex min-h-[285px] items-center justify-center overflow-hidden rounded-[16px] bg-[#edf2ef] p-5">
                  <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_70%_65%,white,transparent_38%)]"
                    aria-hidden="true"
                  />

                  <div className="relative flex flex-col items-center gap-4">
                    <div
                      className="flex h-36 w-28 items-center justify-center rounded-[18px] shadow-2xl"
                      style={{
                        background: "#17241f",
                      }}
                      aria-hidden="true"
                    >
                      <div className="flex h-28 w-24 items-center justify-center rounded-[13px] bg-[#28352f]">
                        <CategoryIcon
                          size={54}
                          style={{
                            color: config.color,
                          }}
                        />
                      </div>
                    </div>

                    <div
                      className="rounded-full px-4 py-1.5 text-[10px] font-black"
                      style={{
                        background: config.soft,
                        color: config.color,
                      }}
                    >
                      {latestCategory}
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-[8px] font-semibold text-[#56636e] backdrop-blur">
                    Latest AI classification
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <NavLink
                    to="/scan"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#087443] py-2.5 text-[11px] font-bold text-white transition hover:bg-[#066238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
                  >
                    <Camera
                      size={15}
                      aria-hidden="true"
                    />
                    Scan Another
                  </NavLink>

                  <NavLink
                    to="/history"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#cfe0d6] bg-white py-2.5 text-[11px] font-bold text-[#087443] transition hover:bg-[#f2faf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
                  >
                    History
                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                    />
                  </NavLink>
                </div>
              </div>

              {/* DECISION SUMMARY */}

              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[#647384]">
                      Waste category
                    </p>

                    <h3
                      className="mt-1 text-[26px] font-black"
                      style={{
                        color: config.color,
                      }}
                    >
                      {latestCategory}
                    </h3>
                  </div>

                  <div
                    className="relative flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(${config.color} ${clamp(
                        Number(
                          latestScan.confidence ?? 0
                        ),
                        0,
                        100
                      )}%, #e4e9ec 0)`,
                    }}
                    aria-label={`Confidence ${clamp(
                      Number(
                        latestScan.confidence ?? 0
                      ),
                      0,
                      100
                    ).toFixed(0)} percent`}
                    role="img"
                  >
                    <div className="flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-[18px] font-black">
                        {clamp(
                          Number(
                            latestScan.confidence ?? 0
                          ),
                          0,
                          100
                        ).toFixed(0)}
                        %
                      </span>

                      <span className="text-[7px] font-bold text-[#7a8793]">
                        confidence
                      </span>
                    </div>
                  </div>
                </div>

                {latestScan.review_required ? (
                  <NoticeBox
                    type="warning"
                    title="Verify before disposal"
                    message="Confidence is below the review threshold. Check the item manually before placing it in a bin."
                  />
                ) : latestCategory === "Hazardous" ? (
                  <NoticeBox
                    type="hazard"
                    title="Special handling required"
                    message="Follow hazardous-waste guidance and avoid placing this item in a regular recycling or organic bin."
                  />
                ) : (
                  <NoticeBox
                    type="success"
                    title="Ready for disposal guidance"
                    message="The result has enough confidence to show a disposal recommendation."
                  />
                )}

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    icon={Info}
                    label="Recommended Bin"
                    value={
                      latestScan.recommended_bin ||
                      "Follow local guidance"
                    }
                  />

                  <InfoBox
                    icon={ShieldCheck}
                    label="Confidence Status"
                    value={
                      latestScan.confidence_status ||
                      "Not available"
                    }
                  />
                </div>

                <div className="mt-3 rounded-xl border border-[#dcebe1] bg-[#f5faf6] p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#087443]">
                    Disposal guidance
                  </p>

                  <p className="mt-2 text-[10px] leading-5 text-[#5d7667]">
                    {latestScan.disposal_guidance ||
                      "Follow the recommended disposal guidance and local waste rules."}
                  </p>
                </div>

                {latestScan.explanation && (
                  <div className="mt-3 rounded-xl border border-[#e4e7eb] bg-white p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#596a7b]">
                      AI explanation
                    </p>

                    <p className="mt-2 text-[10px] leading-5 text-[#6b7886]">
                      {latestScan.explanation}
                    </p>
                  </div>
                )}
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

            <NavLink
              to="/analytics"
              aria-label="Learn about your Eco-Sort Score"
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
            >
              <Info
                size={17}
                aria-hidden="true"
                className="text-[#84909c]"
              />
            </NavLink>
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
                Your score reflects scan quality and your
                contribution.
              </p>
            </div>

            <div
              className="relative hidden h-[105px] w-[100px] sm:block"
              aria-hidden="true"
            >
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

              <span className="absolute bottom-4 right-0 text-[#d99d16]">
                ✦
              </span>

              <span className="absolute bottom-3 left-2 text-[#d99d16]">
                ✦
              </span>
            </div>
          </div>

          <div className="my-5 border-t border-[#e8ecef]" />

          <h3 className="text-[12px] font-black">
            Score Breakdown
          </h3>

          {ecoScore?.score_breakdown ? (
            <div>
              <ScoreFactor
                label="AI Confidence"
                value={
                  ecoScore.score_breakdown
                    ?.ai_confidence ?? 0
                }
                weight={
                  ecoScore.weights?.ai_confidence ?? 50
                }
                description="Average confidence across your scans"
              />

              <ScoreFactor
                label="Sorting Reliability"
                value={
                  ecoScore.score_breakdown
                    ?.sorting_reliability ?? 0
                }
                weight={
                  ecoScore.weights
                    ?.sorting_reliability ?? 25
                }
                description="Share of scans above the review threshold"
              />

              <ScoreFactor
                label="Safe Handling"
                value={
                  ecoScore.score_breakdown
                    ?.safe_handling ?? 0
                }
                weight={
                  ecoScore.weights?.safe_handling ?? 15
                }
                description="Safe disposal signals across scans"
              />

              <ScoreFactor
                label="Consistency"
                value={
                  ecoScore.score_breakdown
                    ?.consistency ?? 0
                }
                weight={
                  ecoScore.weights?.consistency ?? 10
                }
                description="Rewards continued scanning activity"
              />
            </div>
          ) : (
            <div className="rounded-xl bg-[#f7faf8] p-4 text-[10px] leading-5 text-[#68788a]">
              Score breakdown will appear after the
              Eco-Sort Score service returns its detailed
              factors.
            </div>
          )}

          <div className="mt-5 rounded-xl border border-[#dcebe1] bg-[#f5faf6] p-3">
            <div className="flex items-start gap-2">
              <Target
                size={15}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[#087443]"
              />

              <div>
                <p className="text-[10px] font-black text-[#087443]">
                  {nextLevelPoints !== null
                    ? `Next: ${nextLevel}`
                    : "Keep improving"}
                </p>

                <p className="mt-1 text-[9px] leading-4 text-[#68788a]">
                  {ecoScore?.points_to_next_level !=
                  null
                    ? `${ecoScore.points_to_next_level} score points needed for the next level.`
                    : "Keep scanning and sorting carefully to improve your score."}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[8px] leading-4 text-[#84908a]">
            Product metric based on AI confidence and
            sorting activity — not a measure of actual
            recycling accuracy.
          </p>

          <div className="mt-6 border-t border-[#e8ecef] pt-5">
            <NavLink
              to="/analytics"
              className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#087443] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
            >
              View Score Analytics
              <ArrowRight
                size={14}
                aria-hidden="true"
              />
            </NavLink>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOWER SECTION
      ====================================================== */}

      <section className="grid gap-5 px-5 pb-5 md:px-8 lg:grid-cols-[1.65fr_.9fr] lg:px-9">
        {/* ANALYTICS */}

        <div className="rounded-[18px] border border-[#e0e6e9] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#84909c]">
                Your activity
              </p>

              <h2 className="mt-1 text-[17px] font-black">
                Waste Analytics
              </h2>
            </div>

            <NavLink
              to="/analytics"
              className="flex items-center gap-1 rounded-md text-[10px] font-bold text-[#087443] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
            >
              View Analytics
              <ArrowRight
                size={13}
                aria-hidden="true"
              />
            </NavLink>
          </div>

          <div className="mt-5 grid items-center gap-6 md:grid-cols-[170px_1fr]">
            {/* DONUT */}

            <div
              className="relative mx-auto h-[155px] w-[155px]"
              aria-label={`Waste distribution: ${recyclable} recyclable, ${organic} organic, ${hazardous} hazardous`}
              role="img"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(
                    #3189d7 0 ${normalizedRecyclablePercentage}%,
                    #55a943 ${normalizedRecyclablePercentage}% ${
                      normalizedRecyclablePercentage +
                      normalizedOrganicPercentage
                    }%,
                    #ee7514 ${
                      normalizedRecyclablePercentage +
                      normalizedOrganicPercentage
                    }% ${
                      normalizedRecyclablePercentage +
                      normalizedOrganicPercentage +
                      normalizedHazardousPercentage
                    }%,
                    #d9dee3 ${
                      normalizedRecyclablePercentage +
                      normalizedOrganicPercentage +
                      normalizedHazardousPercentage
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

            {/* LEGEND */}

            <div className="space-y-4">
              <LegendRow
                color="#3189d7"
                label="Recyclable"
                value={recyclable}
                percentage={recyclablePercentage}
              />

              <LegendRow
                color="#55a943"
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

            {/* MOST COMMON */}

            <div className="rounded-xl bg-[#edf8f0] p-5 md:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white"
                    aria-hidden="true"
                  >
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

                <NavLink
                  to="/analytics"
                  aria-label="View detailed waste analytics"
                  className="rounded-lg p-2 text-[#087443] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443]"
                >
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                  />
                </NavLink>
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
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#84909c]">
                Keep going
              </p>

              <h2 className="mt-1 text-[17px] font-black">
                Gamification
              </h2>
            </div>

            <NavLink
              to="/gamification"
              className="flex items-center gap-1 rounded-md text-[10px] font-bold text-[#087443] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
            >
              View All
              <ArrowRight
                size={13}
                aria-hidden="true"
              />
            </NavLink>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div
              className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-4 border-[#d6a727] bg-[#eff7df]"
              aria-hidden="true"
            >
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
                {points} points ·{" "}
                {nextLevelPoints !== null
                  ? `Next: ${nextLevel}`
                  : "Max level"}
              </p>

              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#dce2e6]"
                aria-label={`Level progress ${levelProgress.toFixed(
                  0
                )}%`}
                role="progressbar"
                aria-valuenow={Math.round(
                  levelProgress
                )}
                aria-valuemin="0"
                aria-valuemax="100"
              >
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

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {badges.length > 0 ? (
                badges.slice(0, 3).map(
                  (badge, index) => (
                    <div
                      key={`${
                        typeof badge === "string"
                          ? badge
                          : badge?.name ||
                            badge?.title ||
                            "badge"
                      }-${index}`}
                      className="text-center"
                    >
                      <div
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#d8b73e] bg-[#fff9dd]"
                        aria-hidden="true"
                      >
                        <Trophy
                          size={20}
                          className="text-[#8ba542]"
                        />
                      </div>

                      <p className="mt-2 line-clamp-2 text-[8px] font-semibold">
                        {typeof badge === "string"
                          ? badge
                          : badge?.name ||
                            badge?.title ||
                            "Badge"}
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

          <NavLink
            to="/gamification"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#dcebe1] bg-[#f5faf6] px-4 py-3 text-[10px] font-bold text-[#087443] transition hover:bg-[#edf8f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
          >
            Explore Rewards & Badges
            <Trophy
              size={14}
              aria-hidden="true"
            />
          </NavLink>
        </div>
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <section
        className="grid gap-4 px-5 pb-5 md:grid-cols-3 md:px-8 lg:px-9"
        aria-label="Quick actions"
      >
        <QuickAction
          to="/scan"
          icon={Camera}
          title="Scan Waste"
          description="Identify a new waste item with AI."
        />

        <QuickAction
          to="/eco-impact"
          icon={Globe2}
          title="Eco Impact"
          description="See the environmental impact of your activity."
        />

        <QuickAction
          to="/history"
          icon={BarChart3}
          title="Scan History"
          description="Review your previous classifications."
        />
      </section>

      {/* =====================================================
          DISCLAIMER
      ====================================================== */}

      <div className="mx-5 mb-5 rounded-lg bg-[#033e35] px-5 py-3 text-[9px] leading-5 text-white md:mx-8 lg:mx-9">
        <Leaf
          size={14}
          aria-hidden="true"
          className="mr-2 inline text-[#64c96a]"
        />

        <strong>Disclaimer:</strong>{" "}
        AI predictions may not always be 100% accurate.
        Please verify before disposal. Eco Impact is an
        estimate, not a real-world measurement.
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD METRIC LINK
========================================================= */

function DashboardMetricLink({
  to,
  icon: Icon,
  iconClass,
  label,
  value,
  subtitle,
}) {
  return (
    <NavLink
      to={to}
      className="group rounded-[16px] border border-[#e1e6e9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
      aria-label={`${label}: ${value}. ${subtitle}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${iconClass}`}
            aria-hidden="true"
          >
            <Icon size={24} />
          </div>

          <div className="min-w-0">
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

        <ArrowRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-[#9aa7af] transition-transform group-hover:translate-x-0.5 group-hover:text-[#087443]"
        />
      </div>
    </NavLink>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#dfe7ed] bg-[#f7fafc] p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          aria-hidden="true"
          className="text-[#2377c7]"
        />

        <p className="text-[9px] font-bold text-[#718092]">
          {label}
        </p>
      </div>

      <p className="mt-2 text-[12px] font-black text-[#203247]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   NOTICE BOX
========================================================= */

function NoticeBox({
  type,
  title,
  message,
}) {
  const config = {
    warning: {
      wrapper:
        "border-[#f2c76d] bg-[#fff9e9]",
      icon: "text-[#ee7f0e]",
      title: "text-[#a84c00]",
      text: "text-[#a96325]",
    },
    hazard: {
      wrapper:
        "border-[#f3c8a2] bg-[#fff5eb]",
      icon: "text-[#e87918]",
      title: "text-[#a84d08]",
      text: "text-[#9b6339]",
    },
    success: {
      wrapper:
        "border-[#ccebd5] bg-[#f0faf3]",
      icon: "text-[#168b4c]",
      title: "text-[#087443]",
      text: "text-[#5d7667]",
    },
  };

  const styles =
    config[type] || config.success;

  const Icon =
    type === "success"
      ? ShieldCheck
      : AlertTriangle;

  return (
    <div
      className={`mt-4 rounded-xl border p-4 ${styles.wrapper}`}
    >
      <div className="flex gap-3">
        <Icon
          size={18}
          aria-hidden="true"
          className={`mt-0.5 shrink-0 ${styles.icon}`}
        />

        <div>
          <p
            className={`text-[11px] font-black ${styles.title}`}
          >
            {title}
          </p>

          <p
            className={`mt-1.5 text-[9px] leading-4 ${styles.text}`}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SCORE FACTOR
========================================================= */

function ScoreFactor({
  label,
  value,
  weight,
  description,
}) {
  const safeValue = clamp(
    Number(value) || 0,
    0,
    100
  );

  const safeWeight = Math.max(
    0,
    Number(weight) || 0
  );

  const weightedContribution =
    (safeValue * safeWeight) / 100;

  return (
    <div className="mt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
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
          className="h-3 w-3 shrink-0 rounded-full"
          style={{
            background: color,
          }}
          aria-hidden="true"
        />

        <span className="text-[11px] font-semibold">
          {label}
        </span>
      </div>

      <span className="text-[10px] text-[#536171]">
        {value}

        <span className="text-[#7a8793]">
          {" "}
          (
          {clamp(
            Number(percentage) || 0,
            0,
            100
          ).toFixed(0)}
          %)
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
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#d8b73e] bg-[#fff9dd]"
        aria-hidden="true"
      >
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
   QUICK ACTION
========================================================= */

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
}) {
  return (
    <NavLink
      to={to}
      className="group rounded-[16px] border border-[#dfe7e2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf7ee] text-[#087443]"
          aria-hidden="true"
        >
          <Icon size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-black">
            {title}
          </p>

          <p className="mt-1 text-[9px] leading-4 text-[#74818d]">
            {description}
          </p>
        </div>

        <ArrowRight
          size={15}
          aria-hidden="true"
          className="shrink-0 text-[#a0aaa9] transition-transform group-hover:translate-x-0.5 group-hover:text-[#087443]"
        />
      </div>
    </NavLink>
  );
}

/* =========================================================
   EMPTY SCAN
========================================================= */

function EmptyScan() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf7ee]"
        aria-hidden="true"
      >
        <ScanLine
          size={30}
          className="text-[#15904d]"
        />
      </div>

      <h3 className="mt-5 text-lg font-black">
        No scans yet
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-[#758291]">
        Start your first waste scan and your latest
        result will appear here.
      </p>

      <NavLink
        to="/scan"
        className="mt-5 rounded-xl bg-[#087443] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#096239] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
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
    return Math.round(
      recyclablePercentage
    );
  }

  if (
    organic >= recyclable &&
    organic >= hazardous
  ) {
    return Math.round(
      organicPercentage
    );
  }

  return Math.round(
    hazardousPercentage
  );
}

/* =========================================================
   NUMBER HELPERS
========================================================= */

function clamp(value, min, max) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return min;
  }

  return Math.min(
    max,
    Math.max(min, numericValue)
  );
}