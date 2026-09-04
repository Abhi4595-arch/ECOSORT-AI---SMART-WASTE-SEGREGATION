import { useId, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Register() {
  const {
    register,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * Preserve the page that originally requested
   * authentication.
   *
   * This allows:
   *
   * /analytics
   *   → Login
   *   → Register
   *   → /analytics
   *
   * instead of always forcing the user to Dashboard.
   */
  const destination = getSafeDestination(
    location.state?.from
  );

  if (isAuthenticated) {
    return (
      <Navigate
        to={destination}
        replace
      />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (trimmedName.length > 80) {
      setError(
        "Name must be 80 characters or less."
      );
      return;
    }

    if (!trimmedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password.length > 128) {
      setError(
        "Password must be 128 characters or less."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      /*
       * register() stores the authenticated session
       * returned by the backend.
       */
      await register(
        trimmedName,
        trimmedEmail,
        password
      );

      /*
       * Return to the original protected page.
       *
       * If registration was started directly from the
       * public Register page, this safely falls back
       * to Dashboard.
       */
      navigate(destination, {
        replace: true,
      });
    } catch (requestError) {
      console.error(
        "Registration error:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Preserve the intended destination when the user
   * switches back to Login.
   */
  const loginState = location.state?.from
    ? {
        from: location.state.from,
      }
    : undefined;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f8f6] px-4 py-8 sm:px-5 sm:py-10">
      <div
        className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#dff3e5]/70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#e8f6ec] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(#dcebe1 1px, transparent 1px), linear-gradient(90deg, #dcebe1 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "linear-gradient(to bottom, black, transparent 70%)",
        }}
      />
      <div className="relative z-10 grid w-full max-w-[1040px] overflow-hidden rounded-[26px] border border-[#dfe9e2] bg-white shadow-[0_30px_90px_rgba(23,60,45,.13)] lg:grid-cols-2">
        {/* =================================================
            DESKTOP BRAND PANEL
        ================================================= */}

        <div className="relative hidden overflow-hidden bg-[#033e35] p-10 text-white lg:block xl:p-12">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#087b49]/20 blur-2xl"
            aria-hidden="true"
          />
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#079b59]"
              aria-hidden="true"
            >
              <Leaf size={24} />
            </div>

            <div>
              <div className="text-xl font-black">
                ECO-SORT AI
              </div>

              <div className="text-[9px] text-[#a8c9be]">
                Intelligent Waste Identification
              </div>
            </div>
          </div>

          <div className="relative mt-20 xl:mt-24">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#78d08d]">
              Start your eco journey
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em]">
              Scan smarter. Learn faster. Sort better.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-[#b5d0c7]">
              Your account keeps your scan history,
              analytics, Eco-Sort Score, impact metrics,
              and achievements together.
            </p>
          </div>
        </div>

        {/* =================================================
            FORM PANEL
        ================================================= */}

        <div className="p-6 sm:p-9 lg:p-11 xl:p-12">
          {/* MOBILE BRAND */}

          <div className="mb-8 lg:hidden">
            <Link
              to="/"
              aria-label="ECO-SORT AI home"
              className="flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63b985] focus-visible:ring-offset-2"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#079b59] text-white"
                aria-hidden="true"
              >
                <Leaf size={22} />
              </div>

              <div className="text-lg font-black text-[#17372f]">
                ECO-SORT AI
              </div>
            </Link>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#087b49]">
            Create your account
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#17372f]">
            Join Eco-Sort AI
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#738078]">
            Create an account to keep your waste-sorting
            journey personal.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-4 sm:mt-8"
            noValidate
          >
            {/* NAME */}

            <Field
              label="Name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Your name"
              icon={User}
              autoComplete="name"
              maxLength={80}
              required
              disabled={loading}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error
                  ? "register-error"
                  : undefined
              }
            />

            {/* EMAIL */}

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              icon={Mail}
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              required
              disabled={loading}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error
                  ? "register-error"
                  : undefined
              }
            />

            {/* PASSWORD */}

            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              show={showPassword}
              setShow={setShowPassword}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              disabled={loading}
              name="password"
              maxLength={128}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={
                error
                  ? "register-error"
                  : undefined
              }
            />

            {/* CONFIRM PASSWORD */}

            <PasswordField
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showPassword}
              setShow={setShowPassword}
              autoComplete="new-password"
              placeholder="Repeat your password"
              disabled={loading}
              name="confirmPassword"
              maxLength={128}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={
                error
                  ? "register-error"
                  : undefined
              }
            />

            <div className="flex items-center gap-2 rounded-xl border border-[#e4eee7] bg-[#f7fbf8] px-3.5 py-2.5 text-[10px] font-semibold text-[#718078]">
              <LockKeyhole size={13} className="shrink-0 text-[#087b49]" aria-hidden="true" />
              <span>Your account keeps your Eco-Sort activity personal and organized.</span>
            </div>

            {/* ERROR */}

            {error && (
              <div
                id="register-error"
                className="rounded-xl border border-[#f1d1d1] bg-[#fff6f6] px-4 py-3 text-xs font-bold text-[#a33a3a]"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              aria-describedby={
                error
                  ? "register-error"
                  : undefined
              }
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#087b49] px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(8,123,73,.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#076d41] hover:shadow-[0_16px_32px_rgba(8,123,73,.22)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087b49] focus-visible:ring-offset-2"
            >
              {loading ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />

                  <span>
                    Creating account...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Create Account
                  </span>

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                  />
                </>
              )}
            </button>

            {/* LOGIN */}

            <p className="text-center text-xs text-[#718078]">
              Already have an account?{" "}
              <Link
                to="/login"
                state={loginState}
                className="rounded px-1 font-black text-[#087b49] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63b985] focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   TEXT FIELD
========================================================= */

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  ...props
}) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-black text-[#34443d]"
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          size={17}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#91a098]"
        />

        <input
          id={id}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          type={type}
          placeholder={placeholder}
          className="w-full rounded-[14px] border border-[#dfe7e2] bg-[#fbfdfc] py-3.5 pl-11 pr-4 text-sm text-[#17372f] shadow-sm outline-none transition duration-200 placeholder:text-[#a2ada7] hover:border-[#c8d9cf] focus:border-[#63b985] focus:bg-white focus:ring-4 focus:ring-[#63b985]/10 disabled:cursor-not-allowed disabled:opacity-60"
          {...props}
        />
      </div>
    </div>
  );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
  label,
  value,
  onChange,
  show,
  setShow,
  placeholder,
  ...props
}) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-black text-[#34443d]"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={17}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#91a098]"
        />

        <input
          id={id}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full rounded-[14px] border border-[#dfe7e2] bg-[#fbfdfc] py-3.5 pl-11 pr-12 text-sm text-[#17372f] shadow-sm outline-none transition duration-200 placeholder:text-[#a2ada7] hover:border-[#c8d9cf] focus:border-[#63b985] focus:bg-white focus:ring-4 focus:ring-[#63b985]/10 disabled:cursor-not-allowed disabled:opacity-60"
          {...props}
        />

        <button
          type="button"
          onClick={() =>
            setShow((value) => !value)
          }
          disabled={props.disabled}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#738179] transition hover:bg-[#eef7f1] hover:text-[#087b49] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63b985]"
          aria-label={
            show
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={show}
        >
          {show ? (
            <EyeOff
              size={17}
              aria-hidden="true"
            />
          ) : (
            <Eye
              size={17}
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   VALIDATION
========================================================= */

function isValidEmail(value) {
  /*
   * Client-side validation is intentionally lightweight.
   * The backend remains the source of truth for account
   * validation and email uniqueness.
   */
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

/* =========================================================
   SAFE DESTINATION
========================================================= */

function getSafeDestination(destination) {
  /*
   * Support both:
   *
   * "/dashboard"
   *
   * and React Router locations:
   *
   * {
   *   pathname: "/analytics",
   *   search: "?view=categories",
   *   hash: "#chart"
   * }
   */

  if (typeof destination === "string") {
    if (
      !destination.startsWith("/") ||
      destination.startsWith("//")
    ) {
      return "/dashboard";
    }

    return destination;
  }

  if (
    destination &&
    typeof destination === "object"
  ) {
    const pathname =
      typeof destination.pathname === "string"
        ? destination.pathname
        : "";

    const search =
      typeof destination.search === "string"
        ? destination.search
        : "";

    const hash =
      typeof destination.hash === "string"
        ? destination.hash
        : "";

    if (
      !pathname.startsWith("/") ||
      pathname.startsWith("//")
    ) {
      return "/dashboard";
    }

    return {
      pathname,
      search,
      hash,
    };
  }

  return "/dashboard";
}