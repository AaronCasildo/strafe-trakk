import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./App.css";

const DEFAULT_THRESHOLD = 300;

function App() {
  const [lastKey, setLastKey] = useState("");
  const [keyHistory, setKeyHistory] = useState("");
  const [timeSinceLast, setTimeSinceLast] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const threshold = Number(localStorage.getItem("strafeThresholdMs")) || DEFAULT_THRESHOLD;
  const leftKey = localStorage.getItem("strafeLeftKey") || "A";
  const rightKey = localStorage.getItem("strafeRightKey") || "D";

  const openSettingsWindow = async () => {
    const settingsWindow = new WebviewWindow('settings', {
      url: '/settings',
      title: 'Settings',
      width: 600,
      height: 400,
      resizable: true,
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
        const timeMs = event.payload.time_since_release_ms;

        // Only track the configured strafe keys
        if (eventKey !== leftKey && eventKey !== rightKey) return;

        setLastKey(eventKey);
        
        // Update timing if it's a valid value
        if (timeMs != null) {
          setKeyHistory((prev) => prev + eventKey);
          // Check absolute value against threshold
          if (Math.abs(timeMs) < threshold) {
            setTimeSinceLast(timeMs);
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

        <p>Last key: {lastKey}</p>
        <p>
          Counter-strafe timing: {timeSinceLast !== null 
            ? `${timeSinceLast} ms ${timeSinceLast < 0 ? '(early overlap)' : '(clean)'}`
            : 'N/A'}
        </p>
        <p>History: {keyHistory.slice(-10)}</p>
        <p>Threshold: {threshold} ms</p>
      </main>
    </>
  );
}

export default App;
