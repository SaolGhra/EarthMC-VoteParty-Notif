# EarthMC VoteParty Notifier

A Chrome extension that helps you track EarthMC's Vote Party progress and search for players, towns, and nations.

## Features

- Real-time Vote Party progress tracking
- Desktop notifications for Vote Party milestones
- Search functionality for:
  - Players
  - Towns
  - Nations
- Server statistics display
  - Online players
  - Total towns
  - Total nations
  - Total residents

## Installation

1. Download the latest release and extract the ZIP file
2. Open Chrome and go to `chrome://extensions/` (this can differ depending on browser i.e `brave://extensions` etc)
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extracted folder

## Usage

1. Click the extension icon in your browser toolbar to view:

   - Current server statistics
   - Vote Party progress
   - Search interface for players/towns/nations

2. Vote Party notifications will appear when:
   - Reaching milestone thresholds (500, 250, 100, 50, 40, 30, 20, 10 votes remaining)
   - At the start of each hour
   - When approaching Vote Party completion

## Development

1. Clone the repository
2. Make your changes
3. Test locally by loading the unpacked extension
4. To package:
   - Create a ZIP file containing all files except `.git` and any development files
   - Make sure `manifest.json` is in the root of the ZIP

## Permissions

- `notifications`: For Vote Party alerts
- `alarms`: For scheduling checks
- Access to `api.earthmc.net`: For fetching server data
