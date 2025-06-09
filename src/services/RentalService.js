// Servicio para consumir la API de rentas
const API_URL = 'http://localhost:8080/rental';
const CUSTOMER_API_URL = 'http://localhost:8080/customer';
const VEHICLE_API_URL = 'http://localhost:8080/vehicle';

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('Token');
    const headers = {};
    
    // Solo agregar Authorization si existe token
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // NO establecer Content-Type aquí - se agregará automáticamente por fetch cuando se envía JSON
    return headers;
};





// Función para extraer información del vehículo de la descripción
const extractVehicleInfoFromDescription = (description, name) => {
    // Extraer marca y modelo del nombre o descripción
    const vehicleInfo = {
        brand: '',
        model: '',
        plate: ''
    };
    
    // Intentar extraer la placa de la descripción
    const plateMatch = description?.match(/Placa:\s*([A-Z0-9-]+)/i);
    if (plateMatch) {
        vehicleInfo.plate = plateMatch[1];
    }
    
    // Si el nombre contiene marca y modelo, extraerlos
    if (name) {
        // Limpiar el nombre removiendo "Alquiler" si está presente
        const cleanName = name.replace(/^Alquiler\s+/i, '').trim();
        
        // Marcas conocidas para mejor identificación
        const knownBrands = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Mercedes', 'BMW', 'Audi', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volkswagen', 'Porsche', 'Ferrari', 'Lamborghini', 'Bentley', 'Rolls-Royce', 'Maserati', 'Bugatti', 'McLaren', 'Dodge', 'Jeep', 'Cadillac', 'Buick', 'GMC', 'Lincoln', 'Infiniti', 'Acura', 'Lexus'];
        
        // Buscar marca conocida en el nombre
        const foundBrand = knownBrands.find(brand => 
            cleanName.toLowerCase().includes(brand.toLowerCase())
        );
        
        if (foundBrand) {
            vehicleInfo.brand = foundBrand;
            // El modelo sería el resto después de la marca
            const brandIndex = cleanName.toLowerCase().indexOf(foundBrand.toLowerCase());
            const afterBrand = cleanName.substring(brandIndex + foundBrand.length).trim();
            vehicleInfo.model = afterBrand || cleanName;
        } else {
            // Si no se encuentra marca conocida, usar el primer palabra como marca
            const nameParts = cleanName.split(' ');
            if (nameParts.length >= 2) {
                vehicleInfo.brand = nameParts[0];
                vehicleInfo.model = nameParts.slice(1).join(' ');
            } else {
                vehicleInfo.model = cleanName;
            }
        }
    }
    
    // También intentar extraer información de la descripción
    if (description && !vehicleInfo.brand) {
        // Buscar patrones como "Toyota Camry" en la descripción
        const vehicleMatch = description.match(/vehÃ­culo\s+([A-Za-z]+)\s+([A-Za-z0-9\s]+)/i);
        if (vehicleMatch) {
            vehicleInfo.brand = vehicleMatch[1];
            vehicleInfo.model = vehicleMatch[2].split(' ')[0]; // Tomar solo la primera palabra del modelo
        }
    }
    
    return vehicleInfo;
};

// Función para enriquecer datos de renta con información básica
const enrichRentalData = async (rental) => {
    try {
        console.log('Procesando datos básicos de renta:', rental);
        
        // Extraer información del vehículo de la descripción de manera simple
        const vehicleInfo = extractVehicleInfoFromDescription(rental.description, rental.name);
        console.log('Información extraída del vehículo:', vehicleInfo);
        
        // Mapear el status de la API al formato esperado por el frontend
        const statusMapping = {
            'PENDING': 'PENDIENTE',
            'ACTIVE': 'ACTIVA',
            'COMPLETED': 'COMPLETADA',
            'CANCELLED': 'CANCELADA',
            'OVERDUE': 'RETRASADA'
        };
        
        const enrichedRental = {
            id: rental.idRental,
            customerId: null,
            customerName: `Cliente (ID: ${rental.idRental})`,
            customerEmail: null,
            customerDocument: null,
            vehicleId: null,
            vehicleBrand: vehicleInfo.brand || rental.name?.split(' ')[0] || 'Marca',
            vehicleModel: vehicleInfo.model || rental.name?.split(' ').slice(1).join(' ') || 'Modelo',
            vehiclePlate: vehicleInfo.plate || 'Placa no disponible',
            startDate: rental.startDate,
            endDate: rental.endDate,
            totalCost: rental.price || 0,
            status: statusMapping[rental.status] || rental.status || 'PENDIENTE',
            // Campos adicionales para compatibilidad
            name: rental.name,
            description: rental.description,
            price: rental.price,
            inspections: rental.inspections || [],
            payment: rental.payment
        };
        
        console.log('Datos procesados:', enrichedRental);
        return enrichedRental;
        
    } catch (error) {
        console.error('Error al procesar datos de renta:', error);
        // Retornar datos mínimos en caso de error
        return {
            id: rental.idRental,
            customerId: null,
            customerName: `Cliente (ID: ${rental.idRental})`,
            customerEmail: null,
            customerDocument: null,
            vehicleId: null,
            vehicleBrand: rental.name?.split(' ')[0] || 'Vehículo',
            vehicleModel: rental.name?.split(' ').slice(1).join(' ') || 'Modelo',
            vehiclePlate: 'N/A',
            startDate: rental.startDate,
            endDate: rental.endDate,
            totalCost: rental.price || 0,
            status: rental.status || 'PENDIENTE',
            name: rental.name,
            description: rental.description,
            price: rental.price,
            inspections: rental.inspections || [],
            payment: rental.payment
        };
    }
};

