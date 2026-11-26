# Spark Browser 2.0 — Liquid Glass

A redesigned Electron browser shell with a translucent Liquid Glass-inspired interface.

## Included
- Redesigned tab strip and navigation toolbar
- Frosted-glass styling, layered gradients, subtle reflections and motion
- New-tab search and quick links
- Persistent bookmarks/favourites bar
- Light/dark appearance toggle
- Small app menu
- Keyboard shortcuts: Cmd/Ctrl+T (new tab), Cmd/Ctrl+L (focus address), Cmd/Ctrl+W (close tab)

## Build
1. Install Node.js (LTS).
2. Open this folder in Terminal.
3. Run `npm install`.
4. Run `npm start` to test.
5. Run `npm run dist` to package.

## Notes
This is a visual and usability overhaul of the existing Electron starter. It still uses Electron's embedded Chromium webview for page rendering; it does not turn Chromium into three separate browser engines. Browser extensions, full password syncing, private-window isolation, tracking protection, and production-grade download/history management are not implemented in this starter. The Liquid Glass appearance is an original design inspired by translucent desktop UI patterns, not copied Safari/Chrome/Firefox code.
