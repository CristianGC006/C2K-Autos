// Servicio para manejar facturas y rentas del cliente
const API_URL = 'http://localhost:8080/rental';
const CUSTOMER_API_URL = 'http://localhost:8080/customer';
const VEHICLE_API_URL = 'http://localhost:8080/vehicle';
const PAYMENT_API_URL = 'http://localhost:8080/payment';
const BRANCH_API_URL = 'http://localhost:8080/branches';
const ASSESSOR_API_URL = 'http://localhost:8080/assessor';

// Obtener todas las rentas de un cliente con información de pago
export const getCustomerRentals = async (customerId) => {
    try {
        const response = await fetch(`${API_URL}/customer/${customerId}`);
        if (!response.ok) {
            throw new Error('Error al obtener las rentas del cliente');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en getCustomerRentals:', error);
        throw error;
    }
};

// Obtener información completa para generar factura
export const getRentalForInvoice = async (rentalId) => {
    try {
        // FORZAR el uso de getRentalWithCompleteData para asegurar datos completos
        // El endpoint del backend no está devolviendo las entidades relacionadas correctamente
        console.log('Obteniendo datos completos para factura del rental:', rentalId);
        return await getRentalWithCompleteData(rentalId);
    } catch (error) {
        console.error('Error en getRentalForInvoice:', error);
        throw error;
    }
};

// Función para obtener datos completos de una renta con todas las relaciones
export const getRentalWithCompleteData = async (rentalId) => {
    try {
        // 1. Obtener la renta básica
        const rentalResponse = await fetch(`${API_URL}/${rentalId}`);
        if (!rentalResponse.ok) {
            throw new Error('Error al obtener la renta');
        }
        const rental = await rentalResponse.json();
        
        console.log('Datos de rental obtenidos:', rental);
          // 2. Obtener datos del cliente si existe customer ID
        let customer = null;
        // Buscar el customer ID en todas las posibles ubicaciones
        const customerId = rental.customer?.idCustomer || 
                          rental.customer?.customerId || 
                          rental.idCustomer || 
                          rental.customerId ||
                          rental.customer_id;
        console.log('Customer ID encontrado:', customerId);
        console.log('Estructura del customer en rental:', rental.customer);
        
        if (customerId) {
            try {
                const customerResponse = await fetch(`${CUSTOMER_API_URL}/${customerId}`);
                if (customerResponse.ok) {
                    customer = await customerResponse.json();
                    console.log('Datos del cliente obtenidos:', customer);
                } else {
                    console.warn('Error al obtener cliente, status:', customerResponse.status);
                }
            } catch (error) {
                console.warn('No se pudo obtener información del cliente:', error);
            }
        } else {
            console.warn('No se encontró ID de cliente en:', rental);
        }          // 3. Obtener datos del vehículo si existe vehicle ID
        let vehicle = null;
        const vehicleId = rental.vehicle?.vehicleId || 
                         rental.vehicle?.idVehicle || 
                         rental.vehicleId ||
                         rental.vehicle_id ||
                         rental.idVehicle;
        console.log('Vehicle ID encontrado:', vehicleId);
        console.log('Estructura del vehicle en rental:', rental.vehicle);
        
        if (vehicleId) {
            try {
                const vehicleResponse = await fetch(`${VEHICLE_API_URL}/${vehicleId}`);
                if (vehicleResponse.ok) {
                    vehicle = await vehicleResponse.json();
                    console.log('Datos del vehículo obtenidos:', vehicle);
                } else {
                    console.warn('Error al obtener vehículo, status:', vehicleResponse.status);
                }
            } catch (error) {
                console.warn('No se pudo obtener información del vehículo:', error);
            }
        } else {
            console.warn('No se encontró ID de vehículo en:', rental);
        }
          // 4. Obtener datos del pago si existe payment ID
        let payment = null;
        const paymentId = rental.payment?.idPayment || 
                         rental.payment?.paymentId || 
                         rental.paymentId ||
                         rental.payment_id;
        console.log('Payment ID encontrado:', paymentId);
        console.log('Estructura del payment en rental:', rental.payment);
        
        if (paymentId) {
            try {
                const paymentResponse = await fetch(`${PAYMENT_API_URL}/${paymentId}`);
                if (paymentResponse.ok) {
                    payment = await paymentResponse.json();
                    console.log('Datos del pago obtenidos:', payment);
                } else {
                    console.warn('Error al obtener pago, status:', paymentResponse.status);
                }
            } catch (error) {
                console.warn('No se pudo obtener información del pago:', error);
            }
        } else {
            console.warn('No se encontró ID de pago en:', rental);
        }
        
        // 5. Obtener datos de la sucursal si existe branch ID
        let branch = null;
        const branchId = rental.branch?.idBranch || 
                        rental.branch?.branchId || 
                        rental.branchId ||
                        rental.branch_id;
        console.log('Branch ID encontrado:', branchId);
        console.log('Estructura del branch en rental:', rental.branch);
        
        if (branchId) {
            try {
                const branchResponse = await fetch(`${BRANCH_API_URL}/${branchId}`);
                if (branchResponse.ok) {
                    branch = await branchResponse.json();
                    console.log('Datos de la sucursal obtenidos:', branch);
                } else {
                    console.warn('Error al obtener sucursal, status:', branchResponse.status);
                }
            } catch (error) {
                console.warn('No se pudo obtener información de la sucursal:', error);
            }
        } else {
            console.warn('No se encontró ID de sucursal en:', rental);
        }
        
        // 6. Obtener datos del asesor si existe assessor ID
        let assessor = null;
        const assessorId = rental.assessor?.idAssessor || 
                          rental.assessor?.assessorId || 
                          rental.assessorId ||
                          rental.assessor_id;
        console.log('Assessor ID encontrado:', assessorId);
        console.log('Estructura del assessor en rental:', rental.assessor);
        
        if (assessorId) {
            try {
                const assessorResponse = await fetch(`${ASSESSOR_API_URL}/${assessorId}`);
                if (assessorResponse.ok) {
                    assessor = await assessorResponse.json();
                    console.log('Datos del asesor obtenidos:', assessor);
                } else {
                    console.warn('Error al obtener asesor, status:', assessorResponse.status);
                }
            } catch (error) {
                console.warn('No se pudo obtener información del asesor:', error);
            }
        } else {
            console.warn('No se encontró ID de asesor en:', rental);
        }
        
        // 7. Combinar toda la información
        return {
            ...rental,
            customer: customer,
            vehicle: vehicle,
            payment: payment,
            branch: branch,
            assessor: assessor
        };
        
    } catch (error) {
        console.error('Error en getRentalWithCompleteData:', error);
        throw error;
    }
};

// Obtener solo las rentas activas de un cliente
export const getActiveCustomerRentals = async (customerId) => {
    try {
        const response = await fetch(`${API_URL}/customer/${customerId}/active`);
        if (!response.ok) {
            throw new Error('Error al obtener las rentas activas');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en getActiveCustomerRentals:', error);
        throw error;
    }
};

// Función auxiliar para formatear datos de factura desde el objeto Rental
export const formatInvoiceData = (rental) => {
    if (!rental) return null;
    
    return {
        // Información de la renta
        rentalId: rental.idRental,
        rentalName: rental.name,
        description: rental.description,
        price: rental.price,
        startDate: rental.startDate,
        endDate: rental.endDate,
        status: rental.status,
        
        // Información del cliente
        customer: {
            name: rental.customer?.name || 'N/A',
            lastName: rental.customer?.lastName || 'N/A',
            email: rental.customer?.email || 'N/A',
            phone: rental.customer?.phone || 'N/A',
            identification: rental.customer?.identificationNumber || 'N/A',
            identificationType: rental.customer?.identificationType || 'N/A'
        },
        
        // Información del vehículo
        vehicle: {
            brand: rental.vehicle?.brand || 'N/A',
            model: rental.vehicle?.model || 'N/A',
            color: rental.vehicle?.color || 'N/A',
            plate: rental.vehicle?.plate || 'N/A',
            year: rental.vehicle?.year || 'N/A',
            imageUrl: rental.vehicle?.imageUrl || null
        },
        
        // Información del pago
        payment: {
            paymentId: rental.payment?.idPayment || null,
            method: rental.payment?.paymentMethod || 'N/A',
            amount: rental.payment?.amount || 0
        },
        
        // Información adicional
        branch: rental.branch?.name || 'N/A',
        assessor: rental.assessor?.name || 'N/A'
    };
};

// Función para generar el HTML de la factura (sin SweetAlert)
export const generateInvoiceHTML = (invoiceData) => {
    const currentDate = new Date().toLocaleDateString('es-CO');
    
    return `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
            <!-- Header -->
            <div style="text-align: center; border-bottom: 2px solid #014421; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #014421; margin: 0;">C2K AUTOS</h1>
                <h2 style="color: #666; margin: 5px 0;">FACTURA DE RENTA</h2>
                <p style="margin: 5px 0;">Fecha: ${currentDate}</p>
            </div>
            
            <!-- Información de la renta -->
            <div style="margin-bottom: 25px;">
                <h3 style="color: #014421; border-bottom: 1px solid #eee; padding-bottom: 5px;">Información de la Renta</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong>ID Renta:</strong> ${invoiceData.rentalId}<br>
                        <strong>Nombre:</strong> ${invoiceData.rentalName}<br>
                        <strong>Fecha Inicio:</strong> ${invoiceData.startDate}<br>
                        <strong>Fecha Fin:</strong> ${invoiceData.endDate}
                    </div>
                    <div>
                        <strong>Precio:</strong> $${invoiceData.price?.toLocaleString()}<br>
                        <strong>Estado:</strong> ${invoiceData.status}<br>
                        <strong>Sucursal:</strong> ${invoiceData.branch}<br>
                        <strong>Asesor:</strong> ${invoiceData.assessor}
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <strong>Descripción:</strong> ${invoiceData.description}
                </div>
            </div>
            
            <!-- Información del cliente -->
            <div style="margin-bottom: 25px;">
                <h3 style="color: #014421; border-bottom: 1px solid #eee; padding-bottom: 5px;">Información del Cliente</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong>Nombre:</strong> ${invoiceData.customer.name} ${invoiceData.customer.lastName}<br>
                        <strong>Email:</strong> ${invoiceData.customer.email}<br>
                        <strong>Teléfono:</strong> ${invoiceData.customer.phone}
                    </div>
                    <div>
                        <strong>Tipo ID:</strong> ${invoiceData.customer.identificationType}<br>
                        <strong>Número ID:</strong> ${invoiceData.customer.identification}
                    </div>
                </div>
            </div>
            
            <!-- Información del vehículo -->
            <div style="margin-bottom: 25px;">
                <h3 style="color: #014421; border-bottom: 1px solid #eee; padding-bottom: 5px;">Información del Vehículo</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong>Marca:</strong> ${invoiceData.vehicle.brand}<br>
                        <strong>Modelo:</strong> ${invoiceData.vehicle.model}<br>
                        <strong>Año:</strong> ${invoiceData.vehicle.year}
                    </div>
                    <div>
                        <strong>Color:</strong> ${invoiceData.vehicle.color}<br>
                        <strong>Placa:</strong> ${invoiceData.vehicle.plate}
                    </div>
                </div>
            </div>
            
            <!-- Información del pago -->
            <div style="margin-bottom: 25px;">
                <h3 style="color: #014421; border-bottom: 1px solid #eee; padding-bottom: 5px;">Información del Pago</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <strong>ID Pago:</strong> ${invoiceData.payment.paymentId || 'Pendiente'}<br>
                            <strong>Método:</strong> ${invoiceData.payment.method}
                        </div>
                        <div>
                            <strong>Monto:</strong> $${invoiceData.payment.amount?.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; border-top: 2px solid #014421; padding-top: 20px; margin-top: 30px; color: #666;">
                <p>Gracias por elegir C2K Autos</p>
                <p style="font-size: 12px;">Esta es una factura generada automáticamente</p>
            </div>
        </div>
    `;
};
