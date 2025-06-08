import { useState, useEffect } from 'react';
import VehicleForm from '../../components/VehicleForm';
import VehicleTable from '../../components/VehicleTable';
import {
  getAllVehicles,
  updateVehicle
} from '../../services/VehicleService';


const VehicleManagementLO = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (error) {
      setError('Error al cargar los vehículos');
      console.error('Error reloading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleFormSubmit = async (vehicleData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingVehicle) {
        await updateVehicle(editingVehicle.vehicleId, vehicleData);
        setSuccessMessage(`Vehículo ${vehicleData.brand} ${vehicleData.model} actualizado exitosamente`);
      }

      setIsFormOpen(false);
      setEditingVehicle(null);
      await loadVehicles();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError(error.message || 'Error al actualizar el vehículo');
      console.error('Error updating vehicle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingVehicle(null);
    setError(null);
  };

  return (
    <div>
      <h1>Gestión de Vehículos</h1>
      {/* Botón de crear eliminado */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="alert-close">✕</button>
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="alert-close">✕</button>
        </div>
      )}
      <VehicleTable
  vehicles={vehicles}
  onEdit={handleEdit}
  isLoading={isLoading}
  hideDelete={true}
/>
      {isFormOpen && (
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
    </div>
  );
};

export default VehicleManagementLO;