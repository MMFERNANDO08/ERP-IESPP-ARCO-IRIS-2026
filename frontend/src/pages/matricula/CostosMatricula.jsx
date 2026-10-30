import React, { useEffect, useState } from 'react';
import { Coins, AlertCircle, Plus, Pencil, Trash2, X } from 'lucide-react';

// ⚠️ URL de tu Laravel
const API_BASE_URL = 'http://localhost:8000/api'; 

const premiumStyles = `
    :root { --slate-50: #f8fafc; --slate-200: #e2e8f0; --slate-800: #1e293b; --teal-600: #0d9488; --radius-lg: 12px; }
    body { background-color: var(--slate-50); }
    .premium-card { background: #ffffff; border-radius: var(--radius-lg); border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); }
    .btn-premium-accent { background-color: var(--teal-600); color: white; border: none; border-radius: 8px; font-weight: 500; transition: all 0.2s; }
    .btn-premium-accent:hover { background-color: #0f766e; color: white; }
    .form-select, .form-control { border-radius: 8px; border: 1px solid var(--slate-200); font-size: 0.9rem; padding: 0.5rem 1rem; }
    .form-select:focus, .form-control:focus { border-color: var(--teal-600); box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1); }
    .filter-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--slate-800); margin-bottom: 0.5rem; }
    .table-premium th { background-color: #f8fafc; color: #475569; font-size: 0.8rem; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding: 12px; }
    .table-premium td { padding: 12px; font-size: 0.9rem; vertical-align: middle; border-bottom: 1px solid #f1f5f9; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-start; justify-content: center; z-index: 1050; padding-top: 50px; }
    .modal-content-box { background: white; border-radius: 8px; width: 100%; max-width: 600px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden; }
    .modal-header-custom { background-color: #0d9488; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
    .modal-body-custom { padding: 20px; }
    .form-row { display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
    .form-row label { width: 40%; color: #64748b; font-size: 0.9rem; margin: 0; }
    .form-row .input-container { width: 60%; }
     .modal-alert-box { background: white; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1050; max-width: 90% ;border-radius: 8px; padding: 2rem; max-width: 450px; text-align: center; }
    .icon-alert { color: #f59e0b; display: block; margin-left: auto; margin-right: auto; margin-bottom: 1rem; }
    .btn-alert-ok { background-color: #bae6fd; color: #0369a1; border: none; border-radius: 6px; padding: 0.5rem 2rem; font-weight: 500; cursor: pointer; }
`;

