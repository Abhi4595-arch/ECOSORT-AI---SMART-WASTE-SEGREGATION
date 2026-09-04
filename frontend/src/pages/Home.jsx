import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  Camera,
  Menu,
  X,
  Globe2,
  Leaf,
  Recycle,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const stats = [
  {
    icon: ScanLine,
    value: "12,500+",
    title: "Scans Completed",
    subtitle: "All time",
  },
  {
    icon: Leaf,
    value: "5.2",
    title: "Diversion Units",
    subtitle: "Estimated",
  },
  {
    icon: Users,
    value: "8,400+",
    title: "Active Users",
    subtitle: "Eco warriors",
  },
  {
    icon: Globe2,
    value: "2.1",
    title: "Tons",
    subtitle: "Waste Impacted",
  },
];

const categories = [
  {
    icon: Recycle,
    title: "Recyclable",
    description:
      "Paper, plastic, glass and other recoverable materials.",
  },
  {
    icon: Leaf,
    title: "Organic",
    description:
      "Food scraps, garden waste and biodegradable materials.",
  },
  {
    icon: ShieldCheck,
    title: "Hazardous",
    description:
      "Waste requiring special handling for safe disposal.",
  },
];

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Capture",
    text: "Upload an image or use your camera to scan the item.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Analyze",
    text: "Our AI analyzes the visible characteristics of the waste.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Recommend",
    text: "Receive a category, confidence score and disposal guidance.",
  },
  {
    number: "04",
    icon: ScanLine,
    title: "Track",
    text: "Your scans become part of your personal eco journey.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isAuthenticated, loading } = useAuth();

  /*
   * Centralized scan entry point.
   *
   * If the user is already authenticated, go directly
   * to the scanner.
   *
   * If the user is not authenticated, send them to Login
   * and preserve the intended destination.
   *
   * While the authentication state is being restored,
   * ProtectedRoute remains the final safety layer.
   */
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const startScanning = () => {
    closeMobileMenu();

    if (isAuthenticated) {
      navigate("/scan");
      return;
    }

    if (!loading) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/scan",
          },
        },
      });
      return;
    }

    navigate("/scan");
  };

  const heroLeftAnimation = shouldReduceMotion
    ? {}
    : {
        initial: {
          opacity: 0,
          x: -35,
        },
        animate: {
          opacity: 1,
          x: 0,
        },
        transition: {
          duration: 0.8,
        },
      };

  const heroRightAnimation = shouldReduceMotion
    ? {}
    : {
        initial: {
          opacity: 0,
          scale: 0.9,
          x: 35,
        },
        animate: {
          opacity: 1,
          scale: 1,
          x: 0,
        },
        transition: {
          duration: 0.9,
          delay: 0.1,
        },
      };

  return (
    <main
      id="home"
      className="min-h-screen overflow-hidden bg-[#f7faf8] text-[#111c2c]"
    >
      {/* ================= NAVBAR ================= */}

      <header className="relative z-50 border-b border-[#edf1ee] bg-white">
        <div className="mx-auto flex h-[82px] max-w-[1350px] items-center justify-between px-6 lg:px-10">
          {/* LOGO */}

          <Link
            to="/"
            aria-label="ECO-SORT AI home"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#087443] shadow-lg shadow-[#087443]/20"
              aria-hidden="true"
            >
              <Leaf
                size={25}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-[21px] font-black tracking-[-0.05em]">
                ECO-SORT AI
              </h1>

              <p className="text-[10px] text-[#74827b]">
                Smart Waste. Green Future.
              </p>
            </div>
          </Link>

          {/* NAVIGATION */}

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-9 lg:flex"
          >
            {[
              ["Home", "#home"],
              ["Features", "#features"],
              ["How It Works", "#how"],
              ["Impact", "#impact"],
              ["About Us", "#about"],
              ["Contact", "#contact"],
            ].map(([name, link], index) => (
              <a
                key={name}
                href={link}
                aria-current={
                  index === 0 ? "page" : undefined
                }
                className={`relative rounded py-7 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2 ${
                  index === 0
                    ? "text-[#087443]"
                    : "text-[#27352f] hover:text-[#087443]"
                }`}
              >
                {name}

                {index === 0 && (
                  <span
                    className="absolute bottom-0 left-1/2 h-[3px] w-12 -translate-x-1/2 rounded-full bg-[#087443]"
                    aria-hidden="true"
                  />
                )}
              </a>
            ))}
          </nav>

          {/* DESKTOP CTA */}

          <button
            type="button"
            onClick={startScanning}
            className="group flex min-h-11 items-center gap-3 rounded-full bg-[#062f25] px-6 py-3 text-[13px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#087443] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <span>Get Started</span>

            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            />
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="home-mobile-navigation"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="ml-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfe7e2] bg-white text-[#087443] shadow-sm transition hover:border-[#afd6bc] hover:bg-[#f3faf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2 lg:hidden"
          >
            {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        {mobileMenuOpen && (
          <div
            id="home-mobile-navigation"
            className="border-t border-[#edf1ee] bg-white px-5 pb-5 pt-3 shadow-[0_18px_35px_rgba(20,63,40,.08)] lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="mx-auto max-w-[1350px] space-y-1">
              {[
                ["Home", "#home"],
                ["Features", "#features"],
                ["How It Works", "#how"],
                ["Impact", "#impact"],
                ["About Us", "#about"],
                ["Contact", "#contact"],
              ].map(([name, link]) => (
                <a
                  key={name}
                  href={link}
                  onClick={closeMobileMenu}
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[#27352f] transition hover:bg-[#f3faf5] hover:text-[#087443] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443]"
                >
                  {name}
                </a>
              ))}
              <button
                type="button"
                onClick={startScanning}
                className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#062f25] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#087443] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                Start Scanning
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}

      <section
        className="relative overflow-hidden bg-white"
        aria-labelledby="hero-heading"
      >
        {/* BACKGROUND DECORATION */}

        <div
          className="pointer-events-none absolute -right-40 top-0 h-[650px] w-[650px] rounded-full bg-[#eef8f1]"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -left-60 bottom-0 h-[450px] w-[450px] rounded-full bg-[#f3faf5]"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.28]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(#dcebe1 1px, transparent 1px), linear-gradient(90deg, #dcebe1 1px, transparent 1px)",
            backgroundSize: "55px 55px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 75%)",
          }}
        />

        <div className="relative mx-auto grid min-h-[610px] max-w-[1350px] items-center gap-8 px-6 py-14 lg:grid-cols-[.95fr_1.05fr] lg:px-10 lg:py-16">
          {/* LEFT */}

          <motion.div
            {...heroLeftAnimation}
            className="relative z-10"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-[#eef8f1] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#087443]">
              <Sparkles
                size={13}
                aria-hidden="true"
              />

              AI-Powered Waste Classification
            </div>

            <h2
              id="hero-heading"
              className="max-w-[690px] text-[45px] font-black leading-[1.01] tracking-[-0.065em] sm:text-[65px] lg:text-[74px]"
            >
              Scan Smart.
              <br />
              Sort Right.
              <br />
              <span className="text-[#148a4d]">
                Save Earth.
              </span>
            </h2>

            <p className="mt-7 max-w-[540px] text-[16px] leading-7 text-[#526273]">
              ECO-SORT AI helps you identify waste in a
              snap and recommends the right bin. Together,
              let&apos;s build a cleaner, greener tomorrow.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={startScanning}
                className="group flex min-h-12 items-center gap-3 rounded-full bg-[#062f25] px-7 py-4 text-[13px] font-bold text-white shadow-lg shadow-[#062f25]/15 transition hover:-translate-y-1 hover:bg-[#087443] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <span>Start Scanning</span>

                <Camera
                  size={17}
                  aria-hidden="true"
                  className="transition-transform group-hover:scale-110"
                />
              </button>

              <a
                href="#features"
                className="group flex min-h-12 items-center gap-3 rounded-full border border-[#dfe7e2] bg-white px-7 py-4 text-[13px] font-bold text-[#087443] shadow-sm transition hover:-translate-y-1 hover:border-[#afd6bc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
              >
                <span>Explore Features</span>

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>

            {/* USERS */}

            <div className="mt-9 flex items-center gap-4">
              <div
                className="flex -space-x-2"
                aria-hidden="true"
              >
                {["A", "R", "S", "M", "P"].map(
                  (letter, index) => (
                    <div
                      key={`${letter}-${index}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#d9eee1] text-[11px] font-black text-[#087443]"
                    >
                      {letter}
                    </div>
                  )
                )}
              </div>

              <p className="text-[12px] leading-5 text-[#526273]">
                Join{" "}
                <strong className="text-[#087443]">
                  10,000+
                </strong>{" "}
                eco warriors
                <br />
                making a difference every day.
              </p>
            </div>
          </motion.div>

          {/* ================= PHONE VISUAL ================= */}

          <motion.div
            {...heroRightAnimation}
            className="relative flex min-h-[500px] items-center justify-center sm:min-h-[560px]"
          >
            {/* GREEN CIRCLES */}

            <div
              className="absolute right-[50%] top-[7%] h-[360px] w-[360px] translate-x-1/2 rounded-full sm:right-[4%] sm:h-[470px] sm:w-[470px] sm:translate-x-0 bg-[#dff1e4] lg:h-[510px] lg:w-[510px]"
              aria-hidden="true"
            />

            <div
              className="absolute right-[50%] top-[14%] h-[300px] w-[300px] translate-x-1/2 rounded-full sm:right-[10%] sm:h-[380px] sm:w-[380px] sm:translate-x-0 bg-[#073b2d] lg:h-[420px] lg:w-[420px]"
              aria-hidden="true"
            />

            {/* DOTTED RING */}

            <div
              className="absolute right-[50%] top-[4%] h-[390px] w-[390px] translate-x-1/2 rounded-full sm:right-[1%] sm:h-[510px] sm:w-[510px] sm:translate-x-0 border border-dashed border-[#a7ceb4]"
              aria-hidden="true"
            />

            {/* PHONE */}

            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : { y: [0, -8, 0] }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              className="relative z-20 w-[265px] rotate-[4deg] sm:w-[285px] rounded-[40px] border-[7px] border-[#111b19] bg-[#111b19] p-2 shadow-[0_40px_80px_rgba(0,0,0,.28)] sm:w-[310px]"
            >
              <div className="overflow-hidden rounded-[31px] bg-white">
                {/* STATUS */}

                <div className="flex h-8 items-center justify-between bg-[#f8faf9] px-5 text-[8px] font-bold text-[#63716b]">
                  <span>9:41</span>

                  <span aria-hidden="true">
                    ● ● ●
                  </span>
                </div>

                <div className="px-5 pb-6 pt-4">
                  <p className="text-[9px] text-[#748078]">
                    AI Classification
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <Leaf
                      size={19}
                      aria-hidden="true"
                      className="text-[#168b4c]"
                    />

                    <span className="text-[21px] font-black text-[#087443]">
                      Organic
                    </span>
                  </div>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#edf8ef] px-3 py-1.5 text-[9px] font-bold text-[#087443]">
                    <Sparkles
                      size={10}
                      aria-hidden="true"
                    />

                    82% Confidence
                  </div>

                  {/* BANANA */}

                  <div
                    className="relative mt-5 flex h-[190px] items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-[#eff8ef] to-[#d8ead8]"
                    aria-label="Illustration of organic waste"
                    role="img"
                  >
                    <div
                      className="relative h-[110px] w-[170px]"
                      aria-hidden="true"
                    >
                      <div className="absolute left-[25px] top-[15px] h-[18px] w-[120px] rotate-[13deg] rounded-full bg-[#f3c934] shadow-lg" />
                      <div className="absolute left-[27px] top-[33px] h-[18px] w-[120px] rotate-[-9deg] rounded-full bg-[#f7d346]" />
                      <div className="absolute left-[44px] top-[51px] h-[18px] w-[110px] rotate-[18deg] rounded-full bg-[#e9bd2e]" />
                      <div className="absolute left-[132px] top-[20px] h-[10px] w-[14px] rounded-full bg-[#536127]" />
                    </div>
                  </div>

                  {/* BIN */}

                  <div className="mt-4 rounded-[17px] border border-[#e0ebe3] bg-[#f7faf7] p-4">
                    <p className="text-[9px] text-[#69776f]">
                      Recommended Bin
                    </p>

                    <div className="mt-1 flex items-center justify-between">
                      <div>
                        <p className="text-[16px] font-black text-[#087443]">
                          Green Bin
                        </p>

                        <p className="mt-1 text-[9px] text-[#78867f]">
                          Organic Waste
                        </p>
                      </div>

                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f5e9]"
                        aria-hidden="true"
                      >
                        <Leaf
                          size={18}
                          className="text-[#087443]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={startScanning}
                    className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#062f25] py-3 text-[10px] font-bold text-white transition hover:bg-[#087443] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2 active:scale-[0.98]"
                  >
                    <span>Scan Another</span>

                    <Camera
                      size={12}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* FLOATING CARD */}

            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : { y: [0, -8, 0] }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              className="absolute bottom-[8%] left-[2%] z-30 w-[190px] sm:bottom-[17%] sm:left-[-8%] sm:w-[210px] rounded-[20px] border border-white bg-white/95 p-4 shadow-[0_22px_50px_rgba(19,66,42,.16)] backdrop-blur-xl "
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f6eb]"
                  aria-hidden="true"
                >
                  <Leaf
                    size={20}
                    className="text-[#459e4c]"
                  />
                </div>

                <div>
                  <p className="text-[12px] font-black">
                    Keep it green!
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-[#728079]">
                    Every right choice makes a real
                    impact.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* FLOATING LEAF */}

            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, -15, 0],
                      rotate: [0, 7, 0],
                    }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              className="absolute right-[-1%] top-[17%] opacity-60"
              aria-hidden="true"
            >
              <Leaf
                size={50}
                className="rotate-[30deg] fill-[#7fbd68] text-[#68a957]"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= STATS ================= */}

      <section
        id="impact"
        className="relative z-30 px-5"
        aria-label="ECO-SORT AI impact statistics"
      >
        <div className="mx-auto grid max-w-[1260px] grid-cols-1 overflow-hidden rounded-[22px] border border-[#e8eee9] bg-white shadow-[0_20px_60px_rgba(20,63,40,.09)] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className={`flex items-center gap-5 px-7 py-7 ${
                  index > 0
                    ? "border-t border-[#e8eee9] sm:border-l sm:border-t-0"
                    : ""
                }`}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#edf8f0]"
                  aria-hidden="true"
                >
                  <Icon
                    size={22}
                    className="text-[#32964e]"
                  />
                </div>

                <div>
                  <p className="text-[26px] font-black leading-none tracking-[-0.05em]">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-[11px] font-semibold text-[#43554c]">
                    {stat.title}
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#89958f]">
                    {stat.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="bg-white px-6 py-24 md:px-10"
        aria-labelledby="features-heading"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#15904d]">
              Smart Sorting
            </p>

            <h2
              id="features-heading"
              className="mt-3 text-[35px] font-black tracking-[-0.05em] md:text-[43px]"
            >
              Three simple waste categories
            </h2>

            <p className="mx-auto mt-3 max-w-[550px] text-[13px] leading-6 text-[#74827b]">
              ECO-SORT AI helps users understand where
              their waste belongs and what to do next.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = category.icon;

              return (
                <motion.div
                  key={category.title}
                  initial={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          y: 25,
                        }
                  }
                  whileInView={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: 1,
                          y: 0,
                        }
                  }
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : {
                          delay: index * 0.1,
                          duration: 0.5,
                        }
                  }
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -7,
                        }
                  }
                  className="rounded-[20px] border border-[#e5ede8] bg-white p-7 shadow-[0_12px_35px_rgba(21,69,43,.05)]"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7ee]"
                    aria-hidden="true"
                  >
                    <Icon
                      size={19}
                      className="text-[#15904d]"
                    />
                  </div>

                  <h3 className="mt-6 text-[18px] font-black">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-[12px] leading-6 text-[#7b8881]">
                    {category.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section
        id="how"
        className="relative overflow-hidden bg-[#032b25] px-6 py-24 text-white md:px-10"
        aria-labelledby="how-heading"
      >
        <div
          className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#0b5943]/40 blur-[90px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-[1200px]">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#73c96d]">
              <Leaf
                size={14}
                aria-hidden="true"
              />

              From Image to Action
            </div>

            <h2
              id="how-heading"
              className="mt-4 text-[35px] font-black tracking-[-0.05em] md:text-[45px]"
            >
              Simple Steps,{" "}
              <span className="text-[#62bb63]">
                Real Impact
              </span>
            </h2>

            <p className="mt-3 text-[13px] text-[#a5b9b0]">
              Our AI technology makes waste sorting easy,
              accurate, and impactful.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative text-center"
                >
                  <div
                    className="mx-auto flex h-[66px] w-[66px] items-center justify-center rounded-full border border-[#1b8b58] bg-[#06372e] text-[#8de18d] shadow-[0_0_0_8px_rgba(17,113,73,.12)]"
                    aria-hidden="true"
                  >
                    <Icon size={25} />
                  </div>

                  <p className="mt-6 text-[9px] font-black tracking-[0.2em] text-[#5bbd68]">
                    STEP {step.number}
                  </p>

                  <h3 className="mt-2 text-[18px] font-black">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-2 max-w-[210px] text-[11px] leading-5 text-[#94aaa1]">
                    {step.text}
                  </p>

                  {index < steps.length - 1 && (
                    <div
                      className="absolute left-[72%] top-[32px] hidden w-[55%] border-t border-dashed border-[#24774f] md:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}

      <section
        id="about"
        className="bg-white px-6 py-24 md:px-10"
        aria-labelledby="about-heading"
      >
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 md:grid-cols-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#15904d]">
              Every Scan Counts
            </p>

            <h2
              id="about-heading"
              className="mt-4 text-[38px] font-black leading-[1.05] tracking-[-0.055em] md:text-[48px]"
            >
              Better sorting starts
              <br />
              with{" "}
              <span className="text-[#12884b]">
                one decision.
              </span>
            </h2>

            <p className="mt-5 max-w-[500px] text-[14px] leading-7 text-[#718079]">
              ECO-SORT AI turns waste identification into
              a simple, understandable action. Scan an
              item, understand the result, and sort it
              responsibly.
            </p>

            <button
              type="button"
              onClick={startScanning}
              className="mt-8 flex min-h-11 items-center gap-3 rounded-full bg-[#062f25] px-6 py-3.5 text-[13px] font-bold text-white transition hover:-translate-y-1 hover:bg-[#087443] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <span>Try ECO-SORT AI</span>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="relative rounded-[30px] bg-[#edf8f0] p-8">
            <div className="flex h-[270px] items-center justify-center">
              <div className="relative flex h-[175px] w-[175px] items-center justify-center rounded-full bg-[#d8f0de]">
                <div
                  className="flex h-[125px] w-[125px] items-center justify-center rounded-full bg-[#087443] shadow-xl"
                  aria-hidden="true"
                >
                  <Leaf
                    size={60}
                    className="text-white"
                  />
                </div>

                <div
                  className="absolute -right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg"
                  aria-hidden="true"
                >
                  <Recycle
                    size={21}
                    className="text-[#168d4c]"
                  />
                </div>

                <div
                  className="absolute -bottom-3 left-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg"
                  aria-hidden="true"
                >
                  <ShieldCheck
                    size={21}
                    className="text-[#168d4c]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#89968f]">
                ECO-SORT Mission
              </p>

              <p className="mt-1 text-[16px] font-black">
                Sort better. Live greener.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer
        id="contact"
        className="border-t border-[#e6ece8] bg-[#f7faf8] px-6 py-10 md:px-10"
      >
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#087443] text-white"
              aria-hidden="true"
            >
              <Leaf size={18} />
            </div>

            <div>
              <p className="text-[13px] font-black">
                ECO-SORT AI
              </p>

              <p className="text-[9px] text-[#87938d]">
                Smart Waste. Green Future.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-[#87938d]">
            © 2026 ECO-SORT AI · Built for a cleaner
            tomorrow.
          </p>
        </div>
      </footer>
    </main>
  );
}