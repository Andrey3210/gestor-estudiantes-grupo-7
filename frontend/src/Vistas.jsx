const requisitos = [
  ['Lista con useState', 'React conserva una copia del directorio y la actualiza después de una respuesta válida.'],
  ['Formulario controlado', 'Los campos tienen su propio estado. El código queda fijo al editar.'],
  ['Datos por props', 'La aplicación comparte los registros y las acciones con el formulario y el directorio.'],
  ['Búsqueda dinámica', 'El directorio combina texto sin tildes, filtro por carrera, ordenamiento y paginación.'],
  ['Operaciones con useReducer', 'El reducer coordina los estados de listar, registrar, editar y eliminar.'],
  ['API REST en Spring Boot', 'La integración usa GET, POST, PUT y DELETE. El README explica cómo probarla.'],
  ['Carga, éxito y error', 'El directorio informa el resultado de cada solicitud y permite reintentar la consulta.'],
];

export const enlaces = {
  informe: import.meta.env.BASE_URL + 'Informe-grupo-7.pdf',
  repositorio: 'https://github.com/Andrey3210/gestor-estudiantes-grupo-7',
};

export function Actividad() {
  return <div className="vista">
    <section className="apertura" aria-labelledby="titulo-actividad">
      <p className="rotulo">ACTIVIDAD PRÁCTICA 7.2</p>
      <h2 id="titulo-actividad">Manejo de estado en React</h2>
      <p>Registra, edita y elimina estudiantes, y comprueba cómo se sincroniza la interfaz con una API REST.</p>
      <div className="accesos">
        <a className="boton primario" href="#directorio">Abrir directorio <span aria-hidden="true">→</span></a>
        <a className="boton secundario" href="#evidencias">Ver informe y capturas</a>
      </div>
    </section>
    <div className="columnas">
      <section className="panel bloque" aria-labelledby="titulo-requisitos">
        <div className="titulo-bloque"><h2 id="titulo-requisitos">Requisitos de la práctica</h2><span>7 implementados</span></div>
        <ol className="requisitos">{requisitos.map(([titulo, detalle], i) => <li key={titulo}>
          <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <div><h3>{titulo}</h3><p>{detalle}</p></div>
        </li>)}</ol>
      </section>
      <aside className="lateral">
        <section className="panel bloque guia" aria-labelledby="titulo-guia">
          <h2 id="titulo-guia">Guía de prueba</h2>
          <ol>
            <li>Busca «rios» para encontrar a Mateo Ríos.</li>
            <li>Agrega un registro ficticio y edita su carrera.</li>
            <li>Revisa el cambio en Estadísticas y elimina el registro de prueba.</li>
          </ol>
          <a href="#resumen">Abrir estadísticas →</a>
        </section>
        <section className="panel bloque guia" aria-labelledby="titulo-entorno">
          <h2 id="titulo-entorno">Entornos de ejecución</h2>
          <p>En GitHub Pages los datos ficticios se guardan en el navegador. En local, React envía las solicitudes a Spring Boot.</p>
          <a href={enlaces.repositorio + '#ejecutar-con-la-api'}>Instrucciones para usar la API →</a>
        </section>
      </aside>
    </div>
  </div>;
}

const porcentaje = new Intl.NumberFormat('es-PE', { style: 'percent', maximumFractionDigits: 1 });

