import { ramos } from "./ramos.js";

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

// Verifica si todos los requisitos de un ramo están aprobados
function requisitosAprobados(requisitos) {
  if (!requisitos || requisitos.length === 0) return true;
  return requisitos.every(req => {
    const nota = estadoNotas[req];
    return nota !== undefined && nota >= 50;
  });
}

// Verifica si semestre es final para ramos anuales (semestre par)
function esSemestreFinalAnual(semestre, ramo) {
  if (ramo.tipo !== "Anual") return false;
  return semestre % 2 === 0;
}

// Calcula promedio ponderado solo considerando ramos aprobados
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

// Calcula avance en porcentaje (créditos aprobados / total créditos)
function calcularAvance() {
  const totalCreditos = ramos.reduce((acc, r) => acc + r.creditos, 0);
  const creditosAprobados = ramos.reduce((acc, ramo) => {
    const nota = estadoNotas[ramo.nombre];
    if (nota !== undefined && nota >= 50) return acc + ramo.creditos;
    return acc;
  }, 0);
  return totalCreditos === 0 ? 0 : ((creditosAprobados / totalCreditos) * 100).toFixed(1);
}

// Crear bloque visual para cada ramo
function crearRamoElemento(ramo, semestre) {
  const div = document.createElement("div");
  div.classList.add("ramo-card");

  // Nombre
  const nombre = document.createElement("h3");
  nombre.textContent = ramo.nombre;
  div.appendChild(nombre);

  // Créditos y tipo
  const info = document.createElement("p");
  info.textContent = `${ramo.creditos} créditos - ${ramo.tipo}`;
  div.appendChild(info);

  // Ver si se desbloquea (requisitos aprobados)
  const desbloqueado = requisitosAprobados(ramo.requisitos);

  // Decidir si mostrar input nota (si es semestral siempre, o si es anual y semestre final)
  const mostrarInput = (ramo.tipo === "Semestral") || (ramo.tipo === "Anual" && esSemestreFinalAnual(semestre, ramo));
  const habilitarInput = desbloqueado && mostrarInput;

  if (mostrarInput) {
    const inputNota = document.createElement("input");
    inputNota.type = "number";
    inputNota.min = 0;
    inputNota.max = 100;
    inputNota.step = 1;
    inputNota.placeholder = "Nota";
    inputNota.classList.add("input-nota");

    if (estadoNotas[ramo.nombre] !== undefined) {
      inputNota.value = estadoNotas[ramo.nombre];
    }

    inputNota.disabled = !habilitarInput;

    inputNota.addEventListener("input", e => {
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 0) val = 0;
      if (val > 100) val = 100;
      estadoNotas[ramo.nombre] = val;

      actualizarPromedioYAvance();
      actualizarDesbloqueo();
    });

    div.appendChild(inputNota);
  } else {
    const texto = document.createElement("p");
    texto.textContent = desbloqueado ? "-" : "Bloqueado";
    texto.style.fontStyle = "italic";
    div.appendChild(texto);
  }

  if (!desbloqueado) div.classList.add("bloqueado");

  return div;
}

// Actualiza la barra, texto avance y promedio ponderado
function actualizarPromedioYAvance() {
  const avanceText = document.getElementById("avance-text");
  const barraProgreso = document.getElementById("barra-progreso");
  const promedioText = document.getElementById("promedio-ponderado");

  const avance = calcularAvance();
  const promedio = calcularPromedio();

  avanceText.textContent = `Avance total: ${avance} %`;
  barraProgreso.style.width = `${avance}%`;
  promedioText.textContent = `Promedio ponderado: ${promedio}`;
}

// Habilita o deshabilita inputs según requisitos y tipo de ramo
function actualizarDesbloqueo() {
  const inputs = document.querySelectorAll(".input-nota");
  inputs.forEach(input => {
    const nombre = input.parentElement.querySelector("h3").textContent;
    const ramo = ramos.find(r => r.nombre === nombre);
    const semestre = parseInt(input.closest(".bloque-semestre")?.getAttribute("data-semestre")) || 0;

    const desbloqueado = requisitosAprobados(ramo.requisitos);
    const mostrarInput = (ramo.tipo === "Semestral") || (ramo.tipo === "Anual" && esSemestreFinalAnual(semestre, ramo));
    const habilitarInput = desbloqueado && mostrarInput;

    input.disabled = !habilitarInput;

    if (!habilitarInput) {
      delete estadoNotas[nombre];
      input.value = "";
    }
  });

  actualizarPromedioYAvance();
}

// Genera la malla visual con años, semestres y ramos
function generarMalla() {
  const contenedor = document.getElementById("malla-container");
  contenedor.innerHTML = "";

  const totalAnios = 14 / 2;

  for (let anio = 1; anio <= totalAnios; anio++) {
    // Bloque año
    const bloqueAnio = document.createElement("div");
    bloqueAnio.textContent = `Año ${anio}`;
    bloqueAnio.style.fontWeight = "bold";
    bloqueAnio.style.margin = "1rem 0 0.5rem 0";
    contenedor.appendChild(bloqueAnio);

    // Contenedor semestres
    const contenedorSemestres = document.createElement("div");
    contenedorSemestres.style.display = "flex";
    contenedorSemestres.style.gap = "1rem";
    contenedorSemestres.style.marginBottom = "2rem";

    // Semestres del año
    const semestres = [2 * anio - 1, 2 * anio];
    semestres.forEach(sem => {
      const bloqueSemestre = document.createElement("div");
      bloqueSemestre.classList.add("bloque-semestre");
      bloqueSemestre.setAttribute("data-semestre", sem);
      bloqueSemestre.style.border = "1px solid #d81b60";
      bloqueSemestre.style.borderRadius = "8px";
      bloqueSemestre.style.padding = "0.5rem";
      bloqueSemestre.style.backgroundColor = "#fff0f6";
      bloqueSemestre.style.minWidth = "280px";

      // Título semestre romano
      const tituloSem = document.createElement("h3");
      tituloSem.textContent = numeroARomano(sem);
      tituloSem.style.textAlign = "center";
      tituloSem.style.marginTop = "0";
      bloqueSemestre.appendChild(tituloSem);

      // Ramos semestre
      const ramosSemestre = ramos.filter(r => r.semestre === sem);
      ramosSemestre.forEach(ramo => {
        const ramoEl = crearRamoElemento(ramo, sem);
        bloqueSemestre.appendChild(ramoEl);
      });

      contenedorSemestres.appendChild(bloqueSemestre);
    });

    contenedor.appendChild(contenedorSemestres);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Cargar notas precargadas (si hay)
  ramos.forEach(r => {
    if (r.nota !== undefined) estadoNotas[r.nombre] = r.nota;
  });

  // Generar la malla curricular
  generarMalla();

  // Actualizar barra y promedio
  actualizarPromedioYAvance();

  // Actualizar desbloqueos segun notas iniciales
  actualizarDesbloqueo();
});
