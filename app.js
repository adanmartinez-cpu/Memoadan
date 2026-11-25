// ===== CONFIGURACIÓN =====
const EMOJIS_POOL = [
  '🍎','🍌','🍇','🍓','🍊','🍒','🥝','🍑','🍍','🥥','🍉','🍋',
  '🐶','🐱','🦊','🐻','🐼','🐨','🦁','🐸','🐵','🐷','🐔','🦄',
  '😀','😂','😎','😍','🤔','😴','🤯','🥳','😇','🤠','🤖','👻'
];

let temaActualEmoji = 0;
let primeraCarta = null;
let segundaCarta = null;
let bloqueado = false;
let movimientos = 0;
let paresEncontrados = 0;
let totalParesJuego = 4;
let tiempoLimite = 60;
let usandoImagenes = false; 
let linksImagenes = []; 

let modoMultijugador = false;
let turnoActual = 0;
let puntosJ1 = 0;
let puntosJ2 = 0;
let nombresJugadores = ["Jugador 1", "Jugador 2"];

let tiempoInicio = 0;
let intervaloReloj = null;
let tiempoTranscurrido = 0;
let juegoTerminado = false;

// ===== ELEMENTOS =====
const splashScreen = document.getElementById('splash-screen');
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaJuego = document.getElementById('pantalla-juego');
const tablero = document.getElementById('tablero');
const movEl = document.getElementById('movimientos');
const paresEl = document.getElementById('pares');
const totalParesEl = document.getElementById('totalPares');
const mensaje = document.getElementById('mensaje');
const movFinal = document.getElementById('movFinal');
const cronometroEl = document.getElementById('cronometro');
const tiempoFinalEl = document.getElementById('tiempoFinal');
const mensajeRecord = document.getElementById('mensajeRecord');
const recordMenu = document.getElementById('recordMenu');
const colorPicker = document.getElementById('colorPicker');

const btnFacil = document.getElementById('btnFacil');
const btnMedio = document.getElementById('btnMedio');
const btnDificil = document.getElementById('btnDificil');
const tituloMensaje = document.getElementById('tituloMensaje');

const btn1Jugador = document.getElementById('btn1Jugador');
const btn2Jugadores = document.getElementById('btn2Jugadores');
const nombresJugadoresDiv = document.getElementById('nombresJugadores');
const nombreJ1Input = document.getElementById('nombreJ1');
const nombreJ2Input = document.getElementById('nombreJ2');
const marcadorMultijugador = document.getElementById('marcadorMultijugador');
const tarjetaJ1 = document.getElementById('tarjetaJ1');
const tarjetaJ2 = document.getElementById('tarjetaJ2');
const nombreMostradoJ1 = document.getElementById('nombreMostradoJ1');
const nombreMostradoJ2 = document.getElementById('nombreMostradoJ2');
const puntosJ1El = document.getElementById('puntosJ1');
const puntosJ2El = document.getElementById('puntosJ2');
const indicadorTurno = document.getElementById('indicadorTurno');
const resultadosMultijugador = document.getElementById('resultadosMultijugador');
const resultadosUnJugador = document.getElementById('resultadosUnJugador');
const resultadoJ1 = document.getElementById('resultadoJ1');
const resultadoJ2 = document.getElementById('resultadoJ2');
const ganadorFinal = document.getElementById('ganadorFinal');
const btnCompartir = document.getElementById('btnCompartir');

// ===== MODO OSCURO / CLARO =====
const btnTema = document.getElementById('btnTema');
const body = document.body;

if (localStorage.getItem('memorama_tema') === 'claro') {
  body.classList.add('modo-claro');
  btnTema.textContent = '☀️';
}

btnTema.addEventListener('click', () => {
  body.classList.toggle('modo-claro');
  if (body.classList.contains('modo-claro')) {
    btnTema.textContent = '☀️';
    localStorage.setItem('memorama_tema', 'claro');
  } else {
    btnTema.textContent = '🌙';
    localStorage.setItem('memorama_tema', 'oscuro');
  }
});

// ===== SPLASH =====
window.addEventListener('load', () => {
  setTimeout(() => {
    splashScreen.classList.add('oculto');
    pantallaInicio.classList.add('activa'); 
    actualizarRecordMenu();
  }, 2500); 
});

