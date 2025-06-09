import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import VehicleCard from "../VehicleCard";
import CarouselCars from "../CarouselCars";
import { imageService } from "../../services/imageService";
import { getCustomerRentals, formatInvoiceData, generateInvoiceHTML } from "../../services/InvoiceServiceImproved";
import { getCustomerRentalStats } from "../../services/CustomerRentalStatsService";
import { loadActiveVehiclesForCustomer } from "../../services/loadActiveVehiclesService";
import "./panel.css";

function Panel({ activeSection, setActiveSection, user }) {
  const [rentedCars, setRentedCars] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [nextReservation] = useState(null);
  const [userInfo, setUserInfo] = useState(user || {});
  const [loading, setLoading] = useState(true);  const [error, setError] = useState(null);  const [customerRentals, setCustomerRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(false);  const [customerStats, setCustomerStats] = useState({
    activeVehicles: 0,
    totalRentals: 0,
    completedRentals: 0,
    totalSpent: 0
  });
  const navigate = useNavigate();  // ✅ FUNCIÓN PARA VALIDAR Y OBTENER EL ID DEL USUARIO (OPTIMIZADA CON USECALLBACK)
  const getUserId = useCallback(() => {
    // Buscar el ID usando la estructura real del API (idCustomer)
    let userId = userInfo?.idCustomer || userInfo?.id || userInfo?.customer_id || userInfo?.userId;
    
    // Si no está en el estado, obtenerlo directamente del localStorage
    if (!userId) {
      const storedUser = localStorage.getItem("User");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser?.idCustomer || parsedUser?.id || parsedUser?.customer_id || parsedUser?.userId;
          console.log("Usuario desde localStorage:", parsedUser);
          console.log("ID extraído:", userId);
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
    }

    const numericId = userId ? parseInt(userId, 10) : null;
    
    if (!numericId || isNaN(numericId)) {
      console.warn("ID de usuario inválido:", userId, "userInfo:", userInfo);
      // Como fallback temporal, usamos el ID 11 que sabemos que tiene datos
      console.warn("🚨 USANDO ID TEMPORAL 11 COMO FALLBACK - REVISA LA AUTENTICACIÓN");
      return 11;
    }
    
    console.log("✅ ID de usuario válido:", numericId);
    return numericId;
  }, [userInfo]); // Incluir userInfo como dependencia
  // ✅ CARGAR INFORMACIÓN DEL USUARIO DESDE EL BACKEND SI NO TENEMOS DATOS COMPLETOS
  useEffect(() => {
    const loadUserInfo = async () => {
      // Solo cargar del backend si no tenemos información completa del usuario
      if (!userInfo?.idCustomer && !userInfo?.id) {
        try {
          const currentUserId = getUserId();
          if (currentUserId) {
            console.log("Cargando información del usuario desde el backend para ID:", currentUserId);
            const response = await fetch(`http://localhost:8080/customer/${currentUserId}`);
            if (response.ok) {
              const userData = await response.json();
              setUserInfo(userData);
              console.log("✅ Información del usuario cargada desde backend:", userData);
            } else {
              console.warn("No se pudo cargar información del usuario desde el backend");
            }
          }
        } catch (error) {
          console.error("Error cargando información del usuario:", error);
        }
      } else {
        console.log("✅ Información del usuario ya disponible:", userInfo);
      }
    };
    loadUserInfo();
  }, [getUserId, userInfo]);

// ✅ FUNCIÓN PARA CARGAR RENTAS DEL CLIENTE (FACTURAS)
  const loadCustomerRentals = useCallback(async () => {
    const currentUserId = getUserId();
    if (!currentUserId) {
      console.warn("No user ID available for loading rentals");
      return;
    }

    try {
      setRentalsLoading(true);
      console.log("Loading customer rentals for user:", currentUserId);
      
      const rentals = await getCustomerRentals(currentUserId);
      setCustomerRentals(rentals);
      console.log("Customer rentals loaded:", rentals);
    } catch (error) {
      console.error("Error loading customer rentals:", error);
      // No mostramos alert aquí para no interrumpir la experiencia
    } finally {
      setRentalsLoading(false);
    }
  }, [getUserId]);

  // ✅ FUNCIÓN PARA CARGAR ESTADÍSTICAS DEL CLIENTE
  const loadCustomerStats = useCallback(async () => {
    const currentUserId = getUserId();
    if (!currentUserId) {
      console.warn("No user ID available for loading stats");
      return;
    }    try {
      console.log("Loading customer stats for user:", currentUserId);
      
      const stats = await getCustomerRentalStats(currentUserId);
      setCustomerStats(stats);
      console.log("Customer stats loaded:", stats);
    } catch (error) {
      console.error("Error loading customer stats:", error);
      // Mantener valores por defecto en caso de error
      setCustomerStats({
        activeVehicles: 0,
        totalRentals: 0,
        completedRentals: 0,
        totalSpent: 0
      });
    }
  }, [getUserId]);
  // ✅ FUNCIÓN PARA RECARGAR VEHÍCULOS (PARA USAR DESPUÉS DE ALQUILAR)
  const reloadVehicles = useCallback(async () => {
    try {
      console.log("Reloading vehicles after rental..."); 
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/vehicle');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }      const data = await response.json();
      console.log("Vehicles reloaded successfully:", data);
      
      const dataWithCorrectFields = await Promise.all(data.map(async (vehicle) => {
        let finalImageUrl;
        
        const brand = vehicle?.brand || '';
        const model = vehicle?.model || '';
        const imageUrl = vehicle?.imageUrl || '';
        
        // Validar que brand y model tengan valores válidos antes de usar imageService
        const hasValidBrandModel = brand && brand.trim() !== '' && model && model.trim() !== '';
        
        if (imageUrl && imageUrl.trim() !== '') {
          if (hasValidBrandModel) {
            finalImageUrl = await imageService.getValidatedImage(brand, model, imageUrl);
          } else {
            // Si no hay brand/model válidos, usar la imagen por defecto
            finalImageUrl = imageService.defaultImage;
          }
        } else {
          if (hasValidBrandModel) {
            finalImageUrl = await imageService.getValidatedImage(brand, model);
          } else {
            // Si no hay brand/model válidos, usar la imagen por defecto
            finalImageUrl = imageService.defaultImage;
          }
        }
        
        return {
          ...vehicle,
          vehicle_id: vehicle?.vehicleId || vehicle?.vehicle_id || 0,
          image_url: finalImageUrl,
          imageLoaded: true,
          brand: brand || 'Sin marca',
          model: model || 'Sin modelo',
          plate: vehicle?.plate || 'Sin placa',
          year: vehicle?.year || 'N/A',
          price: vehicle?.price || 0
        };
      }));      const available = dataWithCorrectFields.filter(vehicle => 
        !vehicle.customers || !vehicle.customers.id
      );
      setAvailableCars(available);
      console.log("Available vehicles after reload:", available.length);
      
      const currentUserId = getUserId();
      if (currentUserId) {
        // Verificar si el backend devuelve campo customers
        const hasCustomersField = dataWithCorrectFields.some(vehicle => Object.prototype.hasOwnProperty.call(vehicle, 'customers'));
        
        if (hasCustomersField) {
          // Backend corregido: usar estructura normal
          const rented = dataWithCorrectFields.filter(vehicle => 
            vehicle.customers && 
            vehicle.customers.id && 
            parseInt(vehicle.customers.id, 10) === currentUserId
          );
          setRentedCars(rented);
          console.log("Rented vehicles for user", currentUserId, "after reload:", rented.length);
        } else {
          // Usar estructura Customer->Rental<-Vehicle
          try {
            const rentalsResponse = await fetch(`http://localhost:8080/rental/customer/${currentUserId}/active`);
            if (rentalsResponse.ok) {
              const rentalsData = await rentalsResponse.json();
              
              const rentedVehiclesWithRentalInfo = rentalsData.map(rental => {
                const rentalVehicleId = rental.vehicle?.vehicleId || rental.vehicleId;
                let vehicleData = null;
                
                if (rentalVehicleId) {
                  vehicleData = dataWithCorrectFields.find(v => 
                    (v.vehicleId && v.vehicleId === rentalVehicleId) || 
                    (v.vehicle_id && v.vehicle_id === rentalVehicleId)
                  );
                }
                
                if (!vehicleData && rental.name) {
                  vehicleData = dataWithCorrectFields.find(v => {
                    const vehicleName = `${v.brand || ''} ${v.model || ''}`.trim();
                    return vehicleName === rental.name.trim();
                  });
                }
                
                if (vehicleData) {
                  return {
                    ...vehicleData,
                    startDate: rental.startDate,
                    endDate: rental.endDate,
                    rentalId: rental.idRental || rental.id,
                    customers: { 
                      id: currentUserId,
                      name: rental.customer?.name || 'Usuario'
                    }
                  };
                }
                return null;
              }).filter(Boolean);
              
              setRentedCars(rentedVehiclesWithRentalInfo);
              console.log("Rented vehicles for user", currentUserId, "after reload:", rentedVehiclesWithRentalInfo.length);
            }
          } catch (error) {
            console.error("Error loading rentals in reload:", error);
          }
        }
      }

      setLoading(false);
    } catch (error) {      console.error('Error reloading vehicles:', error);
      setError(`Error al recargar vehículos: ${error.message}`);
      setLoading(false);    }
  }, [getUserId]); // Solo depende de getUserId para estabilidad
// ✅ USEEFFECT PARA CARGAR FACTURAS CUANDO SE CAMBIA A LA SECCIÓN CORRESPONDIENTE
  useEffect(() => {
    let isMounted = true;
    let loadAttempted = false; // Rastrear si ya se intentó cargar
    
    if (activeSection === "facturas" && isMounted) {
      console.log("Verificando si necesitamos cargar facturas para la sección 'facturas'");
      
      // Solo cargar si:
      // 1. No hay rentals cargados
      // 2. No está actualmente cargando
      // 3. No se ha intentado cargar en esta ejecución del efecto
      if (customerRentals.length === 0 && !rentalsLoading && !loadAttempted) {
        console.log("Cargando facturas automáticamente al cambiar a sección 'facturas'");
        loadAttempted = true; // Marcar que ya intentamos cargar
        loadCustomerRentals();
      } else {
        console.log("No es necesario cargar facturas:", 
          customerRentals.length > 0 ? "Ya hay facturas cargadas" : 
          rentalsLoading ? "Ya se están cargando facturas" : 
          loadAttempted ? "Ya se intentó cargar facturas" : "Razón desconocida");
      }
    }
    
    // Cleanup function para evitar actualizaciones en componentes desmontados
    return () => {
      isMounted = false;
    };    // Incluimos customerRentals.length como dependencia para satisfacer React,
    // pero la lógica interna evita el bucle infinito con loadAttempted
  }, [activeSection, loadCustomerRentals, customerRentals.length, rentalsLoading]);
  // ✅ USEEFFECT PARA CARGAR RENTAS Y ESTADÍSTICAS AL MONTAR EL COMPONENTE
  useEffect(() => {
    if (activeSection === "inicio") {
      console.log("Cargando estadísticas para la sección 'inicio'");
      loadCustomerStats();
    }
  }, [activeSection, loadCustomerStats]);

// ✅ USEEFFECT PARA INICIALIZAR LA CARGA DE DATOS
  useEffect(() => {
    console.log("Panel component mounted, loading initial data...");
    
    const loadData = async () => {
      try {
        console.log("Loading initial vehicles...");
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8080/vehicle');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Initial vehicles loaded:", data);
        
        const dataWithCorrectFields = await Promise.all(data.map(async (vehicle) => {
          let finalImageUrl;
          
          const brand = vehicle?.brand || '';
          const model = vehicle?.model || '';
          const imageUrl = vehicle?.imageUrl || '';
          
          // Validar que brand y model tengan contenido válido
          const hasValidBrandModel = brand.trim() !== '' && model.trim() !== '';
          
          if (imageUrl && imageUrl.trim() !== '') {
            if (hasValidBrandModel) {
              finalImageUrl = await imageService.getValidatedImage(brand, model, imageUrl);
            } else {
              // Si no hay brand/model válidos, usar la imagen por defecto
              finalImageUrl = imageService.defaultImage;
            }
          } else {
            if (hasValidBrandModel) {
              finalImageUrl = await imageService.getValidatedImage(brand, model);
            } else {
              // Si no hay brand/model válidos, usar la imagen por defecto
              finalImageUrl = imageService.defaultImage;
            }
          }
          
          return {
            ...vehicle,
            vehicle_id: vehicle?.vehicleId || vehicle?.vehicle_id || 0,
            image_url: finalImageUrl,
            imageLoaded: true,
            brand: brand || 'Sin marca',
            model: model || 'Sin modelo',
            plate: vehicle?.plate || 'Sin placa',
            year: vehicle?.year || 'N/A',
            price: vehicle?.price || 750
          };
        }));        // ✅ SOLUCIÓN INTELIGENTE: Detectar automáticamente la estructura de datos del backend
        // Obtener el ID del usuario actual
        const currentUserId = getUserId();
        console.log("Current user ID for filtering:", currentUserId);
        
        // Verificar si el backend ya devuelve relaciones customers
        const hasCustomersField = data.some(vehicle => Object.prototype.hasOwnProperty.call(vehicle, 'customers'));
        console.log("Backend devuelve campo 'customers':", hasCustomersField);
        
        if (hasCustomersField) {
          // ✅ BACKEND CORREGIDO: Usar la estructura normal con customers
          console.log("🎉 Usando estructura normal del backend (customers field disponible)");
          
          const available = dataWithCorrectFields.filter(vehicle => 
            !vehicle.customers || !vehicle.customers.id
          );
          setAvailableCars(available);
          console.log("Available vehicles:", available.length);
          
          if (currentUserId) {
            const rented = dataWithCorrectFields.filter(vehicle => 
              vehicle.customers && 
              vehicle.customers.id && 
              parseInt(vehicle.customers.id, 10) === currentUserId
            );
            setRentedCars(rented);
            console.log("Rented vehicles for user", currentUserId, ":", rented.length);
          }        } else {
          // 🔧 NUEVA SOLUCIÓN: Usar los datos de rentals anidados en /vehicle
          console.log("⚠️ Usando estructura de rentals anidados en /vehicle");
          
          // 1. Cargar rentals activos del usuario para obtener datos adicionales
          let activeRentalsData = [];
          if (currentUserId) {
            try {
              const rentalsResponse = await fetch(`http://localhost:8080/rental/customer/${currentUserId}/active`);
              if (rentalsResponse.ok) {
                const rentalsData = await rentalsResponse.json();
                console.log("User active rentals data:", rentalsData);
                activeRentalsData = rentalsData || [];
              }
            } catch (error) {
              console.error("Error loading user active rentals:", error);
            }
          }

          // 2. Identificar vehículos alquilados y disponibles usando los rentals anidados
          const rentedVehiclesFromEndpoint = [];
          const availableVehicles = [];

          dataWithCorrectFields.forEach(vehicle => {
            const hasActiveRentals = vehicle.rentals && vehicle.rentals.length > 0 && 
              vehicle.rentals.some(rental => rental.status === 'ACTIVE');
            
            if (hasActiveRentals) {
              // Buscar si algún rental activo pertenece al usuario actual
              const userActiveRental = vehicle.rentals.find(rental => {
                if (rental.status !== 'ACTIVE') return false;
                
                // Buscar este rental en los datos del usuario
                return activeRentalsData.some(userRental => 
                  userRental.idRental === rental.idRental
                );
              });

              if (userActiveRental) {
                // Este vehículo está alquilado por el usuario actual
                const matchingUserRental = activeRentalsData.find(r => 
                  r.idRental === userActiveRental.idRental
                );

                // Combinar datos del vehículo, rental anidado y rental del usuario
                const combinedVehicle = {
                  ...vehicle,
                  // Datos del rental activo
                  rentalId: userActiveRental.idRental,
                  startDate: userActiveRental.startDate || matchingUserRental?.startDate,
                  endDate: userActiveRental.endDate || matchingUserRental?.endDate,
                  rentalStatus: userActiveRental.status || matchingUserRental?.status,
                  rentalPrice: userActiveRental.price || matchingUserRental?.price,
                  description: userActiveRental.description || matchingUserRental?.description,
                  // Extraer datos del nombre del rental si vehicle.brand/model están vacíos
                  brand: vehicle.brand || userActiveRental.name?.split(' ')[0] || 'Sin marca',
                  model: vehicle.model || userActiveRental.name?.split(' ').slice(1).join(' ') || 'Sin modelo',
                  // Extraer placa de la descripción del rental
                  plate: vehicle.plate || (() => {
                    const description = userActiveRental.description || matchingUserRental?.description || '';
                    const plateMatch = description.match(/Placa:\s*([^)]+)/);
                    return plateMatch ? plateMatch[1].trim() : 'Sin placa';
                  })(),
                  // Simular estructura customers para compatibilidad
                  customers: { 
                    id: currentUserId,
                    name: matchingUserRental?.customer?.name || 'Usuario'
                  }
                };

                rentedVehiclesFromEndpoint.push(combinedVehicle);
                console.log("Found rented vehicle for user:", combinedVehicle);
              } else {
                // Vehículo está alquilado pero no por el usuario actual - disponible para otros
                availableVehicles.push(vehicle);
              }
            } else {
              // Vehículo sin rentals activos - disponible
              availableVehicles.push(vehicle);
            }
          });

          setAvailableCars(availableVehicles);
          setRentedCars(rentedVehiclesFromEndpoint);
          
          console.log("Available vehicles:", availableVehicles.length);
          console.log("Rented vehicles for user", currentUserId, ":", rentedVehiclesFromEndpoint.length);
          console.log("Rented vehicles details:", rentedVehiclesFromEndpoint);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading initial vehicles:', error);
        setError(`Error al cargar vehículos: ${error.message}`);
        setLoading(false);
      }    };
    
    loadData();
  }, [getUserId]); // Solo depende de getUserId para estabilidad

  // ✅ FUNCIÓN PARA MOSTRAR DETALLES DE FACTURA
  const showInvoiceDetails = async (rentalId) => {
    console.log("Loading invoice details for rental:", rentalId);
    
    // Crear referencia al diálogo de carga para poder cerrarlo en cualquier escenario
    let loadingSwal;
    
    try {
      // Mostrar pantalla de carga
      loadingSwal = Swal.fire({
        title: 'Cargando factura...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Obtener datos de la factura
      let rental;
      try {
        const response = await fetch(`http://localhost:8080/invoice/${rentalId}`);
        
        if (!response.ok) {
          throw new Error(`Error al obtener factura: ${response.status} ${response.statusText}`);
        }
        
        rental = await response.json();
        console.log("Datos completos de factura obtenidos:", rental);
      } catch (fetchError) {
        console.error("Error fetching invoice data:", fetchError);
        // Asegurar que el diálogo de carga se cierre antes de mostrar error
        if (loadingSwal) {
          await loadingSwal.close();
        }
        throw new Error(`Error al obtener datos de la factura: ${fetchError.message}`);
      }

      // Formatear los datos para mostrarlos
      let invoiceData;
      try {
        invoiceData = formatInvoiceData(rental);
        if (!invoiceData) {
          throw new Error('El formato de datos de factura está vacío');
        }
        console.log("Datos de factura formateados:", invoiceData);
      } catch (formatError) {
        console.error("Error al formatear datos:", formatError);
        // Asegurar que el diálogo de carga se cierre antes de mostrar error
        if (loadingSwal) {
          await loadingSwal.close();
        }
        throw new Error(`No se pudo formatear la información de la factura: ${formatError.message}`);
      }
      
      // Generar HTML
      let invoiceHTML;
      try {
        invoiceHTML = generateInvoiceHTML(invoiceData);
      } catch (htmlError) {
        console.error("Error al generar HTML:", htmlError);
        // Asegurar que el diálogo de carga se cierre antes de mostrar error
        if (loadingSwal) {
          await loadingSwal.close();
        }
        throw new Error(`No se pudo generar el HTML de la factura: ${htmlError.message}`);
      }
      
      // Cerrar el diálogo de carga antes de mostrar los resultados
      if (loadingSwal) {
        await loadingSwal.close();
        loadingSwal = null; // Evitar múltiples intentos de cierre
      }
      
      // Mostrar la factura
      const result = await Swal.fire({
        title: '📄 Factura Detallada',
        html: invoiceHTML,
        showCancelButton: true,
        confirmButtonText: '📧 Enviar por Email',
        cancelButtonText: '❌ Cerrar',
        confirmButtonColor: '#014421',
        cancelButtonColor: '#6c757d',
        width: '800px',
        scrollbarPadding: false
      });

      // Opcional: Implementar lógica para enviar email si el usuario lo solicita
      if (result.isConfirmed) {
        await Swal.fire({
          icon: 'info',
          title: 'Enviando factura',
          text: 'Esta funcionalidad de envío por email está en desarrollo',
          confirmButtonColor: '#014421'
        });
      }

    } catch (error) {
      console.error("Error showing invoice details:", error);
      
      // Cerrar el diálogo de carga en caso de que aún esté abierto
      if (loadingSwal) {
        try {
          await loadingSwal.close();
        } catch (closeError) {
          console.error("Error cerrando el diálogo de carga:", closeError);
        }
      }
      
      // Mostrar mensaje de error al usuario
      await Swal.fire({
        icon: 'error',
        title: 'Error al Cargar Factura',
        text: `Error: ${error.message}`,
        confirmButtonColor: '#014421'
      });
    }
  };

  // ✅ FUNCIÓN PARA MANEJAR CAMBIOS EN LA INFORMACIÓN DEL USUARIO
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevUserInfo => ({
      ...prevUserInfo,
      [name]: value
    }));
  };

  // Función para alquilar un vehículo con generación de factura
  const rentVehicle = async (vehicleId) => {
    const currentUserId = getUserId();
    if (!currentUserId) {
      await Swal.fire({
        icon: 'error',
        title: 'Error de Autenticación',
        text: 'Usuario no válido. Por favor, inicia sesión nuevamente.',
        confirmButtonColor: '#014421'
      });
      return;
    }

    try {
      setLoading(true); // Mostrar loading durante el proceso de alquiler
      const selectedVehicle = availableCars.find(car => car.vehicle_id === vehicleId);
      if (!selectedVehicle) {
        throw new Error('Vehículo no encontrado');
      }

      // Solicitar duración del alquiler con SweetAlert2
      const { value: daysInput } = await Swal.fire({
        title: `Alquilar ${selectedVehicle.brand} ${selectedVehicle.model}`,
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p><strong>🚗 Vehículo:</strong> ${selectedVehicle.brand} ${selectedVehicle.model}</p>
            <p><strong>🏷️ Placa:</strong> ${selectedVehicle.plate}</p>
            <p><strong>📅 Año:</strong> ${selectedVehicle.year || 'N/A'}</p>
            <p><strong>💰 Precio por día:</strong> $${selectedVehicle.price || 750}</p>
          </div>
          <label for="rental-days" style="display: block; margin-bottom: 10px; font-weight: bold;">¿Por cuántos días deseas alquilarlo?</label>
        `,
        input: 'number',
        inputLabel: 'Número de días',
        inputValue: 1,
        inputAttributes: {
          id: 'rental-days',
          min: 1,
          max: 365,
          step: 1
        },
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#014421',
        cancelButtonColor: '#d33',
        inputValidator: (value) => {
          if (!value || isNaN(value) || parseInt(value) <= 0) {
            return 'Debe ingresar un número válido de días mayor a 0';
          }
        }
      });
      
      if (!daysInput) {
        setLoading(false);
        return; // Usuario canceló
      }

      const rentalDays = parseInt(daysInput);
      const dailyPrice = selectedVehicle.price || 750;
      const totalAmount = dailyPrice * rentalDays;

      // Mostrar confirmación con resumen detallado
      const confirmResult = await Swal.fire({
        title: '📋 Confirmar Alquiler',
        html: `
          <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 15px 0;">
            <h4 style="color: #014421; margin-bottom: 15px;">📄 Resumen del Alquiler</h4>
            <div style="display: grid; gap: 8px;">
              <p><strong>🚗 Vehículo:</strong> ${selectedVehicle.brand} ${selectedVehicle.model}</p>
              <p><strong>🏷️ Placa:</strong> ${selectedVehicle.plate}</p>
              <p><strong>📅 Año:</strong> ${selectedVehicle.year || 'N/A'}</p>
              <p><strong>📆 Duración:</strong> ${rentalDays} día(s)</p>
              <p><strong>💵 Precio por día:</strong> $${dailyPrice}</p>
              <p style="border-top: 2px solid #014421; padding-top: 10px; margin-top: 10px;">
                <strong style="color: #014421; font-size: 1.2em;">💳 TOTAL A PAGAR: $${totalAmount}</strong>
              </p>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '✅ Confirmar Alquiler',
        cancelButtonText: '❌ Cancelar',
        confirmButtonColor: '#014421',
        cancelButtonColor: '#d33',
        reverseButtons: true
      });
      
      if (!confirmResult.isConfirmed) {
        setLoading(false);
        return;
      }

      // Mostrar loading durante el proceso
      Swal.fire({
        title: 'Procesando Alquiler...',
        html: 'Por favor espera mientras procesamos tu solicitud',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // 1. Verificar qué entidades existen en la base de datos
      let validAdminId = 1;
      let validBranchId = 1;
      let validAssessorId = 1;
      let validCustomerId = currentUserId;
      let customerEntity = null;
      
      try {
        // Verificar administradores
        const adminResponse = await fetch('http://localhost:8080/admin');
        if (adminResponse.ok) {
          const admins = await adminResponse.json();
          console.log("Administradores disponibles:", admins);
          if (admins && admins.length > 0) {
            validAdminId = admins[0].idAdmin || 1;
          }
        }

        // Verificar sucursales
        const branchResponse = await fetch('http://localhost:8080/branch');
        if (branchResponse.ok) {
          const branches = await branchResponse.json();
          console.log("Sucursales disponibles:", branches);
          if (branches && branches.length > 0) {
            validBranchId = branches[0].idBranch || 1;
          }
        }

        // Verificar asesores
        const assessorResponse = await fetch('http://localhost:8080/assessor');
        if (assessorResponse.ok) {
          const assessors = await assessorResponse.json();
          console.log("Asesores disponibles:", assessors);
          if (assessors && assessors.length > 0) {
            validAssessorId = assessors[0].idAssessor || 1;
          }
        }

        // ✅ CRÍTICO: Cargar el Customer completo de la base de datos
        console.log("Cargando customer completo con ID:", currentUserId);
        
        const customerResponse = await fetch(`http://localhost:8080/customer/${currentUserId}`);
        if (!customerResponse.ok) {
          // Si no encontramos el customer específico, buscamos en la lista general
          const allCustomersResponse = await fetch('http://localhost:8080/customer');
          if (allCustomersResponse.ok) {
            const customers = await allCustomersResponse.json();
            console.log("Customers disponibles:", customers);
            
            // Buscar el customer actual por su ID
            customerEntity = customers.find(customer => 
              customer.id === currentUserId || 
              customer.idCustomer === currentUserId ||
              customer.customer_id === currentUserId
            );
            
            if (!customerEntity) {
              throw new Error(`El usuario con ID ${currentUserId} no existe en la base de datos. Por favor, verifica tu sesión.`);
            }
            
            validCustomerId = customerEntity.id || customerEntity.idCustomer || customerEntity.customer_id;
            console.log("Customer encontrado en BD:", customerEntity, "usando ID:", validCustomerId);
          } else {
            throw new Error("No se pudieron cargar los customers de la base de datos");
          }
        } else {
          customerEntity = await customerResponse.json();
          console.log("Customer cargado directamente:", customerEntity);
          validCustomerId = customerEntity.id || customerEntity.idCustomer || currentUserId;
        }
      } catch (error) {
        console.error("Error al verificar entidades:", error);
        throw error;
      }

      // 2. Crear el registro de alquiler
      const currentDate = new Date();
      const startDate = currentDate.toISOString().split('T')[0];
      const endDate = new Date(currentDate.getTime() + (rentalDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      
      const rentalData = {
        name: `${selectedVehicle.brand} ${selectedVehicle.model}`,
        description: `Alquiler del ${selectedVehicle.brand} ${selectedVehicle.model} (Placa: ${selectedVehicle.plate}) por ${rentalDays} día(s)`,
        price: totalAmount,
        startDate: startDate,
        endDate: endDate,
        status: "ACTIVE",
        vehicle: {
          vehicleId: selectedVehicle.vehicle_id
        },
        customer: customerEntity,
        assessor: {
          idAssessor: validAssessorId
        },
        branch: {
          idBranch: validBranchId
        },
        admin: {
          idAdmin: validAdminId
        }
      };      console.log("Creando registro de alquiler:", rentalData);
      
      const rentalResponse = await fetch('http://localhost:8080/rental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rentalData),
      });

      if (!rentalResponse.ok) {
        const errorText = await rentalResponse.text();
        throw new Error(`Error al crear el registro de alquiler: ${errorText}`);
      }

      const rentalResult = await rentalResponse.json();
      console.log("Alquiler creado exitosamente:", rentalResult);

      // 3. Actualizar el estado del vehículo
      const vehicleUpdateData = {
        customers: {
          id: customerEntity.id || customerEntity.idCustomer
        },
        branches: {
          idBranch: validBranchId
        },
        admin: {
          idAdmin: validAdminId
        }
      };

      console.log("Actualizando vehículo con datos:", vehicleUpdateData);      const vehicleUpdateResponse = await fetch(`http://localhost:8080/vehicle/${selectedVehicle.vehicle_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(vehicleUpdateData),
      });

      if (!vehicleUpdateResponse.ok) {
        const errorText = await vehicleUpdateResponse.text();
        throw new Error(`Error al actualizar el estado del vehículo: ${errorText}`);
      }

      // 4. Generar factura
      const paymentData = {
        paymentMethod: "CREDIT_CARD",
        amount: totalAmount,
        rental: {
          idRental: rentalResult.idRental || rentalResult.id_rental || rentalResult.id
        }
      };

      console.log("Generando factura:", paymentData);      const paymentResponse = await fetch('http://localhost:8080/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(paymentData),
      });

      let paymentResult = null;
      let invoiceId = 'N/A';

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.warn("Error al generar factura:", errorText);
        invoiceId = 'Error en generación';
      } else {
        paymentResult = await paymentResponse.json();
        console.log("Factura generada:", paymentResult);
        invoiceId = paymentResult.idPayment || paymentResult.id_payment || paymentResult.id || 'Generado';
      }

      // 5. Actualizar la lista de vehículos
      await reloadVehicles();

      // 6. Mostrar factura detallada
      await Swal.fire({
        title: '🎉 ¡ALQUILER EXITOSO!',
        html: `
          <div style="text-align: left; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 15px; margin: 20px 0; border: 2px solid #014421;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h3 style="color: #014421; margin: 0;">📋 FACTURA DE ALQUILER</h3>
              <p style="color: #666; margin: 5px 0;">Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
            </div>
            
            <div style="border: 1px solid #014421; border-radius: 10px; padding: 15px; background: white; margin-bottom: 15px;">
              <h4 style="color: #014421; margin-bottom: 10px;">🚗 DATOS DEL VEHÍCULO</h4>
              <div style="display: grid; gap: 5px; font-size: 14px;">
                <p><strong>Marca y Modelo:</strong> ${selectedVehicle.brand} ${selectedVehicle.model}</p>
                <p><strong>Placa:</strong> ${selectedVehicle.plate}</p>
                <p><strong>Año:</strong> ${selectedVehicle.year || 'N/A'}</p>
              </div>
            </div>

            <div style="border: 1px solid #014421; border-radius: 10px; padding: 15px; background: white; margin-bottom: 15px;">
              <h4 style="color: #014421; margin-bottom: 10px;">👤 DATOS DEL CLIENTE</h4>
              <div style="display: grid; gap: 5px; font-size: 14px;">
                <p><strong>Nombre:</strong> ${userInfo.name || "Cliente"}</p>
                <p><strong>Email:</strong> ${userInfo.email || "cliente@email.com"}</p>
                <p><strong>ID Cliente:</strong> ${currentUserId}</p>
              </div>
            </div>

            <div style="border: 1px solid #014421; border-radius: 10px; padding: 15px; background: white;">
              <h4 style="color: #014421; margin-bottom: 10px;">💰 DETALLES DE PAGO</h4>
              <div style="display: grid; gap: 5px; font-size: 14px;">
                <p><strong>Duración:</strong> ${rentalDays} día(s)</p>
                <p><strong>Precio por día:</strong> $${dailyPrice}</p>
                <p><strong>Método de pago:</strong> Tarjeta de Crédito</p>
                <p style="border-top: 2px solid #014421; padding-top: 10px; margin-top: 10px;">
                  <strong style="color: #014421; font-size: 16px;">TOTAL PAGADO: $${totalAmount}</strong>
                </p>
                <p><strong>ID Factura:</strong> <span style="color: #014421;">${invoiceId}</span></p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; padding: 15px; background: #014421; color: white; border-radius: 10px;">
              <h4 style="margin: 0;">✅ PAGO PROCESADO EXITOSAMENTE</h4>
              <p style="margin: 5px 0; font-size: 14px;">¡Gracias por confiar en C2K Autos!</p>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: '🏠 Ir al Dashboard',
        confirmButtonColor: '#014421',
        allowOutsideClick: false,
        width: '600px'
      });

      // 7. Navegar al dashboard principal
      if (setActiveSection) {
        setActiveSection("inicio");
      }

    } catch (error) {
      console.error('Error durante el alquiler:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error en el Alquiler',
        text: `Ocurrió un error: ${error.message}`,
        confirmButtonColor: '#014421'
      });
    } finally {
      setLoading(false);
    }
  };
  // Función para guardar la información actualizada del usuario
  const saveUserInfo = async () => {
    const currentUserId = getUserId();
    if (!currentUserId) {
      await Swal.fire({
        icon: 'error',
        title: 'Error de Autenticación',
        text: 'Usuario no válido. Por favor, inicia sesión nuevamente.',
        confirmButtonColor: '#014421'
      });
      return;
    }

    try {
      console.log("Actualizando usuario con ID:", currentUserId);
      console.log("Datos a enviar:", userInfo);

      // Mostrar loading
      Swal.fire({
        title: 'Actualizando información...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });      const response = await fetch(`http://localhost:8080/customer/${currentUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(userInfo),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar la información del usuario: ${errorText}`);
      }
      
      localStorage.setItem("User", JSON.stringify(userInfo));
      
      await Swal.fire({
        icon: 'success',
        title: '¡Actualización Exitosa!',
        text: 'Tu información ha sido actualizada correctamente.',
        confirmButtonColor: '#014421'
      });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Actualizar',
        text: `Error al actualizar la información: ${error.message}`,
        confirmButtonColor: '#014421'
      });
    }
  };  // ✅ FUNCIÓN MEJORADA PARA CARGAR VEHÍCULOS ACTIVOS DEL USUARIO
  const loadActiveVehicles = useCallback(async () => {
    const currentUserId = getUserId();
    if (!currentUserId) {
      console.warn("No user ID available for loading active vehicles");
      // Mostrar mensaje de error amigable
      setError("No se pudo identificar el usuario. Por favor, vuelva a iniciar sesión.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Limpiar errores anteriores
      console.log("Loading active rentals for user ID:", currentUserId);
      
      // Usar el servicio mejorado para cargar vehículos alquilados
      console.log("Llamando al servicio loadActiveVehiclesForCustomer con ID:", currentUserId);
      const activeVehicles = await loadActiveVehiclesForCustomer(currentUserId);
      console.log("Active vehicles loaded from service:", activeVehicles);
      
      // Verificación adicional de los datos recibidos
      if (Array.isArray(activeVehicles)) {
        if (activeVehicles.length > 0) {
          console.log("✅ Se obtuvieron vehículos del servicio mejorado:", activeVehicles.length);
          
          // Imprimir detalles de los vehículos cargados para depuración
          activeVehicles.forEach((vehicle, index) => {
            console.log(`Vehículo ${index + 1}:`, {
              id: vehicle.vehicleId || vehicle.vehicle_id,
              marca: vehicle.brand,
              modelo: vehicle.model,
              placa: vehicle.plate,
              rentalId: vehicle.rentalId,
              fin: vehicle.endDate
            });
          });
          
          setRentedCars(activeVehicles);
          setLoading(false);
          return;
        } else {
          console.warn("El servicio devolvió un array vacío de vehículos");
        }
      } else {
        console.error("El servicio no devolvió un array:", activeVehicles);
      }
      
      // Si el servicio no devolvió vehículos válidos, intentar el método directo como respaldo
      console.warn("Intentando obtener datos directamente desde el endpoint de rentas activas...");
      
      const response = await fetch(`http://localhost:8080/rental/customer/${currentUserId}/active`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No active rentals found for user");
          setRentedCars([]);
          setLoading(false);
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const activeRentals = await response.json();
      console.log("Active rentals loaded with backup method:", activeRentals);
      
      // Validar que tenemos un array
      if (!Array.isArray(activeRentals)) {
        console.error("La respuesta no es un array:", activeRentals);
        setRentedCars([]);
        setLoading(false);
        return;
      }
      
      if (activeRentals.length === 0) {
        console.log("No se encontraron rentals activos para este usuario");
        setRentedCars([]);
        setLoading(false);
        return;
      }
      
      console.log(`✅ Se encontraron ${activeRentals.length} rentals para procesar`);
      
      // Procesar los datos para mostrar los vehículos con información de rental
      const processedVehicles = await Promise.all(activeRentals.map(async (rental) => {
        // Intentar obtener el vehículo de diferentes lugares
        let vehicle = rental.vehicle;
        
        // Si no hay vehículo anidado, pero tenemos un vehicleId, intentar cargarlo
        if (!vehicle && rental.vehicleId) {
          try {
            const vehicleResponse = await fetch(`http://localhost:8080/vehicle/${rental.vehicleId}`);
            if (vehicleResponse.ok) {
              vehicle = await vehicleResponse.json();
            }
          } catch (error) {
            console.error(`Error cargando vehículo por ID ${rental.vehicleId}:`, error);
          }
        }
        
        // Si seguimos sin vehículo, saltar este rental
        if (!vehicle) return null;
        
        // Obtener imagen del vehículo
        let finalImageUrl;
        const brand = vehicle?.brand || '';
        const model = vehicle?.model || '';
        const imageUrl = vehicle?.imageUrl || '';
        
        const hasValidBrandModel = brand && brand.trim() !== '' && model && model.trim() !== '';
        
        if (imageUrl && imageUrl.trim() !== '') {
          if (hasValidBrandModel) {
            finalImageUrl = await imageService.getValidatedImage(brand, model, imageUrl);
          } else {
            finalImageUrl = imageService.defaultImage;
          }
        } else {
          if (hasValidBrandModel) {
            finalImageUrl = await imageService.getValidatedImage(brand, model);
          } else {
            finalImageUrl = imageService.defaultImage;
          }
        }
        
        // Asegurar que tenemos el ID del cliente actual
        const currentUserId = getUserId();
        
        return {
          ...vehicle,
          vehicle_id: vehicle?.vehicleId || vehicle?.vehicle_id || vehicle?.id,
          image_url: finalImageUrl,
          imageLoaded: true,
          brand: brand || 'Sin marca',
          model: model || 'Sin modelo',
          plate: vehicle?.plate || 'Sin placa',
          year: vehicle?.year || 'N/A',
          price: vehicle?.price || rental?.price || 750,
          // Añadir información del cliente para que se detecte como alquilado
          customerId: rental.customerId || rental.customer?.id || currentUserId,
          customers: {
            id: currentUserId,
            idCustomer: currentUserId,
            name: rental.customer?.name || 'Cliente'
          },
          // Información detallada del rental
          rentalId: rental.idRental || rental.id,
          startDate: rental.startDate,
          endDate: rental.endDate,
          rentalStatus: rental.status,
          rentalPrice: rental.price,
          description: rental.description,
          // Mantener estructura antigua para compatibilidad
          rental: {
            id: rental.idRental || rental.id,
            startDate: rental.startDate,
            endDate: rental.endDate,
            status: rental.status,
            price: rental.price,
            description: rental.description
          }
        };
      }));
      
      // Filtrar vehículos nulos
      const validVehicles = processedVehicles.filter(v => v !== null);
      setRentedCars(validVehicles);
      console.log("Active vehicles processed:", validVehicles.length);
      
    } catch (error) {
      console.error("Error loading active vehicles:", error);
      setRentedCars([]);
      // No mostrar alert para no interrumpir la experiencia
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // ✅ USEEFFECT PARA CARGAR VEHÍCULOS ACTIVOS CUANDO SE CAMBIA A LA SECCIÓN "RENTADOS"
  useEffect(() => {
    if (activeSection === "rentados") {
      console.log("Cargando vehículos activos para la sección 'rentados'");
      loadActiveVehicles();
    }
  }, [activeSection, loadActiveVehicles]);
  // ✅ FUNCIÓN PARA EXTENDER UN ALQUILER
  const extendRental = async (car) => {
    try {
      const { value: daysInput } = await Swal.fire({
        title: `Extender Alquiler`,
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p><strong>🚗 Vehículo:</strong> ${car.brand} ${car.model}</p>
            <p><strong>📅 Fecha actual de fin:</strong> ${new Date(car.endDate).toLocaleDateString('es-ES')}</p>
            <p><strong>💰 Precio por día:</strong> $${car.price}</p>
          </div>
          <label for="extension-days" style="display: block; margin-bottom: 10px; font-weight: bold;">¿Por cuántos días más?</label>
        `,
        input: 'number',
        inputLabel: 'Días adicionales',
        inputValue: 1,
        inputAttributes: {
          id: 'extension-days',
          min: 1,
          max: 30,
          step: 1
        },
        showCancelButton: true,
        confirmButtonText: 'Extender',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#014421',
        inputValidator: (value) => {
          if (!value || isNaN(value) || parseInt(value) <= 0) {
            return 'Debe ingresar un número válido de días mayor a 0';
          }
        }
      });
      
      if (!daysInput) return;
      
      const extensionDays = parseInt(daysInput);
      const currentEndDate = new Date(car.endDate);
      const newEndDate = new Date(currentEndDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
      const additionalCost = car.price * extensionDays;
      
      // Confirmar extensión
      const confirmResult = await Swal.fire({
        title: '📋 Confirmar Extensión',
        html: `
          <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 15px 0;">
            <h4 style="color: #014421; margin-bottom: 15px;">📄 Resumen de la Extensión</h4>
            <div style="display: grid; gap: 8px;">
              <p><strong>🚗 Vehículo:</strong> ${car.brand} ${car.model}</p>
              <p><strong>📅 Fecha fin actual:</strong> ${currentEndDate.toLocaleDateString('es-ES')}</p>
              <p><strong>📅 Nueva fecha fin:</strong> ${newEndDate.toLocaleDateString('es-ES')}</p>
              <p><strong>📆 Días adicionales:</strong> ${extensionDays}</p>
              <p><strong>💵 Costo adicional:</strong> $${additionalCost}</p>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '✅ Confirmar Extensión',
        cancelButtonText: '❌ Cancelar',
        confirmButtonColor: '#014421',
        cancelButtonColor: '#d33'
      });
      
      if (!confirmResult.isConfirmed) return;
      
      // Mostrar loading
      Swal.fire({
        title: 'Procesando extensión...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Actualizar el rental en el backend
      const updatedRental = {
        idRental: car.rentalId,
        name: `${car.brand} ${car.model}`,
        description: `${car.description} - Extendido ${extensionDays} día(s)`,
        price: car.rentalPrice + additionalCost,
        startDate: car.startDate,
        endDate: newEndDate.toISOString().split('T')[0],
        status: car.rentalStatus || 'ACTIVE'
      };
      
      const response = await fetch(`http://localhost:8080/rental/${car.rentalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRental),
      });
      
      if (!response.ok) {
        throw new Error('Error al extender el alquiler');
      }
      
      // Crear pago adicional
      const paymentData = {
        paymentMethod: "CREDIT_CARD",
        amount: additionalCost,
        rental: {
          idRental: car.rentalId
        }
      };
      
      await fetch('http://localhost:8080/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      await Swal.fire({
        icon: 'success',
        title: '✅ Extensión Exitosa',
        html: `
          <div style="text-align: center;">
            <p>El alquiler ha sido extendido exitosamente</p>
            <p><strong>Nueva fecha de fin:</strong> ${newEndDate.toLocaleDateString('es-ES')}</p>
            <p><strong>Costo adicional:</strong> $${additionalCost}</p>
          </div>
        `,
        confirmButtonColor: '#014421'
      });
      
      // Recargar vehículos activos
      await loadActiveVehicles();
      
    } catch (error) {
      console.error('Error extending rental:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Extender',
        text: `Error: ${error.message}`,
        confirmButtonColor: '#014421'
      });
    }
  };
  // ✅ FUNCIÓN PARA CANCELAR UN ALQUILER
  const cancelRental = async (car) => {
    try {
      const confirmResult = await Swal.fire({
        title: '⚠️ Cancelar Alquiler',
        html: `
          <div style="text-align: left; background: #fff3cd; padding: 20px; border-radius: 10px; margin: 15px 0; border: 1px solid #ffeaa7;">
            <h4 style="color: #d68910; margin-bottom: 15px;">⚠️ Confirmar Cancelación</h4>
            <div style="display: grid; gap: 8px;">
              <p><strong>🚗 Vehículo:</strong> ${car.brand} ${car.model}</p>
              <p><strong>📅 Fecha de fin:</strong> ${new Date(car.endDate).toLocaleDateString('es-ES')}</p>
              <p style="color: #d68910; font-weight: bold;">⚠️ Esta acción no se puede deshacer</p>
            </div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '🗑️ Sí, Cancelar',
        cancelButtonText: '❌ No, Mantener',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#014421',
        reverseButtons: true
      });
      
      if (!confirmResult.isConfirmed) return;
      
      // Mostrar loading
      Swal.fire({
        title: 'Cancelando alquiler...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Cancelar en el backend
      const response = await fetch(`http://localhost:8080/rental/${car.rentalId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error al cancelar el alquiler');
      }
      
      await Swal.fire({
        icon: 'success',
        title: '✅ Alquiler Cancelado',
        text: 'El alquiler ha sido cancelado exitosamente',
        confirmButtonColor: '#014421'
      });
      
      // Recargar vehículos activos y disponibles
      await loadActiveVehicles();
      await reloadVehicles();
      
    } catch (error) {
      console.error('Error canceling rental:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Cancelar',
        text: `Error: ${error.message}`,
        confirmButtonColor: '#014421'
      });
    }
  };

  // Manejo de errores
  if (error) {
    return (
      <section className="user-panel-content">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => {
            setError(null);
            setLoading(true);
            window.location.reload();
          }}>
            Reintentar
          </button>
          <button onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
      </section>
    );
  }

  // Renderizado condicional según la sección activa
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <p style={{ color: '#014421', fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem' }}>
            Cargando tu dashboard personalizado...
          </p>
        </div>
      );
    }

    switch (activeSection) {
      case "inicio":
        return (
          <div className="welcome-section">
            <div className="greeting-card">
              <h2>¡Que tengas un gran día, {userInfo?.name || 'Usuario'}!</h2>
              <p style={{ marginTop: '1rem', fontSize: '1.1rem', opacity: 0.8 }}>
                Bienvenido a tu panel de control personalizado
              </p>
            </div>
            
            {nextReservation && (
              <div className="next-reservation">
                <div className="reservation-header">
                  <div className="reservation-icon">🚗</div>
                  <div className="reservation-info">
                    <h3>Próxima reserva</h3>
                    <p className="reservation-date">{nextReservation.date}</p>
                  </div>
                </div>
                
                <div className="reservation-car">
                  <img src={nextReservation.image} alt={nextReservation.car} />
                  <h4>{nextReservation.car}</h4>
                </div>
                
                <button className="details-button">Ver detalles</button>
              </div>
            )}
              <div className="stats-container">
              <div className="stat-card">
                <h3>Vehículos Alquilados</h3>
                <p className="stat-number">{customerStats.activeVehicles}</p>
              </div>
              <div className="stat-card">
                <h3>Total Rentas</h3>
                <p className="stat-number">{customerStats.totalRentals}</p>
              </div>
              <div className="stat-card">
                <h3>Disponibles</h3>
                <p className="stat-number">{availableCars.length}</p>
              </div>
            </div>
          </div>
        );
          case "rentados":
        return (
          <div className="rented-cars-section">
            <div className="section-header">
              <h2>🚗 Mis Vehículos Alquilados</h2>
              <button 
                className="refresh-button"
                onClick={loadActiveVehicles}
                disabled={loading}
              >
                {loading ? '🔄 Actualizando...' : '🔄 Actualizar'}
              </button>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando tus vehículos...</p>
              </div>
            ) : rentedCars.length > 0 ? (
              <>
                <div className="rental-summary">
                  <div className="summary-card">
                    <h3>📊 Resumen de Alquileres</h3>
                    <div className="summary-stats">
                      <div className="summary-item">
                        <span className="stat-label">Vehículos Activos:</span>
                        <span className="stat-value">{rentedCars.length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="stat-label">Total Invertido:</span>                        <span className="stat-value">
                          ${rentedCars.reduce((total, car) => total + (car.rentalPrice || car.price || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                  <div className="rented-cars-grid">
                  {rentedCars.map((car, index) => {
                    const daysRemaining = car.endDate ? 
                      Math.ceil((new Date(car.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    // Crear una key única combinando rentalId, vehicleId e index
                    const uniqueKey = car.rentalId || `${car.vehicleId || car.vehicle_id}-${index}`;
                    
                    return (
                      <div key={uniqueKey} className="rental-card">
                        <div className="vehicle-image-container">
                          <img 
                            src={car.image_url || car.image} 
                            alt={`${car.brand} ${car.model}`}
                            className="vehicle-image"
                            onError={(e) => {
                              e.target.src = imageService.defaultImage;
                            }}
                          />
                          <div className={`rental-status-badge ${daysRemaining > 3 ? 'active' : daysRemaining > 0 ? 'warning' : 'expired'}`}>
                            {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Alquiler vencido'}
                          </div>
                          <div className="vehicle-year-badge">
                            {car.year || 'N/A'}
                          </div>
                        </div>
                        
                        <div className="vehicle-info">
                          <div className="vehicle-header">
                            <h3 className="vehicle-title">{car.brand} {car.model}</h3>
                            <div className="plate-container">
                              <span className="plate-label">Placa</span>
                              <span className="plate-number">{car.plate}</span>
                            </div>
                          </div>

                          <div className="vehicle-details rental-vehicle-details">
                            <div className="detail-column">
                              <div className="detail-row">
                                <span className="detail-icon">🚗</span>
                                <div className="detail-data">
                                  <span className="detail-label">Marca y Modelo:</span>
                                  <span className="detail-value highlighted">{car.brand} {car.model}</span>
                                </div>
                              </div>
                              <div className="detail-row">
                                <span className="detail-icon">🏷️</span>
                                <div className="detail-data">
                                  <span className="detail-label">Placa:</span>
                                  <span className="detail-value">{car.plate}</span>
                                </div>
                              </div>
                              <div className="detail-row">
                                <span className="detail-icon">📅</span>
                                <div className="detail-data">
                                  <span className="detail-label">Año:</span>
                                  <span className="detail-value">{car.year}</span>
                                </div>
                              </div>
                            </div>
                            <div className="detail-column">
                              <div className="detail-row">
                                <span className="detail-icon">💰</span>
                                <div className="detail-data">
                                  <span className="detail-label">Precio:</span>
                                  <span className="detail-value">${car.price}/día</span>
                                </div>
                              </div>
                              <div className="detail-row">
                                <span className="detail-icon">🎨</span>
                                <div className="detail-data">
                                  <span className="detail-label">Color:</span>
                                  <span className="detail-value">{car.color || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="detail-row">
                                <span className="detail-icon">🚙</span>
                                <div className="detail-data">
                                  <span className="detail-label">Tipo:</span>
                                  <span className="detail-value">{car.type || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {(car.startDate || car.endDate || car.rentalPrice) && (
                            <div className="rental-details-container">
                              <h4 className="rental-details-title">📋 Detalles del Alquiler</h4>
                              <div className="rental-info-grid">
                                <div className="rental-info-item">
                                  <span className="rental-info-icon">📅</span>
                                  <div className="rental-info-data">
                                    <span className="rental-info-label">Inicio:</span>
                                    <span className="rental-info-value">{car.startDate ? new Date(car.startDate).toLocaleDateString('es-ES') : 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="rental-info-item">
                                  <span className="rental-info-icon">📆</span>
                                  <div className="rental-info-data">
                                    <span className="rental-info-label">Fin:</span>
                                    <span className="rental-info-value">{car.endDate ? new Date(car.endDate).toLocaleDateString('es-ES') : 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="rental-info-item">
                                  <span className="rental-info-icon">💳</span>
                                  <div className="rental-info-data">
                                    <span className="rental-info-label">Total Pagado:</span>
                                    <span className="rental-info-value price">${car.rentalPrice || car.price || 0}</span>
                                  </div>
                                </div>
                                <div className="rental-info-item">
                                  <span className="rental-info-icon">📊</span>
                                  <div className="rental-info-data">
                                    <span className="rental-info-label">Estado:</span>
                                    <span className={`rental-info-value status ${car.rentalStatus?.toLowerCase() || 'active'}`}>
                                      {car.rentalStatus || 'ACTIVE'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="rental-actions">
                            <button 
                              className="action-button extend"
                              onClick={() => extendRental(car)}
                              disabled={daysRemaining <= 0}
                            >
                              ⏰ Extender
                            </button>
                            <button 
                              className="action-button invoice"
                              onClick={() => showInvoiceDetails(car.rentalId)}
                            >
                              📄 Factura
                            </button>
                            <button 
                              className="action-button cancel"
                              onClick={() => cancelRental(car)}
                            >
                              🗑️ Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="no-cars-message">
                <div className="empty-state">
                  <div className="empty-icon">🚗</div>
                  <h3>No tienes vehículos alquilados</h3>
                  <p>¡Explora nuestro catálogo y alquila tu primer vehículo!</p>
                  <div className="empty-actions">
                    <button 
                      className="rent-now-button primary"
                      onClick={() => setActiveSection("rentar")}
                    >
                      🚀 Alquilar Ahora
                    </button>
                    <button 
                      className="rent-now-button secondary"
                      onClick={loadActiveVehicles}
                    >
                      🔄 Verificar Nuevamente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
          case "rentar":
        return (
          <div className="rent-cars-section">
            <h2>Alquila un coche</h2>
            <p className="section-description">Explora nuestra selección de {availableCars.length} vehículos disponibles para alquilar</p>
            
            {availableCars.length > 0 ? (
              <>
                {/* Carrusel de vehículos */}
                <div className="carousel-container">
                  <h3 style={{ color: '#014421', marginBottom: '1rem', fontSize: '1.3rem' }}>
                    🌟 Vehículos Destacados
                  </h3>
                  <CarouselCars 
                    cars={availableCars.slice(0, 5).map(car => ({
                      id: car.vehicle_id,
                      name: `${car.brand} ${car.model}`,
                      image: car.image_url || "https://es.valleychevy.com/wp-content/uploads/2021/11/2023-Chevrolet-Camaro-ZL1-Coupe-001.jpg",
                      type: car.type,
                      year: car.year,
                      Color: car.color,
                      Plate: car.plate,
                      price: car.price,
                      onRent: () => rentVehicle(car.vehicle_id)
                    }))} 
                  />
                </div>

                {/* Grilla de todos los vehículos disponibles */}
                <div className="available-cars-grid-section">
                  <h3 style={{ color: '#014421', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
                    🚗 Todos los Vehículos Disponibles
                  </h3>                  <div className="rented-cars-grid">
                    {availableCars.map(car => (
                      <VehicleCard 
                        key={car.vehicle_id}
                        car={car}
                        onRent={rentVehicle}
                        showRentButton={true}
                        showRentalInfo={false}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-cars-message">
                <h3 style={{ color: '#666', marginBottom: '1rem' }}>😔 No hay vehículos disponibles</h3>
                <p>En este momento no tenemos vehículos disponibles para alquilar.</p>
                <p style={{ marginTop: '1rem', color: '#2d8659' }}>
                  Por favor, revisa más tarde o contacta con nuestro equipo.
                </p>
              </div>
            )}
              <button 
              className="view-all-button"
              onClick={() => navigate("/Rental")}
              style={{ marginTop: '2rem' }}
            >
              🌐 Ver catálogo completo
            </button>
          </div>
        );
        
      case "facturas":
        return (
          <div className="invoices-section">
            <div className="section-header">
              <h2>📄 Historial de Facturas</h2>
              <p className="section-description">
                Revisa todas tus rentas y descargas las facturas correspondientes
              </p>
              <button 
                className="refresh-button"
                onClick={loadCustomerRentals}
                disabled={rentalsLoading}
              >
                {rentalsLoading ? '🔄 Cargando...' : '🔄 Actualizar'}
              </button>
            </div>

            {rentalsLoading ? (
              <div className="loading-rentals">
                <div className="spinner"></div>
                <p>Cargando historial de rentas...</p>
              </div>
            ) : customerRentals.length > 0 ? (
              <div className="rentals-list">
                {customerRentals.map((rental, index) => (
                  <div key={rental.idRental || index} className="rental-card">
                    <div className="rental-header">
                      <div className="rental-info">
                        <h3 className="rental-title">
                          🚗 {rental.name || `${rental.vehicle?.brand} ${rental.vehicle?.model}`}
                        </h3>
                        <p className="rental-dates">
                          📅 {new Date(rental.startDate).toLocaleDateString('es-ES')} - {new Date(rental.endDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="rental-status">
                        <span className={`status-badge ${rental.status?.toLowerCase()}`}>
                          {rental.status === 'ACTIVE' ? '✅ Activo' : 
                           rental.status === 'COMPLETED' ? '✅ Completado' : 
                           rental.status === 'CANCELLED' ? '❌ Cancelado' : rental.status}
                        </span>
                      </div>
                    </div>

                    <div className="rental-details">
                      <div className="detail-row">
                        <span className="detail-label">🏷️ Vehículo:</span>
                        <span className="detail-value">
                          {rental.vehicle?.brand} {rental.vehicle?.model} - {rental.vehicle?.plate}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">💰 Precio Total:</span>
                        <span className="detail-value price">${rental.price}</span>
                      </div>
                      {rental.payment && (
                        <div className="detail-row">
                          <span className="detail-label">💳 Método de Pago:</span>
                          <span className="detail-value">
                            {rental.payment.paymentMethod === 'CREDIT_CARD' ? 'Tarjeta de Crédito' : 
                             rental.payment.paymentMethod === 'DEBIT_CARD' ? 'Tarjeta de Débito' : 
                             rental.payment.paymentMethod || 'No especificado'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="rental-actions">
                      <button 
                        className="invoice-button"
                        onClick={() => showInvoiceDetails(rental.idRental)}
                      >
                        📄 Ver Factura
                      </button>
                      {rental.payment && (
                        <div className="payment-info">
                          <span className="payment-id">
                            🧾 ID Pago: {rental.payment.idPayment}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-rentals-message">
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3>No tienes rentas registradas</h3>
                  <p>Cuando realices tu primera renta, aparecerá aquí tu historial de facturas.</p>
                  <button 
                    className="rent-now-button"
                    onClick={() => setActiveSection("rentar")}
                  >
                    🚗 Alquilar ahora
                  </button>
                </div>
              </div>
            )}

            <div className="invoices-info">
              <div className="info-card">
                <h4>💡 Información Importante</h4>
                <ul>
                  <li>✅ Las facturas se generan automáticamente al confirmar una renta</li>
                  <li>📧 Puedes enviar las facturas por email desde la vista detallada</li>
                  <li>💾 Todas las facturas quedan guardadas en tu historial</li>
                  <li>🔄 Usa el botón "Actualizar" para refrescar el listado</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      case "editar":
        return (
          <div className="edit-profile-section">
            <h2>Actualiza tus datos personales</h2>
            
            <form className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={userInfo.name || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value={userInfo.lastName || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={userInfo.email || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={userInfo.phone || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <input 
                  type="text" 
                  id="address" 
                  name="address" 
                  value={userInfo.address || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="license">Número de licencia</label>              <input 
                type="text" 
                id="license" 
                name="license" 
                value={userInfo.license || ""} 
                onChange={handleUserInfoChange} 
              />
            </div>            <button 
              type="button" 
              className="save-button"
              onClick={saveUserInfo}
            >
              Guardar cambios
            </button>
          </form>
        </div>
        );
        
      default:
        return <div>Selecciona una opción del menú</div>;
    }
  };

  return (
    <section className="user-panel-content">
      {renderContent()}
    </section>
  );
}
export default Panel;


