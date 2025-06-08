import { useState, useEffect } from 'react';
import AdminForm from '../../components/AdminForm';
import AdminTable from '../../components/AdminTable';
import Swal from 'sweetalert2';
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
      
      setAdmins(normalizedAdmins);    } catch (error) {
      console.error('Error loading admins:', error);
      await Swal.fire({
        title: 'Error de conexión',
        text: 'Error al cargar los administradores. Verifique la conexión con el servidor.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
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
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se desactivará al administrador ${admin.name} permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await deleteAdmin(admin.idAdmin);
        
        await Swal.fire({
          title: '¡Desactivado!',
          text: `El administrador ${admin.name} ha sido desactivado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
        
        await loadAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
        await Swal.fire({
          title: 'Error',
          text: error.message || 'Error al desactivar el administrador',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handleFormSubmit = async (adminData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingAdmin) {
        // Actualizar administrador existente
        await updateAdmin(editingAdmin.idAdmin, adminData);
        
        await Swal.fire({
          title: '¡Actualizado!',
          text: `El administrador ${adminData.name} ha sido actualizado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
      } else {
        // Crear nuevo administrador
        await createAdmin(adminData);
        
        await Swal.fire({
          title: '¡Creado!',
          text: `El administrador ${adminData.name} ha sido creado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
      }

      await loadAdmins();
      handleFormCancel();
    } catch (error) {
      console.error('Error submitting admin:', error);
      
      await Swal.fire({
        title: 'Error',
        text: error.message || 'Error al procesar el administrador',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
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
