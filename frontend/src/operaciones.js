import { useCallback, useEffect, useReducer, useState } from 'react';
import { datos } from './datos.js';

const inicial = { estado: 'cargando', operacion: 'listar', mensaje: 'Cargando estudiantes…' };

function reducirSolicitud(solicitud, accion) {
  switch (accion.tipo) {
    case 'inicio':
      return { estado: 'cargando', operacion: accion.operacion, mensaje: accion.mensaje };
    case 'exito':
      return { ...solicitud, estado: 'exito', mensaje: accion.mensaje };
    case 'error':
      return { ...solicitud, estado: 'error', mensaje: accion.mensaje };
    default:
      return solicitud;
  }
}

export function usarEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [solicitud, despachar] = useReducer(reducirSolicitud, inicial);

  const ejecutar = useCallback(async (operacion, durante, tarea, actualizar, despues) => {
    despachar({ tipo: 'inicio', operacion, mensaje: durante });
    try {
      const respuesta = await tarea();
      setEstudiantes((actuales) => actualizar(actuales, respuesta));
      despachar({ tipo: 'exito', mensaje: despues });
      return true;
    } catch (error) {
      despachar({ tipo: 'error', mensaje: error.message });
      return false;
    }
  }, []);

  const cargar = useCallback(() => ejecutar(
    'listar', 'Cargando estudiantes…', datos.listar,
    (_, registros) => registros, 'Registro actualizado.',
  ), [ejecutar]);

  useEffect(() => { void cargar(); }, [cargar]);

  function agregar(estudiante) {
    return ejecutar(
      'agregar', 'Registrando estudiante…', () => datos.agregar(estudiante),
      (actuales, nuevo) => [...actuales, nuevo].sort((a, b) => a.codigo.localeCompare(b.codigo)),
      'Estudiante registrado correctamente.',
    );
  }

  function eliminar(estudiante) {
    return ejecutar(
      'eliminar', 'Eliminando estudiante…', () => datos.eliminar(estudiante.codigo),
      (actuales) => actuales.filter(({ codigo }) => codigo !== estudiante.codigo),
      'Estudiante eliminado correctamente.',
    );
  }

  function editar(estudiante) {
    return ejecutar(
      'editar', 'Guardando cambios…', () => datos.editar(estudiante),
      (actuales, editado) => actuales.map((registro) => registro.codigo === editado.codigo ? editado : registro),
      'Cambios guardados correctamente.',
    );
  }

  return { estudiantes, solicitud, cargar, agregar, editar, eliminar };
}
