// Servicio para consumir la API de clientes
const API_URL = 'http://localhost:8080/customer';

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('Token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const getCustomers = async () => {
    const res = await fetch(API_URL, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener clientes');
    return res.json();
};

export const getCustomerById = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener cliente');
    return res.json();
};

export const createCustomer = async (customer) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(customer)
    });
    if (!res.ok) throw new Error('Error al crear cliente');
    return res.json();
};

export const updateCustomer = async (id, customer) => {
    console.log('CustomerService - updateCustomer llamado con:', { id, customer });
    
    // Transformar los datos al formato que espera el backend Java
    const transformedData = {
        name: customer.name,
        lastName: customer.lastName,
        genderType: customer.genderType, // Ya está en español: Masculino, Femenino, Otro
        identificationType: transformIdentificationType(customer.identificationType),
        identificationNumber: customer.identificationNumber,
        nationality: customer.nationality,
        email: customer.email,
        phone: customer.phone,
        license: customer.license
    };
    
    // Solo incluir contraseña si se proporcionó y no está vacía
    if (customer.password && customer.password.trim() !== '') {
        transformedData.password = customer.password;
        console.log('CustomerService - Contraseña incluida en la actualización');
    } else {
        console.log('CustomerService - Contraseña NO incluida, se mantendrá la actual');
    }
    
    console.log('CustomerService - Datos transformados para backend:', transformedData);
    
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(transformedData)
    });
    
    console.log('CustomerService - Response status:', res.status);
    console.log('CustomerService - Response ok:', res.ok);
    
    if (!res.ok) {
        const errorText = await res.text();
        console.error('CustomerService - Error response:', errorText);
        throw new Error(`Error al actualizar cliente: ${res.status} - ${errorText}`);
    }
    
    const result = await res.json();
    console.log('CustomerService - Update result:', result);
    return result;
};

// Función para transformar el tipo de identificación al formato del backend
const transformIdentificationType = (frontendType) => {
    const typeMapping = {
        'CC': 'CEDULA_DE_CIUDADANIA',
        'CE': 'CEDULA_DE_EXTRANJERIA', 
        'PA': 'PASAPORTE',
        'TI': 'TARJETA_DE_IDENTIDAD'
    };
    return typeMapping[frontendType] || frontendType;
};

export const deleteCustomer = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar cliente');
    return res.ok;
};
