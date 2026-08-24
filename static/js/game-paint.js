/**
 * Magic Paint Drawing Board Module
 * Originally created for A.G. Brown (age 5)
 */

(function() {
    window.initPaintGame = function() {
        const paintCanvas = document.getElementById('paintCanvas');
        if (!paintCanvas) return () => {};
        const paintCtx = paintCanvas.getContext('2d');

        // Toolbar elements
        const toolBrushBtn = document.getElementById('toolBrushBtn');
        const toolStampBtn = document.getElementById('toolStampBtn');
        const stampGroup = document.getElementById('stampGroup');
        const sizeButtons = document.querySelectorAll('.size-options .size-btn');
        const colorButtons = document.querySelectorAll('.color-palette .color-btn');
        const stampButtons = document.querySelectorAll('.stamp-palette .stamp-btn');
        const clearBtn = document.getElementById('clearPaintBtn');
        const soundToggle = document.getElementById('paintSoundToggle');
        const soundOnIcon = soundToggle?.querySelector('.sound-on');
        const soundOffIcon = soundToggle?.querySelector('.sound-off');

        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        let currentTool = 'brush';
        let currentColor = '#ff007f';
        let currentSize = 8;
        let currentStamp = '💖';

        let paintParticles = [];
        let animationFrameId = null;
        let audioCtx = null;
        let soundEnabled = true;

        // Sync sound UI state
        if (soundOnIcon && soundOffIcon) {
            soundOnIcon.style.display = soundEnabled ? 'block' : 'none';
            soundOffIcon.style.display = soundEnabled ? 'none' : 'block';
        }

        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }

        // Sound Synthesizers
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
            if (now - lastDrawSoundTime < 120) return; // throttle
            lastDrawSoundTime = now;
            
            initAudio();
            const audioTime = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
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

        // Particle Class
        class PaintParticle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2 - 1.5;
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
            
            paintCtx.drawImage(tempCanvas, 0, 0);
            paintCtx.lineCap = 'round';
            paintCtx.lineJoin = 'round';
        }

        function handleResize() {
            resizePaintCanvas();
        }
        window.addEventListener('resize', handleResize);
        resizePaintCanvas();

        // Toolbar Events
        function onToolBrushClick() {
            currentTool = 'brush';
            toolBrushBtn.classList.add('active');
            toolStampBtn.classList.remove('active');
            if (stampGroup) stampGroup.style.display = 'none';
        }

        function onToolStampClick() {
            currentTool = 'stamp';
            toolStampBtn.classList.add('active');
            toolBrushBtn.classList.remove('active');
            if (stampGroup) stampGroup.style.display = 'flex';
        }

        function onSizeClick(e) {
            const btn = e.currentTarget;
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSize = parseInt(btn.getAttribute('data-size'), 10);
        }

        function onColorClick(e) {
            const btn = e.currentTarget;
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentColor = btn.getAttribute('data-color');
        }

        function onStampClick(e) {
            const btn = e.currentTarget;
            stampButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStamp = btn.getAttribute('data-stamp');
        }

        function onClearClick() {
            playClearSound();
            paintCtx.save();
            paintCtx.fillStyle = currentColor;
            paintCtx.globalAlpha = 0.3;
            paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
            paintCtx.restore();

            setTimeout(() => {
                paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
            }, 80);
        }

        function onSoundToggleClick() {
            soundEnabled = !soundEnabled;
            if (soundOnIcon && soundOffIcon) {
                if (soundEnabled) {
                    soundOnIcon.style.display = 'block';
                    soundOffIcon.style.display = 'none';
                    initAudio();
                } else {
                    soundOnIcon.style.display = 'none';
                    soundOffIcon.style.display = 'block';
                }
            }
        }

        // Bind toolbar listeners
        toolBrushBtn?.addEventListener('click', onToolBrushClick);
        toolStampBtn?.addEventListener('click', onToolStampClick);
        sizeButtons.forEach(btn => btn.addEventListener('click', onSizeClick));
        colorButtons.forEach(btn => btn.addEventListener('click', onColorClick));
        stampButtons.forEach(btn => btn.addEventListener('click', onStampClick));
        clearBtn?.addEventListener('click', onClearClick);
        soundToggle?.addEventListener('click', onSoundToggleClick);

        // Drawing Events
        function getCoords(e) {
            const rect = paintCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const scaleX = rect.width ? (paintCanvas.width / rect.width) : 1;
            const scaleY = rect.height ? (paintCanvas.height / rect.height) : 1;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY,
                rawYPercent: rect.height ? (clientY - rect.top) / rect.height : 0.5
            };
        }

        function startDrawing(e) {
            initAudio();
            const coords = getCoords(e);
            
            if (currentTool === 'stamp') {
                drawStamp(coords.x, coords.y);
                return;
            }

            isDrawing = true;
            lastX = coords.x;
            lastY = coords.y;
            
            paintCtx.beginPath();
            paintCtx.arc(lastX, lastY, currentSize / 2, 0, Math.PI * 2);
            paintCtx.fillStyle = currentColor;
            paintCtx.fill();
            addPaintParticles(lastX, lastY, currentColor, 4);
        }

        function draw(e) {
            if (!isDrawing || currentTool !== 'brush') return;
            e.preventDefault();
            
            const coords = getCoords(e);
            
            paintCtx.beginPath();
            paintCtx.moveTo(lastX, lastY);
            paintCtx.lineTo(coords.x, coords.y);
            
            paintCtx.strokeStyle = currentColor;
            paintCtx.lineWidth = currentSize;
            paintCtx.shadowColor = currentColor;
            paintCtx.shadowBlur = 10;
            paintCtx.stroke();
            
            playDrawSound(coords.rawYPercent);
            
            lastX = coords.x;
            lastY = coords.y;
        }

        function stopDrawing() {
            isDrawing = false;
            paintCtx.shadowBlur = 0;
        }

        function drawStamp(x, y) {
            playStampSound();
            paintCtx.save();
            paintCtx.shadowColor = currentColor;
            paintCtx.shadowBlur = 15;
            
            let fontSize = 36;
            if (currentSize === 16) fontSize = 56;
            if (currentSize === 32) fontSize = 80;
            
            paintCtx.font = `${fontSize}px Arial`;
            paintCtx.textAlign = 'center';
            paintCtx.textBaseline = 'middle';
            paintCtx.fillText(currentStamp, x, y);
            paintCtx.restore();
        }

        function onMouseDown(e) { startDrawing(e); }
        function onMouseMove(e) { draw(e); }
        function onMouseUp() { stopDrawing(); }

        function onTouchStart(e) { startDrawing(e); }
        function onTouchMove(e) { draw(e); }
        function onTouchEnd() { stopDrawing(); }

        paintCanvas.addEventListener('mousedown', onMouseDown);
        paintCanvas.addEventListener('mousemove', onMouseMove);
        paintCanvas.addEventListener('mouseup', onMouseUp);
        paintCanvas.addEventListener('mouseleave', onMouseUp);

        paintCanvas.addEventListener('touchstart', onTouchStart, { passive: false });
        paintCanvas.addEventListener('touchmove', onTouchMove, { passive: false });
        paintCanvas.addEventListener('touchend', onTouchEnd);

        // Particle Update Loop
        function updatePaintParticles() {
            paintParticles.forEach((p, index) => {
                p.update();
                if (p.alpha <= 0) {
                    paintParticles.splice(index, 1);
                } else {
                    p.draw(paintCtx);
                }
            });
            animationFrameId = requestAnimationFrame(updatePaintParticles);
        }
        updatePaintParticles();

        // Destructor
        return function destroy() {
            isDrawing = false;
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);

            // Unbind canvas
            paintCanvas.removeEventListener('mousedown', onMouseDown);
            paintCanvas.removeEventListener('mousemove', onMouseMove);
            paintCanvas.removeEventListener('mouseup', onMouseUp);
            paintCanvas.removeEventListener('mouseleave', onMouseUp);
            paintCanvas.removeEventListener('touchstart', onTouchStart);
            paintCanvas.removeEventListener('touchmove', onTouchMove);
            paintCanvas.removeEventListener('touchend', onTouchEnd);

            // Unbind toolbar
            toolBrushBtn?.removeEventListener('click', onToolBrushClick);
            toolStampBtn?.removeEventListener('click', onToolStampClick);
            sizeButtons.forEach(btn => btn.removeEventListener('click', onSizeClick));
            colorButtons.forEach(btn => btn.removeEventListener('click', onColorClick));
            stampButtons.forEach(btn => btn.removeEventListener('click', onStampClick));
            clearBtn?.removeEventListener('click', onClearClick);
            soundToggle?.removeEventListener('click', onSoundToggleClick);

            // Reset canvas state
            paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
            paintCtx.shadowBlur = 0;
            paintParticles = [];
        };
    };
})();
