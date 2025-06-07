import { useState, useEffect } from 'react';
import VehicleForm from '../../components/VehicleForm';
import VehicleTable from '../../components/VehicleTable';
import { 
  getAllVehicles, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} from '../../services/VehicleService';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Cargar vehículos al montar el componente
  useEffect(() => {
    loadVehicles();
  }, []);
  const loadVehicles = async () => {
    try {
      setIsTableLoading(true);
      setError(null);
      const data = await getAllVehicles();
      // Validar y normalizar los datos de vehículos
      const normalizedVehicles = Array.isArray(data) ? data.map(vehicle => ({
        vehicleId: vehicle.vehicleId || 0,
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        color: vehicle.color || '',
        plate: vehicle.plate || '',
        year: vehicle.year || new Date().getFullYear(),
        type: vehicle.type || '',
        imageUrl: vehicle.imageUrl || ''
      })) : [];
      setVehicles(normalizedVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setError('Error al cargar los vehículos. Por favor, intente nuevamente.');
      setVehicles([]);
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowForm(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleDeleteVehicle = async (vehicle) => {
    const confirmDelete = window.confirm(
      `¿Está seguro de que desea desactivar el vehículo ${vehicle.brand} ${vehicle.model} (${vehicle.plate})?`
    );

    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      setError(null);
      
      await deleteVehicle(vehicle.vehicleId);
      
      setSuccessMessage(`Vehículo ${vehicle.brand} ${vehicle.model} desactivado exitosamente`);
      await loadVehicles();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setError(error.message || 'Error al desactivar el vehículo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (vehicleData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingVehicle) {
        // Actualizar vehículo existente
        await updateVehicle(editingVehicle.vehicleId, vehicleData);
        setSuccessMessage(`Vehículo ${vehicleData.brand} ${vehicleData.model} actualizado exitosamente`);
      } else {
        // Crear nuevo vehículo
        await createVehicle(vehicleData);
        setSuccessMessage(`Vehículo ${vehicleData.brand} ${vehicleData.model} creado exitosamente`);
      }

      setShowForm(false);
      setEditingVehicle(null);
      await loadVehicles();

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error submitting vehicle:', error);
      setError(error.message || 'Error al guardar el vehículo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVehicle(null);
    setError(null);
  };

  const getStats = () => {
    const totalVehicles = vehicles.length;
    const brands = new Set(vehicles.map(v => v.brand)).size;
    const types = new Set(vehicles.map(v => v.type)).size;
    const averageYear = vehicles.length > 0 
      ? Math.round(vehicles.reduce((sum, v) => sum + (v.year || 0), 0) / vehicles.length)
      : 0;

    return { totalVehicles, brands, types, averageYear };
  };

  const stats = getStats();
  return (    <div className="vehicles-content">
      <header className="content-header">
        <div className="header-info">
          <h1>🚗 Gestión de Vehículos</h1>
          <p>Administrar el inventario de vehículos del sistema</p>
        </div>
        <button 
          onClick={handleAddVehicle}
          className="add-vehicle-btn"
          disabled={isLoading}
        >
          <span>➕</span>
          Agregar Vehículo
        </button>
      </header>
        <div className="vehicle-management">
      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <h3>{stats.totalVehicles}</h3>
            <p>Total Vehículos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <h3>{stats.brands}</h3>
            <p>Marcas Diferentes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.types}</h3>
            <p>Tipos de Vehículo</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.averageYear || 'N/A'}</h3>
            <p>Año Promedio</p>
          </div>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="alert-close"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <span>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage(null)} 
            className="alert-close"
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulario de vehículo */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <VehicleForm
              vehicle={editingVehicle}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Tabla de vehículos */}
      <div className="vehicles-section">
        <div className="section-header">
          <h2>Listado de Vehículos</h2>
          {!isTableLoading && (
            <button 
              onClick={loadVehicles} 
              className="refresh-btn"
              disabled={isLoading}
            >
              🔄 Actualizar
            </button>
          )}
        </div>

        <VehicleTable
          vehicles={vehicles}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteVehicle}
          isLoading={isTableLoading}        />
      </div>
      </div>
    </div>
  );
};

export default VehicleManagement;
