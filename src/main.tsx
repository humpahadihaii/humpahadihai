import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Remove the static hero shell once React hydrates
const staticHero = document.getElementById("static-hero");
if (staticHero) {
  staticHero.remove();
}

createRoot(document.getElementById("root")!).render(<App />);
