import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Last line of defence for the React tree.
 *
 * Without a boundary, one failed render (a malformed API response, a browser
 * extension, a stale chunk after a deploy) unmounts the whole app and leaves a
 * blank white page. This keeps the header and footer usable and offers a
 * reload, which is also what fixes stale-chunk errors after a redeploy.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Console only: there is no error-reporting vendor wired up, and shipping
    // stack traces to a third party without consent would be worse than a log.
    console.error("Unhandled UI error", error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
          <p className="mb-6 text-muted-foreground">
            The page could not finish loading. Reloading usually fixes it — your bookings and account
            are safe.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" /> Reload the page
          </button>
          <p className="mt-6 text-xs text-muted-foreground">
            Still stuck? Email{" "}
            <a href="mailto:help@meraki.et" className="underline">
              help@meraki.et
            </a>
          </p>
        </div>
      </div>
    );
  }
}
