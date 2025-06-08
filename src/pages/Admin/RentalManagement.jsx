import React, { useState, useEffect } from 'react';
import { FaPlus, FaDownload, FaCalendarAlt, FaCar, FaUser, FaDollarSign } from 'react-icons/fa';
import RentalTable from '../../components/RentalTable';
import {
    getRentals,
    deleteRental,
    getRentalStats
} from '../../services/RentalService';
import Swal from 'sweetalert2';
import './RentalManagement.css';

const RentalManagement = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Cargar rentas al montar el componente
    useEffect(() => {
        loadRentals();
        loadStats();
    }, []);

    // Función para cargar todas las rentas
    const loadRentals = async () => {
        try {
            setLoading(true);
            console.log('RentalManagement - Cargando rentas...');
            const data = await getRentals();
            console.log('RentalManagement - Rentas cargadas:', data);
            setRentals(data);
        } catch (error) {
            console.error('Error al cargar rentas:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las rentas. Verifica tu conexión e inténtalo de nuevo.',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar estadísticas
    const loadStats = async () => {
        try {
            const statsData = await getRentalStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            // No mostrar error para estadísticas, son opcionales
        }
    };

    // Función para eliminar una renta
    const handleDelete = async (rentalId) => {
        try {
            console.log('Eliminando renta con ID:', rentalId);
            
            await deleteRental(rentalId);
            
            // Actualizar la lista de rentas
            await loadRentals();
            await loadStats();
            
        } catch (error) {
            console.error('Error al eliminar renta:', error);
            throw error; // Re-lanzar para que RentalTable maneje el error
        }
    };

    // Función para ver detalles de una renta
    const handleView = (rental) => {
        const formatDate = (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP'
            }).format(amount);
        };

        Swal.fire({
            title: 'Detalles de la Renta',
            html: `
                <div class="text-left space-y-3">
                    <div class="border-b pb-2">
                        <h4 class="font-semibold text-gray-900 mb-2">Información del Cliente</h4>
                        <p class="text-gray-700"><strong>Cliente:</strong> ${rental.customerName || 'No disponible'}</p>
                        <p class="text-gray-700"><strong>Email:</strong> ${rental.customerEmail || 'No disponible'}</p>
                        <p class="text-gray-700"><strong>Documento:</strong> ${rental.customerDocument || 'No disponible'}</p>
                    </div>
                    
                    <div class="border-b pb-2">
                        <h4 class="font-semibold text-gray-900 mb-2">Información del Vehículo</h4>
                        <p class="text-gray-700"><strong>Vehículo:</strong> ${rental.vehicleBrand} ${rental.vehicleModel}</p>
                        <p class="text-gray-700"><strong>Placa:</strong> ${rental.vehiclePlate}</p>
                    </div>
                    
                    <div class="border-b pb-2">
                        <h4 class="font-semibold text-gray-900 mb-2">Detalles de la Renta</h4>
                        <p class="text-gray-700"><strong>Fecha de inicio:</strong> ${formatDate(rental.startDate)}</p>
                        <p class="text-gray-700"><strong>Fecha de fin:</strong> ${formatDate(rental.endDate)}</p>
                        <p class="text-gray-700"><strong>Estado:</strong> 
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                ${rental.status}
                            </span>
                        </p>
                        <p class="text-gray-700"><strong>Costo total:</strong> ${formatCurrency(rental.totalCost)}</p>
                    </div>
                    
                    <div>
                        <h4 class="font-semibold text-gray-900 mb-2">Información adicional</h4>
                        <p class="text-gray-700"><strong>Descripción:</strong> ${rental.description || 'No disponible'}</p>
                        ${rental.payment ? `<p class="text-gray-700"><strong>Método de pago:</strong> ${rental.payment.paymentMethod || 'No especificado'}</p>` : ''}
                    </div>
                </div>
            `,
            width: '600px',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#014421'
        });
    };

    // Función para exportar rentas a CSV
    const handleExport = () => {
        try {
            // Crear CSV con datos de rentas
            const csvContent = [
                ['ID', 'Cliente', 'Vehículo', 'Placa', 'Fecha Inicio', 'Fecha Fin', 'Costo', 'Estado'].join(','),
                ...rentals.map(rental => [
                    rental.id,
                    `"${rental.customerName || 'N/A'}"`,
                    `"${rental.vehicleBrand} ${rental.vehicleModel}"`,
                    `"${rental.vehiclePlate}"`,
                    rental.startDate || 'N/A',
                    rental.endDate || 'N/A',
                    rental.totalCost || 0,
                    rental.status || 'N/A'
                ].join(','))
            ].join('\\n');

            // Crear y descargar archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `rentas_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.fire({
                title: '¡Exportado!',
                text: 'Las rentas han sido exportadas exitosamente',
                icon: 'success',
                confirmButtonColor: '#014421',
                timer: 3000,
                timerProgressBar: true
            });
        } catch (error) {
            console.error('Error al exportar:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo exportar las rentas',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        }
    };    return (
        <div className="rental-management">
            {/* Header */}
            <div className="rental-management-header">
                <h1 className="rental-management-title">Gestión de Rentas</h1>
                <p className="rental-management-subtitle">
                    Administra y supervisa todas las rentas de vehículos del sistema
                </p>
            </div>
            
            {/* Barra de acciones */}
            <div className="rental-actions-bar">
                <div className="rental-actions-left">
                    <span className="text-gray-600 font-medium">
                        Total de rentas: {rentals.length}
                    </span>
                </div>
                
                <div className="rental-actions-right">
                    <button
                        onClick={handleExport}
                        className="btn-action btn-export"
                    >
                        <FaDownload />
                        Exportar CSV
                    </button>
                </div>
            </div>            {/* Estadísticas */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card pending">
                        <div className="stat-content">
                            <div className="stat-icon pending">
                                <FaCalendarAlt />
                            </div>
                            <div className="stat-info">
                                <p className="stat-label">Rentas Pendientes</p>
                                <p className="stat-value">
                                    {stats.pending || rentals.filter(r => r.status === 'PENDIENTE').length}
                                </p>
                            </div>
                        </div>
                    </div>                    <div className="stat-card active">
                        <div className="stat-content">
                            <div className="stat-icon active">
                                <FaCar />
                            </div>
                            <div className="stat-info">
                                <p className="stat-label">Rentas Activas</p>
                                <p className="stat-value">
                                    {stats.active || rentals.filter(r => r.status === 'ACTIVA').length}
                                </p>
                            </div>
                        </div>
                    </div>                    <div className="stat-card completed">
                        <div className="stat-content">
                            <div className="stat-icon completed">
                                <FaUser />
                            </div>
                            <div className="stat-info">
                                <p className="stat-label">Rentas Completadas</p>
                                <p className="stat-value">
                                    {stats.completed || rentals.filter(r => r.status === 'COMPLETADA').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card total">
                        <div className="stat-content">
                            <div className="stat-icon total">
                                <FaDollarSign />
                            </div>
                            <div className="stat-info">
                                <p className="stat-label">Total Rentas</p>
                                <p className="stat-value">
                                    {stats.total || rentals.length}
                                </p>
                            </div>
                        </div>
                    </div>                </div>
            )}

            {/* Tabla de rentas */}
            <div className="rental-table-container">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Cargando rentas...</p>
                    </div>
                ) : rentals.length === 0 ? (
                    <div className="empty-state">
                        <FaCar className="empty-state-icon" />
                        <h3 className="empty-state-title">No hay rentas disponibles</h3>
                        <p className="empty-state-message">
                            Cuando se registren nuevas rentas, aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <RentalTable
                        rentals={rentals}
                        onDelete={handleDelete}
                        onView={handleView}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
};

export default RentalManagement;
