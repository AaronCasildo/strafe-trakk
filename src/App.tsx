import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [lastKey, setLastKey] = useState("");
  const [keyHistory, setKeyHistory] = useState("");
  
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      unsubscribe = await listen("key-pressed", (event: any) => {
        const eventKey = event.payload.key;
        setLastKey(eventKey);
        setKeyHistory((prev) => prev + eventKey);
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      setLastKey(event.key);
      setKeyHistory((prev) => prev + event.key);
    };

    setupListener();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <main className="container">
      <h1>Strafe Trakk</h1>
      <p>Last key pressed: {lastKey}</p>
      <p>History of keys pressed: {keyHistory.slice(-10)}</p>
    </main>
  );
}

export default App;
