// ==========================================
// ESTADO GLOBAL Y VARIABLES
// ==========================================
const coloresRuleta = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

let opcionesRuleta = [];
let anguloActual = 0;
let estaGirando = false;
let idAnimacion = null;

// Referencias del DOM - Ruleta
const lienzo = document.getElementById("lienzoRuleta");
const ctx = lienzo ? lienzo.getContext("2d") : null;
const areaTextoRuleta = document.getElementById("areaTextoRuleta");
const textoRespuesta = document.getElementById("textoRespuesta");
const superposicionGirar = document.getElementById("superposicionGirar");
const botonIniciarRuleta = document.getElementById("botonIniciarRuleta");
const botonReiniciarRuleta = document.getElementById("botonReiniciarRuleta");

// Referencias del DOM - Sorteo
const areaTextoParticipantes = document.getElementById(
  "areaTextoParticipantes",
);
const contadorCantidad = document.getElementById("contadorCantidad");
const desplegableOpcionesDivision = document.getElementById(
  "desplegableOpcionesDivision",
);
const radioCantidadEquipos = document.getElementById("radioCantidadEquipos");
const radioParticipantesPorEquipo = document.getElementById(
  "radioParticipantesPorEquipo",
);
const campoTituloSorteo = document.getElementById("campoTituloSorteo");
const botonGenerarEquipos = document.getElementById("botonGenerarEquipos");
const botonLimpiarSorteo = document.getElementById("botonLimpiarSorteo");
const pantallaConfiguracionSorteo = document.getElementById(
  "pantallaConfiguracionSorteo",
);
const pantallaResultadosSorteo = document.getElementById(
  "pantallaResultadosSorteo",
);
const contenedorTarjetasEquipos = document.getElementById(
  "contenedorTarjetasEquipos",
);
const tituloResultadosMuestreado = document.getElementById(
  "tituloResultadosMuestreado",
);
const botonVolverSorteo = document.getElementById("botonVolverSorteo");

// ==========================================
// INTEGRANTE 2: LÓGICA DE LA RULETA
// ==========================================

function cargarOpcionesRuleta() {
  const guardado = localStorage.getItem("opcionesRuleta");
  if (guardado) {
    areaTextoRuleta.value = guardado;
  } else {
    areaTextoRuleta.value = "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12";
  }
  actualizarOpcionesDesdeTextarea();
}

function actualizarOpcionesDesdeTextarea() {
  if (!areaTextoRuleta) return;
  const contenido = areaTextoRuleta.value;
  localStorage.setItem("opcionesRuleta", contenido);

  const lineas = contenido
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  opcionesRuleta = lineas;
  dibujarRuleta();
}

function dibujarRuleta() {
  if (!ctx) return;
  const total = opcionesRuleta.length;
  const centroX = lienzo.width / 2;
  const centroY = lienzo.height / 2;
  const radio = centroX - 10;

  ctx.clearRect(0, 0, lienzo.width, lienzo.height);

  if (total === 0) {
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio, 0, 2 * Math.PI);
    ctx.fillStyle = "#ccc";
    ctx.fill();
    ctx.stroke();
    return;
  }

  const anguloPorPorcion = (2 * Math.PI) / total;

  for (let i = 0; i < total; i++) {
    const anguloInicio = anguloActual + i * anguloPorPorcion;
    const anguloFin = anguloInicio + anguloPorPorcion;

    ctx.beginPath();
    ctx.moveTo(centroX, centroY);
    ctx.arc(centroX, centroY, radio, anguloInicio, anguloFin);
    ctx.closePath();

    ctx.fillStyle = coloresRuleta[i % coloresRuleta.length];
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Texto
    ctx.save();
    ctx.translate(centroX, centroY);
    ctx.rotate(anguloInicio + anguloPorPorcion / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(opcionesRuleta[i], radio - 20, 5);
    ctx.restore();
  }
}

function girarRuleta() {
  if (estaGirando || opcionesRuleta.length === 0) return;

  estaGirando = true;
  if (superposicionGirar) superposicionGirar.style.display = "none";
  if (textoRespuesta) textoRespuesta.textContent = "GIRANDO...";

  const velocidadInicial = Math.random() * 0.3 + 0.4;
  let velocidadActual = velocidadInicial;
  const desaceleracion = 0.003;

  function animar() {
    anguloActual += velocidadActual;
    velocidadActual -= desaceleracion;

    dibujarRuleta();

    if (velocidadActual > 0) {
      idAnimacion = requestAnimationFrame(animar);
    } else {
      estaGirando = false;
      determinarGanador();
    }
  }

  animar();
}

