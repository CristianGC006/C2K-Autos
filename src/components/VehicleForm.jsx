import { useState, useEffect } from 'react';
import { validateVehicleData } from '../services/VehicleService';
import Swal from 'sweetalert2';

const VehicleForm = ({ vehicle, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    brand: '',
    model: '',
    color: '',
    plate: '',
    year: new Date().getFullYear(),
    type: '',
    imageUrl: ''
  });

  const [errors, setErrors] = useState({});

  // Lista de marcas comunes
  const vehicleBrands = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 
    'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Mazda', 'Subaru', 
    'Jeep', 'Ram', 'GMC', 'Cadillac', 'Lexus', 'Infiniti', 'Acura', 'Otro'
  ];

  // Lista de tipos de vehículos
  const vehicleTypes = [
    'Sedán', 'SUV', 'Hatchback', 'Pickup', 'Coupé', 'Convertible', 
    'Station Wagon', 'Minivan', 'Camión', 'Motocicleta', 'Otro'
  ];

  // Lista de colores comunes
  const vehicleColors = [
    'Blanco', 'Negro', 'Gris', 'Plata', 'Azul', 'Rojo', 'Verde', 
    'Amarillo', 'Naranja', 'Marrón', 'Beige', 'Otro'
  ];

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleId: vehicle.vehicleId || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        color: vehicle.color || '',
        plate: vehicle.plate || '',
        year: vehicle.year || new Date().getFullYear(),
        type: vehicle.type || '',
        imageUrl: vehicle.imageUrl || ''
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error específico cuando el usuario comience a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleCancel = async () => {
    // Verificar si hay cambios en el formulario
    const hasChanges = vehicle ? 
      Object.keys(formData).some(key => {
        if (key === 'year') {
          return parseInt(formData[key]) !== vehicle[key];
        }
        return formData[key] !== (vehicle[key] || '');
      }) :
      Object.values(formData).some(value => value !== '' && value !== new Date().getFullYear());

    if (hasChanges) {
      const result = await Swal.fire({
        title: '¿Descartar cambios?',
        text: 'Los cambios que has realizado se perderán si continúas.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Continuar editando',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar datos
    const validation = validateVehicleData(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      await Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor, complete todos los campos requeridos correctamente',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // Preparar datos para envío
    const submitData = {
      ...formData,
      year: parseInt(formData.year),
      plate: formData.plate.toUpperCase().replace(/\s+/g, '')
    };

    onSubmit(submitData);
  };

  const formatPlate = (value) => {
    // Remover caracteres no alfanuméricos y convertir a mayúsculas
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Formatear como ABC123
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return cleaned.slice(0, 3) + (cleaned.slice(3) ? '-' + cleaned.slice(3) : '');
    } else {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 6);
    }
  };

  const handlePlateChange = (e) => {
    const formatted = formatPlate(e.target.value);
    setFormData(prev => ({
      ...prev,
      plate: formatted
    }));

    if (errors.plate) {
      setErrors(prev => ({
        ...prev,
        plate: ''
      }));
    }
  };

  return (
    <div className="vehicle-form-container">
      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-header">
          <h3>{vehicle ? 'Editar Vehículo' : 'Agregar Nuevo Vehículo'}</h3>          <button 
            type="button" 
            onClick={handleCancel}
            className="close-btn"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="form-grid">
          {/* Marca */}
          <div className="form-group">
            <label htmlFor="brand">Marca *</label>
            <select
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className={errors.brand ? 'error' : ''}
              required
            >
              <option value="">Seleccionar marca</option>
              {vehicleBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            {errors.brand && <span className="error-message">{errors.brand}</span>}
          </div>

          {/* Modelo */}
          <div className="form-group">
            <label htmlFor="model">Modelo *</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className={errors.model ? 'error' : ''}
              placeholder="Ej: Corolla, Civic, Fiesta"
              required
            />
            {errors.model && <span className="error-message">{errors.model}</span>}
          </div>

          {/* Color */}
          <div className="form-group">
            <label htmlFor="color">Color *</label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className={errors.color ? 'error' : ''}
              required
            >
              <option value="">Seleccionar color</option>
              {vehicleColors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            {errors.color && <span className="error-message">{errors.color}</span>}
          </div>

          {/* Placa */}
          <div className="form-group">
            <label htmlFor="plate">Placa *</label>
            <input
              type="text"
              id="plate"
              name="plate"
              value={formData.plate}
              onChange={handlePlateChange}
              className={errors.plate ? 'error' : ''}
              placeholder="ABC-123"
              maxLength="7"
              style={{ textTransform: 'uppercase' }}
              required
            />
            {errors.plate && <span className="error-message">{errors.plate}</span>}
          </div>

          {/* Año */}
          <div className="form-group">
            <label htmlFor="year">Año *</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className={errors.year ? 'error' : ''}
              min="1900"
              max={new Date().getFullYear() + 1}
              required
            />
            {errors.year && <span className="error-message">{errors.year}</span>}
          </div>

          {/* Tipo */}
          <div className="form-group">
            <label htmlFor="type">Tipo *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={errors.type ? 'error' : ''}
              required
            >
              <option value="">Seleccionar tipo</option>
              {vehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && <span className="error-message">{errors.type}</span>}
          </div>

          {/* URL de Imagen */}
          <div className="form-group full-width">
            <label htmlFor="imageUrl">URL de Imagen</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={errors.imageUrl ? 'error' : ''}
              placeholder="https://ejemplo.com/imagen-vehiculo.jpg"
            />
            {errors.imageUrl && <span className="error-message">{errors.imageUrl}</span>}
            <small className="help-text">
              URL opcional de una imagen del vehículo. Debe ser una URL válida.
            </small>
          </div>
        </div>

        {/* Vista previa de imagen */}
        {formData.imageUrl && (
          <div className="image-preview">
            <label>Vista previa:</label>
            <img 
              src={formData.imageUrl} 
              alt="Vista previa del vehículo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
              onLoad={(e) => {
                e.target.style.display = 'block';
              }}
            />
          </div>
        )}

        <div className="form-actions">          <button 
            type="button" 
            onClick={handleCancel}
            className="cancel-btn"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : (vehicle ? 'Actualizar' : 'Crear')} Vehículo
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
