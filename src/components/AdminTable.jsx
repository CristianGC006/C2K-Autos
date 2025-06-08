import { useState } from 'react';
import Swal from 'sweetalert2';
import './CustomerTable.css'; // Reutilizamos los estilos existentes

const AdminTable = ({ 
    admins = [], 
    onEdit, 
    onDelete, 
    isLoading = false 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Filtrar administradores por término de búsqueda
    const filteredAdmins = admins.filter(admin => {
        const searchLower = searchTerm.toLowerCase();
        return (
            admin.name?.toLowerCase().includes(searchLower) ||
            admin.email?.toLowerCase().includes(searchLower) ||
            admin.adminCode?.toLowerCase().includes(searchLower) ||
            admin.documentNumber?.toLowerCase().includes(searchLower) ||
            admin.identificationType?.toLowerCase().includes(searchLower)
        );
    });

    // Ordenar administradores
    const sortedAdmins = [...filteredAdmins].sort((a, b) => {
        let aVal = a[sortField] || '';
        let bVal = b[sortField] || '';
        
        // Convertir a string para comparación
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
        
        if (sortDirection === 'asc') {
            return aVal.localeCompare(bVal);
        }
        return bVal.localeCompare(aVal);
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '⬆️' : '⬇️';
    };

    const formatIdentificationType = (type) => {
        const types = {
            'CEDULA_DE_CIUDADANIA': 'C.C.',
            'CEDULA_DE_EXTRANJERIA': 'C.E.',
            'PASAPORTE': 'Pasaporte',
            'OTRO': 'Otro'
        };
        return types[type] || type;
    };    const handleDeleteClick = async (admin) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            html: `Se desactivará al administrador:<br><br>
                   <strong>👤 ${admin.name}</strong><br>
                   📧 ${admin.email}<br>
                   🔖 ${admin.adminCode}<br><br>
                   <em>Esta acción se puede revertir posteriormente.</em>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            onDelete(admin);
        }
    };

    if (isLoading) {
        return (
            <div className="table-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Cargando administradores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            {/* Header con búsqueda y estadísticas */}
            <div className="table-header">
                <div className="table-info">
                    <h3>👑 Lista de Administradores</h3>
                    <div className="table-stats">
                        <span className="stat-item">
                            📊 Total: <strong>{admins.length}</strong>
                        </span>
                        <span className="stat-item">
                            🔍 Filtrados: <strong>{filteredAdmins.length}</strong>
                        </span>
                        <span className="stat-item">
                            ✅ Activos: <strong>{admins.filter(a => a.isActive !== false).length}</strong>
                        </span>
                    </div>
                </div>

                <div className="search-container">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, código o documento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button 
                                className="clear-search"
                                onClick={() => setSearchTerm('')}
                                title="Limpiar búsqueda"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabla */}
            {sortedAdmins.length === 0 ? (
                <div className="empty-state">
                    {admins.length === 0 ? (
                        <>
                            <div className="empty-icon">👑</div>
                            <h3>No hay administradores registrados</h3>
                            <p>Agregue el primer administrador al sistema</p>
                        </>
                    ) : (
                        <>
                            <div className="empty-icon">🔍</div>
                            <h3>Sin resultados</h3>
                            <p>No se encontraron administradores que coincidan con "{searchTerm}"</p>
                            <button 
                                className="clear-filter-button"
                                onClick={() => setSearchTerm('')}
                            >
                                Limpiar filtros
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th 
                                    onClick={() => handleSort('name')}
                                    className="sortable-header"
                                >
                                    Nombre {getSortIcon('name')}
                                </th>
                                <th 
                                    onClick={() => handleSort('email')}
                                    className="sortable-header"
                                >
                                    Email {getSortIcon('email')}
                                </th>
                                <th 
                                    onClick={() => handleSort('adminCode')}
                                    className="sortable-header"
                                >
                                    Código Admin {getSortIcon('adminCode')}
                                </th>
                                <th 
                                    onClick={() => handleSort('identificationType')}
                                    className="sortable-header"
                                >
                                    Tipo Doc. {getSortIcon('identificationType')}
                                </th>
                                <th 
                                    onClick={() => handleSort('documentNumber')}
                                    className="sortable-header"
                                >
                                    N° Documento {getSortIcon('documentNumber')}
                                </th>
                                <th 
                                    onClick={() => handleSort('phone')}
                                    className="sortable-header"
                                >
                                    Teléfono {getSortIcon('phone')}
                                </th>
                                <th className="actions-header">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAdmins.map((admin) => (
                                <tr key={admin.idAdmin || admin.id} className="table-row">
                                    <td className="name-cell">
                                        <div className="admin-info">
                                            <span className="admin-icon">👑</span>
                                            <div>
                                                <strong>{admin.name}</strong>
                                                {admin.isActive === false && (
                                                    <span className="status-badge inactive">Inactivo</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="email-cell">
                                        <a href={`mailto:${admin.email}`} className="email-link">
                                            {admin.email}
                                        </a>
                                    </td>
                                    <td className="code-cell">
                                        <span className="admin-code">
                                            {admin.adminCode}
                                        </span>
                                    </td>
                                    <td className="doc-type-cell">
                                        {formatIdentificationType(admin.identificationType)}
                                    </td>
                                    <td className="document-cell">
                                        {admin.documentNumber}
                                    </td>
                                    <td className="phone-cell">
                                        <a href={`tel:${admin.phone}`} className="phone-link">
                                            {admin.phone}
                                        </a>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => onEdit(admin)}
                                                className="edit-button"
                                                title="Editar administrador"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(admin)}
                                                className="delete-button"
                                                title="Desactivar administrador"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Footer con información adicional */}
            <div className="table-footer">
                <div className="table-info-footer">
                    <span>💡 Los administradores desactivados aparecen marcados como "Inactivo"</span>
                </div>
            </div>
        </div>
    );
};

export default AdminTable;
