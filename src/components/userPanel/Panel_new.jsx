import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CarouselCars from "../CarouselCars";
import "./panel.css";

function Panel({ activeSection, setActiveSection, user }) {
  const [rentedCars, setRentedCars] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [nextReservation] = useState(null);
  const [userInfo, setUserInfo] = useState(user || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // ✅ FUNCIÓN PARA VALIDAR Y OBTENER EL ID DEL USUARIO
  const getUserId = useCallback(() => {
    let userId = userInfo?.id || userInfo?.customer_id || userInfo?.userId;
    
    if (!userId) {
      const storedUser = localStorage.getItem("User");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser?.id || parsedUser?.customer_id || parsedUser?.userId;
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
    }

    const numericId = userId ? parseInt(userId, 10) : null;
    
    if (!numericId || isNaN(numericId)) {
      console.error("ID de usuario inválido:", userId);
      return null;
    }
    
    return numericId;
  }, [userInfo]);

  // ✅ FUNCIÓN PARA OBTENER LOS VEHÍCULOS DISPONIBLES
  const fetchVehicles = useCallback(async () => {
    try {
      console.log("Fetching vehicles..."); 
      
      const response = await fetch('http://localhost:8080/vehicle');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Vehicles fetched successfully:", data);
      
      // Filtrar vehículos disponibles
      const available = data.filter(vehicle => !vehicle.id_user || vehicle.id_user === 'NULL');
      setAvailableCars(available);
      
      // Obtener vehículos alquilados por el usuario actual
      const currentUserId = getUserId();
      if (currentUserId) {
        const rented = data.filter(vehicle => 
          vehicle.id_user && 
          parseInt(vehicle.id_user, 10) === currentUserId
        );
        setRentedCars(rented);
        console.log("Rented cars for user:", rented);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // No bloquear el dashboard por errores de API
      setRentedCars([]);
      setAvailableCars([]);
      setLoading(false);
      console.warn("Dashboard cargará sin datos de vehículos debido a:", error.message);
    }
  }, [getUserId]);

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
    console.log("Initializing user...");
    
    if (!userInfo?.id && !isInitialized) {
      const storedUser = localStorage.getItem("User");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("User loaded from localStorage:", parsedUser);
          setUserInfo(parsedUser);
        } catch (e) {
          console.error("Error parsing stored user:", e);
          setError("Error al cargar la información del usuario");
          setLoading(false);
        }
      } else {
        console.error("No user found in localStorage");
        setError("No se encontró información del usuario");
        setLoading(false);
      }
      setIsInitialized(true);
    } else if (userInfo?.id && isInitialized) {
      // Usuario válido, cargar vehículos
      fetchVehicles();
    }
  }, [userInfo?.id, isInitialized, fetchVehicles]);

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

      const rentalData = {
        description: `Alquiler del ${selectedVehicle.brand} ${selectedVehicle.model} (Placa: ${selectedVehicle.plate})`,
        name: `${selectedVehicle.brand} ${selectedVehicle.model}`,
        price: selectedVehicle.price || 750,
        id_branch: 3,
        id_vehicle: selectedVehicle.vehicle_id,
        id_assessor: 1,
        id_customer: currentUserId,
        id_admin: 1,
        id_user: currentUserId
      };

      console.log("Enviando datos de alquiler:", rentalData);

      const rentalResponse = await fetch('http://localhost:8080/rental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rentalData),
      });

      if (!rentalResponse.ok) {
        const errorText = await rentalResponse.text();
        throw new Error(`Error al crear el registro de alquiler: ${errorText}`);
      }

      const vehicleUpdateResponse = await fetch(`http://localhost:8080/vehicle/${selectedVehicle.vehicle_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_user: currentUserId,
          id_branch: 3,
          id_admin: 1
        }),
      });

      if (!vehicleUpdateResponse.ok) {
        const errorText = await vehicleUpdateResponse.text();
        throw new Error(`Error al actualizar el estado del vehículo: ${errorText}`);
      }

      await fetchVehicles();
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
      console.log("Actualizando usuario con ID:", currentUserId);
      console.log("Datos a enviar:", userInfo);

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
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => {
            setError(null);
            setLoading(true);
            window.location.reload();
          }}>
            Reintentar
          </button>
          <button onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
      </section>
    );
  }

  // Renderizado condicional según la sección activa
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <p style={{ color: '#014421', fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem' }}>
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
                <h3>Vehículos Alquilados</h3>
                <p className="stat-number">{rentedCars.length}</p>
              </div>
              <div className="stat-card">
                <h3>Nivel de Usuario</h3>
                <p className="stat-text">
                  {rentedCars.length === 0 ? 'Bronce' : 
                   rentedCars.length <= 2 ? 'Plata' : 'Oro'}
                </p>
              </div>
              <div className="stat-card">
                <h3>Disponibles</h3>
                <p className="stat-number">{availableCars.length}</p>
              </div>
            </div>
          </div>
        );
        
      case "rentados":
        return (
          <div className="rented-cars-section">
            <h2>Tus coches alquilados</h2>
            
            {rentedCars.length > 0 ? (
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
            <p className="section-description">Explora nuestra selección de vehículos disponibles para alquilar</p>
            
            <div className="carousel-container">
              <CarouselCars 
                cars={availableCars.map(car => ({
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
            
            <button 
              className="view-all-button"
              onClick={() => navigate("/Rental")}
            >
              Ver todos los vehículos
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
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <input 
                  type="text" 
                  id="address" 
                  name="address" 
                  value={userInfo.address || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
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
