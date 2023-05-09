// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

use std::{fs::File, io::{BufReader, BufRead, Write}, str::FromStr};

use todo::Todo;
pub mod todo;

#[tauri::command]
fn month_events(year: usize, month: usize, app_handle: tauri::AppHandle) -> Result<Vec<Todo>, todo::Error> {
    let app_dir = app_handle.path_resolver().app_data_dir();
    let mut path = app_dir.ok_or(std::io::Error::new(std::io::ErrorKind::Other, "could not get default path"))?;
    path.push("calendar_events.txt");
    let f = File::open(path)?;
    let mut events: Vec<Todo> = Vec::new();

    for line in BufReader::new(f).lines() {
        if let Ok(l) = line {
            let current_event = Todo::from_str(&l);
            if let Ok(ev) = current_event {
                if ev.year() == year && ev.month() == month {
                    events.push(ev);
                }
            }
        }
    }

    return Ok(events);
}

#[tauri::command]
fn write_todo(year: usize, month: usize, day: usize, msg: String, app_handle: tauri::AppHandle) -> Result<(), todo::Error> {
    let app_dir = app_handle.path_resolver().app_data_dir();
    let mut path = app_dir.ok_or(std::io::Error::new(std::io::ErrorKind::Other, "could not get default path"))?;
    path.push("calendar_events.txt");
    let mut f = File::options().append(true).create(true).open(path)?;
    let mut ev = Todo::new(year, month, day, msg).to_string();
    ev.push('\n');
    f.write_all(ev.as_bytes())?;

    f.sync_all()?;
    // String::from_str(path.to_str().ok_or(std::io::Error::new(std::io::ErrorKind::Other, "xd"))?).map_err(|_| std::io::Error::new(std::io::ErrorKind::Other, "xd"))?
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![month_events, write_todo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
