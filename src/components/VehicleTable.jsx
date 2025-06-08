import { useState } from 'react';

const VehicleTable = ({ vehicles, onEdit, onDelete, isLoading, hideDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  // Obtener marcas únicas para el filtro
  const uniqueBrands = [...new Set(vehicles.map(vehicle => vehicle.brand).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(vehicles.map(vehicle => vehicle.type).filter(Boolean))].sort();

  // Función para ordenar
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  // Filtrar y ordenar vehículos
  const filteredAndSortedVehicles = vehicles
    .filter(vehicle => {
      const matchesSearch = 
        (vehicle.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.plate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.color || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBrand = !filterBrand || vehicle.brand === filterBrand;
      const matchesType = !filterType || vehicle.type === filterType;
      
      return matchesSearch && matchesBrand && matchesType;
    })    .sort((a, b) => {
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

  const formatYear = (year) => {
    return year || 'N/A';
  };

  const formatPlate = (plate) => {
    if (!plate) return 'N/A';
    // Formatear placa como ABC-123
    if (plate.length === 6) {
      return `${plate.slice(0, 3)}-${plate.slice(3)}`;
    }
    return plate;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBrand('');
    setFilterType('');
    setSortConfig({ key: null, direction: 'asc' });
  };

  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div className="vehicle-table-container">
      {/* Filtros y búsqueda */}
      <div className="table-filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Buscar por marca, modelo, placa o color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las marcas</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los tipos</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
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
          Mostrando {filteredAndSortedVehicles.length} de {vehicles.length} vehículos
        </span>
        {(searchTerm || filterBrand || filterType) && (
          <span className="filter-active">
            (Filtros activos)
          </span>
        )}
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        {filteredAndSortedVehicles.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🚗</div>
            <h3>No se encontraron vehículos</h3>
            <p>
              {vehicles.length === 0 
                ? 'No hay vehículos registrados en el sistema.'
                : 'No hay vehículos que coincidan con los filtros aplicados.'
              }
            </p>
            {(searchTerm || filterBrand || filterType) && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('vehicleId')} className="sortable">
                  ID {getSortIcon('vehicleId')}
                </th>
                <th onClick={() => handleSort('brand')} className="sortable">
                  Marca {getSortIcon('brand')}
                </th>
                <th onClick={() => handleSort('model')} className="sortable">
                  Modelo {getSortIcon('model')}
                </th>
                <th onClick={() => handleSort('color')} className="sortable">
                  Color {getSortIcon('color')}
                </th>
                <th onClick={() => handleSort('plate')} className="sortable">
                  Placa {getSortIcon('plate')}
                </th>
                <th onClick={() => handleSort('year')} className="sortable">
                  Año {getSortIcon('year')}
                </th>
                <th onClick={() => handleSort('type')} className="sortable">
                  Tipo {getSortIcon('type')}
                </th>
                <th>Imagen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedVehicles.map((vehicle) => (
                <tr key={vehicle.vehicleId}>
                  <td>
                    <span className="vehicle-id">#{vehicle.vehicleId}</span>
                  </td>                  <td>
                    <span className="vehicle-brand">{vehicle.brand || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="vehicle-model">{vehicle.model || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="vehicle-color">
                      <span 
                        className="color-indicator" 
                        style={{ backgroundColor: getColorCode(vehicle.color || 'Gris') }}                      ></span>
                      {vehicle.color || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="vehicle-plate">{formatPlate(vehicle.plate)}</span>
                  </td>
                  <td>
                    <span className="vehicle-year">{formatYear(vehicle.year)}</span>
                  </td>
                  <td>
                    <span className="vehicle-type">{vehicle.type || 'N/A'}</span>
                  </td>
                  <td>
                    {vehicle.imageUrl ? (
                      <div className="vehicle-image-cell">                        <img 
                          src={vehicle.imageUrl} 
                          alt={`${vehicle.brand || 'Vehículo'} ${vehicle.model || ''}`}
                          className="vehicle-thumbnail"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="image-placeholder" style={{ display: 'none' }}>
                          🚗
                        </div>
                      </div>
                    ) : (
                      <div className="image-placeholder">
                        🚗
                      </div>
                    )}
                  </td>                  <td className="actions-column">
                    <div className="actions-group">
                      <button
                        onClick={() => onEdit(vehicle)}
                        className="action-btn edit"
                        title="Editar vehículo"
                      >
                        ✏️ Editar
                      </button>
                      {!hideDelete && (
      <button
        onClick={() => onDelete(vehicle)}
        className="action-btn delete"
        title="Eliminar vehículo"
      >
        🗑️ Eliminar
      </button>
    )}
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

// Función auxiliar para obtener códigos de color
const getColorCode = (colorName) => {
  const colorMap = {
    'Blanco': '#ffffff',
    'Negro': '#000000',
    'Gris': '#808080',
    'Plata': '#c0c0c0',
    'Azul': '#0066cc',
    'Rojo': '#cc0000',
    'Verde': '#008000',
    'Amarillo': '#ffff00',
    'Naranja': '#ff8000',
    'Marrón': '#8b4513',
    'Beige': '#f5f5dc'
  };
  
  return colorMap[colorName] || '#cccccc';
};

export default VehicleTable;
