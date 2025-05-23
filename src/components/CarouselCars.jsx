import React, { useState, useEffect } from 'react';

const CarouselCars = ({ cars }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalCars = cars.length;

  // Función para mover al siguiente coche
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalCars);
  };

  // Función para mover al coche anterior
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalCars) % totalCars);
  };

  // Movimiento automático
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calcular índices para mostrar 3 coches
  const getVisibleIndices = () => {
    const indices = [];
    for (let i = 0; i < 3; i++) {
      indices.push((currentIndex + i) % totalCars);
    }
    return indices;
  };

  const visibleIndices = getVisibleIndices();

  // Estilos para cada posición
  const getStyles = (position) => {
    if (position === 0) {
      return {
        backgroundColor: '#f59e0b', // Amarillo
        borderRadius: '1.5rem',
        padding: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      };
    }
    if (position === 1) {
      return {
        backgroundColor: '#15803d', // Verde
        borderRadius: '1.5rem',
        padding: '0.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s',
      };
    }
    return {
      backgroundColor: '#f59e0b', // Gris
      borderRadius: '1.5rem',
      padding: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    };
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
      {/* Botón izquierdo */}
      <button 
        onClick={prevSlide}
        style={{
          position: 'absolute',
          left: '0.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '9999px'
        }}
      >
        &#10094;
      </button>
      
      {/* Contenedor del carrusel */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', padding: '0 1rem' }}>
        {visibleIndices.map((index, i) => (
          <div 
            key={index}
            style={{
              width: i === 1 ? '20rem' : '14rem',
              zIndex: i === 1 ? 20 : 10,
              opacity: i === 1 ? 1 : 0.9,
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <div 
              style={{
                ...getStyles(i),
                overflow: 'hidden',
                transform: i === 1 && 'hover:scale(1.1)'
              }}
            >
              <img 
                src={cars[index].image} 
                alt={cars[index].name}
                style={{ width: '100%', objectFit: 'contain', height: '12rem' }}
              />
              <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                <h3 style={{ fontWeight: 'bold', color: 'white', fontSize: '1.125rem' }}>{cars[index].name}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Botón derecho */}
      <button 
        onClick={nextSlide}
        style={{
          position: 'absolute',
          right: '0.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '9999px'
        }}
      >
        &#10095;
      </button>
    </div>
  );
};

export default CarouselCars;