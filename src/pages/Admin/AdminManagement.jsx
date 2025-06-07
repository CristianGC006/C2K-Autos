import { useState, useEffect } from 'react';
import AdminForm from '../../components/AdminForm';
import AdminTable from '../../components/AdminTable';
import { 
  getAllAdmins, 
  createAdmin, 
  updateAdmin, 
  deleteAdmin 
} from '../../services/AdminService';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Cargar administradores al montar el componente
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsTableLoading(true);
      setError(null);
      const data = await getAllAdmins();
      // Validar y normalizar los datos de administradores
      const normalizedAdmins = Array.isArray(data) ? data.map(admin => ({
        idAdmin: admin.idAdmin || admin.id,
        name: admin.name || '',
        email: admin.email || '',
        phone: admin.phone || '',
        documentNumber: admin.documentNumber || '',
        identificationType: admin.identificationType || 'CEDULA_DE_CIUDADANIA',
        adminCode: admin.adminCode || '',
        isActive: admin.isActive !== false // Por defecto true
      })) : [];
      
      setAdmins(normalizedAdmins);
    } catch (error) {
      console.error('Error loading admins:', error);
      setError('Error al cargar los administradores. Verifique la conexión con el servidor.');
      setAdmins([]);
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setShowForm(true);
    setError(null);
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setShowForm(true);
    setError(null);
  };

  const handleDeleteAdmin = async (admin) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await deleteAdmin(admin.idAdmin);
      
      setSuccessMessage(`Administrador ${admin.name} desactivado exitosamente`);
      await loadAdmins();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError(error.message || 'Error al desactivar el administrador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (adminData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingAdmin) {
        // Actualizar administrador existente
        await updateAdmin(editingAdmin.idAdmin, adminData);
        setSuccessMessage(`Administrador ${adminData.name} actualizado exitosamente`);
      } else {
        // Crear nuevo administrador
        await createAdmin(adminData);
        setSuccessMessage(`Administrador ${adminData.name} creado exitosamente`);
      }

      await loadAdmins();
      handleFormCancel();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error submitting admin:', error);
      setError(error.message || 'Error al procesar el administrador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAdmin(null);
    setError(null);
  };

  return (
    <div className="admin-management">
      <header className="content-header">
        <h1>👑 Gestión de Administradores</h1>
        <p>Administrar usuarios administradores del sistema</p>
        
        <div className="content-actions">
          <button 
            className="add-button"
            onClick={handleAddAdmin}
            disabled={isLoading}
          >
            ➕ Nuevo Administrador
          </button>
        </div>
      </header>

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

      {/* Formulario de administrador */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AdminForm
              admin={editingAdmin}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isEditing={!!editingAdmin}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Tabla de administradores */}
      <AdminTable
        admins={admins}
        onEdit={handleEditAdmin}
        onDelete={handleDeleteAdmin}
        isLoading={isTableLoading}
      />
    </div>
  );
};

export default AdminManagement;
