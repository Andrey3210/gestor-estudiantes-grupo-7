import { useEffect, useRef, useState } from 'react';
import { carreras, modoDemostracion } from './datos.js';
import { usarEstudiantes } from './operaciones.js';
import { exportarCSV } from './csv.js';
import { Actividad, Estadisticas, Evidencias } from './Vistas.jsx';

const vistas = {
  inicio: { nombre: 'Actividad', indice: 'Información general' },
  directorio: { nombre: 'Directorio', indice: 'Directorio estudiantil' },
  resumen: { nombre: 'Estadísticas', indice: 'Distribución por carrera' },
  evidencias: { nombre: 'Evidencias', indice: 'Informe y capturas' },
};
const secciones = Object.entries(vistas);

function leerSeccion() {
  return window.location.hash.slice(1);
}

const rutas = {
  registro: 'm2 8 10-5 10 5-10 5-10-5Zm5 3v5a9 9 0 0 0 10 0v-5m4-2v6',
  usuarios: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  carrera: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2ZM8 7h8m-8 5h5',
  agregar: 'M12 5v14M5 12h14',
  buscar: 'm21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  borrar: 'M3 6h18M9 6V3h6v3m4 0-1 14H6L5 6m5 4v6m4-6v6',
  exito: 'm5 12 4 4L19 6',
  aviso: 'M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  editar: 'm13.5 6.5 4 4M4 20l1-5L16 4a2.8 2.8 0 0 1 4 4L9 19l-5 1Z',
  lista: 'M4 6h16M4 12h16M4 18h16',
  descargar: 'M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4',
};

