use std::{fmt, str::FromStr};

use serde::{Serialize, Deserialize};

#[derive(PartialEq, Eq, Serialize, Deserialize)]
pub struct Todo {
    year: usize,
    month: usize,
    day: usize,
    msg: String,
}

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error)
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer {
            serializer.serialize_str(self.to_string().as_ref())
    }
}


impl Todo {
    pub fn new() -> Self {
        Todo { year: 0, month: 0, day: 0, msg: "".to_string() }
    }

    pub fn create(year: usize, month: usize, day: usize, msg: String) -> Self {
        Todo { year, month, day, msg }
    }

    pub fn year(&self) -> usize {
        self.year
    }

    pub fn month(&self) -> usize {
        self.month
    }

    pub fn day(&self) -> usize {
        self.day
    }

    pub fn msg(&self) -> &str {
        &self.msg
    }
}

#[derive(Debug, PartialEq, Eq)]
pub struct ParseEventError;

impl fmt::Display for Todo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}/{}/{}: {}", self.year, self.month, self.day, self.msg)
    }
}

impl FromStr for Todo {
    type Err = ParseEventError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let ev: Vec<&str> = s.splitn(3, "/").collect();
        let mut event = Todo::new();
        event.year = ev[0].parse::<usize>().map_err(|_| ParseEventError)?;
        event.month = ev[1].parse::<usize>().map_err(|_| ParseEventError)?;
        let (day, msg) = ev[2].split_once(":").ok_or(ParseEventError)?;
        event.day = day.parse::<usize>().map_err(|_| ParseEventError)?;
        event.msg = msg.to_string();
        return Ok(event);
    }
}
