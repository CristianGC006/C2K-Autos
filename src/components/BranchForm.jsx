import React, { useState, useEffect } from 'react';
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaClock, FaCheck } from 'react-icons/fa';
import { validateBranchData, getBranchStatuses } from '../services/BranchService';

const BranchForm = ({ 
    branch = null, 
    onSubmit, 
    onCancel, 
    loading = false,
    mode = 'create' // 'create' or 'edit'
}) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        schedule: '',
        status: 'ACTIVA'
    });
    
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Cargar datos del branch si estamos editando
    useEffect(() => {
        if (branch && mode === 'edit') {
            setFormData({
                name: branch.name || '',
                address: branch.address || '',
                phone: branch.phone || '',
                schedule: branch.schedule || '',
                status: branch.status || 'ACTIVA'
            });
        }
    }, [branch, mode]);

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar errores cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Manejar blur (cuando el usuario sale del campo)
    const handleBlur = (field) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
        
        // Validar el campo específico
        const validation = validateBranchData(formData);
        if (validation.errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: validation.errors[field]
            }));
        }
    };

    // Manejar submit del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validar todos los campos
        const validation = validateBranchData(formData);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            setTouched({
                name: true,
                address: true,
                phone: true,
                schedule: true,
                status: true
            });
            return;
        }
        
        // Enviar datos
        onSubmit(formData);
    };

    return (
        <div className="branch-form-container">
            <div className="branch-form-header">
                <h2 className="branch-form-title">
                    <FaBuilding className="title-icon" />
                    {mode === 'create' ? 'Nueva Sucursal' : 'Editar Sucursal'}
                </h2>
                <p className="branch-form-subtitle">
                    {mode === 'create' 
                        ? 'Complete los siguientes campos para crear una nueva sucursal'
                        : 'Modifique los campos necesarios para actualizar la sucursal'
                    }
                </p>
            </div>
            
            <form onSubmit={handleSubmit} className="branch-form">
                {/* Nombre de la sucursal */}
                <div className="form-group">
                    <label htmlFor="name" className="form-label required">
                        <FaBuilding className="label-icon" />
                        Nombre de la Sucursal
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={() => handleBlur('name')}
                        className={`form-input ${errors.name ? 'error' : ''}`}
                        placeholder="Ej: Sucursal Centro"
                        disabled={loading}
                    />
                    {errors.name && touched.name && (
                        <span className="error-message">{errors.name}</span>
                    )}
                </div>

                {/* Dirección */}
                <div className="form-group">
                    <label htmlFor="address" className="form-label required">
                        <FaMapMarkerAlt className="label-icon" />
                        Dirección
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onBlur={() => handleBlur('address')}
                        className={`form-input ${errors.address ? 'error' : ''}`}
                        placeholder="Ej: Calle 123 #45-67, Barrio Centro"
                        disabled={loading}
                    />
                    {errors.address && touched.address && (
                        <span className="error-message">{errors.address}</span>
                    )}
                </div>

                {/* Teléfono */}
                <div className="form-group">
                    <label htmlFor="phone" className="form-label required">
                        <FaPhone className="label-icon" />
                        Teléfono
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={() => handleBlur('phone')}
                        className={`form-input ${errors.phone ? 'error' : ''}`}
                        placeholder="Ej: 3001234567"
                        disabled={loading}
                    />
                    {errors.phone && touched.phone && (
                        <span className="error-message">{errors.phone}</span>
                    )}
                </div>

                {/* Horario */}
                <div className="form-group">
                    <label htmlFor="schedule" className="form-label required">
                        <FaClock className="label-icon" />
                        Horario de Atención
                    </label>
                    <input
                        type="text"
                        id="schedule"
                        name="schedule"
                        value={formData.schedule}
                        onChange={handleChange}
                        onBlur={() => handleBlur('schedule')}
                        className={`form-input ${errors.schedule ? 'error' : ''}`}
                        placeholder="Ej: Lunes a Viernes 8:00 AM - 6:00 PM"
                        disabled={loading}
                    />
                    {errors.schedule && touched.schedule && (
                        <span className="error-message">{errors.schedule}</span>
                    )}
                </div>

                {/* Estado */}
                <div className="form-group">
                    <label htmlFor="status" className="form-label required">
                        <FaCheck className="label-icon" />
                        Estado
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        onBlur={() => handleBlur('status')}
                        className={`form-select ${errors.status ? 'error' : ''}`}
                        disabled={loading}
                    >
                        {getBranchStatuses().map(status => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    {errors.status && touched.status && (
                        <span className="error-message">{errors.status}</span>
                    )}
                </div>

                {/* Botones */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="btn-spinner"></div>
                                {mode === 'create' ? 'Creando...' : 'Actualizando...'}
                            </>
                        ) : (
                            <>
                                <FaCheck className="btn-icon" />
                                {mode === 'create' ? 'Crear Sucursal' : 'Actualizar Sucursal'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BranchForm;
