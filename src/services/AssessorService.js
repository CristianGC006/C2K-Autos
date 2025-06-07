// AssessorService.js - Servicio para gestión de asesores comerciales
const API_BASE_URL = 'http://localhost:8080/assessor';

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

// Función auxiliar para validar datos de asesor
export const validateAssessorData = (assessorData) => {
  const errors = [];
  
  if (!assessorData.firstName?.trim()) {
    errors.push('El nombre es obligatorio');
  }
  
  if (!assessorData.lastName?.trim()) {
    errors.push('El apellido es obligatorio');
  }
  
  if (!assessorData.email?.trim()) {
    errors.push('El email es obligatorio');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(assessorData.email)) {
    errors.push('El email no tiene un formato válido');
  }
  
  if (!assessorData.phone?.trim()) {
    errors.push('El teléfono es obligatorio');
  } else if (!/^\d{10}$/.test(assessorData.phone.replace(/\D/g, ''))) {
    errors.push('El teléfono debe tener 10 dígitos');
  }
  
  if (!assessorData.employeeId?.trim()) {
    errors.push('El ID de empleado es obligatorio');
  }
  
  if (!assessorData.department?.trim()) {
    errors.push('El departamento es obligatorio');
  }
  
  if (!assessorData.hireDate) {
    errors.push('La fecha de contratación es obligatoria');
  }
  
  if (assessorData.salary && (isNaN(assessorData.salary) || assessorData.salary < 0)) {
    errors.push('El salario debe ser un número válido');
  }
  
  return errors;
};

// Función auxiliar para formatear datos de asesor
export const formatAssessorData = (assessorData) => {
  return {
    ...assessorData,
    firstName: assessorData.firstName?.trim(),
    lastName: assessorData.lastName?.trim(),
    email: assessorData.email?.trim().toLowerCase(),
    phone: assessorData.phone?.replace(/\D/g, ''),
    employeeId: assessorData.employeeId?.trim().toUpperCase(),
    department: assessorData.department?.trim(),
    position: assessorData.position?.trim() || 'Asesor Comercial',
    salary: assessorData.salary ? parseFloat(assessorData.salary) : null,
    isActive: assessorData.isActive !== undefined ? assessorData.isActive : true,
    hireDate: assessorData.hireDate
  };
};

// ========== OPERACIONES CRUD ==========

// Obtener todos los asesores
export const getAllAssessors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/all`, {
      method: 'GET',
      headers: defaultHeaders,
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching assessors:', error);
    throw new Error('Error al cargar los asesores. Verifique la conexión con el servidor.');
  }
};

// Obtener asesor por ID
export const getAssessorById = async (assessorId) => {
  try {
    if (!assessorId) {
      throw new Error('ID de asesor requerido');
    }
    
    const response = await fetch(`${API_BASE_URL}/${assessorId}`, {
      method: 'GET',
      headers: defaultHeaders,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching assessor:', error);
    throw new Error(`Error al cargar el asesor con ID ${assessorId}`);
  }
};

// Crear nuevo asesor
export const createAssessor = async (assessorData) => {
  try {
    // Validar datos
    const validationErrors = validateAssessorData(assessorData);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }
    
    // Formatear datos
    const formattedData = formatAssessorData(assessorData);
    
    const response = await fetch(`${API_BASE_URL}/save`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(formattedData),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating assessor:', error);
    throw new Error(error.message || 'Error al crear el asesor');
  }
};

// Actualizar asesor existente
export const updateAssessor = async (assessorId, assessorData) => {
  try {
    if (!assessorId) {
      throw new Error('ID de asesor requerido para actualizar');
    }
    
    // Validar datos
    const validationErrors = validateAssessorData(assessorData);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }
    
    // Formatear datos
    const formattedData = formatAssessorData({
      ...assessorData,
      assessorId: assessorId
    });
    
    const response = await fetch(`${API_BASE_URL}/update/${assessorId}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(formattedData),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating assessor:', error);
    throw new Error(error.message || 'Error al actualizar el asesor');
  }
};

// Eliminar/Desactivar asesor
export const deleteAssessor = async (assessorId) => {
  try {
    if (!assessorId) {
      throw new Error('ID de asesor requerido para eliminar');
    }
    
    const response = await fetch(`${API_BASE_URL}/delete/${assessorId}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting assessor:', error);
    throw new Error(`Error al desactivar el asesor con ID ${assessorId}`);
  }
};

// ========== FUNCIONES AUXILIARES ==========

// Buscar asesores por criterio
export const searchAssessors = async (searchTerm) => {
  try {
    const allAssessors = await getAllAssessors();
    
    if (!searchTerm) return allAssessors;
    
    const term = searchTerm.toLowerCase();
    return allAssessors.filter(assessor => 
      assessor.firstName?.toLowerCase().includes(term) ||
      assessor.lastName?.toLowerCase().includes(term) ||
      assessor.email?.toLowerCase().includes(term) ||
      assessor.employeeId?.toLowerCase().includes(term) ||
      assessor.department?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching assessors:', error);
    throw new Error('Error al buscar asesores');
  }
};

// Obtener asesores por departamento
export const getAssessorsByDepartment = async (department) => {
  try {
    const allAssessors = await getAllAssessors();
    return allAssessors.filter(assessor => 
      assessor.department?.toLowerCase() === department?.toLowerCase()
    );
  } catch (error) {
    console.error('Error filtering assessors by department:', error);
    throw new Error('Error al filtrar asesores por departamento');
  }
};

// Obtener estadísticas de asesores
export const getAssessorStats = async () => {
  try {
    const assessors = await getAllAssessors();
    
    const totalAssessors = assessors.length;
    const activeAssessors = assessors.filter(a => a.isActive !== false).length;
    const departments = [...new Set(assessors.map(a => a.department))].filter(Boolean);
    const averageSalary = assessors.length > 0 
      ? assessors.reduce((sum, a) => sum + (a.salary || 0), 0) / assessors.filter(a => a.salary).length
      : 0;
    
    return {
      totalAssessors,
      activeAssessors,
      inactiveAssessors: totalAssessors - activeAssessors,
      departments: departments.length,
      averageSalary: Math.round(averageSalary)
    };
  } catch (error) {
    console.error('Error getting assessor stats:', error);
    return {
      totalAssessors: 0,
      activeAssessors: 0,
      inactiveAssessors: 0,
      departments: 0,
      averageSalary: 0
    };
  }
};

export default {
  getAllAssessors,
  getAssessorById,
  createAssessor,
  updateAssessor,
  deleteAssessor,
  searchAssessors,
  getAssessorsByDepartment,
  getAssessorStats,
  validateAssessorData,
  formatAssessorData
};
