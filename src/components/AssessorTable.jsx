import { useState } from 'react';

const AssessorTable = ({ assessors, onEdit, onDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Obtener departamentos únicos para el filtro
  const uniqueDepartments = [...new Set(assessors.map(assessor => assessor.department).filter(Boolean))].sort();

  // Función para ordenar
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtrar y ordenar asesores
  const filteredAndSortedAssessors = assessors
    .filter(assessor => {
      const matchesSearch = 
        (assessor.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessor.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessor.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessor.department || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !filterDepartment || assessor.department === filterDepartment;
      const matchesStatus = !filterStatus || 
        (filterStatus === 'active' && assessor.isActive !== false) ||
        (filterStatus === 'inactive' && assessor.isActive === false);
      
      return matchesSearch && matchesDepartment && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '⬆️' : '⬇️';
  };

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    if (phone.length === 10) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  const formatSalary = (salary) => {
    if (!salary) return 'No especificado';
    return `$${parseFloat(salary).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES');
  };

  const getStatusBadge = (isActive) => {
    return isActive !== false ? (
      <span className="status-badge active">✅ Activo</span>
    ) : (
      <span className="status-badge inactive">❌ Inactivo</span>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterStatus('');
    setSortConfig({ key: null, direction: 'asc' });
  };

  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Cargando asesores...</p>
      </div>
    );
  }

  return (
    <div className="assessor-table-container">
      {/* Filtros y búsqueda */}
      <div className="table-filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Buscar por nombre, email, ID de empleado o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los departamentos</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          
          <button onClick={clearFilters} className="clear-filters-btn">
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="table-stats">
        <span>
          Mostrando {filteredAndSortedAssessors.length} de {assessors.length} asesores
        </span>
        {(searchTerm || filterDepartment || filterStatus) && (
          <span className="filter-active">
            (Filtros activos)
          </span>
        )}
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        {filteredAndSortedAssessors.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">💼</div>
            <h3>No se encontraron asesores</h3>
            <p>
              {assessors.length === 0 
                ? 'No hay asesores registrados en el sistema.'
                : 'No hay asesores que coincidan con los filtros aplicados.'
              }
            </p>
            {(searchTerm || filterDepartment || filterStatus) && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <table className="assessor-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('assessorId')} className="sortable">
                  ID {getSortIcon('assessorId')}
                </th>
                <th onClick={() => handleSort('employeeId')} className="sortable">
                  ID Empleado {getSortIcon('employeeId')}
                </th>
                <th onClick={() => handleSort('firstName')} className="sortable">
                  Nombre {getSortIcon('firstName')}
                </th>
                <th onClick={() => handleSort('email')} className="sortable">
                  Email {getSortIcon('email')}
                </th>
                <th onClick={() => handleSort('phone')} className="sortable">
                  Teléfono {getSortIcon('phone')}
                </th>
                <th onClick={() => handleSort('department')} className="sortable">
                  Departamento {getSortIcon('department')}
                </th>
                <th onClick={() => handleSort('position')} className="sortable">
                  Posición {getSortIcon('position')}
                </th>
                <th onClick={() => handleSort('hireDate')} className="sortable">
                  Fecha Contratación {getSortIcon('hireDate')}
                </th>
                <th onClick={() => handleSort('salary')} className="sortable">
                  Salario {getSortIcon('salary')}
                </th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAssessors.map((assessor) => (
                <tr key={assessor.assessorId} className={assessor.isActive === false ? 'inactive-row' : ''}>
                  <td>
                    <span className="assessor-id">#{assessor.assessorId}</span>
                  </td>
                  <td>
                    <span className="employee-id">{assessor.employeeId || 'N/A'}</span>
                  </td>
                  <td>
                    <div className="assessor-name">
                      <span className="full-name">
                        {assessor.firstName || 'N/A'} {assessor.lastName || ''}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="assessor-email">{assessor.email || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="assessor-phone">{formatPhone(assessor.phone)}</span>
                  </td>
                  <td>
                    <span className="assessor-department">
                      <span className="department-badge">
                        {assessor.department || 'N/A'}
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className="assessor-position">{assessor.position || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="hire-date">{formatDate(assessor.hireDate)}</span>
                  </td>
                  <td>
                    <span className="assessor-salary">{formatSalary(assessor.salary)}</span>
                  </td>
                  <td>
                    {getStatusBadge(assessor.isActive)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onEdit(assessor)}
                        className="edit-btn"
                        title="Editar asesor"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(assessor)}
                        className="delete-btn"
                        title={assessor.isActive !== false ? "Desactivar asesor" : "Activar asesor"}
                      >
                        {assessor.isActive !== false ? '🗑️' : '🔄'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssessorTable;
