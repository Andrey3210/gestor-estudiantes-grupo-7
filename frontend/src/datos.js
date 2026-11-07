export const carreras = [
  'Ingeniería de Software',
  'Ingeniería de Sistemas',
  'Ciencia de la Computación',
];

const ejemplos = [
  { codigo: 'E-001', nombre: 'Valeria Campos', carrera: carreras[0] },
  { codigo: 'E-002', nombre: 'Mateo Ríos', carrera: carreras[1] },
  { codigo: 'E-003', nombre: 'Camila Torres', carrera: carreras[2] },
  { codigo: 'E-004', nombre: 'Diego Salas', carrera: carreras[0] },
  { codigo: 'E-005', nombre: 'Lucía Herrera', carrera: carreras[1] },
];

const clave = 'grupo7-estudiantes-v1';
const urlConfigurada = import.meta.env.VITE_API_URL;
const servidor = urlConfigurada || (import.meta.env.DEV ? 'http://localhost:8080' : '');
export const modoDemostracion = !servidor;
const recurso = servidor.replace(/\/+$/, '') + '/api/estudiantes';

async function peticion(metodo, codigo = '', estudiante) {
  let respuesta;
  try {
    respuesta = await fetch(codigo ? recurso + '/' + encodeURIComponent(codigo) : recurso, {
      method: metodo,
      headers: estudiante ? { 'Content-Type': 'application/json' } : undefined,
      body: estudiante ? JSON.stringify(estudiante) : undefined,
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new Error('No se pudo conectar con la API. Comprueba que el servidor esté activo y vuelve a intentar.');
  }
  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => ({}));
    throw new Error(detalle.mensaje || 'La solicitud falló (HTTP ' + respuesta.status + ').');
  }
  return respuesta.status === 204 ? undefined : respuesta.json();
}

function leerEjemplos() {
  const registros = localStorage.getItem(clave);
  return registros ? JSON.parse(registros) : ejemplos;
}

export const datos = modoDemostracion ? {
  async listar() {
    return leerEjemplos();
  },
  async agregar(estudiante) {
    const registros = leerEjemplos();
    if (registros.some(({ codigo }) => codigo === estudiante.codigo)) {
      throw new Error('Ya existe un estudiante con ese código.');
    }
    localStorage.setItem(clave, JSON.stringify([...registros, estudiante]));
    return estudiante;
  },
  async eliminar(codigo) {
    localStorage.setItem(clave, JSON.stringify(leerEjemplos().filter((registro) => registro.codigo !== codigo)));
  },
  async editar(estudiante) {
    const registros = leerEjemplos();
    if (!registros.some(({ codigo }) => codigo === estudiante.codigo)) {
      throw new Error('El estudiante ya no existe.');
    }
    localStorage.setItem(clave, JSON.stringify(registros.map((registro) =>
      registro.codigo === estudiante.codigo ? estudiante : registro)));
    return estudiante;
  },
} : {
  listar: () => peticion('GET'),
  agregar: (estudiante) => peticion('POST', '', estudiante),
  eliminar: (codigo) => peticion('DELETE', codigo),
  editar: (estudiante) => peticion('PUT', estudiante.codigo, estudiante),
};
