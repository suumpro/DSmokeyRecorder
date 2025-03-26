# DSmokeyRecorder

A browser test recorder that generates Playwright test code from your actions. Available as both a desktop application and a web server.

## Features

- 🎥 Record browser actions and generate test code automatically
- 💻 Support for both JavaScript and TypeScript
- 🎯 Custom test naming with date stamps
- 📝 Copy or download generated test code
- 🖥️ Full HD viewport support (1920x1080)
- 🚀 Real-time code preview
- 🖥️ Desktop application support (Windows, macOS, Linux)

## Desktop App Installation

### Download Pre-built App
1. Go to the [Releases](https://github.com/suumpro/DSmokeyRecorder/releases) page
2. Download the appropriate version for your operating system:
   - Windows: `.exe` installer or portable `.exe`
   - macOS: `.dmg` or `.zip`
   - Linux: `.AppImage` or `.deb`
3. Install and run the application

### Build from Source
1. Clone the repository:
```bash
git clone https://github.com/suumpro/DSmokeyRecorder.git
cd DSmokeyRecorder
```

2. Install dependencies:
```bash
npm install
```

3. Build the desktop application:
```bash
# For all platforms
npm run dist

# For specific platforms
npm run dist:mac    # macOS
npm run dist:win    # Windows
npm run dist:linux  # Linux
```

## Development

### Run as Web Server
1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to `http://localhost:3000`

### Run as Desktop App (Development)
1. Start the development version:
```bash
npm run electron-dev
```

## Usage

1. Enter the URL of the website you want to test

2. Click "Start Recording" and perform your actions in the browser

3. When finished, click "Stop Recording" and name your test

4. Download or copy the generated test code

## Requirements

- Node.js 14+ (for development)
- Playwright
- Modern web browser

## Version History

- 0.2.0 (2025-03-26)
  - Fixed download functionality with proper code formatting
  - Added detailed debug logging throughout the application
  - Improved code generation with better Playwright test structure
  - Added FHD (1920x1080) viewport support
  - Removed unnecessary boilerplate code from generated tests
  - Enhanced error handling and notifications
  - Fixed event listener issues
  - Added desktop application support (Electron)

- 0.1.0 (2024-03-15)
  - Initial release
  - Basic test recording functionality
  - Custom test naming support
  - Code generation with Playwright

## License

MIT License - feel free to use this in your projects! 