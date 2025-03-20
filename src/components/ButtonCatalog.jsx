import React, { useState, useEffect, useRef } from 'react';

const GradientDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Selecciona una opción ▼');
  const dropdownRef = useRef(null);

  // Manejar clic fuera del dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Seleccionar opción
  const handleSelect = (option) => {
    setSelectedOption(`${option} ▼`);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button
        className="gradient-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {selectedOption}
      </button>

      {isOpen && (
        <div className="dropdown-menu" role="menu">
          {['Compacto', 'Familiar', 'Hibridos', 'Electricos'].map((option) => (
            <button
              key={option}
              className="dropdown-item"
              onClick={() => handleSelect(option)}
              role="menuitem"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradientDropdown;