// DOM Elements
const urlInput = document.getElementById('urlInput');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const codeOutput = document.getElementById('codeOutput');
const recordingIndicator = document.getElementById('recordingIndicator');
const typeScriptToggle = document.getElementById('typeScriptToggle');
const debugModeToggle = document.getElementById('debugModeToggle');
const debugPanel = document.getElementById('debugPanel');
const debugOutput = document.getElementById('debugOutput');
const clearDebugBtn = document.getElementById('clearDebugBtn');

// State
let isRecording = false;
let currentCode = '';
let hasReceivedCode = false;
let debugLog = '';
let currentTestName = '';

// API endpoints
const API = {
    START: '/api/start',
    STOP: '/api/stop',
    CODE: '/api/code',
    DEBUG: '/api/debug'
};

// Format debug output
function formatDebugOutput(text) {
    return text.split('\n').map(line => {
        if (line.includes('[stdout]')) {
            return `<span class="debug-stdout">${line}</span>`;
        } else if (line.includes('[stderr]')) {
            return `<span class="debug-stderr">${line}</span>`;
        } else if (line.includes('[error]')) {
            return `<span class="debug-error">${line}</span>`;
        }
        return line;
    }).join('\n');
}

// Update debug panel
function updateDebugPanel(newDebugInfo) {
    if (!debugModeToggle.checked) return;
    
    debugLog = newDebugInfo;
    debugOutput.innerHTML = formatDebugOutput(debugLog);
    debugOutput.scrollTop = debugOutput.scrollHeight;
}

// Format code for display
function formatCode(code) {
    if (!code) return '// Your test code will appear here when you start recording...';
    
    // If it's TypeScript, add the proper import and test name
    if (typeScriptToggle.checked) {
        if (!code.includes('import')) {
            code = `import { test, expect } from '@playwright/test';\n\n${code}`;
        }
        if (currentTestName && !code.includes('test(')) {
            code = code.replace(/^(?!import)(.*)$/m, `test('${currentTestName}', async ({ page }) => {\n$1`);
            code += '\n});';
        }
    } else {
        if (currentTestName && !code.includes('test(')) {
            code = `test('${currentTestName}', async ({ page }) => {\n${code}\n});`;
        }
    }
    
    return code;
}

// Get formatted date string
function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
}

// Prompt for test name
async function promptTestName() {
    return new Promise((resolve) => {
        const defaultName = `test_${getFormattedDate()}`;
        const name = prompt('Enter a name for this test:', defaultName);
        resolve(name || defaultName);
    });
}

// Update UI based on recording state
function updateUI(recording) {
    isRecording = recording;
    startBtn.disabled = recording;
    stopBtn.disabled = !recording;
    urlInput.disabled = recording;
    recordingIndicator.style.display = recording ? 'flex' : 'none';
    
    if (!recording) {
        copyBtn.disabled = !currentCode;
        downloadBtn.disabled = !currentCode;
    }
}

// Show notification
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Poll for code updates when recording
let pollInterval;
async function pollForCode() {
    try {
        const response = await fetch(API.CODE);
        const data = await response.json();
        
        // Update debug info
        if (data.debug) {
            updateDebugPanel(data.debug);
        }
        
        if (data.code && data.code !== currentCode) {
            currentCode = data.code;
            hasReceivedCode = true;
            codeOutput.textContent = formatCode(currentCode);
            codeOutput.classList.add('has-code');
        }
        
        // Update UI if recording status changed
        if (data.isRecording !== isRecording) {
            updateUI(data.isRecording);
        }
    } catch (error) {
        console.error('Error polling for code:', error);
        showNotification('Error updating code preview', true);
    }
}

// Start recording
async function startRecording() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Please enter a valid URL', true);
        return;
    }
    
    try {
        const response = await fetch(API.START, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        if (!response.ok) {
            throw new Error('Failed to start recording');
        }
        
        hasReceivedCode = false;
        currentCode = '';
        debugLog = '';
        debugOutput.innerHTML = '';
        codeOutput.textContent = '// Recording started. Perform actions in the browser window...';
        codeOutput.classList.remove('has-code');
        
        updateUI(true);
        pollInterval = setInterval(pollForCode, 1000);
        showNotification('Recording started! Browser window will open shortly...');
    } catch (error) {
        console.error('Error starting recording:', error);
        showNotification('Failed to start recording. Please try again.', true);
    }
}

// Stop recording
async function stopRecording() {
    try {
        const response = await fetch(API.STOP, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to stop recording');
        }
        
        const data = await response.json();
        currentCode = data.code;
        hasReceivedCode = !!currentCode;
        
        if (currentCode && currentCode !== '// No code was generated') {
            // Prompt for test name before showing the code
            currentTestName = await promptTestName();
            codeOutput.textContent = formatCode(currentCode);
            codeOutput.classList.add('has-code');
            showNotification('Recording completed! You can now copy or download the code.');
        } else {
            codeOutput.classList.remove('has-code');
            showNotification('Recording stopped, but no code was generated.', true);
        }
        
        if (data.debug) {
            updateDebugPanel(data.debug);
        }
        
        clearInterval(pollInterval);
        updateUI(false);
    } catch (error) {
        console.error('Error stopping recording:', error);
        showNotification('Failed to stop recording. Please try again.', true);
    }
}

// Copy code to clipboard
async function copyCode() {
    if (!currentCode) return;
    
    try {
        await navigator.clipboard.writeText(formatCode(currentCode));
        copyBtn.innerHTML = '<span class="material-icons">check</span>Copied!';
        showNotification('Code copied to clipboard!');
        setTimeout(() => {
            copyBtn.innerHTML = '<span class="material-icons">content_copy</span>Copy Code';
        }, 2000);
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showNotification('Failed to copy code. Please try again.', true);
    }
}

// Download code as file
function downloadCode() {
    if (!currentCode) return;
    
    const extension = typeScriptToggle.checked ? '.spec.ts' : '.spec.js';
    const dateStr = getFormattedDate();
    const fileName = currentTestName ? 
        `${currentTestName}_${dateStr}${extension}` : 
        `test_${dateStr}${extension}`;
    
    const blob = new Blob([formatCode(currentCode)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showNotification('Code downloaded successfully!');
}

// Clear debug output
function clearDebug() {
    debugLog = '';
    debugOutput.innerHTML = '';
}

// Event Listeners
startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
copyBtn.addEventListener('click', copyCode);
downloadBtn.addEventListener('click', downloadCode);
clearDebugBtn.addEventListener('click', clearDebug);

typeScriptToggle.addEventListener('change', () => {
    if (currentCode) {
        codeOutput.textContent = formatCode(currentCode);
    }
});

debugModeToggle.addEventListener('change', (e) => {
    debugPanel.style.display = e.target.checked ? 'block' : 'none';
});

// Initialize UI
updateUI(false); 