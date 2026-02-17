import { useState } from "react";
import "./App.css";

const DEFAULT_THRESHOLD = 300;

function Settings() {
  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("strafeThresholdMs");
    return saved ? Number(saved) : DEFAULT_THRESHOLD;
  });

  const handleSave = () => {
    localStorage.setItem("strafeThresholdMs", String(threshold));
    alert("Saved! Restart or refresh the main window to apply.");
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
          Events with an absolute timing above this value are ignored.
        </p>
        <button onClick={handleSave}>Save</button>
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
