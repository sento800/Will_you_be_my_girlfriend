'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// 6 stages of playful resistance before surrendering
const STAGE_QUOTES = [
  { btn: 'Ơ kìa hụt gòi nè 😜', hint: 'Nàng đã né thử 1/6 lần rồi nha! 💖' },
  { btn: 'Nút này bị kẹt gòi nhen 🥺', hint: 'Nàng đã né 2/6 lần rồi nè, suy nghĩ lại điii mà~ 💕' },
  { btn: 'Hổng cho bấm nút này đâu à! 🙈', hint: 'Nàng đã né 3/6 lần rồi đó, anh biết em cũng thương anh mừ 🥰' },
  { btn: 'Năn nỉ đồng ý đi mừ~ 🥺', hint: 'Nàng đã né 4/6 lần rồi, tim anh hồi hộp lắm nè! 💓' },
  { btn: 'Cơ hội cuối cùng đó nha! ✨', hint: 'Nàng đã né 5/6 lần rồi, chỉ còn đúng 1 lần né duy nhất nữa thôi nha! 😱' },
  { btn: 'Thôi chịu thua, đồng ý nè! 🥰', hint: 'Hết trọn 6 lượt né rồi nha! Giờ em chỉ có thể làm người yêu của anh thôi 💍💕' }
];

