import Swal from "sweetalert2";

// Función universal para alquilar un vehículo
export const rentVehicleFlow = async ({
  vehicle,
  user
}) => {
  try {
    // 1. Pedir días de alquiler
    const { value: daysInput } = await Swal.fire({
      title: `Alquilar ${vehicle.brand} ${vehicle.model}`,
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>🚗 Vehículo:</strong> ${vehicle.brand} ${vehicle.model}</p>
          <p><strong>🏷️ Placa:</strong> ${vehicle.plate}</p>
          <p><strong>📅 Año:</strong> ${vehicle.year || 'N/A'}</p>
          <p><strong>💰 Precio por día:</strong> $${vehicle.price || 750}</p>
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

    if (!daysInput) return;

    const rentalDays = parseInt(daysInput);
    const dailyPrice = vehicle.price || 750;
    const totalAmount = dailyPrice * rentalDays;

    // 2. Confirmar alquiler
    const confirmResult = await Swal.fire({
      title: '📋 Confirmar Alquiler',
      html: `
        <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 15px 0;">
          <h4 style="color: #014421; margin-bottom: 15px;">📄 Resumen del Alquiler</h4>
          <div style="display: grid; gap: 8px;">
            <p><strong>🚗 Vehículo:</strong> ${vehicle.brand} ${vehicle.model}</p>
            <p><strong>🏷️ Placa:</strong> ${vehicle.plate}</p>
            <p><strong>📅 Año:</strong> ${vehicle.year || 'N/A'}</p>
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

    if (!confirmResult.isConfirmed) return;

    // 3. Mostrar loading
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

    // 4. Crear rental (ajusta los campos según tu backend)
    const rentalData = {
      name: `${vehicle.brand} ${vehicle.model}`,
      description: `Alquiler del ${vehicle.brand} ${vehicle.model} (Placa: ${vehicle.plate}) por ${rentalDays} día(s)`,
      price: totalAmount,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "ACTIVE",
      vehicle: { vehicleId: vehicle.vehicleId || vehicle.id },
      customer: { idCustomer: user.idCustomer || user.id },
      assessor: { idAssessor: user.assessorId || user.idAssessor || 1 },
      branch: { idBranch: user.branchId || user.idBranch || 1 },
      admin: { idAdmin: 1 }
    };    const rentalResponse = await fetch('http://localhost:8080/rental', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rentalData)
    });

    if (!rentalResponse.ok) throw new Error('Error al crear el alquiler');
    const rentalResult = await rentalResponse.json();    // 5. Actualizar vehículo (opcional, según tu backend)
    await fetch(`http://localhost:8080/vehicle/${vehicle.vehicleId || vehicle.id}`, {      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customers: { id: user.idCustomer || user.id }
      })
    });

    // 6. Generar factura
    const paymentData = {
      paymentMethod: "CREDIT_CARD",
      amount: totalAmount,
      rental: { idRental: rentalResult.idRental || rentalResult.id }
    };    await fetch('http://localhost:8080/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });

    // 7. Mostrar factura
    await Swal.fire({
      title: '🎉 ¡ALQUILER EXITOSO!',
      html: 
        <div style="text-align: left; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 15px; margin: 20px 0; border: 2px solid #014421;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: #014421; margin: 0;">📋 FACTURA DE ALQUILER</h3>
            <p style="color: #666; margin: 5px 0;">Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
          <div style="border: 1px solid #014421; border-radius: 10px; padding: 15px; background: white; margin-bottom: 15px;">
            <h4 style="color: #014421; margin-bottom: 10px;">🚗 DATOS DEL VEHÍCULO</h4>
            <div style="display: grid; gap: 5px; font-size: 14px;">
              <p><strong>Marca y Modelo:</strong> ${vehicle.brand} ${vehicle.model}</p>
              <p><strong>Placa:</strong> ${vehicle.plate}</p>
              <p><strong>Año:</strong> ${vehicle.year || 'N/A'}</p>
            </div>
          </div>
          <div style="border: 1px solid #014421; border-radius: 10px; padding: 15px; background: white; margin-bottom: 15px;">
            <h4 style="color: #014421; margin-bottom: 10px;">👤 DATOS DEL CLIENTE</h4>
            <div style="display: grid; gap: 5px; font-size: 14px;">
              <p><strong>Nombre:</strong> ${user.name || "Cliente"}</p>
              <p><strong>Email:</strong> ${user.email || "cliente@email.com"}</p>
              <p><strong>ID Cliente:</strong> ${user.idCustomer || user.id}</p>
            </div>
          </div>
          <div style="border: 1px solid #014421; border-radius: 10px; padding: 15px; background: white;">
            <h4 style="color: #014421; margin-bottom: 10px;">💰 DETALLES DE PAGO</h4>
            <div style="display: grid; gap: 5px; font-size: 14px;">
              <p><strong>Duración:</strong> ${rentalDays} día(s)</p>
              <p><strong>Precio por día:</strong> $${dailyPrice}</p>
              <p><strong>Método de pago:</strong> Tarjeta de Crédito</p>
              <p style="border-top: 2px solid #014421; padding-top: 10px; margin-top: 10px;">
                <strong style="color: #014421; font-size: 1.2em;">💳 TOTAL A PAGAR: $${totalAmount}</strong>
              </p>
            </div>
          </div>
        </div>
      
    });    } catch (error) {	
		 console.error('Error en el flujo de alquiler:', error);
	  Swal.fire({
		title: '❌ Error',
		text: 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.',
		icon: 'error',
		confirmButtonText: 'Aceptar',
		confirmButtonColor: '#d33'
	  });
	}
	}   