function determinarGanador() {
  const total = opcionesRuleta.length;
  if (total === 0) return;

  const anguloPorPorcion = (2 * Math.PI) / total;
  let anguloNormalizado =
    (2 * Math.PI - (anguloActual % (2 * Math.PI))) % (2 * Math.PI);

  const indiceGanador =
    Math.floor(anguloNormalizado / anguloPorPorcion) % total;
  const ganador = opcionesRuleta[indiceGanador];

  if (textoRespuesta) textoRespuesta.textContent = ganador;
}

function ocultarElementoSeleccionado() {
  const ganadorActual = textoRespuesta ? textoRespuesta.textContent : "";
  if (
    !ganadorActual ||
    ganadorActual === "---" ||
    ganadorActual === "GIRANDO..."
  )
    return;

  const indice = opcionesRuleta.indexOf(ganadorActual);
  if (indice !== -1) {
    opcionesRuleta.splice(indice, 1);
    if (areaTextoRuleta) {
      areaTextoRuleta.value = opcionesRuleta.join("\n");
      localStorage.setItem("opcionesRuleta", areaTextoRuleta.value);
    }
    textoRespuesta.textContent = "---";
    dibujarRuleta();
  }
}

function reiniciarRuleta() {
  if (areaTextoRuleta) {
    areaTextoRuleta.value = "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12";
    localStorage.setItem("opcionesRuleta", areaTextoRuleta.value);
    actualizarOpcionesDesdeTextarea();
  }
  if (textoRespuesta) textoRespuesta.textContent = "---";
  if (superposicionGirar) superposicionGirar.style.display = "block";
}

// Atajos de teclado (SPACE, S, R, E, F)
document.addEventListener("keydown", (e) => {
  if (["TEXTAREA", "INPUT"].includes(document.activeElement.tagName)) return;

  const tecla = e.key.toUpperCase();

  if (e.code === "Space") {
    e.preventDefault();
    girarRuleta();
  } else if (tecla === "S") {
    ocultarElementoSeleccionado();
  } else if (tecla === "R") {
    reiniciarRuleta();
  } else if (tecla === "E") {
    if (areaTextoRuleta) areaTextoRuleta.focus();
  } else if (tecla === "F") {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
});

// Eventos Ruleta
if (lienzo) lienzo.addEventListener("click", girarRuleta);
if (botonIniciarRuleta)
  botonIniciarRuleta.addEventListener("click", girarRuleta);
if (botonReiniciarRuleta)
  botonReiniciarRuleta.addEventListener("click", reiniciarRuleta);
if (areaTextoRuleta) {
  areaTextoRuleta.addEventListener("input", actualizarOpcionesDesdeTextarea);
}

// ==========================================
// INTEGRANTE 3: LÓGICA DE SORTEO Y PESTAÑAS
// ==========================================

function cambiarPestana(nombrePestana) {
  const seccionRuleta = document.getElementById("seccionRuleta");
  const seccionSorteo = document.getElementById("seccionSorteo");
  const botonPestanaRuleta = document.getElementById("botonPestanaRuleta");
  const botonPestanaSorteo = document.getElementById("botonPestanaSorteo");

  if (nombrePestana === "ruleta") {
    seccionRuleta.classList.add("activa");
    seccionSorteo.classList.remove("activa");
    botonPestanaRuleta.classList.add("activo");
    botonPestanaSorteo.classList.remove("activo");
  } else {
    seccionSorteo.classList.add("activa");
    seccionRuleta.classList.remove("activa");
    botonPestanaSorteo.classList.add("activo");
    botonPestanaRuleta.classList.remove("activo");
  }
}

function cargarParticipantesSorteo() {
  const guardado = localStorage.getItem("participantesSorteo");
  if (guardado) {
    areaTextoParticipantes.value = guardado;
  }
  actualizarContadorYDesplegable();
}

function actualizarContadorYDesplegable() {
  if (!areaTextoParticipantes) return;

  // Limitar cada línea a un máximo de 50 caracteres
  let lineasOriginales = areaTextoParticipantes.value.split("\n");
  let lineasRecortadas = lineasOriginales.map((l) => l.substring(0, 50));

  if (lineasOriginales.some((l, i) => l !== lineasRecortadas[i])) {
    areaTextoParticipantes.value = lineasRecortadas.join("\n");
  }

  // Guardar en localStorage
  localStorage.setItem("participantesSorteo", areaTextoParticipantes.value);

  const lineasValidas = areaTextoParticipantes.value
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Limitar a máximo 100 participantes
  const cantidadTotal = Math.min(lineasValidas.length, 100);
  if (contadorCantidad) contadorCantidad.textContent = cantidadTotal;

  if (!desplegableOpcionesDivision) return;
  desplegableOpcionesDivision.innerHTML = "";
  const maxOpciones = Math.max(1, cantidadTotal);

  for (let i = 1; i <= maxOpciones; i++) {
    const opcion = document.createElement("option");
    opcion.value = i;
    opcion.textContent = radioCantidadEquipos.checked
      ? `${i} equipos`
      : `${i} por equipo`;
    desplegableOpcionesDivision.appendChild(opcion);
  }
}

function generarEquipos() {
  if (!areaTextoParticipantes) return;
  const lineas = areaTextoParticipantes.value
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 100);

  if (lineas.length === 0) {
    alert("Por favor, ingresa al menos un participante.");
    return;
  }

  const lideres = [];
  const miembrosNormales = [];

  lineas.forEach((nombre) => {
    if (nombre.startsWith("*")) {
      lideres.push(nombre.substring(1).trim());
    } else {
      miembrosNormales.push(nombre);
    }
  });

  miembrosNormales.sort(() => Math.random() - 0.5);

  const valorDivision = parseInt(desplegableOpcionesDivision.value) || 1;
  const esPorCantidadEquipos = radioCantidadEquipos.checked;

  let cantidadEquipos = 1;
  if (esPorCantidadEquipos) {
    cantidadEquipos = valorDivision;
  } else {
    cantidadEquipos = Math.ceil(lineas.length / valorDivision);
  }

  const equipos = Array.from({ length: cantidadEquipos }, () => []);

  lideres.forEach((lider, i) => {
    equipos[i % cantidadEquipos].push({ nombre: lider, esLider: true });
  });

  miembrosNormales.forEach((miembro, i) => {
    const indiceEquipo = (i + lideres.length) % cantidadEquipos;
    equipos[indiceEquipo].push({ nombre: miembro, esLider: false });
  });

  renderizarResultadosSorteo(equipos);
}

