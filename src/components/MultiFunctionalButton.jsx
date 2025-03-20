import React from 'react';
import { useState } from 'react';
import '../index.css';
const locations = [
    'Bello',
    'Medellín',
    'Barbosa',
    'Itagüí',
    'Envigado',
    'Sabaneta',
    'La Estrella',
    'Caldas',
    'Rionegro',
    'Guatapé',
    'Santa Fe de Antioquia',
];
const MultiFunctionalButton = ({ type, label, icon }) => {
    const [inputValue, setInputValue] = useState('');
    const [filteredLocations, setFilteredLocations] = useState([]);
  
    const handleInputChange = (event) => {
      const value = event.target.value;
      setInputValue(value);
      if (value) {
        const filtered = locations.filter((location) =>
          location.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredLocations(filtered);
      } else {
        setFilteredLocations([]);
      }
    };
  
    const handleLocationClick = (location) => {
      setInputValue(location);
      setFilteredLocations([]);
    };
  
    return (
      <div className="multi-functional-button">
        <div className="icon">{icon}</div>
        {type === 'input' && (
          <div className="autocomplete">
            <input
              type="text"
              placeholder={label}
              value={inputValue}
              onChange={handleInputChange}
            />
            {filteredLocations.length > 0 && (
              <ul className="autocomplete-list">
                {filteredLocations.map((location, index) => (
                  <li key={index} onClick={() => handleLocationClick(location)}>
                    {location}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      
      </div>
    );
  };
  export default MultiFunctionalButton;