import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [lastKey, setLastKey] = useState("");
  
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      unsubscribe = await listen("key-pressed", (event: any) => {
        setLastKey(event.payload.key);
        console.log("Key pressed:", event.payload.key);
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      setLastKey(event.key);
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
    </main>
  );
}

export default App;
