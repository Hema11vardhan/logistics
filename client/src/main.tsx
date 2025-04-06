import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { handleRedirectResult } from "@/lib/firebase";

// Check for Firebase redirect results on page load
// This handles when a user is redirected back after Google login
window.addEventListener('load', async () => {
  try {
    await handleRedirectResult();
  } catch (error) {
    console.error("Firebase redirect handling error:", error);
  }
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="logistix-theme">
    <App />
  </ThemeProvider>
);
