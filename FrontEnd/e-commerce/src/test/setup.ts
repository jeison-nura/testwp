// Configuración global para pruebas
import "@testing-library/jest-dom";

// Mock para objetos globales que puedan faltar en el entorno de pruebas
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
  };

// Silenciar advertencias específicas durante las pruebas
console.error = jest.fn();
console.warn = jest.fn();
