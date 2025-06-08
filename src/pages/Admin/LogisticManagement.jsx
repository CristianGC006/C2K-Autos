import { useState, useEffect } from 'react';
import LogisticOperatorForm from '../../components/LogisticOperatorForm';
import LogisticOperatorTable from '../../components/LogisticOperatorTable';
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
                showMessage('error', 'Error al cargar los operadores logísticos');
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
    };

    const handleFormSubmit = async (operatorData) => {
        try {
            setIsFormLoading(true);
            
            if (editingOperator) {
                // Actualizar operador existente
                await updateLogisticOperator(editingOperator.idLogisticOperator, operatorData);
                showMessage('success', 'Operador logístico actualizado correctamente');
            } else {
                // Crear nuevo operador
                await createLogisticOperator(operatorData);
                showMessage('success', 'Operador logístico creado correctamente');
            }
            
            // Recargar datos y cerrar formulario
            await loadOperators();
            setIsFormOpen(false);
            setEditingOperator(null);
        } catch (error) {
            console.error('Error saving operator:', error);
            showMessage('error', error.message || 'Error al guardar el operador logístico');
        } finally {
            setIsFormLoading(false);
        }
    };

    const handleDeleteOperator = async (operatorId) => {
        try {
            setIsLoading(true);
            await deleteLogisticOperator(operatorId);
            showMessage('success', 'Operador logístico eliminado correctamente');
            await loadOperators();
        } catch (error) {
            console.error('Error deleting operator:', error);
            showMessage('error', error.message || 'Error al eliminar el operador logístico');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setEditingOperator(null);
    };

    return (
        <div className="logistic-management">
            <header className="content-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>📦 Gestión de Operadores Logísticos</h1>
                        <p>Administrar operadores logísticos del sistema</p>
                    </div>
                    <button 
                        className="primary-button"
                        onClick={handleCreateOperator}
                        disabled={isLoading}
                    >
                        ➕ Nuevo Operador
                    </button>
                </div>
            </header>

            {/* Mensaje de estado */}
            {message.text && (
                <div className={`message ${message.type}`}>
                    <span className="message-icon">
                        {message.type === 'success' ? '✅' : '❌'}
                    </span>
                    <span className="message-text">{message.text}</span>
                    <button 
                        className="message-close"
                        onClick={() => setMessage({ type: '', text: '' })}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Estadísticas rápidas */}
            {!isLoading && stats.total !== undefined && (
                <div className="quick-stats">
                    <div className="stat-item">
                        <span className="stat-icon">👥</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.total}</span>
                            <span className="stat-label">Total Operadores</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">🚛</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.totalTransporte}</span>
                            <span className="stat-label">Transporte</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">🧽</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.totalLavado}</span>
                            <span className="stat-label">Lavado</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">🔧</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.totalReparacion}</span>
                            <span className="stat-label">Reparación</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">📦</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.totalAlmacenamiento}</span>
                            <span className="stat-label">Almacenamiento</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">🔍</span>
                        <div className="stat-content">
                            <span className="stat-number">{stats.totalInspeccion}</span>
                            <span className="stat-label">Inspección</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de operadores */}
            <div className="management-content">
                <LogisticOperatorTable
                    operators={operators}
                    onEdit={handleEditOperator}
                    onDelete={handleDeleteOperator}
                    isLoading={isLoading}
                />
            </div>

            {/* Modal del formulario */}
            {isFormOpen && (
                <div className="modal-overlay" onClick={handleFormCancel}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
