import { useId, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const {
    login,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * If the user is already authenticated, there is
   * no reason to remain on the login page.
   *
   * If Login was reached because a protected page was
   * requested, preserve that destination.
   */
  if (isAuthenticated) {
    const destination = getSafeDestination(
      location.state?.from
    );

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

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await login(trimmedEmail, password);

      /*
       * ProtectedRoute passes the original requested
       * location through location.state.from.
       *
       * The destination can be either:
       * - a pathname string
       * - a React Router location object
       *
       * Supporting both keeps the login flow compatible
       * with existing links and redirects.
       */
      const destination = getSafeDestination(
        location.state?.from
      );

      navigate(destination, {
        replace: true,
      });
    } catch (requestError) {
      console.error(
        "Login error:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Preserve the protected destination when moving
   * from Login to Register.
   *
   * Example:
   *
   * /analytics → Login → Register → Login → /analytics
   */
  const registerState = location.state?.from
    ? {
        from: location.state.from,
      }
    : undefined;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue sorting smarter with Eco-Sort AI."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
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
            error ? "login-error" : undefined
          }
        />

        {/* PASSWORD */}

        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block text-[11px] font-black text-[#34443d]"
          >
            Password
          </label>

          <div className="relative">
            <LockKeyhole
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#91a098]"
            />

            <input
              id="login-password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              maxLength={128}
              required
              disabled={loading}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? "login-error" : undefined
              }
              className="w-full rounded-xl border border-[#dfe7e2] bg-[#fbfdfc] py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-[#63b985] focus:bg-white focus:ring-2 focus:ring-[#63b985]/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) => !value
                )
              }
              disabled={loading}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#738179] transition hover:bg-[#eef7f1] hover:text-[#087b49] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63b985]"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              aria-pressed={showPassword}
            >
              {showPassword ? (
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

        {/* ERROR */}

        {error && (
          <ErrorBox
            id="login-error"
            message={error}
          />
        )}

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087b49] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#087b49]/15 transition hover:bg-[#076d41] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087b49] focus-visible:ring-offset-2"
        >
          {loading ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />

              <span>
                Signing in...
              </span>
            </>
          ) : (
            <>
              <span>
                Sign In
              </span>

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </>
          )}
        </button>

        {/* REGISTER */}

        <p className="text-center text-xs text-[#718078]">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            state={registerState}
            className="rounded px-1 font-black text-[#087b49] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63b985] focus-visible:ring-offset-2"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

/* =========================================================
   TEXT FIELD
========================================================= */

function Field({
  label,
  type,
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
          name={
            label.toLowerCase() === "email"
              ? "email"
              : label.toLowerCase()
          }
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#dfe7e2] bg-[#fbfdfc] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#63b985] focus:bg-white focus:ring-2 focus:ring-[#63b985]/10 disabled:cursor-not-allowed disabled:opacity-60"
          {...props}
        />
      </div>
    </div>
  );
}

/* =========================================================
   AUTH SHELL
========================================================= */

function AuthShell({
  title,
  subtitle,
  children,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8f6] px-5 py-10">
      <div className="grid w-full max-w-[980px] overflow-hidden rounded-[28px] border border-[#e0e9e3] bg-white shadow-[0_25px_80px_rgba(23,60,45,.10)] lg:grid-cols-2">
        {/* DESKTOP BRAND PANEL */}

        <div className="hidden bg-[#033e35] p-12 text-white lg:block">
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

          <div className="mt-24">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#78d08d]">
              See Waste. Know Waste. Sort Right.
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em]">
              Turn everyday waste into smarter
              environmental decisions.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-[#b5d0c7]">
              Identify waste with AI, follow disposal
              guidance, and track your progress with
              your personal Eco-Sort dashboard.
            </p>
          </div>
        </div>

        {/* FORM PANEL */}

        <div className="p-7 sm:p-10 lg:p-12">
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
            Your Eco-Sort account
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#17372f]">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#738078]">
            {subtitle}
          </p>

          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   ERROR BOX
========================================================= */

function ErrorBox({
  message,
  id,
}) {
  return (
    <div
      id={id}
      className="rounded-xl border border-[#f1d1d1] bg-[#fff6f6] px-4 py-3 text-xs font-bold text-[#a33a3a]"
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

/*
 * Safely normalize a React Router destination.
 *
 * Accepted:
 *   "/dashboard"
 *
 * or:
 *   {
 *     pathname: "/analytics",
 *     search: "?view=categories",
 *     hash: "#distribution"
 *   }
 *
 * Rejected:
 *   "https://example.com"
 *   "//example.com"
 *   malformed values
 */
function getSafeDestination(destination) {
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