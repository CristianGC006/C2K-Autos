import { useState, useEffect } from 'react';
import { updateAdmin, getAdminById } from '../../services/AdminService';
import Swal from 'sweetalert2';
import './AdminHome.css';

const AdminSettings = () => {
    const [showEditForm, setShowEditForm] = useState(false);
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        phone: '',
        documentNumber: '',
        identificationType: 'CEDULA_DE_CIUDADANIA',
        adminCode: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);

    // Cargar datos del administrador actual al montar el componente
    useEffect(() => {
        loadCurrentAdmin();
    }, []);

    const loadCurrentAdmin = async () => {
        try {
            // Obtener admin del localStorage
            const storedAdmin = localStorage.getItem("Admin");
            if (!storedAdmin) {
                await Swal.fire({
                    title: 'Sesión expirada',
                    text: 'No se encontró información del administrador logueado',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                return;
            }

            const admin = JSON.parse(storedAdmin);
            setCurrentAdmin(admin);

            // Si tiene ID, obtener datos actualizados del servidor
            if (admin.idAdmin) {
                try {
                    const serverAdmin = await getAdminById(admin.idAdmin);
                    setAdminData({
                        name: serverAdmin.name || '',
                        email: serverAdmin.email || '',
                        phone: serverAdmin.phone || '',
                        documentNumber: serverAdmin.documentNumber || '',
                        identificationType: serverAdmin.identificationType || 'CEDULA_DE_CIUDADANIA',
                        adminCode: serverAdmin.adminCode || '',
                        password: '',
                        confirmPassword: ''
                    });
                    setCurrentAdmin(serverAdmin);
                } catch (error) {
                    console.error('Error loading admin from server:', error);
                    // Usar datos del localStorage si falla la carga del servidor
                    setAdminData({
                        name: admin.name || '',
                        email: admin.email || '',
                        phone: admin.phone || '',
                        documentNumber: admin.documentNumber || '',
                        identificationType: admin.identificationType || 'CEDULA_DE_CIUDADANIA',
                        adminCode: admin.adminCode || '',
                        password: '',
                        confirmPassword: ''
                    });
                }
            }
        } catch (error) {
            console.error('Error loading current admin:', error);
            await Swal.fire({
                title: 'Error',
                text: 'Error al cargar la información del administrador',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdminData({ ...adminData, [name]: value });
        
        // Limpiar error cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validaciones básicas
        if (!adminData.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!adminData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email)) {
            newErrors.email = 'El formato del email no es válido';
        }
        
        if (!adminData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        } else if (!/^\d{10}$/.test(adminData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'El teléfono debe tener 10 dígitos';
        }
        
        if (!adminData.documentNumber.trim()) {
            newErrors.documentNumber = 'El número de documento es requerido';
        }
        
        // Validación de contraseña (opcional para edición)
        if (adminData.password && adminData.password.trim() !== '') {
            if (adminData.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            }
            
            if (adminData.password !== adminData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
        }

        if (!currentAdmin?.idAdmin) {
            await Swal.fire({
                title: 'Error',
                text: 'No se puede actualizar: ID de administrador no válido',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return;
        }

        try {
            setIsLoading(true);

            // Preparar datos para envío (excluir contraseña si está vacía)
            const updateData = {
                name: adminData.name.trim(),
                email: adminData.email.trim().toLowerCase(),
                phone: adminData.phone.trim(),
                documentNumber: adminData.documentNumber.trim(),
                identificationType: adminData.identificationType,
                adminCode: adminData.adminCode.trim()
            };

            // Solo incluir contraseña si se proporcionó una nueva
            if (adminData.password && adminData.password.trim() !== '') {
                updateData.password = adminData.password;
            }

            await updateAdmin(currentAdmin.idAdmin, updateData);

            // Actualizar localStorage con los nuevos datos
            const updatedAdmin = { ...currentAdmin, ...updateData };
            localStorage.setItem("Admin", JSON.stringify(updatedAdmin));
            setCurrentAdmin(updatedAdmin);

            await Swal.fire({
                title: '¡Actualizado!',
                text: 'Tu perfil ha sido actualizado exitosamente',
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 3000,
                timerProgressBar: true
            });

            // Limpiar campos de contraseña y cerrar formulario
            setAdminData({
                ...adminData,
                password: '',
                confirmPassword: ''
            });
            setShowEditForm(false);

        } catch (error) {
            console.error('Error updating admin:', error);
            await Swal.fire({
                title: 'Error',
                text: error.message || 'Error al actualizar el perfil',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setShowEditForm(false);
        setErrors({});
        // Restaurar datos originales
        if (currentAdmin) {
            setAdminData({
                name: currentAdmin.name || '',
                email: currentAdmin.email || '',
                phone: currentAdmin.phone || '',
                documentNumber: currentAdmin.documentNumber || '',
                identificationType: currentAdmin.identificationType || 'CEDULA_DE_CIUDADANIA',
                adminCode: currentAdmin.adminCode || '',
                password: '',
                confirmPassword: ''
            });
        }
    };

    return (
        <div className="admin-settings">
            <header className="content-header">
                <h1>⚙️ Configuración del Sistema</h1>
                <p>Ajustes generales y preferencias del administrador</p>
            </header>

            <div className="settings-sections">
                <div className="settings-section">
                    <h3>👤 Perfil del Administrador</h3>
                    <div className="settings-content">
                        {!showEditForm ? (
                            <>
                                <div className="admin-info">
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <strong>Nombre:</strong>
                                            <span>{currentAdmin?.name || 'No disponible'}</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Email:</strong>
                                            <span>{currentAdmin?.email || 'No disponible'}</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Teléfono:</strong>
                                            <span>{currentAdmin?.phone || 'No disponible'}</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Documento:</strong>
                                            <span>{currentAdmin?.documentNumber || 'No disponible'}</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Código Admin:</strong>
                                            <span>{currentAdmin?.adminCode || 'No disponible'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="settings-btn"
                                    onClick={() => setShowEditForm(true)}
                                >
                                    ✏️ Editar Perfil
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} className="admin-edit-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="name">Nombre completo *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={adminData.name}
                                            onChange={handleChange}
                                            className={errors.name ? 'error' : ''}
                                            disabled={isLoading}
                                        />
                                        {errors.name && <span className="error-message">{errors.name}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={adminData.email}
                                            onChange={handleChange}
                                            className={errors.email ? 'error' : ''}
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
                                            value={adminData.phone}
                                            onChange={handleChange}
                                            className={errors.phone ? 'error' : ''}
                                            disabled={isLoading}
                                        />
                                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="identificationType">Tipo de identificación *</label>
                                        <select
                                            id="identificationType"
                                            name="identificationType"
                                            value={adminData.identificationType}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        >
                                            <option value="CEDULA_DE_CIUDADANIA">Cédula de Ciudadanía</option>
                                            <option value="CEDULA_DE_EXTRANJERIA">Cédula de Extranjería</option>
                                            <option value="PASAPORTE">Pasaporte</option>
                                            <option value="OTRO">Otro</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="documentNumber">Número de documento *</label>
                                        <input
                                            type="text"
                                            id="documentNumber"
                                            name="documentNumber"
                                            value={adminData.documentNumber}
                                            onChange={handleChange}
                                            className={errors.documentNumber ? 'error' : ''}
                                            disabled={isLoading}
                                        />
                                        {errors.documentNumber && <span className="error-message">{errors.documentNumber}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="adminCode">Código de administrador</label>
                                        <input
                                            type="text"
                                            id="adminCode"
                                            name="adminCode"
                                            value={adminData.adminCode}
                                            readOnly
                                            disabled
                                            className="readonly"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="password">Nueva contraseña (opcional)</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={adminData.password}
                                            onChange={handleChange}
                                            className={errors.password ? 'error' : ''}
                                            disabled={isLoading}
                                            placeholder="Dejar vacío para mantener la actual"
                                        />
                                        {errors.password && <span className="error-message">{errors.password}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={adminData.confirmPassword}
                                            onChange={handleChange}
                                            className={errors.confirmPassword ? 'error' : ''}
                                            disabled={isLoading}
                                            placeholder="Confirmar nueva contraseña"
                                        />
                                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button 
                                        type="submit" 
                                        className="btn-primary"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn-secondary"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                    >
                                        ❌ Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🏢 Sedes</h3>
                    <div className="settings-content">
                        <p>Gestión de sedes disponible en el módulo de Sucursales</p>
                        <button 
                            className="settings-btn"
                            onClick={() => window.location.href = '/admin/branches'}
                        >
                            🏢 Ir a Sucursales
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
