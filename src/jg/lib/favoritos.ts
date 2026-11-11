import { useCallback, useEffect, useState } from 'react';

const CLAVE = 'clickmotores_favoritos';
const EVENTO = 'clickmotores-favoritos';

function leer(): string[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const datos: unknown = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(datos) ? datos.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Favoritos guardados en el navegador del visitante (se leen tras el primer render). */
export function useFavorito(id: string | number) {
  const clave = String(id);
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    const actualizar = () => setEsFavorito(leer().includes(clave));
    actualizar();
    window.addEventListener(EVENTO, actualizar);
    return () => window.removeEventListener(EVENTO, actualizar);
  }, [clave]);

  const alternar = useCallback(() => {
    const actuales = leer();
    const nuevos = actuales.includes(clave) ? actuales.filter((x) => x !== clave) : [...actuales, clave];
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(nuevos));
    } catch {
      /* almacenamiento no disponible */
    }
    window.dispatchEvent(new Event(EVENTO));
  }, [clave]);

  return { esFavorito, alternar };
}
