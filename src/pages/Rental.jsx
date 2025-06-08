import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { genericAlert } from "../helpers/functions";
import { imageService } from "../services/imageService";
import './rental.css';
import Reserve from '../components/Reserve';

const Rental = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        model: '',
        year: '',
        brand: '',
        minPrice: '',
        maxPrice: ''
    });    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [vehicleDates, setVehicleDates] = useState({}); // Fechas individuales por vehículo
    const [showFilters, setShowFilters] = useState(false);

    // Verificar si el usuario está autenticado
    const isUserAuthenticated = () => {
        const user = localStorage.getItem("User");
        const token = localStorage.getItem("Token");
        return user && token;
    };    // Función para manejar la autenticación antes de agregar al carrito
    const handleAuthenticationCheck = (vehicleToSave = null) => {
        if (!isUserAuthenticated()) {
            genericAlert(
                "Autenticación requerida",
                "Debes iniciar sesión para poder alquilar vehículos. ¿Deseas ir a la página de login?",
                "question"
            ).then((result) => {
                if (result.isConfirmed) {
                    // Guardar el vehículo que el usuario quería alquilar
                    if (vehicleToSave) {
                        const vehicleDatesForVehicle = vehicleDates[vehicleToSave.id] || {};
                        const pendingRental = {
                            vehicle: vehicleToSave,
                            dates: vehicleDatesForVehicle,
                            timestamp: Date.now()
                        };
                        localStorage.setItem('pendingRental', JSON.stringify(pendingRental));
                    }
                    
                    // Redirigir al login
                    navigate("/login");
                }
            });
            return false;
        }
        return true;
    };    // Cargar vehículos del endpoint real
    useEffect(() => {
        const loadVehicles = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:8080/vehicle');
                const data = await response.json();
                console.log('Vehículos cargados:', data);
                
                // Filtrar solo vehículos disponibles (sin rentals activos)
                const availableVehicles = data.filter(vehicle => {
                    const hasActiveRentals = vehicle.rentals && Array.isArray(vehicle.rentals) && vehicle.rentals.length > 0;
                    return !hasActiveRentals && vehicle.brand && vehicle.model;
                });

                // Procesar imágenes con el servicio de mapeo
                const vehiclesWithImages = await Promise.all(availableVehicles.map(async (vehicle) => {
                    let finalImageUrl;
                    
                    // Si la API provee imageUrl, usarla; si no, usar el servicio de mapeo
                    if (vehicle.imageUrl && vehicle.imageUrl.trim() !== '') {
                        finalImageUrl = await imageService.getValidatedImage(vehicle.brand, vehicle.model, vehicle.imageUrl);
                    } else {
                        finalImageUrl = await imageService.getValidatedImage(vehicle.brand, vehicle.model);
                    }
                      return {
                        ...vehicle,
                        id: vehicle.vehicleId || vehicle.id,
                        image: finalImageUrl,
                        price: vehicle.price || vehicle.dailyRate || Math.floor(Math.random() * 500) + 250
                    };
                }));
                  setVehicles(vehiclesWithImages);
                setFilteredVehicles(vehiclesWithImages);
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
                // Datos de fallback si el API no responde
                const fallbackData = [
                    {
                        id: 1,
                        vehicleId: 1,
                        brand: 'Toyota',
                        model: 'Camry',
                        type: 'Sedán',
                        year: 2023,
                        color: 'Blanco',
                        plate: 'ABC-123',
                        price: 750,
                        image: 'https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg'
                    },
                    {
                        id: 2,
                        vehicleId: 2,
                        brand: 'Honda',
                        model: 'Civic',
                        type: 'Sedán',
                        year: 2022,
                        color: 'Negro',
                        plate: 'DEF-456',
                        price: 650,
                        image: 'https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg'
                    }                ];
                
                setVehicles(fallbackData);
                setFilteredVehicles(fallbackData);
            }
        };
        
        loadVehicles();
    }, []);

    // Detectar si el usuario regresó del login con un vehículo pendiente
    useEffect(() => {
        const checkPendingRental = () => {
            // Solo procesar si el usuario está autenticado y hay un vehículo pendiente
            if (isUserAuthenticated()) {
                const pendingRental = localStorage.getItem('pendingRental');
                if (pendingRental) {
                    try {
                        const { vehicle, dates, timestamp } = JSON.parse(pendingRental);
                        
                        // Verificar que la información no sea muy antigua (24 horas)
                        const hoursSinceSaved = (Date.now() - timestamp) / (1000 * 60 * 60);
                        if (hoursSinceSaved < 24) {
                            // Restaurar las fechas del vehículo
                            if (dates.startDate && dates.endDate) {
                                setVehicleDates(prev => ({
                                    ...prev,
                                    [vehicle.id]: dates
                                }));
                            }
                            
                            // Mostrar mensaje de bienvenida y pregunta para continuar
                            setTimeout(() => {
                                genericAlert(
                                    "¡Bienvenido de vuelta!",
                                    `¿Deseas continuar con el alquiler del ${vehicle.brand} ${vehicle.model} que estabas viendo?`,
                                    "question"
                                ).then((result) => {
                                    if (result.isConfirmed) {
                                        // Agregar directamente al carrito si tenía fechas
                                        if (dates.startDate && dates.endDate) {
                                            const cartItem = {
                                                ...vehicle,
                                                startDate: dates.startDate,
                                                endDate: dates.endDate,
                                                cartId: Date.now()
                                            };
                                            setCart(prevCart => [...prevCart, cartItem]);
                                            setShowCart(true);
                                            
                                            genericAlert(
                                                "¡Agregado al carrito!",
                                                `${vehicle.brand} ${vehicle.model} ha sido agregado a tu carrito de alquiler`,
                                                "success"
                                            );
                                        }
                                    }
                                    // Limpiar el vehículo pendiente independientemente de la respuesta
                                    localStorage.removeItem('pendingRental');
                                });
                            }, 1000); // Esperar 1 segundo para que la página se cargue completamente
                        } else {
                            // Si es muy antigua, eliminar la información
                            localStorage.removeItem('pendingRental');
                        }
                    } catch (error) {
                        console.error('Error al procesar vehículo pendiente:', error);
                        localStorage.removeItem('pendingRental');
                    }
                }
            }
        };

        // Solo ejecutar una vez cuando el componente se monta
        checkPendingRental();
    }, [vehicles]); // Depende de vehicles para asegurar que ya estén cargados

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prevDates => ({
            ...prevDates,
            [name]: value
        }));
    };

    // Función para manejar fechas individuales por vehículo
    const handleVehicleDateChange = (vehicleId, field, value) => {
        setVehicleDates(prev => ({
            ...prev,
            [vehicleId]: {
                ...prev[vehicleId],
                [field]: value
            }
        }));
    };

    const handleSearch = () => {
        const filtered = vehicles.filter(vehicle => {
            const priceMatch = (!filters.minPrice || vehicle.price >= parseFloat(filters.minPrice)) &&
                             (!filters.maxPrice || vehicle.price <= parseFloat(filters.maxPrice));
            
            return (
                (!filters.type || vehicle.type.toLowerCase().includes(filters.type.toLowerCase())) &&
                (!filters.model || vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) &&
                (!filters.year || vehicle.year.toString() === filters.year) &&
                (!filters.brand || vehicle.brand.toLowerCase().includes(filters.brand.toLowerCase())) &&
                priceMatch
            );
        });
        setFilteredVehicles(filtered);
    };    const addToCart = (vehicle) => {
        const vehicleDatesForVehicle = vehicleDates[vehicle.id] || {};
        const { startDate, endDate } = vehicleDatesForVehicle;

        if (!startDate || !endDate) {
            genericAlert(
                "Fechas requeridas",
                "Por favor selecciona las fechas de alquiler antes de agregar al carrito",
                "warning"
            );
            return;
        }

        // Verificar autenticación antes de agregar al carrito, pasando el vehículo para guardarlo
        if (!handleAuthenticationCheck(vehicle)) {
            return;
        }

        const cartItem = {
            ...vehicle,
            startDate: startDate,
            endDate: endDate,
            cartId: Date.now() // ID único para el carrito
        };

        setCart(prevCart => [...prevCart, cartItem]);
        
        genericAlert(
            "¡Agregado al carrito!",
            `${vehicle.brand} ${vehicle.model} ha sido agregado a tu carrito de alquiler`,
            "success"
        );
    };

    const removeFromCart = (cartId) => {
        setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    };

    const calculateDays = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => {
            const days = calculateDays(item.startDate, item.endDate);
            return total + (item.price * days);
        }, 0);
    };    const handleCheckout = async () => {
        // Verificar autenticación antes del checkout
        if (!handleAuthenticationCheck()) {
            return;
        }

        if (cart.length === 0) {
            genericAlert(
                "Carrito vacío",
                "Agrega al menos un vehículo al carrito antes de proceder al pago",
                "warning"
            );
            return;
        }

        const totalPrice = getTotalPrice();
        const itemsCount = cart.length;
        const user = JSON.parse(localStorage.getItem("User"));

        // Confirmar reserva múltiple
        genericAlert(
            "Confirmar Reserva",
            `¿Confirmas la reserva de ${itemsCount} vehículo(s) por un total de $${totalPrice.toLocaleString()}?`,
            "question"
        ).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Mostrar indicador de carga
                    genericAlert(
                        "Procesando reservas...",
                        "Estamos creando tus reservas, por favor espera",
                        "info"
                    );                    // Crear reservas para cada vehículo en el carrito
                    const reservationPromises = cart.map(async (item) => {
                        const days = calculateDays(item.startDate, item.endDate);
                        const itemTotalCost = item.price * days;
                        const reservationData = createReservationData(item, item.startDate, item.endDate, itemTotalCost, user);

                        const response = await fetch('http://localhost:8080/rental', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem("Token")}`
                            },
                            body: JSON.stringify(reservationData)
                        });

                        if (!response.ok) {
                            throw new Error(`Error al reservar ${item.brand} ${item.model}`);
                        }

                        return await response.json();
                    });

                    // Esperar a que todas las reservas se completen
                    const createdRentals = await Promise.all(reservationPromises);
                    console.log('Reservas creadas exitosamente:', createdRentals);

                    // Mostrar confirmación de éxito
                    genericAlert(
                        "¡Reservas confirmadas!",
                        `Hola ${user.name}, todas tus reservas han sido procesadas exitosamente. Total: ${createdRentals.length} vehículos reservados.`,
                        "success"
                    ).then(() => {
                        // Limpiar el carrito después de la reserva exitosa
                        setCart([]);
                        setShowCart(false);
                        
                        // Recargar la página para actualizar disponibilidad
                        window.location.reload();
                    });

                } catch (error) {
                    console.error('Error al procesar las reservas:', error);
                    
                    genericAlert(
                        "Error en el proceso",
                        "Hubo un problema al procesar algunas reservas. Por favor verifica tu cuenta y vuelve a intentar.",
                        "error"
                    );
                }
            }
        });
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            model: '',
            year: '',
            brand: '',
            minPrice: '',
            maxPrice: ''
        });
        setFilteredVehicles(vehicles);
    };    // Función para reservar directamente un vehículo sin agregar al carrito
    const HANDLE_DIRECT_RESERVATION = async (vehicle) => {
        const vehicleDatesForVehicle = vehicleDates[vehicle.id] || {};
        const { startDate, endDate } = vehicleDatesForVehicle;

        // Verificar fechas seleccionadas
        if (!startDate || !endDate) {
            genericAlert(
                "Fechas requeridas",
                "Por favor selecciona las fechas de inicio y fin del alquiler",
                "warning"
            );
            return;
        }        // Verificar autenticación
        if (!handleAuthenticationCheck(vehicle)) {
            return;
        }

        const days = calculateDays(startDate, endDate);
        const totalCost = vehicle.price * days;
        const user = JSON.parse(localStorage.getItem("User"));

        // Confirmar reserva directa
        genericAlert(
            "Confirmar Reserva Directa",
            `¿Deseas reservar el ${vehicle.brand} ${vehicle.model} desde ${startDate} hasta ${endDate}? (${days} días por $${totalCost.toLocaleString()})`,
            "question"
        ).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Mostrar indicador de carga
                    genericAlert(
                        "Procesando reserva...",
                        "Estamos creando tu reserva, por favor espera",
                        "info"
                    );                    // Preparar datos para el backend usando función auxiliar
                    const reservationData = createReservationData(vehicle, startDate, endDate, totalCost, user);

                    console.log('Enviando datos de reserva:', reservationData);

                    // Llamada real al backend para crear la reserva
                    const response = await fetch('http://localhost:8080/rental', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem("Token")}` // Si usas tokens de autenticación
                        },
                        body: JSON.stringify(reservationData)
                    });

                    if (response.ok) {
                        const createdRental = await response.json();
                        console.log('Reserva creada exitosamente:', createdRental);
                        
                        // Mostrar confirmación de éxito
                        genericAlert(
                            "¡Reserva exitosa!",
                            `Hola ${user.name}, tu reserva del ${vehicle.brand} ${vehicle.model} ha sido confirmada. Número de reserva: ${createdRental.id || 'N/A'}`,
                            "success"
                        ).then(() => {
                            // Limpiar las fechas después de la reserva exitosa
                            setVehicleDates(prev => ({
                                ...prev,
                                [vehicle.id]: { startDate: '', endDate: '' }
                            }));

                            // Recargar la lista de vehículos para actualizar disponibilidad
                            window.location.reload();
                        });
                    } else {
                        // Manejar errores del servidor
                        const errorData = await response.json().catch(() => ({}));
                        console.error('Error del servidor:', errorData);
                        
                        genericAlert(
                            "Error en la reserva",
                            errorData.message || "Hubo un problema al procesar tu reserva. Por favor intenta nuevamente.",
                            "error"
                        );
                    }
                } catch (error) {
                    // Manejar errores de red o conexión
                    console.error('Error al crear la reserva:', error);
                    
                    genericAlert(
                        "Error de conexión",
                        "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.",
                        "error"
                    );
                }
            }
        });
    };    // Función auxiliar para crear datos de reserva consistentes
    const createReservationData = (vehicle, startDate, endDate, totalCost, user) => {
        // Convertir fechas a formato ISO con hora (como espera el backend)
        const formatDateWithTime = (dateStr) => {
            return `${dateStr}T09:00:00`;
        };

        return {
            name: `Alquiler ${vehicle.brand} ${vehicle.model}`,
            description: `Alquiler de vehículo ${vehicle.brand} ${vehicle.model} ${vehicle.year || 'N/A'} (${vehicle.color || 'Color N/A'}) desde ${startDate} hasta ${endDate}. Placa: ${vehicle.plate || 'N/A'}`,
            price: totalCost,
            startDate: formatDateWithTime(startDate),
            endDate: formatDateWithTime(endDate),
            status: "PENDING", // Cambiado de ACTIVE a PENDING como en tu ejemplo
            // Objetos anidados con IDs (como espera tu backend)
            vehicle: {
                vehicleId: vehicle.vehicleId || vehicle.id
            },
            customer: {
                idCustomer: user.idCustomer || user.id
            },
            branch: {
                idBranch: user.branchId || user.idBranch || 1
            },
            assessor: {
                idAssessor: user.assessorId || user.idAssessor || 1 // Asesor por defecto si no tiene
            }
        };
    };

    return (
        <div className="rental-container">
            {/* Header con título y carrito */}
            <header className="rental-header">
                <div className="header-content">
                    <h1 className="rental-title">
                        <span className="title-icon">🚗</span>
                        Catálogo de Vehículos
                    </h1>
                    <div className="header-actions">
                        <button 
                            className="toggle-filters-btn"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <span className="filter-icon">🔍</span>
                            Filtros
                        </button>
                        <button 
                            className="cart-btn"
                            onClick={() => setShowCart(!showCart)}
                        >
                            <span className="cart-icon">🛒</span>
                            Carrito ({cart.length})
                        </button>
                    </div>
                </div>
            </header>

            {/* Panel de filtros */}
            <div className={`filters-panel ${showFilters ? 'active' : ''}`}>
                <div className="filters-content">
                    <div className="date-selector">
                        <h3>📅 Fechas de Alquiler</h3>
                        <div className="date-inputs">
                            <div className="date-field">
                                <label>Fecha Inicio:</label>
                                <input 
                                    type="date"
                                    name="startDate"
                                    value={dateRange.startDate}
                                    onChange={handleDateChange}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="date-field">
                                <label>Fecha Fin:</label>
                                <input 
                                    type="date"
                                    name="endDate"
                                    value={dateRange.endDate}
                                    onChange={handleDateChange}
                                    min={dateRange.startDate || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="filters-section">
                        <h3>🔧 Filtros de Búsqueda</h3>
                        <div className="filters-grid">
                            <select 
                                name="type" 
                                value={filters.type}
                                onChange={handleFilterChange}
                                className="filter-select"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="Sedan">Sedán</option>
                                <option value="Truck">Camioneta</option>
                                <option value="SUV">SUV</option>
                                <option value="Hatchback">Hatchback</option>
                            </select>

                            <input 
                                type="text"
                                name="brand"
                                placeholder="Marca del vehículo"
                                value={filters.brand}
                                onChange={handleFilterChange}
                                className="filter-input"
                            />

                            <input 
                                type="text"
                                name="model"
                                placeholder="Modelo del vehículo"
                                value={filters.model}
                                onChange={handleFilterChange}
                                className="filter-input"
                            />

                            <input 
                                type="number"
                                name="year"
                                placeholder="Año"
                                value={filters.year}
                                onChange={handleFilterChange}
                                className="filter-input"
                            />

                            <input 
                                type="number"
                                name="minPrice"
                                placeholder="Precio mínimo por día"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                className="filter-input"
                            />

                            <input 
                                type="number"
                                name="maxPrice"
                                placeholder="Precio máximo por día"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-actions">
                            <button className="search-btn" onClick={handleSearch}>
                                🔍 Buscar Vehículos
                            </button>
                            <button className="clear-btn" onClick={clearFilters}>
                                🧹 Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carrito lateral */}
            <div className={`cart-sidebar ${showCart ? 'active' : ''}`}>
                <div className="cart-header">
                    <h3>🛒 Carrito de Alquiler</h3>
                    <button className="close-cart" onClick={() => setShowCart(false)}>×</button>
                </div>
                <div className="cart-content">
                    {cart.length === 0 ? (
                        <div className="cart-empty">
                            <p>Tu carrito está vacío</p>
                            <span className="empty-icon">🛒</span>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {cart.map(item => (
                                    <div key={item.cartId} className="cart-item">
                                        <img src={item.image} alt={`${item.brand} ${item.model}`} />
                                        <div className="item-details">
                                            <h4>{item.brand} {item.model}</h4>
                                            <p className="item-dates">
                                                📅 {item.startDate} al {item.endDate}
                                            </p>
                                            <p className="item-days">
                                                ⏰ {calculateDays(item.startDate, item.endDate)} días
                                            </p>
                                            <p className="item-price">
                                                💰 ${(item.price * calculateDays(item.startDate, item.endDate)).toLocaleString()}
                                            </p>
                                        </div>
                                        <button 
                                            className="remove-item"
                                            onClick={() => removeFromCart(item.cartId)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="cart-summary">
                                <div className="total-price">
                                    <strong>Total: ${getTotalPrice().toLocaleString()}</strong>
                                </div>                                <button 
                                    className="checkout-btn"
                                    onClick={handleCheckout}
                                >
                                    💳 Proceder al Pago
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Overlay para el carrito */}
            {showCart && <div className="cart-overlay" onClick={() => setShowCart(false)}></div>}

            {/* Contenido principal */}
            <main className="rental-main">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Cargando vehículos disponibles...</p>
                    </div>
                ) : (
                    <>
                        <div className="results-info">
                            <h2>🚙 Vehículos Disponibles ({filteredVehicles.length})</h2>
                            {dateRange.startDate && dateRange.endDate && (
                                <p className="rental-period">
                                    📅 Para alquiler del {dateRange.startDate} al {dateRange.endDate}
                                </p>
                            )}
                        </div>

                        <div className="vehicles-grid">
                            {filteredVehicles.length === 0 ? (
                                <div className="no-results">
                                    <span className="no-results-icon">🔍</span>
                                    <h3>No se encontraron vehículos</h3>
                                    <p>Intenta ajustar tus filtros de búsqueda</p>
                                </div>
                            ) : (                                filteredVehicles.map(vehicle => {
                                    const vehicleDatesForVehicle = vehicleDates[vehicle.id] || {};
                                    const hasValidDates = vehicleDatesForVehicle.startDate && vehicleDatesForVehicle.endDate;
                                    
                                    return (
                                        <div key={vehicle.id} className="vehicle-card">                                            <div className="vehicle-image-container">
                                                <img 
                                                    src={vehicle.image}
                                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                                    className="vehicle-image"
                                                    onError={(e) => {
                                                        // Fallback en caso de error de carga de imagen
                                                        e.target.src = 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=400&h=300&fit=crop';
                                                    }}
                                                    loading="lazy"
                                                />
                                                <div className="price-badge">
                                                    ${vehicle.price}/día
                                                </div>
                                            </div>
                                            
                                            <div className="vehicle-info">
                                                <h3 className="vehicle-title">
                                                    {vehicle.brand} {vehicle.model}
                                                </h3>
                                                <div className="vehicle-specs">
                                                    <div className="spec-item">
                                                        <span className="spec-icon">🚗</span>
                                                        <span>{vehicle.type || 'Vehículo'}</span>
                                                    </div>
                                                    <div className="spec-item">
                                                        <span className="spec-icon">📅</span>
                                                        <span>{vehicle.year}</span>
                                                    </div>
                                                    <div className="spec-item">
                                                        <span className="spec-icon">🎨</span>
                                                        <span>{vehicle.color}</span>
                                                    </div>
                                                    <div className="spec-item">
                                                        <span className="spec-icon">🔢</span>
                                                        <span>{vehicle.plate}</span>
                                                    </div>
                                                </div>

                                                {/* Selección de fechas individual por vehículo */}
                                                <div className="vehicle-date-selection">
                                                    <h4>📅 Seleccionar Fechas</h4>
                                                    <div className="date-inputs-vehicle">
                                                        <div className="date-field-vehicle">
                                                            <label>Inicio:</label>
                                                            <input 
                                                                type="date"
                                                                value={vehicleDatesForVehicle.startDate || ''}
                                                                onChange={(e) => handleVehicleDateChange(vehicle.id, 'startDate', e.target.value)}
                                                                min={new Date().toISOString().split('T')[0]}
                                                            />
                                                        </div>
                                                        <div className="date-field-vehicle">
                                                            <label>Fin:</label>
                                                            <input 
                                                                type="date"
                                                                value={vehicleDatesForVehicle.endDate || ''}
                                                                onChange={(e) => handleVehicleDateChange(vehicle.id, 'endDate', e.target.value)}
                                                                min={vehicleDatesForVehicle.startDate || new Date().toISOString().split('T')[0]}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {hasValidDates && (
                                                    <div className="rental-calculation">
                                                        <p className="rental-days">
                                                            ⏰ {calculateDays(vehicleDatesForVehicle.startDate, vehicleDatesForVehicle.endDate)} días
                                                        </p>
                                                        <p className="total-cost">
                                                            💰 Total: ${(vehicle.price * calculateDays(vehicleDatesForVehicle.startDate, vehicleDatesForVehicle.endDate)).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="vehicle-actions">
                                                    <button 
                                                        className="add-to-cart-btn"
                                                        onClick={() => addToCart(vehicle)}
                                                        disabled={!hasValidDates}
                                                        style={{
                                                            opacity: hasValidDates ? 1 : 0.6,
                                                            cursor: hasValidDates ? 'pointer' : 'not-allowed'
                                                        }}
                                                    >
                                                        {!hasValidDates 
                                                            ? '📅 Selecciona fechas' 
                                                            : '🛒 Agregar al Carrito'
                                                        }
                                                    </button>
                                                    
                                                    <Reserve 
                                                        vehicle={vehicle}
                                                        vehicleDates={vehicleDates}
                                                        hasValidDates={vehicleDates[vehicle.id]?.startDate && vehicleDates[vehicle.id]?.endDate}
                                                        calculateDays={calculateDays}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default Rental;