const API_BASE_URL = 'http://localhost:8080/vehicle';

// Obtener todos los vehículos
export const getAllVehicles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error('Error al obtener vehículos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllVehicles:', error);
    throw error;
  }
};

// Obtener vehículo por ID
export const getVehicleById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener vehículo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getVehicleById:', error);
    throw error;
  }
};

// Crear nuevo vehículo
export const createVehicle = async (vehicleData) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear vehículo');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in createVehicle:', error);
    throw error;
  }
};

// Actualizar vehículo
export const updateVehicle = async (id, vehicleData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar vehículo');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in updateVehicle:', error);
    throw error;
  }
};

// Eliminar/desactivar vehículo
export const deleteVehicle = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al desactivar vehículo');
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteVehicle:', error);
    throw error;
  }
};

// Obtener vehículos por marca
export const getVehiclesByBrand = async (brand) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brand/${brand}`);
    if (!response.ok) {
      throw new Error('Error al obtener vehículos por marca');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getVehiclesByBrand:', error);
    throw error;
  }
};

// Obtener vehículos por tipo
export const getVehiclesByType = async (type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/type/${type}`);
    if (!response.ok) {
      throw new Error('Error al obtener vehículos por tipo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getVehiclesByType:', error);
    throw error;
  }
};

// Obtener vehículos disponibles
export const getAvailableVehicles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/available`);
    if (!response.ok) {
      throw new Error('Error al obtener vehículos disponibles');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAvailableVehicles:', error);
    throw error;
  }
};

// Validador de datos de vehículo
export const validateVehicleData = (vehicleData) => {
  const errors = {};

  if (!vehicleData.brand || vehicleData.brand.trim() === '') {
    errors.brand = 'La marca es requerida';
  }

  if (!vehicleData.model || vehicleData.model.trim() === '') {
    errors.model = 'El modelo es requerido';
  }

  if (!vehicleData.color || vehicleData.color.trim() === '') {
    errors.color = 'El color es requerido';
  }

  if (!vehicleData.plate || vehicleData.plate.trim() === '') {
    errors.plate = 'La placa es requerida';
  } else if (!/^[A-Z]{3}[0-9]{3}$/i.test(vehicleData.plate.replace(/[-\s]/g, ''))) {
    errors.plate = 'La placa debe tener el formato ABC123';
  }

  if (!vehicleData.year || vehicleData.year < 1900 || vehicleData.year > new Date().getFullYear() + 1) {
    errors.year = 'El año debe estar entre 1900 y ' + (new Date().getFullYear() + 1);
  }

  if (!vehicleData.type || vehicleData.type.trim() === '') {
    errors.type = 'El tipo es requerido';
  }

  if (vehicleData.imageUrl && !isValidUrl(vehicleData.imageUrl)) {
    errors.imageUrl = 'La URL de la imagen no es válida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Función auxiliar para validar URLs
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (error) {
    console.error('Invalid URL:', string, error);
    return false;
  }
};

export default {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehiclesByBrand,
  getVehiclesByType,
  getAvailableVehicles,
  validateVehicleData
};
