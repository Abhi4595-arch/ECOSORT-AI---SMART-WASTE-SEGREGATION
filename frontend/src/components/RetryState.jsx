import { AlertTriangle, RefreshCw } from "lucide-react";

export default function RetryState({
  title = "We couldn't load this section",
  message = "Something went wrong while fetching your data.",
  onRetry,
}) {
  return (
    <div
      className="rounded-2xl border border-[#f0d9a8] bg-[#fffaf0] p-5"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 rounded-xl bg-[#fff1cc] p-2 text-[#a66b00]"
          aria-hidden="true"
        >
          <AlertTriangle size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[#1f2a2e]">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-[#68747a]">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1f7a4d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17633e] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d] focus-visible:ring-offset-2"
            >
              <RefreshCw size={16} aria-hidden="true" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}