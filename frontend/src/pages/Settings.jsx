import { useEffect, useState } from "react";
import {
  Bell,
  Brain,
  Camera,
  CheckCircle2,
  Info,
  Leaf,
  LoaderCircle,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Volume2,
} from "lucide-react";

import { apiJson } from "../utils/api";
import PageLoading from "../components/PageLoading";
import RetryState from "../components/RetryState";

const DEFAULT_SETTINGS = {
  notifications: true,
  sound: true,
  camera: true,
};

function normalizeSettings(value) {
  const source =
    value && typeof value === "object" ? value : {};

  return {
    notifications: Boolean(
      source.notifications ?? DEFAULT_SETTINGS.notifications
    ),
    sound: Boolean(
      source.sound ?? DEFAULT_SETTINGS.sound
    ),
    camera: Boolean(
      source.camera ?? DEFAULT_SETTINGS.camera
    ),
  };
}

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      setLoading(true);
      setError("");

      try {
        const data = await apiJson("/auth/settings");

        if (!mounted) return;

        const normalized = normalizeSettings(data?.settings);
        setSettings(normalized);
        setSavedSettings(normalized);
      } catch (requestError) {
        if (!mounted) return;

        console.error("Settings loading error:", requestError);

        setError(
          requestError?.message ||
            "Unable to load your settings."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const hasUnsavedChanges =
    settings.notifications !== savedSettings.notifications ||
    settings.sound !== savedSettings.sound ||
    settings.camera !== savedSettings.camera;

  function toggleSetting(key) {
    if (!(key in DEFAULT_SETTINGS)) {
      return;
    }

    setSettings((current) => ({
      ...current,
      [key]: !Boolean(current[key]),
    }));

    setSaved(false);
    setSaveError("");
  }

  async function saveSettings() {
    if (saving || !hasUnsavedChanges) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setSaveError("");

    try {
      const payload = {
        notifications: Boolean(settings.notifications),
        sound: Boolean(settings.sound),
        camera: Boolean(settings.camera),
      };

      const data = await apiJson("/auth/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const normalized = normalizeSettings(data?.settings || payload);
      setSettings(normalized);
      setSavedSettings(normalized);
      setSaved(true);
    } catch (requestError) {
      console.error("Settings save error:", requestError);

      setSaveError(
        requestError?.message ||
          "Unable to save your settings."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRetry() {
    setLoading(true);
    setError("");

    try {
      const data = await apiJson("/auth/settings");

      const normalized = normalizeSettings(data?.settings);
      setSettings(normalized);
      setSavedSettings(normalized);
      setSaved(false);
      setSaveError("");
    } catch (requestError) {
      console.error("Settings retry error:", requestError);

      setError(
        requestError?.message ||
          "Unable to load your settings."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <PageLoading label="Loading your preferences…" />;
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#f5f8f6] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1050px]">
          <RetryState
            title="Settings unavailable"
            message={error}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="eco-app-page eco-page-enter min-h-full bg-[#f5f8f6] text-[#10241b]">
      <main
        className="mx-auto max-w-[1050px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
        aria-labelledby="settings-page-title"
      >
        {/* PAGE HEADER */}
        <header>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cbe6d4] bg-[#eef9f2] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#087443]">
            <SettingsIcon size={13} aria-hidden="true" />
            Preferences
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                id="settings-page-title"
                className="text-[34px] font-black tracking-[-0.045em] sm:text-[42px]"
              >
                Settings
              </h1>

              <p className="mt-2 max-w-[650px] text-[13px] leading-6 text-[#68788b]">
                Manage your Eco-Sort AI preferences. Your choices
                are saved to your account and follow you across
                sessions.
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving || !hasUnsavedChanges}
                className={`eco-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-[11px] font-black text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#087443]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  hasUnsavedChanges
                    ? "bg-[#087443] hover:bg-[#066238]"
                    : "bg-[#9ab6a6]"
                }`}
                aria-busy={saving}
                title={hasUnsavedChanges ? "Save your preference changes" : "No unsaved preference changes"}
              >
              {saving ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save size={16} aria-hidden="true" />
              )}

                {saving ? "Saving…" : hasUnsavedChanges ? "Save Changes" : saved ? "Saved" : "No Changes"}
              </button>
              {!hasUnsavedChanges && !saving && (
                <span className="text-right text-[9px] font-bold text-[#7a8b82]">
                  Your preferences are up to date.
                </span>
              )}
            </div>
          </div>
        </header>

        {/* SAVE STATUS */}
        {(saved || saveError) && (
          <div
            className={`mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-[11px] font-bold ${
              saveError
                ? "border-[#f1caca] bg-[#fff5f5] text-[#b42318]"
                : "border-[#cce6d5] bg-[#effaf3] text-[#087443]"
            }`}
            role={saveError ? "alert" : "status"}
            aria-live="polite"
          >
            {saveError ? (
              <Info
                size={17}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
            )}

            <span>
              {saveError || "Settings saved successfully."}
            </span>
          </div>
        )}

        {/* GENERAL PREFERENCES */}
        <section
          className="eco-card overflow-hidden mt-7 rounded-[24px] border border-[#dce9e1] bg-white shadow-sm"
          aria-labelledby="general-preferences-title"
        >
          <div className="border-b border-[#edf0f1] bg-[#fbfdfc] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f7ee] text-[#087443]"
                aria-hidden="true"
              >
                <SettingsIcon size={20} />
              </div>

              <div className="min-w-0">
                <h2
                  id="general-preferences-title"
                  className="text-[16px] font-black"
                >
                  General Preferences
                </h2>

                <p className="mt-1 text-[10px] text-[#7a8792]">
                  Control how Eco-Sort AI behaves for your account.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#edf0f1] px-5 sm:px-6">
            <SettingRow
              icon={Bell}
              title="Notifications"
              description="Receive updates about your Eco-Sort activity."
              enabled={Boolean(settings.notifications)}
              onChange={() => toggleSetting("notifications")}
            />

            <SettingRow
              icon={Volume2}
              title="Scan Result Sound"
              description="Enable sound feedback when an AI prediction is completed."
              enabled={Boolean(settings.sound)}
              onChange={() => toggleSetting("sound")}
            />

            <SettingRow
              icon={Camera}
              title="Camera Scanning"
              description="Allow the Eco-Sort app to use your camera for real-time scanning."
              enabled={Boolean(settings.camera)}
              onChange={() => toggleSetting("camera")}
            />
          </div>
        </section>

        {/* AI & SCANNING */}
        <section
          className="eco-card mt-5 rounded-[24px] border border-[#dce9e1] bg-white p-5 shadow-sm sm:p-6"
          aria-labelledby="ai-scanning-title"
        >
          <SectionHeader
            id="ai-scanning-title"
            icon={Brain}
            title="AI & Scanning"
            description="Current classification behavior used by Eco-Sort AI."
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={Brain}
              label="Confidence Threshold"
              value="60%"
              description="Predictions below this level require manual review."
            />

            <InfoCard
              icon={Leaf}
              label="Waste Categories"
              value="3"
              description="Recyclable, Organic, and Hazardous."
            />
          </div>

          <div className="eco-surface mt-5 flex items-start gap-3 rounded-2xl border border-[#dcebe1] bg-[#f5faf7] p-4">
            <Info
              size={17}
              className="mt-0.5 shrink-0 text-[#087443]"
              aria-hidden="true"
            />

            <p className="text-[10px] leading-5 text-[#667a6e]">
              Eco-Sort AI flags lower-confidence predictions for
              manual verification before disposal.
            </p>
          </div>
        </section>

        {/* PRIVACY & SAFETY */}
        <section
          className="eco-card mt-5 rounded-[24px] border border-[#dce9e1] bg-white p-5 shadow-sm sm:p-6"
          aria-labelledby="privacy-safety-title"
        >
          <SectionHeader
            id="privacy-safety-title"
            icon={ShieldCheck}
            title="Privacy & Safety"
            description="How your account preferences are handled."
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <PrivacyCard
              title="Account-specific"
              description="Preferences are stored against your authenticated user account."
            />

            <PrivacyCard
              title="Protected requests"
              description="Settings endpoints require your Eco-Sort authentication token."
            />
          </div>
        </section>

        {/* FOOTNOTE */}
        <p className="mt-6 text-center text-[9px] leading-4 text-[#8a968f]">
          Preference changes affect your Eco-Sort experience.
          Browser-level camera permissions are still controlled by
          your device and browser.
        </p>
      </main>
    </div>
  );
}

/* =========================================================
   SETTING ROW
========================================================= */

function SettingRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-5 sm:py-5.5">
      <div className="flex min-w-0 items-start gap-3.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f7f3] text-[#087443]"
          aria-hidden="true"
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-[12px] font-black text-[#26352e]">
            {title}
          </p>

          <p className="mt-1 max-w-[620px] text-[10px] leading-5 text-[#7b8790]">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${title}: ${enabled ? "on" : "off"}`}
        onClick={onChange}
        className={`eco-press relative h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#087443]/30 focus:ring-offset-2 ${
          enabled ? "bg-[#087443]" : "bg-[#cbd4cf]"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  id,
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef8f1] text-[#087443]"
        aria-hidden="true"
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <h2 id={id} className="text-[15px] font-black">
          {title}
        </h2>

        <p className="mt-1 text-[10px] text-[#7a8792]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="eco-interactive rounded-2xl border border-[#e6ece8] bg-[#fafcfb] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1] text-[#087443]"
          aria-hidden="true"
        >
          <Icon size={18} />
        </div>

        <span className="text-[21px] font-black text-[#10241b]">
          {value}
        </span>
      </div>

      <p className="mt-4 text-[11px] font-black text-[#34423b]">
        {label}
      </p>

      <p className="mt-1 text-[9px] leading-4 text-[#89948f]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   PRIVACY CARD
========================================================= */

function PrivacyCard({ title, description }) {
  return (
    <div className="eco-interactive rounded-2xl border border-[#e6ece8] bg-[#fafcfb] p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <ShieldCheck
          size={17}
          className="mt-0.5 shrink-0 text-[#087443]"
          aria-hidden="true"
        />

        <div className="min-w-0">
          <p className="text-[11px] font-black text-[#34423b]">
            {title}
          </p>

          <p className="mt-1 text-[9px] leading-4 text-[#89948f]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}