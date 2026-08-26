# Ishu's Cute Focus Timer

A cute, local timer app for desktop use in the browser.

## Features

- Countdown timer with configurable minutes and seconds
- Custom points awarded only when the cycle is confirmed as successful
- Cute pastel theme for a sweet, gift-like feel
- Loads all bundled audio from the designated `assets/audio` folder
- Lets you choose exactly which audio should play
- Selected audio loops continuously when the timer finishes
- Silent mode if you do not want any audio at all
- Fallback chime if no audio clip is selected
- Local persistence using `localStorage` for points, cycles, and settings
- No backend or database required

## Files

- `index.html` - app structure
- `style.css` - cute theme and layout
- `script.js` - timer logic, audio handling, and local storage
- `refresh-audio.bat` - one-click audio manifest refresh helper
- `prepare-github-push.bat` - refreshes audio manifest and shows git status
- `publish-checklist.txt` - quick checklist before pushing to GitHub
- `assets/audio/` - bundled audio clips loaded into the in-app selector
- `assets/audio/audio-manifest.js` - generated list of bundled audio clips
- `tools/generate_audio_manifest.py` - refreshes the audio manifest after adding audio files
- `tools/prepare_audio_library.py` - converts media files in `assets/media/` into audio files in `assets/audio/`

## Run locally

Because this is a static app, you can use either of these simple options:

### Option 1: Open directly

Open `index.html` in your browser.

### Option 2: Use a local server

From this folder, run:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages deployment

1. Create a GitHub repository.
2. Push these files to the repository root on the `main` branch.
3. The included GitHub Actions workflow in `.github/workflows/deploy-pages.yml` will deploy the site automatically.
4. In GitHub, open **Settings > Pages** and ensure the source is **GitHub Actions** if prompted.
5. Wait for the Pages deployment workflow to finish, then open the published site.

## Adding more audio files later

1. Copy your new audio files into `assets/audio/`.
2. Run:

```powershell
py .\tools\generate_audio_manifest.py
```

3. Refresh the app or re-upload the updated files to GitHub.

### Easier helper options

- Double-click `refresh-audio.bat` to regenerate the audio manifest
- Double-click `prepare-github-push.bat` to regenerate the manifest and check git status before pushing

## Converting videos or mixed media into audio

If you later drop media files into `assets/media/`, run:

```powershell
py .\tools\prepare_audio_library.py
```

This converts supported media into `.mp3` files in `assets/audio/` and updates the manifest automatically.

## Audio note

The app loads all bundled audio files from `assets/audio/` using the generated manifest. Choose one in the UI, preview it, and that selected audio will loop when the timer finishes unless Silent mode is enabled.