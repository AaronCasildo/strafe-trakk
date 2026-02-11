// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::thread;
use tauri::{Emitter, Manager};
use serde::Serialize;

#[derive(Serialize, Clone)]
struct KeyEvent {
    key: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        // Set up the key listener in a separate thread
        .setup(|app| {
            let app_handle = app.handle().clone(); // Clone the app handle for use in the thread
            
            // Spawn a new thread to listen for key events
            thread::spawn(move || { 
                rdev::listen(move |event| {
                    if let rdev::EventType::KeyPress(key) = event.event_type {
                        let key_str = format!("{:?}", key);
                        // Emit to all windows
                        for (_label, window) in app_handle.webview_windows() {
                            let _ = window.emit("key-pressed", KeyEvent { key: key_str.clone() });
                        }
                    }
                }).unwrap(); // Handle potential errors from the listener
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub fn handle_key_press(key: rdev::Key) {
    // Handle key press events here
    println!("Key pressed: {:?}", key);
}