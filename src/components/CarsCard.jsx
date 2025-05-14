import './components.css'
const CarsCard = ({ vehicle }) => {
    if (!vehicle) {
        return <div className="vehicle-card">Datos del vehículo no disponibles.</div>;
    }

    return (
        <div className="vehicle-card">
            <img 
                src={vehicle.image || 'ruta-imagen-por-defecto.jpg'} 
                alt={`${vehicle.brand} ${vehicle.model}`} 
                className="vehicle-image"
            />
            <h3>{vehicle.brand} {vehicle.model}</h3>
            <div className="vehicle-details">
                <span className="detail-item">{vehicle.type}</span>
                <span className="detail-item">{vehicle.year}</span>
                <span className="detail-item">{vehicle.Color}</span>
                <span className="detail-item">{vehicle.Plate}</span>
            </div>
            <button className="reserve-button">Reservar</button>
            <div className="navigation-arrows">
                <button className="arrow">←</button>
                <button className="arrow">→</button>
            </div>
        </div>
    );
}
    


export default CarsCard;