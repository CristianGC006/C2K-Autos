import React, { useState, useEffect } from 'react';
import C2KLogoNoBackground from "../../assets/C2K-LogoNoBackground.png";
import './AssessorHome.css';
import { Link } from 'react-router-dom';
import { imageService } from '../../services/imageService';
import { updateCustomer } from '../../services/CustomerService';
import { getAssessorById, updateAssessor } from '../../services/AssessorService';
import Swal from 'sweetalert2';

export default function AssessorHome() {
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('vehicles');
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [showVehicleForm, setShowVehicleForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [editingAssessor, setEditingAssessor] = useState(null);
    const [showAssessorForm, setShowAssessorForm] = useState(false);
    const [assessorInfo, setAssessorInfo] = useState(null);
    const [newVehicle, setNewVehicle] = useState({
        brand: '',
        model: '',
        year: '',
        plate: '',
        color: '',
        price: '',
        imageUrl: '',
        isRented: false
    });    useEffect(() => {
        loadCustomers();
        loadVehicles();
        loadRentals();
        loadAssessorInfo();
    }, []);

    const loadAssessorInfo = async () => {
        try {
            // En un caso real, obtendrías el ID del asesor desde el token o localStorage
            const assessorId = localStorage.getItem('assessorId') || 1; // Valor por defecto para prueba
            const assessor = await getAssessorById(assessorId);
            setAssessorInfo(assessor);
        } catch (error) {
            console.error('Error al cargar información del asesor:', error);
        }
    };

    const loadCustomers = async () => {
        try {
            const response = await fetch('http://localhost:8080/customer');
            if (response.ok) {
                const data = await response.json();
                setCustomers(data || []);
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    };    const loadVehicles = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/vehicle');
            if (response.ok) {
                const data = await response.json();
                
                // Procesar imágenes para cada vehículo
                const vehiclesWithImages = await Promise.all(data.map(async (vehicle) => {
                    let finalImageUrl;
                    
                    if (vehicle.imageUrl && vehicle.imageUrl.trim() !== '') {
                        finalImageUrl = await imageService.getValidatedImage(vehicle.brand, vehicle.model, vehicle.imageUrl);
                    } else {
                        finalImageUrl = await imageService.getValidatedImage(vehicle.brand, vehicle.model);
                    }
                    
                    return {
                        ...vehicle,
                        imageUrl: finalImageUrl
                    };
                }));
                
                setVehicles(vehiclesWithImages || []);
            }
        } catch (error) {
            console.error('Error al cargar vehículos:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRentals = async () => {
        try {
            const response = await fetch('http://localhost:8080/rental');
            if (response.ok) {
                const data = await response.json();
                setRentals(data || []);
            }
        } catch (error) {
            console.error('Error al cargar rentas:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        if (editingVehicle) {
            setEditingVehicle(prev => ({
                ...prev,
                [name]: val
            }));
        } else {
            setNewVehicle(prev => ({
                ...prev,
                [name]: val
            }));
        }
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        const vehicleData = editingVehicle || newVehicle;
        
        try {
            // Mostrar loading
            Swal.fire({
                title: editingVehicle ? 'Actualizando Vehículo...' : 'Creando Vehículo...',
                text: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const url = editingVehicle 
                ? `http://localhost:8080/vehicle/${editingVehicle.vehicleId || editingVehicle.id}`
                : 'http://localhost:8080/vehicle';
            
            const method = editingVehicle ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(vehicleData)
            });

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: `Vehículo ${editingVehicle ? 'actualizado' : 'creado'} exitosamente`,
                    confirmButtonColor: '#28a745',
                    timer: 2000,
                    timerProgressBar: true
                });
                
                setShowVehicleForm(false);
                setEditingVehicle(null);
                setNewVehicle({
                    brand: '',
                    model: '',
                    year: '',
                    plate: '',
                    color: '',
                    price: '',
                    imageUrl: '',
                    isRented: false
                });
                loadVehicles();
            } else {
                throw new Error('Error del servidor');
            }
        } catch (error) {
            console.error('Error:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el vehículo. Intente nuevamente.',
                confirmButtonColor: '#dc3545'
            });
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setShowVehicleForm(true);
    };    const handleDelete = async (vehicleId) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Eliminando Vehículo...',
                    text: 'Por favor espere',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const response = await fetch(`http://localhost:8080/vehicle/${vehicleId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Eliminado!',
                        text: 'Vehículo eliminado exitosamente',
                        confirmButtonColor: '#28a745',
                        timer: 2000,
                        timerProgressBar: true
                    });
                    loadVehicles();
                } else {
                    throw new Error('Error del servidor');
                }
            } catch (error) {
                console.error('Error:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el vehículo. Intente nuevamente.',
                    confirmButtonColor: '#dc3545'
                });
            }
        }
    };const closeModal = () => {
        setShowVehicleForm(false);
        setEditingVehicle(null);
        setShowCustomerForm(false);
        setEditingCustomer(null);
        setShowAssessorForm(false);
        setEditingAssessor(null);
        setNewVehicle({
            brand: '',
            model: '',
            year: '',
            plate: '',
            color: '',
            price: '',
            imageUrl: '',
            isRented: false
        });
    };

    // Funciones para editar clientes
    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setShowCustomerForm(true);
    };

    const handleCustomerInputChange = (e) => {
        const { name, value } = e.target;
        setEditingCustomer(prev => ({
            ...prev,
            [name]: value
        }));
    };    const handleCustomerSubmit = async (e) => {
        e.preventDefault();
        try {
            Swal.fire({
                title: 'Actualizando Cliente...',
                text: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            await updateCustomer(editingCustomer.id || editingCustomer.idCustomer, editingCustomer);
            
            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Cliente actualizado exitosamente',
                confirmButtonColor: '#28a745',
                timer: 2000,
                timerProgressBar: true
            });

            setShowCustomerForm(false);
            setEditingCustomer(null);
            loadCustomers();
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el cliente. Intente nuevamente.',
                confirmButtonColor: '#dc3545'
            });
        }
    };

    // Funciones para editar información del asesor
    const handleEditAssessor = () => {
        setEditingAssessor({ ...assessorInfo });
        setShowAssessorForm(true);
    };

    const handleAssessorInputChange = (e) => {
        const { name, value } = e.target;
        setEditingAssessor(prev => ({
            ...prev,
            [name]: value
        }));
    };    const handleAssessorSubmit = async (e) => {
        e.preventDefault();
        try {
            Swal.fire({
                title: 'Actualizando Perfil...',
                text: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            await updateAssessor(editingAssessor.idAssessor, editingAssessor);
            
            await Swal.fire({
                icon: 'success',
                title: '¡Perfil Actualizado!',
                text: 'Su información se ha actualizado exitosamente',
                confirmButtonColor: '#28a745',
                timer: 2000,
                timerProgressBar: true
            });

            setShowAssessorForm(false);
            setEditingAssessor(null);
            loadAssessorInfo();
        } catch (error) {
            console.error('Error al actualizar asesor:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar su perfil. Intente nuevamente.',
                confirmButtonColor: '#dc3545'
            });
        }
    };

    if (loading) {
        return (
            <div className="assessor-container">
                <header className="assessor-header">
                    <div className="header-content">
                        <img className="logo" alt="C2K-Logo" src={C2KLogoNoBackground} />
                        <h1>Panel de Asesor</h1>
                    </div>
                </header>
                <div className="loading">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="assessor-container">
            <header className="assessor-header">
                <div className="header-content">
                    <img className="logo" alt="C2K-Logo" src={C2KLogoNoBackground} />
                    <h1>Panel de Asesor</h1>
                    <Link to="/" className="logout-btn">Cerrar Sesión</Link>
                </div>
            </header>

            <main className="assessor-main">
                {/* Pestañas de navegación */}                <div className="tabs">
                    <button 
                        className={`tab ${activeView === 'vehicles' ? 'active' : ''}`}
                        onClick={() => setActiveView('vehicles')}
                    >
                        Gestión de Vehículos
                    </button>
                    <button 
                        className={`tab ${activeView === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveView('customers')}
                    >
                        Ver Clientes
                    </button>
                    <button 
                        className={`tab ${activeView === 'rentals' ? 'active' : ''}`}
                        onClick={() => setActiveView('rentals')}
                    >
                        Rentas
                    </button>
                    <button 
                        className={`tab ${activeView === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveView('profile')}
                    >
                        Mi Perfil
                    </button>
                </div>

                {/* Vista de vehículos */}
                {activeView === 'vehicles' && (
                    <div className="vehicles-section">
                        <div className="section-header">
                            <h2>Gestión de Vehículos</h2>
                            <button 
                                className="add-btn"
                                onClick={() => setShowVehicleForm(true)}
                            >
                                Agregar Vehículo
                            </button>
                        </div>                        <div className="vehicles-grid">
                            {vehicles.map(vehicle => (
                                <div key={vehicle.vehicleId || vehicle.id} className="vehicle-card">
                                    {/* Imagen del vehículo */}
                                    <div className="vehicle-image-container">
                                        <img 
                                            src={vehicle.imageUrl} 
                                            alt={`${vehicle.brand} ${vehicle.model}`}
                                            className="vehicle-image"
                                            onError={(e) => {
                                                e.target.src = imageService.defaultImage;
                                            }}
                                        />
                                        {vehicle.isRented && (
                                            <div className="rental-badge">Rentado</div>
                                        )}
                                    </div>
                                    
                                    <div className="vehicle-info">
                                        <h3 className="vehicle-title">{vehicle.brand || 'Marca N/A'} {vehicle.model || 'Modelo N/A'}</h3>
                                        <div className="vehicle-details">
                                            <p><strong>Año:</strong> {vehicle.year || 'N/A'}</p>
                                            <p><strong>Placa:</strong> {vehicle.plate || 'N/A'}</p>
                                            <p><strong>Color:</strong> {vehicle.color || 'N/A'}</p>
                                            <p><strong>Precio:</strong> ${vehicle.price ? vehicle.price.toLocaleString() : 'N/A'}</p>
                                            <p className={`status ${vehicle.isRented ? 'rented' : 'available'}`}>
                                                {vehicle.isRented ? 'Rentado' : 'Disponible'}
                                            </p>
                                            {vehicle.customers && (
                                                <div className="customer-info">
                                                    <p><strong>Cliente:</strong> {vehicle.customers.name || 'Nombre N/A'} {vehicle.customers.lastName || 'Apellido N/A'}</p>
                                                    {vehicle.customers.email && (
                                                        <p><strong>Email:</strong> {vehicle.customers.email}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="vehicle-actions">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(vehicle)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(vehicle.vehicleId || vehicle.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Vista de clientes */}
                {activeView === 'customers' && (
                    <div className="customers-section">
                        <h2>Lista de Clientes</h2>
                        <div className="customers-table">
                            <table>                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Email</th>
                                        <th>Teléfono</th>
                                        <th>Identificación</th>
                                        <th>Vehículo Rentado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead><tbody>
                                    {customers.map(customer => {
                                        const rentedVehicle = vehicles.find(v => v.customers?.id === customer.id || v.customers?.idCustomer === customer.idCustomer);
                                        return (
                                            <tr key={customer.id || customer.idCustomer}>
                                                <td>{customer.name || 'N/A'}</td>
                                                <td>{customer.lastName || 'N/A'}</td>
                                                <td>{customer.email || 'N/A'}</td>
                                                <td>{customer.phoneNumber || 'N/A'}</td>
                                                <td>{customer.identificationNumber || 'N/A'}</td>                                                <td>
                                                    {rentedVehicle ? 
                                                        `${rentedVehicle.brand || 'Marca N/A'} ${rentedVehicle.model || 'Modelo N/A'} (${rentedVehicle.plate || 'Placa N/A'})` : 
                                                        'Sin vehículo'
                                                    }
                                                </td>
                                                <td>
                                                    <button 
                                                        className="edit-customer-btn"
                                                        onClick={() => handleEditCustomer(customer)}
                                                        title="Editar cliente"
                                                    >
                                                        ✏️
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>                        </div>
                    </div>
                )}

                {/* Vista de rentas */}
                {activeView === 'rentals' && (
                    <div className="rentals-section">
                        <h2>Gestión de Rentas</h2>
                        <div className="rentals-overview">
                            <div className="rental-stats">
                                <div className="stat-card">
                                    <h3>Total de Rentas</h3>
                                    <p className="stat-number">{rentals.length}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Rentas Activas</h3>
                                    <p className="stat-number">{rentals.filter(rental => rental.isActive).length}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Vehículos Rentados</h3>
                                    <p className="stat-number">{vehicles.filter(vehicle => vehicle.isRented).length}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rentals-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID Renta</th>
                                        <th>Cliente</th>
                                        <th>Vehículo</th>
                                        <th>Fecha Inicio</th>
                                        <th>Fecha Fin</th>
                                        <th>Precio Total</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentals.map(rental => {
                                        const customer = customers.find(c => c.id === rental.customerId || c.idCustomer === rental.customerId);
                                        const vehicle = vehicles.find(v => v.id === rental.vehicleId || v.vehicleId === rental.vehicleId);
                                        
                                        return (
                                            <tr key={rental.id || rental.rentalId}>
                                                <td>{rental.id || rental.rentalId || 'N/A'}</td>
                                                <td>
                                                    {customer ? 
                                                        `${customer.name || 'N/A'} ${customer.lastName || 'N/A'}` : 
                                                        'Cliente no encontrado'
                                                    }
                                                    {customer?.email && (
                                                        <div className="customer-email">{customer.email}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    {vehicle ? 
                                                        `${vehicle.brand || 'N/A'} ${vehicle.model || 'N/A'} (${vehicle.plate || 'N/A'})` : 
                                                        'Vehículo no encontrado'
                                                    }
                                                </td>
                                                <td>{rental.startDate ? new Date(rental.startDate).toLocaleDateString() : 'N/A'}</td>
                                                <td>{rental.endDate ? new Date(rental.endDate).toLocaleDateString() : 'N/A'}</td>
                                                <td>${rental.totalPrice ? rental.totalPrice.toLocaleString() : 'N/A'}</td>
                                                <td>
                                                    <span className={`rental-status ${rental.isActive ? 'active' : 'inactive'}`}>
                                                        {rental.isActive ? 'Activa' : 'Finalizada'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="rental-actions">
                                                        <button className="view-btn" title="Ver detalles">
                                                            👁️
                                                        </button>
                                                        {rental.isActive && (
                                                            <button className="end-rental-btn" title="Finalizar renta">
                                                                🏁
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {rentals.length === 0 && (
                                <div className="no-rentals">
                                    <p>No hay rentas registradas</p>
                                </div>
                            )}
                        </div>
                    </div>                )}

                {/* Vista del perfil del asesor */}
                {activeView === 'profile' && (
                    <div className="profile-section">
                        <div className="section-header">
                            <h2>Mi Perfil</h2>
                            <button 
                                className="edit-profile-btn"
                                onClick={handleEditAssessor}
                                disabled={!assessorInfo}
                            >
                                Editar Perfil
                            </button>
                        </div>
                        
                        {assessorInfo ? (
                            <div className="profile-info">
                                <div className="profile-card">
                                    <div className="profile-header">
                                        <div className="profile-avatar">
                                            <span className="avatar-initials">
                                                {assessorInfo.name ? assessorInfo.name.charAt(0).toUpperCase() : 'A'}
                                            </span>
                                        </div>
                                        <div className="profile-basic">
                                            <h3>{assessorInfo.name || 'Nombre no disponible'}</h3>
                                            <p className="profile-role">Asesor Comercial</p>
                                        </div>
                                    </div>
                                    
                                    <div className="profile-details">
                                        <div className="detail-group">
                                            <label>Email:</label>
                                            <span>{assessorInfo.email || 'No disponible'}</span>
                                        </div>
                                        <div className="detail-group">
                                            <label>Teléfono:</label>
                                            <span>{assessorInfo.phone || 'No disponible'}</span>
                                        </div>
                                        <div className="detail-group">
                                            <label>Dirección:</label>
                                            <span>{assessorInfo.address || 'No disponible'}</span>
                                        </div>
                                        <div className="detail-group">
                                            <label>Sucursal:</label>
                                            <span>{assessorInfo.branch?.name || 'No asignada'}</span>
                                        </div>
                                        <div className="detail-group">
                                            <label>Administrador:</label>
                                            <span>{assessorInfo.admin?.name || 'No asignado'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-loading">
                                <p>Cargando información del perfil...</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal para formulario de vehículo */}
            {showVehicleForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}</h3>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="vehicle-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Marca:</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={editingVehicle ? editingVehicle.brand : newVehicle.brand}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Modelo:</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={editingVehicle ? editingVehicle.model : newVehicle.model}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Año:</label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={editingVehicle ? editingVehicle.year : newVehicle.year}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Placa:</label>
                                    <input
                                        type="text"
                                        name="plate"
                                        value={editingVehicle ? editingVehicle.plate : newVehicle.plate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>                            <div className="form-row">
                                <div className="form-group">
                                    <label>Color:</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={editingVehicle ? editingVehicle.color : newVehicle.color}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Precio:</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={editingVehicle ? editingVehicle.price : newVehicle.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>URL de Imagen:</label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={editingVehicle ? editingVehicle.imageUrl || '' : newVehicle.imageUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://ejemplo.com/imagen-vehiculo.jpg"
                                />
                                <small>URL opcional de una imagen del vehículo</small>
                            </div>
                            {/* Vista previa de imagen */}
                            {((editingVehicle && editingVehicle.imageUrl) || (!editingVehicle && newVehicle.imageUrl)) && (
                                <div className="image-preview">
                                    <label>Vista previa:</label>
                                    <img 
                                        src={editingVehicle ? editingVehicle.imageUrl : newVehicle.imageUrl}
                                        alt="Vista previa del vehículo"
                                        style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isRented"
                                        checked={editingVehicle ? editingVehicle.isRented : newVehicle.isRented}
                                        onChange={handleInputChange}
                                    />
                                    ¿Está rentado?
                                </label>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="cancel-btn">
                                    Cancelar
                                </button>
                                <button type="submit" className="submit-btn">
                                    {editingVehicle ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>                </div>
            )}

            {/* Modal para formulario de edición de cliente */}
            {showCustomerForm && editingCustomer && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Editar Cliente</h3>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleCustomerSubmit} className="customer-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editingCustomer.name || ''}
                                        onChange={handleCustomerInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido:</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={editingCustomer.lastName || ''}
                                        onChange={handleCustomerInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editingCustomer.email || ''}
                                        onChange={handleCustomerInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono:</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={editingCustomer.phoneNumber || editingCustomer.phone || ''}
                                        onChange={handleCustomerInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Identificación:</label>                                    <select
                                        name="identificationType"
                                        value={editingCustomer.identificationType || ''}
                                        onChange={handleCustomerInputChange}
                                        required
                                    >
                                        <option key="default" value="">Seleccionar</option>
                                        <option key="CC" value="CC">Cédula de Ciudadanía</option>
                                        <option key="CE" value="CE">Cédula de Extranjería</option>
                                        <option key="PA" value="PA">Pasaporte</option>
                                        <option key="TI" value="TI">Tarjeta de Identidad</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Número de Identificación:</label>
                                    <input
                                        type="text"
                                        name="identificationNumber"
                                        value={editingCustomer.identificationNumber || ''}
                                        onChange={handleCustomerInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Género:</label>                                    <select
                                        name="genderType"
                                        value={editingCustomer.genderType || ''}
                                        onChange={handleCustomerInputChange}
                                        required
                                    >
                                        <option key="default-gender" value="">Seleccionar</option>
                                        <option key="masculino" value="Masculino">Masculino</option>
                                        <option key="femenino" value="Femenino">Femenino</option>
                                        <option key="otro" value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Nacionalidad:</label>
                                    <input
                                        type="text"
                                        name="nationality"
                                        value={editingCustomer.nationality || ''}
                                        onChange={handleCustomerInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Licencia de Conducir:</label>
                                <input
                                    type="text"
                                    name="license"
                                    value={editingCustomer.license || ''}
                                    onChange={handleCustomerInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nueva Contraseña (dejar vacío para mantener la actual):</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={editingCustomer.password || ''}
                                    onChange={handleCustomerInputChange}
                                    placeholder="Nueva contraseña (opcional)"
                                />
                                <small>Dejar vacío si no desea cambiar la contraseña</small>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="cancel-btn">
                                    Cancelar
                                </button>
                                <button type="submit" className="submit-btn">
                                    Actualizar Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para formulario de edición del asesor */}
            {showAssessorForm && editingAssessor && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Editar Mi Perfil</h3>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleAssessorSubmit} className="assessor-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editingAssessor.name || ''}
                                        onChange={handleAssessorInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editingAssessor.email || ''}
                                        onChange={handleAssessorInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teléfono:</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editingAssessor.phone || ''}
                                        onChange={handleAssessorInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dirección:</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={editingAssessor.address || ''}
                                        onChange={handleAssessorInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Nueva Contraseña (dejar vacío para mantener la actual):</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={editingAssessor.password || ''}
                                    onChange={handleAssessorInputChange}
                                    placeholder="Nueva contraseña (opcional)"
                                />
                                <small>Dejar vacío si no desea cambiar la contraseña</small>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="cancel-btn">
                                    Cancelar
                                </button>
                                <button type="submit" className="submit-btn">
                                    Actualizar Perfil
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}