export default function CostosMatricula() {
    const [cargando, setCargando] = useState(true);
    const [errorApi, setErrorApi] = useState(null);
    const [mostrarTabla, setMostrarTabla] = useState(false);
    
    // Catálogos
    const [modalidades, setModalidades] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);

    // Tabla
    const [costos, setCostos] = useState([]);
    const [editandoId, setEditandoId] = useState(null);

    // Filtros
    const [filtros, setFiltros] = useState({
        modalidad_id: '', periodo_id: '', tipo_matricula: 'ESPECIAL',
        programa_id: '', carrera_id: '', sede: 'FILIAL'
    });

    // Modales y Formulario
    const [modalAdvertencia, setModalAdvertencia] = useState({ isOpen: false, mensaje: '' });
    const [modalFormulario, setModalFormulario] = useState(false);
    
    // Nota: He añadido los campos de filtro al formulario de creación porque 
    // tu tabla costos_matricula requiere modalidad_id, periodo_id, etc.
    const [formCosto, setFormCosto] = useState({
        modalidad_id: '', periodo_id: '', programa_id: '', carrera_id: '',
        tipo_matricula: 'REGULAR', sede: 'PRINCIPAL', concepto: '', 
        condicion: 'NORMAL', momento: '', cobrar_una_vez: false, 
        detalle: '', monto: '', estado: 'ACTIVO'
    });

        useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.innerText = premiumStyles;
        document.head.appendChild(styleSheet);

        const cargarCatalogos = async () => {
            try {
                const [resMod, resPer, resFac, resCar] = await Promise.all([
                    fetch(`${API_BASE_URL}/modalidad-estudios`, { headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}/periodos-academicos`, { headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}/facultades`, { headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}/programas-estudio`, { headers: { 'Accept': 'application/json' } })
                ]);

                if (!resMod.ok || !resPer.ok || !resFac.ok || !resCar.ok) throw new Error('Error de red.');

                // 👇 Se lee una sola vez por cada uno.
                const dataMod = await resMod.json();
                const dataPer = await resPer.json();
                const dataFac = await resFac.json();
                const dataCar = await resCar.json();

                // Guardamos los datos usando '?.data' por si Laravel los envía dentro de un objeto
                setModalidades(dataMod.data || dataMod);
                setPeriodos(dataPer.data || dataPer);
                setFacultades(dataFac.data || dataFac);
                setCarreras(dataCar.data || dataCar);

            } catch (error) {
                setErrorApi("Detalle: " + error.message);
            } finally {
                setCargando(false);
            }
        };
        cargarCatalogos();
        return () => styleSheet.remove();
    }, []);

    const getNombreModalidad = (id) => modalidades.find(m => m.id === id)?.nombre || '';
    const getNombrePeriodo = (id) => periodos.find(p => p.id === id)?.nombre_periodo || '';
    const getNombreFacultad = (id) => facultades.find(f => f.id === id)?.nombre || '';
    const getNombreCarrera = (id) => carreras.find(c => c.id === id)?.nombre || '';

    const handleFiltroChange = (e) => setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
      
    // --- 1. TRAER COSTOS REALES DE LA BD ---
        // --- 1. TRAER COSTOS REALES DE LA BD ---
    const aplicarFiltros = async () => {
        // Validamos TODOS los campos
        if (
            !filtros.modalidad_id || 
            !filtros.periodo_id || 
            !filtros.tipo_matricula || 
            !filtros.programa_id || 
            !filtros.carrera_id || 
            !filtros.sede
        ) {
            setModalAdvertencia({ 
                isOpen: true, 
                mensaje: 'Debe seleccionar todos los filtros (Modalidad, Periodo, Tipo Matrícula, Prog. Académico, Especialidad y Sede) para continuar.' 
            });
            return;
        }
        
        setMostrarTabla(true);
        setCargando(true);
        
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const res = await fetch(`${API_BASE_URL}/costos-matricula?${queryParams}`, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!res.ok) throw new Error('Error al cargar los costos.');
            const data = await res.json();
            
            setCostos(data.data || data || []);
        } catch (error) {
            setErrorApi("Error al traer costos: " + error.message);
            setCostos([]);
        } finally {
            setCargando(false);
        }
    };

        // --- FUNCIÓN PARA LIMPIAR FILTROS Y TABLA ---
    const handleLimpiar = () => {
        // 1. Reiniciamos los filtros a su estado inicial
        setFiltros({
            modalidad_id: '', 
            periodo_id: '', 
            tipo_matricula: 'ESPECIAL', // O el valor por defecto que prefieras
            programa_id: '', 
            carrera_id: '', 
            sede: 'FILIAL'
        });
        
        // 2. Ocultamos la tabla y vaciamos los datos
        setMostrarTabla(false);
        setCostos([]);
        
        // 3. Limpiamos cualquier mensaje de error previo
        setErrorApi(null);
    };


        const handleAgregar = () => {
        setEditandoId(null); // 👈 IMPORTANTE: Limpiamos el ID de edición
        setFormCosto({
            modalidad_id: filtros.modalidad_id, periodo_id: filtros.periodo_id,
            programa_id: filtros.programa_id, carrera_id: filtros.carrera_id,
            tipo_matricula: filtros.tipo_matricula, sede: filtros.sede,
            concepto: '', condicion: 'NORMAL', momento: '', cobrar_una_vez: false, 
            detalle: '', monto: '', estado: 'ACTIVO'
        });
        setModalFormulario(true);
    };

    // --- 2. GUARDAR EN LA BASE DE DATOS ---
        // --- 2. GUARDAR EN LA BASE DE DATOS ---
        // --- 2. GUARDAR EN LA BASE DE DATOS (CREAR O EDITAR) ---
    const handleGuardarFormulario = async (e) => {
        e.preventDefault();
        
        if (!formCosto.modalidad_id || !formCosto.periodo_id || !formCosto.programa_id || !formCosto.carrera_id) {
            alert("Por favor, asegúrese de tener seleccionados la modalidad, periodo, programa y carrera en los filtros de arriba.");
            return;
        }

        // Definimos la URL y el método dependiendo de si estamos editando o creando
        const url = editandoId 
            ? `${API_BASE_URL}/costos-matricula/${editandoId}` // Ruta para actualizar (PUT)
            : `${API_BASE_URL}/costos-matricula`;              // Ruta para crear (POST)
        
        const method = editandoId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formCosto)
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (errorData.errors) {
                    const mensajes = Object.values(errorData.errors).flat().join('\n');
                    throw new Error(mensajes);
                }
                throw new Error(errorData.message || 'Error al guardar');
            }

            setModalFormulario(false);
            aplicarFiltros(); // Recargamos la tabla
            alert(editandoId ? 'Costo actualizado exitosamente.' : 'Costo registrado exitosamente.');
            
        } catch (error) {
            alert("Error al guardar: \n" + error.message);
        }
    };

    // --- 3. ELIMINAR DE LA BASE DE DATOS ---
    const handleEliminar = async (id) => {
        if(!window.confirm('¿Seguro que deseas eliminar este costo?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/costos-matricula/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) throw new Error('No se pudo eliminar');
            
            // Recargamos la tabla
            aplicarFiltros();
        } catch (error) {
            alert("Error al eliminar: " + error.message);
        }
    };

    // --- 4. EDITAR DE LA BASE DE DATOS
        // --- ABRIR FORMULARIO PARA EDITAR ---
    const handleEditar = (costo) => {
        setEditandoId(costo.id); // Guardamos el ID que estamos editando
        setFormCosto({
            modalidad_id: costo.modalidad_id,
            periodo_id: costo.periodo_id,
            programa_id: costo.programa_id,
            carrera_id: costo.carrera_id,
            tipo_matricula: costo.tipo_matricula,
            sede: costo.sede,
            concepto: costo.concepto,
            condicion: costo.condicion,
            momento: costo.momento || '',
            cobrar_una_vez: costo.cobrar_una_vez,
            detalle: costo.detalle || '',
            monto: costo.monto,
            estado: costo.estado
        });
        setModalFormulario(true);
    };

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: '1400px' }}>
            <div className="mb-4">
                <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Costos de Matrícula</h2>
                <p className="mb-0 text-muted d-flex align-items-center gap-2"><Coins size={16} /> Gestiona los costos de matrícula.</p>
            </div>

            {errorApi && <div className="alert alert-danger">{errorApi}</div>}

            {/* Filtros */}
            <div className="premium-card p-4 mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-2">
                        <label className="filter-label">Modalidad:</label>
                        <select className="form-select" name="modalidad_id" value={filtros.modalidad_id} onChange={handleFiltroChange}>
                            <option value="">Seleccione</option>
                            {modalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="filter-label">Periodo:</label>
                        <select className="form-select" name="periodo_id" value={filtros.periodo_id} onChange={handleFiltroChange}>
                            <option value="">Seleccione</option>
                            {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre_periodo}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="filter-label">Tipo Matrícula:</label>
                        <select className="form-select" name="tipo_matricula" value={filtros.tipo_matricula} onChange={handleFiltroChange}>
                            <option value="">Seleccione</option>
                            <option value="REGULAR">REGULAR</option>
                            <option value="ESPECIAL">ESPECIAL</option>
                            <option value="CONDICIONAL">CONDICIONAL</option>
                            <option value="EXTEMPORANEO">EXTEMPORANEO</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="filter-label">Prog. Académico:</label>
                        <select className="form-select" name="programa_id" value={filtros.programa_id} onChange={handleFiltroChange}>
                            <option value="">Seleccione</option>
                            {facultades.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="filter-label">Especialidad:</label>
                        <select className="form-select" name="carrera_id" value={filtros.carrera_id} onChange={handleFiltroChange}>
                            <option value="">Seleccione</option>
                            {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="filter-label">Sede:</label>
                        <select className="form-select" name="sede" value={filtros.sede} onChange={handleFiltroChange}>
                            <option value="PRINCIPAL">PRINCIPAL</option>
                            <option value="FILIAL">FILIAL</option>
                        </select>
                    </div>
                </div>
                <div className="mt-3 d-flex gap-3">
                    <button className="btn btn-premium-accent px-4 py-2" onClick={aplicarFiltros} disabled={cargando}>
                        {cargando ? 'Cargando...' : 'Ver Costos'}
                    </button>
                    {/* NUEVO BOTÓN LIMPIAR */}
                    <button 
                        className="btn btn-outline-secondary px-4 py-2" 
                        onClick={handleLimpiar}
                        style={{ borderRadius: '8px' }}
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            {/* Tabla */}
            {mostrarTabla && (
                <div className="premium-card overflow-hidden">
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
                        <span className="text-secondary fw-bold">Costos</span>
                        <button className="btn btn-premium-accent btn-sm" onClick={handleAgregar}>Agregar</button>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-premium mb-0">
                            <thead>
                                <tr>
                                    <th>Se Cobra Por</th>
                                    <th>Condición</th>
                                    <th>Momento</th>
                                    <th>Detalle</th>
                                    <th>Monto</th>
                                    <th>1 vez</th>
                                    <th>Estado</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {costos.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">No hay costos registrados.</td>
                                    </tr>
                                ) : (
                                    costos.map(costo => (
                                        <tr key={costo.id}>
                                            <td>{costo.concepto}</td>
                                            <td>{costo.condicion}</td>
                                            <td>{costo.momento}</td>
                                            <td>{costo.detalle}</td>
                                            <td>S/ {parseFloat(costo.monto).toFixed(2)}</td>
                                            <td><input type="checkbox" checked={costo.cobrar_una_vez} readOnly disabled /></td>
                                            <td><span className={`badge ${costo.estado === 'ACTIVO' ? 'bg-success' : 'bg-danger'}`}>{costo.estado}</span></td>
                                            <td className="text-center text-nowrap">
                                                {/* 👇 BOTÓN EDITAR 👇 */}
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditar(costo)} title="Editar">
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(costo.id)} title="Eliminar">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Formulario */}
            {modalFormulario && (
                <div className="modal-overlay">
                    <div className="modal-content-box">
                        <div className="modal-header-custom">
                            {/* TÍTULO DINÁMICO */}
                            <h5 className="m-0">{editandoId ? 'Editar Costo' : 'Agregar Costo'}</h5>
                            <button className="btn btn-sm text-white" onClick={() => setModalFormulario(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleGuardarFormulario} className="modal-body-custom">
                            
                            <div className="form-row">
                                <label>Concepto (Se Cobra Por...)</label>
                                <div className="input-container">
                                    <select className="form-select" value={formCosto.concepto} onChange={(e) => setFormCosto({...formCosto, concepto: e.target.value})} required>
                                        <option value="">Seleccione</option>
                                        <option value="MATRICULA">MATRICULA</option>
                                        <option value="SUBSANACION">SUBSANACIÓN</option>
                                        <option value="CURSO">CURSO</option>
                                        <option value="CREDITO">CREDITO</option>
                                        <option value="OTRO">OTRO</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <label>Si es (o está)</label>
                                <div className="input-container">
                                    <select className="form-select" value={formCosto.condicion} onChange={(e) => setFormCosto({...formCosto, condicion: e.target.value})} required>
                                        <option value="NORMAL">NORMAL</option>
                                        <option value="BECA">BECA</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <label>Momento</label>
                                <div className="input-container">
                                    <select className="form-select" value={formCosto.momento} onChange={(e) => setFormCosto({...formCosto, momento: e.target.value})}>
                                        <option value="">Seleccione</option>
                                        <option value="INICIO">AL INICIAR</option>
                                        <option value="MITAD">DURANTE EL CICLO</option>
                                        <option value="FINAL">AL FINALIZAR</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <label>Cobrar solo 1 vez</label>
                                <div className="input-container">
                                    <input type="checkbox" className="form-check-input" checked={formCosto.cobrar_una_vez} onChange={(e) => setFormCosto({...formCosto, cobrar_una_vez: e.target.checked})} />
                                </div>
                            </div>

                            <div className="form-row">
                                <label>Detalle</label>
                                <div className="input-container">
                                    <input type="text" className="form-control" value={formCosto.detalle} onChange={(e) => setFormCosto({...formCosto, detalle: e.target.value})} />
                                </div>
                            </div>

                            <div className="form-row">
                                <label>Monto</label>
                                <div className="input-container">
                                    <input type="number" step="0.01" className="form-control" value={formCosto.monto} onChange={(e) => setFormCosto({...formCosto, monto: e.target.value})} required />
                                </div>
                            </div>

                            <div className="form-row" style={{ borderBottom: 'none' }}>
                                <label>Estado</label>
                                <div className="input-container">
                                    <select className="form-select" value={formCosto.estado} onChange={(e) => setFormCosto({...formCosto, estado: e.target.value})}>
                                        <option value="ACTIVO">ACTIVO</option>
                                        <option value="INACTIVO">INACTIVO</option>
                                    </select>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                <button type="submit" className="btn btn-success px-4">Agregar</button>
                                <button type="button" className="btn btn-danger px-4" onClick={() => setModalFormulario(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Advertencia */}
            {modalAdvertencia.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-alert-box">
                        <AlertCircle size={70} className="icon-alert" />
                        <p className="mb-4 text-secondary">{modalAdvertencia.mensaje}</p>
                        <button className="btn-alert-ok" onClick={() => setModalAdvertencia({ isOpen: false, mensaje: '' })}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}