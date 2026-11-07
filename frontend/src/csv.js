function celda(valor) {
  const seguro = /^\s*[=+\-@]|^[\t\r\n]/u.test(valor) ? "'" + valor : valor;
  return '"' + seguro.replaceAll('"', '""') + '"';
}

export function generarCSV(estudiantes) {
  const filas = estudiantes.map(({ codigo, nombre, carrera }) => [codigo, nombre, carrera].map(celda).join(';'));
  return '\uFEFF' + ['Código;Estudiante;Carrera', ...filas].join('\r\n');
}

export function exportarCSV(estudiantes) {
  const archivo = new Blob([generarCSV(estudiantes)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'estudiantes-grupo-7.csv';
  enlace.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
