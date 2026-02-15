import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [lastKey, setLastKey] = useState("");
  const [keyHistory, setKeyHistory] = useState("");
  const [timeSinceLast, setTimeSinceLast] = useState<number | null>(null);
  
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      unsubscribe = await listen("key-pressed", (event: any) => {
        const eventKey = event.payload.key;
        const timeMs = event.payload.time_since_last_ms;
        setLastKey(eventKey);
        setKeyHistory((prev) => prev + eventKey);
        setTimeSinceLast(timeMs);
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
    <main className="container">
      <h1>Strafe Trakk</h1>
      <p>Last key pressed: {lastKey}</p>
      <p>Time since last key: {timeSinceLast !== null ? `${timeSinceLast} ms` : 'N/A'}</p>
      <p>History of keys pressed: {keyHistory.slice(-10)}</p>
    </main>
  );
}

export default App;
