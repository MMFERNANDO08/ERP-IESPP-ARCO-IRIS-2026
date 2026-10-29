import React, { useEffect, useState } from 'react';
import { Coins, AlertCircle } from 'lucide-react';

// ==============================================================================
// ⚠️ IMPORTANTE: CAMBIA ESTA URL POR LA DE TU BACKEND (Laravel, Node, etc.)
// ==============================================================================
const API_BASE_URL = 'http://localhost:8000/api'; 

const premiumStyles = `
    :root { --slate-50: #f8fafc; --slate-200: #e2e8f0; --slate-800: #1e293b; --slate-900: #0f172a; --teal-600: #0d9488; --teal-700: #0f766e; --radius-lg: 12px; }
    body { background-color: var(--slate-50); }
    .premium-card { background: #ffffff; border-radius: var(--radius-lg); border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); }
    .btn-premium-accent { background-color: var(--teal-600); color: white; border: none; border-radius: 8px; font-weight: 500; transition: all 0.2s; }
    .btn-premium-accent:hover { background-color: var(--teal-700); color: white; }
    .premium-input-group .form-select { border-radius: 8px; border: 1px solid var(--slate-200); padding: 0.65rem 1rem; font-size: 0.9rem; color: var(--slate-800); background-color: #ffffff; transition: all 0.2s; }
    .premium-input-group .form-select:focus { border-color: var(--teal-600); box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1); }
    .filter-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--slate-800); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px; min-height: 18px; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1050; }
    .modal-alert-box { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1050; max-width: 90%; background: white; border-radius: 8px; padding: 2rem; width: 100%; max-width: 450px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .icon-alert { color: #f59e0b; display: block; margin-left: auto; margin-right: auto; margin-bottom: 1rem; }
    .btn-alert-ok { background-color: #bae6fd; color: #0369a1; border: none; border-radius: 6px; padding: 0.5rem 2rem; font-weight: 500; margin-top: 1rem; cursor: pointer; transition: all 0.2s; }
    .btn-alert-ok:hover { background-color: #7dd3fc; }   
    
`;
export default function CostosMatricula() {
    const [mostrarTabla, setMostrarTabla] = useState(false);
    
    // 1. ESTADOS PARA GUARDAR LOS DATOS DE LAS TABLAS
    const [modalidades, setModalidades] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);

    // Estado de carga para saber si el backend está respondiendo
    const [cargando, setCargando] = useState(true);
    const [errorApi, setErrorApi] = useState(null);

    // Estado para el Modal de advertencia
    const [modalAdvertencia, setModalAdvertencia] = useState({ isOpen: false, mensaje: '' });

    // Estado para los filtros seleccionados
    const [filtros, setFiltros] = useState({
        modalidad_id: '',
        periodo_id: '',
        tipo_matricula: 'ESPECIAL', // Por defecto como en tu imagen
        programa_id: '', // Apunta a facultades
        carrera_id: '',  // Apunta a programas_estudio
        sede: 'PRINCIPAL'
    });

    // 2. EFECTO PARA CONSUMIR LAS APIS AL CARGAR LA PANTALLA
    useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.innerText = premiumStyles;
        document.head.appendChild(styleSheet);

        const cargarCatalogos = async () => {
            setCargando(true);
            setErrorApi(null);
            try {
                // Hacemos las 4 peticiones al mismo tiempo para mayor velocidad
                
                 const [resMod, resPer, resFac, resCar] = await Promise.all([
                    fetch(`${API_BASE_URL}/modalidad-estudios`, {
                        headers: { 'Accept': 'application/json' }
                    }),
                    fetch(`${API_BASE_URL}/periodos-academicos`, {
                        headers: { 'Accept': 'application/json' }
                    }),
                    fetch(`${API_BASE_URL}/facultades`, {
                        headers: { 'Accept': 'application/json' }
                    }),
                    fetch(`${API_BASE_URL}/programas-estudio`, {
                        headers: { 'Accept': 'application/json' }
                    })
                ]);

                // Si alguna falla, lanzamos error
                if (!resMod.ok || !resPer.ok || !resFac.ok || !resCar.ok) {
                    throw new Error('Error al conectar con el servidor. Verifica las rutas de tu API.');
                }

                // Convertimos las respuestas a JSON
                const dataMod = await resMod.json();
                const dataPer = await resPer.json();
                const dataFac = await resFac.json();
                const dataCar = await resCar.json();

                // Si tu backend (ej. Laravel) devuelve { data: [...] }, usamos .data. Si no, usamos el array directo.
                setModalidades(dataMod.data || dataMod);
                setPeriodos(dataPer.data || dataPer);
                setFacultades(dataFac.data || dataFac);
                setCarreras(dataCar.data || dataCar);

            } catch (error) {
                console.error(error);
                setErrorApi("No se pudieron cargar los datos de los filtros. " + error.message);
            } finally {
                setCargando(false);
            }
        };

        cargarCatalogos();

        return () => styleSheet.remove();
    }, []);

    // Función para actualizar el estado cuando el usuario selecciona una opción
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    // Validación al dar clic en "Ver Costos"
    const aplicarFiltros = () => {
        if (!filtros.programa_id || !filtros.carrera_id) {
            setModalAdvertencia({
                isOpen: true,
                mensaje: 'Debe seleccionar un Programa Académico y Especialidad'
            });
            return;
        }
        setMostrarTabla(true);
    };

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: '1400px' }}>
            {/* Título */}
            <div className="mb-4">
                <h2 className="fw-bold mb-1" style={{ color: 'var(--slate-900)' }}>Costos de Matrícula</h2>
                <p className="mb-0 text-muted d-flex align-items-center gap-2">
                    <Coins size={16} /> <span>Gestiona los costos de matrícula según el periodo académico.</span>
                </p>
            </div>

            {/* Mensaje de Error de API si falla */}
            {errorApi && (
                <div className="alert alert-danger shadow-sm rounded-3 mb-4">
                    <strong>Error de conexión:</strong> {errorApi}
                </div>
            )}

            {/* Panel de Filtros */}
            <div className="premium-card p-4 mb-4">
                <div className="row g-3 align-items-end">
                    
                    {/* Select Modalidad */}
                    <div className="col-12 col-md-2">
                        <div className="premium-input-group">
                            <label className="filter-label">Modalidad:</label>
                            <select className="form-select" name="modalidad_id" value={filtros.modalidad_id} onChange={handleFiltroChange} disabled={cargando}>
                                <option value="">{cargando ? 'Cargando...' : 'Seleccione'}</option>
                                {modalidades.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Select Periodo */}
                    <div className="col-12 col-md-2">
                        <div className="premium-input-group">
                            <label className="filter-label">Periodo:</label>
                            <select className="form-select" name="periodo_id" value={filtros.periodo_id} onChange={handleFiltroChange} disabled={cargando}>
                                <option value="">{cargando ? 'Cargando...' : 'Seleccione'}</option>
                                {periodos.map(p => (
                                    // NOTA: en tu tabla el campo se llama 'nombre_periodo'
                                    <option key={p.id} value={p.id}>{p.nombre_periodo}</option> 
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Select Tipo Matrícula (Estático) */}
                    <div className="col-12 col-md-2">
                        <div className="premium-input-group">
                            <label className="filter-label">Tipo Matrícula:</label>
                            <select className="form-select" name="tipo_matricula" value={filtros.tipo_matricula} onChange={handleFiltroChange}>
                                <option value="REGULAR">REGULAR</option>
                                <option value="ESPECIAL">ESPECIAL</option>
                                <option value="CONDICIONAL">CONDICIONAL</option>
                                <option value="EXTEMPORANEO">EXTEMPORANEO</option>
                            </select>
                        </div>
                    </div>

                    {/* Select Programa Académico (Facultades) */}
                    <div className="col-12 col-md-2">
                        <div className="premium-input-group">
                            <label className="filter-label">Programa Académico:</label>
                            <select className="form-select" name="programa_id" value={filtros.programa_id} onChange={handleFiltroChange} disabled={cargando}>
                                <option value="">{cargando ? 'Cargando...' : 'Seleccione'}</option>
                                {facultades.map(f => (
                                    <option key={f.id} value={f.id}>{f.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Select Carrera (Programas de Estudio) */}
                    <div className="col-12 col-md-2">
                        <div className="premium-input-group">
                            <label className="filter-label">Especialidad:</label>
                            <select className="form-select" name="carrera_id" value={filtros.carrera_id} onChange={handleFiltroChange} disabled={cargando}>
                                <option value="">{cargando ? 'Cargando...' : 'Seleccione'}</option>
                                {carreras.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Select Sede (Estático) */}
                    <div className="col-12 col-md-2">
                        <div className="premium-input-group">
                            <label className="filter-label">Sede</label>
                            <select className="form-select" name="sede" value={filtros.sede} onChange={handleFiltroChange}>
                                <option value="PRINCIPAL">PRINCIPAL</option>
                                <option value="FILIAL">FILIAL</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row g-3 align-items-end mt-2">
                    <div className="col-12 col-md-2">
                        <button
                            type="button"
                            className="btn btn-premium-accent w-100 py-2"
                            style={{ height: '42px', fontSize: '0.9rem' }}
                            onClick={aplicarFiltros}
                            disabled={cargando}
                        >
                            {cargando ? 'Cargando...' : 'Ver Costos'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Advertencia */}
            {modalAdvertencia.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-alert-box">
                        <AlertCircle size={60} strokeWidth={1.5} className="icon-alert" />
                        <p className="mb-4 text-secondary" style={{ fontSize: '1.05rem' }}>
                            {modalAdvertencia.mensaje}
                        </p>
                        <button className="btn-alert-ok" onClick={() => setModalAdvertencia({ isOpen: false, mensaje: '' })}>
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}