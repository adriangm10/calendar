// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use std::path::PathBuf;

use rusqlite::{Connection, params};
use todo::Todo;
pub mod todo;

#[tauri::command]
fn month_events(year: usize, month: usize, app_handle: tauri::AppHandle) -> Result<Vec<Todo>, todo::Error> {
    let app_dir = app_handle.path_resolver().app_data_dir();
    let mut path = app_dir.ok_or(rusqlite::Error::InvalidPath(PathBuf::new()))?;
    path.push("db.sqlite");
    let mut events: Vec<Todo> = Vec::new();

    let conn = Connection::open(path)?;
    let mut stmt = conn.prepare(
        "SELECT year, month, day, finished, msg
        FROM events
        WHERE year = ?1 AND month = ?2"
    )?;
    let mut rows = stmt.query([year, month])?;
    while let Some(row) = rows.next()? {
        events.push(Todo::new(row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?));
    }

    return Ok(events);
}

#[tauri::command]
fn write_todo(year: usize, month: usize, day: usize, msg: String, app_handle: tauri::AppHandle) -> Result<String, todo::Error> {
    let app_dir = app_handle.path_resolver().app_data_dir();
    let mut path = app_dir.ok_or(rusqlite::Error::InvalidPath(PathBuf::new()))?;
    path.push("db.sqlite");
    let conn = Connection::open(path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS events(
            year INTEGER,
            month INTEGER,
            day INTEGER,
            finished BOOLEAN DEFAULT(FALSE),
            msg TEXT
        )", ()
    )?;

    conn.execute(
        "INSERT INTO events(year, month, day, msg)
        VALUES (?1, ?2, ?3, ?4)",
        params![year, month, day, msg]
    )?;
    
    Ok("The event was succesfully created".into())
}

#[tauri::command]
fn mark_finished(year: usize, month: usize, day: usize, msg: String, app_handle: tauri::AppHandle) -> Result<(), todo::Error>{
    let app_dir = app_handle.path_resolver().app_data_dir();
    let mut path = app_dir.ok_or(rusqlite::Error::InvalidPath(PathBuf::new()))?;
    path.push("db.sqlite");

    let conn = Connection::open(path)?;

    conn.execute(
        "UPDATE events
        SET finished = TRUE
        WHERE year = ?1 AND month = ?2 AND day = ?3 AND msg = ?4",
        params![year, month, day, msg]
    )?;

    Ok(())
}

#[tauri::command]
fn remove_todo(year: usize, month: usize, day: usize, msg: String, app_handle: tauri::AppHandle) -> Result<(), todo::Error>{
    let app_dir = app_handle.path_resolver().app_data_dir();
    let mut path = app_dir.ok_or(rusqlite::Error::InvalidPath(PathBuf::new()))?;
    path.push("db.sqlite");

    let conn = Connection::open(path)?;

    conn.execute(
        "DELETE FROM events
        WHERE year = ?1 AND month = ?2 AND day = ?3 AND msg = ?4", 
        params![year, month, day, msg]
    )?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![month_events, write_todo, remove_todo, mark_finished])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
