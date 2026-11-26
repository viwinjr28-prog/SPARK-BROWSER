# Spark Browser

Spark Browser is a starter desktop browser with a custom SparkOS-inspired interface, built with Electron.

## Build a Mac DMG with GitHub Actions (no local commands)

1. Create a new GitHub repository named `spark-browser`.
2. Upload **all files and folders** from this project to the repository. Make sure the `.github/workflows/build-dmg.yml` file is included.
3. Open the repository's **Actions** tab.
4. Select **Build Spark Browser DMG** in the left sidebar.
5. Click **Run workflow** and confirm with the green **Run workflow** button.
6. Wait for the workflow to finish, open the completed run, then find **Artifacts** at the bottom.
7. Download `Spark-Browser-macOS-DMG.zip` and unzip it to get `Spark-Browser-1.0.0-macOS-universal.dmg`.

The workflow also runs automatically when you push a version tag beginning with `v`.

## What's included

- Multiple tabs
- Address bar with web search
- Back, forward, reload and home
- Quick links on the new-tab page
- Basic saved bookmarks
- Persistent browser session storage
- GitHub Actions workflow to build a universal macOS DMG

## Important notes

- GitHub Actions builds the DMG in the cloud; this project does not contain a prebuilt DMG.
- The DMG is not code-signed or notarized. macOS may show a security warning when opening it. A Developer ID certificate and Apple notarization setup are needed for a smoother public release.
- This is an early browser starter. Add and test a download manager, permissions handling, popup handling, safe-browsing protections, and more complete bookmark management before public release.
