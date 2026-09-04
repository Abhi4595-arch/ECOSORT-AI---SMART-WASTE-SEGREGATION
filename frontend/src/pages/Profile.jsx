import { useEffect, useState } from "react";
import {
  Award,
  BadgeCheck,
  ChevronRight,
  Leaf,
  Mail,
  Pencil,
  ScanLine,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  User,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { apiJson } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import PageLoading from "../components/PageLoading";
import RetryState from "../components/RetryState";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [ecoScore, setEcoScore] = useState(null);
  const [gamification, setGamification] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [user?.name, user?.email]);

  const nameForInitials = (user?.name || "Eco").trim();

  const initials = nameForInitials
    ? nameForInitials
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "E";

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const [
          analyticsData,
          scoreData,
          gamificationData,
        ] = await Promise.all([
          apiJson("/analytics"),
          apiJson("/eco-score"),
          apiJson("/gamification"),
        ]);

        if (!mounted) return;

        setAnalytics(analyticsData || {});
        setEcoScore(scoreData || {});
        setGamification(gamificationData || {});
      } catch (requestError) {
        if (!mounted) return;

        console.error("Profile loading error:", requestError);

        setError(
          requestError?.message ||
            "Unable to load profile data right now."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [retryCount]);

  if (loading) {
    return <PageLoading label="Loading your profile…" />;
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#f5f8f6] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <RetryState
            title="Profile data unavailable"
            message={error}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        </div>
      </div>
    );
  }

  const totalScans = Math.max(
    0,
    safeNumber(
      analytics?.total_scans ??
        gamification?.total_scans ??
        0
    )
  );

  const score = clamp(
    safeNumber(
      ecoScore?.eco_sort_score ??
        ecoScore?.score ??
        0
    ),
    0,
    100
  );

  // Gamification owns progression levels; Eco-Sort Score is a separate metric.
  const level =
    gamification?.level ||
    ecoScore?.level ||
    "Eco Beginner";

  const badges = Array.isArray(gamification?.badges)
    ? gamification.badges
    : [];

  const nextLevel =
    gamification?.next_level ||
    ecoScore?.next_level ||
    "Maximum level reached";

  const pointsToNextLevelRaw =
    gamification?.points_to_next_level ??
    ecoScore?.points_to_next_level ??
    null;

  const pointsToNextLevel =
    pointsToNextLevelRaw === null
      ? null
      : Math.max(0, safeNumber(pointsToNextLevelRaw));

  const points = Math.max(
    0,
    safeNumber(gamification?.points)
  );

  const progress = clamp(
    safeNumber(gamification?.progress_percentage),
    0,
    100
  );

  const breakdown =
    ecoScore?.score_breakdown &&
    typeof ecoScore.score_breakdown === "object"
      ? ecoScore.score_breakdown
      : {};

  const weights =
    ecoScore?.weights &&
    typeof ecoScore.weights === "object"
      ? ecoScore.weights
      : {};

  const memberSince = formatMemberSince(user?.created_at);

  const handleSave = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      setSaveError("Name and email are required.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const data = await apiJson("/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      if (data?.user) {
        updateUser(data.user);
      }

      setEditing(false);
      setSaveSuccess("Profile updated successfully.");
    } catch (requestError) {
      console.error("Profile update error:", requestError);

      setSaveError(
        requestError?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveError("");
    setSaveSuccess("");

    setForm({
      name: user?.name || "",
      email: user?.email || "",
    });
  };

  return (
    <div className="eco-app-page eco-page-enter min-h-full bg-[#f5f8f6] text-[#10241b]">
      <main
        className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
        aria-labelledby="profile-page-title"
      >
        {/* PAGE HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cbe6d4] bg-[#eef9f2] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#087443]">
              <User size={13} aria-hidden="true" />
              Personal profile
            </div>

            <h1
              id="profile-page-title"
              className="mt-4 text-[34px] font-black tracking-[-0.055em] sm:text-[46px]"
            >
              Your Eco Profile
            </h1>

            <p className="mt-2 max-w-[650px] text-[13px] leading-6 text-[#6c7d75] sm:text-[14px]">
              Your identity, progress, and waste-sorting journey —
              all in one place.
            </p>
          </div>

          <NavLink
            to="/settings"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8e2dc] bg-white px-4 text-[10px] font-black text-[#43534b] shadow-sm transition hover:border-[#b9d8c3] hover:bg-[#f1faf4] hover:text-[#087443] focus:outline-none focus:ring-2 focus:ring-[#68b985]/40"
          >
            <Settings size={15} aria-hidden="true" />
            Settings
          </NavLink>
        </header>

        {/* HERO */}
        <section
          className="relative mt-7 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#043f35_0%,#075b46_52%,#087443_100%)] shadow-[0_18px_50px_rgba(4,63,53,0.18)]"
          aria-label="Profile overview"
        >
          <div
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#64c96a]/20 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-[#8be19a]/12 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
            aria-hidden="true"
          />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[26px] border-4 border-white/75 bg-[#15904d] text-2xl font-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] sm:h-28 sm:w-28 sm:text-3xl"
                aria-label={`Profile initials ${initials}`}
              >
                {initials}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#a9e5b7]">
                  Eco-Sort AI member
                </p>

                <h2 className="mt-2 break-words text-[29px] font-black tracking-[-0.04em] text-white sm:text-[36px]">
                  {user?.name || "Eco Warrior"}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#d4e9e2]">
                  <span className="inline-flex min-w-0 items-center gap-1.5 break-all">
                    <Mail
                      size={13}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    {user?.email || "No email"}
                  </span>

                  <span
                    className="hidden h-1 w-1 rounded-full bg-[#8bc5ae] sm:block"
                    aria-hidden="true"
                  />

                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.10] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-sm sm:p-5">
              <ScoreRing score={score} />

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#a9e5b7]">
                  Eco-Sort Score
                </p>

                <p className="mt-1 text-[18px] font-black text-white">
                  {level}
                </p>

                <p className="mt-1 text-[10px] text-[#d4e9e2]">
                  Based on your scan activity
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI STRIP */}
        <section
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Profile statistics"
        >
          <MetricCard
            icon={ScanLine}
            label="Total scans"
            value={totalScans}
            caption="Waste analyzed"
          />

          <MetricCard
            icon={Award}
            label="Badges"
            value={badges.length}
            caption="Achievements unlocked"
          />

          <MetricCard
            icon={Trophy}
            label="Eco points"
            value={points}
            caption="Earned through activity"
          />

          <MetricCard
            icon={Target}
            label="Current level"
            value={level}
            caption="Keep progressing"
            compact
          />
        </section>

        {/* ACCOUNT + STATUS */}
        <section className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <Card>
            <SectionHeading
              icon={User}
              eyebrow="Account"
              title="Profile information"
              description="Keep your Eco-Sort identity up to date."
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoTile
                icon={User}
                label="Display name"
                value={user?.name || "—"}
              />

              <InfoTile
                icon={Mail}
                label="Email address"
                value={user?.email || "—"}
              />
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setSaveError("");
                  setSaveSuccess("");
                }}
                className="eco-press mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#087443] px-4 text-[11px] font-black text-white shadow-lg shadow-[#087443]/15 transition hover:-translate-y-0.5 hover:bg-[#096239] focus:outline-none focus:ring-2 focus:ring-[#68b985]/50 focus:ring-offset-2"
              >
                <Pencil size={14} aria-hidden="true" />
                Edit profile
              </button>
            ) : (
              <form
                onSubmit={handleSave}
                className="mt-5 rounded-2xl border border-[#d9e9df] bg-[#f7fbf8] p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#087443]">
                      Edit details
                    </p>

                    <p className="mt-1 text-[11px] text-[#73827b]">
                      Changes are saved to your account.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#dbe5df] bg-white text-[#718078] transition hover:text-[#087443] focus:outline-none focus:ring-2 focus:ring-[#68b985]/40"
                    aria-label="Cancel editing"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Name"
                    value={form.name}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        name: value,
                      }))
                    }
                    required
                    maxLength={80}
                  />

                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        email: value,
                      }))
                    }
                    required
                    maxLength={254}
                  />
                </div>

                {saveError && (
                  <p
                    className="mt-3 rounded-lg bg-[#fff1f0] px-3 py-2 text-[10px] font-bold text-[#b42318]"
                    role="alert"
                  >
                    {saveError}
                  </p>
                )}

                <button
                  disabled={saving}
                  type="submit"
                  className="eco-press mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#033e35] px-4 text-[10px] font-black text-white transition hover:bg-[#075245] focus:outline-none focus:ring-2 focus:ring-[#68b985]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving changes…" : "Save changes"}
                </button>
              </form>
            )}

            {saveSuccess && (
              <p
                className="mt-3 flex items-center gap-2 text-[10px] font-bold text-[#087443]"
                role="status"
                aria-live="polite"
              >
                <BadgeCheck size={14} aria-hidden="true" />
                {saveSuccess}
              </p>
            )}
          </Card>

          <div className="rounded-[24px] border border-[#cfe8d8] bg-gradient-to-br from-[#effaf3] to-[#e4f5e9] p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#087443]">
                  Current status
                </p>

                <h2 className="mt-2 text-[25px] font-black tracking-[-0.04em] text-[#173d2d]">
                  {level}
                </h2>
              </div>

              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#087443] shadow-sm"
                aria-hidden="true"
              >
                <Leaf size={20} />
              </div>
            </div>

            <p className="mt-5 text-[11px] leading-5 text-[#5f7468]">
              Your score is{" "}
              <strong className="text-[#173d2d]">
                {Math.round(score)}/100
              </strong>
              . Keep scanning waste to build consistent sorting
              habits.
            </p>

            <div
              className="mt-6 h-2 overflow-hidden rounded-full bg-[#cfe5d7]"
              role="progressbar"
              aria-label="Eco-Sort Score"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score}
            >
              <div
                className="h-full rounded-full bg-[#168b4c] transition-all duration-700"
                style={{
                  width: `${score}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[8px] font-bold text-[#6f8278]">
              <span>0</span>
              <span>Eco-Sort Score</span>
              <span>100</span>
            </div>

            <NavLink
              to="/gamification"
              className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-[10px] font-black text-[#087443] shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#68b985]/40"
            >
              View achievements
              <ChevronRight size={14} aria-hidden="true" />
            </NavLink>
          </div>
        </section>

        {/* PROGRESS */}
        <Card className="mt-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <SectionHeading
              icon={Target}
              eyebrow="Progress"
              title="Your Eco-Sort Score"
              description="A product metric built from scan confidence, reliability, safety signals, and consistency."
            />

            <div className="rounded-2xl bg-[#eff9f2] px-4 py-3 sm:min-w-[170px] sm:text-right">
              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#718078]">
                Next level
              </p>

              <p className="mt-1 text-[13px] font-black text-[#087443]">
                {nextLevel}
              </p>

              {pointsToNextLevel !== null && (
                <p className="mt-1 text-[9px] text-[#728278]">
                  {pointsToNextLevel} points needed
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#dcebe1] bg-[#f7fbf8] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#087443]">
                  Level progress
                </p>

                <p className="mt-1 text-[12px] font-black text-[#173d2d]">
                  {points} points · {level}
                </p>
              </div>

              <span className="text-[11px] font-black text-[#087443]">
                {Math.round(progress)}%
              </span>
            </div>

            <div
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#dfe8e2]"
              role="progressbar"
              aria-label="Level progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-[#168b4c] transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ScoreFactor
              label="AI Confidence"
              value={breakdown.ai_confidence ?? 0}
              weight={weights.ai_confidence ?? 50}
            />

            <ScoreFactor
              label="Sorting Reliability"
              value={breakdown.sorting_reliability ?? 0}
              weight={weights.sorting_reliability ?? 25}
            />

            <ScoreFactor
              label="Safe Handling"
              value={breakdown.safe_handling ?? 0}
              weight={weights.safe_handling ?? 15}
            />

            <ScoreFactor
              label="Consistency"
              value={breakdown.consistency ?? 0}
              weight={weights.consistency ?? 10}
            />
          </div>
        </Card>

        {/* BADGES + QUICK ACTIONS */}
        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_.85fr]">
          <Card>
            <div className="flex items-end justify-between gap-4">
              <SectionHeading
                icon={Award}
                eyebrow="Achievements"
                title="Your badges"
                description="Milestones unlocked through your Eco-Sort activity."
              />

              <NavLink
                to="/gamification"
                className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-black text-[#087443] transition hover:bg-[#eef9f2] focus:outline-none focus:ring-2 focus:ring-[#68b985]/40"
              >
                View all →
              </NavLink>
            </div>

            {badges.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {badges.slice(0, 6).map((badge, index) => {
                  const name =
                    typeof badge === "string"
                      ? badge
                      : badge?.name ||
                        badge?.title ||
                        "Eco Badge";

                  return (
                    <div
                      key={`${name}-${index}`}
                      className="eco-interactive flex items-center gap-3 rounded-2xl border border-[#dceee2] bg-[#f5faf7] p-3.5"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dff2e5] text-[#087443]"
                        aria-hidden="true"
                      >
                        <Award size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-black text-[#315342]">
                          {name}
                        </p>

                        <p className="mt-0.5 text-[8px] text-[#7b8b83]">
                          Unlocked achievement
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyBadges />
            )}
          </Card>

          <Card>
            <SectionHeading
              icon={Trophy}
              eyebrow="Quick access"
              title="Keep going"
              description="Jump back into the parts of Eco-Sort that matter most."
            />

            <div className="mt-5 grid gap-3">
              <QuickAction
                to="/scan"
                icon={ScanLine}
                title="Scan waste"
                description="Identify a new waste item."
              />

              <QuickAction
                to="/history"
                icon={ShieldCheck}
                title="Scan history"
                description="Review previous results."
              />

              <QuickAction
                to="/gamification"
                icon={Trophy}
                title="Achievements"
                description="See badges, points, and levels."
              />
            </div>
          </Card>
        </section>

        {/* DATA NOTICE */}
        <div
          className="mt-5 flex items-start gap-3 rounded-2xl border border-[#d5e4dc] bg-white px-5 py-4 shadow-sm"
          role="note"
        >
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-[#087443]"
            aria-hidden="true"
          />

          <p className="text-[9px] leading-5 text-[#718078]">
            <strong className="text-[#3b5147]">
              Your data stays tied to your account.
            </strong>{" "}
            Your scan activity powers your history, analytics,
            Eco-Sort Score, and gamification experience.
          </p>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   CARD
========================================================= */

function Card({ children, className = "" }) {
  return (
    <div
      className={`eco-card rounded-[24px] border border-[#dfe8e3] bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]"
        aria-hidden="true"
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#087443]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#182b23]">
          {title}
        </h2>

        <p className="mt-1 text-[10px] leading-5 text-[#7a8982]">
          {description}
        </p>
      </div>
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
  caption,
  compact = false,
}) {
  return (
    <div className="eco-card-hover rounded-[20px] border border-[#dfe8e3] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]"
          aria-hidden="true"
        >
          <Icon size={18} />
        </div>

        <span className="rounded-full bg-[#f1f7f3] px-2 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-[#6d8177]">
          Profile
        </span>
      </div>

      <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.07em] text-[#82918a]">
        {label}
      </p>

      <p
        className={`mt-1 font-black tracking-[-0.04em] text-[#152a20] ${
          compact ? "break-words text-[18px]" : "text-[26px]"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] text-[#9aa7a1]">
        {caption}
      </p>
    </div>
  );
}

/* =========================================================
   INFO TILE
========================================================= */

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="eco-interactive rounded-2xl border border-[#e6ece8] bg-[#fafcfb] p-4">
      <div className="flex items-center gap-2 text-[#087443]">
        <Icon size={14} aria-hidden="true" />

        <span className="text-[8px] font-black uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>

      <p
        className="mt-2 truncate text-[12px] font-black text-[#34463d]"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
  maxLength,
}) {
  const fieldId = `profile-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="text-[9px] font-black uppercase tracking-[0.08em] text-[#728078]"
      >
        {label}
      </label>

      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        maxLength={maxLength}
        autoComplete={
          type === "email" ? "email" : "name"
        }
        className="mt-1.5 min-h-11 w-full rounded-xl border border-[#d9e3dd] bg-white px-3.5 text-[11px] font-semibold text-[#253a30] outline-none transition focus:border-[#087443] focus:ring-4 focus:ring-[#087443]/10 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

/* =========================================================
   SCORE FACTOR
========================================================= */

function ScoreFactor({ label, value, weight }) {
  const safe = clamp(safeNumber(value), 0, 100);
  const safeWeight = Math.max(0, safeNumber(weight));

  return (
    <div className="eco-interactive rounded-2xl border border-[#e8eeea] bg-[#fbfcfb] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black text-[#2c4137]">
            {label}
          </p>

          <span className="mt-1 inline-flex rounded-full bg-[#eaf7ef] px-2 py-0.5 text-[8px] font-black text-[#087443]">
            {safeWeight}% weight
          </span>
        </div>

        <span className="text-[13px] font-black text-[#087443]">
          {Math.round(safe)}%
        </span>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-[#e2e9e5]"
        role="progressbar"
        aria-label={`${label} score`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
      >
        <div
          className="h-full rounded-full bg-[#168b4c] transition-all duration-700"
          style={{
            width: `${safe}%`,
          }}
        />
      </div>
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
      className="group flex items-center gap-3 rounded-2xl border border-[#e4ebe7] bg-[#fafcfb] p-3.5 transition hover:-translate-y-0.5 hover:border-[#cbe2d3] hover:bg-[#f3faf5] focus:outline-none focus:ring-2 focus:ring-[#68b985]/40"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f7ef] text-[#087443] transition group-hover:bg-[#087443] group-hover:text-white"
        aria-hidden="true"
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-[#34463d]">
          {title}
        </p>

        <p className="mt-1 text-[8px] leading-4 text-[#8a9791]">
          {description}
        </p>
      </div>

      <ChevronRight
        size={14}
        className="shrink-0 text-[#a0aaa5] transition group-hover:translate-x-1 group-hover:text-[#087443]"
        aria-hidden="true"
      />
    </NavLink>
  );
}

/* =========================================================
   EMPTY BADGES
========================================================= */

function EmptyBadges() {
  return (
    <div className="eco-surface mt-5 rounded-2xl border border-dashed border-[#dce5e0] bg-[#fafcfb] px-5 py-8 text-center">
      <Award
        size={25}
        className="mx-auto text-[#9eaaa4]"
        aria-hidden="true"
      />

      <p className="mt-3 text-[11px] font-black text-[#4d5e55]">
        No badges yet
      </p>

      <p className="mt-1 text-[9px] text-[#8a9791]">
        Start scanning to unlock achievements.
      </p>
    </div>
  );
}

/* =========================================================
   SCORE RING
========================================================= */

function ScoreRing({ score }) {
  const safe = clamp(safeNumber(score), 0, 100);

  return (
    <div
      className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#64c96a ${
          safe * 3.6
        }deg, rgba(255,255,255,.14) 0deg)`,
      }}
      role="img"
      aria-label={`Eco-Sort Score ${Math.round(safe)} out of 100`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0a4438] text-[14px] font-black text-white">
        {Math.round(safe)}
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatMemberSince(createdAt) {
  if (!createdAt) {
    return "Eco-Sort member";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Eco-Sort member";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}