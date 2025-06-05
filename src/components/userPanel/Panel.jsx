import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CarouselCars from "../CarouselCars";
import "./panel.css";

function Panel({ activeSection, setActiveSection, user }) {
  const [rentedCars, setRentedCars] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [nextReservation, setNextReservation] = useState(null);
  const [userInfo, setUserInfo] = useState(user || {});
  const navigate = useNavigate();

  // Simulación de carga de datos
  useEffect(() => {
    // Aquí normalmente harías una petición a tu API
    // Simulamos datos de coches rentados
    const mockRentedCars = [
      {
        id: 1,
        name: "Chevrolet Camaro",
        image: "https://www.chevrolet.com.mx/content/dam/chevrolet/na/mx/es/index/performance/2023-camaro/colorizer/01-images/2023-camaro-1ss-g7c-colorizer.jpg?imwidth=960",
        type: "Deportivo",
        year: "2023",
        Color: "Amarillo",
        Plate: "ABC123",
        rentDate: "2023-05-15",
        returnDate: "2023-06-15"
      },
      {
        id: 2,
        name: "Dodge Charger",
        image: "https://www.dodge.com/content/dam/fca-brands/na/dodge/en_us/2023/charger/gallery/exterior/MY23_Charger_Gallery_Exterior_3.jpg.image.1440.jpg",
        type: "Deportivo",
        year: "2023",
        Color: "Negro",
        Plate: "XYZ789",
        rentDate: "2023-04-10",
        returnDate: "2023-05-10"
      }
    ];

    // Simulamos datos de coches disponibles
    const mockAvailableCars = [
      {
        id: 3,
        name: "Audi A4",
        image: "https://www.audi.com/content/dam/gbp2/experience-audi/models-and-technology/production-models/a4/my-2023/overview/a4_2023_1920x1080_stage_desktop.jpg?imwidth=1920&imdensity=1",
        type: "Sedan",
        year: "2023",
        Color: "Blanco",
        Plate: "DEF456"
      },
      {
        id: 4,
        name: "BMW Serie 3",
        image: "https://www.bmw.com.mx/content/dam/bmw/common/all-models/3-series/sedan/2022/navigation/bmw-3-series-sedan-lci-modelfinder.png",
        type: "Sedan",
        year: "2023",
        Color: "Azul",
        Plate: "GHI789"
      },
      {
        id: 5,
        name: "Mercedes-Benz Clase C",
        image: "https://www.mercedes-benz.com.mx/es/passengercars/mercedes-benz-cars/models/c-class/saloon-w206/_jcr_content/image.MQ6.2.2x.20210305121323.png",
        type: "Sedan",
        year: "2023",
        Color: "Plata",
        Plate: "JKL012"
      }
    ];

    // Simulamos próxima reserva
    const mockNextReservation = {
      id: 1,
      car: "Audi A4",
      image: "https://www.audi.com/content/dam/gbp2/experience-audi/models-and-technology/production-models/a4/my-2023/overview/a4_2023_1920x1080_stage_desktop.jpg?imwidth=1920&imdensity=1",
      date: "10 mayo, 2024"
    };

    setRentedCars(mockRentedCars);
    setAvailableCars(mockAvailableCars);
    setNextReservation(mockNextReservation);
  }, []);

  // Función para manejar cambios en el formulario de información de usuario
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value
    });
  };

  // Función para guardar la información actualizada del usuario
  const saveUserInfo = () => {
    // Aquí normalmente harías una petición a tu API para actualizar los datos
    localStorage.setItem("User", JSON.stringify(userInfo));
    alert("Información actualizada correctamente");
  };

  // Renderizado condicional según la sección activa
  const renderContent = () => {
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
                <p className="stat-number">3</p>
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
                  <div className="rented-car-card" key={car.id}>
                    <img src={car.image} alt={car.name} className="car-image" />
                    <div className="car-details">
                      <h3>{car.name}</h3>
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
                          <span className="info-value">{car.Color}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Placa:</span>
                          <span className="info-value">{car.Plate}</span>
                        </div>
                      </div>
                      <div className="rental-period">
                        <p><strong>Fecha de alquiler:</strong> {car.rentDate}</p>
                        <p><strong>Fecha de devolución:</strong> {car.returnDate}</p>
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
              <CarouselCars cars={availableCars} />
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