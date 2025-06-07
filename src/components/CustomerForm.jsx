import { useState, useEffect } from 'react';
import './CustomerForm.css';

const initialState = {
    name: '',
    lastName: '',
    identificationType: 'CC',
    identificationNumber: '',
    genderType: 'Masculino',
    nationality: '',
    email: '',
    phone: '',
    license: '',
    password: ''
};

const CustomerForm = ({ onSubmit, onCancel, customer, isEditing = false }) => {
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name || '',
                lastName: customer.lastName || '',
                identificationType: customer.identificationType || 'CC',
                identificationNumber: customer.identificationNumber || '',
                genderType: customer.genderType || 'Masculino',
                nationality: customer.nationality || '',
                email: customer.email || '',
                phone: customer.phone || '',
                license: customer.license || '',
                password: customer.password || ''
            });
        } else {
            setForm(initialState);
        }
    }, [customer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Limpiar error cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!form.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!form.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
        if (!form.identificationNumber.trim()) newErrors.identificationNumber = 'El número de identificación es requerido';
        if (!form.email.trim()) newErrors.email = 'El email es requerido';
        if (!form.phone.trim()) newErrors.phone = 'El teléfono es requerido';
        if (!form.nationality.trim()) newErrors.nationality = 'La nacionalidad es requerida';
        if (!isEditing && !form.password.trim()) newErrors.password = 'La contraseña es requerida';
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (form.email && !emailRegex.test(form.email)) {
            newErrors.email = 'Formato de email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const customerData = { ...form };
            // Si es edición y no se cambió la contraseña, no la enviamos
            if (isEditing && !customerData.password) {
                delete customerData.password;
            }
            onSubmit(customerData);
        }
    };

    return (
        <div className="customer-form-container">
            <div className="form-header">
                <h3>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
            </div>
            
            <form className="customer-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Nombre *</label>
                        <input 
                            name="name" 
                            value={form.name} 
                            onChange={handleChange} 
                            className={errors.name ? 'error' : ''}
                            placeholder="Ingrese el nombre"
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Apellido *</label>
                        <input 
                            name="lastName" 
                            value={form.lastName} 
                            onChange={handleChange}
                            className={errors.lastName ? 'error' : ''}
                            placeholder="Ingrese el apellido"
                        />
                        {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Tipo de Identificación</label>
                        <select name="identificationType" value={form.identificationType} onChange={handleChange}>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="PA">Pasaporte</option>
                            <option value="TI">Tarjeta de Identidad</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Número de Identificación *</label>
                        <input 
                            name="identificationNumber" 
                            value={form.identificationNumber} 
                            onChange={handleChange}
                            className={errors.identificationNumber ? 'error' : ''}
                            placeholder="Número de identificación"
                        />
                        {errors.identificationNumber && <span className="error-message">{errors.identificationNumber}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Género</label>
                        <select name="genderType" value={form.genderType} onChange={handleChange}>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Nacionalidad *</label>
                        <input 
                            name="nationality" 
                            value={form.nationality} 
                            onChange={handleChange}
                            className={errors.nationality ? 'error' : ''}
                            placeholder="Nacionalidad"
                        />
                        {errors.nationality && <span className="error-message">{errors.nationality}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Email *</label>
                        <input 
                            name="email" 
                            type="email"
                            value={form.email} 
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            placeholder="correo@ejemplo.com"
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Teléfono *</label>
                        <input 
                            name="phone" 
                            value={form.phone} 
                            onChange={handleChange}
                            className={errors.phone ? 'error' : ''}
                            placeholder="Número de teléfono"
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Licencia de Conducir</label>
                        <input 
                            name="license" 
                            value={form.license} 
                            onChange={handleChange}
                            placeholder="Número de licencia (opcional)"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Contraseña {!isEditing && '*'}</label>
                        <input 
                            name="password" 
                            type="password"
                            value={form.password} 
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                            placeholder={isEditing ? "Dejar vacío para mantener actual" : "Contraseña"}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary">
                        {isEditing ? 'Actualizar' : 'Crear'} Cliente
                    </button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
