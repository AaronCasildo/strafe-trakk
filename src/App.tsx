import { useState, useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import StrafeHistogram from "./StrafeHistogram";
import "./App.css";

const DEFAULT_THRESHOLD = 300;

function App() {
  const [timeSinceLast, setTimeSinceLast] = useState<number | null>(null);
  const [timings, setTimings] = useState<number[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const clearTimings = useCallback(() => setTimings([]), []);

  const threshold = Number(localStorage.getItem("strafeThresholdMs")) || DEFAULT_THRESHOLD;
  const leftKey = localStorage.getItem("strafeLeftKey") || "A";
  const rightKey = localStorage.getItem("strafeRightKey") || "D";

  const openSettingsWindow = async () => {
    const settingsWindow = new WebviewWindow('settings', {
      url: '/settings',
      title: 'Settings',
      width: 600,
      height: 670,
      resizable: false,
      center: true,
    });

    settingsWindow.once('tauri://created', function () {
      console.log('Settings window created');
    });

    settingsWindow.once('tauri://error', function (e) {
      console.error('Error creating settings window:', e);
    });
  };
  
  // Reload when settings are saved
  useEffect(() => {
    let unsub: (() => void) | null = null;
    const setup = async () => {
      unsub = await listen("settings-changed", () => {
        window.location.reload();
      });
    };
    setup();
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      unsubscribe = await listen("key-pressed", (event: any) => {
        const eventKey = event.payload.key;
        const pairKey = event.payload.pair_key;
        const timeMs = event.payload.time_since_release_ms;

        // Only track the configured strafe keys
        if (eventKey !== leftKey && eventKey !== rightKey) return;

        // The paired key (the other key involved) must also be a strafe key
        if (pairKey != null && pairKey !== leftKey && pairKey !== rightKey) return;
        
        // Update timing if it's a valid value
        if (timeMs != null) {
          // Check absolute value against threshold
          if (Math.abs(timeMs) < threshold) {
            setTimeSinceLast(timeMs);
            setTimings(prev => [...prev, timeMs]);
          }
        }
      });
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <>
      <div className="dropdown">
        <button className="dropdown-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '▼' : '►'} Options
        </button>
        {isMenuOpen && (
          <div className="dropdown-content">
            {/* <div className="dropdown-item">Sign In</div>
            <div className="dropdown-item">Log In</div> */}
            {/* Reserved for future implementation */}
            <div className="dropdown-item" onClick={openSettingsWindow}>Settings</div>
          </div>
        )}
      </div>

      <main className="container">
        <h1>Strafe Trakk</h1>
        <p>
          Counter-strafe timing: {timeSinceLast !== null 
            ? `${timeSinceLast} ms ${timeSinceLast < 0 ? '(early overlap)' : '(clean)'}`
            : 'N/A'}
        </p>
        <p>Threshold: {threshold} ms</p>

        <div className="chart-section">
          <div className="chart-header">
            <h2>Strafe Distribution</h2>
            <button className="clear-btn" onClick={clearTimings}>Clear</button>
          </div>
          <StrafeHistogram timings={timings} binSize={10} range={threshold} />
          <p className="timing-count">{timings.length} strafes recorded</p>
        </div>
      </main>
    </>
  );
}

export default App;
