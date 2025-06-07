import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { genericAlert, redirectionAlert } from "../helpers/functions";
import './rental.css';

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
    const handleAuthenticationCheck = () => {
        if (!isUserAuthenticated()) {
            genericAlert(
                "Autenticación requerida",
                "Debes iniciar sesión para poder alquilar vehículos. ¿Deseas ir a la página de login?",
                "question"
            ).then((result) => {
                if (result.isConfirmed) {
                    redirectionAlert(
                        navigate,
                        "Redirigiendo...",
                        "Te llevamos a la página de login",
                        "info",
                        "/login"
                    );
                }
            });
            return false;
        }
        return true;
    };

    // Cargar vehículos del endpoint real
    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:8080/vehicle')
            .then(response => response.json())
            .then(data => {
                console.log('Vehículos cargados:', data);
                // Filtrar solo vehículos disponibles (sin rentals activos)
                const availableVehicles = data.filter(vehicle => {
                    const hasActiveRentals = vehicle.rentals && Array.isArray(vehicle.rentals) && vehicle.rentals.length > 0;
                    return !hasActiveRentals && vehicle.brand && vehicle.model;
                }).map(vehicle => ({
                    ...vehicle,
                    id: vehicle.vehicleId || vehicle.id,
                    image: vehicle.imageUrl || 'https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg',
                    price: vehicle.price || Math.floor(Math.random() * 500) + 250 // Precio aleatorio entre 250-750 si no existe
                }));
                
                setVehicles(availableVehicles);
                setFilteredVehicles(availableVehicles);
                setLoading(false);
            })
            .catch(error => {
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
                    }
                ];
                setVehicles(fallbackData);
                setFilteredVehicles(fallbackData);
            });
    }, []);const handleFilterChange = (e) => {
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

        // Verificar autenticación antes de agregar al carrito
        if (!handleAuthenticationCheck()) {
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
    };

    const handleCheckout = () => {
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

        // Aquí se implementaría la lógica de checkout/pago
        // Por ahora, mostrar un resumen y confirmar la reserva
        const totalPrice = getTotalPrice();
        const itemsCount = cart.length;
        const user = JSON.parse(localStorage.getItem("User"));

        genericAlert(
            "Confirmar Reserva",
            `¿Confirmas la reserva de ${itemsCount} vehículo(s) por un total de $${totalPrice.toLocaleString()}?`,
            "question"
        ).then((result) => {
            if (result.isConfirmed) {
                // Aquí se enviaría la información al backend para crear las reservas
                // Por ahora, simulamos el proceso
                genericAlert(
                    "¡Reserva confirmada!",
                    `Hola ${user.name}, tu reserva ha sido procesada exitosamente. Te contactaremos pronto con los detalles.`,
                    "success"
                ).then(() => {
                    // Limpiar el carrito después de la reserva exitosa
                    setCart([]);
                    setShowCart(false);
                });
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
    const handleDirectReservation = (vehicle) => {
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
        }

        // Verificar autenticación
        if (!handleAuthenticationCheck()) {
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
        ).then((result) => {
            if (result.isConfirmed) {
                // Aquí se enviaría la información al backend para crear la reserva
                // Por ahora, simulamos el proceso
                const reservationData = {
                    vehicleId: vehicle.vehicleId || vehicle.id,
                    customerId: user.idCustomer || user.id,
                    startDate: startDate,
                    endDate: endDate,
                    totalCost: totalCost,
                    vehicle: vehicle,
                    customer: user
                };

                console.log('Datos de reserva:', reservationData);

                // Simular llamada al backend
                genericAlert(
                    "¡Reserva exitosa!",
                    `Hola ${user.name}, tu reserva del ${vehicle.brand} ${vehicle.model} ha sido confirmada. Te contactaremos pronto con los detalles de entrega.`,
                    "success"
                ).then(() => {
                    // Limpiar las fechas después de la reserva
                    setVehicleDates(prev => ({
                        ...prev,
                        [vehicle.id]: { startDate: '', endDate: '' }
                    }));
                });
            }
        });
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
                            ) : (
                                filteredVehicles.map(vehicle => (
                                    <div key={vehicle.id} className="vehicle-card">
                                        <div className="vehicle-image-container">
                                            <img 
                                                src={vehicle.image} 
                                                alt={`${vehicle.brand} ${vehicle.model}`}
                                                className="vehicle-image"
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
                                                            value={vehicleDates[vehicle.id]?.startDate || ''}
                                                            onChange={(e) => handleVehicleDateChange(vehicle.id, 'startDate', e.target.value)}
                                                            min={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                    <div className="date-field-vehicle">
                                                        <label>Fin:</label>
                                                        <input 
                                                            type="date"
                                                            value={vehicleDates[vehicle.id]?.endDate || ''}
                                                            onChange={(e) => handleVehicleDateChange(vehicle.id, 'endDate', e.target.value)}
                                                            min={vehicleDates[vehicle.id]?.startDate || new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {vehicleDates[vehicle.id]?.startDate && vehicleDates[vehicle.id]?.endDate && (
                                                <div className="rental-calculation">
                                                    <p className="rental-days">
                                                        ⏰ {calculateDays(vehicleDates[vehicle.id].startDate, vehicleDates[vehicle.id].endDate)} días
                                                    </p>
                                                    <p className="total-cost">
                                                        💰 Total: ${(vehicle.price * calculateDays(vehicleDates[vehicle.id].startDate, vehicleDates[vehicle.id].endDate)).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}<div className="vehicle-actions">
                                                <button 
                                                    className="add-to-cart-btn"
                                                    onClick={() => addToCart(vehicle)}
                                                    disabled={!vehicleDates[vehicle.id]?.startDate || !vehicleDates[vehicle.id]?.endDate}
                                                >
                                                    {!vehicleDates[vehicle.id]?.startDate || !vehicleDates[vehicle.id]?.endDate 
                                                        ? '📅 Selecciona fechas' 
                                                        : '🛒 Agregar al Carrito'
                                                    }
                                                </button>
                                                
                                                <button 
                                                    className="reserve-btn"
                                                    onClick={() => handleDirectReservation(vehicle)}
                                                    disabled={!vehicleDates[vehicle.id]?.startDate || !vehicleDates[vehicle.id]?.endDate}
                                                >
                                                    {!vehicleDates[vehicle.id]?.startDate || !vehicleDates[vehicle.id]?.endDate 
                                                        ? '📅 Selecciona fechas' 
                                                        : '🎯 Reservar Ahora'
                                                    }
                                                </button>                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default Rental;