/**
 * Utilidades de fecha para los casos "Born Today" de IMDb (Casos 4 y 5),
 * que piden personas nacidas en fechas relativas al día de ejecución del
 * test ("ayer", "hace 40 años") — nunca hardcodeadas, para que el test siga
 * siendo válido sin importar cuándo se corra.
 */

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Fecha de hoy +/- offsetDays, en formato "MM-DD" (el que espera el filtro
 * "Birthday" de IMDb, que no incluye año).
 */
export function getMonthDay(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Fecha exacta de hace N años (mismo día y mes que hoy), en formato
 * "YYYY-MM-DD" (el que espera el filtro "Birth date", que sí incluye año —
 * necesario para calcular una edad exacta, a diferencia de "Birthday").
 */
export function getExactDateYearsAgo(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
