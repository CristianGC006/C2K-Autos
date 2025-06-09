import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import CarouselCars from "../CarouselCars";
import VehicleCard from "../VehicleCard";
import { imageService } from "../../services/imageService";
import { getCustomerRentals, getRentalForInvoice, formatInvoiceData, generateInvoiceHTML } from "../../services/InvoiceService";
import "./panel.css";

function Panel({ activeSection, setActiveSection, user }) {
  const [rentedCars, setRentedCars] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [nextReservation] = useState(null);
  const [userInfo, setUserInfo] = useState(user || {});
  const [loading, setLoading] = useState(true);  const [error, setError] = useState(null);
  const [customerRentals, setCustomerRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ FUNCIÓN PARA VALIDAR Y OBTENER EL ID DEL USUARIO (FUERA DEL USEEFFECT PARA REUTILIZAR)
  const getUserId = () => {
    // Buscar el ID usando la estructura real del API (idCustomer)
    let userId = userInfo?.idCustomer || userInfo?.id || userInfo?.customer_id || userInfo?.userId;
    
    // Si no está en el estado, obtenerlo directamente del localStorage
    if (!userId) {
      const storedUser = localStorage.getItem("User");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser?.idCustomer || parsedUser?.id || parsedUser?.customer_id || parsedUser?.userId;
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
    }

    const numericId = userId ? parseInt(userId, 10) : null;
    
    if (!numericId || isNaN(numericId)) {
      console.error("ID de usuario inválido:", userId, "userInfo:", userInfo);
      return null;
    }
    
    return numericId;
  };  // ✅ FUNCIÓN PARA CARGAR RENTAS DEL CLIENTE
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
      }));

      const available = dataWithCorrectFields.filter(vehicle => 
        !vehicle.customers || !vehicle.customers.id
      );
      setAvailableCars(available);
      console.log("Available vehicles after reload:", available.length);
      
      const currentUserId = getUserId();
      if (currentUserId) {
        const rented = dataWithCorrectFields.filter(vehicle => 
          vehicle.customers && 
          vehicle.customers.id && 
          parseInt(vehicle.customers.id, 10) === currentUserId
        );
        setRentedCars(rented);
        console.log("Rented vehicles for user", currentUserId, "after reload:", rented.length);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error reloading vehicles:', error);
      setError(`Error al recargar vehículos: ${error.message}`);
      setLoading(false);
    }
  }, [getUserId]);
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
        }));

        const available = dataWithCorrectFields.filter(vehicle => 
          !vehicle.customers || !vehicle.customers.id
        );
        setAvailableCars(available);
        console.log("Available vehicles:", available.length);
        
        // Solo filtrar vehículos rentados si tenemos un ID de usuario válido
        const storedUser = localStorage.getItem("User");
        let currentUserId = null;
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            currentUserId = parsedUser?.idCustomer || parsedUser?.id || parsedUser?.customer_id || parsedUser?.userId;
            currentUserId = currentUserId ? parseInt(currentUserId, 10) : null;
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }
        }
        
        if (currentUserId && !isNaN(currentUserId)) {
          const rented = dataWithCorrectFields.filter(vehicle => 
            vehicle.customers && 
            vehicle.customers.id && 
            parseInt(vehicle.customers.id, 10) === currentUserId
          );
          setRentedCars(rented);
          console.log("Rented vehicles for user", currentUserId, ":", rented.length);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading initial vehicles:', error);
        setError(`Error al cargar vehículos: ${error.message}`);
        setLoading(false);
      }
    };
    
    loadData();
  }, []); // Solo se ejecuta una vez al montar el componente

  // ✅ FUNCIÓN PARA MOSTRAR DETALLES DE FACTURA
  const showInvoiceDetails = async (rentalId) => {
    try {
      console.log("Loading invoice details for rental:", rentalId);
      
      Swal.fire({
        title: 'Cargando factura...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const rental = await getRentalForInvoice(rentalId);
      const invoiceData = formatInvoiceData(rental);
      
      if (!invoiceData) {
        throw new Error('No se pudo procesar la información de la factura');
      }

      const invoiceHTML = generateInvoiceHTML(invoiceData);
      
      await Swal.fire({
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

    } catch (error) {
      console.error("Error loading invoice:", error);
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
      };

      console.log("Creando registro de alquiler:", rentalData);      const headers = {};
      
      const rentalResponse = await fetch('http://localhost:8080/rental', {
        method: 'POST',
        headers: headers,
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
                <p className="stat-number">{rentedCars.length}</p>
              </div>
              <div className="stat-card">
                <h3>Nivel de Usuario</h3>
                <p className="stat-text">
                  {rentedCars.length === 0 ? 'Bronce' : 
                   rentedCars.length <= 2 ? 'Plata' : 'Oro'}
                </p>
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
            <h2>Tus coches alquilados</h2>
              {rentedCars.length > 0 ? (
              <div className="rented-cars-grid">
                {rentedCars.map(car => (
                  <VehicleCard 
                    key={car.vehicle_id}
                    car={car}
                    onRent={rentVehicle}
                    showRentButton={false}
                    showRentalInfo={true}
                  />
                ))}
              </div>
            ) : (
              <div className="no-cars-message">
                <p>No tienes coches alquilados actualmente.</p>
                <button 
                  className="rent-now-button"
                  onClick={() => setActiveSection("rentar")}
                >
                  Alquilar ahora
                </button>
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
          </div>        );
        
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
                <label htmlFor="license">Número de licencia</label>
                <input 
                  type="text" 
                  id="license" 
                  name="license" 
                  value={userInfo.license || ""} 
                  onChange={handleUserInfoChange} 
                />
              </div>
              
              <button 
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