// ===== SELECCIÓN DE MODO =====
btn1Jugador.addEventListener('click', () => {
  modoMultijugador = false;
  btn1Jugador.classList.add('activo');
  btn2Jugadores.classList.remove('activo');
  nombresJugadoresDiv.classList.add('oculto');
});
btn2Jugadores.addEventListener('click', () => {
  modoMultijugador = true;
  btn2Jugadores.classList.add('activo');
  btn1Jugador.classList.remove('activo');
  nombresJugadoresDiv.classList.remove('oculto');
});

// ===== CONFIGURACIÓN =====
const btnAbrirConfig = document.getElementById('btnAbrirConfig');
const btnCerrarConfig = document.getElementById('btnCerrarConfig');
const panelConfiguracion = document.getElementById('panelConfiguracion');
const btnPersonalizar = document.getElementById('btnPersonalizar');
const btnImagenes = document.getElementById('btnImagenes');
const panelPersonalizar = document.getElementById('panelPersonalizar');
const panelImagenes = document.getElementById('panelImagenes');

btnAbrirConfig.addEventListener('click', () => panelConfiguracion.classList.remove('oculto-panel'));
btnCerrarConfig.addEventListener('click', () => {
  panelConfiguracion.classList.add('oculto-panel');
  panelPersonalizar.classList.remove('activo');
  panelImagenes.classList.remove('activo');
});

// ===== RÉCORDS =====
function obtenerRecord(parejas) {
  const record = localStorage.getItem(`memorama_record_${parejas}`);
  return record ? parseInt(record) : null;
}
function guardarRecord(parejas, movimientos) {
  localStorage.setItem(`memorama_record_${parejas}`, movimientos);
}
function actualizarRecordMenu() {
  const record = obtenerRecord(totalParesJuego);
  recordMenu.textContent = record ? `${record} mov` : '--';
}

