import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CarouselCars from "../CarouselCars";
import "./panel.css";

function Panel({ activeSection, setActiveSection, user }) {
  const [rentedCars, setRentedCars] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [nextReservation, setNextReservation] = useState(null);
  const [userInfo, setUserInfo] = useState(user || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para obtener los vehículos disponibles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/vehicle');
      if (!response.ok) {
        throw new Error('Error al obtener los vehículos');
      }
      const data = await response.json();
      
      // Filtrar vehículos alquilados y disponibles
      const available = data.filter(vehicle => !vehicle.id_user || vehicle.id_user === 'NULL');
      setAvailableCars(available);
      
      // Obtener vehículos alquilados por el usuario actual
      const rented = data.filter(vehicle => vehicle.id_user === userInfo.id);
      setRentedCars(rented);
      
      // Simular próxima reserva con el primer vehículo disponible
      if (available.length > 0) {
        setNextReservation({
          id: available[0].vehicle_id,
          car: `${available[0].brand} ${available[0].model}`,
          image: available[0].image_url || "https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg",
          date: "10 mayo, 2024"
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [userInfo.id]);

  // Función para alquilar un vehículo
  const rentVehicle = async (vehicleId) => {
    try {
      const rentalData = {
        description: `Alquiler del ${availableCars.find(car => car.vehicle_id === vehicleId)?.brand} ${availableCars.find(car => car.vehicle_id === vehicleId)?.model} (Placa: ${availableCars.find(car => car.vehicle_id === vehicleId)?.plate})`,
        name: `${availableCars.find(car => car.vehicle_id === vehicleId)?.brand} ${availableCars.find(car => car.vehicle_id === vehicleId)?.model}`,
        price: 750, // Precio fijo o calculado según el vehículo
        id_branch: 3, // Valores de ejemplo basados en la imagen
        id_vehicle: vehicleId,
        id_assessor: 1,
        id_customer: userInfo.id
      };

      const response = await fetch('http://localhost:8080/rental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rentalData),
      });

      if (!response.ok) {
        throw new Error('Error al realizar el alquiler');
      }

      // Actualizar la lista de vehículos después de alquilar
      fetchVehicles();
      
      // Cambiar a la sección de vehículos rentados
      if (setActiveSection) {
        setActiveSection("rentados");
      }
      
      alert('¡Vehículo alquilado con éxito!');
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al alquilar el vehículo: ${error.message}`);
    }
  };

  // Función para manejar cambios en el formulario de información de usuario
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value
    });
  };

  // Función para guardar la información actualizada del usuario
  const saveUserInfo = async () => {
    try {
      // Llamada a la API para actualizar los datos del usuario
      const response = await fetch(`http://localhost:8080/customer/${userInfo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la información del usuario');
      }
      
      // Actualizar en localStorage para mantener la sesión actualizada
      localStorage.setItem("User", JSON.stringify(userInfo));
      alert("Información actualizada correctamente");
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al actualizar la información: ${error.message}`);
    }
  };

  // Renderizado condicional según la sección activa
  const renderContent = () => {
    if (loading) {
      return <div className="loading">Cargando...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    switch (activeSection) {
      case "inicio":
        return (
          <div className="welcome-section">
            <div className="greeting-card">
              <h2>¡Que tengas un gran día!</h2>
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
                <h3>Reservas</h3>
                <p className="stat-number">{rentedCars.length}</p>
              </div>
              <div className="stat-card">
                <h3>Nivel</h3>
                <p className="stat-text">Oro</p>
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