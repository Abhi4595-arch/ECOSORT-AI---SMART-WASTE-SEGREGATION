export default function PageLoading({
  label = "Loading Eco-Sort…",
}) {
  return (
    <div
      className="flex min-h-[320px] items-center justify-center px-5 py-12"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-4 border-[#dceee6]"
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#087f5b]"
            aria-hidden="true"
          />

          <div
            className="h-7 w-7 rounded-full bg-[#e8f7f0] shadow-inner"
            aria-hidden="true"
          />

          <div
            className="absolute h-2.5 w-2.5 rounded-full bg-[#087f5b]"
            aria-hidden="true"
          />
        </div>

        <p className="mt-5 text-sm font-bold tracking-[-0.01em] text-[#17352e]">
          {label}
        </p>

        <p className="mt-1.5 text-[11px] text-[#71847c]">
          Preparing your sustainable workspace
        </p>
      </div>
    </div>
  );
}