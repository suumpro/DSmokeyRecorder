// Recorder Script
(() => {
    let isRecording = false;
    let hoveredElement = null;
    let highlightOverlay = null;

    // Create highlight overlay
    function createHighlightOverlay() {
        highlightOverlay = document.createElement('div');
        highlightOverlay.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 10000;
            border: 2px solid #3b82f6;
            border-radius: 4px;
            background-color: rgba(59, 130, 246, 0.1);
            transition: all 150ms ease;
            display: none;
        `;
        document.body.appendChild(highlightOverlay);
    }

    // Update highlight overlay position
    function updateHighlight(element) {
        if (!element || !highlightOverlay) return;

        const rect = element.getBoundingClientRect();
        highlightOverlay.style.cssText += `
            display: block;
            top: ${rect.top + window.scrollY}px;
            left: ${rect.left + window.scrollX}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
        `;
    }

    // Generate unique selector for element
    function generateSelector(element) {
        if (!element) return null;
        if (element.id) return `#${element.id}`;

        let selector = '';
        let current = element;

        while (current && current !== document.body) {
            let selectorPart = current.tagName.toLowerCase();

            // Add classes (but not generated ones)
            const classes = Array.from(current.classList)
                .filter(cls => !cls.startsWith('_') && !cls.includes('generated'))
                .join('.');
            if (classes) selectorPart += `.${classes}`;

            // Add nth-child for better uniqueness
            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children);
                const index = siblings.indexOf(current) + 1;
                if (siblings.length > 1) {
                    selectorPart += `:nth-child(${index})`;
                }
            }

            selector = selectorPart + (selector ? ` > ${selector}` : '');
            current = current.parentElement;
        }

        return selector;
    }

    // Record action
    function recordAction(type, data = {}) {
        if (!isRecording) return;

        const action = {
            type,
            timestamp: Date.now(),
            ...data
        };

        window.opener.postMessage({
            type: 'RECORD_ACTION',
            data: action
        }, '*');
    }

    // Event Handlers
    function handleMouseOver(event) {
        if (!isRecording) return;
        hoveredElement = event.target;
        updateHighlight(hoveredElement);
    }

    function handleMouseOut() {
        if (!isRecording) return;
        hoveredElement = null;
        if (highlightOverlay) {
            highlightOverlay.style.display = 'none';
        }
    }

    function handleClick(event) {
        if (!isRecording) return;

        const element = event.target;
        const selector = generateSelector(element);
        if (!selector) return;

        recordAction('click', { selector });

        // Visual feedback
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            border-radius: 50%;
            background-color: rgba(59, 130, 246, 0.3);
            width: 20px;
            height: 20px;
            pointer-events: none;
            z-index: 10001;
            animation: ripple 0.6s ease-out;
        `;

        const rect = element.getBoundingClientRect();
        ripple.style.left = event.clientX - 10 + 'px';
        ripple.style.top = event.clientY - 10 + 'px';

        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    function handleInput(event) {
        if (!isRecording) return;

        const element = event.target;
        const selector = generateSelector(element);
        if (!selector) return;

        if (element.tagName === 'SELECT') {
            recordAction('select', {
                selector,
                value: element.value
            });
        } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            recordAction('fill', {
                selector,
                value: element.value
            });
        }
    }

    // Initialize recording
    function initRecording() {
        if (isRecording) return;

        // Record initial navigation
        recordAction('navigate', { url: window.location.href });

        // Create highlight overlay
        createHighlightOverlay();

        // Add event listeners
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        document.addEventListener('click', handleClick);
        document.addEventListener('input', handleInput);
        document.addEventListener('change', handleInput);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                from {
                    transform: scale(1);
                    opacity: 1;
                }
                to {
                    transform: scale(10);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        isRecording = true;
    }

    // Cleanup recording
    function cleanup() {
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('input', handleInput);
        document.removeEventListener('change', handleInput);

        if (highlightOverlay) {
            highlightOverlay.remove();
            highlightOverlay = null;
        }

        isRecording = false;
    }

    // Listen for messages from parent window
    window.addEventListener('message', (event) => {
        if (event.source !== window.opener) return;

        const { type } = event.data;
        if (type === 'INIT_RECORDING') {
            initRecording();
        }
    });

    // Cleanup on window unload
    window.addEventListener('unload', cleanup);
})(); 