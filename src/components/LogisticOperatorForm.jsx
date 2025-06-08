import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { checkEmailExists, getServiceAreas, getServiceAreaIcon } from '../services/LogisticOperatorService';
import './CustomerForm.css'; // Reutilizamos los estilos existentes

const initialState = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    serviceArea: 'TRANSPORTE'
};

const LogisticOperatorForm = ({ onSubmit, onCancel, operator, isEditing = false, isLoading = false }) => {
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (operator) {
            setForm({
                name: operator.name || '',
                email: operator.email || '',
                phone: operator.phone || '',
                password: '', // No mostrar contraseña actual por seguridad
                confirmPassword: '',
                address: operator.address || '',
                serviceArea: operator.serviceArea || 'TRANSPORTE'
            });
        } else {
            setForm(initialState);
        }
    }, [operator]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Limpiar error cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = async () => {
        const newErrors = {};
        
        // Validaciones básicas
        if (!form.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!form.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'El formato del email no es válido';
        }
        
        if (!form.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        } else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'El teléfono debe tener 10 dígitos';
        }
        
        if (!form.address.trim()) {
            newErrors.address = 'La dirección es requerida';
        }
        
        if (!form.serviceArea) {
            newErrors.serviceArea = 'El área de servicio es requerida';
        }
        
        // Validación de contraseña (solo para nuevos operadores o si se está cambiando)        // Validación de contraseña (solo para nuevos operadores o si se está cambiando)
        if (!isEditing || (form.password && form.password.trim() !== '')) {
            if (!form.password || !form.password.trim()) {
                newErrors.password = 'La contraseña es requerida';
            } else if (form.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            }
            
            if (form.password !== form.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }
        
        // Validaciones asíncronas
        try {
            // Verificar email único
            const operatorId = operator?.idLogisticOperator || null;
            const emailExists = await checkEmailExists(form.email, operatorId);
            if (emailExists) {
                newErrors.email = 'Este email ya está registrado por otro operador logístico';
            }
        } catch (error) {
            console.error('Error in async validation:', error);
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isValid = await validateForm();
        if (!isValid) {
            await Swal.fire({
                title: 'Datos incompletos',
                text: 'Por favor, complete todos los campos requeridos correctamente',
                icon: 'warning',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        // Preparar datos para envío
        const operatorData = {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            serviceArea: form.serviceArea
        };        // Solo incluir contraseña si se está creando un nuevo operador o si se está cambiando
        if (!isEditing || (form.password && form.password.trim() !== '')) {
            operatorData.password = form.password;
        }onSubmit(operatorData);
    };

    const handleCancel = async () => {
        // Verificar si hay cambios en el formulario
        const hasChanges = operator ? 
            Object.keys(form).some(key => {
                if (key === 'password' || key === 'confirmPassword') return form[key] !== '';
                return form[key] !== (operator[key] || '');
            }) :
            Object.values(form).some((value, index) => {
                const key = Object.keys(form)[index];
                if (key === 'password' || key === 'confirmPassword') return value !== '';
                return value !== initialState[key];
            });

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

    const serviceAreas = getServiceAreas();

    return (
        <div className="customer-form-container">
            <div className="customer-form-header">
                <h2>{isEditing ? '✏️ Editar Operador Logístico' : '➕ Nuevo Operador Logístico'}</h2>                <button 
                    type="button" 
                    className="close-button"
                    onClick={handleCancel}
                    disabled={isLoading}
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit} className="customer-form">
                {/* Información Personal */}
                <div className="form-section">
                    <h3>👤 Información Personal</h3>
                    
                    <div className="form-group">
                        <label htmlFor="name">Nombre Completo *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className={errors.name ? 'error' : ''}
                            placeholder="Ingrese el nombre completo del operador"
                            disabled={isLoading}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Dirección *</label>
                        <textarea
                            id="address"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            className={errors.address ? 'error' : ''}
                            placeholder="Ingrese la dirección completa"
                            disabled={isLoading}
                            rows={3}
                        />
                        {errors.address && <span className="error-message">{errors.address}</span>}
                    </div>
                </div>

                {/* Información de Contacto */}
                <div className="form-section">
                    <h3>📧 Información de Contacto</h3>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            placeholder="correo@ejemplo.com"
                            disabled={isLoading}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Teléfono *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className={errors.phone ? 'error' : ''}
                            placeholder="Ej: 3001234567"
                            disabled={isLoading}
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                </div>

                {/* Área de Servicio */}
                <div className="form-section">
                    <h3>🚛 Área de Servicio</h3>
                    
                    <div className="form-group">
                        <label htmlFor="serviceArea">Área de Servicio *</label>
                        <select
                            id="serviceArea"
                            name="serviceArea"
                            value={form.serviceArea}
                            onChange={handleChange}
                            className={errors.serviceArea ? 'error' : ''}
                            disabled={isLoading}
                        >
                            {serviceAreas.map(area => (
                                <option key={area.value} value={area.value}>
                                    {getServiceAreaIcon(area.value)} {area.label}
                                </option>
                            ))}
                        </select>
                        {errors.serviceArea && (
                            <span className="error-message">{errors.serviceArea}</span>
                        )}
                    </div>

                    {/* Información del área seleccionada */}
                    <div className="service-area-info">
                        <div className="service-area-badge">
                            <span className="service-icon">
                                {getServiceAreaIcon(form.serviceArea)}
                            </span>
                            <span className="service-label">
                                {serviceAreas.find(area => area.value === form.serviceArea)?.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Configuración de Acceso */}
                <div className="form-section">
                    <h3>🔐 Configuración de Acceso</h3>
                    
                    {isEditing && (
                        <div className="form-info">
                            <p>💡 Deje las contraseñas vacías si no desea cambiarla</p>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">
                                {isEditing ? 'Nueva Contraseña' : 'Contraseña *'}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                placeholder={isEditing ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                                disabled={isLoading}
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                {isEditing ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'}
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'error' : ''}
                                placeholder="Repita la contraseña"
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && (
                                <span className="error-message">{errors.confirmPassword}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="form-actions">                    <button 
                        type="button" 
                        className="cancel-button"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        ❌ Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>⏳ {isEditing ? 'Actualizando...' : 'Creando...'}</>
                        ) : (
                            <>{isEditing ? '💾 Actualizar' : '➕ Crear'} Operador</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LogisticOperatorForm;
