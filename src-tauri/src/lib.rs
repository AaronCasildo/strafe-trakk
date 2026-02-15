// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::thread;
use std::time::Duration;
use std::collections::HashSet;
use tauri::{Emitter, Manager};
use serde::Serialize;
use device_query::{DeviceQuery, DeviceState, Keycode};

#[derive(Serialize, Clone)]
struct KeyEvent {
    key: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // Set up the key listener in a separate thread
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            // Spawn a new thread to poll for key events
            thread::spawn(move || {
                let device_state = DeviceState::new();
                let mut previous_keys: HashSet<Keycode> = HashSet::new();
                
                loop {
                    let keys = device_state.get_keys();
                    let current_keys: HashSet<Keycode> = keys.into_iter().collect();
                    
                    // Detect newly pressed keys (keys in current but not in previous)
                    let newly_pressed: Vec<&Keycode> = current_keys.difference(&previous_keys).collect();
                    
                    for key in newly_pressed {
                        let key_str = format!("{:?}", key);
                        // Emit to all windows
                        for (_label, window) in app_handle.webview_windows() {
                            let _ = window.emit("key-pressed", KeyEvent { key: key_str.clone() });
                        }
                    }
                    
                    previous_keys = current_keys;
                    
                    // Small delay to avoid excessive CPU usage
                    thread::sleep(Duration::from_millis(10));
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}