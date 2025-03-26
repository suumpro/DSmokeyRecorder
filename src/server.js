const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store the current codegen process and file path
let codegenProcess = null;
let currentCodeFile = null;

// Start recording endpoint
app.post('/api/start', async (req, res) => {
    try {
        const { url, testName } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log('\n=== STARTING NEW RECORDING ===');
        console.log('Target URL:', url);

        // Kill any existing process
        if (codegenProcess) {
            try {
                process.kill(-codegenProcess.pid);
            } catch (error) {
                console.log('Error killing existing process:', error);
            }
            codegenProcess = null;
        }

        // Create a temporary file path for the code
        currentCodeFile = path.join(__dirname, `temp-${Date.now()}.js`);
        console.log('Code will be saved to:', currentCodeFile);

        // Start Playwright codegen with basic options
        codegenProcess = spawn('npx', [
            'playwright',
            'codegen',
            '--target', 'javascript',
            '--output', currentCodeFile,
            '--viewport-size=1920,1080',
            url
        ], {
            detached: true,
            stdio: 'inherit', // Use inherit to show codegen UI properly
            shell: true
        });

        console.log('Process spawned with PID:', codegenProcess.pid);

        // Handle process exit
        codegenProcess.on('exit', (code, signal) => {
            console.log('\n=== PROCESS EXIT ===');
            console.log('Exit code:', code);
            console.log('Exit signal:', signal);
        });

        // Handle process error
        codegenProcess.on('error', (error) => {
            console.error('\n=== PROCESS ERROR ===');
            console.error('Error:', error);
        });

        res.json({ message: 'Recording started' });
    } catch (error) {
        console.error('\n=== START RECORDING ERROR ===');
        console.error(error);
        res.status(500).json({ error: 'Failed to start recording' });
    }
});

// Stop recording endpoint
app.post('/api/stop', async (req, res) => {
    console.log('\n=== STOPPING RECORDING ===');
    
    if (!codegenProcess) {
        console.log('No active recording process found');
        return res.status(400).json({ error: 'No active recording' });
    }

    try {
        // Give codegen a moment to save the file
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased timeout

        let generatedCode = '';
        
        // Try to read the generated code file
        try {
            if (currentCodeFile) {
                console.log('Reading code from:', currentCodeFile);
                generatedCode = await fs.readFile(currentCodeFile, 'utf8');
                console.log('Successfully read code file');
                console.log('Code content:', generatedCode); // Log the actual code
                
                if (!generatedCode) {
                    console.log('Warning: Empty code file');
                }
                
                // Clean up the temp file
                await fs.unlink(currentCodeFile);
                console.log('Deleted temporary code file');
            }
        } catch (readError) {
            console.error('Error reading code file:', readError);
        }

        // Kill the codegen process
        try {
            process.kill(-codegenProcess.pid);
            console.log('Successfully terminated codegen process');
        } catch (killError) {
            console.log('Error killing process:', killError);
            try {
                codegenProcess.kill('SIGKILL');
            } catch (error) {
                console.log('Error in fallback kill:', error);
            }
        }

        // Reset state
        codegenProcess = null;
        currentCodeFile = null;

        // Send the response
        const response = {
            message: 'Recording stopped',
            code: generatedCode || '// No code was generated'
        };
        console.log('Sending response:', response);
        res.json(response);
        
    } catch (error) {
        console.error('\n=== STOP RECORDING ERROR ===');
        console.error(error);
        
        // Cleanup on error
        codegenProcess = null;
        currentCodeFile = null;
        
        res.status(500).json({ 
            error: 'Failed to stop recording',
            details: error.message
        });
    }
});

// Get current code endpoint
app.get('/api/code', async (req, res) => {
    let currentCode = '// Recording in progress...';
    
    if (currentCodeFile) {
        try {
            currentCode = await fs.readFile(currentCodeFile, 'utf8');
        } catch (error) {
            console.log('Error reading current code:', error);
        }
    }

    res.json({ 
        code: currentCode,
        isRecording: !!codegenProcess
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 