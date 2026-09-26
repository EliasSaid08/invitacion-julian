// ============================================================
// Invitación de 18 — configuración rápida
// ============================================================
const CONFIG = {
  nombre: 'Alan Julián',
  eventDate: '2026-11-14T00:00:00',        // fecha del evento (para la cuenta regresiva). Si se define la hora, poner por ej. '2026-11-14T22:00:00'
  fechaTexto: 'Sábado 14 de Noviembre',    // fecha que aparece en el mensaje de WhatsApp

  precioTarjeta: 40000,                    // valor de la tarjeta por persona, en pesos
  porcentajeSena: 0.5,                     // la seña es la mitad de la tarjeta
  fechaSena: '20 de octubre',              // fecha límite para abonar la seña (confirma la asistencia)
  diasAntesResto: 7,                       // el resto se abona hasta una semana antes del evento

  maxPersonas: 10,                         // máximo que se puede confirmar de una vez

  // WhatsApp donde llegan las confirmaciones (código de país + área + número, sin + ni espacios).
  // Con un solo contacto el botón dice "Confirmar por WhatsApp"; con varios, "Confirmar a <nombre>".
  contactos: [
    { nombre: 'Alan', telefono: '' },      // <- COMPLETAR: por ej. '5493865123456'
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
      const { total, sena } = montos(personas);
      mensaje += `Total: $${formatARS(total)}, con una seña de $${formatARS(sena)} hasta el ${CONFIG.fechaSena}.`;
    }

    window.open(`https://wa.me/${contacto.telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const buttonsWrap = document.getElementById('rsvpButtons');
  CONFIG.contactos.forEach((contacto) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-blue rsvp-btn';
    b.textContent = CONFIG.contactos.length === 1 ? 'Confirmar por WhatsApp' : `Confirmar a ${contacto.nombre}`;
    b.addEventListener('click', () => confirmar(contacto));
    buttonsWrap.appendChild(b);
  });

  // ---------- Música ----------
  const audio = document.getElementById('bg-audio');
  const musicBtn = document.getElementById('music-toggle-btn');
  const musicIcon = document.getElementById('music-icon-wrapper');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');

  const setPlaying = (playing) => {
    iconPlay.style.display = playing ? 'none' : 'block';
    iconPause.style.display = playing ? 'block' : 'none';
    musicIcon.classList.toggle('spinning', playing);
    musicBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  };

  // Si no existe assets/musica.mp3, se oculta el botón
  const hideIfNoMusic = () => { if (audio.error || audio.networkState === 3) musicBtn.classList.add('hidden'); };
  audio.addEventListener('error', hideIfNoMusic);
  hideIfNoMusic();
  window.addEventListener('load', () => setTimeout(hideIfNoMusic, 300));
  musicBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play().then(() => setPlaying(true)).catch(() => {}); }
    else { audio.pause(); setPlaying(false); }
  });

  // ---------- Apertura ----------
  const intro = document.getElementById('intro');
  document.getElementById('openBtn').addEventListener('click', () => {
    intro.classList.add('opening');
    document.body.classList.add('entered');        // dispara la aparición de la portada
    audio.play().then(() => setPlaying(true)).catch(() => {});
    setTimeout(() => intro.classList.add('hidden'), 700);
  });
});
