import { useState } from 'react';
import { createCustomer, updateCustomer } from '../../services/CustomerService';
import CustomerTable from '../../components/CustomerTable';
import CustomerForm from '../../components/CustomerForm';
import Swal from 'sweetalert2';

const CustomerManagement = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [refreshTable, setRefreshTable] = useState(0);

    const handleAddCustomer = () => {
        setEditingCustomer(null);
        setShowForm(true);
    };

    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setShowForm(true);
    };    const handleFormSubmit = async (customerData) => {
        try {
            console.log('CustomerManagement - Datos recibidos del formulario:', customerData);
            console.log('CustomerManagement - Cliente a editar:', editingCustomer);
            
            // Mostrar loading
            Swal.fire({
                title: editingCustomer ? 'Actualizando cliente...' : 'Creando cliente...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            if (editingCustomer) {
                console.log('CustomerManagement - Actualizando cliente con ID:', editingCustomer.idCustomer);
                const result = await updateCustomer(editingCustomer.idCustomer, customerData);
                console.log('CustomerManagement - Resultado de actualización:', result);
                
                // Éxito en actualización
                await Swal.fire({
                    icon: 'success',
                    title: '¡Cliente actualizado!',
                    text: `${customerData.name} ${customerData.lastName} ha sido actualizado exitosamente.`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#014421',
                    timer: 3000
                });
            } else {
                console.log('CustomerManagement - Creando nuevo cliente');
                const result = await createCustomer(customerData);
                console.log('CustomerManagement - Resultado de creación:', result);
                
                // Éxito en creación
                await Swal.fire({
                    icon: 'success',
                    title: '¡Cliente creado!',
                    text: `${customerData.name} ${customerData.lastName} ha sido registrado exitosamente.`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#014421',
                    timer: 3000
                });
            }
            
            setShowForm(false);
            setEditingCustomer(null);
            setRefreshTable(prev => prev + 1); // Trigger refresh
        } catch (error) {
            console.error('CustomerManagement - Error al guardar cliente:', error);
            
            // Error
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar cliente',
                text: error.message || 'Ocurrió un error inesperado al guardar el cliente',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingCustomer(null);
    };

    return (
        <div className="customer-management">
            <header className="content-header">
                <h1>👥 Gestión de Clientes</h1>
                <p>Administrar clientes del sistema C2K</p>
            </header>

            {showForm ? (
                <div className="form-container">
                    <div className="form-header">
                        <h2>{editingCustomer ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</h2>
                        <button onClick={handleFormCancel} className="close-btn">✕</button>
                    </div>                    <CustomerForm
                        customer={editingCustomer}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        isEditing={!!editingCustomer}
                    />
                </div>
            ) : (
                <div className="table-container">
                    <div className="table-header">
                        <h2>Lista de Clientes</h2>
                        <button onClick={handleAddCustomer} className="add-btn">
                            <span>➕</span> Agregar Cliente
                        </button>
                    </div>                    <CustomerTable
                        key={refreshTable}
                        onEdit={handleEditCustomer}
                    />
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;
