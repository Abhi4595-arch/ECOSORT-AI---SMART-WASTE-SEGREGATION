import { Component } from "react";
import { AlertTriangle, RefreshCw, Recycle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.error("Eco-Sort UI error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f8f6] px-5 py-10"
        role="alert"
      >
        {/* Decorative background */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#087f5b]/[0.06] blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#84cc16]/[0.07] blur-3xl"
          aria-hidden="true"
        />

        <section
          className="relative w-full max-w-md rounded-[24px] border border-[#dfe9e4] bg-white p-7 text-center shadow-[0_18px_45px_rgba(15,50,40,0.09)] sm:p-9"
          aria-labelledby="error-boundary-title"
        >
          {/* Brand */}
          <div className="mb-7 flex items-center justify-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#087f5b] text-white shadow-[0_6px_16px_rgba(8,127,91,0.16)]"
              aria-hidden="true"
            >
              <Recycle
                size={18}
                strokeWidth={2.3}
              />
            </div>

            <span className="text-sm font-black tracking-[-0.03em] text-[#17352e]">
              ECO-SORT AI
            </span>
          </div>

          {/* Error icon */}
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#fff5dc] text-[#a66b00] shadow-sm"
            aria-hidden="true"
          >
            <AlertTriangle
              size={29}
              strokeWidth={2}
            />
          </div>

          <h1
            id="error-boundary-title"
            className="mt-6 text-2xl font-black tracking-[-0.035em] text-[#17352e] sm:text-[27px]"
          >
            Something went wrong
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#687a73]">
            Eco-Sort encountered an unexpected UI error. Your saved account
            data is safe. Reload the application to continue.
          </p>

          <button
            type="button"
            onClick={this.handleReload}
            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#087f5b] px-5 py-3 text-sm font-bold text-white shadow-[0_7px_18px_rgba(8,127,91,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#056044] hover:shadow-[0_10px_24px_rgba(8,127,91,0.22)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f5b] focus-visible:ring-offset-2"
          >
            <RefreshCw
              size={16}
              strokeWidth={2.3}
              aria-hidden="true"
            />
            <span>Reload Eco-Sort</span>
          </button>

          <p className="mt-6 text-[10px] font-medium tracking-wide text-[#93a39d]">
            Intelligent Waste Identification &amp; Segregation Assistant
          </p>
        </section>
      </main>
    );
  }
}