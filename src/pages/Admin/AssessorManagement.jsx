import { useState, useEffect } from 'react';
import './AssessorManagement.css';
import AssessorForm from '../../components/AssessorForm';
import AssessorTable from '../../components/AssessorTable';
import Swal from 'sweetalert2';
import { 
  getAllAssessors, 
  createAssessor, 
  updateAssessor, 
  deleteAssessor
} from '../../services/AssessorService';
import { getBranches } from '../../services/BranchService';
import { getAllAdmins } from '../../services/AdminService';

const AssessorManagement = () => {
  const [assessors, setAssessors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssessor, setEditingAssessor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [error, setError] = useState(null);  const [successMessage, setSuccessMessage] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadBranches();
    loadAdmins();
    loadAssessors();
  }, []);  const loadAssessors = async () => {
    try {
      setIsTableLoading(true);
      setError(null);
      console.log('🔄 Cargando lista de asesores...');
      
      const assessorsData = await getAllAssessors();
      console.log('📊 Asesores obtenidos:', assessorsData);
      setAssessors(assessorsData);
      
    } catch (error) {
      console.error('❌ Error loading assessors:', error);
      const errorMessage = 'Error al cargar los asesores. Verifique la conexión con el servidor.';
      setError(errorMessage);
      setAssessors([]);
      
      await Swal.fire({
        title: 'Error de conexión',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setIsTableLoading(false);
    }
  };const loadBranches = async () => {
    try {
      console.log('🏢 Cargando sucursales...');
      const data = await getBranches();
      console.log('Sucursales obtenidas del servidor:', data);
      setBranches(data || []);
    } catch (error) {
      console.error('Error loading branches:', error);
      setError('Error al cargar las sucursales. Verifique la conexión con el servidor.');
      setBranches([]);
    }
  };  const loadAdmins = async () => {
    try {
      console.log('👤 Cargando administradores...');
      const data = await getAllAdmins();
      console.log('Administradores obtenidos del servidor:', data);
      setAdmins(data || []);
    } catch (error) {
      console.error('Error loading admins:', error);
      setError('Error al cargar los administradores. Verifique la conexión con el servidor.');
      setAdmins([]);
    }
  };

  const handleAddAssessor = () => {
    setEditingAssessor(null);
    setShowForm(true);
    setError(null);
  };

  const handleEditAssessor = (assessor) => {
    setEditingAssessor(assessor);
    setShowForm(true);
    setError(null);
  };  const handleDeleteAssessor = async (assessor) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará al asesor ${assessor.name} permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await deleteAssessor(assessor.idAssessor);
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: `El asesor ${assessor.name} ha sido eliminado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
        
        await loadAssessors();
      } catch (error) {
        console.error('Error deleting assessor:', error);
        await Swal.fire({
          title: 'Error',
          text: error.message || 'Error al eliminar el asesor',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };  const handleFormSubmit = async (assessorData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📝 Datos del formulario recibidos:', assessorData);

      if (editingAssessor) {
        console.log('✏️ Actualizando asesor con ID:', editingAssessor.idAssessor);
        await updateAssessor(editingAssessor.idAssessor, assessorData);
        
        await Swal.fire({
          title: '¡Actualizado!',
          text: `El asesor ${assessorData.name} ha sido actualizado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
      } else {
        console.log('➕ Creando nuevo asesor');
        await createAssessor(assessorData);
        
        await Swal.fire({
          title: '¡Creado!',
          text: `El asesor ${assessorData.name} ha sido creado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
      }

      setShowForm(false);
      setEditingAssessor(null);
      await loadAssessors();
    } catch (error) {
      console.error('❌ Error submitting assessor:', error);
      
      await Swal.fire({
        title: 'Error',
        text: error.message || 'Error al guardar el asesor',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAssessor(null);
    setError(null);
  };
  const getStats = () => {
    const totalAssessors = assessors.length;
    const branches = new Set(assessors.map(a => a.branch?.name).filter(Boolean)).size;

    return { totalAssessors, branches };
  };

  const stats = getStats();

  return (
    <div className="assessor-content">
      <header className="content-header">
        <h1>💼 Gestión de Asesores</h1>
        <p>Administrar asesores comerciales del sistema</p>
      </header>
      
      <div className="assessor-management">
        {/* Mensajes de éxito y error */}
        {successMessage && (
          <div className="success-message">
            <span>✅</span>
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)}>✕</button>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>❌</span>
            <p>{error}</p>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Header con botón de agregar */}
        <div className="management-header">
          <div className="header-content">
            <h2>Asesores Comerciales</h2>
            <button 
              onClick={handleAddAssessor}
              className="add-assessor-btn"
              disabled={isLoading}
            >
              <span>➕</span>
              Agregar Asesor
            </button>
          </div>
        </div>        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-info">
              <h3>{stats.totalAssessors}</h3>
              <p>Total Asesores</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-info">
              <h3>{stats.branches}</h3>
              <p>Sucursales</p>
            </div>
          </div>
        </div>

        {/* Formulario de asesor */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">              <AssessorForm
                assessor={editingAssessor}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isLoading}
                branches={branches}
                admins={admins}
              />
            </div>
          </div>
        )}

        {/* Tabla de asesores */}
        <div className="assessors-section">
          <div className="section-header">
            <h2>Listado de Asesores</h2>
            {!isTableLoading && (
              <button 
                onClick={loadAssessors} 
                className="refresh-btn"
                disabled={isLoading}
              >
                🔄 Actualizar
              </button>
            )}
          </div>

          <AssessorTable
            assessors={assessors}
            onEdit={handleEditAssessor}
            onDelete={handleDeleteAssessor}
            isLoading={isTableLoading}
          />
        </div>
      </div>
    </div>  );
};

export default AssessorManagement;
