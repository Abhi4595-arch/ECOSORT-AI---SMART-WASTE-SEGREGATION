import { AlertTriangle, RefreshCw } from "lucide-react";

export default function RetryState({
  title = "We couldn't load this section",
  message = "Something went wrong while fetching your data.",
  onRetry,
}) {
  return (
    <div
      className="rounded-2xl border border-[#f0d9a8] bg-gradient-to-br from-[#fffaf0] to-[#fffdf8] p-5 shadow-[0_4px_16px_rgba(120,85,20,0.05)] sm:p-6"
      role="alert"
    >
      <div className="flex items-start gap-3.5">
        {/* Error icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1cc] text-[#a66b00] shadow-sm"
          aria-hidden="true"
        >
          <AlertTriangle
            size={19}
            strokeWidth={2.2}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold tracking-[-0.01em] text-[#26332e] sm:text-[15px]">
            {title}
          </h3>

          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#687871] sm:text-sm sm:leading-6">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#087f5b] px-4 py-2.5 text-xs font-bold text-white shadow-[0_5px_14px_rgba(8,127,91,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#056044] hover:shadow-[0_8px_18px_rgba(8,127,91,0.2)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f5b] focus-visible:ring-offset-2"
            >
              <RefreshCw
                size={15}
                strokeWidth={2.3}
                aria-hidden="true"
              />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}