// AssessorService.js - Servicio para gestión de asesores comerciales
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:8080/assessor';

// Configuración de headers por defecto
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Función auxiliar para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = `Error ${response.status}: ${errorText}`;
    
    // Mostrar alerta de error con SweetAlert2
    await Swal.fire({
      icon: 'error',
      title: 'Error de Conexión',
      text: `No se pudo completar la operación. ${errorMessage}`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#dc3545'
    });
    
    throw new Error(errorMessage);
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
  
  if (!assessorData.name?.trim()) {
    errors.push('El nombre es obligatorio');
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
    if (!assessorData.address?.trim()) {
    errors.push('La dirección es obligatoria');
  }
  
  // Validar sucursal - aceptar tanto branchId como branch object
  const branchId = assessorData.branchId || assessorData.branch?.idBranch;
  if (!branchId) {
    errors.push('La sucursal es obligatoria');
  }
  
  // Validar administrador - aceptar tanto adminId como admin object  
  const adminId = assessorData.adminId || assessorData.admin?.idAdmin;
  if (!adminId) {
    errors.push('El administrador es obligatorio');
  }
  
  // Solo validar contraseña para nuevos asesores
  if (!assessorData.idAssessor && !assessorData.password?.trim()) {
    errors.push('La contraseña es obligatoria');
  } else if (assessorData.password && assessorData.password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  return errors;
};

// Función auxiliar para formatear datos de asesor
export const formatAssessorData = (assessorData) => {
  console.log('Datos originales del asesor:', assessorData);
  
  const formattedData = {
    name: assessorData.name?.trim(),
    email: assessorData.email?.trim().toLowerCase(),
    phone: assessorData.phone?.replace(/\D/g, ''),
    address: assessorData.address?.trim()
  };

  // ✅ CORREGIDO: Solo incluir contraseña si se proporciona Y no está vacía
  // Si no se proporciona contraseña, el backend mantendrá la existente
  if (assessorData.password?.trim()) {
    formattedData.password = assessorData.password.trim();
    console.log('Contraseña incluida en la actualización');
  } else {
    console.log('Contraseña NO incluida - se mantendrá la existente');
    // NO incluir el campo password si está vacío para que el backend lo ignore
  }

  // Incluir ID si es una actualización
  if (assessorData.idAssessor) {
    formattedData.idAssessor = assessorData.idAssessor;
  }

  // Relaciones con otras entidades
  if (assessorData.branchId) {
    const branchId = parseInt(assessorData.branchId);
    if (!isNaN(branchId)) {
      formattedData.branch = { idBranch: branchId };
      console.log('Sucursal asignada:', formattedData.branch);
    }
  }

  if (assessorData.adminId) {
    const adminId = parseInt(assessorData.adminId);
    if (!isNaN(adminId)) {
      formattedData.admin = { idAdmin: adminId };
      console.log('Administrador asignado:', formattedData.admin);
    }
  }

  console.log('Datos formateados para enviar:', formattedData);
  return formattedData;
};

// ========== OPERACIONES CRUD ==========

// Función auxiliar para enriquecer datos de asesores con información de relaciones
export const enrichAssessorData = async (assessors, branches = [], admins = []) => {

  
  if (!Array.isArray(assessors)) {

    return [];
  }
  
  const enrichedAssessors = assessors.map((assessor, index) => {
    console.log(`\n  🔧 Procesando asesor ${index + 1}:`, assessor);
    
    // Crear una copia del asesor
    const enrichedAssessor = { ...assessor };
    
    // Verificar estructura del branch
    if (assessor.branch) {
      console.log(`    🏢 Branch original:`, assessor.branch);
      
      if (!assessor.branch.name && assessor.branch.idBranch) {
        console.log(`    🔍 Buscando sucursal con ID: ${assessor.branch.idBranch}`);
        
        // Buscar información completa de la sucursal
        const branchInfo = branches.find(b => {
          const match = (b.id && b.id === assessor.branch.idBranch) || 
                       (b.idBranch && b.idBranch === assessor.branch.idBranch);
          console.log(`      🔍 Comparando branch ${b.id || b.idBranch} con ${assessor.branch.idBranch}: ${match}`);
          return match;
        });
        
        if (branchInfo) {
          console.log(`    ✅ Sucursal encontrada:`, branchInfo);
          enrichedAssessor.branch = {
            ...assessor.branch,
            name: branchInfo.name,
            address: branchInfo.address,
            phone: branchInfo.phone
          };
        } else {
          console.log(`    ❌ No se encontró sucursal con ID: ${assessor.branch.idBranch}`);
        }
      } else {
        console.log(`    ✅ Branch ya tiene nombre:`, assessor.branch.name);
      }
    } else {
      console.log(`    ⚠️ Asesor no tiene branch asignado`);
    }
    
    // Verificar estructura del admin
    if (assessor.admin) {
      console.log(`    👤 Admin original:`, assessor.admin);
      
      if (!assessor.admin.name && assessor.admin.idAdmin) {
        console.log(`    🔍 Buscando administrador con ID: ${assessor.admin.idAdmin}`);
        
        // Buscar información completa del administrador
        const adminInfo = admins.find(a => {
          const match = (a.id && a.id === assessor.admin.idAdmin) || 
                       (a.idAdmin && a.idAdmin === assessor.admin.idAdmin);
          console.log(`      🔍 Comparando admin ${a.id || a.idAdmin} con ${assessor.admin.idAdmin}: ${match}`);
          return match;
        });
        
        if (adminInfo) {
          console.log(`    ✅ Administrador encontrado:`, adminInfo);
          enrichedAssessor.admin = {
            ...assessor.admin,
            name: adminInfo.name,
            email: adminInfo.email,
            adminCode: adminInfo.adminCode
          };
        } else {
          console.log(`    ❌ No se encontró administrador con ID: ${assessor.admin.idAdmin}`);
        }
      } else {
        console.log(`    ✅ Admin ya tiene nombre:`, assessor.admin.name);
      }
    } else {
      console.log(`    ⚠️ Asesor no tiene admin asignado`);
    }
    
    console.log(`    🎯 Asesor enriquecido final:`, enrichedAssessor);
    return enrichedAssessor;
  });
  
  console.log('✨ RESULTADO FINAL enrichedAssessors:', enrichedAssessors);
  return enrichedAssessors;
};

// Obtener todos los asesores
export const getAllAssessors = async () => {
  try {
    console.log('🔍 Obteniendo todos los asesores...');
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: defaultHeaders,
    });
    
    const data = await handleResponse(response);
    console.log('📊 Datos brutos recibidos del servidor:', data);
    
    const assessors = Array.isArray(data) ? data : [];
    console.log(`✅ Total de asesores obtenidos: ${assessors.length}`);
    
    // Verificar si necesitamos enriquecer los datos
    let needsEnrichment = false;
    if (assessors.length > 0) {
      const firstAssessor = assessors[0];
      console.log('📋 Estructura del primer asesor:', firstAssessor);
      
      if (firstAssessor.branch && !firstAssessor.branch.name) {
        console.log('⚠️ Las sucursales no tienen nombres - necesitan ser enriquecidas');
        needsEnrichment = true;
      }
      
      if (firstAssessor.admin && !firstAssessor.admin.name) {
        console.log('⚠️ Los administradores no tienen nombres - necesitan ser enriquecidos');
        needsEnrichment = true;
      }
    }
    
    // Si necesitamos enriquecer los datos, obtener cada asesor individualmente
    if (needsEnrichment && assessors.length > 0) {
      console.log('🔄 Obteniendo datos completos de cada asesor individualmente...');
      const enrichedAssessors = await Promise.all(
        assessors.map(async (assessor) => {
          try {
            if (assessor.idAssessor) {
              console.log(`🔍 Obteniendo detalles del asesor ID: ${assessor.idAssessor}`);
              const detailedAssessor = await getAssessorById(assessor.idAssessor);
              console.log(`✅ Detalles obtenidos para ${assessor.idAssessor}:`, detailedAssessor);
              return detailedAssessor;
            }
            return assessor;
          } catch (error) {
            console.error(`❌ Error obteniendo detalles del asesor ${assessor.idAssessor}:`, error);
            return assessor; // Devolver el asesor original si falla
          }
        })
      );
      console.log('🎯 Asesores enriquecidos:', enrichedAssessors);
      return enrichedAssessors;
    }
    
    return assessors;  } catch (error) {
    console.error('❌ Error fetching assessors:', error);
    
    // Mostrar alerta de error específica
    await Swal.fire({
      icon: 'error',
      title: 'Error al Cargar Asesores',
      text: 'No se pudieron cargar los asesores. Verifique la conexión con el servidor.',
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#007bff',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    });
    
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
    
    return await handleResponse(response);  } catch (error) {
    console.error('Error fetching assessor:', error);
    
    // Mostrar alerta de error específica
    await Swal.fire({
      icon: 'error',
      title: 'Error al Cargar Asesor',
      text: `No se pudo cargar el asesor con ID ${assessorId}. Verifique la conexión.`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#dc3545'
    });
    
    throw new Error(`Error al cargar el asesor con ID ${assessorId}`);
  }
};

// Crear nuevo asesor
export const createAssessor = async (assessorData) => {
  try {
    console.log('Creando nuevo asesor con datos:', assessorData);
    
    // Validar datos ANTES de formatear
    const validationErrors = validateAssessorData(assessorData);
    if (validationErrors.length > 0) {
      console.log('❌ Errores de validación:', validationErrors);
      throw new Error(validationErrors.join(', '));
    }
    
    // Formatear datos DESPUÉS de validar
    const formattedData = formatAssessorData(assessorData);
    
    console.log('Enviando POST a:', API_BASE_URL);
    console.log('Cuerpo de la petición:', JSON.stringify(formattedData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(formattedData),
    });
    
    const result = await handleResponse(response);
    console.log('Respuesta del servidor:', result);
    return result;  } catch (error) {
    console.error('Error creating assessor:', error);
    
    // Mostrar alerta de error específica para creación
    await Swal.fire({
      icon: 'error',
      title: 'Error al Crear Asesor',
      text: error.message || 'No se pudo crear el asesor. Verifique los datos ingresados.',
      confirmButtonText: 'Revisar Datos',
      confirmButtonColor: '#dc3545'
    });
    
    throw new Error(error.message || 'Error al crear el asesor');
  }
};

// Actualizar asesor existente
export const updateAssessor = async (assessorId, assessorData) => {
  try {
    if (!assessorId) {
      throw new Error('ID de asesor requerido para actualizar');
    }
    
    console.log(`Actualizando asesor con ID: ${assessorId}`);
    console.log('Datos recibidos para actualización:', assessorData);
    
    // Validar datos ANTES de formatear
    const validationErrors = validateAssessorData(assessorData);
    if (validationErrors.length > 0) {
      console.log('❌ Errores de validación:', validationErrors);
      throw new Error(validationErrors.join(', '));
    }
    
    // Formatear datos DESPUÉS de validar
    const formattedData = formatAssessorData({
      ...assessorData,
      idAssessor: assessorId
    });
    
    const response = await fetch(`${API_BASE_URL}/${assessorId}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(formattedData),
    });
    
    const result = await handleResponse(response);
    console.log('Respuesta del servidor:', result);
    return result;  } catch (error) {
    console.error('Error updating assessor:', error);
    
    // Mostrar alerta de error específica para actualización
    await Swal.fire({
      icon: 'error',
      title: 'Error al Actualizar Asesor',
      text: error.message || 'No se pudo actualizar el asesor. Verifique los datos ingresados.',
      confirmButtonText: 'Revisar Datos',
      confirmButtonColor: '#dc3545'
    });
    
    throw new Error(error.message || 'Error al actualizar el asesor');
  }
};

// Eliminar/Desactivar asesor
export const deleteAssessor = async (assessorId) => {
  try {
    if (!assessorId) {
      throw new Error('ID de asesor requerido para eliminar');
    }
    
    const response = await fetch(`${API_BASE_URL}/${assessorId}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    
    return await handleResponse(response);  } catch (error) {
    console.error('Error deleting assessor:', error);
    
    // Mostrar alerta de error específica para eliminación
    await Swal.fire({
      icon: 'error',
      title: 'Error al Eliminar Asesor',
      text: `No se pudo eliminar el asesor con ID ${assessorId}. Intente nuevamente.`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#dc3545'
    });
    
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
  formatAssessorData,
  enrichAssessorData
};