// Obtener todas las rentas
export const getRentals = async () => {
    try {
        const res = await fetch(API_URL, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener rentas');
        
        const rawRentals = await res.json();
        console.log('RentalService - Datos crudos de la API:', rawRentals);
        
        // Enriquecer cada renta con información completa
        const enrichedRentals = await Promise.all(
            rawRentals.map(rental => enrichRentalData(rental))
        );
        
        console.log('RentalService - Datos enriquecidos:', enrichedRentals);
        return enrichedRentals;
    } catch (error) {
        console.error('RentalService - Error al obtener rentas:', error);
        throw error;
    }
};

// Obtener renta por ID
export const getRentalById = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener renta');
        
        const rawRental = await res.json();
        console.log('RentalService - Datos crudos de renta por ID:', rawRental);
        
        // Enriquecer la renta con información completa
        const enrichedRental = await enrichRentalData(rawRental);
        
        console.log('RentalService - Datos enriquecidos de renta:', enrichedRental);
        return enrichedRental;
    } catch (error) {
        console.error('RentalService - Error al obtener renta por ID:', error);
        throw error;
    }
};

// Crear nueva renta
export const createRental = async (rental) => {
    try {
        console.log('RentalService - createRental llamado con:', rental);
        
        const headers = {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        };
        
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(rental)
        });
        
        console.log('RentalService - Response status:', res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('RentalService - Error response:', errorText);
            throw new Error(`Error al crear renta: ${res.status} - ${errorText}`);
        }
        
        const result = await res.json();
        console.log('RentalService - Create result:', result);
        return result;
    } catch (error) {
        console.error('RentalService - Error al crear renta:', error);
        throw error;
    }
};

// Actualizar renta
export const updateRental = async (id, rental) => {
    try {
        console.log('RentalService - updateRental llamado con:', { id, rental });
        
        const headers = {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        };
        
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(rental)
        });
        
        console.log('RentalService - Response status:', res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('RentalService - Error response:', errorText);
            throw new Error(`Error al actualizar renta: ${res.status} - ${errorText}`);
        }
        
        const result = await res.json();
        console.log('RentalService - Update result:', result);
        return result;
    } catch (error) {
        console.error('RentalService - Error al actualizar renta:', error);
        throw error;
    }
};

// Eliminar renta
export const deleteRental = async (id) => {
    try {
        console.log('RentalService - deleteRental llamado con ID:', id);
        
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        console.log('RentalService - Delete response status:', res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('RentalService - Error response:', errorText);
            throw new Error(`Error al eliminar renta: ${res.status} - ${errorText}`);
        }
        
        return res.ok;
    } catch (error) {
        console.error('RentalService - Error al eliminar renta:', error);
        throw error;
    }
};

// Obtener rentas por cliente
export const getRentalsByCustomer = async (customerId) => {
    try {
        const res = await fetch(`${API_URL}/customer/${customerId}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener rentas del cliente');
        return res.json();
    } catch (error) {
        console.error('RentalService - Error al obtener rentas del cliente:', error);
        throw error;
    }
};

// Obtener rentas por vehículo
export const getRentalsByVehicle = async (vehicleId) => {
    try {
        const res = await fetch(`${API_URL}/vehicle/${vehicleId}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener rentas del vehículo');
        return res.json();
    } catch (error) {
        console.error('RentalService - Error al obtener rentas del vehículo:', error);
        throw error;
    }
};

// Obtener estadísticas de rentas
export const getRentalStats = async () => {
    try {
        const res = await fetch(`${API_URL}/stats`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener estadísticas de rentas');
        return res.json();
    } catch (error) {
        console.error('RentalService - Error al obtener estadísticas:', error);
        throw error;
    }
};

// Estados de renta disponibles
export const getRentalStatuses = () => [
    'PENDIENTE',
    'ACTIVA',
    'COMPLETADA',
    'CANCELADA',
    'RETRASADA'
];

// Validaciones para rentas
export const validateRentalData = (rental) => {
    const errors = {};
    
    if (!rental.customerId) {
        errors.customerId = 'El cliente es requerido';
    }
    
    if (!rental.vehicleId) {
        errors.vehicleId = 'El vehículo es requerido';
    }
    
    if (!rental.startDate) {
        errors.startDate = 'La fecha de inicio es requerida';
    }
    
    if (!rental.endDate) {
        errors.endDate = 'La fecha de fin es requerida';
    }
    
    if (rental.startDate && rental.endDate) {
        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate);
        
        if (end <= start) {
            errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
    }
    
    if (!rental.totalCost || rental.totalCost <= 0) {
        errors.totalCost = 'El costo total debe ser mayor a 0';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
