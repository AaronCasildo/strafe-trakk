// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::thread;
use std::time::{Duration, Instant};
use std::collections::{HashSet, HashMap};
use tauri::{Emitter, Manager, AppHandle};
use serde::Serialize;
use device_query::{DeviceQuery, DeviceState, Keycode};

#[derive(Serialize, Clone)]
struct KeyEvent {
    key: String,
    time_since_release_ms: Option<i128>,
}

/// Tracks the state of key presses and timing
struct KeyTracker {
    previous_keys: HashSet<Keycode>,
    key_press_times: HashMap<Keycode, Instant>,
    last_key_release_time: Option<Instant>,
}

impl KeyTracker {
    fn new() -> Self {
        Self {
            previous_keys: HashSet::new(),
            key_press_times: HashMap::new(),
            last_key_release_time: None,
        }
    }

    /// Calculate clean strafe timing (positive value)
    fn calculate_clean_strafe_timing(&self, current_time: Instant) -> Option<i128> {
        self.last_key_release_time.map(|last_release| {
            current_time.duration_since(last_release).as_millis() as i128
        })
    }

    /// Calculate counter-strafe timing (negative value)
    fn calculate_counter_strafe_timing(
        &self,
        current_time: Instant,
        held_keys: &HashSet<Keycode>,
    ) -> Option<i128> {
        held_keys
            .iter()
            .filter_map(|k| self.key_press_times.get(k))
            .max()
            .map(|&most_recent_time| {
                -(current_time.duration_since(most_recent_time).as_millis() as i128)
            })
    }

    /// Handle newly pressed keys
    fn handle_key_press(
        &mut self,
        key: &Keycode,
        current_time: Instant,
        app_handle: &AppHandle,
    ) {
        let key_str = format!("{:?}", key);
        self.key_press_times.insert(*key, current_time);

        let was_key_held = !self.previous_keys.is_empty();

        if !was_key_held {
            // Clean strafe scenario
            if let Some(timing) = self.calculate_clean_strafe_timing(current_time) {
                emit_key_event(app_handle, key_str, Some(timing));
            }
        }
        // Counter-strafe timing will be calculated on key release
    }

    /// Handle newly released keys
    fn handle_key_release(
        &mut self,
        released_key: &Keycode,
        current_time: Instant,
        held_keys: &HashSet<Keycode>,
        app_handle: &AppHandle,
    ) {
        self.last_key_release_time = Some(current_time);

        if !held_keys.is_empty() {
            // Counter-strafe scenario
            if let Some(timing) = self.calculate_counter_strafe_timing(current_time, held_keys) {
                let key_str = format!("{:?}", released_key);
                emit_key_event(app_handle, key_str, Some(timing));
            }
        }

        self.key_press_times.remove(released_key);
    }

    /// Update the previous keys state
    fn update_state(&mut self, current_keys: HashSet<Keycode>) {
        self.previous_keys = current_keys;
    }
}

/// Emit a key event to all windows
fn emit_key_event(app_handle: &AppHandle, key: String, timing: Option<i128>) {
    for (_label, window) in app_handle.webview_windows() {
        let _ = window.emit("key-pressed", KeyEvent {
            key: key.clone(),
            time_since_release_ms: timing,
        });
    }
}

/// Main keyboard polling loop
fn run_keyboard_listener(app_handle: AppHandle) {
    thread::spawn(move || {
        let device_state = DeviceState::new();
        let mut tracker = KeyTracker::new();

        loop {
            let keys = device_state.get_keys();
            let current_keys: HashSet<Keycode> = keys.into_iter().collect();
            let current_time = Instant::now();

            // Collect newly pressed and released keys first
            let newly_pressed: Vec<Keycode> =
                current_keys.difference(&tracker.previous_keys).copied().collect();
            let newly_released: Vec<Keycode> =
                tracker.previous_keys.difference(&current_keys).copied().collect();

            // Handle newly pressed keys
            for key in newly_pressed {
                tracker.handle_key_press(&key, current_time, &app_handle);
            }

            // Handle newly released keys
            for released_key in newly_released {
                tracker.handle_key_release(&released_key, current_time, &current_keys, &app_handle);
            }

            tracker.update_state(current_keys);

            // Small delay to avoid excessive CPU usage
            thread::sleep(Duration::from_millis(1));
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            run_keyboard_listener(app_handle);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}