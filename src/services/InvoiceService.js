// Servicio para manejar facturas y rentas del cliente
const API_URL = 'http://localhost:8080/rental';
const CUSTOMER_API_URL = 'http://localhost:8080/customer';
const VEHICLE_API_URL = 'http://localhost:8080/vehicle';
const PAYMENT_API_URL = 'http://localhost:8080/payment';
const BRANCH_API_URL = 'http://localhost:8080/branches';
const ASSESSOR_API_URL = 'http://localhost:8080/assessor';

// Obtener todas las rentas de un cliente con información completa para facturas
export const getCustomerRentals = async (customerId) => {
    try {
        console.log(`Obteniendo rentas para el cliente ${customerId}...`);
        
        // Usar el endpoint específico que devuelve las rentas del cliente con detalles
        const response = await fetch(`${API_URL}/customer/${customerId}`);
        
        // Verificación de respuesta
        if (!response.ok) {
            const statusText = response.statusText || 'Desconocido';
            console.warn(`Error HTTP ${response.status} (${statusText}) al obtener las rentas del cliente ${customerId}`);
            
            if (response.status === 404) {
                console.log('No se encontraron rentas para el cliente, devolviendo array vacío');
                return []; // Cliente sin rentas (situación normal)
            }
            
            throw new Error(`Error del servidor (${response.status}): ${statusText}`);
        }
        
        // Procesar los datos
        const rentals = await response.json();
        
        // Validar que tengamos datos válidos
        if (!Array.isArray(rentals)) {
            console.warn('La respuesta no es un array. Respuesta:', rentals);
            return []; // Devolver array vacío para evitar errores en la UI
        }
        
        console.log(`✅ ${rentals.length} rentas obtenidas para el cliente ${customerId}`);
        return rentals;
    } catch (error) {
        console.error('❌ Error en getCustomerRentals:', error);
        
        // Mostrar detalles adicionales para facilitar la depuración
        if (error.name === 'TypeError') {
            console.error('Posible error de conexión o CORS:', error.message);
        }
        
        // SIEMPRE retornamos un array vacío para evitar roturas en la UI
        return [];
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
    try {        // 1. Intenta obtener la renta completa desde el endpoint específico para facturas
        try {
            const invoiceRentalResponse = await fetch(`${API_URL}/invoice/${rentalId}`);
            if (invoiceRentalResponse.ok) {
                const completeRental = await invoiceRentalResponse.json();
                console.log('Datos completos obtenidos desde /invoice:', completeRental);
                // Si la respuesta parece tener datos relacionados completos, usarla directamente
                if (completeRental.customer?.name && completeRental.vehicle?.brand) {
                    return completeRental;
                }
            }
        } catch (invoiceError) {
            console.warn('Error al usar el endpoint /invoice, intentando método alternativo:', invoiceError);
        }
        
        // 2. Si el endpoint específico falla, realizar múltiples peticiones para obtener toda la información
        const rentalResponse = await fetch(`${API_URL}/${rentalId}`);
        if (!rentalResponse.ok) {
            throw new Error('Error al obtener la renta');
        }
        const rental = await rentalResponse.json();
        
        console.log('Datos de rental obtenidos:', rental);
        // 3. Obtener datos del cliente si existe customer ID
        let customer = null;
        // Buscar el customer ID en todas las posibles ubicaciones
        const customerId = rental.customer?.idCustomer || 
                          rental.customer?.customerId || 
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
        const paymentId = rental.payment?.idPayment || rental.payment?.paymentId || rental.paymentId;
        console.log('Payment ID encontrado:', paymentId);
        
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
        }
        
        // 5. Obtener datos de la sucursal si existe branch ID
        let branch = null;
        const branchId = rental.branch?.idBranch || rental.branch?.branchId || rental.branchId;
        console.log('Branch ID encontrado:', branchId);
        
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
        }
        
        // 6. Obtener datos del asesor si existe assessor ID
        let assessor = null;
        const assessorId = rental.assessor?.idAssessor || rental.assessor?.assessorId || rental.assessorId;
        console.log('Assessor ID encontrado:', assessorId);
        
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
    
    console.log('Formateando datos de factura. Rental completo:', rental);
    // Función auxiliar mejorada para extraer datos en cualquier formato conocido
    const extractNestedValue = (obj, paths, defaultValue = 'N/A') => {
        if (!obj) return defaultValue;
        
        // Primero intentar con las rutas exactas proporcionadas
        for (const path of paths) {
            const value = path.split('.').reduce((o, p) => o && o[p] !== undefined ? o[p] : undefined, obj);
            if (value !== undefined && value !== null && value !== '') {
                return value;
            }
        }
        
        // Segundo intento: buscar en todas las propiedades del objeto con nombres similares
        if (typeof obj === 'object') {
            // Convertir todas las rutas a nombres de propiedades finales para buscar
            const propertyNames = paths.map(path => {
                const parts = path.split('.');
                return parts[parts.length - 1].toLowerCase();
            });
            
            // Buscar recursivamente por nombres de propiedades similares
            const searchRecursively = (object, depth = 0) => {
                if (!object || typeof object !== 'object' || depth > 3) return null; // Limitar profundidad
                
                for (const key in object) {
                    // Comprobar si esta propiedad coincide con alguna que estamos buscando
                    if (propertyNames.includes(key.toLowerCase()) && 
                        object[key] !== undefined && 
                        object[key] !== null && 
                        object[key] !== '') {
                        return object[key];
                    }
                    
                    // Buscar recursivamente en propiedades que son objetos
                    if (typeof object[key] === 'object') {
                        const result = searchRecursively(object[key], depth + 1);
                        if (result !== null) return result;
                    }
                }
                return null;
            };
            
            const result = searchRecursively(obj);
            if (result !== null) return result;
        }
        
        // Tercer intento: buscar directamente en el objeto rental completo
        if (window.rental && typeof window.rental === 'object') {
            for (const propName of paths) {
                const simpleName = propName.split('.').pop(); // Obtener el nombre simple (sin puntos)
                // Buscar propiedades con prefijos comunes
                const possibleNames = [
                    simpleName,
                    `customer${simpleName.charAt(0).toUpperCase() + simpleName.slice(1)}`,
                    `vehicle${simpleName.charAt(0).toUpperCase() + simpleName.slice(1)}`,
                    `branch${simpleName.charAt(0).toUpperCase() + simpleName.slice(1)}`,
                    `assessor${simpleName.charAt(0).toUpperCase() + simpleName.slice(1)}`,
                    `payment${simpleName.charAt(0).toUpperCase() + simpleName.slice(1)}`
                ];
                
                for (const name of possibleNames) {
                    if (window.rental[name] !== undefined && window.rental[name] !== null && window.rental[name] !== '') {
                        return window.rental[name];
                    }
                }
            }
        }
        
        return defaultValue;
    };// Extraer ID de renta
    const rentalId = extractNestedValue(rental, ['idRental', 'id', 'rentalId'], 'N/A');
    
    // Extraer información del cliente con soporte para múltiples formatos
    const customer = rental.customer || {};
    console.log('Datos de cliente encontrados:', customer);
    
    // Extraer nombre del cliente (no almacenamos el ID porque no lo usamos más adelante)
    const customerName = extractNestedValue(customer, ['name'], null) || 
                       extractNestedValue(rental, ['customerName'], null);

    let firstName = 'N/A';
    let lastName = 'N/A';
    
    // Dividir el nombre completo si existe
    if (customerName) {
        const nameParts = customerName.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    } else {
        firstName = extractNestedValue(customer, ['name', 'firstName'], 'N/A');
        lastName = extractNestedValue(customer, ['lastName', 'surname'], 'N/A');
    }
      // Extraer información del vehículo con soporte para múltiples formatos
    const vehicle = rental.vehicle || {};
    console.log('Datos de vehículo encontrados:', vehicle);
    
    // Extraer información del pago con soporte para múltiples formatos
    const payment = rental.payment || {};
    console.log('Datos de pago encontrados:', payment);
    
    // Extraer información de la sucursal con soporte para múltiples formatos
    const branch = rental.branch || {};
    console.log('Datos de sucursal encontrados:', branch);
    
    // Extraer información del asesor con soporte para múltiples formatos
    const assessor = rental.assessor || {};
    console.log('Datos de asesor encontrados:', assessor);
      // Crear un objeto con todos los datos extraídos e información de fallback
    const rentalName = extractNestedValue(rental, ['name'], null) || 
                     (extractNestedValue(vehicle, ['brand'], '') && extractNestedValue(vehicle, ['model'], '') 
                      ? `${vehicle.brand} ${vehicle.model}` 
                      : 'N/A');

    // Extraer precio con soporte para múltiples formatos y asegurar que sea un número
    let price = parseFloat(extractNestedValue(rental, ['price', 'totalCost', 'amount', 'totalAmount'], '0')) || 0;
    // Si el precio es demasiado bajo, puede ser que esté en otro formato o ubicación
    if (price <= 0 && payment) {
        price = parseFloat(extractNestedValue(payment, ['amount', 'total', 'value', 'totalAmount'], '0')) || 0;
    }
    
    // Mejorar extracción de fechas con múltiples formatos
    let startDate = extractNestedValue(rental, ['startDate', 'initialDate', 'rentalStart', 'fechaInicio', 'inicio'], 'N/A');
    let endDate = extractNestedValue(rental, ['endDate', 'finalDate', 'rentalEnd', 'fechaFin', 'fin'], 'N/A');
    
    // Intentar dar formato a las fechas si son objetos Date o timestamps
    try {
        if (startDate && startDate !== 'N/A') {
            if (typeof startDate === 'object' && startDate instanceof Date) {
                startDate = startDate.toLocaleDateString('es-CO');
            } else if (!isNaN(new Date(startDate).getTime())) {
                startDate = new Date(startDate).toLocaleDateString('es-CO');
            }
        }
        
        if (endDate && endDate !== 'N/A') {
            if (typeof endDate === 'object' && endDate instanceof Date) {
                endDate = endDate.toLocaleDateString('es-CO');
            } else if (!isNaN(new Date(endDate).getTime())) {
                endDate = new Date(endDate).toLocaleDateString('es-CO');
            }
        }
    } catch (error) {
        console.warn("Error al formatear fechas:", error);
    }
    
    return {        // Información de la renta
        rentalId: rentalId,
        rentalName: rentalName,
        description: extractNestedValue(rental, ['description', 'desc', 'comment', 'comentario'], 'Sin descripción disponible'),
        price: price,
        startDate: startDate,
        endDate: endDate,
        status: extractNestedValue(rental, ['status', 'state', 'rentalStatus', 'estado'], 'N/A'),
          // Información del cliente con más opciones de búsqueda
        customer: {
            name: firstName,
            lastName: lastName,
            email: extractNestedValue(customer, ['email', 'correo', 'mail'], 
                   extractNestedValue(rental, ['customerEmail', 'clientEmail', 'email'], 'N/A')),
            phone: extractNestedValue(customer, ['phone', 'phoneNumber', 'telephone', 'telefono', 'movil'], 
                   extractNestedValue(rental, ['customerPhone', 'clientPhone', 'phone'], 'N/A')),
            identification: extractNestedValue(customer, ['identificationNumber', 'identification', 'documentNumber', 'documento', 'dni', 'cedula'], 
                            extractNestedValue(rental, ['customerIdentification', 'clientIdentification', 'identification'], 'N/A')),
            identificationType: extractNestedValue(customer, ['identificationType', 'documentType', 'tipoDocumento', 'tipoCedula'], 
                               extractNestedValue(rental, ['customerIdentificationType', 'clientIdentificationType', 'identificationType'], 'N/A'))
        },
        
        // Información del vehículo con más opciones de búsqueda
        vehicle: {
            brand: extractNestedValue(vehicle, ['brand', 'marca', 'make', 'fabricante'], 
                   extractNestedValue(rental, ['vehicleBrand', 'carBrand', 'brand', 'marca'], 'N/A')),
            model: extractNestedValue(vehicle, ['model', 'modelo', 'tipo'], 
                   extractNestedValue(rental, ['vehicleModel', 'carModel', 'model', 'modelo'], 'N/A')),
            color: extractNestedValue(vehicle, ['color', 'carColor', 'colorVehiculo'], 
                   extractNestedValue(rental, ['vehicleColor', 'carColor', 'color'], 'N/A')),
            plate: extractNestedValue(vehicle, ['plate', 'plateNumber', 'registration', 'placa', 'matricula'], 
                   extractNestedValue(rental, ['vehiclePlate', 'carPlate', 'plate', 'placa'], 'N/A')),
            year: extractNestedValue(vehicle, ['year', 'modelo', 'año', 'fabricacion'], 
                  extractNestedValue(rental, ['vehicleYear', 'carYear', 'year', 'año'], 'N/A')),
            imageUrl: extractNestedValue(vehicle, ['imageUrl', 'image', 'img', 'imagen', 'foto'], 
                     extractNestedValue(rental, ['vehicleImageUrl', 'carImageUrl', 'imageUrl'], null))
        },
          // Información del pago con más opciones de búsqueda
        payment: {
            paymentId: extractNestedValue(payment, ['idPayment', 'id', 'paymentId', 'pagoId'], 
                      extractNestedValue(rental, ['paymentId', 'idPayment', 'pagoId'], 'Pendiente')),
            method: extractNestedValue(payment, ['paymentMethod', 'method', 'type', 'metodoPago', 'formaPago', 'medio'], 
                   extractNestedValue(rental, ['paymentMethod', 'metodoPago', 'formaPago'], 'N/A')),
            amount: parseFloat(extractNestedValue(payment, ['amount', 'total', 'value', 'totalAmount', 'monto', 'valor', 'precio'], 
                    extractNestedValue(rental, ['paymentAmount', 'amount', 'price', 'total', 'precio'], '0'))) || 0
        },
        
        // Información adicional con más opciones de búsqueda
        branch: extractNestedValue(branch, ['name', 'branchName', 'nombreSucursal', 'oficina'], 
               extractNestedValue(rental, ['branchName', 'officeName', 'sucursal', 'branch'], 'N/A')),
        assessor: extractNestedValue(assessor, ['name', 'assessorName', 'nombreAsesor', 'vendedor', 'asesor'], 
                extractNestedValue(rental, ['assessorName', 'asesor', 'vendedor', 'assessor'], 'N/A'))
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
