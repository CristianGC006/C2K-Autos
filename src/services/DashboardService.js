// DashboardService.js - Servicio para obtener estadísticas del dashboard
import { getAllAssessors, getAssessorStats } from './AssessorService';
import { getCustomers } from './CustomerService';
import { getAllVehicles } from './VehicleService';

// Obtener estadísticas generales del dashboard
export const getDashboardStats = async () => {
  try {
    // Obtener estadísticas de asesores
    let assessorStats = { totalAssessors: 0, activeAssessors: 0, averageSalary: 0 };
    try {
      assessorStats = await getAssessorStats();
    } catch (error) {
      console.error('Error getting assessor stats:', error);
    }    // Obtener estadísticas de clientes
    let customerStats = { totalCustomers: 0 };
    try {
      const customers = await getCustomers();
      customerStats = { totalCustomers: Array.isArray(customers) ? customers.length : 0 };
    } catch (error) {
      console.error('Error getting customer stats:', error);
      customerStats = { totalCustomers: 0 };
    }

    // Obtener estadísticas de vehículos
    let vehicleStats = { totalVehicles: 0, availableVehicles: 0 };
    try {
      const vehicles = await getAllVehicles();
      const vehicleArray = Array.isArray(vehicles) ? vehicles : [];
      vehicleStats = { 
        totalVehicles: vehicleArray.length,
        availableVehicles: vehicleArray.filter(v => v.available !== false).length
      };
    } catch (error) {
      console.error('Error getting vehicle stats:', error);
      vehicleStats = { totalVehicles: 0, availableVehicles: 0 };
    }

    // Estadísticas simuladas para rentas (hasta que se implemente el módulo)
    const rentalStats = {
      activeRentals: Math.floor(Math.random() * 50) + 100, // 100-150 rentas activas
      monthlyGrowth: Math.floor(Math.random() * 30) + 10    // 10-40% crecimiento
    };

    return {
      totalUsers: customerStats.totalCustomers || 0,
      totalAssessors: assessorStats.totalAssessors || 0,
      activeAssessors: assessorStats.activeAssessors || 0,
      totalVehicles: vehicleStats.totalVehicles || 0,
      availableVehicles: vehicleStats.availableVehicles || 0,
      activeRentals: rentalStats.activeRentals,
      monthlyGrowth: rentalStats.monthlyGrowth,
      averageSalary: assessorStats.averageSalary || 0,
      // Estadísticas fijas mientras se implementan otros módulos
      totalBranches: 3, // Número de sucursales
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    // Retornar estadísticas por defecto en caso de error
    return {
      totalUsers: 0,
      totalAssessors: 0,
      activeAssessors: 0,
      totalVehicles: 0,
      availableVehicles: 0,
      activeRentals: 0,
      monthlyGrowth: 0,
      averageSalary: 0,
      totalBranches: 3,
      lastUpdated: new Date().toISOString()
    };
  }
};

// Obtener actividad reciente del sistema
export const getRecentActivity = async () => {
  try {
    const activities = [];

    // Obtener últimos asesores registrados
    try {
      const assessors = await getAllAssessors();
      if (Array.isArray(assessors) && assessors.length > 0) {
        // Tomar los últimos 2 asesores
        const recentAssessors = assessors.slice(-2);
        recentAssessors.forEach(assessor => {
          activities.push({
            type: 'assessor',
            icon: '💼',
            title: 'Nuevo asesor agregado',
            description: assessor.name || 'Asesor sin nombre',
            timestamp: assessor.createdAt || 'Recientemente'
          });
        });
      }
    } catch (error) {
      console.error('Error getting recent assessors:', error);
    }    // Obtener últimos clientes registrados
    try {
      const customers = await getCustomers();
      if (Array.isArray(customers) && customers.length > 0) {
        // Tomar los últimos 2 clientes
        const recentCustomers = customers.slice(-2);
        recentCustomers.forEach(customer => {
          activities.push({
            type: 'customer',
            icon: '👤',
            title: 'Nuevo cliente registrado',
            description: `${customer.name || ''} ${customer.lastName || ''}`.trim() || 'Cliente sin nombre',
            timestamp: customer.recordDate || 'Recientemente'
          });
        });
      }
    } catch (error) {
      console.error('Error getting recent customers:', error);
    }

    // Obtener últimos vehículos registrados
    try {
      const vehicles = await getAllVehicles();
      if (Array.isArray(vehicles) && vehicles.length > 0) {
        // Tomar los últimos 2 vehículos
        const recentVehicles = vehicles.slice(-2);
        recentVehicles.forEach(vehicle => {
          activities.push({
            type: 'vehicle',
            icon: '🚗',
            title: 'Nuevo vehículo registrado',
            description: `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Vehículo sin descripción',
            timestamp: vehicle.createdAt || 'Recientemente'
          });
        });
      }
    } catch (error) {
      console.error('Error getting recent vehicles:', error);
    }

    // Si no hay actividades reales, mostrar actividades de ejemplo
    if (activities.length === 0) {
      activities.push(
        {
          type: 'system',
          icon: '⚙️',
          title: 'Sistema inicializado',
          description: 'El dashboard está listo para mostrar datos',
          timestamp: 'Ahora'
        },
        {
          type: 'info',
          icon: 'ℹ️',
          title: 'Información',
          description: 'Agregue datos al sistema para ver actividad reciente',
          timestamp: 'Ahora'
        }
      );
    }

    // Ordenar por timestamp más reciente (limitado a 5 actividades)
    return activities.slice(0, 5);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [
      {
        type: 'error',
        icon: '❌',
        title: 'Error al cargar actividades',
        description: 'No se pudo cargar la actividad reciente',
        timestamp: 'Ahora'
      }
    ];
  }
};

// Formatear timestamp para mostrar
export const formatTimestamp = (timestamp) => {
  if (!timestamp || timestamp === 'Recientemente' || timestamp === 'Ahora') {
    return timestamp;
  }

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString('es-ES');
  } catch (error) {
    return 'Fecha inválida'+error;
  }
};

export default {
  getDashboardStats,
  getRecentActivity,
  formatTimestamp
};