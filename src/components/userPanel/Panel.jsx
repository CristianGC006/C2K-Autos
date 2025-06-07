import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import CarouselCars from "../CarouselCars";
import VehicleCard from "../VehicleCard";
import { imageService } from "../../services/imageService";
import "./panel.css";

function Panel({ activeSection, setActiveSection, user }) {
  const [rentedCars, setRentedCars] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [nextReservation] = useState(null);
  const [userInfo, setUserInfo] = useState(user || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const vehiclesLoaded = useRef(false); // Ref para evitar múltiples cargas
  const initializationStarted = useRef(false); // Ref para evitar múltiples inicializaciones
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
  };// ✅ FUNCIÓN PARA MANEJAR CAMBIOS EN LA INFORMACIÓN DEL USUARIO
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevUserInfo => ({
      ...prevUserInfo,
      [name]: value
    }));
  };

  // ✅ FUNCIÓN PARA RECARGAR VEHÍCULOS (PARA USAR DESPUÉS DE ALQUILAR)
  const reloadVehicles = async () => {
    try {
      console.log("Reloading vehicles after rental..."); 
      
      const response = await fetch('http://localhost:8080/vehicle');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }      const data = await response.json();
      console.log("Vehicles reloaded successfully:", data);
      
      // ✅ PROCESAR IMÁGENES CON SERVICIO DE MAPEO CON VALIDACIÓN EXTRA
      const dataWithCorrectFields = await Promise.all(data.map(async (vehicle) => {
        let finalImageUrl;
        
        // Verificar que vehicle tenga las propiedades necesarias
        const brand = vehicle?.brand || '';
        const model = vehicle?.model || '';
        const imageUrl = vehicle?.imageUrl || '';
        
        // Log para debug
        console.log('Reloading vehicle:', { brand, model, imageUrl, vehicleId: vehicle?.vehicleId });
        
        if (imageUrl && imageUrl.trim() !== '') {
          finalImageUrl = await imageService.getValidatedImage(brand, model, imageUrl);
        } else {
          finalImageUrl = await imageService.getValidatedImage(brand, model);
        }
        
        return {
          ...vehicle,
          vehicle_id: vehicle?.vehicleId || vehicle?.vehicle_id || 0,
          image_url: finalImageUrl,
          imageLoaded: true,
          // Asegurar que las propiedades críticas no sean null
          brand: brand || 'Sin marca',
          model: model || 'Sin modelo',
          plate: vehicle?.plate || 'Sin placa',
          year: vehicle?.year || 'N/A',
          price: vehicle?.price || 0
        };
      }));
        // Filtrar vehículos disponibles - un vehículo está disponible si no tiene customer asignado
      const available = dataWithCorrectFields.filter(vehicle => 
        !vehicle.customers || !vehicle.customers.id
      );
      setAvailableCars(available);
      console.log("Available vehicles after reload:", available.length);
      
      // Obtener vehículos alquilados por el usuario actual
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
    } catch (error) {
      console.error('Error reloading vehicles:', error);
    }
  };  // ✅ EFECTO SIMPLE PARA INICIALIZAR - SOLO UNA VEZ
  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (initializationStarted.current) {
      return;
    }
    
    initializationStarted.current = true;
    console.log("Initializing component once...");
      // ✅ FUNCIÓN PARA VALIDAR Y OBTENER EL ID DEL USUARIO (DENTRO DEL USEEFFECT)
    const getUserIdLocal = () => {
      // Buscar el ID usando la estructura real del API (idCustomer)
      let userId = null;
      
      // Primero intentar con el user prop
      if (user && (user.idCustomer || user.id || user.customer_id || user.userId)) {
        userId = user.idCustomer || user.id || user.customer_id || user.userId;
      }
      
      // Si no está en la prop, obtenerlo directamente del localStorage
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
        console.error("ID de usuario inválido:", userId);
        return null;
      }
      
      return numericId;
    };
    
    // ✅ FUNCIÓN PARA OBTENER LOS VEHÍCULOS (MOVIDA DENTRO DEL USEEFFECT)
    const fetchVehicles = async () => {
      try {
        console.log("Fetching vehicles..."); 
        setLoading(true); // Mostrar loading mientras carga vehículos
        
        const response = await fetch('http://localhost:8080/vehicle');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }        const data = await response.json();
        console.log("Vehicles fetched successfully:", data);
        
        // ✅ PROCESAR IMÁGENES CON SERVICIO DE MAPEO CON VALIDACIÓN EXTRA
        const dataWithCorrectFields = await Promise.all(data.map(async (vehicle) => {
          let finalImageUrl;
          
          // Verificar que vehicle tenga las propiedades necesarias
          const brand = vehicle?.brand || '';
          const model = vehicle?.model || '';
          const imageUrl = vehicle?.imageUrl || '';
          
          // Log para debug
          console.log('Processing vehicle:', { brand, model, imageUrl, vehicleId: vehicle?.vehicleId });
          
          if (imageUrl && imageUrl.trim() !== '') {
            finalImageUrl = await imageService.getValidatedImage(brand, model, imageUrl);
          } else {
            finalImageUrl = await imageService.getValidatedImage(brand, model);
          }
          
          return {
            ...vehicle,
            vehicle_id: vehicle?.vehicleId || vehicle?.vehicle_id || 0,
            image_url: finalImageUrl,
            imageLoaded: true,
            // Asegurar que las propiedades críticas no sean null
            brand: brand || 'Sin marca',
            model: model || 'Sin modelo',
            plate: vehicle?.plate || 'Sin placa',
            year: vehicle?.year || 'N/A',
            price: vehicle?.price || 0
          };
        }));
          // Filtrar vehículos disponibles - un vehículo está disponible si no tiene customer asignado
        const available = dataWithCorrectFields.filter(vehicle => 
          !vehicle.customers || !vehicle.customers.id
        );
        setAvailableCars(available);        console.log("Available vehicles:", available.length);
        
        // Obtener vehículos alquilados por el usuario actual
        const currentUserId = getUserIdLocal();
        if (currentUserId) {
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
        console.error('Error fetching vehicles:', error);
        setRentedCars([]);
        setAvailableCars([]);
        setError(`Error al cargar vehículos: ${error.message}`);
        setLoading(false);
      }
    };
    
    const initializeComponent = async () => {
      try {
        let finalUserInfo = null;        // 1. Primero intentar usar la prop user
        if (user && (user.idCustomer || user.id)) {
          console.log("Using user from props:", user);
          finalUserInfo = user;
        } else {
          // 2. Si no hay prop, intentar localStorage
          const storedUser = localStorage.getItem("User");
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log("Parsed user from localStorage:", parsedUser);
              // Verificar que el usuario tenga un ID válido usando la estructura real del API
              if (parsedUser && (parsedUser.idCustomer || parsedUser.id || parsedUser.customer_id || parsedUser.userId)) {
                console.log("Using user from localStorage:", parsedUser);
                finalUserInfo = parsedUser;
              }
            } catch (e) {
              console.error("Error parsing stored user:", e);
            }
          }
          
          // 3. Si no hay usuario válido, mostrar error en lugar de modo demo
          if (!finalUserInfo) {
            console.warn("No valid user found, redirecting to login");
            setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
            setLoading(false);
            return;
          }
        }
          // Actualizar estado
        setUserInfo(finalUserInfo);
        
        // Cargar vehículos después de un pequeño delay
        setTimeout(() => {
          if (!vehiclesLoaded.current) {
            vehiclesLoaded.current = true;
            fetchVehicles();
          }
        }, 100);
        
      } catch (error) {
        console.error("Error during initialization:", error);
        setUserInfo({ name: 'Usuario', id: 'demo' });
        setLoading(false);
      }
    };
      initializeComponent();
  }, [user]); // Solo user como dependencia, userInfo se actualiza internamente// Función para alquilar un vehículo con generación de factura
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
      });      // 1. Verificar qué entidades existen en la base de datos
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
            validAdminId = admins[0].idAdmin || 1; // Usar idAdmin en lugar de id
          }
        }

        // Verificar sucursales
        const branchResponse = await fetch('http://localhost:8080/branch');
        if (branchResponse.ok) {
          const branches = await branchResponse.json();
          console.log("Sucursales disponibles:", branches);
          if (branches && branches.length > 0) {
            validBranchId = branches[0].idBranch || 1; // Usar idBranch únicamente
          }
        }

        // Verificar asesores
        const assessorResponse = await fetch('http://localhost:8080/assessor');
        if (assessorResponse.ok) {
          const assessors = await assessorResponse.json();
          console.log("Asesores disponibles:", assessors);
          if (assessors && assessors.length > 0) {
            validAssessorId = assessors[0].idAssessor || 1; // Usar idAssessor en lugar de id
          }
        }        // ✅ CRÍTICO: Cargar el Customer completo de la base de datos
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
              console.error("CRÍTICO: Customer con ID", currentUserId, "no encontrado en la base de datos");
              console.log("Customers disponibles:", customers.map(c => ({ 
                id: c.id, 
                idCustomer: c.idCustomer, 
                name: c.name, 
                email: c.email 
              })));
              
              throw new Error(`El usuario con ID ${currentUserId} no existe en la base de datos. Por favor, verifica tu sesión.`);
            }
            
            // Usar el ID exacto que está en la base de datos
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
        throw error; // Re-lanzar el error para que se maneje en el catch principal
      }

      // 2. Crear el registro de alquiler con todos los campos requeridos
      const currentDate = new Date();
      const startDate = currentDate.toISOString().split('T')[0]; // Fecha actual
      const endDate = new Date(currentDate.getTime() + (rentalDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // Fecha final
        const rentalData = {
        name: `${selectedVehicle.brand} ${selectedVehicle.model}`,
        description: `Alquiler del ${selectedVehicle.brand} ${selectedVehicle.model} (Placa: ${selectedVehicle.plate}) por ${rentalDays} día(s)`,
        price: totalAmount,
        startDate: startDate,
        endDate: endDate,
        status: "ACTIVE",        // IDs de relaciones (usando los nombres que espera el backend)
        vehicle: {
          vehicleId: selectedVehicle.vehicle_id
        },
        customer: customerEntity, // Usar la entidad completa cargada desde BD
        assessor: {
          idAssessor: validAssessorId // Usar idAssessor en lugar de id
        },
        branch: {
          idBranch: validBranchId
        },
        admin: {
          idAdmin: validAdminId // Usar idAdmin en lugar de id
        }
      };console.log("Creando registro de alquiler:", rentalData);

      const rentalResponse = await fetch('http://localhost:8080/rental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rentalData),
      });

      if (!rentalResponse.ok) {
        const errorText = await rentalResponse.text();
        console.error("Error en respuesta del rental:", errorText);
        throw new Error(`Error al crear el registro de alquiler: ${errorText}`);
      }

      const rentalResult = await rentalResponse.json();
      console.log("Alquiler creado exitosamente:", rentalResult);      // 3. Actualizar el estado del vehículo para asignarlo al usuario
      const vehicleUpdateData = {
        customers: {
          id: customerEntity.id || customerEntity.idCustomer // Usar el ID correcto de la entidad cargada
        },
        branches: {
          idBranch: validBranchId
        },
        admin: {
          idAdmin: validAdminId // Usar idAdmin en lugar de id
        }
      };

      console.log("Actualizando vehículo con datos:", vehicleUpdateData);

      const vehicleUpdateResponse = await fetch(`http://localhost:8080/vehicle/${selectedVehicle.vehicle_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleUpdateData),
      });

      if (!vehicleUpdateResponse.ok) {
        const errorText = await vehicleUpdateResponse.text();
        throw new Error(`Error al actualizar el estado del vehículo: ${errorText}`);
      }      // 4. Generar factura mediante el endpoint de pago
      const paymentData = {
        paymentMethod: "CREDIT_CARD", // Usar el enum correcto
        amount: totalAmount,
        rental: {
          idRental: rentalResult.idRental || rentalResult.id_rental || rentalResult.id
        }
      };

      console.log("Generando factura:", paymentData);

      const paymentResponse = await fetch('http://localhost:8080/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });      let paymentResult = null;
      let invoiceId = 'N/A';

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.warn("Error al generar factura:", errorText);
        invoiceId = 'Error en generación';
      } else {
        paymentResult = await paymentResponse.json();
        console.log("Factura generada:", paymentResult);
        invoiceId = paymentResult.idPayment || paymentResult.id_payment || paymentResult.id || 'Generado';
      }// 5. Actualizar la lista de vehículos inmediatamente
      console.log("Actualizando vehículos después del alquiler...");
      vehiclesLoaded.current = false;
      await reloadVehicles();

      // 6. Mostrar factura detallada con SweetAlert2
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
      });

      const response = await fetch(`http://localhost:8080/customer/${currentUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
