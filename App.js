// app.js

import { ramos } from "./ramos.js";

// Estado para almacenar notas ingresadas
const estadoNotas = {};

// Función para convertir número arábigo a romano (1-14)
function numeroARomano(num) {
  const mapa = [
    ["XIV", 14], ["XIII", 13], ["XII", 12], ["XI", 11], ["X", 10],
    ["IX", 9], ["VIII", 8], ["VII", 7], ["VI", 6], ["V", 5],
    ["IV", 4], ["III", 3], ["II", 2], ["I", 1],
  ];
  for (let [romano, val] of mapa) if (num === val) return romano;
  return "";
}

// Función para chequear si todos los requisitos de un ramo están aprobados
function requisitosAprobados(requisitos) {
  if (!requisitos || requisitos.length === 0) return true;
  return requisitos.every(req => {
    const nota = estadoNotas[req];
    return nota !== undefined && nota >= 50;
  });
}

// Función para saber si es semestre final de un ramo anual (par)
// Por ejemplo, si es semestre 2, 4, 6... es semestre final de un ramo anual que empieza en semestre anterior
function esSemestreFinalAnual(semestre, ramo) {
  if (ramo.tipo !== "Anual") return false;
  return semestre % 2 === 0;
}

// Función para calcular promedio ponderado solo considerando ramos aprobados (nota >= 50)
function calcularPromedio() {
  let sumaNotas = 0;
  let sumaCreditos = 0;
  for (let ramo of ramos) {
    const nota = estadoNotas[ramo.nombre];
    if (nota !== undefined && nota >= 50) {
      sumaNotas += nota * ramo.creditos;
      sumaCreditos += ramo.creditos;
    }
  }
  return sumaCreditos === 0 ? 0 : (sumaNotas / sumaCreditos).toFixed(2);
}

// Función para calcular avance % (créditos aprobados / créditos totales)
function calcularAvance() {
  const totalCreditos = ramos.reduce((acc, r) => acc + r.creditos, 0);
  const aprobados = ramos.filter(r => {
    const nota = estadoNotas[r.nombre];
    return nota !== undefined && nota >= 50;
  });
  const creditosAprobados = aprobados.reduce((acc, r) => acc + r.creditos, 0);
  return totalCreditos === 0 ? 0 : ((creditosAprobados / totalCreditos) * 100).toFixed(1);
}

// Función para crear un ramo (bloque con info y input de nota)
function crearRamoElemento(ramo, semestre) {
  const div = document.createElement("div");
  div.classList.add("ramo-bloque");

  // Nombre
  const nombre = document.createElement("div");
  nombre.classList.add("ramo-nombre");
  nombre.textContent = ramo.nombre;
  div.appendChild(nombre);

  // Créditos y tipo (Anual o Semestral)
  const info = document.createElement("div");
  info.classList.add("ramo-info");
  info.textContent = `${ramo.creditos} créditos - ${ramo.tipo}`;
  div.appendChild(info);

  // Validar si el ramo está desbloqueado (requisitos aprobados)
  const desbloqueado = requisitosAprobados(ramo.requisitos);

  // Decidir si mostrar input nota
  // Semestrales siempre muestran input
  // Anuales solo en semestre final (semestre par)
  let mostrarInput = false;
  if (ramo.tipo === "Semestral") mostrarInput = true;
  else if (ramo.tipo === "Anual" && esSemestreFinalAnual(semestre, ramo)) mostrarInput = true;

  // Solo habilitar input si desbloqueado y mostrarInput es true
  const habilitarInput = desbloqueado && mostrarInput;

  // Crear input para nota
  if (mostrarInput) {
    const inputNota = document.createElement("input");
    inputNota.type = "number";
    inputNota.min = 0;
    inputNota.max = 100;
    inputNota.step = 1;
    inputNota.classList.add("input-nota");
    inputNota.placeholder = "Nota";

    // Si ya hay nota, mostrarla
    if (estadoNotas[ramo.nombre] !== undefined) {
      inputNota.value = estadoNotas[ramo.nombre];
    }

    inputNota.disabled = !habilitarInput;

    // Cuando cambie la nota
    inputNota.addEventListener("input", (e) => {
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 0) val = 0;
      if (val > 100) val = 100;
      estadoNotas[ramo.nombre] = val;

      actualizarPromedioYAvance();
      actualizarDesbloqueo();
    });

    div.appendChild(inputNota);
  } else {
    // Si no hay input (porque no corresponde), mostramos texto o vacío
    const sinInput = document.createElement("div");
    sinInput.classList.add("sin-input");
    sinInput.textContent = desbloqueado ? "-" : "Bloqueado";
    div.appendChild(sinInput);
  }

  // Si no desbloqueado, agregar clase bloqueado para estilo
  if (!desbloqueado) div.classList.add("bloqueado");

  return div;
}

