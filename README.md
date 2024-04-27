# Description

A simple calendar app.

# Features

- Add events to a day.
- Remove an event.
- Mark an event as done.

# Screenshots

![month_preview](/assets/month.png)
![events_preview](/assets/events.png)

# Installation

```
pnpm install
pnpm tauri build
```

This commands will create 2 final products, an appimage in `src-tauri/target/release/bundle/appimage/calendar_0.0.0_amd64.AppImage` and a .deb in `src-tauri/target/release/bundle/deb/calendar_0.0.0_amd64.deb`.

If the `pnpm tauri build` command fails building the appimage you might have to `export NO_STRIP=true`.
You can check the error running `pnpm tauri build --verbose`.
