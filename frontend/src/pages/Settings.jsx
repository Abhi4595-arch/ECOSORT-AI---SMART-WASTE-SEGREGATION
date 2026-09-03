import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Volume2,
  Camera,
  ShieldCheck,
  Brain,
  Leaf,
  Save,
  CheckCircle2,
  Info,
} from "lucide-react";

import AppLayout from "../components/AppLayout";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [camera, setCamera] = useState(true);
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#f5f7f9] text-[#111c2c]">

        <main className="mx-auto max-w-[1050px] px-5 py-10 md:px-8 lg:px-10">

          {/* HEADER */}
          <section>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9ead6] bg-[#effaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#087443]">
              <SettingsIcon size={14} />
              Preferences
            </div>

            <h1 className="mt-5 text-[38px] font-black tracking-[-0.05em] md:text-[48px]">
              Settings
            </h1>

            <p className="mt-3 max-w-[620px] text-[14px] leading-6 text-[#68788b]">
              Customize your Eco-Sort AI experience and
              scanning preferences.
            </p>

          </section>

          {/* SUCCESS MESSAGE */}
          {saved && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#cce6d5] bg-[#effaf3] px-4 py-3 text-[11px] font-bold text-[#087443]">

              <CheckCircle2 size={17} />

              Settings saved successfully.

            </div>
          )}

          {/* GENERAL SETTINGS */}
          <section className="mt-8 rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm">

            <SectionHeader
              icon={SettingsIcon}
              title="General Preferences"
              description="Control how Eco-Sort AI behaves."
            />

            <div className="mt-6 divide-y divide-[#edf0f1]">

              <SettingRow
                icon={Bell}
                title="Notifications"
                description="Receive updates about your Eco-Sort activity."
                enabled={notifications}
                onChange={() =>
                  setNotifications(!notifications)
                }
              />

              <SettingRow
                icon={Volume2}
                title="Scan Result Sound"
                description="Play a sound when an AI prediction is completed."
                enabled={sound}
                onChange={() => setSound(!sound)}
              />

              <SettingRow
                icon={Camera}
                title="Camera Access"
                description="Allow Eco-Sort AI to use your device camera for real-time scanning."
                enabled={camera}
                onChange={() => setCamera(!camera)}
              />

            </div>

          </section>

          {/* AI SETTINGS */}
          <section className="mt-5 rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm">

            <SectionHeader
              icon={Brain}
              title="AI & Scanning"
              description="Information about the current Eco-Sort AI model."
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

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#f5faf7] p-4">

              <Info
                size={17}
                className="mt-0.5 shrink-0 text-[#087443]"
              />

              <p className="text-[10px] leading-5 text-[#667a6e]">
                Eco-Sort AI currently uses a three-category
                classification system. Low-confidence predictions
                are flagged for manual verification.
              </p>

            </div>

          </section>

          {/* PRIVACY */}
          <section className="mt-5 rounded-[20px] border border-[#e1e6e9] bg-white p-6 shadow-sm">

            <SectionHeader
              icon={ShieldCheck}
              title="Privacy & Safety"
              description="Important information about your scan data."
            />

            <div className="mt-6 rounded-xl border border-[#e1e6e9] bg-[#fafbfb] p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]">
                  <ShieldCheck size={18} />
                </div>

                <div>

                  <h3 className="text-[12px] font-black">
                    AI-assisted decisions
                  </h3>

                  <p className="mt-2 text-[10px] leading-5 text-[#758291]">
                    Eco-Sort AI provides classification and
                    disposal guidance to support waste-sorting
                    decisions. Always verify predictions before
                    disposal, particularly when an item may be
                    hazardous.
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* SAVE */}
          <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-[10px] text-[#8995a1]">
              Preferences currently apply to this browser session.
            </p>

            <button
              onClick={saveSettings}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087443] px-6 py-3 text-[11px] font-black text-white shadow-md shadow-[#087443]/20 transition hover:bg-[#096239] active:scale-[0.98]"
            >
              <Save size={15} />
              Save Settings
            </button>

          </section>

          {/* FOOTER */}
          <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#033e35] px-5 py-4 text-[10px] leading-5 text-white">

            <Leaf
              size={16}
              className="mt-0.5 shrink-0 text-[#64c96a]"
            />

            <p>
              <strong>Eco-Sort AI:</strong>{" "}
              Customize your experience while keeping the
              focus on smarter and safer waste sorting.
            </p>

          </div>

        </main>

      </div>
    </AppLayout>
  );
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]">
        <Icon size={20} />
      </div>

      <div>

        <h2 className="text-[20px] font-black">
          {title}
        </h2>

        <p className="mt-1 text-[10px] text-[#8995a1]">
          {description}
        </p>

      </div>

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
    <div className="flex items-center justify-between gap-5 py-5">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f6f7] text-[#596773]">
          <Icon size={18} />
        </div>

        <div>

          <h3 className="text-[12px] font-black">
            {title}
          </h3>

          <p className="mt-1 max-w-[560px] text-[10px] leading-5 text-[#8995a1]">
            {description}
          </p>

        </div>

      </div>

      <button
        type="button"
        onClick={onChange}
        aria-label={`${title} ${enabled ? "enabled" : "disabled"}`}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-[#087443]"
            : "bg-[#cbd2d6]"
        }`}
      >

        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

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
    <div className="rounded-xl border border-[#e5e9eb] bg-[#fafbfb] p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#087443]">
          <Icon size={18} />
        </div>

        <span className="text-[20px] font-black text-[#087443]">
          {value}
        </span>

      </div>

      <p className="mt-5 text-[11px] font-black">
        {label}
      </p>

      <p className="mt-1 text-[9px] leading-5 text-[#8995a1]">
        {description}
      </p>

    </div>
  );
}