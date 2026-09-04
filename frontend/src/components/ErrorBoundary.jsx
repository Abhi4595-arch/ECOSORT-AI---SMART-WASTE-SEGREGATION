import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f9] px-5 py-10">
        <section
          className="w-full max-w-lg rounded-3xl border border-[#e3e8eb] bg-white p-8 text-center shadow-sm"
          role="alert"
          aria-labelledby="error-boundary-title"
        >
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1cc] text-[#a66b00]"
            aria-hidden="true"
          >
            <AlertTriangle size={28} />
          </div>

          <h1
            id="error-boundary-title"
            className="mt-5 text-2xl font-bold text-[#1f2a2e]"
          >
            Something went wrong
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#68747a]">
            Eco-Sort hit an unexpected UI error. Your saved account data is
            safe. Reload the page to continue.
          </p>

          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1f7a4d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17633e] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d] focus-visible:ring-offset-2"
          >
            <RefreshCw size={17} aria-hidden="true" />
            <span>Reload Eco-Sort</span>
          </button>
        </section>
      </main>
    );
  }
}