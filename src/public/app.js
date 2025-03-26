// DOM Elements
const urlInput = document.getElementById('urlInput');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const autoGenerateNames = document.getElementById('autoGenerateNames');
const codeOutput = document.querySelector('.code-output');
const recordingIndicator = document.querySelector('.recording-indicator');
const notification = document.getElementById('notification');
const typeScriptToggle = document.getElementById('typeScriptToggle');
const debugModeToggle = document.getElementById('debugModeToggle');
const debugPanel = document.getElementById('debugPanel');
const debugOutput = document.getElementById('debugOutput');
const clearDebugBtn = document.getElementById('clearDebugBtn');
const testNameInput = document.getElementById('testName');
const downloadBtn = document.getElementById('downloadBtn');

// State
let isRecording = false;
let recordingWindow = null;
let testActions = [];
let currentCode = '';
let hasReceivedCode = false;
let debugLog = '';
let currentTestName = '';
let pollInterval;

// Constants
const NOTIFICATION_DURATION = 3000; // 3 seconds
const DEFAULT_TEST_NAME = 'test';
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

// Format code for display and download
function formatCode(code) {
    if (!code) {
        console.log('No code provided to format');
        return '// Your test code will appear here when you start recording...';
    }

    console.log('Formatting code:', code);
    
    try {
        const testName = testNameInput.value.trim() || `test_${getFormattedDate()}`;
        
        // Convert the code to Playwright test format
        let formattedCode = `import { test, expect } from '@playwright/test';\n\n`;
        
        // Extract the important parts from the code
        const lines = code.split('\n').filter(line => 
            line.trim() && 
            !line.includes('chromium') && 
            !line.includes('launch') && 
            !line.includes('newContext') && 
            !line.includes('newPage') && 
            !line.includes('async ()') && 
            !line.includes('browser.close') && 
            !line.includes('context.close') &&
            !line.includes('-----')
        );

        // Format as a proper test
        formattedCode += `test('${testName}', async ({ page }) => {\n`;
        formattedCode += lines.map(line => '  ' + line.trim()).join('\n');
        formattedCode += '\n});';

        console.log('Formatted code:', formattedCode);
        return formattedCode;
    } catch (error) {
        console.error('Error formatting code:', error);
        return code; // Return original code if formatting fails
    }
}

// Get formatted date string
function getFormattedDate() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
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
    testNameInput.disabled = recording;
    recordingIndicator.style.display = recording ? 'flex' : 'none';
    
    if (!recording) {
        copyBtn.disabled = !currentCode;
        downloadBtn.disabled = !currentCode;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.hidden = false;

    // Remove existing animation class
    notification.classList.remove('fade-out');

    // Trigger reflow to restart animation
    notification.offsetHeight;

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.hidden = true;
        }, 300); // Match the CSS animation duration
    }, NOTIFICATION_DURATION);
}

// Set loading state
function setLoading(element, isLoading) {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// Generate test name
function generateTestName(action) {
    if (!autoGenerateNames.checked) return DEFAULT_TEST_NAME;

    const actionMap = {
        click: 'clicks',
        fill: 'fills',
        navigate: 'navigates',
        select: 'selects'
    };

    const actionType = actionMap[action.type] || action.type;
    const target = action.selector ? 
        action.selector.split('>').pop().trim().replace(/[^\w\s]/g, '') : 
        'element';

    return `${actionType}_${target}`.toLowerCase().replace(/\s+/g, '_');
}

// Poll for code updates when recording
async function pollForCode() {
    try {
        const response = await fetch(API.CODE);
        const data = await response.json();
        
        if (data.code) {
            // Store the original code
            currentCode = data.code;
            
            // Display formatted code
            const formattedCode = formatCode(currentCode);
            codeOutput.textContent = formattedCode;
            codeOutput.classList.add('has-code');
            
            // Enable/disable buttons based on code presence
            copyBtn.disabled = !currentCode;
            downloadBtn.disabled = !currentCode;
        }
        
        // Update UI if recording status changed
        if (data.isRecording !== isRecording) {
            updateUI(data.isRecording);
        }
    } catch (error) {
        console.error('Error polling for code:', error);
        showNotification('Error updating code preview', 'error');
    }
}

// Event Handlers
async function startRecording() {
    try {
        const url = urlInput.value.trim();
        
        if (!url) {
            showNotification('Please enter a valid URL', 'error');
            return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            showNotification('URL must start with http:// or https://', 'error');
            return;
        }

        // Validate test name if provided
        const testName = testNameInput.value.trim();
        if (testName && !/^[a-zA-Z0-9_]+$/.test(testName)) {
            showNotification('Test name can only contain letters, numbers, and underscores', 'error');
            return;
        }

        setLoading(startBtn, true);
        
        // Start recording via API
        const response = await fetch(API.START, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                url,
                testName: testName || undefined
            })
        });

        if (!response.ok) {
            throw new Error('Failed to start recording');
        }

        // Clear previous code
        currentCode = '';
        codeOutput.textContent = '// Recording started. Perform actions in the browser window...';
        codeOutput.classList.remove('has-code');
        
        // Start polling for code updates
        updateUI(true);
        pollInterval = setInterval(pollForCode, 1000);
        
        showNotification('Recording started! Browser window will open shortly...');

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        setLoading(startBtn, false);
    }
}