export function Estadisticas({ cantidad, totales, carrerasDisponibles }) {
  const maximo = Math.max(0, ...totales.values());
  const principales = carrerasDisponibles.filter((carrera) => maximo > 0 && totales.get(carrera) === maximo);
  return <section className="vista" aria-labelledby="titulo-estadisticas">
    <div className="titulo-vista">
      <h2 id="titulo-estadisticas">Estadísticas del registro</h2>
      <p>Indicadores del directorio completo. Se actualizan al registrar, editar o eliminar estudiantes.</p>
    </div>
    <div className="indicadores" aria-label="Indicadores del directorio">
      <div><span>Estudiantes registrados</span><strong>{cantidad}</strong></div>
      <div><span>Carreras con registros</span><strong>{totales.size}</strong></div>
      <div><span>Mayor cantidad en una carrera</span><strong>{maximo}</strong></div>
    </div>
    <div className="columnas">
      <section className="panel bloque" aria-labelledby="titulo-resumen">
        <div className="titulo-bloque"><h2 id="titulo-resumen">Distribución por carrera</h2><span>Total · {cantidad}</span></div>
        {cantidad === 0 && <p className="aviso-vacio">Aún no hay registros para calcular la distribución.</p>}
        <ul className="distribucion">{carrerasDisponibles.map((carrera) => {
          const total = totales.get(carrera) ?? 0;
          const proporcion = cantidad ? total / cantidad : 0;
          return <li key={carrera}>
            <span>{carrera}</span>
            <meter min="0" max={cantidad || 1} value={total} aria-label={carrera} />
            <strong>{total} · {porcentaje.format(proporcion)}</strong>
          </li>;
        })}</ul>
      </section>
      <aside className="panel bloque guia">
        <h2>Carreras con más registros</h2>
        {principales.length > 0 ? <ul>{principales.map((carrera) => <li key={carrera}>{carrera}</li>)}</ul>
          : <p>Registra estudiantes para comparar las carreras.</p>}
        <a href="#directorio">Volver al directorio →</a>
      </aside>
    </div>
  </section>;
}

const capturas = [
  ['01-directorio-api', 'Directorio con Spring Boot', 'Carga inicial de cinco registros ficticios.'],
  ['02-busqueda', 'Búsqueda y filtro', 'El texto «rios» y la carrera dejan un único resultado.'],
  ['03-alta', 'Alta de un estudiante', 'La API confirma el registro de E-006.'],
  ['07-edicion', 'Edición del registro', 'Cambian el nombre y la carrera. El código identifica al mismo estudiante.'],
  ['04-conflicto', 'Código duplicado', 'La API devuelve 409 y conserva el directorio.'],
  ['05-baja', 'Baja confirmada', 'Tras eliminar los registros de prueba, el directorio vuelve a cinco.'],
  ['08-paginacion', 'Paginación', 'El séptimo registro aparece en la segunda página.'],
  ['06-error-conexion', 'Error de conexión', 'La interfaz avisa del fallo y permite reintentar.'],
];

export function Evidencias() {
  return <section className="vista" aria-labelledby="titulo-evidencias">
    <div className="titulo-vista">
      <h2 id="titulo-evidencias">Informe y evidencias</h2>
      <p>Documentación de la actividad 7.2, código fuente y capturas de las pruebas con la API.</p>
    </div>
    <div className="entregables">
      <a className="panel bloque archivo informe" href={enlaces.informe} download>
        <span className="tipo-archivo">PDF</span><strong>Descargar informe</strong><span>Integrantes, pruebas y siete respuestas de evaluación.</span>
      </a>
      <a className="panel bloque archivo codigo-fuente" href={enlaces.repositorio}>
        <span className="tipo-archivo">GITHUB</span><strong>Ver código fuente</strong><span>Frontend, API Spring Boot e instrucciones.</span>
      </a>
    </div>
    <div className="titulo-bloque"><h2>Galería de pruebas</h2><span>{capturas.length} capturas</span></div>
    <div className="galeria">{capturas.map(([archivo, titulo, descripcion]) => {
      const url = import.meta.env.BASE_URL + 'capturas/' + archivo + '.jpg';
      return <a className="panel evidencia" href={url} key={archivo} target="_blank" rel="noopener noreferrer">
        <img src={url} alt="" loading="lazy" />
        <div><h3>{titulo}</h3><p>{descripcion}</p><span>Ver captura <span aria-hidden="true">↗</span></span></div>
      </a>;
    })}</div>
  </section>;
}
