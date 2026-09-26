// ============================================================
// Invitación de 18 — configuración rápida
// ============================================================
const CONFIG = {
  nombre: 'Alan Julián',
  eventDate: '2026-11-14T22:00:00',        // fecha y hora del evento (para la cuenta regresiva)
  fechaTexto: 'Sábado 14 de Noviembre',    // fecha que aparece en el mensaje de WhatsApp
  horaTexto: '22:00 hs',                   // hora que se muestra en "La fiesta"

  precioTarjeta: 40000,                    // valor de la tarjeta por persona, en pesos
  porcentajeSena: 0.5,                     // la seña es la mitad de la tarjeta
  fechaSena: '20 de octubre',              // fecha límite para abonar la seña (confirma la asistencia)
  diasAntesResto: 7,                       // el resto se abona hasta una semana antes del evento

  alias: 'mariaburgos.bru.1252',           // alias para la transferencia de la tarjeta

  maxPersonas: 10,                         // máximo que se puede confirmar de una vez

  // WhatsApp donde llegan las confirmaciones (código de país + área + número, sin + ni espacios).
  // Con un solo contacto el botón dice "Confirmar por WhatsApp"; con varios, "Confirmar a <nombre>".
  contactos: [
    { nombre: 'María', telefono: '5493865678028' },
  ],
};

