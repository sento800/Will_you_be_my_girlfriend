/**
 * ============================================================================
 * ROMANTIC CONFESSION WEB APP - INTERACTIVE ENGINE
 * ============================================================================
 */

(function () {
  'use strict';

  // Default meeting date: 20/09 (September 20)
  function getDefaultStartDate() {
    const now = new Date();
    const currentYear = now.getFullYear();
    // September is month index 8 (0-indexed)
    let meet = new Date(currentYear, 8, 20, 0, 0, 0);
    if (meet > now) {
      meet = new Date(currentYear - 1, 8, 20, 0, 0, 0);
    }
    const yyyy = meet.getFullYear();
    const mm = String(meet.getMonth() + 1).padStart(2, '0');
    const dd = String(meet.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // --- APPLICATION STATE & CONFIGURATION ---
  const state = {
    herName: 'Em',
    hisName: 'Anh',
    startDate: getDefaultStartDate(), // Default to September 20th
    letterText: `Từ ngày đầu tiên ánh mắt ta chạm nhau, anh đã biết trái tim mình không còn thuộc về riêng anh nữa.

Cảm ơn em vì đã đến, mang theo nụ cười rạng rỡ và sự dịu dàng sưởi ấm những ngày tháng bình yên của anh. Mỗi khoảnh khắc ở bên em, dù chỉ là những câu chuyện vu vơ, anh đều thấy quý giá vô ngần.

Hôm nay, anh lấy hết can đảm viết ra những dòng này, chỉ để nói với em một điều từ tận đáy lòng...`,
    photoUrl: 'assets/couple.jpg',
    musicPlaying: false,
    soundFxEnabled: true,
    runawayCount: 0,
    envelopeOpened: false
  };

  // 6 stages of playful resistance before surrendering
  const stageQuotes = [
    { btn: 'Ơ kìa hụt gòi nè 😜', hint: 'Nàng đã né thử 1/6 lần rồi nha! 💖' },
    { btn: 'Nút này bị kẹt gòi nhen 🥺', hint: 'Nàng đã né 2/6 lần rồi nè, suy nghĩ lại điii mà~ 💕' },
    { btn: 'Hổng cho bấm nút này đâu à! 🙈', hint: 'Nàng đã né 3/6 lần rồi đó, anh biết em cũng thương anh mừ 🥰' },
    { btn: 'Năn nỉ đồng ý đi mừ~ 🥺', hint: 'Nàng đã né 4/6 lần rồi, tim anh hồi hộp lắm nè! 💓' },
    { btn: 'Cơ hội cuối cùng đó nha! ✨', hint: 'Nàng đã né 5/6 lần rồi, chỉ còn đúng 1 lần né duy nhất nữa thôi nha! 😱' },
    { btn: 'Thôi chịu thua, đồng ý nè! 🥰', hint: 'Hết trọn 6 lượt né rồi nha! Giờ em chỉ có thể làm người yêu của anh thôi 💍💕' }
  ];

  // DOM Elements Cache
  const el = {
    canvas: document.getElementById('ambient-canvas'),
    musicToggleBtn: document.getElementById('music-toggle-btn'),
    musicIcon: document.getElementById('music-icon'),
    musicStatus: document.getElementById('music-status'),
    soundFxBtn: document.getElementById('sound-fx-btn'),
    soundFxIcon: document.getElementById('sound-fx-icon'),
    customizeBtn: document.getElementById('customize-btn'),
    sceneEnvelope: document.getElementById('scene-envelope'),
    sceneLetter: document.getElementById('scene-letter'),
    envelopeBox: document.getElementById('envelope-box'),
    waxSeal: document.getElementById('wax-seal'),
    herNameTitle: document.getElementById('her-name-title'),
    hisNameSig: document.getElementById('his-name-sig'),
    herNameQuestion: document.getElementById('her-name-question'),
    hisNameQuestion: document.getElementById('his-name-question'),
    certHerName: document.getElementById('cert-her-name'),
    certHisName: document.getElementById('cert-his-name'),
    certDateVal: document.getElementById('cert-date-val'),
    couplePhoto: document.getElementById('couple-photo'),
    daysCount: document.getElementById('days-count'),
    hoursCount: document.getElementById('hours-count'),
    minutesCount: document.getElementById('minutes-count'),
    secondsCount: document.getElementById('seconds-count'),
    typewriterText: document.getElementById('typewriter-text'),
    typewriterCursor: document.getElementById('typewriter-cursor'),
    btnYes: document.getElementById('btn-yes'),
    btnNo: document.getElementById('btn-no'),
    noBtnText: document.getElementById('no-btn-text'),
    playfulHint: document.getElementById('playful-hint'),
    successDialog: document.getElementById('success-dialog'),
    dialogCloseBtn: document.getElementById('dialog-close-btn'),
    customDialog: document.getElementById('custom-dialog'),
    customCloseBtn: document.getElementById('custom-close-btn'),
    customizeForm: document.getElementById('customize-form'),
    inputHerName: document.getElementById('input-her-name'),
    inputHisName: document.getElementById('input-his-name'),
    inputStartDate: document.getElementById('input-start-date'),
    inputLetterContent: document.getElementById('input-letter-content'),
    inputFilePhoto: document.getElementById('input-file-photo'),
    copyCustomLinkBtn: document.getElementById('copy-custom-link-btn'),
    shareLoveBtn: document.getElementById('share-love-btn'),
    replayFireworksBtn: document.getElementById('replay-fireworks-btn'),
    toastNotice: document.getElementById('toast-notice')
  };

  // ==========================================================================
  // 1. WEB AUDIO API - ROMANTIC HARMONIC SYNTHESIZER & SOUND FX
  // ==========================================================================
  let audioCtx = null;
  let synthInterval = null;
  let bgmMasterGain = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
        bgmMasterGain = audioCtx.createGain();
        bgmMasterGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        bgmMasterGain.connect(audioCtx.destination);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play single warm bell / piano chime
  function playSynthNote(freq, duration = 1.6, timeOffset = 0, volume = 0.25) {
    if (!audioCtx || !state.musicPlaying) return;
    const now = audioCtx.currentTime + timeOffset;

    // Oscillator 1: Fundamental Sine
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Oscillator 2: Soft harmonic triangle
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    // Gain Envelopes
    const noteGain = audioCtx.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(volume, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(volume * 0.4, now + 0.35);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Lowpass filter for warm velvety tone
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(bgmMasterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
  }

  // Romantic chord progression notes (Frequencies in Hz)
  // Canon in D inspired: D - A - Bm - F#m - G - D - G - A (transposed to romantic C/G key)
  const melodyNotes = [
    // Chord 1 (Cmaj): C4, G4, E5, G5
    [261.63, 392.00, 659.25, 783.99],
    // Chord 2 (Gmaj): G3, D4, B4, G5
    [196.00, 293.66, 493.88, 783.99],
    // Chord 3 (Am): A3, E4, C5, E5
    [220.00, 329.63, 523.25, 659.25],
    // Chord 4 (Em): E3, B3, G4, B4
    [164.81, 246.94, 392.00, 493.88],
    // Chord 5 (Fmaj): F3, C4, A4, C5
    [174.61, 261.63, 440.00, 523.25],
    // Chord 6 (Cmaj): C3, G3, E4, G4
    [130.81, 196.00, 329.63, 392.00],
    // Chord 7 (Fmaj): F3, A3, C4, F4
    [174.61, 220.00, 261.63, 349.23],
    // Chord 8 (Gmaj): G3, B3, D4, G4
    [196.00, 246.94, 293.66, 392.00]
  ];

  let currentMeasure = 0;

  function scheduleNextMeasure() {
    if (!state.musicPlaying || !audioCtx) return;
    const chord = melodyNotes[currentMeasure % melodyNotes.length];
    currentMeasure++;

    // Play arpeggiated romantic sequence
    playSynthNote(chord[0], 2.8, 0.0, 0.28);
    playSynthNote(chord[1], 2.2, 0.35, 0.22);
    playSynthNote(chord[2], 2.0, 0.7, 0.24);
    playSynthNote(chord[3], 2.4, 1.05, 0.26);
    playSynthNote(chord[2], 1.8, 1.4, 0.2);
    playSynthNote(chord[1], 1.8, 1.75, 0.2);
  }

  function startBGM() {
    initAudioContext();
    if (!audioCtx) return;
    state.musicPlaying = true;
    el.musicIcon.textContent = '💖';
    el.musicStatus.textContent = 'Đang phát nhạc';
    el.musicToggleBtn.classList.add('pulse-glow');

    scheduleNextMeasure();
    if (synthInterval) clearInterval(synthInterval);
    synthInterval = setInterval(scheduleNextMeasure, 2100);
  }

  function stopBGM() {
    state.musicPlaying = false;
    el.musicIcon.textContent = '🎵';
    el.musicStatus.textContent = 'Bật giai điệu';
    el.musicToggleBtn.classList.remove('pulse-glow');
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
  }

  function toggleBGM() {
    if (state.musicPlaying) {
      stopBGM();
      showToast('Đã tạm dừng nhạc 🌸');
    } else {
      startBGM();
      showToast('Đang phát giai điệu tình yêu 💕');
    }
  }

  // Sound FX: Harp Sweep on Envelope Open
  function playHarpSweep() {
    if (!state.soundFxEnabled) return;
    initAudioContext();
    if (!audioCtx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const now = audioCtx.currentTime + idx * 0.09;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.85);
    });
  }

  // Sound FX: Teasing Pop when "No" button teleports
  function playDodgePop() {
    if (!state.soundFxEnabled) return;
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Sound FX: Triumphant Fanfare on "Yes"
  function playFanfare() {
    if (!state.soundFxEnabled) return;
    initAudioContext();
    if (!audioCtx) return;

    const chords = [
      { f: [523.25, 659.25], t: 0, d: 0.2 },
      { f: [523.25, 659.25], t: 0.22, d: 0.2 },
      { f: [523.25, 659.25], t: 0.44, d: 0.25 },
      { f: [659.25, 783.99, 1046.50], t: 0.72, d: 1.5 }
    ];

    chords.forEach(c => {
      c.f.forEach(freq => {
        const now = audioCtx.currentTime + c.t;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + c.d);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + c.d + 0.05);
      });
    });
  }

  // ==========================================================================
  // 2. CANVAS ENGINE: DRIFTING SAKURA & BOKEH GLOWING HEARTS
  // ==========================================================================
  const canvasCtx = el.canvas.getContext('2d');
  let particles = [];
  let confettiParticles = [];
  let isCelebrating = false;

  function resizeCanvas() {
    el.canvas.width = window.innerWidth * window.devicePixelRatio;
    el.canvas.height = window.innerHeight * window.devicePixelRatio;
    canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  class SakuraPetal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * window.innerWidth;
      this.y = initial ? Math.random() * window.innerHeight : -20;
      this.size = Math.random() * 8 + 10;
      this.speedY = Math.random() * 1.2 + 0.8;
      this.speedX = Math.random() * 1.5 - 0.75;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.03;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.opacity = Math.random() * 0.45 + 0.4;
      this.isHeart = Math.random() > 0.65; // mix of petals & tiny floating hearts
    }

    update() {
      this.swayAngle += this.swaySpeed;
      this.x += this.speedX + Math.sin(this.swayAngle) * 0.8;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      if (this.y > window.innerHeight + 30 || this.x < -30 || this.x > window.innerWidth + 30) {
        this.reset();
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      if (this.isHeart) {
        // Draw delicate heart
        ctx.fillStyle = '#ff758c';
        const s = this.size * 0.6;
        ctx.beginPath();
        ctx.moveTo(0, s / 3);
        ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s / 3);
        ctx.bezierCurveTo(-s / 2, (2 * s) / 3, 0, s, 0, (4 * s) / 3);
        ctx.bezierCurveTo(0, s, s / 2, (2 * s) / 3, s / 2, s / 3);
        ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, s / 3);
        ctx.fill();
      } else {
        // Draw sakura petal
        ctx.fillStyle = '#ffb3c1';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.45, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Confetti Particle for the Grand Yes Moment
  class ConfettiItem {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 6; // upward boost
      this.gravity = 0.35;
      this.size = Math.random() * 10 + 6;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 12;
      this.opacity = 1;
      this.type = Math.random() > 0.4 ? 'heart' : 'ribbon';
      const colors = ['#ff3366', '#ff758c', '#ffd166', '#d81159', '#ff8da1', '#ffffff'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.98;
      this.rotation += this.rotationSpeed;
      this.opacity -= 0.007;
    }

    draw(ctx) {
      if (this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;

      if (this.type === 'heart') {
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(0, s / 3);
        ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s / 3);
        ctx.bezierCurveTo(-s / 2, (2 * s) / 3, 0, s, 0, (4 * s) / 3);
        ctx.bezierCurveTo(0, s, s / 2, (2 * s) / 3, s / 2, s / 3);
        ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, s / 3);
        ctx.fill();
      } else {
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      }

      ctx.restore();
    }
  }

  function initAmbientParticles() {
    particles = [];
    const count = window.innerWidth < 600 ? 30 : 55;
    for (let i = 0; i < count; i++) {
      particles.push(new SakuraPetal());
    }
  }

  function triggerCelebrationConfetti() {
    isCelebrating = true;
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.5;

    // Burst 150 confetti particles
    for (let i = 0; i < 180; i++) {
      confettiParticles.push(new ConfettiItem(originX, originY));
    }
    // Lateral side bursts
    setTimeout(() => {
      for (let i = 0; i < 80; i++) {
        confettiParticles.push(new ConfettiItem(window.innerWidth * 0.2, window.innerHeight * 0.4));
        confettiParticles.push(new ConfettiItem(window.innerWidth * 0.8, window.innerHeight * 0.4));
      }
    }, 300);
  }

  function renderAnimationLoop() {
    canvasCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Render Ambient Sakura Petals
    particles.forEach(p => {
      p.update();
      p.draw(canvasCtx);
    });

    // Render Confetti if active
    if (confettiParticles.length > 0) {
      for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const c = confettiParticles[i];
        c.update();
        c.draw(canvasCtx);
        if (c.opacity <= 0 || c.y > window.innerHeight + 100) {
          confettiParticles.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(renderAnimationLoop);
  }

  // ==========================================================================
  // 3. INTERACTIVE CURSOR / TOUCH TRAIL (SPARKLING HEARTS ON TAP)
  // ==========================================================================
  let lastTrailTime = 0;
  function spawnClickHeart(clientX, clientY) {
    const heart = document.createElement('div');
    heart.className = 'floating-click-heart';
    const symbols = ['💖', '💕', '🌸', '✨', '🌹'];
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = `${clientX}px`;
    heart.style.top = `${clientY}px`;
    heart.style.fontSize = `${Math.random() * 12 + 18}px`;
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1200);
  }

  window.addEventListener('pointermove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime > 160) {
      lastTrailTime = now;
      spawnClickHeart(e.clientX, e.clientY);
    }
  });

  window.addEventListener('pointerdown', (e) => {
    spawnClickHeart(e.clientX, e.clientY);
  });

  // ==========================================================================
  // 4. SCENE 1 -> 2: ENVELOPE OPENING & TYPEWRITER EFFECT
  // ==========================================================================
  function openEnvelope() {
    if (state.envelopeOpened) return;
    state.envelopeOpened = true;

    // Trigger visual opening
    el.envelopeBox.classList.add('opened');
    el.waxSeal.style.transform = 'translate(-50%, -50%) scale(1.3) rotate(20deg)';
    el.waxSeal.style.opacity = '0';

    // Play sounds
    playHarpSweep();
    startBGM();

    // After animation, reveal Scene 2 (Letter)
    setTimeout(() => {
      el.sceneEnvelope.classList.add('hidden');
      el.sceneLetter.classList.add('active');

      // Scroll smoothly to top of letter
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Start Typewriter
      startTypewriter();
    }, 850);
  }

  function startTypewriter() {
    const fullText = state.letterText;
    let idx = 0;
    el.typewriterText.textContent = '';
    el.typewriterCursor.style.display = 'inline-block';

    function typeNextChar() {
      if (idx < fullText.length) {
        el.typewriterText.textContent += fullText.charAt(idx);
        idx++;

        // Natural pause for commas and periods
        const char = fullText.charAt(idx - 1);
        let delay = 32;
        if (char === '.' || char === '!' || char === '?') delay = 350;
        else if (char === ',') delay = 180;
        else if (char === '\n') delay = 280;

        setTimeout(typeNextChar, delay);
      } else {
        // Subtle blink finish
        setTimeout(() => {
          el.typewriterCursor.style.display = 'none';
        }, 3000);
      }
    }

    setTimeout(typeNextChar, 400);
  }

  // ==========================================================================
  // 5. LIVE LOVE TIME COUNTER
  // ==========================================================================
  function updateLoveCounter() {
    let start;
    if (typeof state.startDate === 'string' && state.startDate.includes('-')) {
      const parts = state.startDate.split('-');
      if (parts.length === 3) {
        start = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0).getTime();
      } else {
        start = new Date(state.startDate).getTime();
      }
    } else {
      start = new Date(state.startDate).getTime();
    }

    const now = Date.now();
    const diff = Math.max(0, now - start);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    el.daysCount.textContent = days;
    el.hoursCount.textContent = String(hours).padStart(2, '0');
    el.minutesCount.textContent = String(minutes).padStart(2, '0');
    el.secondsCount.textContent = String(seconds).padStart(2, '0');
  }

  // ==========================================================================
  // 6. SCENE 3: THE PLAYFUL RUNAWAY "NO" BUTTON
  // ==========================================================================
  function dodgeNoButton(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (state.runawayCount >= 6) {
      handleAcceptance();
      return;
    }

    state.runawayCount++;
    playDodgePop();

    // Spawn mini heart pop at current button position
    const rect = el.btnNo.getBoundingClientRect();
    spawnClickHeart(rect.left + rect.width / 2, rect.top + rect.height / 2);

    const stage = stageQuotes[state.runawayCount - 1];
    el.noBtnText.textContent = stage.btn;
    el.playfulHint.textContent = stage.hint;

    const newScale = Math.min(1.48, 1 + state.runawayCount * 0.07);
    el.btnYes.style.transform = `scale(${newScale})`;

    if (state.runawayCount < 6) {
      // Calculate a bouncy dodge offset that stays inside the card right next to Yes
      const currentX = state.noOffsetX || 0;
      const dirX = currentX >= 0 ? -1 : 1;
      const jumpX = dirX * (Math.floor(Math.random() * 50) + 90);
      const jumpY = (Math.random() - 0.5) * 90;
      state.noOffsetX = jumpX;

      el.btnNo.style.position = 'relative';
      el.btnNo.style.zIndex = '10';
      el.btnNo.style.transition = 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease';
      el.btnNo.style.transform = `translate(${jumpX}px, ${jumpY}px)`;
    } else {
      // 6th time: stop dodging, return to center and surrender
      el.btnNo.style.transform = 'translate(0, 0)';
      el.btnNo.className = 'btn btn-yes pulse-button';
      el.btnNo.removeEventListener('mouseenter', dodgeNoButton);
    }
  }

  // ==========================================================================
  // 7. SCENE 4: ACCEPTANCE CELEBRATION ("DẠ EM ĐỒNG Ý!")
  // ==========================================================================
  function handleAcceptance() {
    playFanfare();
    triggerCelebrationConfetti();

    // Populate certificate names and date
    const today = new Date();
    const formattedDate = `Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
    el.certDateVal.textContent = formattedDate;

    // Show dialog
    if (typeof el.successDialog.showModal === 'function') {
      el.successDialog.showModal();
    } else {
      el.successDialog.setAttribute('open', '');
    }

    showToast('Hạnh phúc ngập tràn! Chúc mừng tình yêu của hai bạn! 🎉💖');
  }

  // ==========================================================================
  // 8. PERSONALIZATION & URL PARAMS / LOCALSTORAGE
  // ==========================================================================
  function loadPersistedOrUrlData() {
    // Check URL parameters first: ?her=Linh&him=Minh&date=2024-05-20
    const params = new URLSearchParams(window.location.search);
    const herParam = params.get('her');
    const himParam = params.get('him');
    const dateParam = params.get('date');

    // Or from localStorage
    const saved = localStorage.getItem('love_confession_data');
    let localData = {};
    if (saved) {
      try {
        localData = JSON.parse(saved);
      } catch (err) {
        console.error('Error parsing stored data:', err);
      }
    }

    if (herParam) state.herName = herParam;
    else if (localData.herName) state.herName = localData.herName;

    if (himParam) state.hisName = himParam;
    else if (localData.hisName) state.hisName = localData.hisName;

    if (dateParam) {
      state.startDate = dateParam;
    } else if (localData.startDate && localData.userSavedDate) {
      state.startDate = localData.startDate;
    } else {
      state.startDate = getDefaultStartDate();
      // Ensure storage is updated with the 20/09 date
      localData.startDate = state.startDate;
      try {
        localStorage.setItem('love_confession_data', JSON.stringify(localData));
      } catch (err) {}
    }

    if (localData.letterText) state.letterText = localData.letterText;
    if (localData.photoUrl) state.photoUrl = localData.photoUrl;

    applyStateToUI();
  }

  function applyStateToUI() {
    // Update labels & headers
    el.herNameTitle.textContent = state.herName;
    el.hisNameSig.textContent = `${state.hisName} của em 💕`;
    el.herNameQuestion.textContent = state.herName;
    el.hisNameQuestion.textContent = state.hisName;
    el.certHerName.textContent = state.herName;
    el.certHisName.textContent = state.hisName;

    if (state.photoUrl) {
      el.couplePhoto.src = state.photoUrl;
      const certPhoto = document.querySelector('.cert-img');
      if (certPhoto) certPhoto.src = state.photoUrl;
    }

    // Populate customize inputs
    el.inputHerName.value = state.herName;
    el.inputHisName.value = state.hisName;
    el.inputStartDate.value = state.startDate;
    el.inputLetterContent.value = state.letterText;
  }

  function saveCustomization(e) {
    e.preventDefault();
    state.herName = el.inputHerName.value.trim() || 'Em';
    state.hisName = el.inputHisName.value.trim() || 'Anh';
    if (el.inputStartDate.value) {
      state.startDate = el.inputStartDate.value;
    }
    if (el.inputLetterContent.value.trim()) {
      state.letterText = el.inputLetterContent.value.trim();
    }

    // Save to localStorage
    const dataToSave = {
      herName: state.herName,
      hisName: state.hisName,
      startDate: state.startDate,
      letterText: state.letterText,
      photoUrl: state.photoUrl,
      userSavedDate: true
    };
    localStorage.setItem('love_confession_data', JSON.stringify(dataToSave));

    applyStateToUI();
    el.customDialog.close();
    showToast('Đã lưu thông tin tỏ tình thành công! 💖');

    // If letter already visible, retype with new text
    if (state.envelopeOpened) {
      startTypewriter();
    }
  }

  // Custom Photo File Reader
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        state.photoUrl = evt.target.result;
        applyStateToUI();
        showToast('Đã tải ảnh kỷ niệm của hai bạn! 📷✨');
      };
      reader.readAsDataURL(file);
    }
  }

  // Share custom link generator
  function copyCustomShareLink() {
    const url = new URL(window.location.href);
    url.searchParams.set('her', state.herName);
    url.searchParams.set('him', state.hisName);
    url.searchParams.set('date', state.startDate);

    navigator.clipboard.writeText(url.toString()).then(() => {
      showToast('Đã sao chép đường link tỏ tình có tên nàng! Gửi ngay cho nàng nhé 💌');
    }).catch(() => {
      prompt('Hãy copy đường link tỏ tình này:', url.toString());
    });
  }

  // Toast message helper
  function showToast(message) {
    el.toastNotice.textContent = message;
    el.toastNotice.classList.add('show');
    setTimeout(() => {
      el.toastNotice.classList.remove('show');
    }, 3500);
  }

  // ==========================================================================
  // 9. EVENT LISTENERS SETUP
  // ==========================================================================
  function setupEventListeners() {
    // Envelope interactions
    el.envelopeBox.addEventListener('click', openEnvelope);
    el.envelopeBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });

    // Music toggle
    el.musicToggleBtn.addEventListener('click', toggleBGM);

    // Sound FX toggle
    el.soundFxBtn.addEventListener('click', () => {
      state.soundFxEnabled = !state.soundFxEnabled;
      el.soundFxIcon.textContent = state.soundFxEnabled ? '🔔' : '🔕';
      showToast(state.soundFxEnabled ? 'Đã bật hiệu ứng âm thanh 🔔' : 'Đã tắt hiệu ứng âm thanh 🔕');
    });

    // Runaway "No" button
    el.btnNo.addEventListener('mouseenter', dodgeNoButton);
    el.btnNo.addEventListener('touchstart', dodgeNoButton, { passive: false });
    el.btnNo.addEventListener('click', dodgeNoButton);

    // "Yes" button
    el.btnYes.addEventListener('click', handleAcceptance);

    // Dialog close
    el.dialogCloseBtn.addEventListener('click', () => el.successDialog.close());

    // Replay Fireworks
    el.replayFireworksBtn.addEventListener('click', () => {
      triggerCelebrationConfetti();
      playFanfare();
    });

    // Share / send sweet message
    el.shareLoveBtn.addEventListener('click', () => {
      const sweetMsg = `Em đồng ý làm người yêu của ${state.hisName} rồi nè! Yêu thương ${state.hisName} nhiều lắm! 💖🥰`;
      navigator.clipboard.writeText(sweetMsg).then(() => {
        showToast('Đã sao chép tin nhắn ngọt ngào! Hãy gửi ngay qua Zalo/Messenger nhé 💌');
      }).catch(() => {
        showToast('Hãy nhắn tin cho anh ấy ngay nhé: "Em đồng ý rồi nè!" 💕');
      });
    });

    // Customization modal
    el.customizeBtn.addEventListener('click', () => {
      if (typeof el.customDialog.showModal === 'function') {
        el.customDialog.showModal();
      } else {
        el.customDialog.setAttribute('open', '');
      }
    });

    el.customCloseBtn.addEventListener('click', () => el.customDialog.close());
    el.customizeForm.addEventListener('submit', saveCustomization);
    el.inputFilePhoto.addEventListener('change', handlePhotoUpload);
    el.copyCustomLinkBtn.addEventListener('click', copyCustomShareLink);

    // Window Resize for Canvas
    window.addEventListener('resize', () => {
      resizeCanvas();
      initAmbientParticles();
    });
  }

  // ==========================================================================
  // 10. INITIALIZATION
  // ==========================================================================
  function init() {
    loadPersistedOrUrlData();
    resizeCanvas();
    initAmbientParticles();
    renderAnimationLoop();
    setupEventListeners();

    // Live Love Counter interval
    updateLoveCounter();
    setInterval(updateLoveCounter, 1000);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
