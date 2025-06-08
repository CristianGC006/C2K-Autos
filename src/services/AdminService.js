// AdminService.js - Servicio para gestión de administradores
const API_BASE_URL = 'http://localhost:8080/admin';

// Configuración de headers por defecto
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Función auxiliar para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
};

// ========== FUNCIONES DE VALIDACIÓN ==========

// Función auxiliar para validar datos de administrador
export const validateAdminData = (adminData, isUpdate = false) => {
  const errors = [];
  
  if (!adminData.name?.trim()) {
    errors.push('El nombre es obligatorio');
  }
  
  if (!adminData.email?.trim()) {
    errors.push('El email es obligatorio');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email)) {
    errors.push('El email no tiene un formato válido');
  }
  
  if (!adminData.phone?.trim()) {
    errors.push('El teléfono es obligatorio');
  } else if (!/^\d{10}$/.test(adminData.phone.replace(/\D/g, ''))) {
    errors.push('El teléfono debe tener 10 dígitos');
  }
  
  if (!adminData.documentNumber?.trim()) {
    errors.push('El número de documento es obligatorio');
  }
  
  if (!adminData.identificationType?.trim()) {
    errors.push('El tipo de identificación es obligatorio');
  }
  
  // Solo validar contraseña como obligatoria para nuevos administradores
  if (!isUpdate) {
    if (!adminData.password?.trim()) {
      errors.push('La contraseña es obligatoria');
    } else if (adminData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
  } else {
    // Para actualizaciones, solo validar si se proporciona una contraseña
    if (adminData.password && adminData.password.trim() && adminData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
  }
  
  if (!adminData.adminCode?.trim()) {
    errors.push('El código de administrador es obligatorio');
  }
  
  return errors;
};

// Función para formatear datos del administrador antes de enviar
export const formatAdminData = (adminData) => {
  return {
    idAdmin: adminData.idAdmin || null,
    name: adminData.name?.trim(),
    email: adminData.email?.trim().toLowerCase(),
    phone: adminData.phone?.trim(),
    password: adminData.password,
    documentNumber: adminData.documentNumber?.trim(),
    identificationType: adminData.identificationType,
    adminCode: adminData.adminCode?.trim()
  };
};

// ========== OPERACIONES CRUD ==========

// Obtener todos los administradores
export const getAllAdmins = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: defaultHeaders,
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw new Error('Error al cargar los administradores. Verifique la conexión con el servidor.');
  }
};

// Obtener administrador por ID
export const getAdminById = async (adminId) => {
  try {
    if (!adminId) {
      throw new Error('ID de administrador requerido');
    }
    
    const response = await fetch(`${API_BASE_URL}/${adminId}`, {
      method: 'GET',
      headers: defaultHeaders,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching admin:', error);
    throw new Error(`Error al cargar el administrador con ID ${adminId}`);
  }
};

// Crear nuevo administrador
export const createAdmin = async (adminData) => {
  try {
    // Validar datos para creación (contraseña obligatoria)
    const validationErrors = validateAdminData(adminData, false);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }
    
    // Formatear datos
    const formattedData = formatAdminData(adminData);
    
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(formattedData),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating admin:', error);
    throw new Error(error.message || 'Error al crear el administrador');
  }
};

// Actualizar administrador existente
export const updateAdmin = async (adminId, adminData) => {
  try {
    if (!adminId) {
      throw new Error('ID de administrador requerido para actualizar');
    }
    
    // Validar datos usando la validación para actualizaciones
    const validationErrors = validateAdminData(adminData, true);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }
    
    // Formatear datos - excluir contraseña si está vacía
    const formattedData = formatAdminData({
      ...adminData,
      idAdmin: adminId
    });
    
    // No enviar contraseña vacía al backend
    if (!adminData.password || adminData.password.trim() === '') {
      delete formattedData.password;
    }
    
    const response = await fetch(`${API_BASE_URL}/${adminId}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(formattedData),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating admin:', error);
    throw new Error(error.message || 'Error al actualizar el administrador');
  }
};

// Eliminar/Desactivar administrador
export const deleteAdmin = async (adminId) => {
  try {
    if (!adminId) {
      throw new Error('ID de administrador requerido para eliminar');
    }
    
    const response = await fetch(`${API_BASE_URL}/${adminId}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw new Error(`Error al desactivar el administrador con ID ${adminId}`);
  }
};

// ========== FUNCIONES AUXILIARES ==========

// Buscar administradores por criterio
export const searchAdmins = async (searchTerm) => {
  try {
    const allAdmins = await getAllAdmins();
    
    if (!searchTerm) return allAdmins;
    
    const term = searchTerm.toLowerCase();
    return allAdmins.filter(admin => 
      admin.name?.toLowerCase().includes(term) ||
      admin.email?.toLowerCase().includes(term) ||
      admin.adminCode?.toLowerCase().includes(term) ||
      admin.documentNumber?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching admins:', error);
    throw new Error('Error al buscar administradores');
  }
};

// Obtener estadísticas de administradores
export const getAdminStats = async () => {
  try {
    const admins = await getAllAdmins();
    
    const totalAdmins = admins.length;
    const activeAdmins = admins.filter(a => a.isActive !== false).length;
    const identificationTypes = [...new Set(admins.map(a => a.identificationType))].filter(Boolean);
    
    return {
      totalAdmins,
      activeAdmins,
      inactiveAdmins: totalAdmins - activeAdmins,
      identificationTypes: identificationTypes.length
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return {
      totalAdmins: 0,
      activeAdmins: 0,
      inactiveAdmins: 0,
      identificationTypes: 0
    };
  }
};

// Verificar si un email ya existe
export const checkEmailExists = async (email, excludeId = null) => {
  try {
    const admins = await getAllAdmins();
    return admins.some(admin => 
      admin.email?.toLowerCase() === email.toLowerCase() && 
      admin.idAdmin !== excludeId
    );
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};

// Verificar si un adminCode ya existe
export const checkAdminCodeExists = async (adminCode, excludeId = null) => {
  try {
    const admins = await getAllAdmins();
    return admins.some(admin => 
      admin.adminCode === adminCode && 
      admin.idAdmin !== excludeId
    );
  } catch (error) {
    console.error('Error checking admin code:', error);
    return false;
  }
};

// Generar código de administrador único
export const generateAdminCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;
  
  while (exists) {
    code = 'ADM-';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    exists = await checkAdminCodeExists(code);
  }
  
  return code;
};

export default {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  searchAdmins,
  getAdminStats,
  checkEmailExists,
  checkAdminCodeExists,
  generateAdminCode,
  validateAdminData,
  formatAdminData
};
