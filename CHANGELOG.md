# Changelog

All notable changes to DriverUpdate Pro will be documented in this file.

## [1.2.0] - 2026-05-04

### ✨ New Features

- **Driver Tools Tab**: Added a dedicated Driver Tools tab for quick access to driver-related tools and download actions from within the app.
- **Direct NVIDIA Driver Packages**: NVIDIA display drivers can now resolve and download the latest official package directly inside the app instead of only opening a browser page.
- **NVIDIA Download Controls**: Added live download progress, pause, resume, cancel, folder reveal, and a persistent title-bar download indicator.
- **Flexible NVIDIA Actions**: Users can now choose between **Direct package download** and **Smart link** mode in Settings.
- **Startup Automation**: Added optional automatic NVIDIA package download after the startup scan when Direct package mode is enabled.
- **Notification Center**: Added a title-bar notification button with a clearable history for downloads, update events, and other in-app notifications.
- **Background Mode**: Added a close-to-tray option so the app can keep running in the background when the window is closed.

### 🛠 Improvements

- **Accurate NVIDIA Version Checks**: Replaced the stale hardcoded NVIDIA latest-version placeholder with a live lookup against NVIDIA's current DCH driver results.
- **Correct NVIDIA Package Selection**: Fixed RTX 20 desktop product mappings and updated the NVIDIA lookup flow to prefer the current DCH branch over the older legacy branch.
- **Automatic App Update Downloads**: When automatic app update checks are enabled, available app updates now start downloading automatically.
- **Version Consistency**: Normalized the app version to **1.2.0** across package metadata, UI badges, and the generated Windows installer.
- **Settings Polish**: Improved the Settings layout, added a proper close button to the notification panel, and cleaned up NVIDIA settings visuals.

### ✅ Validation

- Verified with repeated successful `npm run build` runs.
- Confirmed packaged installer output as **DriverUpdate Pro Setup 1.2.0.exe**.

## [1.1.0] - 2026-01-30

### ✨ New Features

- **Direct Download Links**: Clicking on a driver now opens the manufacturer's download page with your specific product pre-selected!
  - **NVIDIA**: 40+ GPU models supported (RTX 50/40/30/20 Series, GTX 16/10 Series, Laptop variants)
  - **AMD**: 30+ products (Radeon RX 9000/7000/6000/5000 Series, Ryzen processors, Chipsets)
  - **Intel**: 25+ products (Arc GPUs, Iris/UHD Graphics, Wi-Fi adapters, Ethernet, Chipsets)

### 🎯 How It Works

Instead of landing on a generic manufacturer page and searching for your driver:
- The app now detects your specific GPU/device model
- Generates a direct URL with pre-filled parameters
- Opens the download page with your product already selected

**Example:**
- Before: `nvidia.com/Download/index.aspx` → Manual search required
- After: `nvidia.com/Download/index.aspx?psid=127&pfid=1045&osid=57` → RTX 4070 pre-selected!

### 📋 Supported Products

#### NVIDIA GeForce
- RTX 50 Series: 5090, 5080, 5070 Ti, 5070
- RTX 40 Series: 4090, 4080 Super/Base, 4070 Ti Super/Ti/Super/Base, 4060 Ti/Base
- RTX 30 Series: 3090 Ti/Base, 3080 Ti/Base, 3070 Ti/Base, 3060 Ti/Base, 3050
- RTX 20 Series: 2080 Ti/Super/Base, 2070 Super/Base, 2060 Super/Base
- GTX 16 Series: 1660 Ti/Super/Base, 1650 Super/Base
- GTX 10 Series: 1080 Ti/Base, 1070 Ti/Base, 1060, 1050 Ti/Base
- Laptop variants for RTX 40/30 Series

#### AMD Radeon
- RX 9000 Series: 9070 XT, 9070
- RX 7000 Series: 7900 XTX/XT/GRE, 7800 XT, 7700 XT, 7600 XT/Base
- RX 6000 Series: 6950/6900/6800/6750/6700/6650/6600/6500/6400
- RX 5000 Series: 5700 XT/Base, 5600 XT, 5500 XT
- Ryzen Processors: 9/7/5/3 Series
- Chipsets: X670, X570, B650, B550

#### Intel
- Arc GPUs: A770, A750, A580, A380, A310
- Integrated Graphics: Iris Xe, Iris Plus, UHD 770/730/630/620
- Wi-Fi: 7 BE200, 6E AX411/AX211/AX210, 6 AX201/AX200, AC 9560/9462/9260/8265
- Ethernet: I225, I219, I211, Killer E3100/E2600
- Chipsets: Z790, Z690, B760, H770

---

## [1.0.0] - Initial Release

### Features
- Scan and detect all Windows drivers
- Display driver status (Up-to-date, Update Available, Unknown)
- Filter by device category and status
- Dark/Light theme support
- Auto-update checking
- One-click access to manufacturer download pages