// ===== CRONÓMETRO =====
function iniciarCronometro() {
  detenerCronometro();
  tiempoInicio = Date.now();
  intervaloReloj = setInterval(() => {
    const ahora = Date.now();
    tiempoTranscurrido = Math.floor((ahora - tiempoInicio) / 1000);
    const restante = tiempoLimite - tiempoTranscurrido;
    if (restante <= 0) {
      cronometroEl.textContent = '00:00';
      detenerCronometro();
      if (!juegoTerminado) perderJuego();
      return;
    }
    cronometroEl.textContent = formatearTiempo(restante);
  }, 1000);
}
function detenerCronometro() {
  if (intervaloReloj) { clearInterval(intervaloReloj); intervaloReloj = null; }
}
function formatearTiempo(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

// ===== DIFICULTAD =====
function seleccionarDificultad(boton) {
  [btnFacil, btnMedio, btnDificil].forEach(b => b.classList.remove('activo'));
  boton.classList.add('activo');
  totalParesJuego = parseInt(boton.dataset.parejas);
  tiempoLimite = parseInt(boton.dataset.tiempo);
  actualizarRecordMenu();
}
btnFacil.addEventListener('click', () => seleccionarDificultad(btnFacil));
btnMedio.addEventListener('click', () => seleccionarDificultad(btnMedio));
btnDificil.addEventListener('click', () => seleccionarDificultad(btnDificil));

// ===== DISEÑO =====
function aplicarColorFondo(hexColor) {
  document.documentElement.style.setProperty('--fondo-degradado', `linear-gradient(135deg, ${hexColor} 0%, ${body.classList.contains('modo-claro') ? '#fff' : '#222'} 100%)`);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', hexColor);
}
function actualizarDorso() {
  const tipo = document.getElementById('tipoDorso').value;
  const root = document.documentElement;
  const colorCarta = document.getElementById('colorCarta').value;
  const urlImagen = document.getElementById('urlImagen').value.trim();
  const tipoTextura = document.getElementById('tipoTextura').value;

  if (tipo === 'color') {
    root.style.setProperty('--dorso-personalizado', 'none');
    root.style.setProperty('--color-carta-frente', `linear-gradient(135deg, ${colorCarta}, ${colorCarta}dd)`);
  } else if (tipo === 'imagen') {
    if (urlImagen) root.style.setProperty('--dorso-personalizado', `url('${urlImagen}')`);
    else root.style.setProperty('--dorso-personalizado', 'none');
  } else if (tipo === 'textura') {
    let cssTextura = '';
    if (tipoTextura === 'madera') cssTextura = `repeating-linear-gradient(45deg, #8B5A2B, #8B5A2B 10px, #A0522D 10px, #A0522D 20px)`;
    else if (tipoTextura === 'rayas') cssTextura = `repeating-linear-gradient(45deg, #333, #333 10px, #555 10px, #555 20px)`;
    else if (tipoTextura === 'cuadros') cssTextura = `repeating-conic-gradient(#333 0% 25%, #555 0% 50%) 50% / 20px 20px`;
    root.style.setProperty('--dorso-personalizado', 'none');
    root.style.setProperty('--color-carta-frente', cssTextura);
  }
}

// ===== BARAJAR =====
function barajar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function actualizarTurnoUI() {
  if (!modoMultijugador) return;
  tarjetaJ1.classList.remove('activo-turno');
  tarjetaJ2.classList.remove('activo-turno');
  if (turnoActual === 0) {
    tarjetaJ1.classList.add('activo-turno');
    indicadorTurno.textContent = `Turno de: ${nombresJugadores[0]}`;
  } else {
    tarjetaJ2.classList.add('activo-turno');
    indicadorTurno.textContent = `Turno de: ${nombresJugadores[1]}`;
  }
}

// ===== INICIAR JUEGO =====
function iniciarJuego() {
  juegoTerminado = false;
  movimientos = 0;
  paresEncontrados = 0;
  primeraCarta = null;
  segundaCarta = null;
  bloqueado = false;
  mensaje.classList.add('oculto');
  mensajeRecord.textContent = '';
  tablero.innerHTML = '';
  
  turnoActual = 0;
  puntosJ1 = 0;
  puntosJ2 = 0;
  
  if (modoMultijugador) {
    nombresJugadores[0] = nombreJ1Input.value.trim() || "Jugador 1";
    nombresJugadores[1] = nombreJ2Input.value.trim() || "Jugador 2";
    nombreMostradoJ1.textContent = nombresJugadores[0];
    nombreMostradoJ2.textContent = nombresJugadores[1];
    puntosJ1El.textContent = '0';
    puntosJ2El.textContent = '0';
    marcadorMultijugador.classList.remove('oculto');
    indicadorTurno.classList.remove('oculto');
    actualizarTurnoUI();
  } else {
    marcadorMultijugador.classList.add('oculto');
    indicadorTurno.classList.add('oculto');
  }

  movEl.textContent = '0';
  paresEl.textContent = '0';
  totalParesEl.textContent = totalParesJuego;
  
  tiempoTranscurrido = 0;
  cronometroEl.textContent = formatearTiempo(tiempoLimite);
  iniciarCronometro();

  const totalCartas = totalParesJuego * 2;
  if (totalCartas <= 16) tablero.style.gridTemplateColumns = 'repeat(4, 1fr)';
  else if (totalCartas <= 20) tablero.style.gridTemplateColumns = 'repeat(5, 1fr)';
  else tablero.style.gridTemplateColumns = 'repeat(6, 1fr)';

  let contenidoDelTema = [];
  if (usandoImagenes) {
    const linksValidos = linksImagenes.filter(link => link !== '');
    for (let i = 0; i < totalParesJuego; i++) {
      if (linksValidos[i]) contenidoDelTema.push({ tipo: 'img', valor: linksValidos[i] });
      else contenidoDelTema.push({ tipo: 'emoji', valor: EMOJIS_POOL[i % EMOJIS_POOL.length] });
    }
  } else {
    const inicio = temaActualEmoji * 12;
    for (let i = 0; i < totalParesJuego; i++) {
      contenidoDelTema.push({ tipo: 'emoji', valor: EMOJIS_POOL[inicio + i] });
    }
  }

  const pares = barajar([...contenidoDelTema, ...contenidoDelTema]);

  pares.forEach((item, index) => {
    const carta = document.createElement('div');
    carta.classList.add('carta');
    carta.dataset.id = item.valor; 
    let caraReversoHTML = '';
    if (item.tipo === 'img') {
      caraReversoHTML = `<img src="${item.valor}" alt="carta" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'img-error\\'>🚫</span>';">`;
    } else {
      caraReversoHTML = item.valor;
    }
    const numeroCarta = index + 1;
    carta.innerHTML = `
      <div class="numero-carta">${numeroCarta}</div>
      <div class="carta-interior">
        <div class="carta-cara carta-frente"></div> 
        <div class="carta-cara carta-reverso">${caraReversoHTML}</div>
      </div>
    `;
    carta.addEventListener('click', () => voltearCarta(carta));
    tablero.appendChild(carta);
  });
}

function voltearCarta(carta) {
  if (bloqueado || juegoTerminado || carta.classList.contains('volteada') || carta.classList.contains('emparejada')) return;
  carta.classList.add('volteada');
  if (!primeraCarta) { primeraCarta = carta; return; }
  segundaCarta = carta;
  movimientos++;
  movEl.textContent = movimientos;
  bloqueado = true;

  if (primeraCarta.dataset.id === segundaCarta.dataset.id) {
    setTimeout(() => {
      primeraCarta.classList.add('emparejada');
      segundaCarta.classList.add('emparejada');
      paresEncontrados++;
      paresEl.textContent = paresEncontrados;
      resetearTurno();
      
      if (modoMultijugador) {
        if (turnoActual === 0) { puntosJ1++; puntosJ1El.textContent = puntosJ1; }
        else { puntosJ2++; puntosJ2El.textContent = puntosJ2; }
      }
      if (paresEncontrados === totalParesJuego) setTimeout(ganarJuego, 500);
    }, 600);
  } else {
    setTimeout(() => {
      primeraCarta.classList.remove('volteada');
      segundaCarta.classList.remove('volteada');
      resetearTurno();
      if (modoMultijugador) {
        turnoActual = turnoActual === 0 ? 1 : 0;
        actualizarTurnoUI();
      }
    }, 1000);
  }
}
function resetearTurno() { primeraCarta = null; segundaCarta = null; bloqueado = false; }

function ganarJuego() { 
  juegoTerminado = true;
  detenerCronometro();
  movFinal.textContent = movimientos; 
  tiempoFinalEl.textContent = formatearTiempo(tiempoTranscurrido);

  if (modoMultijugador) {
    tituloMensaje.textContent = '🏁 ¡Fin del juego!';
    resultadosUnJugador.style.display = 'none';
    resultadosMultijugador.classList.remove('oculto');
    resultadoJ1.textContent = `${nombresJugadores[0]}: ${puntosJ1} pares`;
    resultadoJ2.textContent = `${nombresJugadores[1]}: ${puntosJ2} pares`;
    if (puntosJ1 > puntosJ2) ganadorFinal.textContent = `🏆 ¡Ganó ${nombresJugadores[0]}!`;
    else if (puntosJ2 > puntosJ1) ganadorFinal.textContent = `🏆 ¡Ganó ${nombresJugadores[1]}!`;
    else ganadorFinal.textContent = '🤝 ¡Empate!';
    mensajeRecord.style.display = 'none';
  } else {
    tituloMensaje.textContent = '🎉 ¡Ganaste!';
    resultadosUnJugador.style.display = 'block';
    resultadosMultijugador.classList.add('oculto');
    const recordActual = obtenerRecord(totalParesJuego);
    if (recordActual === null || movimientos < recordActual) {
      guardarRecord(totalParesJuego, movimientos);
      mensajeRecord.textContent = '🏆 ¡NUEVO RÉCORD! 🏆';
      actualizarRecordMenu();
    } else if (movimientos === recordActual) {
      mensajeRecord.textContent = '¡Igualaste tu récord!';
    } else {
      mensajeRecord.textContent = `Tu récord: ${recordActual} mov`;
    }
    mensajeRecord.style.display = 'block';
  }
  mensaje.classList.remove('oculto'); 
}

function perderJuego() {
  juegoTerminado = true;
  detenerCronometro();
  tituloMensaje.textContent = '⏰ ¡Se acabó el tiempo!';
  resultadosUnJugador.style.display = 'none';
  resultadosMultijugador.classList.add('oculto');
  mensajeRecord.textContent = '¡Intenta de nuevo!';
  mensajeRecord.style.display = 'block';
  mensaje.classList.remove('oculto');
}

// ===== COMPARTIR RESULTADO =====
btnCompartir.addEventListener('click', async () => {
  let texto = '';
  const urlApp = window.location.href; // Enlace a tu app

  if (modoMultijugador) {
    const ganador = puntosJ1 > puntosJ2 ? nombresJugadores[0] : (puntosJ2 > puntosJ1 ? nombresJugadores[1] : 'Empate');
    if (ganador === 'Empate') {
      texto = `🤝 ¡Empatamos en el Memorama del Equipo Estrella!\n${nombresJugadores[0]}: ${puntosJ1} pares - ${nombresJugadores[1]}: ${puntosJ2} pares\n\n¡Juega tú también aquí! 👉 ${urlApp}`;
    } else {
      texto = `🏆 ¡${ganador} ganó el Memorama del Equipo Estrella!\n${nombresJugadores[0]}: ${puntosJ1} pares - ${nombresJugadores[1]}: ${puntosJ2} pares\n\n¡Juega tú también aquí! 👉 ${urlApp}`;
    }
  } else {
    const minutos = Math.floor(tiempoTranscurrido / 60);
    const segundos = tiempoTranscurrido % 60;
    const tiempoTexto = minutos > 0 ? `${minutos} min ${segundos} seg` : `${segundos} segundos`;
    
    texto = `🧠 ¡Gané el Memorama del Equipo Estrella!\n\n⏱️ Tiempo: ${tiempoTexto}\n👣 Movimientos: ${movimientos}\n🃏 Nivel: ${totalParesJuego} parejas\n\n¿Puedes superarme? Juega aquí 👉 ${urlApp}`;
  }

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Memorama Equipo Estrella',
        text: texto,
      });
    } else {
      // Si el navegador no soporta compartir (ej. en PC), copiamos al portapapeles
      await navigator.clipboard.writeText(texto);
      alert('¡Texto copiado! Pégalo en WhatsApp o donde quieras.');
    }
  } catch (err) {
    console.log('Compartir cancelado o error:', err);
  }
});

