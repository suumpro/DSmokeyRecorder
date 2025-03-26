# DSmokeyRecorder User Guide

Welcome to DSmokeyRecorder! This guide will walk you through installing and using our browser test recorder tool.

## Table of Contents
- [Installation](#installation)
  - [Desktop Application](#desktop-application)
  - [Web Version](#web-version)
- [Getting Started](#getting-started)
- [Recording Your First Test](#recording-your-first-test)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

## Installation

### Desktop Application

#### macOS
1. Download the latest `DSmokeyRecorder-{version}.dmg` from the [Releases](https://github.com/suumpro/DSmokeyRecorder/releases) page
2. Open the DMG file
3. Drag DSmokeyRecorder to your Applications folder
4. Open DSmokeyRecorder from your Applications folder

#### Windows
1. Download the latest `DSmokeyRecorder-Setup-{version}.exe` from the [Releases](https://github.com/suumpro/DSmokeyRecorder/releases) page
2. Run the installer
3. Follow the installation wizard
4. Launch DSmokeyRecorder from the Start menu

### Web Version
1. Clone the repository:
```bash
git clone https://github.com/suumpro/DSmokeyRecorder.git
cd DSmokeyRecorder
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open `http://localhost:3000` in your browser

## Getting Started

1. Launch DSmokeyRecorder
2. You'll see the main interface with:
   - URL input field
   - Test name field
   - Test description field
   - Start/Stop Recording buttons
   - Code preview area
   - Download button

## Recording Your First Test

1. Enter the target website URL in the URL field
2. Provide a meaningful test name (e.g., "Login Test")
3. Add a description of what the test will do
4. Click "Start Recording"
5. Perform the actions you want to test in the new browser window
6. Click "Stop Recording" when finished
7. Review the generated code in the preview area
8. Click "Download" to save the test file

## Advanced Features

### Custom Test Naming
- Use descriptive names for better organization
- The app automatically adds timestamps to prevent overwrites

### Test Description
- Add detailed descriptions to document test purposes
- Include any special requirements or prerequisites

### Code Download
- Generated code is formatted for readability
- Tests are saved with proper Playwright structure
- Includes viewport settings and browser configuration

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Error: `EADDRINUSE: address already in use :::3000`
   - Solution: Kill the existing process or change the port
   ```bash
   # Find and kill the process using port 3000
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Recording Not Starting**
   - Ensure Playwright browsers are installed:
   ```bash
   npx playwright install
   ```
   - Check if the URL is accessible
   - Verify you have proper permissions

3. **Code Not Generating**
   - Stop and restart the recording
   - Check the browser console for errors
   - Verify the temporary file permissions

### Getting Help

If you encounter issues not covered here:
1. Check the [GitHub Issues](https://github.com/suumpro/DSmokeyRecorder/issues)
2. Create a new issue with:
   - Detailed description of the problem
   - Steps to reproduce
   - Error messages
   - System information

## Tips for Better Testing

1. **Plan Your Tests**
   - Decide what to test before recording
   - Keep tests focused and atomic
   - Use clear, descriptive names

2. **Maintain Consistency**
   - Use consistent naming conventions
   - Group related tests together
   - Document special requirements

3. **Review Generated Code**
   - Understand the generated actions
   - Modify selectors if needed
   - Add assertions for better coverage

## Updates and Maintenance

- Check the [Releases](https://github.com/suumpro/DSmokeyRecorder/releases) page regularly for updates
- Update your installation when new versions are available
- Follow the project on GitHub for announcements

---

Need more help? Create an [issue](https://github.com/suumpro/DSmokeyRecorder/issues) or contribute to the documentation!