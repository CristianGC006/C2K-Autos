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
                });
            } else {
                // Crear nuevo operador
                await createLogisticOperator(operatorData);
                
                await Swal.fire({
                    title: '¡Creado!',
                    text: `El operador logístico ${operatorData.name} ha sido creado exitosamente`,
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
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
