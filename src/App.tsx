import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./App.css";

function App() {
  const [lastKey, setLastKey] = useState("");
  const [keyHistory, setKeyHistory] = useState("");
  const [timeSinceLast, setTimeSinceLast] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
  
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      unsubscribe = await listen("key-pressed", (event: any) => {
        const eventKey = event.payload.key;
        const timeMs = event.payload.time_since_release_ms;
        setLastKey(eventKey);
        setKeyHistory((prev) => prev + eventKey);

        if (event.payload.time_since_release_ms < 300) {
        setTimeSinceLast(timeMs);
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
            <div className="dropdown-item">Sign In</div>
            <div className="dropdown-item">Log In</div>
            <div className="dropdown-item" onClick={openSettingsWindow}>Settings</div>
          </div>
        )}
      </div>

      <main className="container">
        <h1>Strafe Trakk</h1>

        <p>Last key pressed: {lastKey}</p>
        <p>Time since key release: {timeSinceLast !== null ? `${timeSinceLast} ms` : 'N/A'}</p>
        <p>History of keys pressed: {keyHistory.slice(-10)}</p>
      </main>
    </>
  );
}

export default App;
