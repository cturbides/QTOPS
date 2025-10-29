/**
 * Espera un tiempo determinado
 * @param ms - Milisegundos a esperar
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica si un valor es nulo o indefinido
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Verifica si una cadena está vacía o solo contiene espacios
 */
export function isEmptyString(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Trunca una cadena a una longitud máxima
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Formatea un timestamp a string legible
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Crea un debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
