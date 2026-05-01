import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You could log this to a backend monitoring service later
    console.error("UI Crashed:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F8] p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-[#A32D2D] mb-4" />
          <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Something went wrong</h1>
          <p className="text-[14px] text-[#5F5E5A] mb-6 max-w-md">
            The application encountered an unexpected error: {this.state.errorMessage}
          </p>
          <button
            onClick={() => window.location.assign("/")}
            className="px-6 py-2.5 bg-[#185FA5] text-white text-[14px] font-medium rounded-lg hover:bg-[#185FA5]/90"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}