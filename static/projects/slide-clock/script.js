class SlideClock {
    constructor() {
        this.digitGroups = {
            hoursTens: document.getElementById('hours-tens'),
            hoursOnes: document.getElementById('hours-ones'),
            minutesTens: document.getElementById('minutes-tens'),
            minutesOnes: document.getElementById('minutes-ones'),
            secondsTens: document.getElementById('seconds-tens'),
            secondsOnes: document.getElementById('seconds-ones')
        };
        
        this.currentTime = {
            hoursTens: -1,
            hoursOnes: -1,
            minutesTens: -1,
            minutesOnes: -1,
            secondsTens: -1,
            secondsOnes: -1
        };
        
        // Track when digits are in post-animation drift
        this.isAnimating = {
            hoursTens: false,
            hoursOnes: false,
            minutesTens: false,
            minutesOnes: false,
            secondsTens: false
        };
        
        // Configuration for drift animations
        this.driftConfig = {
            hoursTens: { maxProgress: 43199, containerClass: 'hours-tens-container' },   // 43200 seconds (12 hours)
            hoursOnes: { maxProgress: 3599, containerClass: 'hours-ones-container' },    // 3600 seconds (1 hour)
            minutesTens: { maxProgress: 599, containerClass: 'minutes-tens-container' }, // 600 seconds (10 minutes)
            minutesOnes: { maxProgress: 59, containerClass: 'minutes-ones-container' },  // 60 seconds
            secondsTens: { maxProgress: 9, containerClass: 'seconds-tens-container' }    // 10 seconds
        };
        
        this.initializeDigits();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }
    
    initializeDigits() {
        Object.keys(this.digitGroups).forEach(key => {
            const container = document.createElement('div');
            container.className = 'digit-container';
            
            // Add special class for drift animations
            const config = this.driftConfig[key];
            if (config) {
                container.classList.add(config.containerClass);
            }
            
            // Add special class for seconds ones (uses absolute positioning but not drift config)
            if (key === 'secondsOnes') {
                container.classList.add('seconds-ones-container');
            }
            
            // Create two digits for smooth transition
            for (let i = 0; i < 2; i++) {
                const digit = document.createElement('div');
                digit.className = 'digit';
                digit.innerHTML = '<span>0</span>';
                container.appendChild(digit);
            }
            
            this.digitGroups[key].appendChild(container);
        });
    }
    
    updateClock() {
        const now = new Date();
        const hours12 = (now.getHours() % 12) || 12;
        const hours = String(hours12).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        // Calculate total seconds for hours tens (0-43199 for 12 hours)
        // We need to track position within the 12-hour cycle
        const hoursInCycle = hours12 - 1; // 0-11 for calculation
        const totalSecondsIn12Hours = (hoursInCycle * 3600) + (now.getMinutes() * 60) + now.getSeconds();
        
        // Calculate total seconds for hours ones (0-3599 for 1 hour)
        const totalSecondsInHour = (now.getMinutes() * 60) + now.getSeconds();
        
        // Calculate total seconds for minutes tens (0-599 for 10 minutes)
        const minutesOnesValue = parseInt(minutes[1]);
        const totalSecondsIn10Min = (minutesOnesValue * 60) + now.getSeconds();
        
        this.updateDigit('hoursTens', parseInt(hours[0]), totalSecondsIn12Hours);
        this.updateDigit('hoursOnes', parseInt(hours[1]), totalSecondsInHour);
        this.updateDigit('minutesTens', parseInt(minutes[0]), totalSecondsIn10Min);
        this.updateDigit('minutesOnes', parseInt(minutes[1]), now.getSeconds());
        this.updateDigit('secondsTens', parseInt(seconds[0]), parseInt(seconds[1]));
        this.updateDigit('secondsOnes', parseInt(seconds[1]));
    }
    
    updateDigit(position, newValue, timeProgress = null) {
        const container = this.digitGroups[position].querySelector('.digit-container');
        const digits = container.querySelectorAll('.digit');
        const spans = container.querySelectorAll('.digit span');
        const driftConfig = this.driftConfig[position];
        
        // Handle drift animations (minutes ones and seconds tens)
        if (driftConfig) {
            this.updateDriftDigit(position, newValue, timeProgress, container, digits, spans, driftConfig);
        }
        // Handle normal slide animations
        else {
            this.updateNormalDigit(position, newValue, container, spans);
        }
    }
    
    updateDriftDigit(position, newValue, timeProgress, container, digits, spans, config) {
        const startY = 158;
        const endY = -78;
        const totalMovement = startY - endY;
        const yPosition = startY - (timeProgress / config.maxProgress) * totalMovement;
        
        // Debug trace for seconds tens
        // if (position === 'secondsTens') {
        //     console.log(`[${position}] time=${timeProgress}, value=${newValue}, yPos=${yPosition.toFixed(2)}, isAnimating=${this.isAnimating[position]}, valueChanged=${this.currentTime[position] !== newValue}`);
        // }
        
        // Digit value changed
        if (this.currentTime[position] !== newValue) {
            // console.log(`[${position}] VALUE CHANGED from ${this.currentTime[position]} to ${newValue}`);
            this.isAnimating[position] = true;
            
            if (this.currentTime[position] >= 0) {
                // Slide out old digit and slide in new digit
                this.slideDigitTransition(digits, spans, newValue, yPosition, () => {
                    this.startDrift(position, digits, spans, timeProgress, config, startY, totalMovement);
                });
            } else {
                // Initial load
                this.initializeDriftDigit(position, digits, spans, newValue, yPosition, timeProgress, config, startY, totalMovement);
            }
            
            this.currentTime[position] = newValue;
        } 
        // Same digit, update position if not animating
        else if (!this.isAnimating[position]) {
            // Check if we're already transitioning to this position
            const currentTransform = digits[0].style.transform;
            const targetTransform = `translateY(${yPosition}px)`;
            
            // Only update if the target position is different
            if (currentTransform !== targetTransform) {
                // if (position === 'secondsTens') {
                //     console.log(`[${position}] UPDATING POSITION to ${yPosition.toFixed(2)}px`);
                // }
                digits[0].style.transition = 'transform 1s linear';
                digits[0].style.transform = `translateY(${yPosition}px)`;
            }
        }
        // else if (position === 'secondsTens') {
        //     console.log(`[${position}] BLOCKED - isAnimating is true`);
        // }
    }
    
    slideDigitTransition(digits, spans, newValue, yPosition, callback) {
        // Set up new digit below visible area
        spans[1].textContent = newValue;
        digits[1].style.transition = 'none';
        digits[1].style.transform = 'translateY(440px)';
        digits[1].style.opacity = '1';
        digits[1].offsetHeight;
        
        // Animate both simultaneously
        digits[0].style.transition = 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        digits[0].style.transform = 'translateY(-440px)';
        
        digits[1].style.transition = 'transform 0.5s cubic-bezier(0.0, 0.0, 0.2, 1)';
        digits[1].style.transform = `translateY(${yPosition}px)`;
        
        setTimeout(() => {
            // Swap content to digit[0]
            spans[0].textContent = newValue;
            digits[0].style.transition = 'none';
            digits[0].style.transform = `translateY(${yPosition}px)`;
            
            // Hide and reset digit[1]
            spans[1].textContent = '';
            digits[1].style.transition = 'none';
            digits[1].style.transform = 'translateY(0)';
            digits[1].style.opacity = '0';
            
            digits[0].offsetHeight;
            
            // Clear the animation flag immediately so drift can continue
            callback();
        }, 500);
    }
    
    startDrift(position, digits, spans, timeProgress, config, startY, totalMovement) {
        // Clear animation flag immediately so continuous updates can happen
        // console.log(`[${position}] START DRIFT - clearing isAnimating flag`);
        this.isAnimating[position] = false;
        
        const nextProgress = (timeProgress + 1) % (config.maxProgress + 1);
        const nextYPosition = startY - (nextProgress / config.maxProgress) * totalMovement;
        
        // console.log(`[${position}] Drifting from time=${timeProgress} to time=${nextProgress}, yPos=${nextYPosition.toFixed(2)}px`);
        digits[0].style.transition = 'transform 1s linear';
        digits[0].style.transform = `translateY(${nextYPosition}px)`;
    }
    
    initializeDriftDigit(position, digits, spans, newValue, yPosition, timeProgress, config, startY, totalMovement) {
        spans[0].textContent = newValue;
        digits[0].style.transition = 'none';
        digits[0].style.transform = `translateY(${yPosition}px)`;
        spans[1].textContent = '';
        digits[1].style.opacity = '0';
        
        // Don't set isAnimating for initial load, let it drift freely
        requestAnimationFrame(() => {
            this.startDrift(position, digits, spans, timeProgress, config, startY, totalMovement);
        });
    }
    
    updateNormalDigit(position, newValue, container, spans) {
        if (this.currentTime[position] === newValue) {
            return;
        }
        
        const digits = container.querySelectorAll('.digit');
        
        if (this.currentTime[position] >= 0) {
            // Setup: Position new digit below, old digit stays at -78px
            spans[1].textContent = newValue;
            digits[1].style.opacity = '1';
            digits[1].style.transition = 'none';
            digits[1].style.transform = 'translateY(440px)';
            digits[1].offsetHeight; // Force reflow
            
            // Animate both simultaneously (300ms)
            digits[0].style.transition = 'transform 0.3s linear';
            digits[0].style.transform = 'translateY(-440px)'; // Old slides up and out
            
            digits[1].style.transition = 'transform 0.3s linear';
            digits[1].style.transform = 'translateY(158px)'; // New slides up to start position
            
            // After slide-in, start drift (690ms)
            setTimeout(() => {
                digits[1].style.transition = 'transform 0.69s linear';
                digits[1].style.transform = 'translateY(-78px)'; // Drift to end position
                
                // After drift, swap to digit[0] for next cycle
                setTimeout(() => {
                    spans[0].textContent = newValue;
                    digits[0].style.transition = 'none';
                    digits[0].style.transform = 'translateY(-78px)';
                    
                    spans[1].textContent = '';
                    digits[1].style.transition = 'none';
                    digits[1].style.transform = 'translateY(0)';
                    digits[1].style.opacity = '0';
                }, 690);
            }, 300);
        } else {
            // Initial load
            spans[0].textContent = newValue;
            digits[0].style.transform = 'translateY(-78px)';
            spans[1].textContent = '';
            digits[1].style.opacity = '0';
        }
        
        this.currentTime[position] = newValue;
    }
}

