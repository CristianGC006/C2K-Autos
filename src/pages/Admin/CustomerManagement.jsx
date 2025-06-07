import { useState } from 'react';
import { createCustomer, updateCustomer } from '../../services/CustomerService';
import CustomerTable from '../../components/CustomerTable';
import CustomerForm from '../../components/CustomerForm';

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
    };

    const handleFormSubmit = async (customerData) => {
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.idCustomer, customerData);
            } else {
                await createCustomer(customerData);
            }
            setShowForm(false);
            setEditingCustomer(null);
            setRefreshTable(prev => prev + 1); // Trigger refresh
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            alert('Error al guardar cliente');
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
