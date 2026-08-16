/**
 * Dino Meteor Dodge Game Module
 * Dinosaur dodges falling meteors and collects power-ups for special abilities & transformations!
 * Created for The Brown Family Arcade Room
 */

(function() {
    window.initDinoGame = function() {
        const canvas = document.getElementById('dinoCanvas');
        if (!canvas) return () => {};
        const ctx = canvas.getContext('2d');
        
        const scoreVal = document.getElementById('dinoScoreVal');
        const highScoreVal = document.getElementById('dinoHighScoreVal');
        const activePowerupVal = document.getElementById('dinoActivePowerupVal');
        const startGameBtn = document.getElementById('startDinoBtn');
        const gameOverlay = document.getElementById('dinoOverlay');

        // Touch Control Buttons (for mobile)
        const btnLeft = document.getElementById('dinoBtnLeft');
        const btnRight = document.getElementById('dinoBtnRight');
        const btnJump = document.getElementById('dinoBtnJump');
        const btnFire = document.getElementById('dinoBtnFire');

        let score = 0;
        let highScore = parseInt(localStorage.getItem('dino_high_score') || '0', 10);
        if (highScoreVal) highScoreVal.textContent = highScore;

        let gameActive = false;
        let animationFrameId = null;
        let spawnMeteorInterval = null;
        let spawnPowerupInterval = null;

        // Keys state
        const keys = { left: false, right: false, up: false, fire: false };

        // Sound synth
        let audioCtx = null;
        function playSound(type) {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!audioCtx) audioCtx = new AudioContextClass();
                const now = audioCtx.currentTime;
                
                if (type === 'jump') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain); gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now); osc.stop(now + 0.15);
                } else if (type === 'powerup') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain); gain.connect(audioCtx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.setValueAtTime(600, now + 0.08);
                    osc.frequency.setValueAtTime(900, now + 0.16);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                    osc.start(now); osc.stop(now + 0.25);
                } else if (type === 'blast') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain); gain.connect(audioCtx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                    osc.start(now); osc.stop(now + 0.12);
                } else if (type === 'hit') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain); gain.connect(audioCtx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.linearRampToValueAtTime(40, now + 0.3);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now); osc.stop(now + 0.3);
                }
            } catch (err) {
                // Audio not allowed or unsupported
            }
        }

        // Resize Canvas
        function resizeCanvas() {
            if (!canvas.parentElement) return;
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width || 800;
            canvas.height = rect.height || 400;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Power-up Types
        const POWERUPS = {
            SHIELD: { id: 'SHIELD', name: 'Shield 🛡️', color: '#00f0ff', duration: 8000 },
            WINGS: { id: 'WINGS', name: 'Pterodactyl Wings 🪽', color: '#ffd700', duration: 9000 },
            FIRE: { id: 'FIRE', name: 'Fire Breath 🔥', color: '#ff3300', duration: 8000 },
            MEGA: { id: 'MEGA', name: 'Mega Dino 🥩', color: '#39ff14', duration: 7000 },
            FREEZE: { id: 'FREEZE', name: 'Time Freeze ❄️', color: '#a0e7ff', duration: 6000 }
        };

        // Entities
        let dino = null;
        let meteors = [];
        let powerups = [];
        let fireballs = [];
        let particles = [];

        function resetDino() {
            dino = {
                x: canvas.width / 2 - 20,
                y: canvas.height - 60,
                width: 40,
                height: 40,
                vx: 0,
                vy: 0,
                speed: 6,
                jumpForce: -12,
                gravity: 0.55,
                isGrounded: true,
                powerup: null,
                powerupEndTime: 0,
                shieldActive: false,
                scale: 1,
                lastFireTime: 0,
                facing: 'right'
            };
        }

        class Meteor {
            constructor() {
                this.radius = Math.random() * 16 + 14; // 14 to 30px
                this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
                this.y = -this.radius - 10;
                this.speedY = Math.random() * 3 + 3 + (score / 300);
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotSpeed = (Math.random() - 0.5) * 0.1;
                this.color = Math.random() > 0.3 ? '#ff4500' : '#ff8c00';
            }

            update(slowMo) {
                const spdMult = slowMo ? 0.25 : 1.0;
                this.y += this.speedY * spdMult;
                this.x += this.speedX * spdMult;
                this.rotation += this.rotSpeed;

                // Tail particles
                if (Math.random() < 0.6) {
                    particles.push(new Particle(
                        this.x + (Math.random() - 0.5) * this.radius,
                        this.y - this.radius * 0.5,
                        this.color,
                        Math.random() * 4 + 2,
                        (Math.random() - 0.5) * 1,
                        -Math.random() * 2 - 1,
                        0.04
                    ));
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                // Fiery Outer Glow
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 12;

                // Jagged meteor shape
                ctx.beginPath();
                const pts = 7;
                for (let i = 0; i < pts; i++) {
                    const angle = (i / pts) * Math.PI * 2;
                    const r = this.radius * (0.8 + Math.sin(i * 2.5) * 0.2);
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();

                ctx.fillStyle = '#2d1b19';
                ctx.fill();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2.5;
                ctx.stroke();

                ctx.restore();
            }
        }

        class PowerupItem {
            constructor() {
                const types = Object.keys(POWERUPS);
                const selectedKey = types[Math.floor(Math.random() * types.length)];
                this.info = POWERUPS[selectedKey];
                this.radius = 18;
                this.x = Math.random() * (canvas.width - this.radius * 4) + this.radius * 2;
                this.y = -30;
                this.speedY = 2;
                this.floatTimer = Math.random() * Math.PI * 2;
            }

            update() {
                this.y += this.speedY;
                this.floatTimer += 0.05;
                this.x += Math.sin(this.floatTimer) * 1.2;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                
                // Glow
                ctx.shadowColor = this.info.color;
                ctx.shadowBlur = 15;

                // Outer Ring
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fill();
                ctx.strokeStyle = this.info.color;
                ctx.lineWidth = 3;
                ctx.stroke();

                // Icon / Text inside
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const icons = { SHIELD: '🛡️', WINGS: '🪽', FIRE: '🔥', MEGA: '🥩', FREEZE: '❄️' };
                ctx.fillText(icons[this.info.id] || '⭐', 0, 1);

                ctx.restore();
            }
        }

        class Fireball {
            constructor(x, y, facing) {
                this.x = x;
                this.y = y;
                this.radius = 8;
                this.speedY = -9;
                this.speedX = facing === 'right' ? 2 : -2;
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;

                // Trail
                particles.push(new Particle(
                    this.x, this.y, '#ff3300', Math.random() * 3 + 2,
                    (Math.random() - 0.5) * 2, Math.random() * 2 + 1, 0.06
                ));
            }

            draw() {
                ctx.save();
                ctx.shadowColor = '#ff3300';
                ctx.shadowBlur = 14;
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        class Particle {
            constructor(x, y, color, size, vx, vy, decay) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.size = size;
                this.vx = vx;
                this.vy = vy;
                this.alpha = 1;
                this.decay = decay || 0.03;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
            }

            draw() {
                if (this.alpha <= 0) return;
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        function createExplosion(x, y, color, count) {
            for (let i = 0; i < (count || 12); i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 1.5;
                particles.push(new Particle(
                    x, y, color || '#ff8c00',
                    Math.random() * 4 + 2,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    Math.random() * 0.03 + 0.02
                ));
            }
        }

        function spawnMeteor() {
            if (gameActive) {
                meteors.push(new Meteor());
            }
        }

        function spawnPowerup() {
            if (gameActive && powerups.length < 2) {
                powerups.push(new PowerupItem());
            }
        }

        function updateDino() {
            const now = Date.now();

            // Check powerup expiration
            if (dino.powerup && now > dino.powerupEndTime) {
                dino.powerup = null;
                dino.shieldActive = false;
                dino.scale = 1;
                dino.speed = 6;
                dino.jumpForce = -12;
                if (activePowerupVal) activePowerupVal.textContent = 'None';
            }

            // Power-up Modifiers
            let currentSpeed = dino.speed;
            let currentJump = dino.jumpForce;

            // Dynamically update Jump/Fire button UI when Fire powerup is active
            if (btnJump) {
                if (dino.powerup === POWERUPS.FIRE.id) {
                    btnJump.textContent = '🔥 Fire';
                    btnJump.style.background = 'linear-gradient(135deg, #ff3300, #ff8c00)';
                    btnJump.style.color = '#ffffff';
                    btnJump.style.borderColor = '#ff3300';
                } else {
                    btnJump.textContent = '▲ Jump';
                    btnJump.style.background = '';
                    btnJump.style.color = '';
                    btnJump.style.borderColor = '';
                }
            }

            if (dino.powerup === POWERUPS.WINGS.id) {
                currentSpeed = 9;
                currentJump = -14;
            } else if (dino.powerup === POWERUPS.MEGA.id) {
                dino.scale = 1.7;
            } else {
                dino.scale = 1;
            }

            // Horizontal Movement
            if (keys.left) {
                dino.vx = -currentSpeed;
                dino.facing = 'left';
            } else if (keys.right) {
                dino.vx = currentSpeed;
                dino.facing = 'right';
            } else {
                dino.vx *= 0.7; // friction
            }

            dino.x += dino.vx;

            // Clamp Dino inside canvas
            const effectiveWidth = dino.width * dino.scale;
            if (dino.x < 0) dino.x = 0;
            if (dino.x + effectiveWidth > canvas.width) dino.x = canvas.width - effectiveWidth;

            // Vertical Jump / Gravity
            if (keys.up) {
                if (dino.isGrounded) {
                    dino.vy = currentJump;
                    dino.isGrounded = false;
                    playSound('jump');
                    // Dust particles
                    createExplosion(dino.x + effectiveWidth / 2, canvas.height - 15, '#aaaaaa', 6);
                } else if (dino.powerup === POWERUPS.WINGS.id && dino.vy > 0) {
                    // Pterodactyl Wing Glide / Float
                    dino.vy = Math.min(dino.vy, 1.8);
                }
            }

            // Apply gravity
            dino.vy += dino.gravity;
            dino.y += dino.vy;

            // Ground Collision
            const groundY = canvas.height - (dino.height * dino.scale) - 15;
            if (dino.y >= groundY) {
                dino.y = groundY;
                dino.vy = 0;
                dino.isGrounded = true;
            }

            // Firing Plasma Fireballs
            if (keys.fire && dino.powerup === POWERUPS.FIRE.id) {
                if (now - dino.lastFireTime > 250) {
                    fireballs.push(new Fireball(
                        dino.x + effectiveWidth / 2,
                        dino.y,
                        dino.facing
                    ));
                    dino.lastFireTime = now;
                    playSound('blast');
                }
            }
        }

        function drawDino() {
            if (!dino) return;
            ctx.save();
            const dw = dino.width * dino.scale;
            const dh = dino.height * dino.scale;
            const cx = dino.x + dw / 2;
            const cy = dino.y + dh / 2;

            ctx.translate(cx, cy);
            if (dino.facing === 'left') {
                ctx.scale(-1, 1);
            }

            // 1. SHIELD AURA (If Shield Powerup)
            if (dino.powerup === POWERUPS.SHIELD.id && dino.shieldActive) {
                ctx.save();
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 22;
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(dw, dh) * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            // 2. MEGA DINO GLOW AURA
            if (dino.powerup === POWERUPS.MEGA.id) {
                ctx.shadowColor = '#39ff14';
                ctx.shadowBlur = 25;
            }

            // 3. PTERODACTYL WINGS (If Wings Powerup)
            if (dino.powerup === POWERUPS.WINGS.id) {
                ctx.save();
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 12;

                // Wing 1 (Back Wing)
                ctx.beginPath();
                ctx.moveTo(-5, -10);
                ctx.lineTo(-dw * 0.9, -dh * 0.7);
                ctx.lineTo(-dw * 0.3, 5);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // 4. FIRE BREATH SPARKLES (If Fire Powerup)
            if (dino.powerup === POWERUPS.FIRE.id) {
                ctx.shadowColor = '#ff3300';
                ctx.shadowBlur = 18;
                // Flame particles from mouth
                if (Math.random() < 0.5) {
                    particles.push(new Particle(
                        cx + dw * 0.4, cy - dh * 0.2, '#ff4500',
                        Math.random() * 4 + 2, Math.random() * 3 + 1, (Math.random() - 0.5) * 2, 0.05
                    ));
                }
            }

            // --- VECTOR DINOSAUR BODY DRAWING ---
            const bodyColor = (dino.powerup === POWERUPS.MEGA.id) ? '#39ff14' :
                              (dino.powerup === POWERUPS.FIRE.id) ? '#ff4500' : '#2ecc71';
            const shadowColor = (dino.powerup === POWERUPS.MEGA.id) ? '#39ff14' : '#27ae60';

            // Tail
            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            ctx.moveTo(-dw * 0.2, 5);
            ctx.quadraticCurveTo(-dw * 0.6, 5, -dw * 0.7, dh * 0.2);
            ctx.quadraticCurveTo(-dw * 0.4, dh * 0.3, 0, dh * 0.3);
            ctx.closePath();
            ctx.fill();

            // Main Body (Round torso)
            ctx.beginPath();
            ctx.ellipse(-dw * 0.05, dh * 0.15, dw * 0.35, dh * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Back Spikes (Neon Amber)
            ctx.fillStyle = '#ff8c00';
            for (let s = 0; s < 3; s++) {
                const sx = -dw * 0.35 + s * 10;
                const sy = -dh * 0.05 + s * 4;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx - 4, sy - 8);
                ctx.lineTo(sx + 5, sy - 2);
                ctx.closePath();
                ctx.fill();
            }

            // Dino Head & Snout
            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            ctx.roundRect(-dw * 0.15, -dh * 0.45, dw * 0.65, dh * 0.4, 6);
            ctx.fill();

            // Eye (White circle + black pupil)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(dw * 0.2, -dh * 0.3, 5.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(dw * 0.22, -dh * 0.3, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Sharp Mouth / Teeth
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(dw * 0.1, -dh * 0.1);
            ctx.lineTo(dw * 0.2, -dh * 0.02);
            ctx.lineTo(dw * 0.3, -dh * 0.1);
            ctx.closePath();
            ctx.fill();

            // Tiny T-Rex Arm
            ctx.fillStyle = shadowColor;
            ctx.beginPath();
            ctx.roundRect(dw * 0.15, dh * 0.05, dw * 0.2, dh * 0.1, 3);
            ctx.fill();

            // Legs & Feet (Running animation effect)
            const legOffset = Math.sin(Date.now() * 0.015) * (gameActive ? 4 : 0);
            ctx.fillStyle = shadowColor;
            
            // Left Leg
            ctx.beginPath();
            ctx.roundRect(-dw * 0.2, dh * 0.3, dw * 0.15, dh * 0.22 + legOffset, 4);
            ctx.fill();
            
            // Right Leg
            ctx.beginPath();
            ctx.roundRect(dw * 0.05, dh * 0.3, dw * 0.15, dh * 0.22 - legOffset, 4);
            ctx.fill();

            ctx.restore();
        }

        function updateGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Ground Line
            ctx.strokeStyle = 'rgba(33, 117, 153, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 15);
            ctx.lineTo(canvas.width, canvas.height - 15);
            ctx.stroke();

            // Ground Grid Pattern
            ctx.fillStyle = 'rgba(33, 115, 54, 0.1)';
            ctx.fillRect(0, canvas.height - 15, canvas.width, 15);

            // Update Dino
            updateDino();
            drawDino();

            const isSlowMo = (dino.powerup === POWERUPS.FREEZE.id);

            // Update Fireballs
            for (let f = fireballs.length - 1; f >= 0; f--) {
                const fb = fireballs[f];
                fb.update();
                fb.draw();

                if (fb.y < -20) {
                    fireballs.splice(f, 1);
                }
            }

            // Update Powerups
            for (let p = powerups.length - 1; p >= 0; p--) {
                const pw = powerups[p];
                pw.update();
                pw.draw();

                // Check collision with Dino
                const dw = dino.width * dino.scale;
                const dh = dino.height * dino.scale;
                const dist = Math.hypot((dino.x + dw/2) - pw.x, (dino.y + dh/2) - pw.y);

                if (dist < pw.radius + dw/2) {
                    // Collect Power-up!
                    dino.powerup = pw.info.id;
                    dino.powerupEndTime = Date.now() + pw.info.duration;
                    if (pw.info.id === POWERUPS.SHIELD.id) dino.shieldActive = true;

                    if (activePowerupVal) activePowerupVal.textContent = pw.info.name;
                    playSound('powerup');
                    createExplosion(pw.x, pw.y, pw.info.color, 16);

                    // Show Fire control button on mobile if Fire Breath
                    if (btnFire) {
                        btnFire.style.display = (pw.info.id === POWERUPS.FIRE.id) ? 'inline-block' : 'none';
                    }

                    powerups.splice(p, 1);
                    score += 50;
                    if (scoreVal) scoreVal.textContent = score;
                } else if (pw.y > canvas.height + 30) {
                    powerups.splice(p, 1);
                }
            }

            // Update Meteors
            for (let m = meteors.length - 1; m >= 0; m--) {
                const met = meteors[m];
                met.update(isSlowMo);
                met.draw();

                // Check fireball collision
                let hitByFireball = false;
                for (let f = fireballs.length - 1; f >= 0; f--) {
                    const fb = fireballs[f];
                    const distFb = Math.hypot(met.x - fb.x, met.y - fb.y);
                    if (distFb < met.radius + fb.radius) {
                        fireballs.splice(f, 1);
                        hitByFireball = true;
                        break;
                    }
                }

                if (hitByFireball) {
                    createExplosion(met.x, met.y, met.color, 18);
                    playSound('blast');
                    meteors.splice(m, 1);
                    score += 30;
                    if (scoreVal) scoreVal.textContent = score;
                    continue;
                }

                // Check Dino Collision
                const dw = dino.width * dino.scale;
                const dh = dino.height * dino.scale;
                const dinoCx = dino.x + dw / 2;
                const dinoCy = dino.y + dh / 2;
                const distDino = Math.hypot(met.x - dinoCx, met.y - dinoCy);

                if (distDino < met.radius + dw * 0.4) {
                    if (dino.powerup === POWERUPS.SHIELD.id && dino.shieldActive) {
                        // Shield absorbs hit!
                        dino.shieldActive = false;
                        dino.powerup = null;
                        if (activePowerupVal) activePowerupVal.textContent = 'None';
                        createExplosion(met.x, met.y, '#00f0ff', 20);
                        playSound('hit');
                        meteors.splice(m, 1);
                    } else if (dino.powerup === POWERUPS.MEGA.id) {
                        // Mega Dino smashes meteor!
                        createExplosion(met.x, met.y, '#39ff14', 22);
                        playSound('blast');
                        meteors.splice(m, 1);
                        score += 50;
                        if (scoreVal) scoreVal.textContent = score;
                    } else {
                        // Game Over!
                        createExplosion(dinoCx, dinoCy, '#ff3300', 25);
                        playSound('hit');
                        endGame();
                        return;
                    }
                } else if (met.y - met.radius > canvas.height) {
                    // Dodged meteor!
                    meteors.splice(m, 1);
                    score += 10;
                    if (scoreVal) scoreVal.textContent = score;
                }
            }

            // Keep Score ticking
            if (gameActive) {
                animationFrameId = requestAnimationFrame(updateGame);
            }
        }

        function startGame() {
            if (gameActive) return;

            score = 0;
            if (scoreVal) scoreVal.textContent = score;
            if (activePowerupVal) activePowerupVal.textContent = 'None';
            if (btnFire) btnFire.style.display = 'none';

            resetDino();
            meteors = [];
            powerups = [];
            fireballs = [];
            particles = [];
            gameActive = true;

            gameOverlay.style.opacity = '0';
            setTimeout(() => {
                if (gameActive) gameOverlay.style.display = 'none';
            }, 300);

            if (startGameBtn) startGameBtn.textContent = 'RESTART';

            if (spawnMeteorInterval) clearInterval(spawnMeteorInterval);
            if (spawnPowerupInterval) clearInterval(spawnPowerupInterval);

            spawnMeteorInterval = setInterval(spawnMeteor, 750);
            spawnPowerupInterval = setInterval(spawnPowerup, 7000);

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            updateGame();
        }

        function endGame() {
            gameActive = false;
            clearInterval(spawnMeteorInterval);
            clearInterval(spawnPowerupInterval);
            cancelAnimationFrame(animationFrameId);

            if (score > highScore) {
                highScore = score;
                localStorage.setItem('dino_high_score', highScore);
                if (highScoreVal) highScoreVal.textContent = highScore;
            }

            gameOverlay.innerHTML = `
                <div class="overlay-content">
                    <span class="overlay-text text-amber" style="display: block; font-size: 2.2rem; margin-bottom: 10px; opacity: 1; animation: none; color: #ff8c00;">METEOR CRASH! ☄️</span>
                    <span style="display: block; font-size: 1.3rem; font-weight: 700; color: #39ff14; margin-bottom: 20px;">SURVIVED SCORE: ${score}</span>
                    <span style="font-size: 1rem; color: #8f9cae;">Click Start to Try Again!</span>
                </div>
            `;
            gameOverlay.style.display = 'flex';
            setTimeout(() => {
                gameOverlay.style.opacity = '1';
            }, 50);

            if (startGameBtn) startGameBtn.textContent = 'START GAME';
        }

        // Input Event Listeners
        function onKeyDown(e) {
            if (!gameActive) return;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                keys.up = true;
                e.preventDefault();
            }
            if (e.key === ' ') {
                e.preventDefault();
                if (dino && dino.powerup === POWERUPS.FIRE.id) {
                    keys.fire = true;
                } else {
                    keys.up = true;
                }
            }
            if (e.key === 'f' || e.key === 'F' || e.key === 'Control') keys.fire = true;
        }

        function onKeyUp(e) {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
            if (e.key === ' ') {
                keys.up = false;
                keys.fire = false;
            }
            if (e.key === 'f' || e.key === 'F' || e.key === 'Control') keys.fire = false;
        }

        // Touch Control Bindings
        function bindTouchBtn(btn, keyProp) {
            if (!btn) return;
            const startHandler = (e) => { e.preventDefault(); keys[keyProp] = true; };
            const endHandler = (e) => { e.preventDefault(); keys[keyProp] = false; };
            btn.addEventListener('touchstart', startHandler, { passive: false });
            btn.addEventListener('touchend', endHandler);
            btn.addEventListener('mousedown', startHandler);
            btn.addEventListener('mouseup', endHandler);
            btn.addEventListener('mouseleave', endHandler);
        }

        bindTouchBtn(btnLeft, 'left');
        bindTouchBtn(btnRight, 'right');

        // Dynamic Jump/Fire button touch binding
        if (btnJump) {
            const startJumpOrFire = (e) => {
                e.preventDefault();
                if (dino && dino.powerup === POWERUPS.FIRE.id) {
                    keys.fire = true;
                } else {
                    keys.up = true;
                }
            };
            const endJumpOrFire = (e) => {
                e.preventDefault();
                keys.fire = false;
                keys.up = false;
            };
            btnJump.addEventListener('touchstart', startJumpOrFire, { passive: false });
            btnJump.addEventListener('touchend', endJumpOrFire);
            btnJump.addEventListener('mousedown', startJumpOrFire);
            btnJump.addEventListener('mouseup', endJumpOrFire);
            btnJump.addEventListener('mouseleave', endJumpOrFire);
        }

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        if (startGameBtn) startGameBtn.addEventListener('click', startGame);

        // Draw Initial Preview Frame
        resetDino();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(33, 117, 153, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 15);
        ctx.lineTo(canvas.width, canvas.height - 15);
        ctx.stroke();
        drawDino();

        // Return Destructor
        return function destroy() {
            gameActive = false;
            clearInterval(spawnMeteorInterval);
            clearInterval(spawnPowerupInterval);
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            if (startGameBtn) startGameBtn.removeEventListener('click', startGame);

            gameOverlay.innerHTML = `<span class="overlay-text text-amber" style="color: #ff8c00;">Dodge the Meteors!</span>`;
            gameOverlay.style.display = 'flex';
            gameOverlay.style.opacity = '1';
            if (startGameBtn) startGameBtn.textContent = 'START GAME';
            if (scoreVal) scoreVal.textContent = '0';
            if (activePowerupVal) activePowerupVal.textContent = 'None';
        };
    };
})();