async function stopRecording() {
    if (!isRecording) return;

    try {
        console.group('Stop Recording Process');
        console.log('1. Stopping recording');
        setLoading(stopBtn, true);
        
        // Stop recording via API
        console.log('2. Sending stop request to server');
        const response = await fetch(API.STOP, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to stop recording');
        }

        console.log('3. Received response from server');
        const data = await response.json();
        console.log('4. Response data:', data);
        
        // Update code output
        currentCode = data.code;
        console.log('5. Current code updated, length:', currentCode.length);
        
        if (currentCode && currentCode !== '// No code was generated') {
            console.log('6. Formatting and displaying code');
            const formattedCode = formatCode(currentCode);
            codeOutput.textContent = formattedCode;
            codeOutput.classList.add('has-code');
            copyBtn.disabled = false;
            downloadBtn.disabled = false;
            showNotification('Recording completed! You can now copy or download the code.');
        } else {
            console.log('6. No valid code received');
            codeOutput.classList.remove('has-code');
            copyBtn.disabled = true;
            downloadBtn.disabled = true;
            showNotification('Recording stopped, but no code was generated.', 'warning');
        }
        
        // Stop polling and update UI
        console.log('7. Cleaning up');
        clearInterval(pollInterval);
        updateUI(false);
        console.groupEnd();

    } catch (error) {
        console.error('Stop recording error:', error);
        console.error('Error stack:', error.stack);
        console.groupEnd();
        showNotification(error.message, 'error');
    } finally {
        setLoading(stopBtn, false);
    }
}

function clearCode() {
    currentCode = '';
    codeOutput.textContent = '// Your test code will appear here when you start recording...';
    codeOutput.classList.remove('has-code');
    testNameInput.value = '';
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    showNotification('Code cleared');
}

async function copyCode() {
    if (!currentCode) return;
    
    try {
        setLoading(copyBtn, true);
        await navigator.clipboard.writeText(currentCode);
        showNotification('Code copied to clipboard');
    } catch (error) {
        showNotification('Failed to copy code', 'error');
    } finally {
        setLoading(copyBtn, false);
    }
}

// Message Handler
window.addEventListener('message', (event) => {
    if (!isRecording) return;

    const { type, data } = event.data;
    
    if (type === 'RECORD_ACTION') {
        testActions.push(data);
        
        // Update code preview in real-time
        const code = formatCode(testActions);
        codeOutput.textContent = code;
    }
});

// Event Listeners
startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
clearBtn.addEventListener('click', clearCode);
copyBtn.addEventListener('click', copyCode);
downloadBtn.addEventListener('click', downloadCode);

// Handle Enter key in URL input
urlInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !isRecording) {
        startRecording();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (recordingWindow) {
        recordingWindow.close();
    }
});

typeScriptToggle.addEventListener('change', () => {
    if (currentCode) {
        codeOutput.textContent = formatCode(testActions);
    }
});

debugModeToggle.addEventListener('change', (e) => {
    debugPanel.style.display = e.target.checked ? 'block' : 'none';
});

// Update download functionality
function downloadCode() {
    console.group('Download Process Debug');
    console.log('1. Download button clicked');
    console.log('Current code type:', typeof currentCode);
    console.log('Current code length:', currentCode ? currentCode.length : 0);
    console.log('Current code preview:', currentCode ? currentCode.substring(0, 100) + '...' : 'null');
    
    if (!currentCode) {
        console.log('ERROR: No code available to download');
        console.groupEnd();
        showNotification('No code to download', 'error');
        return;
    }
    
    try {
        console.log('2. Starting download process');
        setLoading(downloadBtn, true);
        
        const testName = testNameInput.value.trim() || `test_${getFormattedDate()}`;
        const extension = '.spec.js';
        const fileName = `${testName}${extension}`;
        console.log('3. File name generated:', fileName);
        
        // Create a new blob with the code
        console.log('4. Creating blob with code');
        const formattedCode = formatCode(currentCode);
        console.log('5. Formatted code preview:', formattedCode.substring(0, 100) + '...');
        
        const blob = new Blob([formattedCode], { type: 'text/javascript' });
        console.log('6. Blob created, size:', blob.size, 'bytes');
        
        const url = window.URL.createObjectURL(blob);
        console.log('7. Blob URL created:', url);
        
        // Create a temporary link element
        console.log('8. Creating download link');
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        
        // Add to document, click, and remove
        console.log('9. Triggering download');
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        console.log('10. Starting cleanup');
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log('11. Cleanup completed');
            console.groupEnd();
        }, 100);
        
        showNotification('Code downloaded successfully');
    } catch (error) {
        console.error('Download error:', error);
        console.error('Error stack:', error.stack);
        console.groupEnd();
        showNotification('Failed to download code', 'error');
    } finally {
        setLoading(downloadBtn, false);
    }
}

// Initialize UI
updateUI(false); 