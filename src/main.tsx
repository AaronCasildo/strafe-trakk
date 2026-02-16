import ReactDOM from "react-dom/client";
import App from "./App";
import Settings from "./Settings";

const root = document.getElementById("root") as HTMLElement;

// Simple routing based on current path
const pathname = window.location.pathname;

ReactDOM.createRoot(root).render(
  pathname === "/settings" ? <Settings /> : <App />
);
