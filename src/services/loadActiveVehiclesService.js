// Servicio para cargar vehículos activos del usuario (rentas activas)
import { imageService } from "./imageService";

// URLs de la API
const RENTAL_API_URL = 'http://localhost:8080/rental';
const CUSTOMER_API_URL = 'http://localhost:8080/customer';
const VEHICLE_API_URL = 'http://localhost:8080/vehicle';

/**
 * Carga los vehículos alquilados activos para un cliente específico
 * @param {number} customerId - ID del cliente
 * @returns {Promise<Array>} - Array de vehículos alquilados con información completa
 */
export const loadActiveVehiclesForCustomer = async (customerId) => {
    try {
        console.log(`⏳ Cargando vehículos alquilados activos para el cliente con ID: ${customerId}`);

        // Validar ID del cliente y convertir a número si es un string
        if (!customerId) {
            console.error("❌ ID de cliente inválido o no proporcionado");
            
            // Intentar obtener ID desde localStorage como fallback
            try {
                const storedUser = localStorage.getItem("User");
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    customerId = parsedUser?.idCustomer || parsedUser?.id || parsedUser?.customer_id || parsedUser?.userId;
                    console.log("ID obtenido desde localStorage:", customerId);
                }
            } catch (e) {
                console.warn("Error obteniendo ID desde localStorage:", e);
            }
            
            if (!customerId) return [];
        }
        
        // Asegurar que el ID es un número
        customerId = parseInt(customerId, 10);

        // Verificar el ID convertido
        if (isNaN(customerId)) {
            console.error("❌ ID de cliente no es un número válido");
            return [];
        }

        console.log(`✅ ID de cliente validado: ${customerId}`);

        // 1. Intentar cargar rentals activos del cliente - primer intento
        let activeRentals = [];
        try {
            console.log(`🔍 Consultando API: ${RENTAL_API_URL}/customer/${customerId}/active`);
            const rentalsResponse = await fetch(`${RENTAL_API_URL}/customer/${customerId}/active`);
            console.log(`📊 Respuesta del servidor:`, rentalsResponse.status, rentalsResponse.statusText);
            
            if (rentalsResponse.ok) {
                activeRentals = await rentalsResponse.json();
                console.log(`✅ Datos obtenidos: ${activeRentals.length} rentas activas`);
            } else if (rentalsResponse.status === 404) {
                console.log("⚠️ No se encontraron rentas activas para este cliente (404)");
            } else {
                console.error(`❌ Error en la respuesta: ${rentalsResponse.status}`);
            }
        } catch (error) {
            console.error("❌ Error en la primera consulta:", error);
        }

        // Si el primer método falló, intentar con endpoint alternativo
        if (activeRentals.length === 0) {
            try {
                console.log(`🔄 Intentando método alternativo: ${RENTAL_API_URL}/active/customer/${customerId}`);
                const alternativeResponse = await fetch(`${RENTAL_API_URL}/active/customer/${customerId}`);
                console.log(`📊 Respuesta alternativa:`, alternativeResponse.status);
                
                if (alternativeResponse.ok) {
                    activeRentals = await alternativeResponse.json();
                    console.log(`✅ Datos alternativos obtenidos: ${activeRentals.length} rentas`);
                }
            } catch (altError) {
                console.error("❌ Error en consulta alternativa:", altError);
            }
        }

        // Último intento: obtener todas las rentas del cliente y filtrar por estado
        if (activeRentals.length === 0) {
            try {
                console.log(`🔄 Último intento: ${RENTAL_API_URL}/customer/${customerId}`);
                const allRentalsResponse = await fetch(`${RENTAL_API_URL}/customer/${customerId}`);
                
                if (allRentalsResponse.ok) {
                    const allRentals = await allRentalsResponse.json();
                    console.log(`✅ Total de rentas obtenidas: ${allRentals.length}`);
                    
                    // Filtrar manualmente las rentas activas
                    activeRentals = allRentals.filter(rental => 
                        rental.status === 'ACTIVE' || 
                        rental.status === 'active' ||
                        // También incluir rentas que no han expirado basado en la fecha de fin
                        (rental.endDate && new Date(rental.endDate) > new Date())
                    );
                    console.log(`✅ Rentas activas filtradas: ${activeRentals.length}`);
                }
            } catch (finalError) {
                console.error("❌ Error en intento final:", finalError);
            }
        }

        // 3. Si no hay rentas activas, retornar array vacío
        if (!activeRentals || activeRentals.length === 0) {
            console.log("⚠️ No se encontraron rentas activas después de todos los intentos");
            return [];
        }

        // 4. Filtrar rentas que no tienen vehículo asignado
        const validRentals = activeRentals.filter(rental => rental.vehicle || rental.vehicleId);
        console.log(`✓ ${validRentals.length} rentas con vehículo asignado`);

        // 5. Procesar cada rental para extraer la información del vehículo y agregarle datos adicionales
        const processedVehicles = await Promise.all(validRentals.map(async rental => {
            // Determinar la fuente del vehículo
            let vehicle = null;

            // Propiedad vehicle anidada
            if (rental.vehicle) {
                vehicle = rental.vehicle;
                console.log(`✓ Rental ${rental.idRental || rental.id}: Usando vehículo anidado`);
            } 
            // Referencia por ID
            else if (rental.vehicleId) {
                try {
                    const vehicleResponse = await fetch(`${VEHICLE_API_URL}/${rental.vehicleId}`);
                    if (vehicleResponse.ok) {
                        vehicle = await vehicleResponse.json();
                        console.log(`✓ Rental ${rental.idRental || rental.id}: Vehículo cargado desde API por ID ${rental.vehicleId}`);
                    } else {
                        console.error(`❌ Error cargando vehículo por ID ${rental.vehicleId}`);
                    }
                } catch (error) {
                    console.error(`❌ Error al obtener vehículo por ID ${rental.vehicleId}:`, error);
                }
            }

            // Si no se encontró un vehículo válido, intentar como último recurso buscar por ID de rental
            if (!vehicle && (rental.idRental || rental.id)) {
                try {
                    const rentalId = rental.idRental || rental.id;
                    console.log(`🔍 Buscando vehículo por ID de rental: ${rentalId}`);
                    
                    // Intentar obtener el vehículo desde la información detallada del rental
                    const detailedRentalResponse = await fetch(`${RENTAL_API_URL}/${rentalId}`);
                    if (detailedRentalResponse.ok) {
                        const detailedRental = await detailedRentalResponse.json();
                        if (detailedRental.vehicle) {
                            vehicle = detailedRental.vehicle;
                            console.log(`✅ Vehículo encontrado en detalle del rental ${rentalId}`);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error al obtener detalle del rental:`, error);
                }
            }

            // Si aún no tenemos un vehículo válido, omitir este registro
            if (!vehicle) {
                console.warn(`⚠️ Rental ${rental.idRental || rental.id}: No tiene vehículo asociado después de todos los intentos`);
                return null;
            }

            // ✅ Obtener imagen para el vehículo
            const brand = vehicle.brand || '';
            const model = vehicle.model || '';
            let imageUrl;

            try {
                if (brand && model) {
                    imageUrl = await imageService.getValidatedImage(brand, model);
                } else {
                    imageUrl = imageService.defaultImage;
                }
            } catch (error) {
                console.error("Error obteniendo imagen:", error);
                imageUrl = imageService.defaultImage;
            }

            // ✅ Construir objeto de vehículo enriquecido con datos de rental
            const enrichedVehicle = {
                // ✅ Datos del vehículo
                vehicleId: vehicle.vehicleId || vehicle.vehicle_id || vehicle.id,
                vehicle_id: vehicle.vehicleId || vehicle.vehicle_id || vehicle.id, // Mantener ambas propiedades por compatibilidad
                brand: vehicle.brand || 'Sin marca',
                model: vehicle.model || 'Sin modelo',
                year: vehicle.year || 'N/A',
                plate: vehicle.plate || 'Sin placa',
                color: vehicle.color || 'N/A',
                price: vehicle.price || rental.price / (rental.rentalDays || 1), // Precio por día
                image_url: imageUrl,
                imageLoaded: true,
                type: vehicle.type || '',

                // ✅ Datos del rental
                rentalId: rental.idRental || rental.id,
                startDate: rental.startDate,
                endDate: rental.endDate,
                rentalStatus: rental.status,
                rentalPrice: rental.price,
                rentalDays: rental.rentalDays || calculateDays(rental.startDate, rental.endDate),
                description: rental.description,
                
                // ✅ Datos del cliente mejorados para mayor compatibilidad
                customerId: customerId,
                customers: {
                    id: customerId, 
                    customerId: customerId,
                    idCustomer: customerId,
                    // Añadir información adicional si está disponible desde el rental
                    name: rental.customer?.name || rental.customer?.firstName || '',
                    email: rental.customer?.email || '',
                    phone: rental.customer?.phone || ''
                },
                // Añadir referencia circular a customer para mayor compatibilidad
                customer: {
                    id: customerId,
                    idCustomer: customerId,
                    name: rental.customer?.name || rental.customer?.firstName || '',
                    email: rental.customer?.email || ''
                }
            };

            return enrichedVehicle;
        }));

        // 6. Filtrar resultados nulos
        const validVehicles = processedVehicles.filter(v => v !== null);
        console.log(`🚗 ${validVehicles.length} vehículos activos procesados para el cliente ${customerId}`);
        
        return validVehicles;
    } catch (error) {
        console.error("❌ Error cargando vehículos activos:", error);
        return [];
    }
};

// Función auxiliar para calcular días entre fechas
const calculateDays = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return 0;
    
    try {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
        console.error("Error calculando días:", error);
        return 0;
    }
};
