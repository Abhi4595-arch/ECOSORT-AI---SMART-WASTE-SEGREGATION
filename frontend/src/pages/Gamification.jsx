import { useEffect, useState } from "react";
import {
  Trophy,
  Flame,
  Star,
  Leaf,
  ScanLine,
  Recycle,
  Target,
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { apiJson } from "../utils/api";
import PageLoading from "../components/PageLoading";
import RetryState from "../components/RetryState";

export default function Gamification() {
  const [data, setData] = useState(null);
  const [ecoScore, setEcoScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadGamification() {
      setLoading(true);
      setError("");

      try {
        const [result, scoreResult] = await Promise.all([
          apiJson("/gamification"),
          apiJson("/eco-score"),
        ]);

        if (!mounted) {
          return;
        }

        setData(result || {});
        setEcoScore(scoreResult || {});
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        console.error(
          "Gamification loading error:",
          requestError
        );

        setError(
          requestError?.message ||
            "Unable to load gamification right now."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadGamification();

    return () => {
      mounted = false;
    };
  }, [retryCount]);

  if (loading) {
    return (
      <PageLoading label="Loading your progress…" />
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f5f7f9] px-4 py-7 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <RetryState
            title="Gamification unavailable"
            message={
              error ||
              "No progress data is available yet."
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

  const points = Math.max(
    0,
    safeNumber(data.points)
  );

  const level =
    data.level || "Eco Explorer";

  const totalScans = Math.max(
    0,
    safeNumber(data.total_scans)
  );

  const streak = Math.max(
    0,
    safeNumber(data.current_streak)
  );

  const badges = Array.isArray(data.badges)
    ? data.badges
    : [];

  const backendNextLevelPoints =
    data.next_level_points ??
    data.nextLevelPoints ??
    null;

  const nextLevelPoints =
    backendNextLevelPoints === null
      ? null
      : Math.max(
          0,
          safeNumber(
            backendNextLevelPoints
          )
        );

  const pointsToNext = Math.max(
    0,
    safeNumber(
      data.points_to_next_level ??
        data.pointsToNextLevel ??
        0
    )
  );

  const levelProgress = clamp(
    safeNumber(data.progress_percentage),
    0,
    100
  );

  const nextLevel =
    data.next_level ||
    "Maximum level reached";

  const pointRules =
    data.point_rules &&
    typeof data.point_rules === "object"
      ? data.point_rules
      : {};

  const badgeRules =
    data.badge_rules &&
    typeof data.badge_rules === "object"
      ? data.badge_rules
      : {};

  const score = Math.round(
    clamp(
      safeNumber(
        ecoScore?.eco_sort_score ??
          ecoScore?.score ??
          0
      ),
      0,
      100
    )
  );

  const unlockedBadges = badges.filter(
    (badge) =>
      badge?.unlocked === true ||
      badge?.completed === true ||
      (typeof badge === "string" &&
        badge.length > 0)
  ).length;

  const badgeProgress = badges.length
    ? Math.round(
        (unlockedBadges / badges.length) *
          100
      )
    : 0;

  const milestone = getMilestone(points);

  const milestoneProgress = clamp(
    (points / milestone.target) * 100,
    0,
    100
  );

  const milestoneRemaining = Math.max(
    milestone.target - points,
    0
  );

  /*
   * Badge definitions are inexpensive static data.
   * They do not need useMemo().
   *
   * Keeping this as a normal value also ensures
   * there are no hooks after conditional returns.
   */
  const badgeDefinitions = [
    {
      title: "First Scan",
      requirement: badgeRules["First Scan"],
      description:
        "Complete your first waste scan.",
      icon: ScanLine,
    },
    {
      title: "Waste Watcher",
      requirement:
        badgeRules["Waste Watcher"],
      description:
        "Keep scanning different waste items.",
      icon: Target,
    },
    {
      title: "Sorting Pro",
      requirement:
        badgeRules["Sorting Pro"],
      description:
        "Build consistent sorting activity.",
      icon: Recycle,
    },
    {
      title: "Compost Champion",
      requirement:
        badgeRules["Compost Champion"],
      description:
        "Identify and sort organic waste.",
      icon: Leaf,
    },
  ];

  return (
    <div className="eco-app-page min-h-screen bg-[#f5f7f9] text-[#111c2c]">
      <main
        className="mx-auto max-w-[1200px] px-4 py-7 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10"
        aria-labelledby="gamification-page-title"
      >
        {/* HEADER */}
        <section aria-labelledby="gamification-page-title">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9ead6] bg-[#effaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
            <Trophy
              size={14}
              aria-hidden="true"
            />
            Eco rewards
          </div>

          <h1
            id="gamification-page-title"
            className="mt-5 text-[32px] font-black tracking-[-0.05em] sm:text-[38px] md:text-[48px]"
          >
            Gamification
          </h1>

          <p className="mt-3 max-w-[650px] text-[14px] leading-6 text-[#68788b]">
            Turn better waste-sorting habits into
            points, badges, streaks, and progress.
          </p>
        </section>

        {/* PROFILE / LEVEL HERO */}
        <section
          className="mt-8"
          aria-label="Current level"
        >
          <div className="relative overflow-hidden rounded-[24px] bg-[#033e35] p-7 text-white shadow-lg md:p-9">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#087443]/30 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#64c96a] text-[#033e35] shadow-lg"
                    aria-hidden="true"
                  >
                    <Trophy size={29} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#9ed9b0]">
                      Current Level
                    </p>

                    <h2 className="mt-1 text-[27px] font-black">
                      {level}
                    </h2>
                  </div>
                </div>

                <p className="mt-5 text-[12px] leading-6 text-[#c4d8d1]">
                  Keep scanning waste and making
                  better sorting decisions to earn more
                  Eco-Sort points.
                </p>

                {/* PROGRESS */}
                <div className="mt-6 max-w-[600px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-[#a7cfc0]">
                      Level progress
                    </span>

                    <span className="text-right text-[10px] font-black text-white">
                      {points} /{" "}
                      {nextLevelPoints !== null
                        ? nextLevelPoints
                        : "MAX"}{" "}
                      pts
                    </span>
                  </div>

                  <div
                    className="mt-2 h-3 overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-label="Level progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={levelProgress}
                  >
                    <div
                      className="h-full rounded-full bg-[#64c96a] transition-all duration-700"
                      style={{
                        width: `${levelProgress}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-[9px] text-[#8ebaae]">
                    {nextLevelPoints !== null
                      ? `${pointsToNext} points to the next level`
                      : "Highest level reached"}
                  </p>
                </div>
              </div>

              {/* POINTS */}
              <div
                className="flex h-40 w-40 shrink-0 flex-col items-center justify-center self-center rounded-full border-[10px] border-[#64c96a]/25 bg-white/5 md:self-auto"
                aria-label={`${points} Eco Points`}
              >
                <Star
                  size={20}
                  className="text-[#64c96a]"
                  aria-hidden="true"
                />

                <span className="mt-2 text-[40px] font-black leading-none">
                  {points}
                </span>

                <span className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#a7cfc0]">
                  Eco Points
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section
          className="mt-5 grid gap-4 sm:grid-cols-3"
          aria-label="Gamification statistics"
        >
          <GamificationStat
            icon={Star}
            label="Eco Points"
            value={points}
            description="Points earned"
            iconClass="bg-[#fff6d9] text-[#d99b16]"
          />

          <GamificationStat
            icon={Flame}
            label="Activity Streak"
            value={streak}
            description="Scan activity streak"
            iconClass="bg-[#fff0df] text-[#e87918]"
          />

          <GamificationStat
            icon={ScanLine}
            label="Total Scans"
            value={totalScans}
            description="Waste items analyzed"
            iconClass="bg-[#e8f7ef] text-[#087443]"
          />
        </section>

        {/* ECO-SORT SCORE CONNECTION */}
        <section className="mt-5 rounded-[20px] border border-[#dceee2] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]"
                aria-hidden="true"
              >
                <Leaf size={20} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
                  Eco-Sort Score
                </p>

                <h2 className="mt-1 text-[21px] font-black">
                  {score} / 100
                </h2>
              </div>
            </div>

            <div className="rounded-xl bg-[#f3faf5] px-4 py-3 sm:text-right">
              <p className="text-[9px] text-[#718092]">
                Score status
              </p>

              <p className="mt-1 text-[12px] font-black text-[#087443]">
                {ecoScore?.level || level}
              </p>
            </div>
          </div>

          {ecoScore?.score_breakdown ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ScoreFactor
                label="AI Confidence"
                value={
                  ecoScore.score_breakdown
                    .ai_confidence
                }
                weight={
                  ecoScore.weights
                    ?.ai_confidence ?? 50
                }
              />

              <ScoreFactor
                label="Sorting Reliability"
                value={
                  ecoScore.score_breakdown
                    .sorting_reliability
                }
                weight={
                  ecoScore.weights
                    ?.sorting_reliability ?? 25
                }
              />

              <ScoreFactor
                label="Safe Handling"
                value={
                  ecoScore.score_breakdown
                    .safe_handling
                }
                weight={
                  ecoScore.weights
                    ?.safe_handling ?? 15
                }
              />

              <ScoreFactor
                label="Consistency"
                value={
                  ecoScore.score_breakdown
                    .consistency
                }
                weight={
                  ecoScore.weights
                    ?.consistency ?? 10
                }
              />
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-[#fafbfb] p-4 text-[9px] leading-5 text-[#7b8793]">
              Your detailed Eco-Sort Score factors
              will appear here when the score service
              returns them.
            </p>
          )}

          <p className="mt-5 text-[9px] leading-5 text-[#89958f]">
            The score is a product engagement metric
            based on AI confidence, sorting reliability,
            safe-handling signals, and consistency.
          </p>
        </section>

        {/* PROGRESSION */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          {/* MILESTONE */}
          <div className="rounded-[22px] border border-[#dfe7e2] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#89958f]">
                  Next milestone
                </p>

                <h2 className="mt-1 text-[22px] font-black tracking-[-0.03em] text-[#17251e]">
                  {milestone.label}
                </h2>

                <p className="mt-1 text-[10px] leading-5 text-[#74817b]">
                  {milestoneRemaining > 0
                    ? `${milestoneRemaining} Eco-Sort points to go`
                    : "Milestone reached — keep building your habit."}
                </p>
              </div>

              <div className="rounded-xl bg-[#eaf7ef] px-3 py-2 text-right">
                <p className="text-[18px] font-black text-[#087443]">
                  {points}
                </p>

                <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#5d7668]">
                  points
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[9px] font-bold text-[#7d8984]">
                <span>Milestone progress</span>
                <span>
                  {Math.round(
                    milestoneProgress
                  )}
                  %
                </span>
              </div>

              <div
                className="h-3 overflow-hidden rounded-full bg-[#e8eeeb]"
                role="progressbar"
                aria-label="Milestone progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={milestoneProgress}
              >
                <div
                  className="h-full rounded-full bg-[#087443] transition-all duration-700"
                  style={{
                    width: `${milestoneProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* ACHIEVEMENT PROGRESS */}
          <div className="rounded-[22px] border border-[#dfe7e2] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#89958f]">
                  Achievement progress
                </p>

                <h2 className="mt-1 text-[22px] font-black tracking-[-0.03em] text-[#17251e]">
                  {unlockedBadges}/
                  {badges.length}
                </h2>

                <p className="mt-1 text-[10px] leading-5 text-[#74817b]">
                  badges unlocked
                </p>
              </div>

              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff4d9] text-[#c78212]"
                aria-hidden="true"
              >
                <Award size={20} />
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[9px] font-bold text-[#7d8984]">
                <span>Badge completion</span>
                <span>
                  {badgeProgress}%
                </span>
              </div>

              <div
                className="h-3 overflow-hidden rounded-full bg-[#ecefed]"
                role="progressbar"
                aria-label="Badge completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={badgeProgress}
              >
                <div
                  className="h-full rounded-full bg-[#c78212] transition-all duration-700"
                  style={{
                    width: `${badgeProgress}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-[#66736d]">
              <Flame
                size={13}
                className="text-[#e87918]"
                aria-hidden="true"
              />

              {streak > 0
                ? `${streak}-day streak — keep it going!`
                : "Start a streak with your next scan."}
            </div>
          </div>
        </section>

        {/* BADGES */}
        <section className="mt-7 rounded-[20px] border border-[#e1e6e9] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
                Achievements
              </p>

              <h2 className="mt-2 text-[23px] font-black tracking-[-0.03em]">
                Your Eco Badges
              </h2>

              <p className="mt-1 text-[11px] text-[#7b8793]">
                Keep building your collection.
              </p>
            </div>

            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff6d9] text-[#d99b16]"
              aria-hidden="true"
            >
              <Award size={21} />
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {badgeDefinitions.map(
              (badge) => (
                <BadgeCard
                  key={badge.title}
                  title={badge.title}
                  requirement={
                    badge.requirement
                  }
                  description={
                    badge.description
                  }
                  icon={badge.icon}
                  unlocked={hasBadge(
                    badges,
                    badge.title
                  )}
                />
              )
            )}
          </div>
        </section>

        {/* ACTIVITY ROADMAP */}
        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* POINT SYSTEM */}
          <div className="rounded-[20px] border border-[#e1e6e9] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]"
                aria-hidden="true"
              >
                <Sparkles size={20} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
                  How it works
                </p>

                <h2 className="mt-1 text-[21px] font-black">
                  Earn Eco Points
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <PointRow
                icon={ScanLine}
                title="High-confidence scan"
                points={`+${safeRule(
                  pointRules.high_confidence_scan,
                  10
                )}`}
              />

              <PointRow
                icon={Target}
                title="Low-confidence scan / review required"
                points={`+${safeRule(
                  pointRules.review_required_scan,
                  5
                )}`}
              />

              <PointRow
                icon={Recycle}
                title="Recyclable high-confidence bonus"
                points={`+${safeRule(
                  pointRules.recyclable_bonus,
                  5
                )}`}
              />

              <PointRow
                icon={Leaf}
                title="Organic high-confidence bonus"
                points={`+${safeRule(
                  pointRules.organic_bonus,
                  3
                )}`}
              />

              <PointRow
                icon={Flame}
                title="Hazardous high-confidence bonus"
                points={`+${safeRule(
                  pointRules.hazardous_bonus,
                  5
                )}`}
              />
            </div>
          </div>

          {/* LEVEL ROADMAP */}
          <div className="rounded-[20px] border border-[#e1e6e9] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e1efff] text-[#3189d7]"
                aria-hidden="true"
              >
                <Trophy size={20} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
                  Progression
                </p>

                <h2 className="mt-1 text-[21px] font-black">
                  Eco Journey
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <LevelRow
                number="01"
                title="Eco Beginner"
                description="0+ points — start your sorting journey"
                active={
                  level === "Eco Beginner"
                }
              />

              <LevelRow
                number="02"
                title="Eco Explorer"
                description="100+ points — build consistent activity"
                active={
                  level === "Eco Explorer"
                }
              />

              <LevelRow
                number="03"
                title="Eco Champion"
                description="250+ points — become a sorting champion"
                active={
                  level === "Eco Champion"
                }
              />

              <LevelRow
                number="04"
                title="Eco Legend"
                description="500+ points — reach the highest level"
                active={
                  level === "Eco Legend"
                }
              />
            </div>
          </div>
        </section>

        {/* NEXT LEVEL PROGRESS */}
        <section className="mt-5 rounded-[20px] border border-[#dceee2] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
                Next milestone
              </p>

              <h2 className="mt-1 text-[21px] font-black">
                {nextLevel}
              </h2>
            </div>

            <p className="text-[11px] font-bold text-[#687581] sm:text-right">
              {nextLevelPoints !== null
                ? `${pointsToNext} points to go · ${Math.round(
                    levelProgress
                  )}% progress`
                : "All levels completed"}
            </p>
          </div>

          <div
            className="mt-5 h-2 overflow-hidden rounded-full bg-[#e7ece9]"
            role="progressbar"
            aria-label="Next level progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={levelProgress}
          >
            <div
              className="h-full rounded-full bg-[#087443] transition-all duration-700"
              style={{
                width: `${levelProgress}%`,
              }}
            />
          </div>
        </section>

        {/* MOTIVATION */}
        <section className="mt-5 rounded-[20px] border border-[#dceee2] bg-[#f3faf5] p-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dff2e5] text-[#087443]"
              aria-hidden="true"
            >
              <Leaf size={23} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
                Keep going
              </p>

              <h3 className="mt-1 text-[17px] font-black text-[#173d2d]">
                Every scan counts toward a cleaner
                future.
              </h3>

              <p className="mt-2 text-[11px] leading-5 text-[#667a6e]">
                Continue identifying waste correctly,
                maintain your activity streak, and
                unlock more achievements as you use
                Eco-Sort AI.
              </p>
            </div>
          </div>
        </section>

        {/* DISCLAIMER */}
        <div
          className="mt-7 flex items-start gap-3 rounded-xl bg-[#033e35] px-5 py-4 text-[10px] leading-5 text-white"
          role="note"
        >
          <Leaf
            size={16}
            className="mt-0.5 shrink-0 text-[#64c96a]"
            aria-hidden="true"
          />

          <p>
            <strong>Eco-Sort AI:</strong>{" "}
            Gamification features are designed to
            encourage consistent waste-sorting
            activity. Points, streaks, levels, and
            badges are product engagement metrics.
          </p>
        </div>
      </main>
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
}) {
  const safeValue = clamp(
    safeNumber(value),
    0,
    100
  );

  const safeWeight = Math.max(
    0,
    safeNumber(weight)
  );

  return (
    <div className="rounded-xl border border-[#edf0f1] bg-[#fafbfb] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black text-[#34414c]">
            {label}
          </p>

          <p className="mt-1 text-[8px] text-[#8995a1]">
            {safeWeight}% of score
          </p>
        </div>

        <span className="text-[12px] font-black text-[#087443]">
          {Math.round(safeValue)}%
        </span>
      </div>

      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e1e6e9]"
        role="progressbar"
        aria-label={`${label} score`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
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
   STAT CARD
========================================================= */

function GamificationStat({
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
   BADGE CARD
========================================================= */

function BadgeCard({
  title,
  description,
  requirement,
  icon: Icon,
  unlocked,
}) {
  return (
    <div
      className={`rounded-[17px] border p-5 transition duration-200 ${
        unlocked
          ? "border-[#d5eadc] bg-[#f8fcf9] hover:-translate-y-0.5 hover:shadow-sm"
          : "border-[#e5e8ea] bg-[#fafbfb]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            unlocked
              ? "bg-[#e1f3e6] text-[#087443]"
              : "bg-[#edf0f1] text-[#9aa4ad]"
          }`}
          aria-hidden="true"
        >
          <Icon size={22} />
        </div>

        {unlocked ? (
          <CheckCircle2
            size={17}
            className="text-[#15904d]"
            aria-label="Unlocked"
          />
        ) : (
          <Lock
            size={16}
            className="text-[#a1a9af]"
            aria-label="Locked"
          />
        )}
      </div>

      <h3
        className={`mt-5 text-[14px] font-black ${
          unlocked
            ? "text-[#183d2d]"
            : "text-[#66717a]"
        }`}
      >
        {title}
      </h3>

      <p className="mt-2 text-[9px] leading-5 text-[#7b8793]">
        {description}
      </p>

      {requirement && (
        <p className="mt-2 text-[8px] font-semibold text-[#9aa4ad]">
          Requirement: {requirement}
        </p>
      )}

      <p
        className={`mt-4 text-[9px] font-bold ${
          unlocked
            ? "text-[#087443]"
            : "text-[#a0a8ae]"
        }`}
      >
        {unlocked ? "UNLOCKED" : "LOCKED"}
      </p>
    </div>
  );
}

/* =========================================================
   POINT ROW
========================================================= */

function PointRow({
  icon: Icon,
  title,
  points,
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#edf0f1] bg-[#fafbfb] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf7ef] text-[#087443]"
          aria-hidden="true"
        >
          <Icon size={17} />
        </div>

        <span className="text-[11px] font-bold text-[#43515f]">
          {title}
        </span>
      </div>

      <span className="shrink-0 text-[12px] font-black text-[#087443]">
        {points}
      </span>
    </div>
  );
}

/* =========================================================
   LEVEL ROW
========================================================= */

function LevelRow({
  number,
  title,
  description,
  active,
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        active
          ? "border-[#cfe7d7] bg-[#f3faf5]"
          : "border-[#edf0f1] bg-[#fafbfb]"
      }`}
      aria-current={
        active ? "step" : undefined
      }
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[9px] font-black ${
          active
            ? "bg-[#087443] text-white"
            : "bg-[#edf0f1] text-[#8a949c]"
        }`}
        aria-hidden="true"
      >
        {number}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[11px] font-black ${
            active
              ? "text-[#087443]"
              : "text-[#4d5963]"
          }`}
        >
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-[#8995a1]">
          {description}
        </p>
      </div>

      {active && (
        <span className="shrink-0 rounded-full bg-[#dff2e5] px-2.5 py-1 text-[8px] font-black text-[#087443]">
          CURRENT
        </span>
      )}
    </div>
  );
}

/* =========================================================
   BADGE CHECK
========================================================= */

function hasBadge(
  badges,
  badgeName
) {
  const target = badgeName.toLowerCase();

  return badges.some((badge) => {
    if (typeof badge === "string") {
      return (
        badge.toLowerCase() === target
      );
    }

    return (
      badge?.name?.toLowerCase() ===
        target ||
      badge?.title?.toLowerCase() ===
        target
    );
  });
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

function clamp(
  value,
  min,
  max
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function safeRule(
  value,
  fallback
) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function getMilestone(points) {
  const milestones = [
    {
      target: 50,
      label: "Eco Starter",
    },
    {
      target: 100,
      label: "Green Habit",
    },
    {
      target: 250,
      label: "Eco Champion",
    },
    {
      target: 500,
      label: "Waste Warrior",
    },
    {
      target: 1000,
      label: "Planet Protector",
    },
  ];

  const nextMilestone = milestones.find(
    (milestone) => points < milestone.target
  );

  return nextMilestone || milestones[milestones.length - 1];
}