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
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (error) {
      // Manejo de error
	  console.error('Error reloading :', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVehicle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleDelete = async (vehicleId) => {
    setIsLoading(true);
    try {
      await deleteVehicle(vehicleId);
      await loadVehicles();
    } catch (error) {
      // Manejo de error
	  console.error('Error reloading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (vehicleData) => {
    setIsLoading(true);
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
      } else {
        await createVehicle(vehicleData);
      }
      await loadVehicles();
      setIsFormOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      // Manejo de error
	  console.error('Error reloading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingVehicle(null);
  };

  return (
    <div>
      <h1>Gestión de Vehículos</h1>
      <button onClick={handleCreate} disabled={isLoading}>➕ Nuevo Vehículo</button>
      <VehicleTable
        vehicles={vehicles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
      {isFormOpen && (
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default VehicleManagement;