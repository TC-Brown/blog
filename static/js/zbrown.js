document.addEventListener('DOMContentLoaded', () => {
    // --- Dark/Light Theme Switching ---
    const themeToggle = document.getElementById('themeToggle');
    
    // Sync with saved theme, default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.add('dark-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('dark-theme')) {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // --- HTML5 Canvas Neon Popper Game ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas?.getContext('2d');
    const gameScreen = document.getElementById('gameScreen');
    const gameOverlay = document.getElementById('gameOverlay');
    const scoreVal = document.getElementById('scoreVal');
    const highScoreVal = document.getElementById('highScoreVal');
    const startGameBtn = document.getElementById('startGameBtn');

    if (!canvas || !ctx) return;

    let score = 0;
    let highScore = parseInt(localStorage.getItem('z_high_score') || '0', 10);
    highScoreVal.textContent = highScore;

    let gameActive = false;
    let gameTime = 30; // 30 second game
    let gameTimerInterval = null;
    let spawnTimerInterval = null;
    
    let bubbles = [];
    let particles = [];
    let animationFrameId = null;

    // Resize canvas to match display size
    function resizeCanvas() {
        const rect = gameScreen.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Audio Pop synthesizer using Web Audio API
    function playPopSynth() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContextClass();
            
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.type = 'sine';
            const now = audioCtx.currentTime;
            
            // Pop sound: frequency ramp up quickly
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
            
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (err) {
            console.log('Web Audio API not allowed/supported yet');
        }
    }

    // Bubble Class
    class Bubble {
        constructor() {
            this.radius = Math.random() * 20 + 15;
            this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
            this.y = canvas.height + this.radius;
            this.speed = Math.random() * 2 + 2;
            this.angle = Math.random() * Math.PI * 2;
            this.wiggleSpeed = Math.random() * 0.05 + 0.02;
            
            // Kids Neon Colors
            const colors = ['#00f0ff', '#ff007f', '#ffffff'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.y -= this.speed;
            this.angle += this.wiggleSpeed;
            this.x += Math.sin(this.angle) * 0.8;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Inner gloss highlight for premium feel
            ctx.beginPath();
            ctx.arc(this.x - this.radius/3, this.y - this.radius/3, this.radius/4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
        }
    }

    // Particle Class for popping explosion
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.radius = Math.random() * 3 + 1;
            
            const speed = Math.random() * 4 + 2;
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.alpha = 1;
            this.decay = Math.random() * 0.03 + 0.015;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    function createExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
            particles.push(new Particle(x, y, color));
        }
    }

    function spawnBubble() {
        if (gameActive) {
            bubbles.push(new Bubble());
        }
    }

    // Game loop
    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update & Draw Bubbles
        for (let i = bubbles.length - 1; i >= 0; i--) {
            bubbles[i].update();
            bubbles[i].draw();

            // Remove if floated off screen
            if (bubbles[i].y + bubbles[i].radius < 0) {
                bubbles.splice(i, 1);
            }
        }

        // Update & Draw Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        // Display timer on Canvas
        ctx.font = '900 24px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 6;
        ctx.fillText(`TIME: ${gameTime}s`, canvas.width - 20, 35);
        ctx.shadowBlur = 0; // Reset shadow

        if (gameActive) {
            animationFrameId = requestAnimationFrame(updateGame);
        }
    }

    function startGame() {
        if (gameActive) return;

        score = 0;
        gameTime = 30;
        bubbles = [];
        particles = [];
        gameActive = true;
        scoreVal.textContent = score;

        gameOverlay.style.opacity = '0';
        setTimeout(() => {
            if (gameActive) gameOverlay.style.display = 'none';
        }, 300);

        startGameBtn.textContent = 'RESTART';

        // Intervals
        if (gameTimerInterval) clearInterval(gameTimerInterval);
        if (spawnTimerInterval) clearInterval(spawnTimerInterval);

        spawnTimerInterval = setInterval(spawnBubble, 600);
        
        gameTimerInterval = setInterval(() => {
            gameTime--;
            if (gameTime <= 0) {
                endGame();
            }
        }, 1000);

        // Start animation frame
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        updateGame();
    }

    function endGame() {
        gameActive = false;
        clearInterval(gameTimerInterval);
        clearInterval(spawnTimerInterval);
        cancelAnimationFrame(animationFrameId);

        // Clear canvas but show final render state static
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update High Score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('z_high_score', highScore);
            highScoreVal.textContent = highScore;
        }

        // Show game over message
        gameOverlay.innerHTML = `
            <div class="overlay-content">
                <span class="overlay-text" style="display: block; font-size: 2.2rem; margin-bottom: 10px;">GAME OVER!</span>
                <span style="display: block; font-size: 1.3rem; font-weight: 700; color: #00f0ff; margin-bottom: 20px;">POPPED: ${score} BUBBLES</span>
                <span style="font-size: 1rem; color: #8f9cae;">Click Start to Play Again!</span>
            </div>
        `;
        gameOverlay.style.display = 'flex';
        setTimeout(() => {
            gameOverlay.style.opacity = '1';
        }, 50);
        
        startGameBtn.textContent = 'START GAME';
    }

    // Handle bubble popping on click/tap
    function handlePop(clientX, clientY) {
        if (!gameActive) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = (clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (clientY - rect.top) * (canvas.height / rect.height);

        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            const dist = Math.hypot(mouseX - b.x, mouseY - b.y);

            // Pop collision detection
            if (dist < b.radius + 10) { // Slight generous padding for easier kid tapping
                createExplosion(b.x, b.y, b.color);
                bubbles.splice(i, 1);
                score += 10;
                scoreVal.textContent = score;
                playPopSynth();
                break; // Pop one bubble per click
            }
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        handlePop(e.clientX, e.clientY);
    });

    canvas.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
            // Prevent scrolling when playing on mobile touch
            e.preventDefault();
            handlePop(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });

    startGameBtn.addEventListener('click', startGame);
});
