/**
 * A-MAGIC Page Logic
 * Interactive Drawing and Heart Pop Game for A.G. Brown (age 5)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Audio Control System ---
    let audioCtx = null;
    let soundEnabled = true;
    const soundToggle = document.getElementById('soundToggle');
    const soundOnIcon = soundToggle.querySelector('.sound-on');
    const soundOffIcon = soundToggle.querySelector('.sound-off');

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            if (soundEnabled) {
                soundOnIcon.style.display = 'block';
                soundOffIcon.style.display = 'none';
                initAudio();
            } else {
                soundOnIcon.style.display = 'none';
                soundOffIcon.style.display = 'block';
            }
        });
    }

    // Sound Synthesizers
    function playPopSound() {
        if (!soundEnabled) return;
        initAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
        
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    function playStampSound() {
        if (!soundEnabled) return;
        initAudio();
        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6 arpeggio
        
        notes.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + index * 0.05);
            
            gain.gain.setValueAtTime(0.12, now + index * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.05 + 0.15);
            
            osc.start(now + index * 0.05);
            osc.stop(now + index * 0.05 + 0.15);
        });
    }

    let lastDrawSoundTime = 0;
    function playDrawSound(yPercent) {
        if (!soundEnabled) return;
        const now = Date.now();
        if (now - lastDrawSoundTime < 120) return; // throttle to avoid noise overload
        lastDrawSoundTime = now;
        
        initAudio();
        const audioTime = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        // Map Y percent to pentatonic scale frequencies (approx C5 to C6)
        const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        const noteIndex = Math.floor((1 - yPercent) * scale.length);
        const freq = scale[Math.min(noteIndex, scale.length - 1)];
        
        osc.frequency.setValueAtTime(freq, audioTime);
        
        gain.gain.setValueAtTime(0.04, audioTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioTime + 0.08);
        
        osc.start(audioTime);
        osc.stop(audioTime + 0.08);
    }

    function playClearSound() {
        if (!soundEnabled) return;
        initAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.4);
    }


    // --- Tab Switching System ---
    const paintTabBtn = document.getElementById('paintTabBtn');
    const gameTabBtn = document.getElementById('gameTabBtn');
    const paintContainer = document.getElementById('paintContainer');
    const gameContainer = document.getElementById('gameContainer');

    function selectTab(tab) {
        if (tab === 'paint') {
            paintTabBtn.classList.add('active');
            gameTabBtn.classList.remove('active');
            paintContainer.classList.add('active');
            gameContainer.classList.remove('active');
            stopGame(); // Stop game loop if active
            resizePaintCanvas();
        } else {
            gameTabBtn.classList.add('active');
            paintTabBtn.classList.remove('active');
            gameContainer.classList.add('active');
            paintContainer.classList.remove('active');
            resizeGameCanvas();
        }
    }

    paintTabBtn.addEventListener('click', () => selectTab('paint'));
    gameTabBtn.addEventListener('click', () => selectTab('game'));


    // --- Drawing Board System ---
    const paintCanvas = document.getElementById('paintCanvas');
    const paintCtx = paintCanvas.getContext('2d');
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Default drawing settings
    let currentTool = 'brush';
    let currentColor = '#ff007f';
    let currentSize = 8;
    let currentStamp = '💖';

    // Particle system for magical drawing trail
    let paintParticles = [];

    class PaintParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2 - 1.5; // Drift upwards
            this.size = Math.random() * 6 + 2;
            this.color = color;
            this.alpha = 1;
            this.decay = Math.random() * 0.03 + 0.02;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function addPaintParticles(x, y, color, count = 2) {
        for (let i = 0; i < count; i++) {
            paintParticles.push(new PaintParticle(x, y, color));
        }
    }

    function resizePaintCanvas() {
        const parent = paintCanvas.parentElement;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = paintCanvas.width;
        tempCanvas.height = paintCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(paintCanvas, 0, 0);

        paintCanvas.width = parent.clientWidth;
        paintCanvas.height = parent.clientHeight;
        
        // Restore contents
        paintCtx.drawImage(tempCanvas, 0, 0);
        
        // Retain stroke styles
        paintCtx.lineCap = 'round';
        paintCtx.lineJoin = 'round';
    }

    window.addEventListener('resize', () => {
        if (paintContainer.classList.contains('active')) {
            resizePaintCanvas();
        }
        if (gameContainer.classList.contains('active')) {
            resizeGameCanvas();
        }
    });

    // Initialize Canvas Dimensions
    resizePaintCanvas();

    // Toolbar Event Listeners
    // Tool selection (Draw vs Stamp)
    const toolBrushBtn = document.getElementById('toolBrushBtn');
    const toolStampBtn = document.getElementById('toolStampBtn');
    const stampGroup = document.getElementById('stampGroup');

    toolBrushBtn.addEventListener('click', () => {
        currentTool = 'brush';
        toolBrushBtn.classList.add('active');
        toolStampBtn.classList.remove('active');
        stampGroup.style.display = 'none';
    });

    toolStampBtn.addEventListener('click', () => {
        currentTool = 'stamp';
        toolStampBtn.classList.add('active');
        toolBrushBtn.classList.remove('active');
        stampGroup.style.display = 'flex';
    });

    // Brush Sizes
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSize = parseInt(btn.getAttribute('data-size'));
        });
    });

    // Colors
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentColor = btn.getAttribute('data-color');
        });
    });

    // Stamps
    const stampButtons = document.querySelectorAll('.stamp-btn');
    stampButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            stampButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStamp = btn.getAttribute('data-stamp');
        });
    });

    // Clear Button
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.addEventListener('click', () => {
        playClearSound();
        // Clear effect: Flash white, then clear
        paintCtx.save();
        paintCtx.fillStyle = currentColor;
        paintCtx.globalAlpha = 0.3;
        paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
        paintCtx.restore();

        setTimeout(() => {
            paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
        }, 80);
    });

    // Drawing Logic (Mouse & Touch Events)
    function getCoords(e) {
        const rect = paintCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
            rawYPercent: (clientY - rect.top) / rect.height
        };
    }

    function startDrawing(e) {
        initAudio();
        const coords = getCoords(e);
        
        if (currentTool === 'stamp') {
            // Draw stamp immediately
            drawStamp(coords.x, coords.y);
            return;
        }

        isDrawing = true;
        lastX = coords.x;
        lastY = coords.y;
        
        // Draw initial dot
        paintCtx.beginPath();
        paintCtx.arc(lastX, lastY, currentSize / 2, 0, Math.PI * 2);
        paintCtx.fillStyle = currentColor;
        paintCtx.fill();
        addPaintParticles(lastX, lastY, currentColor, 4);
    }

    function draw(e) {
        if (!isDrawing || currentTool !== 'brush') return;
        e.preventDefault(); // Prevent scrolling on mobile touch
        
        const coords = getCoords(e);
        
        paintCtx.beginPath();
        paintCtx.moveTo(lastX, lastY);
        paintCtx.lineTo(coords.x, coords.y);
        
        // Neon Glow strokes styling
        paintCtx.strokeStyle = currentColor;
        paintCtx.lineWidth = currentSize;
        paintCtx.shadowColor = currentColor;
        paintCtx.shadowBlur = 10;
        
        paintCtx.stroke();
        
        // Add particles along trail
        addPaintParticles(coords.x, coords.y, currentColor, 2);
        
        // Sound pitch based on vertical coordinate
        playDrawSound(coords.rawYPercent);
        
        lastX = coords.x;
        lastY = coords.y;
    }

    function stopDrawing() {
        isDrawing = false;
        paintCtx.shadowBlur = 0; // Reset shadow so other elements draw normally
    }

    function drawStamp(x, y) {
        playStampSound();
        paintCtx.save();
        
        // Neon Stamp glow
        paintCtx.shadowColor = currentColor;
        paintCtx.shadowBlur = 15;
        
        // Map current brush sizes to stamp sizes
        let fontSize = 36;
        if (currentSize === 16) fontSize = 56;
        if (currentSize === 32) fontSize = 80;
        
        paintCtx.font = `${fontSize}px Arial`;
        paintCtx.textAlign = 'center';
        paintCtx.textBaseline = 'middle';
        paintCtx.fillText(currentStamp, x, y);
        paintCtx.restore();

        // Explosion of sparkly particles
        addPaintParticles(x, y, currentColor, 12);
    }

    // Bind Drawing Listeners
    paintCanvas.addEventListener('mousedown', startDrawing);
    paintCanvas.addEventListener('mousemove', draw);
    paintCanvas.addEventListener('mouseup', stopDrawing);
    paintCanvas.addEventListener('mouseleave', stopDrawing);

    paintCanvas.addEventListener('touchstart', (e) => {
        startDrawing(e);
    }, { passive: false });
    paintCanvas.addEventListener('touchmove', draw, { passive: false });
    paintCanvas.addEventListener('touchend', stopDrawing);

    // Drawing Particles Render Loop
    function updatePaintParticles() {
        if (paintContainer.classList.contains('active')) {
            // Only draw/clear particles on drawing canvas
            paintParticles.forEach((p, index) => {
                p.update();
                if (p.alpha <= 0) {
                    paintParticles.splice(index, 1);
                } else {
                    p.draw(paintCtx);
                }
            });
        } else {
            paintParticles = [];
        }
        requestAnimationFrame(updatePaintParticles);
    }
    updatePaintParticles();


    // --- Heart Pop Game System ---
    const gameCanvas = document.getElementById('gameCanvas');
    const gameCtx = gameCanvas.getContext('2d');
    const gameOverlay = document.getElementById('gameOverlay');
    const overlayText = gameOverlay.querySelector('.overlay-text');
    const startGameBtn = document.getElementById('startGameBtn');
    
    const scoreVal = document.getElementById('scoreVal');
    const highScoreVal = document.getElementById('highScoreVal');

    let isPlaying = false;
    let score = 0;
    let highScore = parseInt(localStorage.getItem('abrown_highScore') || '0');
    highScoreVal.textContent = highScore;

    let timeLeft = 30;
    let gameTimer = null;
    let gameLoopId = null;

    let gameTargets = [];
    let gameParticles = [];

    // Colors allowed: Neon Pink, Neon White, Neon Yellow, Neon Cyan, Neon Green, Neon Purple
    const targetColors = ['#ff007f', '#ffffff', '#fffb00', '#00f0ff', '#39ff14', '#d800ff'];

    class GameTarget {
        constructor(canvasWidth, canvasHeight) {
            this.size = Math.random() * 20 + 20; // Radius between 20 and 40
            this.x = Math.random() * (canvasWidth - this.size * 2) + this.size;
            this.y = canvasHeight + this.size;
            this.speed = Math.random() * 1.5 + 1.2 + (score / 150); // Speed scales up with score
            this.color = targetColors[Math.floor(Math.random() * targetColors.length)];
            
            // Random shape: Heart (💖), Star (⭐), Butterfly (🦋), Crown (👑), Flower (🌸)
            const shapes = ['💖', '⭐', '🦋', '👑', '🌸'];
            this.shape = shapes[Math.floor(Math.random() * shapes.length)];
            
            this.pulse = 0;
            this.pulseSpeed = Math.random() * 0.05 + 0.02;
        }

        update() {
            this.y -= this.speed;
            this.pulse += this.pulseSpeed;
        }

        draw(ctx) {
            ctx.save();
            
            // Neon Glow around floating stamp
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 12 + Math.sin(this.pulse) * 4;
            
            // Font size
            ctx.font = `${this.size * 1.2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Scale and rotate slightly for dynamic look
            ctx.translate(this.x, this.y);
            ctx.scale(1 + Math.sin(this.pulse) * 0.06, 1 + Math.sin(this.pulse) * 0.06);
            ctx.fillText(this.shape, 0, 0);
            
            ctx.restore();
        }

        isClicked(clickX, clickY) {
            // Distance check
            const dist = Math.hypot(this.x - clickX, this.y - clickY);
            // Give 5-year-old generous clicking radius
            return dist < this.size * 1.5;
        }
    }

    class GameParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 5 + 3;
            this.color = color;
            this.alpha = 1;
            this.decay = Math.random() * 0.04 + 0.02;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // Gravity
            this.alpha -= this.decay;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function resizeGameCanvas() {
        const parent = gameCanvas.parentElement;
        gameCanvas.width = parent.clientWidth;
        gameCanvas.height = parent.clientHeight;
    }

    function spawnTarget() {
        if (!isPlaying) return;
        gameTargets.push(new GameTarget(gameCanvas.width, gameCanvas.height));
        
        // Queue next spawn (faster spawning as score increases)
        const nextSpawn = Math.max(400, 1000 - (score * 5));
        setTimeout(spawnTarget, Math.random() * 400 + nextSpawn);
    }

    function checkGameClick(e) {
        if (!isPlaying) return;
        const rect = gameCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const clickX = clientX - rect.left;
        const clickY = clientY - rect.top;

        // Search backwards to click top-most targets first
        for (let i = gameTargets.length - 1; i >= 0; i--) {
            const target = gameTargets[i];
            if (target.isClicked(clickX, clickY)) {
                // Pop it!
                playPopSound();
                score += 10;
                scoreVal.textContent = score;
                
                // Explode particles
                for (let p = 0; p < 15; p++) {
                    gameParticles.push(new GameParticle(target.x, target.y, target.color));
                }
                
                // Remove target
                gameTargets.splice(i, 1);
                break;
            }
        }
    }

    gameCanvas.addEventListener('mousedown', checkGameClick);
    gameCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        checkGameClick(e);
    }, { passive: false });

    function updateGame() {
        if (!isPlaying) return;
        
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Update & Draw Targets
        gameTargets.forEach((target, index) => {
            target.update();
            target.draw(gameCtx);

            // Remove if off-screen top
            if (target.y < -target.size) {
                gameTargets.splice(index, 1);
            }
        });

        // Update & Draw Particles
        gameParticles.forEach((particle, index) => {
            particle.update();
            if (particle.alpha <= 0) {
                gameParticles.splice(index, 1);
            } else {
                particle.draw(gameCtx);
            }
        });

        // Draw Timer overlay inside game screen
        gameCtx.save();
        gameCtx.font = 'bold 24px Outfit';
        gameCtx.fillStyle = '#ffffff';
        gameCtx.shadowColor = '#ff007f';
        gameCtx.shadowBlur = 8;
        gameCtx.fillText(`⏱️ TIME: ${timeLeft}s`, 20, 40);
        gameCtx.restore();

        gameLoopId = requestAnimationFrame(updateGame);
    }

    function startGame() {
        initAudio();
        
        // Reset state
        score = 0;
        scoreVal.textContent = score;
        timeLeft = 30;
        gameTargets = [];
        gameParticles = [];
        isPlaying = true;
        
        gameOverlay.style.opacity = 0;
        setTimeout(() => {
            gameOverlay.style.display = 'none';
        }, 300);
        
        startGameBtn.disabled = true;
        startGameBtn.textContent = 'PLAYING...';

        // Start spawn loop
        spawnTarget();
        
        // Start frame rendering loop
        updateGame();

        // Start countdown timer
        gameTimer = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function stopGame() {
        isPlaying = false;
        clearInterval(gameTimer);
        cancelAnimationFrame(gameLoopId);
        startGameBtn.disabled = false;
        startGameBtn.textContent = 'START GAME';
        gameOverlay.style.display = 'flex';
        gameOverlay.style.opacity = 1;
        overlayText.textContent = 'Tap Start to Play!';
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    }

    function endGame() {
        isPlaying = false;
        clearInterval(gameTimer);
        cancelAnimationFrame(gameLoopId);

        // Save High Score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('abrown_highScore', highScore);
            highScoreVal.textContent = highScore;
        }

        // Show Game Over overlay
        gameOverlay.style.display = 'flex';
        setTimeout(() => {
            gameOverlay.style.opacity = 1;
        }, 50);
        
        overlayText.innerHTML = `GAME OVER!<br>⭐ Score: ${score} ⭐<br><button id="replayBtn" class="game-btn" style="margin-top: 15px;">Play Again</button>`;
        
        // Hook replay button
        document.getElementById('replayBtn').addEventListener('click', () => {
            startGame();
        });

        startGameBtn.disabled = false;
        startGameBtn.textContent = 'START GAME';
    }

    startGameBtn.addEventListener('click', startGame);

    // Initial game screen resize
    resizeGameCanvas();
});