// Initialize the clock when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const clock = new SlideClock();
    initializeControls(clock);
});

function initializeControls(clock) {
    // Color schemes
    const colorSchemes = [
        {
            name: 'Dark Grey',
            bodyBg: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)',
            digitBg: 'rgb(3, 1, 1)',
            textColor: '#E2E2E2'
        },
        {
            name: 'Blue',
            bodyBg: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #0277bd 100%)',
            digitBg: 'rgb(13, 71, 161)',
            textColor: '#CF928F'
        },
        {
            name: 'Purple',
            bodyBg: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)',
            digitBg: '#63228B',
            textColor: '#96BD76'
        },
        {
            name: 'Green',
            bodyBg: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
            digitBg: 'rgb(46, 125, 50)',
            textColor: '#38B390'
        },
        {
            name: 'Orange',
            bodyBg: 'linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)',
            digitBg: 'rgb(239, 108, 0)',
            textColor: '#9D481D'
        },
        {
            name: 'Red',
            bodyBg: 'linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #d32f2f 100%)',
            digitBg: 'rgb(198, 40, 40)',
            textColor: '#ffffff'
        },
        {
            name: 'Teal',
            bodyBg: 'linear-gradient(135deg, #004d40 0%, #00695c 50%, #00796b 100%)',
            digitBg: 'rgb(0, 105, 92)',
            textColor: '#E49595'
        },
        {
            name: 'Gold',
            bodyBg: 'linear-gradient(135deg, #f57f17 0%, #fbc02d 50%, #fdd835 100%)',
            digitBg: 'rgb(251, 192, 45)',
            textColor: '#000000'
        }
    ];

    let currentSchemeIndex = 0;
    let showSeconds = true;
    let controlsVisible = true;

    // Apply color scheme
    function applyColorScheme(index) {
        const scheme = colorSchemes[index];
        document.body.style.background = scheme.bodyBg;
        
        const digitGroups = document.querySelectorAll('.digit-group::before, .digit-group::after');
        document.querySelectorAll('.digit-group').forEach(group => {
            const style = document.createElement('style');
            style.textContent = `
                .digit-group::before,
                .digit-group::after {
                    background: ${scheme.digitBg} !important;
                }
            `;
            if (group.querySelector('style')) {
                group.querySelector('style').remove();
            }
            group.appendChild(style);
        });
        
        const digits = document.querySelectorAll('.digit');
        digits.forEach(digit => {
            digit.style.color = scheme.textColor;
        });
    }

    // Color control
    const colorControl = document.createElement('div');
    colorControl.className = 'color-control';
    colorControl.setAttribute('data-tooltip', 'Change color scheme');
    colorControl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
    `;
    colorControl.addEventListener('click', () => {
        currentSchemeIndex = (currentSchemeIndex + 1) % colorSchemes.length;
        applyColorScheme(currentSchemeIndex);
    });
    document.body.appendChild(colorControl);

    // Font set control
    let currentFontSet = 0;
    const fontSets = ['Bricolage Grotesque', 'UnifrakturCook', 'Monoton'];
    
    const fontSetControl = document.createElement('div');
    fontSetControl.className = 'font-set-control';
    fontSetControl.setAttribute('data-tooltip', 'Change font');
    fontSetControl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.14 3H5.96l5.11-13h1.86l5.11 13h-2.05z"/>
        </svg>
    `;
    fontSetControl.addEventListener('click', () => {
        currentFontSet = (currentFontSet + 1) % fontSets.length;
        document.body.style.fontFamily = fontSets[currentFontSet];
        
        const digits = document.querySelectorAll('.digit');
        
        // Adjust font size for UnifrakturCook
        if (fontSets[currentFontSet] === 'UnifrakturCook') {
            digits.forEach(digit => {
                digit.style.fontSize = '500px';
                digit.style.fontWeight = '700';
            });
        } 
        // Adjust font weight for Monoton (display fonts work best with normal weight)
        else if (fontSets[currentFontSet] === 'Monoton') {
            digits.forEach(digit => {
                digit.style.fontSize = '420px';
                digit.style.fontWeight = '400';
            });
        } 
        // Default settings for other fonts
        else {
            digits.forEach(digit => {
                digit.style.fontSize = '420px';
                digit.style.fontWeight = '800';
            });
        }
    });
    document.body.appendChild(fontSetControl);

    // Seconds control
    const secondsControl = document.createElement('div');
    secondsControl.className = 'seconds-control';
    secondsControl.setAttribute('data-tooltip', 'Toggle seconds');
    secondsControl.innerHTML = '<span class="colon-text">:</span>';
    secondsControl.addEventListener('click', () => {
        showSeconds = !showSeconds;
        const secondsGroups = [
            document.getElementById('seconds-tens'),
            document.getElementById('seconds-ones')
        ];
        const minutesOnes = document.getElementById('minutes-ones');
        
        secondsGroups.forEach(group => {
            if (group) {
                group.style.display = showSeconds ? 'block' : 'none';
            }
        });
        
        // Toggle border radius on minutes ones card
        if (minutesOnes) {
            if (showSeconds) {
                minutesOnes.style.borderRadius = '0';
            } else {
                minutesOnes.style.borderRadius = '0 20px 20px 0';
            }
        }
        
        secondsControl.style.opacity = showSeconds ? '1' : '0.5';
    });
    document.body.appendChild(secondsControl);

    // Fullscreen control
    function updateFullscreenIcon() {
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                              document.mozFullScreenElement || document.msFullscreenElement);
        const icon = fullscreenControl.querySelector('svg path');
        if (isFullscreen) {
            icon.setAttribute('d', 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z');
            fullscreenControl.setAttribute('data-tooltip', 'Exit fullscreen');
        } else {
            icon.setAttribute('d', 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z');
            fullscreenControl.setAttribute('data-tooltip', 'Enter fullscreen');
        }
    }

    const fullscreenControl = document.createElement('div');
    fullscreenControl.className = 'fullscreen-control';
    fullscreenControl.setAttribute('data-tooltip', 'Enter fullscreen');
    fullscreenControl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
    `;
    fullscreenControl.addEventListener('click', () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && !document.msFullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });
    document.body.appendChild(fullscreenControl);

    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
    document.addEventListener('mozfullscreenchange', updateFullscreenIcon);
    document.addEventListener('MSFullscreenChange', updateFullscreenIcon);

    // Controls toggle
    function updateControlsToggleIcon() {
        const icon = controlsToggleControl.querySelector('svg path');
        if (controlsVisible) {
            icon.setAttribute('d', 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z');
            controlsToggleControl.setAttribute('data-tooltip', 'Hide controls');
        } else {
            icon.setAttribute('d', 'M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z');
            controlsToggleControl.setAttribute('data-tooltip', 'Show controls');
        }
    }

    const controlsToggleControl = document.createElement('div');
    controlsToggleControl.className = 'controls-toggle-control';
    controlsToggleControl.setAttribute('data-tooltip', 'Hide controls');
    controlsToggleControl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
    `;
    controlsToggleControl.addEventListener('click', () => {
        controlsVisible = !controlsVisible;
        const allControls = document.querySelectorAll('.color-control, .font-set-control, .seconds-control, .fullscreen-control');
        allControls.forEach(control => {
            control.style.display = controlsVisible ? 'flex' : 'none';
        });
        updateControlsToggleIcon();
    });
    document.body.appendChild(controlsToggleControl);

    updateControlsToggleIcon();

    // Initialize with first color scheme and first font
    currentSchemeIndex = 0;
    applyColorScheme(0);
}
