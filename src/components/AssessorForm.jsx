import { useState, useEffect } from 'react';

const AssessorForm = ({ assessor, onSubmit, onCancel, isLoading, branches, admins }) => {
  const [formData, setFormData] = useState({
    idAssessor: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    branchId: '',
    adminId: ''
  });

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Cargar datos del asesor en edición
  useEffect(() => {
    if (assessor) {
      setFormData({
        idAssessor: assessor.idAssessor || '',
        name: assessor.name || '',
        email: assessor.email || '',
        password: '', // No cargar la contraseña por seguridad
        phone: assessor.phone || '',
        address: assessor.address || '',
        branchId: assessor.branch?.id || '',
        adminId: assessor.admin?.id || ''
      });
    } else {
      // Resetear para nuevo asesor
      setFormData({
        idAssessor: '',
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        branchId: '',
        adminId: ''
      });
    }
    setErrors({});
    setShowPreview(false);
  }, [assessor]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Formateo específico por campo
    if (name === 'phone') {
      // Solo permitir números y formatear
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'email') {
      // Convertir a minúsculas
      processedValue = value.toLowerCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validar contraseña (solo para nuevos asesores)
    if (!assessor) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }

    // Validar dirección
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }

    // Validar sucursal
    if (!formData.branchId) {
      newErrors.branchId = 'Debe seleccionar una sucursal';
    }

    // Validar administrador
    if (!formData.adminId) {
      newErrors.adminId = 'Debe seleccionar un administrador';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para envío
    const submitData = {
      ...formData,
      branchId: parseInt(formData.branchId),
      adminId: parseInt(formData.adminId)
    };

    // Remover idAssessor para nuevos asesores
    if (!assessor) {
      delete submitData.idAssessor;
    }

    // No enviar contraseña si está vacía en edición
    if (assessor && !formData.password) {
      delete submitData.password;
    }

    onSubmit(submitData);
  };

  // Vista previa
  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  // Formatear teléfono para mostrar
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    if (phone.length === 10) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  // Obtener nombre de sucursal
  const getBranchName = (branchId) => {
    const branch = branches?.find(b => b.id === parseInt(branchId));
    return branch?.name || 'No seleccionada';
  };

  // Obtener nombre de administrador
  const getAdminName = (adminId) => {
    const admin = admins?.find(a => a.id === parseInt(adminId));
    return admin?.name || 'No seleccionado';
  };

  if (showPreview) {
    return (
      <div className="assessor-preview">
        <div className="preview-header">
          <h3>Vista previa - {assessor ? 'Editar' : 'Nuevo'} Asesor</h3>
          {assessor && (
            <div className="assessor-id-preview">
              <span className="id-label">ID del Asesor:</span>
              <span className="id-value">#{formData.idAssessor}</span>
            </div>
          )}
        </div>

        <div className="preview-content">
          <div className="preview-section">
            <h4>Información Personal</h4>
            <div className="preview-grid">
              <div className="preview-item">
                <label>Nombre:</label>
                <span>{formData.name}</span>
              </div>
              <div className="preview-item">
                <label>Email:</label>
                <span>{formData.email}</span>
              </div>
              <div className="preview-item">
                <label>Teléfono:</label>
                <span>{formatPhoneDisplay(formData.phone)}</span>
              </div>
              <div className="preview-item">
                <label>Dirección:</label>
                <span>{formData.address}</span>
              </div>
            </div>
          </div>

          <div className="preview-section">
            <h4>Asignaciones</h4>
            <div className="preview-grid">
              <div className="preview-item">
                <label>Sucursal:</label>
                <span>{getBranchName(formData.branchId)}</span>
              </div>
              <div className="preview-item">
                <label>Administrador:</label>
                <span>{getAdminName(formData.adminId)}</span>
              </div>
            </div>
          </div>

          {!assessor && formData.password && (
            <div className="preview-section">
              <h4>Seguridad</h4>
              <div className="preview-item">
                <label>Contraseña:</label>
                <span>{'*'.repeat(formData.password.length)} (Configurada)</span>
              </div>
            </div>
          )}
        </div>

        <div className="preview-actions">
          <button 
            type="button" 
            onClick={() => setShowPreview(false)}
            className="btn-secondary"
          >
            Volver a editar
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Guardando...' : (assessor ? 'Actualizar Asesor' : 'Crear Asesor')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="assessor-form">
      <div className="form-header">
        <h3>{assessor ? 'Editar Asesor' : 'Nuevo Asesor'}</h3>
        {assessor && (
          <div className="assessor-id-display">
            <span className="id-label">ID:</span>
            <input
              type="text"
              value={formData.idAssessor}
              disabled={true}
              className="readonly-field"
              title="El ID del asesor no se puede modificar"
            />
          </div>
        )}
      </div>

      {/* Información Personal */}
      <div className="form-section">
        <h4 className="section-title">
          <span className="section-icon">👤</span>
          Información Personal
        </h4>
        
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">
              Nombre Completo <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.name ? 'error' : ''}
              placeholder="Ingrese el nombre completo"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.email ? 'error' : ''}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Teléfono <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.phone ? 'error' : ''}
              placeholder="1234567890"
              maxLength="10"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
            {formData.phone && (
              <div className="phone-preview">
                Formato: {formatPhoneDisplay(formData.phone)}
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="address">
              Dirección <span className="required">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.address ? 'error' : ''}
              placeholder="Ingrese la dirección completa"
              rows="3"
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="form-section">
        <h4 className="section-title">
          <span className="section-icon">🔒</span>
          Seguridad
        </h4>
        
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="password">
              {assessor ? 'Nueva Contraseña (opcional)' : 'Contraseña'} 
              {!assessor && <span className="required">*</span>}
            </label>
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.password ? 'error' : ''}
                placeholder={assessor ? "Dejar vacío para mantener actual" : "Mínimo 6 caracteres"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
                tabIndex="-1"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
            {assessor && (
              <div className="password-note">
                <small>💡 Deje vacío para mantener la contraseña actual</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asignaciones */}
      <div className="form-section">
        <h4 className="section-title">
          <span className="section-icon">🏢</span>
          Asignaciones
        </h4>
        
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="branchId">
              Sucursal <span className="required">*</span>
            </label>
            <select
              id="branchId"
              name="branchId"
              value={formData.branchId}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.branchId ? 'error' : ''}
            >
              <option value="">Seleccione una sucursal</option>
              {branches?.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {errors.branchId && <span className="error-message">{errors.branchId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="adminId">
              Administrador <span className="required">*</span>
            </label>
            <select
              id="adminId"
              name="adminId"
              value={formData.adminId}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.adminId ? 'error' : ''}
            >
              <option value="">Seleccione un administrador</option>
              {admins?.map(admin => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
            {errors.adminId && <span className="error-message">{errors.adminId}</span>}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary"
        >
          Cancelar
        </button>
        
        <button
          type="button"
          onClick={handlePreview}
          disabled={isLoading}
          className="btn-outline"
        >
          Vista Previa
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Guardando...' : (assessor ? 'Actualizar' : 'Crear')} Asesor
        </button>
      </div>
    </form>
  );
};

export default AssessorForm;
