import { useEffect, useRef, useState } from 'react';
import { carreras, modoDemostracion } from './datos.js';
import { usarEstudiantes } from './operaciones.js';

const rutas = {
  registro: 'm2 8 10-5 10 5-10 5-10-5Zm5 3v5a9 9 0 0 0 10 0v-5m4-2v6',
  usuarios: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  carrera: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2ZM8 7h8m-8 5h5',
  agregar: 'M12 5v14M5 12h14',
  buscar: 'm21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  borrar: 'M3 6h18M9 6V3h6v3m4 0-1 14H6L5 6m5 4v6m4-6v6',
  cerrar: 'm6 6 12 12M6 18 18 6',
  exito: 'm5 12 4 4L19 6',
  aviso: 'M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
};

function Icono({ nombre, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={rutas[nombre]} />
  </svg>;
}

const formularioInicial = { nombre: '', codigo: '', carrera: '' };

function Formulario({ onAgregar, ocupado }) {
  const [campos, setCampos] = useState(formularioInicial);

  function actualizar(evento) {
    const { name, value } = evento.target;
    setCampos((actuales) => ({ ...actuales, [name]: name === 'codigo' ? value.toUpperCase() : value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    const estudiante = { ...campos, codigo: campos.codigo.trim(), nombre: campos.nombre.trim() };
    if (estudiante.nombre && await onAgregar(estudiante)) setCampos(formularioInicial);
  }

  return <section className="panel formulario" aria-labelledby="titulo-formulario">
    <div className="titulo-panel">
      <span className="icono icono-violeta"><Icono nombre="agregar" /></span>
      <div><h2 id="titulo-formulario">Nuevo estudiante</h2><p>Completa los datos del registro.</p></div>
    </div>
    <form onSubmit={enviar}>
      <fieldset disabled={ocupado}>
        <label htmlFor="nombre">Nombre completo</label>
        <input id="nombre" name="nombre" placeholder="Ej. Ana Pérez" required maxLength={80}
          pattern=".*\S.*" value={campos.nombre} onChange={actualizar} />
        <label htmlFor="codigo">Código de estudiante</label>
        <input id="codigo" name="codigo" placeholder="Ej. E-006" required maxLength={16}
          pattern={'[A-Z0-9\\-]{3,16}'} title="Entre 3 y 16 letras, números o guiones"
          value={campos.codigo} onChange={actualizar} />
        <label htmlFor="carrera">Carrera</label>
        <select id="carrera" name="carrera" required value={campos.carrera} onChange={actualizar}>
          <option value="">Selecciona una carrera</option>
          {carreras.map((carrera) => <option key={carrera}>{carrera}</option>)}
        </select>
        <button className="boton primario" type="submit"><Icono nombre="agregar" size={17} /> Registrar estudiante</button>
      </fieldset>
    </form>
    <p className="nota-formulario">Usa datos ficticios durante la práctica.</p>
  </section>;
}

function normalizar(texto) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function Directorio({ estudiantes, consulta, onBuscar, onPedirBaja, ocupado, cargaInicial }) {
  return <section className="panel directorio" aria-labelledby="titulo-directorio">
    <div className="directorio-cabecera">
      <div className="titulo-panel">
        <span className="icono icono-violeta"><Icono nombre="usuarios" /></span>
        <div><h2 id="titulo-directorio">Directorio estudiantil</h2><p>Consulta y administra los registros del taller.</p></div>
      </div>
      <label className="buscar">
        <Icono nombre="buscar" size={18} />
        <input type="search" aria-label="Buscar estudiantes" placeholder="Buscar por nombre, código o carrera"
          value={consulta} onChange={(evento) => onBuscar(evento.target.value)} />
      </label>
    </div>
    <div className="tabla-scroll">
      <table>
        <thead><tr><th scope="col">Estudiante</th><th scope="col">Código</th><th scope="col">Carrera</th><th scope="col">Acción</th></tr></thead>
        <tbody>
          {estudiantes.map((estudiante) => <tr key={estudiante.codigo}>
            <td><div className="identidad"><span className="iniciales" aria-hidden="true">
              {estudiante.nombre.split(/\s+/).slice(0, 2).map((palabra) => palabra[0].toUpperCase()).join('')}
            </span><strong>{estudiante.nombre}</strong></div></td>
            <td><code>{estudiante.codigo}</code></td>
            <td><span className="carrera">{estudiante.carrera}</span></td>
            <td><button type="button" className="borrar" disabled={ocupado}
              aria-label={'Eliminar a ' + estudiante.nombre} onClick={() => onPedirBaja(estudiante)}><Icono nombre="borrar" size={17} /></button></td>
          </tr>)}
          {estudiantes.length === 0 && <tr><td colSpan="4" className="vacio">
            {cargaInicial ? 'Cargando directorio…' : consulta.trim() ? 'No se encontraron coincidencias.' : 'No hay estudiantes para mostrar.'}
          </td></tr>}
        </tbody>
      </table>
    </div>
    <div className="directorio-pie">{estudiantes.length === 1 ? '1 estudiante visible' : estudiantes.length + ' estudiantes visibles'}</div>
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
  const { estudiantes, solicitud, cargar, agregar, eliminar } = usarEstudiantes();
  const [consulta, setConsulta] = useState('');
  const [porEliminar, setPorEliminar] = useState(null);
  const ocupado = solicitud.estado === 'cargando';
  const termino = normalizar(consulta.trim());
  const visibles = estudiantes.filter(({ codigo, nombre, carrera }) =>
    [codigo, nombre, carrera].some((dato) => normalizar(dato).includes(termino)));

  return <>
    <header className="barra">
      <div className="envoltura barra-interior">
        <span className="marca"><span className="icono marca-icono"><Icono nombre="registro" size={23} /></span>
          <span>Registro académico<small>TALLER DE SOFTWARE WEB</small></span></span>
        <span className="etiqueta-grupo">Grupo 7</span>
      </div>
    </header>
    <main className="envoltura">
      <section className="portada" aria-labelledby="titulo">
        <div className="portada-contenido">
          <span className="actividad"><span /> ACTIVIDAD PRÁCTICA 7.2</span>
          <h1 id="titulo">Gestión de estudiantes</h1>
          <p>Registra, busca y organiza estudiantes desde un solo lugar.</p>
        </div>
        <div className="portada-ilustracion" aria-hidden="true"><Icono nombre="registro" size={74} /></div>
      </section>
      <section className="resumen" aria-label="Resumen del registro">
        <div className="metrica"><span className="icono icono-violeta"><Icono nombre="usuarios" /></span>
          <div><span>Estudiantes registrados</span><strong>{estudiantes.length}</strong></div></div>
        <div className="metrica"><span className="icono icono-menta"><Icono nombre="carrera" /></span>
          <div><span>Carreras representadas</span><strong>{new Set(estudiantes.map(({ carrera }) => carrera)).size}</strong></div></div>
        <div className="metrica"><span className="icono icono-azul"><Icono nombre="buscar" /></span>
          <div><span>Resultados visibles</span><strong>{visibles.length}</strong></div></div>
      </section>
      <Estado solicitud={solicitud} onReintentar={cargar} />
      <div className="cuadricula">
        <Formulario onAgregar={agregar} ocupado={ocupado} />
        <Directorio estudiantes={visibles} consulta={consulta} onBuscar={setConsulta}
          onPedirBaja={setPorEliminar} ocupado={ocupado} cargaInicial={ocupado && solicitud.operacion === 'listar'} />
      </div>
    </main>
    <footer className="envoltura pie">
      <span>Taller de Construcción de Software Web · Grupo 7</span>
      <span className="modo"><span />{modoDemostracion ? 'Modo demostración · datos de este navegador' : 'Modo API · Spring Boot'}</span>
    </footer>
    {porEliminar && <ConfirmarBaja estudiante={porEliminar} onCerrar={() => setPorEliminar(null)} onEliminar={eliminar} />}
  </>;
}
