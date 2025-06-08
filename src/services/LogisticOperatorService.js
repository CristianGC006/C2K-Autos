// Servicio para consumir la API de operadores logísticos
const API_URL = 'http://localhost:8080/logisticOperator';

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('Token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const getAllLogisticOperators = async () => {
    const res = await fetch(API_URL, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener operadores logísticos');
    return res.json();
};

export const getLogisticOperatorById = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener operador logístico');
    return res.json();
};

export const createLogisticOperator = async (operator) => {
    // Generar código automáticamente al crear el operador
    const generateLogisticOperatorCode = () => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `LOG-${timestamp}-${random}`.toUpperCase();
    };

    const operatorWithCode = {
        ...operator,
        logisticOperatorCode: generateLogisticOperatorCode()
    };
    
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(operatorWithCode)
    });
    if (!res.ok) throw new Error('Error al crear operador logístico');
    return res.json();
};

export const updateLogisticOperator = async (id, operator) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(operator)
    });
    if (!res.ok) throw new Error('Error al actualizar operador logístico');
    return res.json();
};

export const deleteLogisticOperator = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar operador logístico');
    return res.ok;
};

// Función auxiliar para validar datos de operador logístico
export const validateLogisticOperatorData = (operatorData) => {
    const errors = [];
    
    if (!operatorData.name?.trim()) {
        errors.push('El nombre es obligatorio');
    }
    
    if (!operatorData.email?.trim()) {
        errors.push('El email es obligatorio');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(operatorData.email)) {
        errors.push('El email no tiene un formato válido');
    }
    
    if (!operatorData.phone?.trim()) {
        errors.push('El teléfono es obligatorio');
    } else if (!/^\d{10}$/.test(operatorData.phone.replace(/\D/g, ''))) {
        errors.push('El teléfono debe tener 10 dígitos');
    }
    
    if (!operatorData.address?.trim()) {
        errors.push('La dirección es obligatoria');
    }
    
    if (!operatorData.serviceArea?.trim()) {
        errors.push('El área de servicio es obligatoria');
    }
    
    if (operatorData.password && operatorData.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Función para verificar si un email ya existe
export const checkEmailExists = async (email, excludeId = null) => {
    try {
        const operators = await getAllLogisticOperators();
        return operators.some(operator => 
            operator.email.toLowerCase() === email.toLowerCase() && 
            operator.idLogisticOperator !== excludeId
        );
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
};

// Función para buscar operadores logísticos
export const searchLogisticOperators = async (searchTerm) => {
    try {
        const operators = await getAllLogisticOperators();
        if (!searchTerm) return operators;

        const term = searchTerm.toLowerCase();
        return operators.filter(operator =>
            operator.name.toLowerCase().includes(term) ||
            operator.email.toLowerCase().includes(term) ||
            operator.phone.includes(term) ||
            operator.address.toLowerCase().includes(term) ||
            (operator.logisticOperatorCode && operator.logisticOperatorCode.toLowerCase().includes(term)) ||
            getServiceAreaLabel(operator.serviceArea).toLowerCase().includes(term)
        );
    } catch (error) {
        console.error('Error searching operators:', error);
        throw error;
    }
};

// Función para obtener estadísticas de operadores
export const getLogisticOperatorStats = async () => {
    try {
        const operators = await getAllLogisticOperators();
        const serviceAreaCount = {};
        
        operators.forEach(operator => {
            const area = operator.serviceArea;
            serviceAreaCount[area] = (serviceAreaCount[area] || 0) + 1;
        });

        return {
            total: operators.length,
            byServiceArea: serviceAreaCount
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        throw error;
    }
};

// Función para obtener etiqueta del área de servicio
export const getServiceAreaLabel = (serviceArea) => {
    const labels = {
        'TRANSPORTE': 'Transporte',
        'LAVADO': 'Lavado',
        'REPARACION': 'Reparación',
        'ALMACENAMIENTO': 'Almacenamiento',
        'INSPECCION': 'Inspección',
        'OTROS': 'Otros'
    };
    return labels[serviceArea] || serviceArea;
};

// Función para obtener todas las áreas de servicio
export const getServiceAreas = () => {
    return [
        { value: 'TRANSPORTE', label: 'Transporte' },
        { value: 'LAVADO', label: 'Lavado' },
        { value: 'REPARACION', label: 'Reparación' },
        { value: 'ALMACENAMIENTO', label: 'Almacenamiento' },
        { value: 'INSPECCION', label: 'Inspección' },
        { value: 'OTROS', label: 'Otros' }
    ];
};

// Función para obtener icono del área de servicio
export const getServiceAreaIcon = (serviceArea) => {
    const icons = {
        'TRANSPORTE': '🚛',
        'LAVADO': '🧽',
        'REPARACION': '🔧',
        'ALMACENAMIENTO': '📦',
        'INSPECCION': '🔍',
        'OTROS': '⚙️'
    };
    return icons[serviceArea] || '⚙️';
};
