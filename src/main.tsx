import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handler for uncaught errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error("[GlobalError]", { message, source, lineno, colno, error });
  
  // Handle chunk loading failures - reload the page to get fresh assets
  const errorMessage = String(message || error?.message || "");
  if (
    errorMessage.includes("Loading chunk") ||
    errorMessage.includes("Failed to fetch dynamically imported module") ||
    errorMessage.includes("Importing a module script failed")
  ) {
    console.warn("[ChunkError] Detected stale chunk, attempting recovery...");
    // Clear any cached modules and reload
    if ("caches" in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    // Reload after a brief delay to allow cache clearing
    setTimeout(() => {
      window.location.reload();
    }, 100);
    return true; // Prevent default error handling
  }
};

window.onunhandledrejection = (event) => {
  console.error("[UnhandledPromise]", event.reason);
  
  // Handle chunk loading failures in promises
  const reason = String(event.reason?.message || event.reason || "");
  if (
    reason.includes("Loading chunk") ||
    reason.includes("Failed to fetch dynamically imported module") ||
    reason.includes("Importing a module script failed")
  ) {
    console.warn("[ChunkError] Detected stale chunk in promise, attempting recovery...");
    event.preventDefault();
    if ("caches" in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
};

const container = document.getElementById("root");

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error("[RenderError]", error);
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: system-ui, sans-serif;">
        <div style="text-align: center; max-width: 400px;">
          <h1 style="color: #b91c1c; font-size: 1.5rem; margin-bottom: 1rem;">Failed to load application</h1>
          <p style="color: #666; margin-bottom: 1rem;">Please try refreshing the page.</p>
          <button onclick="location.reload()" style="padding: 8px 16px; background: #2a5a4a; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
} else {
  console.error("[RenderError] Root container not found");
}