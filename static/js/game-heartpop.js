/**
 * Heart Pop Game Module
 * Originally created for A.G. Brown (age 5)
 */

(function() {
    window.initHeartPopGame = function() {
        const canvas = document.getElementById('heartpopCanvas');
        if (!canvas) return () => {};
        const ctx = canvas.getContext('2d');
        const scoreVal = document.getElementById('heartScoreVal');
        const highScoreVal = document.getElementById('heartHighScoreVal');
        const startGameBtn = document.getElementById('startHeartpopBtn');
        const gameOverlay = document.getElementById('heartpopOverlay');
        const overlayText = gameOverlay.querySelector('.overlay-text');

        let isPlaying = false;
        let score = 0;
        let highScore = parseInt(localStorage.getItem('abrown_highScore') || '0', 10);
        highScoreVal.textContent = highScore;

        let timeLeft = 30;
        let gameTimer = null;
        let gameLoopId = null;
        let spawnTimeoutId = null;

        let gameTargets = [];
        let gameParticles = [];

        const targetColors = ['#ff007f', '#ffffff', '#fffb00', '#00f0ff', '#39ff14', '#d800ff'];

        // Resize
        function resizeCanvas() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Sound synth
        let audioCtx = null;
        function playPopSound() {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!audioCtx) audioCtx = new AudioContextClass();
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
            } catch (err) {
                console.log('Web Audio API not supported');
            }
        }

        // Target & Particle classes
        class GameTarget {
            constructor() {
                this.size = Math.random() * 20 + 20;
                this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
                this.y = canvas.height + this.size;
                this.speed = Math.random() * 1.5 + 1.2 + (score / 150);
                this.color = targetColors[Math.floor(Math.random() * targetColors.length)];
                
                const shapes = ['💖', '⭐', '🦋', '👑', '🌸', '🌈'];
                this.shape = shapes[Math.floor(Math.random() * shapes.length)];
                
                this.pulse = 0;
                this.pulseSpeed = Math.random() * 0.05 + 0.02;
            }

            update() {
                this.y -= this.speed;
                this.pulse += this.pulseSpeed;
            }

            draw() {
                ctx.save();
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 12 + Math.sin(this.pulse) * 4;
                
                ctx.font = `${this.size * 1.2}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.translate(this.x, this.y);
                ctx.scale(1 + Math.sin(this.pulse) * 0.06, 1 + Math.sin(this.pulse) * 0.06);
                ctx.fillText(this.shape, 0, 0);
                
                ctx.restore();
            }

            isClicked(clickX, clickY) {
                const dist = Math.hypot(this.x - clickX, this.y - clickY);
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

            draw() {
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

        function spawnTarget() {
            if (!isPlaying) return;
            gameTargets.push(new GameTarget());
            
            const nextSpawn = Math.max(400, 1000 - (score * 5));
            spawnTimeoutId = setTimeout(spawnTarget, Math.random() * 400 + nextSpawn);
        }

        function checkGameClick(e) {
            if (!isPlaying) return;
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            // Map click coords correctly to canvas resolution
            const clickX = (clientX - rect.left) * (canvas.width / rect.width);
            const clickY = (clientY - rect.top) * (canvas.height / rect.height);

            for (let i = gameTargets.length - 1; i >= 0; i--) {
                const target = gameTargets[i];
                if (target.isClicked(clickX, clickY)) {
                    playPopSound();
                    score += 10;
                    scoreVal.textContent = score;
                    
                    for (let p = 0; p < 15; p++) {
                        gameParticles.push(new GameParticle(target.x, target.y, target.color));
                    }
                    
                    gameTargets.splice(i, 1);
                    break;
                }
            }
        }

        function updateGame() {
            if (!isPlaying) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Targets
            gameTargets.forEach((target, index) => {
                target.update();
                target.draw();

                if (target.y < -target.size) {
                    gameTargets.splice(index, 1);
                }
            });

            // Particles
            gameParticles.forEach((particle, index) => {
                particle.update();
                if (particle.alpha <= 0) {
                    gameParticles.splice(index, 1);
                } else {
                    particle.draw(ctx);
                }
            });

            // Timer display
            ctx.save();
            ctx.font = 'bold 24px Outfit';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ff007f';
            ctx.shadowBlur = 8;
            ctx.fillText(`⏱️ TIME: ${timeLeft}s`, 20, 40);
            ctx.restore();

            gameLoopId = requestAnimationFrame(updateGame);
        }

        function startGame() {
            score = 0;
            scoreVal.textContent = score;
            timeLeft = 30;
            gameTargets = [];
            gameParticles = [];
            isPlaying = true;
            
            gameOverlay.style.opacity = 0;
            setTimeout(() => {
                if (isPlaying) gameOverlay.style.display = 'none';
            }, 300);
            
            startGameBtn.disabled = true;
            startGameBtn.textContent = 'PLAYING...';

            spawnTarget();
            updateGame();

            gameTimer = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    endGame();
                }
            }, 1000);
        }

        function endGame() {
            isPlaying = false;
            clearInterval(gameTimer);
            clearTimeout(spawnTimeoutId);
            cancelAnimationFrame(gameLoopId);

            if (score > highScore) {
                highScore = score;
                localStorage.setItem('abrown_highScore', highScore);
                highScoreVal.textContent = highScore;
            }

            gameOverlay.innerHTML = `
                <div class="overlay-content">
                    <span class="overlay-text text-pink" style="display: block; font-size: 2.2rem; margin-bottom: 10px; opacity: 1; animation: none;">GAME OVER!</span>
                    <span style="display: block; font-size: 1.3rem; font-weight: 700; color: #ff007f; margin-bottom: 20px;">SCORE: ${score}</span>
                    <span style="font-size: 1rem; color: #8f9cae;">Click Play Again below!</span>
                </div>
            `;
            gameOverlay.style.display = 'flex';
            setTimeout(() => {
                gameOverlay.style.opacity = 1;
            }, 50);
            
            startGameBtn.disabled = false;
            startGameBtn.textContent = 'START GAME';
        }

        function onMouseDown(e) {
            checkGameClick(e);
        }

        function onTouchStart(e) {
            e.preventDefault();
            checkGameClick(e);
        }

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        startGameBtn.addEventListener('click', startGame);

        // Return Destructor
        return function destroy() {
            isPlaying = false;
            clearInterval(gameTimer);
            clearTimeout(spawnTimeoutId);
            cancelAnimationFrame(gameLoopId);
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('touchstart', onTouchStart);
            startGameBtn.removeEventListener('click', startGame);

            // Reset UI
            gameOverlay.innerHTML = `<span class="overlay-text text-pink">Tap Start to Play!</span>`;
            gameOverlay.style.display = 'flex';
            gameOverlay.style.opacity = '1';
            startGameBtn.disabled = false;
            startGameBtn.textContent = 'START GAME';
            scoreVal.textContent = '0';
        };
    };
})();
