import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CarouselCars from "../CarouselCars";
import "./panel.css";

function Panel({ activeSection, setActiveSection, user }) {
  const [rentedCars, setRentedCars] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [nextReservation] = useState(null);
  const [userInfo, setUserInfo] = useState(user || { name: 'Usuario', id: 'demo' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // ✅ FUNCIÓN PARA VALIDAR Y OBTENER EL ID DEL USUARIO
  const getUserId = useCallback(() => {
    // Primero, intentar obtener el ID del userInfo actual
    let userId = userInfo?.idCustomer || userInfo?.id || userInfo?.customer_id || userInfo?.userId;
    
    // Si no hay userId en userInfo, buscar en localStorage
    if (!userId) {
      const storedUser = localStorage.getItem("User");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser?.idCustomer || parsedUser?.id || parsedUser?.customer_id || parsedUser?.userId;
          
          // Si encontramos un usuario en localStorage, actualizar userInfo
          if (userId) {
            setUserInfo(parsedUser);
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
    }

    // Convertir a número si es posible
    const numericId = userId ? parseInt(userId, 10) : null;
    
    if (!numericId || isNaN(numericId)) {
      console.error("ID de usuario inválido:", userId, "userInfo:", userInfo);
      // En modo desarrollo, usar un ID demo válido
      if (userInfo?.id === 'demo') {
        return 1; // ID demo para pruebas
      }
      return null;
    }
    
    return numericId;
  }, [userInfo]);  // ✅ FUNCIÓN PARA REFRESCAR VEHÍCULOS (para uso en otras funciones)
  const refreshVehicles = async () => {
    try {
      const response = await fetch('http://localhost:8080/vehicle');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      const dataWithCorrectFields = data.map(vehicle => ({
        ...vehicle,
        vehicle_id: vehicle.vehicleId || vehicle.idVehicle || vehicle.vehicle_id || vehicle.id,
        image_url: vehicle.imageUrl || vehicle.image_url || vehicle.imageURL || 'https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg',
        price: vehicle.price || 750 // Precio por defecto si no viene del backend
      }));
        // Filtrar vehículos disponibles (sin rentals activos)
      const available = dataWithCorrectFields.filter(vehicle => {
        // Un vehículo está disponible si no tiene rentals activos
        const hasActiveRentals = vehicle.rentals && Object.keys(vehicle.rentals).length > 0;
        return !hasActiveRentals && vehicle.brand && vehicle.model; // También verificar que tenga datos básicos
      });
      setAvailableCars(available);
      
      // Obtener vehículos alquilados (con rentals activos)
      const rented = dataWithCorrectFields.filter(vehicle => {
        const hasActiveRentals = vehicle.rentals && Object.keys(vehicle.rentals).length > 0;
        return hasActiveRentals && vehicle.brand && vehicle.model;
      });
      setRentedCars(rented);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // ✅ FUNCIÓN PARA MANEJAR CAMBIOS EN LA INFORMACIÓN DEL USUARIO
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevUserInfo => ({
      ...prevUserInfo,
      [name]: value
    }));
  };

  // ✅ EFECTO PARA INICIALIZAR EL USUARIO
  useEffect(() => {
    // Si el usuario ya está inicializado, no hacer nada
    if (isInitialized) return;
    
    const storedUser = localStorage.getItem("User");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        // Crear usuario demo con ID válido
        const demoUser = { 
          name: 'Usuario Demo', 
          idCustomer: 1,
          id: 1,
          email: 'demo@c2k.com',
          phone: '123456789'
        };
        setUserInfo(demoUser);
        localStorage.setItem("User", JSON.stringify(demoUser));
      }
    } else {
      // Crear usuario demo con ID válido para pruebas
      const demoUser = { 
        name: 'Usuario Demo', 
        idCustomer: 1,
        id: 1,
        email: 'demo@c2k.com',
        phone: '123456789'
      };      setUserInfo(demoUser);
      localStorage.setItem("User", JSON.stringify(demoUser));
    }
    
    setIsInitialized(true);
  }, [isInitialized]);
  // ✅ EFECTO SEPARADO PARA CARGAR VEHÍCULOS
  useEffect(() => {
    if (!isInitialized) return;
    
    // Función interna para obtener vehículos
    const loadVehicles = async () => {
      try {
        const response = await fetch('http://localhost:8080/vehicle');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }        const data = await response.json();
        
        const dataWithCorrectFields = data.map(vehicle => ({
          ...vehicle,          vehicle_id: vehicle.vehicleId || vehicle.idVehicle || vehicle.vehicle_id || vehicle.id,          image_url: vehicle.imageUrl || vehicle.image_url || vehicle.imageURL || 'https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg',
          price: vehicle.price || 750 // Precio por defecto si no viene del backend
        }));
        
        // Filtrar vehículos disponibles (sin rentals activos)
      const available = dataWithCorrectFields.filter(vehicle => {
        // Un vehículo está disponible si no tiene rentals activos y tiene datos básicos
        const hasActiveRentals = vehicle.rentals && Array.isArray(vehicle.rentals) && vehicle.rentals.length > 0;
        return !hasActiveRentals && vehicle.brand && vehicle.model; // También verificar que tenga datos básicos
      });
      setAvailableCars(available);
      
      // Obtener vehículos alquilados (con rentals activos)
      const rented = dataWithCorrectFields.filter(vehicle => {
        const hasActiveRentals = vehicle.rentals && Array.isArray(vehicle.rentals) && vehicle.rentals.length > 0;
        return hasActiveRentals && vehicle.brand && vehicle.model;
      });
      setRentedCars(rented);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        // Cargar datos demo si hay error de conexión
        setAvailableCars([
          {
            vehicle_id: 1,
            brand: 'Toyota',
            model: 'Camry',
            type: 'Sedán',
            year: 2023,
            color: 'Blanco',
            plate: 'ABC-123',
            price: 750,
            image_url: 'https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg'
          }
        ]);
        setRentedCars([]);
        console.warn("Cargando datos demo debido a error de conexión:", error.message);
      }
    };
    
    loadVehicles();
  }, [isInitialized, userInfo?.id, getUserId]); 
  // Función para alquilar un vehículo
  const rentVehicle = async (vehicleId) => {
    const currentUserId = getUserId();
    
    if (!currentUserId) {
      alert("Error: Usuario no válido. Por favor, inicia sesión nuevamente.");
      return;
    }

    try {
      const selectedVehicle = availableCars.find(car => car.vehicle_id === vehicleId);
      if (!selectedVehicle) {
        throw new Error('Vehículo no encontrado');
      }

      // Datos para crear el rental - ajustados a tu modelo Java
      const rentalData = {
        description: `Alquiler del ${selectedVehicle.brand} ${selectedVehicle.model} (Placa: ${selectedVehicle.plate})`,
        name: `${selectedVehicle.brand} ${selectedVehicle.model}`,
        price: parseInt(selectedVehicle.price) || 750,
        // Asegúrate de que estos IDs existan en tu base de datos
        idBranch: 1, // ID de sucursal válido
        idVehicle: parseInt(vehicleId),
        idAssessor: 1, // ID de asesor válido
        idCustomer: parseInt(currentUserId),        idAdmin: 1 // ID de admin válido
      };

      const rentalResponse = await fetch('http://localhost:8080/rental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rentalData),
      });

      if (!rentalResponse.ok) {
        const errorText = await rentalResponse.text();
        console.error("Error en respuesta de rental:", errorText);
        throw new Error(`Error al crear el registro de alquiler: ${errorText}`);
      }

      // Actualizar el vehículo para asignarlo al usuario
      const vehicleUpdateData = {
        idUser: parseInt(currentUserId), // Ajustado al campo de tu modelo Java
        idBranch: 1,        idAdmin: 1
      };

      const vehicleUpdateResponse = await fetch(`http://localhost:8080/vehicle/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleUpdateData),
      });

      if (!vehicleUpdateResponse.ok) {
        const errorText = await vehicleUpdateResponse.text();
        throw new Error(`Error al actualizar el estado del vehículo: ${errorText}`);
      }

      await refreshVehicles();
      if (setActiveSection) {
        setActiveSection("rentados");
      }
      alert('¡Vehículo alquilado con éxito!');
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al alquilar el vehículo: ${error.message}`);
    }
  };

  // Función para guardar la información actualizada del usuario
  const saveUserInfo = async () => {
    const currentUserId = getUserId();
    if (!currentUserId) {
      alert("Error: Usuario no válido. Por favor, inicia sesión nuevamente.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/customer/${currentUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar la información del usuario: ${errorText}`);
      }
      
      localStorage.setItem("User", JSON.stringify(userInfo));
      alert("Información actualizada correctamente");
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al actualizar la información: ${error.message}`);
    }
  };

  // Manejo de errores
  if (error) {
    return (
      <section className="user-panel-content">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Algo salió mal</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button 
              className="error-button primary"
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
            >
              🔄 Reintentar
            </button>
            <button 
              className="error-button secondary"
              onClick={() => navigate("/")}
            >
              🏠 Volver al inicio
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Renderizado condicional según la sección activa
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ color: '#014421', fontSize: '1.2rem', fontWeight: '600' }}>
            Cargando tu dashboard personalizado...
          </p>
        </div>
      );
    }

    switch (activeSection) {
      case "inicio":
        return (
          <div className="welcome-section">
            <div className="greeting-card">
              <h2>¡Que tengas un gran día, {userInfo?.name || 'Usuario'}!</h2>
              <p style={{ marginTop: '1rem', fontSize: '1.1rem', opacity: 0.8 }}>
                Bienvenido a tu panel de control personalizado
              </p>
            </div>
            
            {nextReservation && (
              <div className="next-reservation">
                <div className="reservation-header">
                  <div className="reservation-icon">🚗</div>
                  <div className="reservation-info">
                    <h3>Próxima reserva</h3>
                    <p className="reservation-date">{nextReservation.date}</p>
                  </div>
                </div>
                
                <div className="reservation-car">
                  <img src={nextReservation.image} alt={nextReservation.car} />
                  <h4>{nextReservation.car}</h4>
                </div>
                
                <button className="details-button">Ver detalles</button>
              </div>
            )}

            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-icon">🚗</div>
                <h3>Vehículos Alquilados</h3>
                <p className="stat-number" data-count={rentedCars.length}>{rentedCars.length}</p>
                <span className="stat-label">Activos</span>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <h3>Nivel de Usuario</h3>
                <p className="stat-text">
                  {rentedCars.length === 0 ? '🥉 Bronce' : 
                   rentedCars.length <= 2 ? '🥈 Plata' : '🥇 Oro'}
                </p>
                <span className="stat-label">Categoría</span>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <h3>Disponibles</h3>
                <p className="stat-number" data-count={availableCars.length}>{availableCars.length}</p>
                <span className="stat-label">Vehículos</span>
              </div>
            </div>
          </div>
        );
        
      case "rentados":
        return (
          <div className="rented-cars-section">
            <h2>🚗 Tus coches alquilados</h2>
            
            {rentedCars.length > 0 ? (
              <>
                <p className="section-description">
                  Tienes {rentedCars.length} vehículo{rentedCars.length !== 1 ? 's' : ''} alquilado{rentedCars.length !== 1 ? 's' : ''} actualmente
                </p>
                <div className="rented-cars-grid">
                {rentedCars.map(car => (
                  <div className="rented-car-card" key={car.vehicle_id}>
                    <img 
                      src={car.image_url || "https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg"} 
                      alt={`${car.brand} ${car.model}`} 
                      className="car-image" 
                    />
                    <div className="car-details">
                      <h3>{car.brand} {car.model}</h3>
                      <div className="car-info-grid">
                        <div className="info-item">
                          <span className="info-label">Tipo:</span>
                          <span className="info-value">{car.type}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Año:</span>
                          <span className="info-value">{car.year}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Color:</span>
                          <span className="info-value">{car.color}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Placa:</span>
                          <span className="info-value">{car.plate}</span>
                        </div>
                      </div>
                      <div className="rental-period">
                        <p><strong>Fecha de alquiler:</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>Fecha de devolución:</strong> {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</p>
                      </div>
                      <button className="extend-button">Extender alquiler</button>
                    </div>
                  </div>
                ))}
                </div>
              </>
            ) : (
              <div className="no-cars-message">
                <p>No tienes coches alquilados actualmente.</p>
                <button
                  className="rent-now-button"
                  onClick={() => setActiveSection("rentar")}
                >
                  Alquilar ahora
                </button>
              </div>
            )}
          </div>
        );
        
      case "rentar":
        return (
          <div className="rent-cars-section">
            <h2>Alquila un coche</h2>
            <p className="section-description">Explora nuestra selección de {availableCars.length} vehículos disponibles para alquilar</p>
            
            {availableCars.length > 0 ? (
              <>
                {/* Carrusel de vehículos */}
                <div className="carousel-container">
                  <h3 style={{ color: '#014421', marginBottom: '1rem', fontSize: '1.3rem' }}>
                    🌟 Vehículos Destacados
                  </h3>
                  <CarouselCars 
                    cars={availableCars.slice(0, 5).map(car => ({
                      id: car.vehicle_id,
                      name: `${car.brand} ${car.model}`,
                      image: car.image_url || "https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg",
                      type: car.type,
                      year: car.year,
                      Color: car.color,
                      Plate: car.plate,
                      price: car.price,
                      onRent: () => rentVehicle(car.vehicle_id)
                    }))} 
                  />
                </div>

                {/* Grilla de todos los vehículos disponibles */}
                <div className="available-cars-grid-section">
                  <h3 style={{ color: '#014421', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
                    🚗 Todos los Vehículos Disponibles
                  </h3>
                  <div className="rented-cars-grid">
                    {availableCars.map(car => (
                      <div className="rented-car-card" key={car.vehicle_id}>
                        <img 
                          src={car.image_url || "https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg"} 
                          alt={`${car.brand} ${car.model}`} 
                          className="car-image" 
                        />
                        <div className="car-details">
                          <h3>{car.brand} {car.model}</h3>
                          <div className="car-info-grid">
                            <div className="info-item">
                              <span className="info-label">Tipo:</span>
                              <span className="info-value">{car.type}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Año:</span>
                              <span className="info-value">{car.year}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Color:</span>
                              <span className="info-value">{car.color}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Placa:</span>
                              <span className="info-value">{car.plate}</span>
                            </div>
                          </div>
                          <div className="rental-info">
                            <p style={{ color: '#2d8659', fontWeight: 'bold', fontSize: '1.2rem', margin: '1rem 0' }}>
                              💰 ${car.price || 750}/día
                            </p>
                            <p style={{ color: '#014421', fontWeight: '500', margin: '0.5rem 0' }}>
                              ✅ Disponible ahora
                            </p>
                          </div>
                          <button 
                            className="extend-button"
                            onClick={() => rentVehicle(car.vehicle_id)}
                            style={{ background: 'linear-gradient(135deg, #4caf50 0%, #2d8659 100%)' }}
                          >
                            🚗 Alquilar Ahora
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-cars-message">
                <h3 style={{ color: '#666', marginBottom: '1rem' }}>😔 No hay vehículos disponibles</h3>
                <p>En este momento no tenemos vehículos disponibles para alquilar.</p>
                <p style={{ marginTop: '1rem', color: '#2d8659' }}>
                  Por favor, revisa más tarde o contacta con nuestro equipo.
                </p>
              </div>
            )}
            
            <button 
              className="view-all-button"
              onClick={() => navigate("/Rental")}
              style={{ marginTop: '2rem' }}
            >
              🌐 Ver catálogo completo
            </button>
          </div>
        );
        
      case "editar":
        return (
          <div className="edit-profile-section">
            <h2>Actualiza tus datos personales</h2>
            
            <form className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={userInfo.name || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value={userInfo.lastName || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={userInfo.email || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={userInfo.phone || ""} 
                  onChange={handleUserInfoChange} 
                />              </div>
              
              <div className="form-group">
                <label htmlFor="license">Número de licencia</label>
                <input 
                  type="text" 
                  id="license" 
                  name="license" 
                  value={userInfo.license || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
              <button 
                type="button" 
                className="save-button"
                onClick={saveUserInfo}
              >
                Guardar cambios
              </button>
            </form>
          </div>
        );
        
      default:
        return <div>Selecciona una opción del menú</div>;
    }
  };

  return (
    <section className="user-panel-content">
      {renderContent()}
    </section>
  );
}

export default Panel;
