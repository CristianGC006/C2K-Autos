import React, { useState, useEffect } from 'react';
import { FaBuilding, FaPlus, FaFileExport, FaSync } from 'react-icons/fa';
import Swal from 'sweetalert2';
import BranchTable from '../../components/BranchTable';
import BranchForm from '../../components/BranchForm';
import { 
    getBranches, 
    createBranch, 
    updateBranch, 
    deleteBranch
} from '../../services/BranchService';
import './BranchManagement.css';

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
    const [formLoading, setFormLoading] = useState(false);

    // Cargar sucursales al montar el componente
    useEffect(() => {
        loadBranches();
    }, []);

    // Función para cargar todas las sucursales
    const loadBranches = async () => {
        try {
            setLoading(true);
            const data = await getBranches();
            setBranches(data);
        } catch (error) {
            console.error('Error al cargar sucursales:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las sucursales. Inténtalo de nuevo.',
                icon: 'error',
                confirmButtonColor: '#014421'
            });
        } finally {
            setLoading(false);
        }
    };

    // Función para mostrar el formulario de nueva sucursal
    const handleCreateNew = () => {
        setSelectedBranch(null);
        setFormMode('create');
        setShowForm(true);
    };

    // Función para editar sucursal
    const handleEdit = (branch) => {
        setSelectedBranch(branch);
        setFormMode('edit');
        setShowForm(true);
    };

    // Función para ver detalles de sucursal
    const handleView = (branch) => {
        Swal.fire({
            title: `Sucursal: ${branch.name}`,
            html: `
                <div style="text-align: left; margin: 1rem 0;">
                    <p><strong>📍 Dirección:</strong> ${branch.address}</p>
                    <p><strong>📞 Teléfono:</strong> ${branch.phone}</p>
                    <p><strong>🕒 Horario:</strong> ${branch.schedule}</p>
                    <p><strong>📊 Estado:</strong> 
                        <span style="background: ${getBadgeColor(branch.status)}; padding: 4px 8px; border-radius: 12px; color: white; font-size: 12px;">
                            ${branch.status}
                        </span>
                    </p>
                </div>
            `,
            icon: 'info',
            confirmButtonColor: '#014421',
            confirmButtonText: 'Cerrar'
        });
    };

    // Función para obtener color del badge
    const getBadgeColor = (status) => {
        switch (status) {
            case 'ACTIVA': return '#10b981';
            case 'INACTIVA': return '#ef4444';
            case 'MANTENIMIENTO': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    // Función para eliminar sucursal
    const handleDelete = async (id) => {
        try {
            await deleteBranch(id);
            await loadBranches(); // Recargar la lista
        } catch (error) {
            console.error('Error al eliminar sucursal:', error);
            throw error; // Re-lanzar para que BranchTable maneje el error
        }
    };

    // Función para manejar submit del formulario
    const handleFormSubmit = async (formData) => {
        try {
            setFormLoading(true);
            
            if (formMode === 'create') {
                await createBranch(formData);
                
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'La sucursal ha sido creada exitosamente',
                    icon: 'success',
                    confirmButtonColor: '#014421',
                    timer: 3000,
                    timerProgressBar: true
                });
            } else {
                await updateBranch(selectedBranch.idBranch, formData);
                
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'La sucursal ha sido actualizada exitosamente',
                    icon: 'success',
                    confirmButtonColor: '#014421',
                    timer: 3000,
                    timerProgressBar: true
                });
            }
            
            setShowForm(false);
            setSelectedBranch(null);
            await loadBranches(); // Recargar la lista
            
        } catch (error) {
            console.error('Error en formulario:', error);
            Swal.fire({
                title: 'Error',
                text: `No se pudo ${formMode === 'create' ? 'crear' : 'actualizar'} la sucursal. Inténtalo de nuevo.`,
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setFormLoading(false);
        }
    };

    // Función para cancelar formulario
    const handleFormCancel = () => {
        setShowForm(false);
        setSelectedBranch(null);
        setFormMode('create');
    };

    // Función para exportar datos
    const handleExport = () => {
        try {
            const csvContent = [
                ['ID', 'Nombre', 'Dirección', 'Teléfono', 'Horario', 'Estado'],
                ...branches.map(branch => [
                    branch.idBranch,
                    branch.name,
                    branch.address,
                    branch.phone,
                    branch.schedule,
                    branch.status
                ])
            ].map(row => row.join(',')).join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `sucursales_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            Swal.fire({
                title: '¡Exportado!',
                text: 'Los datos han sido exportados exitosamente',
                icon: 'success',
                confirmButtonColor: '#014421',
                timer: 2000,
                timerProgressBar: true
            });
        } catch (error) {
            console.error('Error al exportar:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron exportar los datos',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    // Calcular estadísticas
    const stats = {
        total: branches.length,
        active: branches.filter(b => b.status === 'ACTIVA').length,
        inactive: branches.filter(b => b.status === 'INACTIVA').length,
        maintenance: branches.filter(b => b.status === 'MANTENIMIENTO').length
    };

    if (showForm) {
        return (
            <div className="branch-management">
                <BranchForm
                    branch={selectedBranch}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    loading={formLoading}
                    mode={formMode}
                />
            </div>
        );
    }

    return (
        <div className="branch-management">
            {/* Header */}
            <div className="branch-management-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1 className="header-title">
                            <FaBuilding className="header-icon" />
                            Gestión de Sucursales
                        </h1>
                        <p className="header-subtitle">
                            Administra todas las sucursales de C2K Autos
                        </p>
                    </div>
                    <div className="header-decoration">
                        <div className="decoration-circle"></div>
                        <div className="decoration-circle"></div>
                        <div className="decoration-circle"></div>
                    </div>
                </div>
            </div>

            {/* Barra de acciones */}
            <div className="branch-actions-bar">
                <div className="actions-left">
                    <button
                        onClick={handleCreateNew}
                        className="btn-primary"
                        disabled={loading}
                    >
                        <FaPlus className="btn-icon" />
                        Nueva Sucursal
                    </button>
                    <button
                        onClick={loadBranches}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        <FaSync className="btn-icon" />
                        Actualizar
                    </button>
                </div>
                <div className="actions-right">
                    <button
                        onClick={handleExport}
                        className="btn-export"
                        disabled={loading || branches.length === 0}
                    >
                        <FaFileExport className="btn-icon" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-header">
                        <h3 className="stat-title">Total Sucursales</h3>
                        <FaBuilding className="stat-icon" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-label">Sucursales registradas</div>
                    </div>
                </div>

                <div className="stat-card active">
                    <div className="stat-header">
                        <h3 className="stat-title">Activas</h3>
                        <div className="stat-indicator active"></div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.active}</div>
                        <div className="stat-label">En funcionamiento</div>
                    </div>
                </div>

                <div className="stat-card inactive">
                    <div className="stat-header">
                        <h3 className="stat-title">Inactivas</h3>
                        <div className="stat-indicator inactive"></div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.inactive}</div>
                        <div className="stat-label">Fuera de servicio</div>
                    </div>
                </div>

                <div className="stat-card maintenance">
                    <div className="stat-header">
                        <h3 className="stat-title">Mantenimiento</h3>
                        <div className="stat-indicator maintenance"></div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.maintenance}</div>
                        <div className="stat-label">En mantenimiento</div>
                    </div>
                </div>
            </div>

            {/* Tabla de sucursales */}
            <BranchTable
                branches={branches}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                loading={loading}
            />
        </div>
    );
};

export default BranchManagement;
