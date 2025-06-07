import { useState, useEffect } from 'react';

const AssessorForm = ({ assessor, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    position: 'Asesor Comercial',
    salary: '',
    hireDate: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Opciones predefinidas
  const departments = [
    'Ventas',
    'Atención al Cliente',
    'Seguros',
    'Créditos',
    'Postventa',
    'Marketing'
  ];

  const positions = [
    'Asesor Comercial',
    'Asesor Senior',
    'Asesor de Seguros',
    'Asesor de Créditos',
    'Supervisor de Ventas',
    'Coordinador Comercial'
  ];

  // Cargar datos del asesor en edición
  useEffect(() => {
    if (assessor) {
      setFormData({
        firstName: assessor.firstName || '',
        lastName: assessor.lastName || '',
        email: assessor.email || '',
        phone: assessor.phone || '',
        employeeId: assessor.employeeId || '',
        department: assessor.department || '',
        position: assessor.position || 'Asesor Comercial',
        salary: assessor.salary || '',
        hireDate: assessor.hireDate || '',
        isActive: assessor.isActive !== undefined ? assessor.isActive : true
      });
    }
  }, [assessor]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // Formateo específico por campo
    if (name === 'phone') {
      // Solo permitir números y formatear
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'employeeId') {
      // Convertir a mayúsculas
      processedValue = value.toUpperCase();
    } else if (name === 'email') {
      // Convertir a minúsculas
      processedValue = value.toLowerCase();
    } else if (name === 'firstName' || name === 'lastName') {
      // Capitalizar primera letra
      processedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
    
    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'El ID de empleado es obligatorio';
    } else if (formData.employeeId.length < 3) {
      newErrors.employeeId = 'El ID debe tener al menos 3 caracteres';
    }
    
    if (!formData.department) {
      newErrors.department = 'El departamento es obligatorio';
    }
    
    if (!formData.hireDate) {
      newErrors.hireDate = 'La fecha de contratación es obligatoria';
    } else {
      const hireDate = new Date(formData.hireDate);
      const today = new Date();
      if (hireDate > today) {
        newErrors.hireDate = 'La fecha de contratación no puede ser futura';
      }
    }
    
    if (formData.salary && (isNaN(formData.salary) || parseFloat(formData.salary) <= 0)) {
      newErrors.salary = 'El salario debe ser un número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Formatear teléfono para visualización
  const formatPhoneDisplay = (phone) => {
    if (phone.length === 10) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  // Generar ID de empleado automático
  const generateEmployeeId = () => {
    const firstName = formData.firstName.slice(0, 2).toUpperCase();
    const lastName = formData.lastName.slice(0, 2).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${firstName}${lastName}${random}`;
  };

  const handleGenerateId = () => {
    if (formData.firstName && formData.lastName) {
      setFormData(prev => ({
        ...prev,
        employeeId: generateEmployeeId()
      }));
    }
  };

  return (
    <div className="assessor-form-container">
      <div className="form-header">
        <h2>
          {assessor ? '✏️ Editar Asesor' : '➕ Nuevo Asesor'}
        </h2>
        <button 
          type="button" 
          onClick={() => setShowPreview(!showPreview)}
          className="preview-btn"
        >
          {showPreview ? '📝 Formulario' : '👁️ Vista Previa'}
        </button>
      </div>

      {showPreview ? (
        <div className="form-preview">
          <h3>Vista Previa del Asesor</h3>
          <div className="preview-content">
            <div className="preview-section">
              <h4>Información Personal</h4>
              <p><strong>Nombre:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Teléfono:</strong> {formatPhoneDisplay(formData.phone)}</p>
            </div>
            <div className="preview-section">
              <h4>Información Laboral</h4>
              <p><strong>ID Empleado:</strong> {formData.employeeId}</p>
              <p><strong>Departamento:</strong> {formData.department}</p>
              <p><strong>Posición:</strong> {formData.position}</p>
              <p><strong>Salario:</strong> {formData.salary ? `$${parseFloat(formData.salary).toLocaleString()}` : 'No especificado'}</p>
              <p><strong>Fecha de Contratación:</strong> {formData.hireDate}</p>
              <p><strong>Estado:</strong> <span className={`status ${formData.isActive ? 'active' : 'inactive'}`}>
                {formData.isActive ? 'Activo' : 'Inactivo'}
              </span></p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="assessor-form">
          {/* Información Personal */}
          <div className="form-section">
            <h3>👤 Información Personal</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Ej: Juan"
                  disabled={isLoading}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Apellido *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Ej: Pérez"
                  disabled={isLoading}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Ej: juan.perez@c2k.com"
                  disabled={isLoading}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Teléfono * {formData.phone && `(${formatPhoneDisplay(formData.phone)})`}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="1234567890"
                  maxLength="10"
                  disabled={isLoading}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Información Laboral */}
          <div className="form-section">
            <h3>💼 Información Laboral</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="employeeId">
                  ID de Empleado *
                </label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={errors.employeeId ? 'error' : ''}
                    placeholder="Ej: JP001"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateId}
                    className="generate-btn"
                    disabled={!formData.firstName || !formData.lastName || isLoading}
                    title="Generar ID automáticamente"
                  >
                    🎲
                  </button>
                </div>
                {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="department">
                  Departamento *
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={errors.department ? 'error' : ''}
                  disabled={isLoading}
                >
                  <option value="">Seleccionar departamento</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <span className="error-message">{errors.department}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="position">
                  Posición
                </label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="salary">
                  Salario (Opcional)
                </label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className={errors.salary ? 'error' : ''}
                  placeholder="25000"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                {errors.salary && <span className="error-message">{errors.salary}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="hireDate">
                  Fecha de Contratación *
                </label>
                <input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  className={errors.hireDate ? 'error' : ''}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isLoading}
                />
                {errors.hireDate && <span className="error-message">{errors.hireDate}</span>}
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="isActive" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <span className="checkmark"></span>
                  Asesor Activo
                </label>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
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
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Guardando...
                </>
              ) : (
                <>
                  {assessor ? '💾 Actualizar' : '➕ Crear'} Asesor
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssessorForm;
