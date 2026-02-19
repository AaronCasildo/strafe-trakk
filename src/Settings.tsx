import { useState, useEffect, useRef } from "react";
import { listen, emit } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./App.css";

const DEFAULT_THRESHOLD = 300;

type BindingTarget = "left" | "right" | null;

function Settings() {
  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("strafeThresholdMs");
    return saved ? Number(saved) : DEFAULT_THRESHOLD;
  });
  const [leftKey, setLeftKey] = useState<string>(() => {
    return localStorage.getItem("strafeLeftKey") || "A";
  });
  const [rightKey, setRightKey] = useState<string>(() => {
    return localStorage.getItem("strafeRightKey") || "D";
  });
  const [listening, setListening] = useState<BindingTarget>(null);
  const listeningRef = useRef<BindingTarget>(null);

  // Keep ref in sync so the Tauri listener always sees the latest value
  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  // Listen for key-pressed events from the Rust backend for key binding
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setup = async () => {
      unsubscribe = await listen("any-key-pressed", (event: any) => {
        const target = listeningRef.current;
        if (!target) return;

        const key: string = event.payload;
        if (target === "left") {
          setLeftKey(key);
        } else {
          setRightKey(key);
        }
        setListening(null);
      });
    };

    setup();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleSave = async () => {
    if (leftKey === rightKey) {
      alert("Left and right keys must be different!");
      return;
    }
    localStorage.setItem("strafeThresholdMs", String(threshold));
    localStorage.setItem("strafeLeftKey", leftKey);
    localStorage.setItem("strafeRightKey", rightKey);
    await emit("settings-changed");
    getCurrentWebviewWindow().close();
  };

  return (
    <div className="container">
      <h1>Settings</h1>

      <div style={{ marginTop: "30px" }}>
        <label>
          Timing threshold (ms):{" "}
          <input
            type="number"
            min={1}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ width: "80px" }}
          />
        </label>
        <p style={{ fontSize: "0.85em", opacity: 0.7 }}>
          Strafes with an absolute timing above this value are ignored.
        </p>
      </div>

      <div style={{ marginTop: "0px" , textAlign: "center"}}>
        <h3>Strafe Keys</h3>
        <div style={{ display: "flex", gap: "20px", alignItems: "center", marginTop: "10px", justifyContent: "center" }}>
          <div>
            <span>Left: </span>
            <button
              onClick={() => setListening(listening === "left" ? null : "left")}
              style={{ minWidth: "80px" }}
            >
              {listening === "left" ? "Press a key…" : leftKey}
            </button>
          </div>
          <div>
            <span>Right: </span>
            <button
              onClick={() => setListening(listening === "right" ? null : "right")}
              style={{ minWidth: "80px" }}
            >
              {listening === "right" ? "Press a key…" : rightKey}
            </button>
          </div>
        </div>
        <p style={{ fontSize: "0.85em", opacity: 0.7 }}>
          Click a button then press the key you use to strafe in that direction.
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSave}>Save & Reload</button>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>About Strafe Trakk</h3>
        <p>Version 1.0.0</p>
        <p>Track your keyboard timing for improved strafing performance.</p>
      </div>
    </div>
  );
}

export default Settings;
