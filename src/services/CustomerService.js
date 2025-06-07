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
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(customer)
    });
    if (!res.ok) throw new Error('Error al actualizar cliente');
    return res.json();
};

export const deleteCustomer = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar cliente');
    return res.ok;
};
