// Servicio para consumir la API de sucursales
const API_URL = 'http://localhost:8080/branch';

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('Token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Obtener todas las sucursales
export const getBranches = async () => {
    try {
        console.log('BranchService - Obteniendo todas las sucursales');
        const res = await fetch(API_URL, {
            headers: getAuthHeaders()
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('BranchService - Error response:', errorText);
            throw new Error(`Error al obtener sucursales: ${res.status} - ${errorText}`);
        }
        
        const branches = await res.json();
        console.log('BranchService - Sucursales obtenidas:', branches);
        return branches;
    } catch (error) {
        console.error('BranchService - Error al obtener sucursales:', error);
        throw error;
    }
};

// Obtener sucursal por ID
export const getBranchById = async (id) => {
    try {
        console.log('BranchService - Obteniendo sucursal por ID:', id);
        const res = await fetch(`${API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('BranchService - Error response:', errorText);
            throw new Error(`Error al obtener sucursal: ${res.status} - ${errorText}`);
        }
        
        const branch = await res.json();
        console.log('BranchService - Sucursal obtenida:', branch);
        return branch;
    } catch (error) {
        console.error('BranchService - Error al obtener sucursal por ID:', error);
        throw error;
    }
};

// Crear nueva sucursal
export const createBranch = async (branchData) => {
    try {
        console.log('BranchService - Creando sucursal:', branchData);
        
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(branchData)
        });
        
        console.log('BranchService - Response status:', res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('BranchService - Error response:', errorText);
            throw new Error(`Error al crear sucursal: ${res.status} - ${errorText}`);
        }
        
        const result = await res.json();
        console.log('BranchService - Sucursal creada:', result);
        return result;
    } catch (error) {
        console.error('BranchService - Error al crear sucursal:', error);
        throw error;
    }
};

// Actualizar sucursal
export const updateBranch = async (id, branchData) => {
    try {
        console.log('BranchService - Actualizando sucursal:', { id, branchData });
        
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(branchData)
        });
        
        console.log('BranchService - Response status:', res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('BranchService - Error response:', errorText);
            throw new Error(`Error al actualizar sucursal: ${res.status} - ${errorText}`);
        }
        
        const result = await res.json();
        console.log('BranchService - Sucursal actualizada:', result);
        return result;
    } catch (error) {
        console.error('BranchService - Error al actualizar sucursal:', error);
        throw error;
    }
};

// Eliminar sucursal
export const deleteBranch = async (id) => {
    try {
        console.log('BranchService - Eliminando sucursal con ID:', id);
        
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        console.log('BranchService - Delete response status:', res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('BranchService - Error response:', errorText);
            throw new Error(`Error al eliminar sucursal: ${res.status} - ${errorText}`);
        }
        
        return true;
    } catch (error) {
        console.error('BranchService - Error al eliminar sucursal:', error);
        throw error;
    }
};

// Estados de sucursal disponibles
export const getBranchStatuses = () => [
    'ACTIVA',
    'INACTIVA',
    'MANTENIMIENTO'
];

// Validaciones para sucursales
export const validateBranchData = (branch) => {
    const errors = {};
    
    if (!branch.name || branch.name.trim() === '') {
        errors.name = 'El nombre de la sucursal es requerido';
    }
    
    if (!branch.address || branch.address.trim() === '') {
        errors.address = 'La dirección es requerida';
    }
    
    if (!branch.phone || branch.phone.trim() === '') {
        errors.phone = 'El teléfono es requerido';    } else if (!/^\d{7,15}$/.test(branch.phone.replace(/[\s\-()]/g, ''))) {
        errors.phone = 'El teléfono debe tener entre 7 y 15 dígitos';
    }
    
    if (!branch.schedule || branch.schedule.trim() === '') {
        errors.schedule = 'El horario es requerido';
    }
    
    if (!branch.status || branch.status.trim() === '') {
        errors.status = 'El estado es requerido';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Función para formatear horario
export const formatSchedule = (schedule) => {
    if (!schedule) return 'Horario no disponible';
    return schedule;
};

// Función para obtener el color del badge según el estado
export const getStatusBadgeColor = (status) => {
    switch (status) {
        case 'ACTIVA':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'INACTIVA':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'MANTENIMIENTO':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};
