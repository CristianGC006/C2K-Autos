// Servicio para estadísticas de rentas por cliente
const API_URL = 'http://localhost:8080/rental';

/**
 * Obtener la cantidad de vehículos alquilados por un cliente
 * @param {number} customerId - ID del cliente
 * @returns {Promise<number>} Número de vehículos activos rentados
 */
export const getCustomerRentalsCount = async (customerId) => {
    try {
        console.log(`Obteniendo conteo de rentas para cliente ${customerId}...`);
        
        const response = await fetch(`${API_URL}/customer/${customerId}/count`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('No se encontraron alquileres para el cliente');
                return 0;
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const count = await response.json();
        console.log('Conteo de rentas obtenido:', count);
        
        // El backend devuelve directamente un número entero
        return typeof count === 'number' ? count : 0;
    } catch (error) {
        console.error('Error al obtener conteo de rentas del cliente:', error);
        return 0; // Devolver 0 en lugar de lanzar error para no romper la UI
    }
};

/**
 * Obtener estadísticas detalladas de un cliente
 * @param {number} customerId - ID del cliente
 * @returns {Promise<Object>} Objeto con estadísticas completas
 */
export const getCustomerRentalStats = async (customerId) => {
    try {
        console.log(`Obteniendo estadísticas detalladas para cliente ${customerId}...`);
        
        const response = await fetch(`${API_URL}/customer/${customerId}/stats`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('No se encontraron estadísticas para el cliente');
                return {
                    activeVehicles: 0,
                    totalRentals: 0,
                    completedRentals: 0,
                    totalSpent: 0
                };
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Estadísticas detalladas obtenidas:', data);
        
        // El backend devuelve un Map con las claves exactas que necesitamos
        return {
            activeVehicles: data.activeVehicles || 0,
            totalRentals: data.totalRentals || 0,
            completedRentals: data.completedRentals || 0,
            totalSpent: data.totalSpent || 0
        };
    } catch (error) {
        console.error('Error al obtener estadísticas del cliente:', error);
        // Devolver valores por defecto en lugar de lanzar error
        return {
            activeVehicles: 0,
            totalRentals: 0,
            completedRentals: 0,
            totalSpent: 0
        };
    }
};

/**
 * Obtener rentas activas de un cliente
 * @param {number} customerId - ID del cliente
 * @returns {Promise<Array>} Array de rentas activas
 */
export const getActiveCustomerRentals = async (customerId) => {
    try {
        console.log(`Obteniendo rentas activas para cliente ${customerId}...`);
        
        const response = await fetch(`${API_URL}/customer/${customerId}/active`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('No se encontraron rentas activas para el cliente');
                return [];
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Rentas activas obtenidas:', data);
        
        // Normalizar datos si es necesario
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error al obtener rentas activas del cliente:', error);
        // Retornar array vacío en caso de error para evitar que se rompa la UI
        return [];
    }
};

/**
 * Obtener resumen rápido para mostrar en UI
 * @param {number} customerId - ID del cliente
 * @returns {Promise<Object>} Resumen básico para UI
 */
export const getCustomerQuickStats = async (customerId) => {
    try {
        const stats = await getCustomerRentalStats(customerId);
        
        return {
            activeVehicles: stats.activeVehicles,
            hasActiveRentals: stats.activeVehicles > 0,
            totalRentals: stats.totalRentals,
            statusSummary: `${stats.activeVehicles} activos, ${stats.completedRentals} completados`
        };
    } catch (error) {
        console.error('Error al obtener resumen rápido del cliente:', error);
        return {
            activeVehicles: 0,
            hasActiveRentals: false,
            totalRentals: 0,
            statusSummary: 'No disponible'
        };
    }
};

/**
 * Validar si un cliente puede alquilar más vehículos
 * @param {number} customerId - ID del cliente
 * @param {number} maxActiveRentals - Máximo de rentas activas permitidas (default: 3)
 * @returns {Promise<Object>} Resultado de validación
 */
export const validateCustomerCanRent = async (customerId, maxActiveRentals = 3) => {
    try {
        const count = await getCustomerRentalsCount(customerId);
        
        const canRent = count < maxActiveRentals;
        
        return {
            canRent,
            currentActive: count,
            maxAllowed: maxActiveRentals,
            remainingSlots: maxActiveRentals - count,
            message: canRent 
                ? `Puede alquilar ${maxActiveRentals - count} vehículo(s) más`
                : `Ha alcanzado el límite de ${maxActiveRentals} vehículos activos`
        };
    } catch (error) {
        console.error('Error al validar capacidad de alquiler del cliente:', error);
        return {
            canRent: false,
            currentActive: 0,
            maxAllowed: maxActiveRentals,
            remainingSlots: 0,
            message: 'Error al validar capacidad de alquiler'
        };
    }
};

// Exportar todas las funciones
export default {
    getCustomerRentalsCount,
    getCustomerRentalStats,
    getActiveCustomerRentals,
    getCustomerQuickStats,
    validateCustomerCanRent
};
