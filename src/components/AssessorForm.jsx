import { useState, useEffect } from 'react';
import './AssessorForm.css';
import Swal from 'sweetalert2';

const AssessorForm = ({ assessor, onSubmit, onCancel, isLoading, branches, admins }) => {
  console.log('🔧 AssessorForm props recibidas:');
  console.log('  📊 assessor:', assessor);
  console.log('  🏢 branches:', branches);
  console.log('  👤 admins:', admins);
  console.log('  ⏳ isLoading:', isLoading);
  
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
  const [showPassword, setShowPassword] = useState(false);  // Cargar datos del asesor en edición
  useEffect(() => {
    console.log('🔄 useEffect ejecutado, assessor:', assessor);
    
    if (assessor) {
      console.log('Cargando asesor para edición:', assessor);
      
      // Determinar branchId y adminId desde diferentes estructuras posibles
      let branchId = '';
      let adminId = '';
      
      // Para branch: puede venir como branch.idBranch, branch.id, o branchId directo
      if (assessor.branch?.idBranch) {
        branchId = assessor.branch.idBranch.toString();
      } else if (assessor.branch?.id) {
        branchId = assessor.branch.id.toString();
      } else if (assessor.branchId) {
        branchId = assessor.branchId.toString();
      }
      
      // Para admin: puede venir como admin.idAdmin, admin.id, o adminId directo
      if (assessor.admin?.idAdmin) {
        adminId = assessor.admin.idAdmin.toString();
      } else if (assessor.admin?.id) {
        adminId = assessor.admin.id.toString();
      } else if (assessor.adminId) {
        adminId = assessor.adminId.toString();
      }
      
      console.log('IDs extraídos - branchId:', branchId, 'adminId:', adminId);
      
      setFormData({
        idAssessor: assessor.idAssessor || '',
        name: assessor.name || '',
        email: assessor.email || '',
        password: '', // No cargar la contraseña por seguridad
        phone: assessor.phone || '',
        address: assessor.address || '',
        branchId: branchId,
        adminId: adminId
      });
    } else {
      console.log('Reseteando formulario para nuevo asesor');
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
  };  // Validaciones
  const validateForm = () => {
    console.log('🔍 Iniciando validación del formulario...');
    console.log('Datos a validar:', formData);
    
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
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'El teléfono debe tener exactamente 10 dígitos';
    }

    // Validar dirección
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    } else if (formData.address.length < 10) {
      newErrors.address = 'La dirección debe ser más específica';
    }

    // Validar sucursal
    if (!formData.branchId) {
      newErrors.branchId = 'Debe seleccionar una sucursal';
      console.log('❌ Error: No se seleccionó sucursal');
    } else {
      console.log('✅ Sucursal válida:', formData.branchId);
    }

    // Validar administrador
    if (!formData.adminId) {
      newErrors.adminId = 'Debe seleccionar un administrador';
      console.log('❌ Error: No se seleccionó administrador');
    } else {
      console.log('✅ Administrador válido:', formData.adminId);
    }

    console.log('Errores encontrados:', newErrors);
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Formulario válido:', isValid);
    
    return isValid;
  };  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      await Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor, complete todos los campos requeridos correctamente',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
      return;
    }    // Preparar datos para envío
    const submitData = {
      ...formData
    };

    // Convertir IDs a números enteros solo si no están vacíos
    if (formData.branchId) {
      const branchId = parseInt(formData.branchId);
      if (!isNaN(branchId)) {
        submitData.branchId = branchId;
      }
    }

    if (formData.adminId) {
      const adminId = parseInt(formData.adminId);
      if (!isNaN(adminId)) {
        submitData.adminId = adminId;
      }
    }

    // Remover idAssessor para nuevos asesores
    if (!assessor) {
      delete submitData.idAssessor;
    }

    // No enviar contraseña si está vacía en edición
    if (assessor && !formData.password) {
      delete submitData.password;    }

    console.log('Datos del formulario preparados para envío:', submitData);
    console.log('¿Es edición?', !!assessor);
    console.log('BranchId seleccionado:', submitData.branchId, typeof submitData.branchId);
    console.log('AdminId seleccionado:', submitData.adminId, typeof submitData.adminId);
    console.log('Contraseña incluida:', !!submitData.password);

    onSubmit(submitData);
  };
  // Vista previa
  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  // Manejar cancelación con confirmación
  const handleCancel = async () => {
    // Verificar si hay cambios en el formulario
    const hasChanges = Object.keys(formData).some(key => {
      if (assessor) {
        return formData[key] !== (assessor[key] || '');
      }
      return formData[key] !== '';
    });

    if (hasChanges) {
      const result = await Swal.fire({
        title: '¿Descartar cambios?',
        text: 'Los cambios que has realizado se perderán si continúas',
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
        </div>        <div className="preview-actions">
          <button 
            type="button" 
            onClick={handleCancel}
            disabled={isLoading}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={() => setShowPreview(false)}
            className="btn-outline"
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
      <div className="form-actions">        <button
          type="button"
          onClick={handleCancel}
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