function Icono({ nombre, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={rutas[nombre]} />
  </svg>;
}

const formularioInicial = { nombre: '', codigo: '', carrera: '' };

function Formulario({ estudiante, onGuardar, onCancelar, ocupado }) {
  const [campos, setCampos] = useState(estudiante ?? formularioInicial);
  const editando = Boolean(estudiante);

  function actualizar(evento) {
    const { name, value } = evento.target;
    setCampos((actuales) => ({ ...actuales, [name]: name === 'codigo' ? value.toUpperCase() : value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    const estudiante = { ...campos, codigo: campos.codigo.trim(), nombre: campos.nombre.trim() };
    if (estudiante.nombre && await onGuardar(estudiante)) setCampos(formularioInicial);
  }

  return <section id="formulario" className="panel formulario" aria-labelledby="titulo-formulario">
    <div className="titulo-panel">
      <span className="icono icono-violeta"><Icono nombre={editando ? 'editar' : 'agregar'} /></span>
      <div><h2 id="titulo-formulario">{editando ? 'Editar estudiante' : 'Nuevo estudiante'}</h2><p>{editando ? 'Actualiza el nombre o la carrera.' : 'Completa los datos del registro.'}</p></div>
    </div>
    <form onSubmit={enviar}>
      <fieldset disabled={ocupado}>
        <label htmlFor="nombre">Nombre completo</label>
        <input id="nombre" name="nombre" placeholder="Ej. Ana Pérez" required maxLength={80}
          pattern=".*\S.*" value={campos.nombre} onChange={actualizar} />
        <label htmlFor="codigo">Código de estudiante</label>
        <input id="codigo" name="codigo" placeholder="Ej. E-006" required maxLength={16}
          pattern={'[A-Z0-9\\-]{3,16}'} title="Entre 3 y 16 letras, números o guiones"
          readOnly={editando} value={campos.codigo} onChange={actualizar} />
        <label htmlFor="carrera">Carrera</label>
        <select id="carrera" name="carrera" required value={campos.carrera} onChange={actualizar}>
          <option value="">Selecciona una carrera</option>
          {editando && !carreras.includes(estudiante.carrera) && <option>{estudiante.carrera}</option>}
          {carreras.map((carrera) => <option key={carrera}>{carrera}</option>)}
        </select>
        <button className="boton primario" type="submit">
          <Icono nombre={editando ? 'exito' : 'agregar'} size={17} />
          {editando ? 'Guardar cambios' : 'Registrar estudiante'}
        </button>
        {editando && <button className="boton cancelar-edicion" type="button" onClick={onCancelar}>Cancelar edición</button>}
      </fieldset>
    </form>
    <p className="nota-formulario">Usa datos ficticios durante la práctica.</p>
  </section>;
}

function normalizar(texto) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

const porPagina = 6;

function Directorio({ estudiantes, carrerasDisponibles, consulta, onBuscar, filtro, onFiltrar, orden, onOrdenar, pagina,
  onCambiarPagina, onEditar, onPedirBaja, ocupado, cargaInicial }) {
  const paginas = Math.max(1, Math.ceil(estudiantes.length / porPagina));
  const actual = Math.min(pagina, paginas);
  const inicio = (actual - 1) * porPagina;
  const filas = estudiantes.slice(inicio, inicio + porPagina);
  return <section className="panel directorio" aria-labelledby="titulo-directorio">
    <div className="directorio-cabecera">
      <div className="titulo-panel">
        <span className="icono icono-violeta"><Icono nombre="usuarios" /></span>
        <div><h2 id="titulo-directorio">Directorio estudiantil</h2><p>Consulta y administra los registros del taller.</p></div>
      </div>
      <button className="boton secundario" type="button" disabled={estudiantes.length === 0}
        onClick={() => exportarCSV(estudiantes)}><Icono nombre="descargar" size={16} /> Exportar CSV</button>
    </div>
    <div className="filtros">
      <label className="buscar">
        <Icono nombre="buscar" size={18} />
        <input type="search" aria-label="Buscar estudiantes" placeholder="Buscar por nombre, código o carrera"
          value={consulta} onChange={(evento) => onBuscar(evento.target.value)} />
      </label>
      <select aria-label="Filtrar por carrera" value={filtro} onChange={(e) => onFiltrar(e.target.value)}>
        <option value="">Todas las carreras</option>
        {carrerasDisponibles.map((carrera) => <option key={carrera}>{carrera}</option>)}
      </select>
      <select aria-label="Ordenar estudiantes" value={orden} onChange={(e) => onOrdenar(e.target.value)}>
        <option value="codigo">Ordenar por código</option>
        <option value="nombre">Ordenar por nombre</option>
      </select>
    </div>
    <div className="tabla-scroll">
      <table>
        <thead><tr><th scope="col">Estudiante</th><th scope="col">Código</th><th scope="col">Carrera</th><th scope="col">Acción</th></tr></thead>
        <tbody>
          {filas.map((estudiante) => <tr key={estudiante.codigo}>
            <td><div className="identidad"><span className="iniciales" aria-hidden="true">
              {estudiante.nombre.split(/\s+/).slice(0, 2).map((palabra) => palabra[0].toUpperCase()).join('')}
            </span><strong>{estudiante.nombre}</strong></div></td>
            <td><code>{estudiante.codigo}</code></td>
            <td><span className="carrera">{estudiante.carrera}</span></td>
            <td><div className="acciones-fila">
              <button type="button" className="editar" disabled={ocupado}
                aria-label={'Editar a ' + estudiante.nombre} onClick={() => onEditar(estudiante)}><Icono nombre="editar" size={17} /></button>
              <button type="button" className="borrar" disabled={ocupado}
                aria-label={'Eliminar a ' + estudiante.nombre} onClick={() => onPedirBaja(estudiante)}><Icono nombre="borrar" size={17} /></button>
            </div></td>
          </tr>)}
          {estudiantes.length === 0 && <tr><td colSpan="4" className="vacio">
            {cargaInicial ? 'Cargando directorio…' : consulta.trim() || filtro ? 'No se encontraron coincidencias.' : 'No hay estudiantes para mostrar.'}
          </td></tr>}
        </tbody>
      </table>
    </div>
    <div className="directorio-pie">
      <span>{estudiantes.length === 1 ? '1 estudiante visible' : estudiantes.length + ' estudiantes visibles'}</span>
      {paginas > 1 && <nav className="paginacion" aria-label="Páginas del directorio">
        <button className="boton secundario" type="button" disabled={actual === 1} onClick={() => onCambiarPagina(actual - 1)}>Anterior</button>
        <span>Página {actual} de {paginas}</span>
        <button className="boton secundario" type="button" disabled={actual === paginas} onClick={() => onCambiarPagina(actual + 1)}>Siguiente</button>
      </nav>}
    </div>
  </section>;
}

function ConfirmarBaja({ estudiante, onCerrar, onEliminar }) {
  const dialogo = useRef(null);
  useEffect(() => { dialogo.current.showModal(); }, []);
  return <dialog ref={dialogo} onCancel={onCerrar} aria-labelledby="titulo-baja">
    <span className="icono icono-rojo"><Icono nombre="borrar" /></span>
    <h2 id="titulo-baja">¿Eliminar estudiante?</h2>
    <p>Se eliminará el registro de <strong>{estudiante.nombre}</strong> ({estudiante.codigo}).</p>
    <div className="acciones-dialogo">
      <button className="boton secundario" onClick={onCerrar} autoFocus>Cancelar</button>
      <button className="boton peligro" onClick={() => { onCerrar(); void onEliminar(estudiante); }}>Eliminar registro</button>
    </div>
  </dialog>;
}

function Estado({ solicitud, onReintentar }) {
  return <div className={'estado ' + solicitud.estado} role={solicitud.estado === 'error' ? 'alert' : 'status'}>
    {solicitud.estado === 'cargando' ? <span className="indicador" aria-hidden="true" />
      : <Icono nombre={solicitud.estado === 'error' ? 'aviso' : 'exito'} size={17} />}
    <span>{solicitud.mensaje}</span>
    {solicitud.estado === 'error' && solicitud.operacion === 'listar' &&
      <button type="button" className="reintentar" onClick={onReintentar}>Reintentar</button>}
  </div>;
}

export function App() {
  const { estudiantes, solicitud, cargar, agregar, editar, eliminar } = usarEstudiantes();
  const [consulta, setConsulta] = useState('');
  const [filtro, setFiltro] = useState('');
  const [orden, setOrden] = useState('codigo');
  const [pagina, setPagina] = useState(1);
  const [edicion, setEdicion] = useState(null);
  const [porEliminar, setPorEliminar] = useState(null);
  const [indiceAbierto, setIndiceAbierto] = useState(true);
  const [fragmento, setFragmento] = useState(leerSeccion);
  const seccion = fragmento === 'formulario' ? 'directorio' : Object.hasOwn(vistas, fragmento) ? fragmento : 'inicio';
  const titulo = useRef(null);
  const ocupado = solicitud.estado === 'cargando';
  const estadoListado = solicitud.operacion === 'listar' && solicitud.estado !== 'exito';
  const termino = normalizar(consulta.trim());
  const visibles = estudiantes.filter(({ codigo, nombre, carrera }) =>
    (!filtro || filtro === carrera) && [codigo, nombre, carrera].some((dato) => normalizar(dato).includes(termino)))
    .sort((a, b) => a[orden].localeCompare(b[orden], 'es') || a.codigo.localeCompare(b.codigo, 'es'));
  const totales = new Map();
  for (const { carrera } of estudiantes) totales.set(carrera, (totales.get(carrera) ?? 0) + 1);
  const carrerasDisponibles = [...new Set([...carreras, ...totales.keys()])];
  useEffect(() => {
    const actualizarSeccion = () => setFragmento(leerSeccion());
    window.addEventListener('hashchange', actualizarSeccion);
    return () => window.removeEventListener('hashchange', actualizarSeccion);
  }, []);

  useEffect(() => {
    if (fragmento === 'formulario') {
      document.getElementById('nombre')?.focus();
    } else if (fragmento) {
      titulo.current.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [fragmento]);

  function empezarEdicion(estudiante) {
    setEdicion(estudiante);
    document.getElementById('formulario').scrollIntoView({ block: 'nearest' });
  }

  async function guardar(estudiante) {
    if (!edicion) return agregar(estudiante);
    const guardado = await editar(estudiante);
    if (guardado) setEdicion(null);
    return guardado;
  }

  return <>
    <a className="salto" href="#directorio">Saltar al directorio</a>
    <header className="barra">
      <div className="envoltura barra-interior">
        <a className="marca" href="#inicio"><span className="icono marca-icono"><Icono nombre="registro" size={23} /></span>
          <span>Aula del Taller<small>CONSTRUCCIÓN DE SOFTWARE WEB</small></span></a>
        <span className="etiqueta-grupo">Grupo 7 <span aria-hidden="true">·</span> Actividad 7.2</span>
      </div>
    </header>
    <div className={'aula ' + (indiceAbierto ? '' : 'aula-compacta')} data-vista={seccion}>
      <div className="carril">
        <button className="alternar-indice" type="button" aria-label="Índice de secciones"
          aria-expanded={indiceAbierto} aria-controls="indice" onClick={() => setIndiceAbierto(!indiceAbierto)}>
          <Icono nombre="lista" />
        </button>
        <a href="#inicio" aria-label="Información general"><Icono nombre="registro" /></a>
        <a href="#directorio" aria-label="Directorio estudiantil"><Icono nombre="usuarios" /></a>
        <a href="#evidencias" aria-label="Evidencias"><Icono nombre="carrera" /></a>
      </div>
      <aside id="indice" className="indice" hidden={!indiceAbierto}>
        <h2>Índice de la actividad</h2>
        <nav aria-label="Índice de la actividad">
          {secciones.map(([id, vista], i) => <a href={'#' + id} key={id}
            aria-current={id === seccion ? 'page' : undefined}><span>{i + 1}</span>{vista.indice}</a>)}
        </nav>
      </aside>
      <main className="curso">
        <section className="portada" aria-labelledby="titulo">
          <div className="envoltura portada-contenido">
            <span className="actividad">ACTIVIDAD PRÁCTICA 7.2 · GRUPO 7</span>
            <h1 id="titulo" ref={titulo} tabIndex={-1}>Gestión de estudiantes</h1>
            <p>Taller de Construcción de Software Web <span aria-hidden="true">›</span> {vistas[seccion].nombre}</p>
          </div>
        </section>
        <div className="envoltura contenido">
          <nav className="pestanas" aria-label="Accesos de la actividad">
            {secciones.map(([id, vista]) => <a href={'#' + id} key={id}
              aria-current={id === seccion ? 'page' : undefined}>{vista.nombre}</a>)}
          </nav>
          {seccion === 'inicio' && <Actividad />}
          {seccion === 'directorio' && <div className="columnas vista">
            <div className="principal">
              <div className="titulo-vista"><h2>Administración de estudiantes</h2>
                <p>Busca, filtra y ordena el directorio. Exporta los resultados actuales o actualiza un registro.</p></div>
              <Estado solicitud={solicitud} onReintentar={cargar} />
              <Directorio estudiantes={visibles} carrerasDisponibles={carrerasDisponibles}
                consulta={consulta} filtro={filtro} orden={orden} pagina={pagina}
                onBuscar={(valor) => { setConsulta(valor); setPagina(1); }}
                onFiltrar={(valor) => { setFiltro(valor); setPagina(1); }}
                onOrdenar={(valor) => { setOrden(valor); setPagina(1); }}
                onCambiarPagina={setPagina} onEditar={empezarEdicion}
                onPedirBaja={setPorEliminar} ocupado={ocupado} cargaInicial={ocupado && solicitud.operacion === 'listar'} />
            </div>
            <div className="lateral">
              <section className="panel ficha" aria-label="Estado del registro">
                <div><span>Estudiantes</span><strong>{estudiantes.length}</strong></div>
                <div><span>Carreras</span><strong>{totales.size}</strong></div>
                <div><span>Resultados</span><strong>{visibles.length}</strong></div>
              </section>
              <Formulario key={edicion?.codigo ?? 'nuevo'} estudiante={edicion} onGuardar={guardar}
                onCancelar={() => setEdicion(null)} ocupado={ocupado} />
            </div>
          </div>}
          {seccion === 'resumen' && <div className="principal">
            {estadoListado && <Estado solicitud={solicitud} onReintentar={cargar} />}
            <Estadisticas cantidad={estudiantes.length} totales={totales} carrerasDisponibles={carrerasDisponibles} />
          </div>}
          {seccion === 'evidencias' && <Evidencias />}
          <footer className="pie">
            <span>Taller de Construcción de Software Web · Grupo 7</span>
            <span className="modo"><span />{modoDemostracion ? 'Modo demostración · datos de este navegador' : 'Modo API · Spring Boot'}</span>
          </footer>
        </div>
      </main>
    </div>
    {porEliminar && <ConfirmarBaja estudiante={porEliminar} onCerrar={() => setPorEliminar(null)} onEliminar={eliminar} />}
  </>;
}