// Default meeting date: September 20th
function getDefaultStartDate() {
  if (typeof window === 'undefined') return '2026-09-20';
  const now = new Date();
  const currentYear = now.getFullYear();
  let meet = new Date(currentYear, 8, 20, 0, 0, 0); // Month is 0-indexed: 8 = Sept
  if (meet > now) {
    meet = new Date(currentYear - 1, 8, 20, 0, 0, 0);
  }
  const yyyy = meet.getFullYear();
  const mm = String(meet.getMonth() + 1).padStart(2, '0');
  const dd = String(meet.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function ConfessionPage() {
  // App state
  const [herName, setHerName] = useState('Em');
  const [hisName, setHisName] = useState('Anh');
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [letterText, setLetterText] = useState(
    `Từ ngày đầu tiên ánh mắt ta chạm nhau, anh đã biết trái tim mình không còn thuộc về riêng anh nữa.\n\nCảm ơn em vì đã đến, mang theo nụ cười rạng rỡ và sự dịu dàng sưởi ấm những ngày tháng bình yên của anh. Mỗi khoảnh khắc ở bên em, dù chỉ là những câu chuyện vu vơ, anh đều thấy quý giá vô ngần.\n\nHôm nay, anh lấy hết can đảm viết ra những dòng này, chỉ để nói với em một điều từ tận đáy lòng...`
  );
  const [photoUrl, setPhotoUrl] = useState('/assets/couple.jpg');
  
  // Interaction states
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [envelopeHidden, setEnvelopeHidden] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [soundFxEnabled, setSoundFxEnabled] = useState(true);
  const [runawayCount, setRunawayCount] = useState(0);
  const [noButtonOffset, setNoButtonOffset] = useState(null);
  const [noBtnText, setNoBtnText] = useState('Hổng thèm đâu 🙈');
  const [yesScale, setYesScale] = useState(1);
  const [playfulHint, setPlayfulHint] = useState('Thử bấm nút bên phải xem có bấm được hông nà 😜');
  
  // Timer state
  const [timer, setTimer] = useState({ days: 0, hours: '00', minutes: '00', seconds: '00' });
  
  // Typewriter state
  const [typedLetter, setTypedLetter] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Dialogs & Toast
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Form state
  const [formHerName, setFormHerName] = useState('Em');
  const [formHisName, setFormHisName] = useState('Anh');
  const [formStartDate, setFormStartDate] = useState('');
  const [formLetterText, setFormLetterText] = useState('');

  // Refs
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const bgmIntervalRef = useRef(null);
  const bgmMasterGainRef = useRef(null);
  const confettiParticlesRef = useRef([]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3500);
  }, []);

  // --- 1. WEB AUDIO API SYNTHESIZER ---
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
        const gain = audioCtxRef.current.createGain();
        gain.gain.setValueAtTime(0.18, audioCtxRef.current.currentTime);
        gain.connect(audioCtxRef.current.destination);
        bgmMasterGainRef.current = gain;
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playSynthNote = useCallback((freq, duration = 1.6, timeOffset = 0, volume = 0.25) => {
    if (!audioCtxRef.current || !bgmMasterGainRef.current) return;
    const now = audioCtxRef.current.currentTime + timeOffset;

    const osc1 = audioCtxRef.current.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = audioCtxRef.current.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    const noteGain = audioCtxRef.current.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(volume, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(volume * 0.4, now + 0.35);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const filter = audioCtxRef.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(bgmMasterGainRef.current);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
  }, []);

  const melodyNotes = [
    [261.63, 392.0, 659.25, 783.99],
    [196.0, 293.66, 493.88, 783.99],
    [220.0, 329.63, 523.25, 659.25],
    [164.81, 246.94, 392.0, 493.88],
    [174.61, 261.63, 440.0, 523.25],
    [130.81, 196.0, 329.63, 392.0],
    [174.61, 220.0, 261.63, 349.23],
    [196.0, 246.94, 293.66, 392.0]
  ];
  const measureRef = useRef(0);

  const scheduleNextMeasure = useCallback(() => {
    const chord = melodyNotes[measureRef.current % melodyNotes.length];
    measureRef.current++;
    playSynthNote(chord[0], 2.8, 0.0, 0.28);
    playSynthNote(chord[1], 2.2, 0.35, 0.22);
    playSynthNote(chord[2], 2.0, 0.7, 0.24);
    playSynthNote(chord[3], 2.4, 1.05, 0.26);
    playSynthNote(chord[2], 1.8, 1.4, 0.2);
    playSynthNote(chord[1], 1.8, 1.75, 0.2);
  }, [playSynthNote]);

  const startBGM = useCallback(() => {
    initAudio();
    setMusicPlaying(true);
    scheduleNextMeasure();
    if (bgmIntervalRef.current) clearInterval(bgmIntervalRef.current);
    bgmIntervalRef.current = setInterval(scheduleNextMeasure, 2100);
  }, [initAudio, scheduleNextMeasure]);

  const stopBGM = useCallback(() => {
    setMusicPlaying(false);
    if (bgmIntervalRef.current) {
      clearInterval(bgmIntervalRef.current);
      bgmIntervalRef.current = null;
    }
  }, []);

  const toggleBGM = () => {
    if (musicPlaying) {
      stopBGM();
      showToast('Đã tạm dừng nhạc 🌸');
    } else {
      startBGM();
      showToast('Đang phát giai điệu tình yêu 💕');
    }
  };

  const playHarpSweep = useCallback(() => {
    if (!soundFxEnabled) return;
    initAudio();
    if (!audioCtxRef.current) return;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const now = audioCtxRef.current.currentTime + idx * 0.09;
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start(now);
      osc.stop(now + 0.85);
    });
  }, [soundFxEnabled, initAudio]);

  const playDodgePop = useCallback(() => {
    if (!soundFxEnabled) return;
    initAudio();
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }, [soundFxEnabled, initAudio]);

  const playFanfare = useCallback(() => {
    if (!soundFxEnabled) return;
    initAudio();
    if (!audioCtxRef.current) return;
    const chords = [
      { f: [523.25, 659.25], t: 0, d: 0.2 },
      { f: [523.25, 659.25], t: 0.22, d: 0.2 },
      { f: [523.25, 659.25], t: 0.44, d: 0.25 },
      { f: [659.25, 783.99, 1046.5], t: 0.72, d: 1.5 }
    ];
    chords.forEach((c) => {
      c.f.forEach((freq) => {
        const now = audioCtxRef.current.currentTime + c.t;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + c.d);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start(now);
        osc.stop(now + c.d + 0.05);
      });
    });
  }, [soundFxEnabled, initAudio]);

  // --- 2. CANVAS PETALS & HEARTS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

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
        this.isHeart = Math.random() > 0.65;
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
      draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        c.globalAlpha = this.opacity;
        if (this.isHeart) {
          c.fillStyle = '#ff758c';
          const s = this.size * 0.6;
          c.beginPath();
          c.moveTo(0, s / 3);
          c.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s / 3);
          c.bezierCurveTo(-s / 2, (2 * s) / 3, 0, s, 0, (4 * s) / 3);
          c.bezierCurveTo(0, s, s / 2, (2 * s) / 3, s / 2, s / 3);
          c.bezierCurveTo(s / 2, 0, 0, 0, 0, s / 3);
          c.fill();
        } else {
          c.fillStyle = '#ffb3c1';
          c.beginPath();
          c.ellipse(0, 0, this.size * 0.45, this.size * 0.8, 0, 0, Math.PI * 2);
          c.fill();
        }
        c.restore();
      }
    }

    const petals = [];
    const count = window.innerWidth < 600 ? 30 : 55;
    for (let i = 0; i < count; i++) {
      petals.push(new SakuraPetal());
    }

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      petals.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      // Render confetti if any
      const confetti = confettiParticlesRef.current;
      if (confetti.length > 0) {
        for (let i = confetti.length - 1; i >= 0; i--) {
          const item = confetti[i];
          item.vy += item.gravity;
          item.x += item.vx;
          item.y += item.vy;
          item.vx *= 0.98;
          item.rotation += item.rotationSpeed;
          item.opacity -= 0.007;

          if (item.opacity <= 0 || item.y > window.innerHeight + 100) {
            confetti.splice(i, 1);
          } else {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate((item.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, item.opacity);
            ctx.fillStyle = item.color;
            if (item.type === 'heart') {
              const s = item.size;
              ctx.beginPath();
              ctx.moveTo(0, s / 3);
              ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s / 3);
              ctx.bezierCurveTo(-s / 2, (2 * s) / 3, 0, s, 0, (4 * s) / 3);
              ctx.bezierCurveTo(0, s, s / 2, (2 * s) / 3, s / 2, s / 3);
              ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, s / 3);
              ctx.fill();
            } else {
              ctx.fillRect(-item.size / 2, -item.size / 4, item.size, item.size / 2);
            }
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- 3. FLOATING CLICK HEARTS TRAIL ---
  const spawnHeartTrail = useCallback((clientX, clientY) => {
    if (typeof document === 'undefined') return;
    const heart = document.createElement('div');
    heart.className = 'floating-click-heart';
    const symbols = ['💖', '💕', '🌸', '✨', '🌹'];
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = `${clientX}px`;
    heart.style.top = `${clientY}px`;
    heart.style.fontSize = `${Math.random() * 12 + 18}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  }, []);

  useEffect(() => {
    let lastTime = 0;
    const handlePointerMove = (e) => {
      const now = Date.now();
      if (now - lastTime > 160) {
        lastTime = now;
        spawnHeartTrail(e.clientX, e.clientY);
      }
    };
    const handlePointerDown = (e) => {
      spawnHeartTrail(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [spawnHeartTrail]);

  // --- 4. DATA PERSISTENCE & URL PARAMS ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const herParam = params.get('her');
    const himParam = params.get('him');
    const dateParam = params.get('date');

    const saved = localStorage.getItem('love_confession_data');
    let localData = {};
    if (saved) {
      try {
        localData = JSON.parse(saved);
      } catch (e) {}
    }

    const resolvedHer = herParam || localData.herName || 'Em';
    const resolvedHim = himParam || localData.hisName || 'Anh';
    const resolvedDate = dateParam || (localData.userSavedDate ? localData.startDate : getDefaultStartDate());
    const resolvedLetter = localData.letterText || letterText;
    const resolvedPhoto = localData.photoUrl || photoUrl;

    setHerName(resolvedHer);
    setHisName(resolvedHim);
    setStartDate(resolvedDate);
    setLetterText(resolvedLetter);
    setPhotoUrl(resolvedPhoto);

    setFormHerName(resolvedHer);
    setFormHisName(resolvedHim);
    setFormStartDate(resolvedDate);
    setFormLetterText(resolvedLetter);

    // Save defaults to storage
    localStorage.setItem(
      'love_confession_data',
      JSON.stringify({
        herName: resolvedHer,
        hisName: resolvedHim,
        startDate: resolvedDate,
        letterText: resolvedLetter,
        photoUrl: resolvedPhoto
      })
    );
  }, []);

  // --- 5. LIVE LOVE TIMER ---
  useEffect(() => {
    const updateTimer = () => {
      let start;
      if (typeof startDate === 'string' && startDate.includes('-')) {
        const parts = startDate.split('-');
        if (parts.length === 3) {
          start = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0).getTime();
        } else {
          start = new Date(startDate).getTime();
        }
      } else {
        start = new Date(startDate).getTime();
      }

      const diff = Math.max(0, Date.now() - start);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimer({
        days,
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  // --- 6. TYPEWRITER EFFECT ---
  const startTypewriter = useCallback(() => {
    setTypedLetter('');
    setShowCursor(true);
    let idx = 0;
    const fullText = letterText;

    function typeNext() {
      if (idx < fullText.length) {
        setTypedLetter(fullText.substring(0, idx + 1));
        idx++;
        const char = fullText.charAt(idx - 1);
        let delay = 32;
        if (char === '.' || char === '!' || char === '?') delay = 350;
        else if (char === ',') delay = 180;
        else if (char === '\n') delay = 280;
        setTimeout(typeNext, delay);
      } else {
        setTimeout(() => setShowCursor(false), 3000);
      }
    }
    setTimeout(typeNext, 400);
  }, [letterText]);

  // --- 7. OPEN ENVELOPE ---
  const handleOpenEnvelope = () => {
    if (envelopeOpened) return;
    setEnvelopeOpened(true);
    playHarpSweep();
    startBGM();

    setTimeout(() => {
      setEnvelopeHidden(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      startTypewriter();
    }, 850);
  };

  // --- 8. RUNAWAY NO BUTTON (EXACTLY 6 TIMES) ---
  const handleDodgeNo = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (runawayCount >= 6) {
      handleAcceptance();
      return;
    }

    const nextCount = runawayCount + 1;
    setRunawayCount(nextCount);
    playDodgePop();

    const stage = STAGE_QUOTES[nextCount - 1];
    setNoBtnText(stage.btn);
    setPlayfulHint(stage.hint);
    setYesScale((prev) => Math.min(1.48, 1 + nextCount * 0.07));

    if (nextCount < 6) {
      // Jump playfully within the confession card around the Yes button
      setNoButtonOffset((prev) => {
        const currentX = prev ? prev.x : 0;
        const dirX = currentX >= 0 ? -1 : 1;
        const jumpX = dirX * (Math.floor(Math.random() * 50) + 90);
        const jumpY = (Math.random() - 0.5) * 90;
        return { x: jumpX, y: jumpY };
      });
    } else {
      // Reached 6th time: stop dodging, return to center
      setNoButtonOffset({ x: 0, y: 0 });
    }
  };

  // --- 9. CELEBRATION CONFETTI & ACCEPTANCE ---
  const triggerConfetti = useCallback(() => {
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.5;
    const colors = ['#ff3366', '#ff758c', '#ffd166', '#d81159', '#ff8da1', '#ffffff'];

    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      confettiParticlesRef.current.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        gravity: 0.35,
        size: Math.random() * 10 + 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        type: Math.random() > 0.4 ? 'heart' : 'ribbon',
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }, []);

  const ZALO_PHONE = '0917897358';
  const NTFY_TOPIC = 'love_0917897358';

  const handleAcceptance = () => {
    playFanfare();
    triggerConfetti();
    setShowSuccessModal(true);

    // Send silent background push notification
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const ntfyUrl = `https://ntfy.sh/${NTFY_TOPIC}?title=${encodeURIComponent('💖 Nang Da Dong Y!')}&priority=urgent&tags=tada,heart,ring`;
      fetch(ntfyUrl, {
        method: 'POST',
        body: `🎉 Chúc mừng bạn! Nàng vừa bấm "DẠ EM ĐỒNG Ý" lúc ${timeStr}! 💕`
      }).catch((err) => console.log('Notification sent', err));
    } catch (e) {
      console.error(e);
    }

    showToast('Hạnh phúc ngập tràn! Chúc mừng tình yêu của hai bạn! 🎉💖');
  };

  // --- 10. CUSTOMIZATION SUBMIT ---
  const handleSaveCustomization = (e) => {
    e.preventDefault();
    const newHer = formHerName.trim() || 'Em';
    const newHis = formHisName.trim() || 'Anh';
    const newDate = formStartDate || getDefaultStartDate();
    const newLetter = formLetterText.trim() || letterText;

    setHerName(newHer);
    setHisName(newHis);
    setStartDate(newDate);
    setLetterText(newLetter);

    const dataToSave = {
      herName: newHer,
      hisName: newHis,
      startDate: newDate,
      letterText: newLetter,
      photoUrl,
      userSavedDate: true
    };
    localStorage.setItem('love_confession_data', JSON.stringify(dataToSave));

    setShowCustomModal(false);
    showToast('Đã lưu thông tin tỏ tình thành công! 💖');
    if (envelopeHidden) {
      startTypewriter();
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const url = evt.target.result;
        setPhotoUrl(url);
        const saved = JSON.parse(localStorage.getItem('love_confession_data') || '{}');
        saved.photoUrl = url;
        localStorage.setItem('love_confession_data', JSON.stringify(saved));
        showToast('Đã tải ảnh kỷ niệm của hai bạn! 📷✨');
      };
      reader.readAsDataURL(file);
    }
  };

  const copyCustomShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('her', herName);
    url.searchParams.set('him', hisName);
    url.searchParams.set('date', startDate);
    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        showToast('Đã sao chép đường link tỏ tình có tên nàng! Gửi ngay cho nàng nhé 💌');
      })
      .catch(() => {
        prompt('Hãy copy đường link tỏ tình này:', url.toString());
      });
  };

  const shareSweetMessage = () => {
    const sweetMsg = `Em đồng ý làm người yêu của ${hisName} rồi nè! Yêu thương ${hisName} nhiều lắm! 💖🥰`;
    try {
      navigator.clipboard.writeText(sweetMsg);
    } catch (e) {}
    showToast('Đã sao chép tin nhắn ngọt ngào! Hãy gửi ngay cho anh nhé 💌');
  };

  const todayFormatted = typeof window !== 'undefined'
    ? `Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`
    : 'Hôm nay & Mãi Mãi';

  return (
    <>
      {/* Background Ambient Canvas */}
      <canvas id="ambient-canvas" ref={canvasRef} aria-hidden="true" />

      {/* Floating Audio Navigation Bar */}
      <header className="top-nav" aria-label="Điều khiển trang">
        <div className="music-controller" onClick={toggleBGM}>
          <button
            className={`icon-btn ${musicPlaying ? 'pulse-glow' : ''}`}
            aria-label="Bật/Tắt nhạc nền"
            title="Bật/Tắt nhạc lãng mạn"
          >
            <span className="music-icon">{musicPlaying ? '💖' : '🎵'}</span>
          </button>
          <span className="music-label">
            {musicPlaying ? 'Đang phát nhạc' : 'Bật giai điệu'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-wrapper">
        {/* SCENE 1: THE ROMANTIC 3D ENVELOPE */}
        {!envelopeHidden && (
          <section className={`scene-envelope ${envelopeOpened ? 'opened' : 'active'}`}>
            <div className="envelope-floating-wrapper">
              <div className="envelope-glow" />
              <div
                className={`envelope-box ${envelopeOpened ? 'opened' : ''}`}
                onClick={handleOpenEnvelope}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleOpenEnvelope();
                }}
              >
                <div className="envelope-flap" />
                <div className="envelope-pocket" />
                <div className="letter-preview">
                  <div className="mini-hearts">💖 💕 🌸</div>
                  <p className="preview-text">Gửi người anh thương nhất...</p>
                </div>
                <div
                  className="wax-seal"
                  style={
                    envelopeOpened
                      ? { transform: 'translate(-50%, -50%) scale(1.3) rotate(20deg)', opacity: 0 }
                      : {}
                  }
                >
                  <span className="seal-heart">❤</span>
                  <span className="seal-glow" />
                </div>
              </div>
              <div className="envelope-instruction">
                <span className="tap-hand">👆</span>
                <p className="instruction-text">Chạm vào phong thư để mở ra điều bất ngờ...</p>
              </div>
            </div>
          </section>
        )}

        {/* SCENE 2: THE CONFESSION JOURNEY & LETTERS */}
        {envelopeHidden && (
          <section className="scene-letter active">
            {/* Hero Header */}
            <div className="hero-banner">
              <span className="sparkle-tag">✨ Dành riêng cho em ✨</span>
              <h1 className="hero-title">
                Gửi <span className="highlight-name">{herName}</span>, cô gái của anh
              </h1>
              <p className="hero-subtitle">Một chút chân thành từ tận đáy trái tim anh...</p>
            </div>

            {/* Love Counter Card */}
            <div className="love-counter-card glass-card">
              <div className="counter-header">
                <span className="counter-icon">⏳</span>
                <h2 className="counter-title">Từng khoảnh khắc anh nghĩ về em</h2>
              </div>
              <div className="timer-grid">
                <div className="timer-box">
                  <span className="timer-num">{timer.days}</span>
                  <span className="timer-label">Ngày</span>
                </div>
                <div className="timer-box">
                  <span className="timer-num">{timer.hours}</span>
                  <span className="timer-label">Giờ</span>
                </div>
                <div className="timer-box">
                  <span className="timer-num">{timer.minutes}</span>
                  <span className="timer-label">Phút</span>
                </div>
                <div className="timer-box">
                  <span className="timer-num">{timer.seconds}</span>
                  <span className="timer-label">Giây</span>
                </div>
              </div>
              <p className="counter-desc">Kể từ ngày 20/09 – khoảnh khắc định mệnh đưa em bước vào cuộc đời anh 💕</p>
            </div>

            {/* Handwritten / Typed Letter Section */}
            <article className="letter-paper-card">
              <div className="letter-corner top-left" />
              <div className="letter-corner top-right" />
              <div className="letter-corner bottom-left" />
              <div className="letter-corner bottom-right" />
              <div className="rose-watermark">🌹</div>

              <div className="letter-header">
                <p className="letter-date">Một ngày đẹp trời...</p>
                <h2 className="letter-salutation">{herName} yêu à,</h2>
              </div>

              <div className="letter-body">
                <p className="letter-text">{typedLetter}</p>
                {showCursor && <span className="typewriter-cursor">|</span>}
              </div>

              <div className="letter-signature">
                <p className="sig-closing">Người thương em thật lòng,</p>
                <p className="sig-name">{hisName} của em 💕</p>
              </div>
            </article>

            {/* Polaroid Photo Frame */}
            <div className="polaroid-wrapper">
              <div className="polaroid-pin">📍</div>
              <div className="polaroid-frame">
                <div className="polaroid-image-container">
                  <img src={photoUrl} alt="Khoảnh khắc hạnh phúc" className="polaroid-img" />
                  <div className="photo-overlay" />
                </div>
                <p className="polaroid-caption">
                  "Thế giới có hơn 8 tỉ người, nhưng ánh mắt anh chỉ hướng về một mình em..."
                </p>
              </div>
            </div>

            {/* Reasons Why I Love You Grid */}
            <section className="reasons-section">
              <div className="section-title-wrap">
                <span className="heart-badge">💖</span>
                <h2 className="section-heading">Những điều nhỏ bé khiến anh say đắm</h2>
                <p className="section-sub">Có những điều chẳng cần nói thành lời, nhưng tim anh luôn nhớ rõ</p>
              </div>

              <div className="reasons-grid">
                <div className="reason-card glass-card">
                  <div className="reason-icon-wrap">
                    <span className="reason-icon">🌸</span>
                  </div>
                  <h3 className="reason-title">Nụ Cười Của Em</h3>
                  <p className="reason-desc">
                    Mỗi khi em cười, cả thế giới xung quanh anh như bừng sáng. Nụ cười ấy xua tan mọi mệt mỏi trong những ngày dài nhất.
                  </p>
                </div>

                <div className="reason-card glass-card">
                  <div className="reason-icon-wrap">
                    <span className="reason-icon">✨</span>
                  </div>
                  <h3 className="reason-title">Sự Dịu Dàng & Ấm Áp</h3>
                  <p className="reason-desc">
                    Cách em lắng nghe, ánh mắt em nhìn anh và những cử chỉ ân cần nhỏ bé luôn làm tim anh đập rộn ràng không ngừng.
                  </p>
                </div>

                <div className="reason-card glass-card">
                  <div className="reason-icon-wrap">
                    <span className="reason-icon">💌</span>
                  </div>
                  <h3 className="reason-title">Từng Kỷ Niệm Bên Nhau</h3>
                  <p className="reason-desc">
                    Từ những dòng tin nhắn ngọt ngào mỗi tối, những câu chuyện vu vơ cho tới từng lần gặp gỡ, anh đều trân trọng vô cùng.
                  </p>
                </div>

                <div className="reason-card glass-card">
                  <div className="reason-icon-wrap">
                    <span className="reason-icon">🌙</span>
                  </div>
                  <h3 className="reason-title">Tương Lai Có Em</h3>
                  <p className="reason-desc">
                    Anh không dám hứa những điều xa xôi, nhưng anh hứa trong mọi giấc mơ và dự định của anh sau này, người anh muốn nắm tay luôn là em.
                  </p>
                </div>
              </div>
            </section>

            {/* SCENE 3: THE CONFESSION ZONE */}
            <section className="confession-zone">
              <div className="confession-card glass-card glow-card">
                <div className="pulsing-heart-wrap">
                  <div className="huge-heart">
                    <svg viewBox="0 0 32 29.6" className="heart-svg" aria-hidden="true">
                      <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2 c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z" />
                    </svg>
                  </div>
                  <span className="heart-aura" />
                </div>

                <h2 className="question-intro">Anh đã giữ trọn tình cảm này rất lâu...</h2>
                <h3 className="main-question">
                  {herName} đồng ý làm người yêu {hisName} nhé? 💕
                </h3>
                <p className="question-subtext">Cùng anh viết tiếp câu chuyện tình yêu ngọt ngào của chúng mình nha!</p>

                <div className="choice-container">
                  <button
                    type="button"
                    className="btn btn-yes pulse-button"
                    style={{ transform: `scale(${yesScale})` }}
                    onClick={handleAcceptance}
                  >
                    <span className="btn-text">Dạ Em Đồng Ý! 💖</span>
                    <span className="btn-shine" />
                  </button>

                  <button
                    type="button"
                    className={`btn ${runawayCount >= 6 ? 'btn-yes pulse-button' : 'btn-no'}`}
                    style={{
                      transform: noButtonOffset
                        ? `translate(${noButtonOffset.x}px, ${noButtonOffset.y}px)`
                        : 'translate(0, 0)',
                      transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
                      position: 'relative',
                      zIndex: 10
                    }}
                    onMouseEnter={runawayCount < 6 ? handleDodgeNo : undefined}
                    onTouchStart={handleDodgeNo}
                    onClick={handleDodgeNo}
                  >
                    <span className="btn-text">{noBtnText}</span>
                  </button>
                </div>

                <p className="playful-hint">{playfulHint}</p>
              </div>
            </section>
          </section>
        )}
      </main>

      {/* SCENE 4: SUCCESS CERTIFICATE POPUP OVERLAY */}
      {showSuccessModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSuccessModal(false);
          }}
        >
          <div className="dialog-content glass-card">
            <button
              className="dialog-close"
              onClick={() => setShowSuccessModal(false)}
              aria-label="Đóng"
            >
              &times;
            </button>

            <div className="celebration-badge">
              <span className="badge-icon">💍</span>
              <span className="badge-text">CHÍNH THỨC HẸN HÒ</span>
            </div>

            <div className="couple-celebration-photo">
              <img src={photoUrl} alt="Chúng ta" className="cert-img" />
              <div className="ring-animation" />
            </div>

            <h2 className="success-title">Yeee! Cảm Ơn Em Vì Đã Đồng Ý! 🎉🥰</h2>

            <div className="love-certificate">
              <div className="cert-border">
                <h3 className="cert-title">CHỨNG NHẬN TÌNH YÊU 💕</h3>
                <p className="cert-text">
                  Kể từ giây phút này,{' '}
                  <strong className="cert-highlight">{herName}</strong> và{' '}
                  <strong className="cert-highlight">{hisName}</strong> đã chính thức là của nhau!
                </p>
                <div className="cert-date-wrap">
                  <span className="cert-label">Ngày bắt đầu: </span>
                  <span className="cert-date">{todayFormatted}</span>
                </div>
                <p className="cert-promise">
                  "Anh xin hứa sẽ luôn lắng nghe, chở che, và trao cho em sự ngọt ngào nhất mà anh có thể." 🌹
                </p>
              </div>
            </div>

            <div className="success-actions">
              <button className="btn btn-action" onClick={shareSweetMessage}>
                <span>💌 Gửi tin nhắn cho anh</span>
              </button>
              <button
                className="btn btn-sub-action"
                onClick={() => {
                  triggerConfetti();
                  playFanfare();
                }}
              >
                <span>🎆 Bắn thêm pháo hoa tim</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMIZE SETTINGS DIALOG */}
      {showCustomModal && (
        <dialog open className="custom-dialog" style={{ display: 'block' }}>
          <div className="dialog-content glass-card">
            <button
              className="dialog-close"
              onClick={() => setShowCustomModal(false)}
              aria-label="Đóng"
            >
              &times;
            </button>
            <h2 className="custom-title">⚙️ Tùy Chỉnh Lời Tỏ Tình</h2>
            <p className="custom-subtitle">Điền thông tin của 2 bạn để trang web mang đậm dấu ấn riêng!</p>

            <form onSubmit={handleSaveCustomization} className="custom-form">
              <div className="form-group">
                <label>Tên / Biệt danh của Bạn Gái:</label>
                <input
                  type="text"
                  value={formHerName}
                  onChange={(e) => setFormHerName(e.target.value)}
                  placeholder="Ví dụ: Bé Mèo, Linh, Em yêu..."
                  required
                  maxLength={30}
                />
              </div>

              <div className="form-group">
                <label>Tên / Biệt danh của Bạn Trai:</label>
                <input
                  type="text"
                  value={formHisName}
                  onChange={(e) => setFormHisName(e.target.value)}
                  placeholder="Ví dụ: Anh, Minh, Chàng Ngốc..."
                  required
                  maxLength={30}
                />
              </div>

              <div className="form-group">
                <label>Ngày bắt đầu quen / Ngày đặc biệt:</label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Nội dung bức thư tình (tuỳ chọn):</label>
                <textarea
                  rows={4}
                  value={formLetterText}
                  onChange={(e) => setFormLetterText(e.target.value)}
                  placeholder="Viết những lời từ trái tim của bạn gửi đến cô ấy..."
                />
              </div>

              <div className="form-group">
                <label>Thay đổi ảnh kỷ niệm (chọn file ảnh):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="file-input"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-yes">
                  Lưu và Áp Dụng Ngay 💖
                </button>
                <button
                  type="button"
                  className="btn btn-sub-action"
                  onClick={copyCustomShareLink}
                >
                  🔗 Sao chép link gửi cho nàng
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Toast Notice */}
      <div className={`toast-notice ${toastVisible ? 'show' : ''}`} role="status">
        {toastMessage}
      </div>
    </>
  );
}
