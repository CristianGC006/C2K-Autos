import { useState, useEffect } from 'react';
import { generateAdminCode, checkEmailExists, checkAdminCodeExists } from '../services/AdminService';
import Swal from 'sweetalert2';
import './CustomerForm.css'; // Reutilizamos los estilos existentes

const initialState = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    documentNumber: '',
    identificationType: 'CEDULA_DE_CIUDADANIA',
    adminCode: ''
};

const AdminForm = ({ onSubmit, onCancel, admin, isEditing = false, isLoading = false }) => {
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);

    useEffect(() => {
        if (admin) {
            setForm({
                name: admin.name || '',
                email: admin.email || '',
                phone: admin.phone || '',
                password: '', // No mostrar contraseña actual por seguridad
                confirmPassword: '',
                documentNumber: admin.documentNumber || '',
                identificationType: admin.identificationType || 'CEDULA_DE_CIUDADANIA',
                adminCode: admin.adminCode || ''
            });
        } else {
            setForm(initialState);
        }
    }, [admin]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Limpiar error cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleGenerateAdminCode = async () => {
        try {
            setIsGeneratingCode(true);
            const newCode = await generateAdminCode();
            setForm({ ...form, adminCode: newCode });
            setErrors({ ...errors, adminCode: '' });
        } catch (error) {
            console.error('Error generating admin code:', error);
            setErrors({ ...errors, adminCode: 'Error al generar código de administrador' });
        } finally {
            setIsGeneratingCode(false);
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
        
        if (!form.documentNumber.trim()) {
            newErrors.documentNumber = 'El número de documento es requerido';
        }
        
        if (!form.adminCode.trim()) {
            newErrors.adminCode = 'El código de administrador es requerido';
        }        // Validación de contraseña
        if (!isEditing) {
            // Para nuevos administradores, la contraseña es obligatoria
            if (!form.password || form.password.trim() === '') {
                newErrors.password = 'La contraseña es requerida';
            } else if (form.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            }
            
            if (form.password !== form.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        } else {
            // Para ediciones, solo validar si se está intentando cambiar la contraseña
            const passwordValue = form.password ? form.password.trim() : '';
            if (passwordValue !== '') {
                // Solo validar si realmente se quiere cambiar la contraseña
                if (passwordValue.length < 6) {
                    newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
                }
                
                if (form.password !== form.confirmPassword) {
                    newErrors.confirmPassword = 'Las contraseñas no coinciden';
                }
            }
            // Si la contraseña está vacía en modo edición, no se genera error
        }
        
        // Validaciones asíncronas
        try {
            // Verificar email único
            const adminId = admin?.idAdmin || null;
            const emailExists = await checkEmailExists(form.email, adminId);
            if (emailExists) {
                newErrors.email = 'Este email ya está registrado por otro administrador';
            }
            
            // Verificar código de admin único
            const codeExists = await checkAdminCodeExists(form.adminCode, adminId);
            if (codeExists) {
                newErrors.adminCode = 'Este código de administrador ya está en uso';
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
        const adminData = {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            documentNumber: form.documentNumber.trim(),
            identificationType: form.identificationType,
            adminCode: form.adminCode.trim()
        };        // Solo incluir contraseña si se está creando un nuevo admin o si se está cambiando
        if (!isEditing || (form.password && form.password.trim() !== '')) {
            adminData.password = form.password;
        }

        onSubmit(adminData);
    };

    const handleCancel = async () => {
        // Verificar si hay cambios en el formulario
        const hasChanges = Object.keys(form).some(key => {
            if (admin) {
                return form[key] !== (admin[key] || '');
            }
            return form[key] !== '';
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

    const identificationTypes = [
        { value: 'CEDULA_DE_CIUDADANIA', label: 'Cédula de Ciudadanía' },
        { value: 'CEDULA_DE_EXTRANJERIA', label: 'Cédula de Extranjería' },
        { value: 'PASAPORTE', label: 'Pasaporte' },
        { value: 'OTRO', label: 'Otro' }
    ];

    return (
        <div className="customer-form-container">
            <div className="customer-form-header">
                <h2>{isEditing ? '✏️ Editar Administrador' : '➕ Nuevo Administrador'}</h2>
                <button 
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
                            placeholder="Ingrese el nombre completo"
                            disabled={isLoading}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="identificationType">Tipo de Identificación *</label>
                            <select
                                id="identificationType"
                                name="identificationType"
                                value={form.identificationType}
                                onChange={handleChange}
                                className={errors.identificationType ? 'error' : ''}
                                disabled={isLoading}
                            >
                                {identificationTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            {errors.identificationType && (
                                <span className="error-message">{errors.identificationType}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="documentNumber">Número de Documento *</label>
                            <input
                                type="text"
                                id="documentNumber"
                                name="documentNumber"
                                value={form.documentNumber}
                                onChange={handleChange}
                                className={errors.documentNumber ? 'error' : ''}
                                placeholder="Número de documento"
                                disabled={isLoading}
                            />
                            {errors.documentNumber && (
                                <span className="error-message">{errors.documentNumber}</span>
                            )}
                        </div>
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

                {/* Código de Administrador */}
                <div className="form-section">
                    <h3>👑 Código de Administrador</h3>
                    
                    <div className="form-group">
                        <label htmlFor="adminCode">Código de Administrador *</label>
                        <div className="input-with-button">
                            <input
                                type="text"
                                id="adminCode"
                                name="adminCode"
                                value={form.adminCode}
                                onChange={handleChange}
                                className={errors.adminCode ? 'error' : ''}
                                placeholder="Ej: ADM-ABC123"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={handleGenerateAdminCode}
                                className="generate-button"
                                disabled={isLoading || isGeneratingCode}
                            >
                                {isGeneratingCode ? '⏳' : '🎲'}
                                {isGeneratingCode ? 'Generando...' : 'Generar'}
                            </button>
                        </div>
                        {errors.adminCode && <span className="error-message">{errors.adminCode}</span>}
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
                <div className="form-actions">
                    <button 
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
                            <>{isEditing ? '💾 Actualizar' : '➕ Crear'} Administrador</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminForm;
