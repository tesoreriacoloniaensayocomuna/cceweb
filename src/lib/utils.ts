/**
 * Sanitiza una URL de Google Maps para que sea embebible en un iframe.
 * Soporta URLs de "Compartir" de Google Maps, URLs de búsqueda y coordenadas.
 */
export function sanitizeMapUrl(url: string | undefined | null, fallbackQuery?: string): string {
  if (!url) {
    if (fallbackQuery) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
    }
    return "";
  }

  const cleanUrl = url.trim();

  // Caso 1: El usuario pegó el código de iframe completo
  if (cleanUrl.includes('<iframe')) {
    const match = cleanUrl.match(/src="([^"]+)"/);
    if (match && match[1]) return match[1];
  }

  // Caso 2: Ya es un link de embebido o tiene el parámetro correcto
  if (cleanUrl.includes("/maps/embed") || cleanUrl.includes("output=embed")) {
    return cleanUrl;
  }

  // Caso 3: Es una URL de Google Maps estándar (google.com/maps...)
  if (cleanUrl.includes("google.com/maps") || cleanUrl.includes("maps.google.com")) {
      let query = "";
      
      // Intentamos extraer por prioridad:
      // A. Lugar específico
      if (cleanUrl.includes("/place/")) {
          query = cleanUrl.split("/place/")[1].split("/")[0];
      } 
      // B. Búsqueda específica
      else if (cleanUrl.includes("/search/")) {
          query = cleanUrl.split("/search/")[1].split("/")[0];
      }
      // C. Coordenadas en el formato @lat,lng
      if (!query && cleanUrl.includes("@")) {
          const coordsMatch = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (coordsMatch) {
              query = `${coordsMatch[1]},${coordsMatch[2]}`;
          }
      }

      if (query) {
          return `https://maps.google.com/maps?q=${query}&output=embed`;
      }
      
      // Si es un link de Google pero no pudimos extraer el query, usamos el fallback
      if (fallbackQuery) {
          return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
      }
  }

  // Caso 4: Links cortos (maps.app.goo.gl) -> Usamos el fallback porque no se pueden resolver en el cliente
  if (cleanUrl.includes("maps.app.goo.gl") || cleanUrl.includes("goo.gl/maps")) {
      if (fallbackQuery) {
          return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
      }
  }

  // Caso 5: Es solo texto (ej: "Colonia Ensayo")
  if (!cleanUrl.includes("http") && cleanUrl.length > 3) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(cleanUrl)}&output=embed`;
  }

  return cleanUrl;
}