// ===== EVENTOS DE PANTALLAS =====
document.getElementById('btnJugar').addEventListener('click', () => {
  pantallaInicio.classList.remove('activa');
  pantallaJuego.classList.add('activa');
  iniciarJuego(); 
});
document.getElementById('btnVolverMenu').addEventListener('click', () => {
  juegoTerminado = true;
  detenerCronometro();
  pantallaJuego.classList.remove('activa');
  pantallaInicio.classList.add('activa');
  actualizarRecordMenu();
});
document.getElementById('reiniciar').addEventListener('click', iniciarJuego);
document.getElementById('jugarOtra').addEventListener('click', iniciarJuego);

// ===== PERSONALIZACIÓN =====
document.getElementById('cambiarTema').addEventListener('click', () => {
  usandoImagenes = false; 
  temaActualEmoji = (temaActualEmoji + 1) % 3;
  const nombres = ['Frutas', 'Animales', 'Caritas'];
  document.getElementById('cambiarTema').textContent = `🎨 Emojis: ${nombres[temaActualEmoji]}`;
});
document.getElementById('btnNumeros').addEventListener('click', () => {
  document.body.classList.toggle('mostrar-numeros');
  const btn = document.getElementById('btnNumeros');
  btn.textContent = document.body.classList.contains('mostrar-numeros') ? '🔢 Números: ON' : '🔢 Mostrar Números';
});
colorPicker.addEventListener('input', (e) => aplicarColorFondo(e.target.value));
btnPersonalizar.addEventListener('click', () => {
  panelPersonalizar.classList.toggle('activo');
  panelImagenes.classList.remove('activo'); 
});
document.getElementById('tipoDorso').addEventListener('change', () => {
  const val = document.getElementById('tipoDorso').value;
  const grupoColor = document.getElementById('grupoColor');
  const grupoImagen = document.getElementById('grupoImagen');
  const grupoTextura = document.getElementById('grupoTextura');
  grupoColor.classList.remove('activo');
  grupoImagen.classList.remove('activo');
  grupoTextura.classList.remove('activo');
  if (val === 'color') grupoColor.classList.add('activo');
  if (val === 'imagen') grupoImagen.classList.add('activo');
  if (val === 'textura') grupoTextura.classList.add('activo');
  actualizarDorso();
});
document.getElementById('colorCarta').addEventListener('input', actualizarDorso);
document.getElementById('urlImagen').addEventListener('input', actualizarDorso);
document.getElementById('tipoTextura').addEventListener('change', actualizarDorso);
btnImagenes.addEventListener('click', () => {
  panelImagenes.classList.toggle('activo');
  panelPersonalizar.classList.remove('activo'); 
});
document.getElementById('aplicarImagenes').addEventListener('click', () => {
  linksImagenes = Array.from(document.querySelectorAll('.input-img')).map(input => input.value.trim());
  const hayLinks = linksImagenes.some(link => link !== '');
  if (hayLinks) {
    usandoImagenes = true;
    alert('Imágenes guardadas. ¡Dale a Jugar!');
    panelImagenes.classList.remove('activo'); 
  } else {
    alert('Por favor, pega al menos un link de imagen.');
  }
});

// ===== INICIAR =====
aplicarColorFondo('#667eea');