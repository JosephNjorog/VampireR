class VampireRemote {
    constructor() {
        this.state = {
            power: false,
            volume: 50,
            isMuted: false,
            currentChannel: 1,
            currentSource: 'TV',
            currentApp: null
        };

        this.sources = ['TV', 'HDMI1', 'HDMI2', 'AV', 'Component'];
        this.apps = ['Netflix', 'Prime Video', 'YouTube', 'Disney+'];

        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        // Power Button
        document.querySelector('[data-action="power"]').addEventListener('click', () => this.togglePower());

        // Volume Controls
        document.querySelector('[data-action="volume-up"]').addEventListener('click', () => this.adjustVolume('up'));
        document.querySelector('[data-action="volume-down"]').addEventListener('click', () => this.adjustVolume('down'));
        document.querySelector('[data-action="mute"]').addEventListener('click', () => this.toggleMute());

        // Channel Controls
        document.querySelector('[data-action="channel-up"]').addEventListener('click', () => this.changeChannel('up'));
        document.querySelector('[data-action="channel-down"]').addEventListener('click', () => this.changeChannel('down'));
        
        // Numeric Keypad Event Listeners
        this.setupNumericKeypad();

        // Navigation Controls
        const navButtons = ['up', 'down', 'left', 'right', 'ok'];
        navButtons.forEach(direction => {
            document.querySelector(`[data-action="${direction}"]`).addEventListener('click', 
                () => this.navigate(direction)
            );
        });

        // Menu and Settings
        const menuButtons = ['home', 'back', 'menu', 'settings'];
        menuButtons.forEach(action => {
            document.querySelector(`[data-action="${action}"]`).addEventListener('click', 
                () => this[action]()
            );
        });

        // Media Controls
        const mediaButtons = ['play-pause', 'stop', 'rewind', 'forward'];
        mediaButtons.forEach(action => {
            document.querySelector(`[data-action="${action}"]`).addEventListener('click', 
                () => this.mediaControl(action)
            );
        });

        // Source Selection
        document.getElementById('sourceInput').addEventListener('change', (e) => 
            this.changeSource(e.target.value)
        );

        // Special Features
        const specialFeatures = ['smart-hub', 'guide', 'info', 'tools'];
        specialFeatures.forEach(feature => {
            const button = document.querySelector(`[data-action="${feature}"]`);
            if (button) {
                button.addEventListener('click', () => this.specialFeature(feature));
            }
        });

        // App Control
        this.apps.forEach(app => {
            const appButton = document.querySelector(`[data-action="${app.toLowerCase().replace(' ', '-')}"]`);
            if (appButton) {
                appButton.addEventListener('click', () => this.launchApp(app));
            }
        });
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

    togglePower() {
        this.state.power = !this.state.power;
        this.updateUI();
        this.sendCommand('power', this.state.power ? 'on' : 'off');
    }

    adjustVolume(direction) {
        if (!this.state.power) return;

        if (direction === 'up') {
            this.state.volume = Math.min(100, this.state.volume + 5);
        } else {
            this.state.volume = Math.max(0, this.state.volume - 5);
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
    }

    sendCommand(type, value) {
        // Placeholder for actual TV communication logic
        console.log(`Sending Command: ${type} - ${value}`);
        
        // Here you would implement actual communication with Samsung SmartThings API
        // This could involve:
        // - WebSocket communication
        // - HTTP requests to a local network API
        // - Integration with Samsung's official API
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VampireRemote();
});