// Función para actualizar la visualización del promedio y avance
function actualizarPromedioYAvance() {
  const promedioSpan = document.getElementById("promedio-ponderado");
  const avanceSpan = document.getElementById("avance-texto");
  const barraProgreso = document.getElementById("barra-progreso");

  const promedio = calcularPromedio();
  const avance = calcularAvance();

  promedioSpan.textContent = `Promedio ponderado: ${promedio}`;
  avanceSpan.textContent = `Avance total: ${avance} %`;
  barraProgreso.style.width = `${avance}%`;
}

// Función para actualizar inputs habilitados según requisitos (desbloqueo dinámico)
function actualizarDesbloqueo() {
  // Recorremos todos los inputs para habilitar o deshabilitar
  const inputs = document.querySelectorAll(".input-nota");
  inputs.forEach(input => {
    const ramoNombre = input.parentElement.querySelector(".ramo-nombre").textContent;
    const ramo = ramos.find(r => r.nombre === ramoNombre);
    const semestre = parseInt(input.closest(".semestre-bloque").getAttribute("data-semestre"));

    const desbloqueado = requisitosAprobados(ramo.requisitos);
    const mostrarInput = (ramo.tipo === "Semestral") || (ramo.tipo === "Anual" && esSemestreFinalAnual(semestre, ramo));
    const habilitarInput = desbloqueado && mostrarInput;

    input.disabled = !habilitarInput;

    // Si se bloquea input, borrar nota almacenada
    if (!habilitarInput) {
      delete estadoNotas[ramoNombre];
      input.value = "";
    }
  });

  actualizarPromedioYAvance();
}

// Función para generar la estructura visual completa con años, semestres y ramos
function generarMalla() {
  const contenedor = document.getElementById("malla-container");
  contenedor.innerHTML = "";

  // Calculamos años (14 semestres / 2)
  const totalAnios = 14 / 2;

  // Crear contenedor scroll horizontal para años
  const scrollAnios = document.createElement("div");
  scrollAnios.classList.add("scroll-anios");

  for (let anio = 1; anio <= totalAnios; anio++) {
    const bloqueAnio = document.createElement("div");
    bloqueAnio.classList.add("bloque-anio");
    bloqueAnio.textContent = `Año ${anio}`;
    scrollAnios.appendChild(bloqueAnio);

    // Contenedor para los semestres pequeños (I y II)
    const contenedorSemestres = document.createElement("div");
    contenedorSemestres.classList.add("contenedor-semestres");

    // Semestres de este año: 2*anio-1 y 2*anio
    const semestre1 = 2 * anio - 1;
    const semestre2 = 2 * anio;

    // Crear bloques pequeños de semestres (números romanos)
    [semestre1, semestre2].forEach((sem) => {
      const bloqueSemestre = document.createElement("div");
      bloqueSemestre.classList.add("bloque-semestre");
      bloqueSemestre.textContent = numeroARomano(sem);
      bloqueSemestre.setAttribute("data-semestre", sem);

      // Contenedor de ramos de este semestre
      const contenedorRamos = document.createElement("div");
      contenedorRamos.classList.add("contenedor-ramos");
      contenedorRamos.classList.add(`semestre-${sem}`);

      // Filtrar ramos de ese semestre
      const ramosSemestre = ramos.filter(r => r.semestre === sem);

      ramosSemestre.forEach(ramo => {
        const ramoEl = crearRamoElemento(ramo, sem);
        contenedorRamos.appendChild(ramoEl);
      });

      bloqueSemestre.appendChild(contenedorRamos);
      contenedorSemestres.appendChild(bloqueSemestre);
    });

    contenedor.appendChild(scrollAnios);
    contenedor.appendChild(contenedorSemestres);
  }
}

// Inicialización al cargar página
window.addEventListener("DOMContentLoaded", () => {
  // Inicializamos notas con las existentes en ramos.js (si hay)
  ramos.forEach(r => {
    if (r.nota !== undefined) estadoNotas[r.nombre] = r.nota;
  });

  // Mostrar título y barra progreso inicial
  actualizarPromedioYAvance();

  // Generar visualización
  generarMalla();

  // Actualizar desbloqueos por si hay notas precargadas
  actualizarDesbloqueo();
});
