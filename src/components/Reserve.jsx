import { useState } from 'react';
import { genericAlert } from '../helpers/functions';

const Reserve = ({ vehicle, vehicleDates, hasValidDates, calculateDays }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [currentVehicle, setCurrentVehicle] = useState(null);

    const handleDirectReservation = (vehicle) => {
        if (!hasValidDates) return;
        setCurrentVehicle(vehicle);
        setShowPaymentModal(true);
    };

    const handlePayment = async () => {
        if (!selectedPaymentMethod) {
            genericAlert(
                "Método de pago requerido",
                "Por favor seleccione un método de pago",
                "warning"
            );
            return;
        }

        if (!currentVehicle || !vehicleDates[currentVehicle.id]) {
            genericAlert(
                "Error",
                "Información del vehículo no disponible",
                "error"
            );
            return;
        }

        const days = calculateDays(vehicleDates[currentVehicle.id].startDate, vehicleDates[currentVehicle.id].endDate);
        const totalAmount = currentVehicle.price * days;
        const inputAmount = parseFloat(prompt("Ingrese el monto a pagar: $" + totalAmount));

        if (isNaN(inputAmount) || inputAmount < totalAmount) {
            genericAlert(
                "Error",
                "El monto ingresado es inválido o insuficiente",
                "error"
            );
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/rental', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("Token")}`
                },
                body: JSON.stringify({
                    vehicleId: currentVehicle.id,
                    customerId: JSON.parse(localStorage.getItem("User"))?.idCustomer,
                    startDate: vehicleDates[currentVehicle.id].startDate,
                    endDate: vehicleDates[currentVehicle.id].endDate,
                    totalAmount: totalAmount,
                    paymentMethod: selectedPaymentMethod,
                    paymentStatus: "COMPLETED"
                })
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            await response.json();
            
            genericAlert(
                "¡Reserva exitosa!",
                "Tu vehículo ha sido reservado exitosamente",
                "success"
            ).then(() => {
                setShowPaymentModal(false);
                // Emitir un evento personalizado para notificar la actualización
                window.dispatchEvent(new CustomEvent('vehicleRented'));
                window.location.reload();
            });
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            genericAlert(
                "Error",
                "Hubo un error al procesar tu pago",
                "error"
            );
        }
    };

    return (
        <>
            <button 
                className="reserve-btn" 
                onClick={() => handleDirectReservation(vehicle)} 
                disabled={!hasValidDates} 
                style={{ 
                    opacity: hasValidDates ? 1 : 0.6, 
                    cursor: hasValidDates ? 'pointer' : 'not-allowed' 
                }} 
            > 
                {!hasValidDates 
                    ? '📅 Selecciona fechas' 
                    : '🎯 Reservar Ahora' 
                } 
            </button>

            {showPaymentModal && (
                <div className="payment-modal" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="payment-modal-content" style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%',
                        position: 'relative'
                    }}>
                        <h3>Confirmar Pago</h3>
                        <p>Vehículo: {currentVehicle?.brand} {currentVehicle?.model}</p>
                        <p>Total a pagar: ${currentVehicle?.price * calculateDays(vehicleDates[currentVehicle?.id]?.startDate, vehicleDates[currentVehicle?.id]?.endDate)}</p>
                        
                        <div className="payment-methods">
                            <h4>Seleccione método de pago:</h4>
                            <select 
                                value={selectedPaymentMethod}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginBottom: '15px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            >
                                <option value="">Seleccione...</option>
                                <option value="pse">PSE</option>
                                <option value="credit">Tarjeta de Crédito</option>
                                <option value="debit">Tarjeta Débito</option>
                            </select>
                        </div>

                        <div className="payment-actions" style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px',
                            marginTop: '20px'
                        }}>
                            <button 
                                onClick={() => setShowPaymentModal(false)} 
                                className="cancel-btn"
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: '#ccc',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handlePayment} 
                                className="confirm-btn"
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: '#00a65a',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Confirmar Pago
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Reserve;