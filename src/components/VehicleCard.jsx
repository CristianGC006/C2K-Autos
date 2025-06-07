import { useState, useEffect } from 'react';
import { imageService } from '../services/imageService'; // Asegúrate de que esta ruta sea correcta

const VehicleCard = ({ car, onRent, showRentButton = true, showRentalInfo = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(car.image_url);

  useEffect(() => {
    const loadImage = async () => {
      if (!currentImageUrl) {
        // Si no hay imagen, usar el servicio para obtener una
        const fallbackImage = await imageService.getValidatedImage(car.brand, car.model);
        setCurrentImageUrl(fallbackImage);
      }
    };

    loadImage();
  }, [car.brand, car.model, currentImageUrl]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = async () => {
    setImageError(true);
    
    // Intentar con imagen de fallback
    const fallbackImage = await imageService.getValidatedImage(car.brand, car.model);
    if (fallbackImage !== currentImageUrl) {
      setCurrentImageUrl(fallbackImage);
      setImageError(false);
    }
  };

  return (
    <div className="rented-car-card">
      <div className="car-image-container" style={{ position: 'relative', minHeight: '200px' }}>
        {!imageLoaded && !imageError && (
          <div className="image-loading" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#014421',
            fontSize: '0.9rem'
          }}>
            Cargando imagen...
          </div>
        )}
        
        <img 
          src={currentImageUrl} 
          alt={`${car.brand} ${car.model}`} 
          className="car-image"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
        
        {imageError && (
          <div className="image-error" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666',
            fontSize: '0.8rem',
            textAlign: 'center'
          }}>
            Imagen no disponible
          </div>
        )}
      </div>
      
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

        {showRentalInfo && (
          <div className="rental-period">
            <p><strong>Fecha de alquiler:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Fecha de devolución:</strong> {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</p>
          </div>
        )}

        {showRentButton && (
          <div className="rental-info">
            <p style={{ color: '#2d8659', fontWeight: 'bold', fontSize: '1.2rem', margin: '1rem 0' }}>
              💰 ${car.price || 750}/día
            </p>
            <p style={{ color: '#014421', fontWeight: '500', margin: '0.5rem 0' }}>
              ✅ Disponible ahora
            </p>
            <button 
              className="extend-button"
              onClick={() => onRent(car.vehicle_id)}
              style={{ 
                background: 'linear-gradient(135deg, #4caf50 0%, #2d8659 100%)',
                opacity: imageLoaded || imageError ? 1 : 0.5,
                cursor: imageLoaded || imageError ? 'pointer' : 'not-allowed'
              }}
              disabled={!imageLoaded && !imageError}
            >
              🚗 Alquilar Ahora
            </button>
          </div>
        )}

        {!showRentButton && (
          <button className="extend-button">Extender alquiler</button>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
