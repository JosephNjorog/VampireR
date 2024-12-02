class VampireRemote {
    constructor() {
        this.state = {
            power: false,
            volume: 50,
            isMuted: false,
            currentChannel: 1,
            currentSource: 'TV',
            currentApp: null,
            connectionStatus: 'disconnected'
        };

        this.sources = ['TV', 'HDMI1', 'HDMI2', 'AV', 'Component'];
        this.apps = ['Netflix', 'Prime Video', 'YouTube', 'Disney+'];

        this.MAX_VOLUME = 100;
        this.MIN_VOLUME = 0;

        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        try {
            // Power Button
            this.addEventListenerSafely('[data-action="power"]', 'click', () => this.togglePower());

            // Volume Controls
            this.addEventListenerSafely('[data-action="volume-up"]', 'click', () => this.adjustVolume('up'));
            this.addEventListenerSafely('[data-action="volume-down"]', 'click', () => this.adjustVolume('down'));
            this.addEventListenerSafely('[data-action="mute"]', 'click', () => this.toggleMute());

            // Channel Controls
            this.addEventListenerSafely('[data-action="channel-up"]', 'click', () => this.changeChannel('up'));
            this.addEventListenerSafely('[data-action="channel-down"]', 'click', () => this.changeChannel('down'));
            
            // Numeric Keypad Event Listeners
            this.setupNumericKeypad();

            // Navigation Controls
            const navButtons = ['up', 'down', 'left', 'right', 'ok'];
            navButtons.forEach(direction => {
                this.addEventListenerSafely(`[data-action="${direction}"]`, 'click', 
                    () => this.navigate(direction)
                );
            });

            // Menu and Settings
            const menuButtons = ['home', 'back', 'menu', 'settings'];
            menuButtons.forEach(action => {
                this.addEventListenerSafely(`[data-action="${action}"]`, 'click', 
                    () => this[action]()
                );
            });

            // Media Controls
            const mediaButtons = ['play-pause', 'stop', 'rewind', 'forward'];
            mediaButtons.forEach(action => {
                this.addEventListenerSafely(`[data-action="${action}"]`, 'click', 
                    () => this.mediaControl(action)
                );
            });

            // Source Selection
            this.addEventListenerSafely('#sourceInput', 'change', (e) => 
                this.changeSource(e.target.value)
            );

            // Special Features
            const specialFeatures = ['smart-hub', 'guide', 'info', 'tools'];
            specialFeatures.forEach(feature => {
                this.addEventListenerSafely(`[data-action="${feature}"]`, 'click', 
                    () => this.specialFeature(feature)
                );
            });

            // App Control
            this.apps.forEach(app => {
                const selector = `[data-action="${app.toLowerCase().replace(' ', '-')}"]`;
                this.addEventListenerSafely(selector, 'click', 
                    () => this.launchApp(app)
                );
            });

            // Keyboard support
            window.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            this.showErrorNotification('Failed to initialize remote controls');
        }
    }

    addEventListenerSafely(selector, eventType, callback) {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener(eventType, callback);
        } else {
            console.warn(`Element not found: ${selector}`);
        }
    }

    setupNumericKeypad() {
        const numericButtons = document.querySelectorAll('[data-action^="number-"]');
        numericButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const number = e.target.dataset.action.split('-')[1];
                this.inputChannelNumber(number);
            });
        });
    }

    handleKeyboardShortcuts(event) {
        if (!this.state.power) return;

        switch(event.key) {
            case 'ArrowUp': this.navigate('up'); break;
            case 'ArrowDown': this.navigate('down'); break;
            case 'ArrowLeft': this.navigate('left'); break;
            case 'ArrowRight': this.navigate('right'); break;
            case 'Enter': this.navigate('ok'); break;
            case '+': this.adjustVolume('up'); break;
            case '-': this.adjustVolume('down'); break;
            case 'm': this.toggleMute(); break;
        }
    }

    togglePower() {
        this.state.power = !this.state.power;
        this.state.connectionStatus = this.state.power ? 'connected' : 'disconnected';
        this.updateUI();
        this.sendCommand('power', this.state.power ? 'on' : 'off');
    }

    adjustVolume(direction) {
        if (!this.state.power) return;

        if (direction === 'up') {
            this.state.volume = Math.min(this.MAX_VOLUME, this.state.volume + 5);
        } else {
            this.state.volume = Math.max(this.MIN_VOLUME, this.state.volume - 5);
        }
        
        this.state.isMuted = false;
        this.updateUI();
        this.sendCommand('volume', this.state.volume);
    }

    toggleMute() {
        if (!this.state.power) return;
        
        this.state.isMuted = !this.state.isMuted;
        this.updateUI();
        this.sendCommand('mute', this.state.isMuted);
    }

    changeChannel(direction) {
        if (!this.state.power) return;

        this.state.currentChannel += direction === 'up' ? 1 : -1;
        this.state.currentChannel = Math.max(1, this.state.currentChannel);
        
        this.updateUI();
        this.sendCommand('channel', this.state.currentChannel);
    }

    inputChannelNumber(number) {
        if (!this.state.power) return;

        // Implement channel number input logic
        this.sendCommand('channel-input', number);
    }

    navigate(direction) {
        if (!this.state.power) return;
        
        this.sendCommand('navigate', direction);
    }

    home() {
        if (!this.state.power) return;
        this.sendCommand('home');
    }

    back() {
        if (!this.state.power) return;
        this.sendCommand('back');
    }

    menu() {
        if (!this.state.power) return;
        this.sendCommand('menu');
    }

    settings() {
        if (!this.state.power) return;
        this.sendCommand('settings');
    }

    mediaControl(action) {
        if (!this.state.power) return;
        
        switch(action) {
            case 'play-pause':
                this.sendCommand('play-pause');
                break;
            case 'stop':
                this.sendCommand('stop');
                break;
            case 'rewind':
                this.sendCommand('rewind');
                break;
            case 'forward':
                this.sendCommand('forward');
                break;
        }
    }

    changeSource(source) {
        if (!this.state.power) return;
        
        this.state.currentSource = source;
        this.updateUI();
        this.sendCommand('source', source);
    }

    specialFeature(feature) {
        if (!this.state.power) return;
        
        this.sendCommand('special-feature', feature);
    }

    launchApp(app) {
        if (!this.state.power) return;
        
        this.state.currentApp = app;
        this.updateUI();
        this.sendCommand('launch-app', app);
    }

    updateUI() {
        try {
            // Update connection status
            const statusEl = document.getElementById('connectionStatus');
            statusEl.innerHTML = this.state.power 
                ? '<span class="status-dot connected"></span>Connected' 
                : '<span class="status-dot disconnected"></span>Disconnected';

            // Update volume display
            const volumeEl = document.getElementById('volumeLevel');
            volumeEl.textContent = this.state.isMuted ? 'MUTE' : `${this.state.volume}%`;

            // Update channel display
            const channelEl = document.getElementById('currentChannel');
            channelEl.textContent = `CH ${this.state.currentChannel}`;

            // Update source selection
            const sourceEl = document.getElementById('sourceInput');
            sourceEl.value = this.state.currentSource;

            // Optional: Disable/enable buttons based on power state
            this.toggleButtonStates();
        } catch (error) {
            console.error('Error updating UI:', error);
            this.showErrorNotification('Failed to update remote display');
        }
    }

    toggleButtonStates() {
        const buttons = document.querySelectorAll('button, select');
        buttons.forEach(button => {
            if (button.id !== 'sourceInput' && button.getAttribute('data-action') !== 'power') {
                button.disabled = !this.state.power;
            }
        });
    }

    sendCommand(type, value) {
        // Placeholder for actual TV communication logic
        console.log(`Sending Command: ${type} - ${value}`);
        
        try {
            // Here you would implement actual communication 
            // For demo, we'll add a simple notification
            this.showCommandNotification(type, value);
        } catch (error) {
            console.error(`Error sending ${type} command:`, error);
            this.showErrorNotification(`Failed to send ${type} command`);
        }
    }

    showCommandNotification(type, value) {
        // Create a temporary notification element
        const notification = document.createElement('div');
        notification.className = 'command-notification';
        notification.textContent = `${type.toUpperCase()}: ${value}`;
        document.body.appendChild(notification);

        // Remove notification after 2 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }

    showErrorNotification(message) {
        // Create a temporary error notification
        const errorNotification = document.createElement('div');
        errorNotification.className = 'error-notification';
        errorNotification.textContent = message;
        document.body.appendChild(errorNotification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            document.body.removeChild(errorNotification);
        }, 3000);
    }
}

// Add this to your CSS for notifications
const notificationStyles = `
<style>
.command-notification, .error-notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    background-color: rgba(0,0,0,0.7);
    color: white;
    border-radius: 5px;
    z-index: 1000;
}

.error-notification {
    background-color: rgba(255,0,0,0.7);
}
</style>
`;
document.head.insertAdjacentHTML('beforeend', notificationStyles);

document.addEventListener('DOMContentLoaded', () => {
    new VampireRemote();
});