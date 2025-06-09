import React from 'react';
import './components.css';

function VehicleCard({ car, onRent, showRentButton = true, showRentalInfo = false }) {
  const {
    brand,
    model,
    year,
    plate,
    price,
    image_url,
    color,
    type,
    customers,
    startDate,
    endDate
  } = car;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateRemainingDays = () => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const remainingDays = calculateRemainingDays();

  return (
    <div className="vehicle-card">
      <div className="vehicle-image-container">
        <img 
          src={image_url || "https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg"} 
          alt={`${brand} ${model}`} 
          className="vehicle-image"
        />
        {showRentalInfo && remainingDays !== null && (
          <div className="rental-badge">
            {remainingDays > 0 ? (
              <span className="days-remaining">Faltan {remainingDays} días</span>
            ) : (
              <span className="expired">Alquiler finalizado</span>
            )}
          </div>
        )}
        <div className="vehicle-highlight-badge">
          {year || 'N/A'}
        </div>
      </div>

      <div className="vehicle-info">
        <h3 className="vehicle-title">{brand} {model}</h3>
        <div className="vehicle-identifier">
          <span className="plate-badge">{plate || 'N/A'}</span>
        </div>
        
        <div className="vehicle-details">
          <div className="detail-item">
            <span className="detail-label">Año:</span>
            <span className="detail-value">{year || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Placa:</span>
            <span className="detail-value">{plate || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Color:</span>
            <span className="detail-value">{color || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tipo:</span>
            <span className="detail-value">{type || 'N/A'}</span>
          </div>
          <div className="detail-item price-item">
            <span className="detail-label">Precio por día:</span>
            <span className="detail-value">${price || 750}</span>
          </div>
        </div>

        {showRentalInfo && (
          <div className="rental-info">
            <div className="rental-dates">
              <div className="date-item">
                <span className="date-label">Inicio:</span>
                <span className="date-value">{formatDate(startDate)}</span>
              </div>
              <div className="date-item">
                <span className="date-label">Fin:</span>
                <span className="date-value">{formatDate(endDate)}</span>
              </div>
            </div>
          </div>
        )}

        {showRentButton && !customers && (
          <button 
            className="rent-button"
            onClick={() => onRent(car.vehicle_id)}
          >
            Alquilar Ahora
          </button>
        )}

        {showRentalInfo && remainingDays !== null && (
          <div className="rental-status">
            <div className={`status-indicator ${remainingDays > 0 ? 'active' : 'expired'}`}>
              {remainingDays > 0 ? 'Alquiler Activo' : 'Alquiler Finalizado'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VehicleCard;
