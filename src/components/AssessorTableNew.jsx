import { useState } from 'react';
import './AssessorTable.css';

const AssessorTable = ({ assessors, onEdit, onDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Obtener sucursales únicas para el filtro
  const uniqueBranches = [...new Set(assessors.map(assessor => assessor.branch?.name).filter(Boolean))].sort();

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
        (assessor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessor.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessor.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessor.branch?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessor.admin?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBranch = !filterBranch || assessor.branch?.name === filterBranch;
      
      return matchesSearch && matchesBranch;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let aValue, bValue;
      
      // Manejo especial para campos anidados
      if (sortConfig.key === 'branch') {
        aValue = a.branch?.name || '';
        bValue = b.branch?.name || '';
      } else if (sortConfig.key === 'admin') {
        aValue = a.admin?.name || '';
        bValue = b.admin?.name || '';
      } else {
        aValue = a[sortConfig.key] || '';
        bValue = b[sortConfig.key] || '';
      }
      
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

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBranch('');
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
            placeholder="Buscar por nombre, email, teléfono, dirección, sucursal o administrador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las sucursales</option>
            {uniqueBranches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
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
        {(searchTerm || filterBranch) && (
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
            {(searchTerm || filterBranch) && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <table className="assessor-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('idAssessor')} className="sortable">
                  ID {getSortIcon('idAssessor')}
                </th>
                <th onClick={() => handleSort('name')} className="sortable">
                  Nombre {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('email')} className="sortable">
                  Email {getSortIcon('email')}
                </th>
                <th onClick={() => handleSort('phone')} className="sortable">
                  Teléfono {getSortIcon('phone')}
                </th>
                <th onClick={() => handleSort('address')} className="sortable">
                  Dirección {getSortIcon('address')}
                </th>
                <th onClick={() => handleSort('branch')} className="sortable">
                  Sucursal {getSortIcon('branch')}
                </th>
                <th onClick={() => handleSort('admin')} className="sortable">
                  Administrador {getSortIcon('admin')}
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAssessors.map((assessor) => (
                <tr key={assessor.idAssessor}>
                  <td>
                    <span className="assessor-id">#{assessor.idAssessor}</span>
                  </td>
                  <td>
                    <div className="assessor-name">
                      <span className="full-name">
                        {assessor.name || 'N/A'}
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
                    <span className="assessor-address">
                      {assessor.address ? (
                        assessor.address.length > 30 
                          ? `${assessor.address.substring(0, 30)}...`
                          : assessor.address
                      ) : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="assessor-branch">
                      {assessor.branch?.name || 'Sin asignar'}
                    </span>
                  </td>
                  <td>
                    <span className="assessor-admin">
                      {assessor.admin?.name || 'Sin asignar'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onEdit(assessor)}
                        className="edit-btn"
                        title="Editar asesor"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => onDelete(assessor)}
                        className="delete-btn"
                        title="Eliminar asesor"
                      >
                        🗑️ Eliminar
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
