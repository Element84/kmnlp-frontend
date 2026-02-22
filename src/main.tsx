import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.scss";

async function enableMocking() {
  // Only enable mocking in development and when explicitly enabled
  if (
    import.meta.env.NODE_ENV !== "development" ||
    import.meta.env.VITE_ENABLE_MSW === "false"
  ) {
    return;
  }

  const { worker } = await import("./mocks/browser");

  // Start the worker and wait for it to be ready
  return worker.start({
    onUnhandledRequest: "warn",
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
