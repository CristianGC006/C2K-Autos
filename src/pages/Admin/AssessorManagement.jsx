import { useState, useEffect } from 'react';
import AssessorForm from '../../components/AssessorForm';
import AssessorTable from '../../components/AssessorTable';
import { 
  getAllAssessors, 
  createAssessor, 
  updateAssessor, 
  deleteAssessor
} from '../../services/AssessorService';

const AssessorManagement = () => {
  const [assessors, setAssessors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssessor, setEditingAssessor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  // Cargar asesores al montar el componente
  useEffect(() => {
    loadAssessors();
    loadBranches();
    loadAdmins();
  }, []);

  const loadAssessors = async () => {
    try {
      setIsTableLoading(true);
      setError(null);
      const data = await getAllAssessors();
      setAssessors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading assessors:', error);
      setError('Error al cargar los asesores. Verifique la conexión con el servidor.');
      setAssessors([]);
    } finally {
      setIsTableLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      // Aquí deberías llamar a tu servicio de sucursales
      // const data = await getAllBranches();
      // setBranches(Array.isArray(data) ? data : []);
      
      // Datos de ejemplo mientras no esté el servicio
      setBranches([
        { id: 1, name: 'Sucursal Norte' },
        { id: 2, name: 'Sucursal Centro' },
        { id: 3, name: 'Sucursal Sur' }
      ]);
    } catch (error) {
      console.error('Error loading branches:', error);
      setBranches([]);
    }
  };

  const loadAdmins = async () => {
    try {
      // Aquí deberías llamar a tu servicio de administradores
      // const data = await getAllAdmins();
      // setAdmins(Array.isArray(data) ? data : []);
      
      // Datos de ejemplo mientras no esté el servicio
      setAdmins([
        { id: 1, name: 'Admin Principal' },
        { id: 2, name: 'Admin Secundario' }
      ]);
    } catch (error) {
      console.error('Error loading admins:', error);
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
  };
  const handleDeleteAssessor = async (assessor) => {
    const confirmMessage = `¿Está seguro que desea eliminar al asesor ${assessor.name}?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setIsLoading(true);
        await deleteAssessor(assessor.idAssessor);
        setSuccessMessage(`Asesor ${assessor.name} eliminado exitosamente`);
        await loadAssessors();
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Error deleting assessor:', error);
        setError(error.message || 'Error al eliminar el asesor');
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handleFormSubmit = async (assessorData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingAssessor) {
        await updateAssessor(editingAssessor.idAssessor, assessorData);
        setSuccessMessage(`Asesor ${assessorData.name} actualizado exitosamente`);
      } else {
        await createAssessor(assessorData);
        setSuccessMessage(`Asesor ${assessorData.name} creado exitosamente`);
      }

      setShowForm(false);
      setEditingAssessor(null);
      await loadAssessors();

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error submitting assessor:', error);
      setError(error.message || 'Error al guardar el asesor');
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
