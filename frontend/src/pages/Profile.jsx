import { useEffect, useState } from "react";
import {
  User,
  Leaf,
  Trophy,
  ScanLine,
  Target,
  ShieldCheck,
  Settings,
  ChevronRight,
  Award,
  AlertTriangle,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { API_URL } from "../config";

export default function Profile() {
  const [analytics, setAnalytics] = useState(null);
  const [ecoScore, setEcoScore] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [
          analyticsResponse,
          scoreResponse,
          gamificationResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/analytics`),
          fetch(`${API_URL}/eco-score`),
          fetch(`${API_URL}/gamification`),
        ]);

        const analyticsData =
          await analyticsResponse.json();

        const scoreData =
          await scoreResponse.json();

        const gamificationData =
          await gamificationResponse.json();

        setAnalytics(analyticsData);
        setEcoScore(scoreData);
        setGamification(gamificationData);
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    );
  }

  const totalScans =
    analytics?.total_scans ??
    gamification?.total_scans ??
    0;

  const score =
    Number(
      ecoScore?.eco_sort_score ??
        ecoScore?.score ??
        0
    );

  const level =
    ecoScore?.level ||
    gamification?.level ||
    "Eco Explorer";

  const badges =
    gamification?.badges || [];

  const badgeCount = badges.length;

  const scoreBreakdown = ecoScore?.score_breakdown || {};
  const scoreWeights = ecoScore?.weights || {};

  const nextLevel =
    gamification?.next_level ||
    ecoScore?.next_level ||
    "Maximum level reached";

  const pointsToNextLevel =
    gamification?.points_to_next_level ??
    ecoScore?.points_to_next_level ??
    null;

  const gamificationProgress = Math.min(
    100,
    Math.max(0, Number(gamification?.progress_percentage ?? 0))
  );

  const gamificationPoints = gamification?.points ?? 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#f5f7f9] text-[#111c2c]">

        <main className="mx-auto max-w-[1100px] px-5 py-10 md:px-8 lg:px-10">

          {/* HEADER */}
          <section>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9ead6] bg-[#effaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
              <User size={14} />
              Your profile
            </div>

            <h1 className="mt-5 text-[38px] font-black tracking-[-0.05em] md:text-[48px]">
              Profile
            </h1>

            <p className="mt-3 max-w-[600px] text-[14px] leading-6 text-[#68788b]">
              Manage your Eco-Sort identity and view your
              environmental progress.
            </p>

          </section>

          {/* PROFILE CARD */}
          <section className="mt-8">

            <div className="overflow-hidden rounded-[24px] border border-[#dce5e0] bg-white shadow-sm">

              <div className="relative h-[145px] overflow-hidden bg-[#033e35]">

                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#087443]/30 blur-3xl" />

                <div className="absolute -bottom-20 left-[35%] h-48 w-48 rounded-full bg-[#64c96a]/10 blur-3xl" />

              </div>

              <div className="relative px-6 pb-7 md:px-8">

                <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                  <div className="flex items-end gap-4">

                    <div className="flex h-24 w-24 items-center justify-center rounded-[24px] border-[6px] border-white bg-[#087443] text-white shadow-lg">
                      <User size={39} />
                    </div>

                    <div className="pb-1">

                      <h2 className="text-[23px] font-black">
                        Eco Warrior
                      </h2>

                      <p className="mt-1 text-[11px] text-[#7b8793]">
                        Eco-Sort AI member
                      </p>

                    </div>

                  </div>

                  <NavLink
                    to="/settings"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe5e7] bg-white px-4 py-2.5 text-[10px] font-bold text-[#4d5963] transition hover:border-[#b8d8c2] hover:bg-[#f3faf5] hover:text-[#087443]"
                  >
                    <Settings size={14} />
                    Settings
                  </NavLink>

                </div>

              </div>

            </div>

          </section>

          {/* PROFILE METRICS */}
          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <ProfileMetric
              icon={Leaf}
              label="Eco-Sort Score"
              value={score}
              description={level}
            />

            <ProfileMetric
              icon={ScanLine}
              label="Total Scans"
              value={totalScans}
              description="Waste analyzed"
            />

            <ProfileMetric
              icon={Award}
              label="Badges"
              value={badgeCount}
              description="Achievements unlocked"
            />

            <ProfileMetric
              icon={Target}
              label="Current Level"
              value={level}
              description="Keep progressing"
              smallValue
            />

          </section>

          {/* PROFILE INFORMATION */}
          <section className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.8fr]">

            {/* ACCOUNT */}
            <div className="rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]">
                  <User size={20} />
                </div>

                <div>

                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
                    Account
                  </p>

                  <h2 className="mt-1 text-[21px] font-black">
                    Profile Information
                  </h2>

                </div>

              </div>

              <div className="mt-6 space-y-4">

                <InfoRow
                  label="Display Name"
                  value="Eco Warrior"
                />

                <InfoRow
                  label="Email"
                  value="eco-warrior@example.com"
                />

                <InfoRow
                  label="Total Scans"
                  value={`${totalScans} scans`}
                />

              </div>

            </div>

            {/* ECO STATUS */}
            <div className="rounded-[20px] border border-[#dceee2] bg-[#f3faf5] p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dff2e5] text-[#087443]">
                  <Leaf size={20} />
                </div>

                <div>

                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
                    Eco Status
                  </p>

                  <h2 className="mt-1 text-[21px] font-black text-[#173d2d]">
                    {level}
                  </h2>

                </div>

              </div>

              <p className="mt-5 text-[11px] leading-5 text-[#667a6e]">
                Your current Eco-Sort Score is{" "}
                <strong>{score}</strong>. Continue scanning
                waste and making informed disposal decisions
                to improve your progress.
              </p>

              <NavLink
                to="/gamification"
                className="mt-5 inline-flex items-center gap-2 text-[10px] font-black text-[#087443] transition hover:gap-3"
              >
                View achievements
                <ChevronRight size={14} />
              </NavLink>

            </div>

          </section>

          {/* ECO-SORT SCORE BREAKDOWN */}
          <section className="mt-5 rounded-[20px] border border-[#dceee2] bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
                  Score details
                </p>

                <h2 className="mt-2 text-[21px] font-black">
                  How your Eco-Sort Score is built
                </h2>

                <p className="mt-2 max-w-[650px] text-[10px] leading-5 text-[#718092]">
                  Your score combines AI confidence, reliable scan results,
                  safe-handling signals, and consistent activity.
                </p>
              </div>

              <div className="rounded-xl bg-[#eff9f2] px-4 py-3 text-left sm:text-right">
                <p className="text-[9px] font-bold text-[#6d7f74]">
                  Next level
                </p>
                <p className="mt-1 text-[13px] font-black text-[#087443]">
                  {nextLevel}
                </p>
                {pointsToNextLevel !== null && (
                  <p className="mt-1 text-[8px] text-[#728278]">
                    {pointsToNextLevel} points needed
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#dcebe1] bg-[#f5faf6] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#087443]">
                    Gamification Progress
                  </p>
                  <p className="mt-1 text-[12px] font-black text-[#173d2d]">
                    {gamificationPoints} points · {nextLevel}
                  </p>
                </div>
                <span className="text-[10px] font-black text-[#087443]">
                  {Math.round(gamificationProgress)}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dfe8e2]">
                <div
                  className="h-full rounded-full bg-[#168b4c] transition-all duration-700"
                  style={{ width: `${gamificationProgress}%` }}
                />
              </div>
              <p className="mt-2 text-[8px] text-[#728278]">
                {pointsToNextLevel !== null
                  ? `${pointsToNextLevel} points needed for the next level.`
                  : "You have reached the highest level."}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ProfileScoreFactor
                label="AI Confidence"
                value={scoreBreakdown.ai_confidence ?? 0}
                weight={scoreWeights.ai_confidence ?? 50}
                description="Average confidence across your scans."
              />

              <ProfileScoreFactor
                label="Sorting Reliability"
                value={scoreBreakdown.sorting_reliability ?? 0}
                weight={scoreWeights.sorting_reliability ?? 25}
                description="Share of scans that did not require review."
              />

              <ProfileScoreFactor
                label="Safe Handling"
                value={scoreBreakdown.safe_handling ?? 0}
                weight={scoreWeights.safe_handling ?? 15}
                description="Safety signals associated with your scan results."
              />

              <ProfileScoreFactor
                label="Consistency"
                value={scoreBreakdown.consistency ?? 0}
                weight={scoreWeights.consistency ?? 10}
                description="Rewards continued use of the scanning workflow."
              />
            </div>

            <div className="mt-5 rounded-xl bg-[#f8faf9] p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={14}
                  className="mt-0.5 shrink-0 text-[#9b7a16]"
                />

                <p className="text-[9px] leading-5 text-[#758291]">
                  <strong className="text-[#4d5d54]">Important:</strong>{" "}
                  Eco-Sort Score is a product metric based on AI confidence
                  and app activity. It is not a measurement of actual
                  recycling accuracy or environmental impact.
                </p>
              </div>
            </div>
          </section>

          {/* BADGE PREVIEW */}
          <section className="mt-5 rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
                  Achievements
                </p>

                <h2 className="mt-2 text-[21px] font-black">
                  Your Badges
                </h2>

              </div>

              <NavLink
                to="/gamification"
                className="text-[10px] font-black text-[#087443]"
              >
                View all →
              </NavLink>

            </div>

            {badges.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-3">

                {badges.map((badge, index) => {

                  const badgeName =
                    typeof badge === "string"
                      ? badge
                      : badge?.name || "Eco Badge";

                  return (
                    <div
                      key={`${badgeName}-${index}`}
                      className="flex items-center gap-2 rounded-xl border border-[#dceee2] bg-[#f3faf5] px-4 py-3"
                    >

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dff2e5] text-[#087443]">
                        <Award size={16} />
                      </div>

                      <span className="text-[10px] font-bold text-[#315342]">
                        {badgeName}
                      </span>

                    </div>
                  );
                })}

              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-[#fafbfb] p-5 text-center">

                <Award
                  size={24}
                  className="mx-auto text-[#a0a9af]"
                />

                <p className="mt-3 text-[11px] font-bold">
                  No badges yet
                </p>

                <p className="mt-1 text-[9px] text-[#8995a1]">
                  Start scanning to unlock achievements.
                </p>

              </div>
            )}

          </section>

          {/* QUICK ACTIONS */}
          <section className="mt-5 rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm">

            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8995a1]">
                Quick Access
              </p>

              <h2 className="mt-2 text-[21px] font-black">
                Continue your journey
              </h2>

            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              <QuickAction
                to="/scan"
                icon={ScanLine}
                title="Scan Waste"
                description="Identify a new waste item."
              />

              <QuickAction
                to="/history"
                icon={ShieldCheck}
                title="Scan History"
                description="Review previous results."
              />

              <QuickAction
                to="/gamification"
                icon={Trophy}
                title="Achievements"
                description="View your badges and points."
              />

            </div>

          </section>

          {/* PRIVACY */}
          <section className="mt-5 rounded-[18px] border border-[#e1e6e9] bg-white p-5 shadow-sm">

            <div className="flex items-start gap-3">

              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#087443]"
              />

              <div>

                <h3 className="text-[12px] font-black">
                  Your data
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-[#758291]">
                  Your scan activity powers your history,
                  analytics, Eco-Sort Score, and gamification
                  features.
                </p>

              </div>

            </div>

          </section>

          {/* FOOTER */}
          <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#033e35] px-5 py-4 text-[10px] leading-5 text-white">

            <Leaf
              size={16}
              className="mt-0.5 shrink-0 text-[#64c96a]"
            />

            <p>
              <strong>Eco-Sort AI:</strong>{" "}
              Your journey starts with one scan. Keep learning,
              keep sorting, and keep making every scan count.
            </p>

          </div>

        </main>
      </div>
    </AppLayout>
  );
}


/* =========================================================
   PROFILE SCORE FACTOR
========================================================= */

function ProfileScoreFactor({
  label,
  value,
  weight,
  description,
}) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const safeWeight = Math.max(0, Number(weight) || 0);

  return (
    <div className="rounded-xl border border-[#edf1ef] bg-[#fbfcfb] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-black text-[#263b32]">
              {label}
            </p>

            <span className="rounded-full bg-[#eaf7ef] px-2 py-0.5 text-[8px] font-black text-[#087443]">
              {safeWeight}% weight
            </span>
          </div>

          <p className="mt-1 text-[9px] leading-4 text-[#7b8793]">
            {description}
          </p>
        </div>

        <span className="shrink-0 text-[13px] font-black text-[#087443]">
          {Math.round(safeValue)}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e2e8e4]">
        <div
          className="h-full rounded-full bg-[#168b4c] transition-all duration-700"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}


/* =========================================================
   PROFILE METRIC
========================================================= */

function ProfileMetric({
  icon: Icon,
  label,
  value,
  description,
  smallValue = false,
}) {
  return (
    <div className="rounded-[17px] border border-[#e1e6e9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#eaf7ef] text-[#087443]">
        <Icon size={21} />
      </div>

      <p className="mt-5 text-[10px] text-[#758291]">
        {label}
      </p>

      <p
        className={`mt-1 font-black tracking-[-0.03em] ${
          smallValue
            ? "text-[17px]"
            : "text-[25px]"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] text-[#9aa4ad]">
        {description}
      </p>

    </div>
  );
}


/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[#edf0f1] bg-[#fafbfb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

      <span className="text-[10px] font-bold text-[#8995a1]">
        {label}
      </span>

      <span className="text-[11px] font-bold text-[#34414c]">
        {value}
      </span>

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
      className="group flex items-center gap-3 rounded-xl border border-[#e6eaec] bg-[#fafbfb] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#cfe5d6] hover:bg-[#f4faf6]"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f7ef] text-[#087443] transition group-hover:bg-[#087443] group-hover:text-white">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[11px] font-black text-[#34414c]">
          {title}
        </p>

        <p className="mt-1 text-[9px] leading-4 text-[#8995a1]">
          {description}
        </p>

      </div>

      <ChevronRight
        size={15}
        className="text-[#a0a9af] transition group-hover:translate-x-1 group-hover:text-[#087443]"
      />

    </NavLink>
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

          <User
            size={30}
            className="text-[#15904d]"
          />

        </div>

        <p className="mt-5 text-sm font-bold">
          Loading your profile...
        </p>

        <p className="mt-2 text-xs text-[#7b8793]">
          Fetching your Eco-Sort activity.
        </p>

      </div>

    </div>
  );
}