function renderizarResultadosSorteo(equipos) {
  if (!contenedorTarjetasEquipos) return;
  contenedorTarjetasEquipos.innerHTML = "";

  const titulo =
    campoTituloSorteo && campoTituloSorteo.value.trim() !== ""
      ? campoTituloSorteo.value
      : "Resultados del Sorteo";

  if (tituloResultadosMuestreado)
    tituloResultadosMuestreado.textContent = titulo;

  equipos.forEach((equipo, index) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-equipo";

    let html = `<div class="encabezado-equipo">Grupo ${index + 1}</div><ul class="lista-integrantes">`;
    equipo.forEach((integrante) => {
      html += `<li class="${integrante.esLider ? "es-lider" : ""}">${integrante.nombre} ${integrante.esLider ? "(Líder)" : ""}</li>`;
    });
    html += `</ul>`;

    tarjeta.innerHTML = html;
    contenedorTarjetasEquipos.appendChild(tarjeta);
  });

  pantallaConfiguracionSorteo.classList.add("oculta");
  pantallaResultadosSorteo.classList.remove("oculta");
}

// Eventos Sorteo
if (areaTextoParticipantes)
  areaTextoParticipantes.addEventListener(
    "input",
    actualizarContadorYDesplegable,
  );
if (radioCantidadEquipos)
  radioCantidadEquipos.addEventListener(
    "change",
    actualizarContadorYDesplegable,
  );
if (radioParticipantesPorEquipo)
  radioParticipantesPorEquipo.addEventListener(
    "change",
    actualizarContadorYDesplegable,
  );
if (botonGenerarEquipos)
  botonGenerarEquipos.addEventListener("click", generarEquipos);
if (botonLimpiarSorteo) {
  botonLimpiarSorteo.addEventListener("click", () => {
    areaTextoParticipantes.value = "";
    campoTituloSorteo.value = "";
    localStorage.removeItem("participantesSorteo");
    actualizarContadorYDesplegable();
  });
}
if (botonVolverSorteo) {
  botonVolverSorteo.addEventListener("click", () => {
    pantallaResultadosSorteo.classList.add("oculta");
    pantallaConfiguracionSorteo.classList.remove("oculta");
  });
}

// Inicialización
window.addEventListener("DOMContentLoaded", () => {
  cargarOpcionesRuleta();
  cargarParticipantesSorteo();
});
