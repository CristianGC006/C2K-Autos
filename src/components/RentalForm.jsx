// filepath: c:\Proyectos\C2K-Autos\src\components\RentalForm.jsx
import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCar, FaUser, FaDollarSign, FaSave, FaTimes } from 'react-icons/fa';
import { getCustomers } from '../services/CustomerService';
import { getAllVehicles } from '../services/VehicleService';
import { validateRentalData, getRentalStatuses } from '../services/RentalService';

const RentalForm = ({ rental, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        customerId: '',
        vehicleId: '',
        startDate: '',
        endDate: '',
        totalCost: '',
        status: 'PENDIENTE',
        notes: ''
    });

    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState({});
    const [calculatedDays, setCalculatedDays] = useState(0);
    const [selectedVehiclePrice, setSelectedVehiclePrice] = useState(0);

    // Cargar datos iniciales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoadingData(true);                const [customersData, vehiclesData] = await Promise.all([
                    getCustomers(),
                    getAllVehicles()
                ]);
                
                setCustomers(customersData);
                setVehicles(vehiclesData);
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error);
            } finally {
                setLoadingData(false);
            }
        };

        loadInitialData();
    }, []);    // Llenar formulario si hay una renta para editar
    useEffect(() => {
        if (rental) {
            console.log('RentalForm - Datos de renta recibidos para editar:', rental);
            
            setFormData({
                customerId: rental.customerId || '',
                vehicleId: rental.vehicleId || '',
                startDate: rental.startDate ? rental.startDate.split('T')[0] : '',
                endDate: rental.endDate ? rental.endDate.split('T')[0] : '',
                totalCost: rental.totalCost || rental.price || '',
                status: rental.status || 'PENDIENTE',
                notes: rental.notes || ''
            });
            
            console.log('RentalForm - FormData actualizado:', {
                customerId: rental.customerId || '',
                vehicleId: rental.vehicleId || '',
                startDate: rental.startDate ? rental.startDate.split('T')[0] : '',
                endDate: rental.endDate ? rental.endDate.split('T')[0] : '',
                totalCost: rental.totalCost || rental.price || '',
                status: rental.status || 'PENDIENTE',
                notes: rental.notes || ''
            });
        }
    }, [rental]);

    // Calcular días y costo automáticamente
    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            setCalculatedDays(diffDays);
            
            if (selectedVehiclePrice > 0 && diffDays > 0) {
                const totalCost = selectedVehiclePrice * diffDays;
                setFormData(prev => ({
                    ...prev,
                    totalCost: totalCost.toString()
                }));
            }
        }
    }, [formData.startDate, formData.endDate, selectedVehiclePrice]);

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo específico
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }        // Si cambió el vehículo, actualizar el precio
        if (name === 'vehicleId') {
            const selectedVehicle = vehicles.find(v => v.vehicleId.toString() === value);
            setSelectedVehiclePrice(selectedVehicle ? selectedVehicle.pricePerDay || 0 : 0);
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar datos
        const validation = validateRentalData({
            ...formData,
            customerId: parseInt(formData.customerId),
            vehicleId: parseInt(formData.vehicleId),
            totalCost: parseFloat(formData.totalCost)
        });
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        // Preparar datos para envío
        const rentalData = {
            ...formData,
            customerId: parseInt(formData.customerId),
            vehicleId: parseInt(formData.vehicleId),
            totalCost: parseFloat(formData.totalCost),
            startDate: formData.startDate + 'T00:00:00',
            endDate: formData.endDate + 'T23:59:59'
        };        await onSubmit(rentalData);
    };

    // Obtener nombre del cliente
    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.idCustomer.toString() === customerId.toString());
        return customer ? `${customer.name} ${customer.lastName}` : '';
    };

    // Obtener información del vehículo
    const getVehicleInfo = (vehicleId) => {
        const vehicle = vehicles.find(v => v.vehicleId.toString() === vehicleId.toString());
        return vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : '';
    };

    if (loadingData) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
                <span className="ml-3 text-gray-600">Cargando datos...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaCalendarAlt className="mr-2 text-[#014421]" />
                    {rental ? 'Editar Renta' : 'Nueva Renta'}
                </h2>
            </div>            <form onSubmit={handleSubmit} className="p-6">
                {/* Mensaje informativo si estamos editando y faltan datos */}
                {rental && (!formData.customerId || !formData.vehicleId) && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Información de renta incompleta
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        No se pudieron correlacionar automáticamente los datos del cliente y/o vehículo de esta renta. 
                                        Por favor selecciona manualmente el cliente y vehículo correspondientes.
                                    </p>
                                    <div className="mt-2 text-xs">
                                        <p><strong>Información de la renta:</strong></p>
                                        <p>• Vehículo: {rental.vehicleBrand} {rental.vehicleModel} ({rental.vehiclePlate})</p>
                                        <p>• Descripción: {rental.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cliente */}
                    <div>
                        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
                            <FaUser className="inline mr-1" />
                            Cliente *
                        </label>
                        <select
                            id="customerId"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-transparent ${
                                errors.customerId ? 'border-red-300' : 'border-gray-300'
                            }`}                        >                            <option value="">Seleccionar cliente</option>
                            {customers.map(customer => (
                                <option key={customer.idCustomer} value={customer.idCustomer}>
                                    {customer.name} {customer.lastName} - CC: {customer.identificationNumber} - {customer.email}
                                </option>
                            ))}
                        </select>
                        {errors.customerId && (
                            <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
                        )}
                    </div>

                    {/* Vehículo */}
                    <div>
                        <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">
                            <FaCar className="inline mr-1" />
                            Vehículo *
                        </label>
                        <select
                            id="vehicleId"
                            name="vehicleId"
                            value={formData.vehicleId}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-transparent ${
                                errors.vehicleId ? 'border-red-300' : 'border-gray-300'
                            }`}                        >
                            <option value="">Seleccionar vehículo</option>
                            {vehicles.filter(vehicle => 
                                vehicle && 
                                vehicle.vehicleId && 
                                vehicle.brand && 
                                vehicle.model && 
                                (vehicle.available !== false || vehicle.vehicleId.toString() === formData.vehicleId)                            ).map(vehicle => (
                                <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                    {vehicle.brand} {vehicle.model} ({vehicle.year}) - Placa: {vehicle.plate} - {vehicle.color}
                                    {vehicle.pricePerDay && ` - $${vehicle.pricePerDay.toLocaleString()}/día`}
                                </option>
                            ))}
                        </select>
                        {errors.vehicleId && (
                            <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>
                        )}
                        {selectedVehiclePrice > 0 && (
                            <p className="mt-1 text-sm text-green-600">
                                Precio por día: ${selectedVehiclePrice.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Fecha de inicio */}
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Inicio *
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-transparent ${
                                errors.startDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.startDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                        )}
                    </div>

                    {/* Fecha de fin */}
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Fin *
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-transparent ${
                                errors.endDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.endDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                        )}
                        {calculatedDays > 0 && (
                            <p className="mt-1 text-sm text-blue-600">
                                Duración: {calculatedDays} día{calculatedDays !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    {/* Costo total */}
                    <div>
                        <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700 mb-1">
                            <FaDollarSign className="inline mr-1" />
                            Costo Total *
                        </label>
                        <input
                            type="number"
                            id="totalCost"
                            name="totalCost"
                            value={formData.totalCost}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-transparent ${
                                errors.totalCost ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.totalCost && (
                            <p className="mt-1 text-sm text-red-600">{errors.totalCost}</p>
                        )}
                    </div>

                    {/* Estado */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                        >
                            {getRentalStatuses().map(status => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notas */}
                    <div className="md:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notas (Opcional)
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                            placeholder="Observaciones adicionales sobre la renta..."
                        />
                    </div>
                </div>

                {/* Resumen de la renta */}
                {formData.customerId && formData.vehicleId && formData.startDate && formData.endDate && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Resumen de la Renta</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Cliente:</span>
                                <p className="text-gray-900">{getCustomerName(formData.customerId)}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Vehículo:</span>
                                <p className="text-gray-900">{getVehicleInfo(formData.vehicleId)}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Duración:</span>
                                <p className="text-gray-900">{calculatedDays} día{calculatedDays !== 1 ? 's' : ''}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Costo Total:</span>
                                <p className="text-gray-900 text-lg font-bold text-green-600">
                                    ${parseFloat(formData.totalCost || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#014421] transition-colors duration-150"
                        disabled={loading}
                    >
                        <FaTimes className="inline mr-2" />
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#014421] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#014421] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                        {loading ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <FaSave className="inline mr-2" />
                                {rental ? 'Actualizar' : 'Crear'} Renta
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RentalForm;
