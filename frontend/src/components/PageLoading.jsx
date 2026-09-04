export default function PageLoading({ label = "Loading Eco-Sort…" }) {
  return (
    <div
      className="flex min-h-[320px] items-center justify-center px-5 py-12"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dce8e1] border-t-[#1f7a4d]"
          aria-hidden="true"
        />

        <p className="mt-4 text-sm font-medium text-[#68747a]">
          {label}
        </p>
      </div>
    </div>
  );
}