document.addEventListener('DOMContentLoaded', () => {

  const formatARS = (n) => n.toLocaleString('es-AR');
  const pluralize = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

  // Versión para amigos (index.html?amigos): sin precios ni pagos
  const modoAmigos = document.documentElement.classList.contains('modo-amigos');

  // ---------- Fechas y montos ----------
  const eventDate = new Date(CONFIG.eventDate);

  const fechaRestoDate = new Date(eventDate);
  fechaRestoDate.setDate(fechaRestoDate.getDate() - CONFIG.diasAntesResto);
  const fechaRestoTexto = fechaRestoDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });

  const montos = (personas) => {
    const total = CONFIG.precioTarjeta * personas;
    const sena = Math.round(total * CONFIG.porcentajeSena);
    return { total, sena, resto: total - sena };
  };

  const fill = (selector, text) => document.querySelectorAll(selector).forEach((el) => { el.textContent = text; });

  fill('[data-precio]', `$${formatARS(CONFIG.precioTarjeta)}`);
  fill('[data-sena]', `$${formatARS(montos(1).sena)}`);
  fill('[data-resto]', `$${formatARS(montos(1).resto)}`);
  fill('[data-fecha-sena]', CONFIG.fechaSena);
  fill('[data-fecha-resto]', fechaRestoTexto);
  fill('[data-hora]', CONFIG.horaTexto);
  fill('[data-alias]', CONFIG.alias);

  // ---------- Destellos ----------
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor"/></svg>';
  document.querySelectorAll('[data-sparkles]').forEach((wrap) => {
    const n = parseInt(wrap.dataset.sparkles, 10) || 8;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.innerHTML = STAR;
      s.style.left = `${Math.random() * 96}%`;
      s.style.top = `${Math.random() * 96}%`;
      s.style.setProperty('--s', `${8 + Math.random() * 16}px`);
      s.style.setProperty('--d', `${2.8 + Math.random() * 3}s`);
      s.style.animationDelay = `-${Math.random() * 5}s`;
      wrap.appendChild(s);
    }
  });

  // ---------- Calendario (portada) ----------
  const calMesEl = document.getElementById('calMes');
  const calGridEl = document.getElementById('calGrid');
  if (calMesEl && calGridEl) {
    const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const year = eventDate.getFullYear();
    const month = eventDate.getMonth();
    const eventDay = eventDate.getDate();

    calMesEl.textContent = MESES[month];

    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = lunes
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstWeekday; i++) {
      const blank = document.createElement('span');
      blank.className = 'cal-day cal-blank';
      calGridEl.appendChild(blank);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('span');
      cell.className = 'cal-day';
      if (d === eventDay) {
        cell.classList.add('cal-day-evento');
        cell.innerHTML = `${d}<svg class="cal-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.4 2.6c4.9-.5 9.3 3.4 9.6 8.3.3 4.9-3.5 9.5-8.4 9.9-5 .4-9.5-3.4-9.8-8.4C3.5 7.5 7.4 3 12.4 2.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
      } else {
        cell.textContent = d;
      }
      calGridEl.appendChild(cell);
    }
  }

  // ---------- Cuenta regresiva ----------
  const cd = {
    d: document.getElementById('cd-dias'),
    h: document.getElementById('cd-horas'),
    m: document.getElementById('cd-min'),
    s: document.getElementById('cd-seg'),
  };
  const pad2 = (n) => String(n).padStart(2, '0');

  const updateCountdown = () => {
    const diff = eventDate - new Date();
    let d = 0, h = 0, m = 0, s = 0;
    if (diff > 0) {
      d = Math.floor(diff / 86400000);
      h = Math.floor((diff / 3600000) % 24);
      m = Math.floor((diff / 60000) % 60);
      s = Math.floor((diff / 1000) % 60);
    }
    cd.d.textContent = d;
    cd.h.textContent = pad2(h);
    cd.m.textContent = pad2(m);
    cd.s.textContent = pad2(s);
  };
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ---------- Confirmación: cantidad de personas + montos ----------
  const guestNameInput = document.getElementById('guestNameInput');
  const countEl = document.getElementById('ticketsCount');
  const errorEl = document.getElementById('rsvp-error');
  const resSena = document.getElementById('res-sena');
  const resResto = document.getElementById('res-resto');
  const resTotal = document.getElementById('res-total');

  let personas = 1;

  const updateRsvpUI = () => {
    countEl.textContent = personas;
    const { total, sena, resto } = montos(personas);
    resSena.textContent = `$${formatARS(sena)}`;
    resResto.textContent = `$${formatARS(resto)}`;
    resTotal.textContent = `$${formatARS(total)}`;
  };

  document.querySelectorAll('.counter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      personas = btn.dataset.action === 'inc'
        ? Math.min(CONFIG.maxPersonas, personas + 1)
        : Math.max(1, personas - 1);
      updateRsvpUI();
    });
  });

  const showError = (msg) => { errorEl.textContent = msg; errorEl.classList.add('visible'); };
  const hideError = () => errorEl.classList.remove('visible');
  guestNameInput.addEventListener('input', hideError);
  updateRsvpUI();

  // ---------- Confirmación por WhatsApp ----------
  const confirmar = (contacto) => {
    const name = guestNameInput.value.trim();
    if (!name) {
      showError('Por favor ingresá tu nombre antes de confirmar.');
      guestNameInput.focus();
      return;
    }
    if (!contacto.telefono) {
      console.warn('Falta cargar el número de WhatsApp en CONFIG.contactos (script.js).');
      showError('Este contacto todavía no está disponible. Probá más tarde.');
      return;
    }
    hideError();

    const singular = personas === 1;
    const lead = singular ? 'Soy' : 'Somos';
    const verbo = singular ? 'confirmo' : 'confirmamos';
    const posesivo = singular ? 'mi' : 'nuestra';

    let mensaje =
      `¡Hola! ${lead} ${name} y ${verbo} ${posesivo} asistencia por ${pluralize(personas, 'persona', 'personas')} ` +
      `al cumple de 18 de ${CONFIG.nombre} el ${CONFIG.fechaTexto}. `;

    if (modoAmigos) {
      mensaje += '¡Nos vemos ahí!';
    } else {
      const { total } = montos(personas);
      mensaje += `Total: $${formatARS(total)}.`;
    }

    window.open(`https://wa.me/${contacto.telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const buttonsWrap = document.getElementById('rsvpButtons');
  const ICON_CLIPBOARD = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M8.5 12.5l2 2 4-4"/></svg>';
  CONFIG.contactos.forEach((contacto) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rsvp-confirm-btn';
    const linea1 = CONFIG.contactos.length === 1 ? 'Confirmá tu' : 'Confirmá a';
    const linea2 = CONFIG.contactos.length === 1 ? 'asistencia aquí' : contacto.nombre;
    b.innerHTML = `<span class="rsvp-confirm-icon">${ICON_CLIPBOARD}</span><span class="rsvp-confirm-text"><span>${linea1}</span><span>${linea2}</span></span>`;
    b.addEventListener('click', () => confirmar(contacto));
    buttonsWrap.appendChild(b);
  });

  // ---------- Copiar alias ----------
  const copyBtn = document.getElementById('copyAliasBtn');
  const copyLabel = copyBtn ? copyBtn.querySelector('.copy-label') : null;
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const texto = CONFIG.alias;
      const onCopied = () => {
        copyBtn.classList.add('copied');
        if (copyLabel) copyLabel.textContent = '¡Copiado!';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          if (copyLabel) copyLabel.textContent = 'Copiar';
        }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(onCopied).catch(() => {
          showError('No se pudo copiar el alias. Copialo manualmente.');
        });
      } else {
        // Fallback para navegadores/sitios sin acceso al portapapeles
        const temp = document.createElement('textarea');
        temp.value = texto;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand('copy'); onCopied(); } catch (e) { /* noop */ }
        document.body.removeChild(temp);
      }
    });
  }

  // ---------- Música ----------
  const audio = document.getElementById('bg-audio');
  const musicBtn = document.getElementById('music-toggle-btn');
  const musicIcon = document.getElementById('music-icon-wrapper');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');

  // Reproductor de la portada (nuevo, estilo diario)
  const playerBtn = document.getElementById('playerPlay');
  const playerPrev = document.getElementById('playerPrev');
  const playerNext = document.getElementById('playerNext');
  const playerProgress = document.getElementById('playerProgress');
  const playerFill = document.getElementById('playerProgressFill');
  const playerDot = document.getElementById('playerProgressDot');

  const setPlaying = (playing) => {
    iconPlay.style.display = playing ? 'none' : 'block';
    iconPause.style.display = playing ? 'block' : 'none';
    musicIcon.classList.toggle('spinning', playing);
    musicBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    if (playerBtn) {
      playerBtn.classList.toggle('is-playing', playing);
      playerBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    }
  };

  // Si no existe assets/musica.mp3, se oculta el botón flotante y el reproductor de la portada
  const hideIfNoMusic = () => {
    if (audio.error || audio.networkState === 3) {
      musicBtn.classList.add('hidden');
      const playerCard = document.getElementById('playerCard');
      if (playerCard) playerCard.classList.add('hidden');
    }
  };
  audio.addEventListener('error', hideIfNoMusic);
  hideIfNoMusic();
  window.addEventListener('load', () => setTimeout(hideIfNoMusic, 300));
  musicBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play().then(() => setPlaying(true)).catch(() => {}); }
    else { audio.pause(); setPlaying(false); }
  });

  if (playerBtn) {
    playerBtn.addEventListener('click', () => {
      if (audio.paused) { audio.play().then(() => setPlaying(true)).catch(() => {}); }
      else { audio.pause(); setPlaying(false); }
    });
  }
  if (playerPrev) {
    playerPrev.addEventListener('click', () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
  }
  if (playerNext) {
    playerNext.addEventListener('click', () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });
  }
  if (playerFill && playerDot) {
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const pct = Math.min(100, (audio.currentTime / audio.duration) * 100);
      playerFill.style.width = `${pct}%`;
      playerDot.style.left = `${pct}%`;
    });
  }
  if (playerProgress) {
    playerProgress.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = playerProgress.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      audio.currentTime = pct * audio.duration;
    });
  }

  // ---------- Galería: flechas y autoplay ----------
  const filmTrack = document.getElementById('filmstripTrack');
  const filmPrev = document.getElementById('filmPrev');
  const filmNext = document.getElementById('filmNext');
  if (filmTrack) {
    const getStep = () => {
      const frame = filmTrack.querySelector('.filmstrip-frame');
      if (!frame) return 180;
      const gap = parseFloat(getComputedStyle(filmTrack).columnGap || getComputedStyle(filmTrack).gap) || 16;
      return frame.getBoundingClientRect().width + gap;
    };

    let autoplayTimer = null;
    const stopAutoplay = () => { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } };
    const startAutoplay = () => {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        const maxScroll = filmTrack.scrollWidth - filmTrack.clientWidth;
        if (filmTrack.scrollLeft >= maxScroll - 4) {
          filmTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          filmTrack.scrollBy({ left: getStep(), behavior: 'smooth' });
        }
      }, 3000);
    };
    const restartAutoplayLater = () => {
      stopAutoplay();
      setTimeout(startAutoplay, 4500);
    };

    if (filmPrev) filmPrev.addEventListener('click', () => {
      filmTrack.scrollBy({ left: -getStep(), behavior: 'smooth' });
      restartAutoplayLater();
    });
    if (filmNext) filmNext.addEventListener('click', () => {
      filmTrack.scrollBy({ left: getStep(), behavior: 'smooth' });
      restartAutoplayLater();
    });
    filmTrack.addEventListener('pointerdown', restartAutoplayLater);
    filmTrack.addEventListener('touchstart', restartAutoplayLater, { passive: true });

    startAutoplay();
  }

  // ---------- Apertura ----------
  const intro = document.getElementById('intro');
  const openBtn = document.getElementById('openBtn');
  const envelopeEl = openBtn.querySelector('.envelope');
  openBtn.addEventListener('click', () => {
    if (openBtn.classList.contains('abierto')) return;
    openBtn.classList.add('abierto');
    envelopeEl.classList.add('abierto');
    audio.play().then(() => setPlaying(true)).catch(() => {});
    setTimeout(() => intro.classList.add('opening'), 1150);
    setTimeout(() => {
      document.body.classList.add('entered');
      intro.classList.add('hidden');
    }, 1800);
  });
});