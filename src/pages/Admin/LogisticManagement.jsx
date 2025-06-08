import { useState, useEffect } from 'react';
import LogisticOperatorForm from '../../components/LogisticOperatorForm';
import LogisticOperatorTable from '../../components/LogisticOperatorTable';
import Swal from 'sweetalert2';
import './LogisticManagement.css'; // Estilos específicos para gestión de operadores
import {
    getAllLogisticOperators,
    createLogisticOperator,
    updateLogisticOperator,
    deleteLogisticOperator,
    getLogisticOperatorStats
} from '../../services/LogisticOperatorService';

const LogisticManagement = () => {
    const [operators, setOperators] = useState([]);
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOperator, setEditingOperator] = useState(null);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });    // Cargar operadores al montar el componente
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [operatorsData, statsData] = await Promise.all([
                    getAllLogisticOperators(),
                    getLogisticOperatorStats()
                ]);
                setOperators(operatorsData);
                setStats(statsData);
            } catch (error) {
                console.error('Error loading operators:', error);
                await Swal.fire({
                    title: 'Error de conexión',
                    text: 'Error al cargar los operadores logísticos',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, []);

    const loadOperators = async () => {
        try {
            setIsLoading(true);
            const [operatorsData, statsData] = await Promise.all([
                getAllLogisticOperators(),
                getLogisticOperatorStats()
            ]);
            setOperators(operatorsData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading operators:', error);
            showMessage('error', 'Error al cargar los operadores logísticos');
        } finally {
            setIsLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleCreateOperator = () => {
        setEditingOperator(null);
        setIsFormOpen(true);
    };

    const handleEditOperator = (operator) => {
        setEditingOperator(operator);
        setIsFormOpen(true);
    };    const handleFormSubmit = async (operatorData) => {
        try {
            setIsFormLoading(true);
            
            if (editingOperator) {
                // Actualizar operador existente
                await updateLogisticOperator(editingOperator.idLogisticOperator, operatorData);
                
                await Swal.fire({
                    title: '¡Actualizado!',
                    text: `El operador logístico ${operatorData.name} ha sido actualizado exitosamente`,
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });            } else {
                // Crear nuevo operador
                const newOperator = await createLogisticOperator(operatorData);
                
                await Swal.fire({
                    title: '¡Operador Creado Exitosamente! 🚛',
                    html: `
                        <div style="text-align: center; padding: 20px;">
                            <div style="background: linear-gradient(135deg, #044b35, #00664a); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                                <h3 style="margin: 0; font-size: 18px;">👋 ¡Bienvenido, ${operatorData.name}!</h3>
                            </div>
                            
                            <div style="background: #f8f9fa; border: 2px dashed #044b35; padding: 20px; border-radius: 10px; margin: 15px 0;">
                                <p style="margin: 0 0 10px 0; font-weight: bold; color: #044b35;">📋 Código de Operador Logístico:</p>
                                <div style="background: white; border: 2px solid #044b35; padding: 12px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #044b35; letter-spacing: 2px;">
                                    ${newOperator.logisticOperatorCode}
                                </div>
                            </div>

                            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <p style="margin: 0; font-size: 14px; color: #856404;">
                                    <strong>⚠️ IMPORTANTE:</strong><br>
                                    • Este código es necesario para iniciar sesión<br>
                                    • Guárdalo en un lugar seguro<br>
                                    • No lo compartas con nadie<br>
                                    • Si se pierde, contacta al administrador
                                </p>
                            </div>

                            <div style="margin-top: 20px;">
                                <p style="font-size: 14px; color: #6c757d;">
                                    🎉 ¡El operador logístico ha sido registrado exitosamente!
                                </p>
                            </div>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: '📋 Copiar Código',
                    showCancelButton: true,
                    cancelButtonText: '✅ Entendido',
                    customClass: {
                        popup: 'swal2-popup-custom',
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom'
                    },
                    buttonsStyling: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    width: '600px'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Copiar código al portapapeles
                        navigator.clipboard.writeText(newOperator.logisticOperatorCode).then(() => {
                            Swal.fire({
                                title: '📋 ¡Código Copiado!',
                                text: 'El código ha sido copiado al portapapeles',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false,
                                customClass: {
                                    popup: 'swal2-popup-custom'
                                }
                            });
                        }).catch(() => {
                            Swal.fire({
                                title: 'Código de Operador Logístico',
                                text: newOperator.logisticOperatorCode,
                                icon: 'info',
                                confirmButtonText: 'Cerrar',
                                customClass: {
                                    popup: 'swal2-popup-custom'
                                }
                            });
                        });
                    }
                });
            }
            
            // Recargar datos y cerrar formulario
            await loadOperators();
            setIsFormOpen(false);
            setEditingOperator(null);
        } catch (error) {
            console.error('Error saving operator:', error);
            
            await Swal.fire({
                title: 'Error',
                text: error.message || 'Error al guardar el operador logístico',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setIsFormLoading(false);
        }
    };    const handleDeleteOperator = async (operatorId, operatorName = 'este operador') => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará al operador logístico ${operatorName} permanentemente`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                setIsLoading(true);
                await deleteLogisticOperator(operatorId);
                
                await Swal.fire({
                    title: '¡Eliminado!',
                    text: `El operador logístico ${operatorName} ha sido eliminado exitosamente`,
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });
                
                await loadOperators();
            } catch (error) {
                console.error('Error deleting operator:', error);
                await Swal.fire({
                    title: 'Error',
                    text: error.message || 'Error al eliminar el operador logístico',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setEditingOperator(null);
    };    return (
        <div className="logistic-management">
            <header className="logistic-content-header">
                <div className="logistic-header-content">
                    <div className="logistic-header-text">
                        <h1>📦 Gestión de Operadores Logísticos</h1>
                        <p>Administrar operadores logísticos del sistema</p>
                    </div>
                    <button 
                        className="logistic-primary-button"
                        onClick={handleCreateOperator}
                        disabled={isLoading}
                    >
                        ➕ Nuevo Operador
                    </button>
                </div>
            </header>

            {/* Mensaje de estado */}
            {message.text && (
                <div className={`logistic-message ${message.type}`}>
                    <span className="logistic-message-icon">
                        {message.type === 'success' ? '✅' : '❌'}
                    </span>
                    <span className="logistic-message-text">{message.text}</span>
                    <button 
                        className="logistic-message-close"
                        onClick={() => setMessage({ type: '', text: '' })}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Estadísticas rápidas */}
            {!isLoading && stats.total !== undefined && (
                <div className="logistic-quick-stats">
                    <div className="logistic-stat-item">
                        <span className="stat-icon">👥</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.total}</span>
                            <span className="stat-label">Total Operadores</span>
                        </div>
                    </div>
                    <div className="logistic-stat-item">
                        <span className="stat-icon">🚛</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.totalTransporte}</span>
                            <span className="stat-label">Transporte</span>
                        </div>
                    </div>
                    <div className="logistic-stat-item">
                        <span className="stat-icon">🧽</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.totalLavado}</span>
                            <span className="stat-label">Lavado</span>
                        </div>
                    </div>
                    <div className="logistic-stat-item">
                        <span className="stat-icon">🔧</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.totalReparacion}</span>
                            <span className="stat-label">Reparación</span>
                        </div>
                    </div>
                    <div className="logistic-stat-item">
                        <span className="stat-icon">📦</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.totalAlmacenamiento}</span>
                            <span className="stat-label">Almacenamiento</span>
                        </div>
                    </div>
                    <div className="logistic-stat-item">
                        <span className="stat-icon">🔍</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.totalInspeccion}</span>
                            <span className="stat-label">Inspección</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de operadores */}
            <div className="logistic-management-content">
                <LogisticOperatorTable
                    operators={operators}
                    onEdit={handleEditOperator}
                    onDelete={handleDeleteOperator}
                    isLoading={isLoading}
                />
            </div>

            {/* Modal del formulario */}
            {isFormOpen && (
                <div className="logistic-modal-overlay" onClick={handleFormCancel}>
                    <div className="logistic-modal-content" onClick={(e) => e.stopPropagation()}>
                        <LogisticOperatorForm
                            operator={editingOperator}
                            isEditing={!!editingOperator}
                            onSubmit={handleFormSubmit}
                            onCancel={handleFormCancel}
                            isLoading={isFormLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogisticManagement;
