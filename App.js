import React, { useState } from 'react';
import ramos from './ramos.js';

// Función para convertir número a romano (solo 1 o 2, para semestre)
const numeroRomano = (num) => {
  if (num === 1) return 'I';
  if (num === 2) return 'II';
  return '';
};

const App = () => {
  // Agrupar ramos por año: año 1 = sem 1 y 2, año 2 = sem 3 y 4, etc.
  const años = [];
  for(let i = 1; i <= 14; i += 2){
    años.push({
      año: Math.ceil(i/2),
      semestres: [
        ramos.filter(r => r.semestre === i),
        ramos.filter(r => r.semestre === i + 1)
      ]
    });
  }

  // Estado para notas (por ahora vacío, editable más adelante)
  // Para este paso, dejamos notas fijas o vacías
  // Se podría usar useState para manejar notas dinámicas después.

  const avance = 0; // Por ahora fijo, lo actualizaremos luego

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20 }}>
      {/* Título principal */}
      <h1 style={{ textAlign: 'center', marginBottom: 5 }}>
        Malla Interactiva - Medicina - UCSC
      </h1>

      {/* Texto avance */}
      <p style={{ textAlign: 'center', fontSize: 14, marginTop: 0 }}>
        Avance total: {avance}%
      </p>

      {/* Barra de progreso */}
      <div style={{
        backgroundColor: '#ddd',
        borderRadius: 10,
        height: 20,
        width: '60%',
        margin: '0 auto 30px auto',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${avance}%`,
          backgroundColor: '#f48fb1', // rosado claro
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Contenedor con scroll horizontal */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        paddingBottom: 20,
        gap: 30,
        borderTop: '1px solid #f48fb1',
        borderBottom: '1px solid #f48fb1'
      }}>
        {años.map(({ año, semestres }) => (
          <div key={año} style={{ minWidth: 280, flexShrink: 0 }}>
            {/* Bloque grande año */}
            <div style={{
              backgroundColor: '#f8bbd0',
              borderRadius: 10,
              padding: 10,
              textAlign: 'center',
              fontWeight: 'bold',
              marginBottom: 10
            }}>
              Año {año}
            </div>

            {/* Bloques semestres (números romanos) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
              {[1, 2].map(num => (
                <div key={num} style={{
                  backgroundColor: '#f8bbd0',
                  borderRadius: 10,
                  width: '45%',
                  textAlign: 'center',
                  padding: 5,
                  fontWeight: 'bold'
                }}>
                  {numeroRomano(num)}
                </div>
              ))}
            </div>

            {/* Ramos por semestre */}
            <div>
              {semestres.map((ramosSemestre, idxSemestre) => (
                <div key={idxSemestre} style={{ marginBottom: 15 }}>
                  {ramosSemestre.map(ramo => (
                    <div key={ramo.nombre} style={{
                      backgroundColor: '#e1bee7',
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}>
                      <span style={{ fontWeight: '600' }}>{ramo.nombre}</span>
                      <span style={{ fontSize: 12 }}>Créditos: {ramo.creditos}</span>
                      <span style={{ fontSize: 12, fontStyle: 'italic' }}>{ramo.tipo}</span>
                      {/* Casilla de nota: solo mostrar input (vacío) por ahora */}
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Nota"
                        style={{
                          width: '60px',
                          padding: '2px 5px',
                          fontSize: 12,
                          borderRadius: 4,
                          border: '1px solid #ccc'
                        }}
                        disabled // por ahora deshabilitado, luego se activa según reglas
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
