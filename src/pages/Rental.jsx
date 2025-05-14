import { useState, useEffect } from "react";
import ButtonForm from "../components/ButtonForm";
import CarsCard from "../components/CarsCard";
import './Rental.css';

const Rental = () => {
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        model: '',
        year: '',
        brand: ''
    });

    useEffect(() => {
        fetch('https://fakeapic2k.onrender.com/Vehicle')
            .then(response => response.json())
            .then(data => {
                setVehicles(data);
                setFilteredVehicles(data);
            })
            .catch(error => console.error('Error:', error));
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleSearch = () => {
        const filtered = vehicles.filter(vehicle => {
            return (
                (!filters.type || vehicle.type.toLowerCase().includes(filters.type.toLowerCase())) &&
                (!filters.model || vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) &&
                (!filters.year || vehicle.year.toString() === filters.year) &&
                (!filters.brand || vehicle.brand.toLowerCase().includes(filters.brand.toLowerCase()))
            );
        });
        setFilteredVehicles(filtered);
    };

    return (
        <>
        <div className="container">
            <div className="search-container">
                <div className="search-wrapper">
                    <div className="filters-group">
                        <select 
                            name="type" 
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="">Tipo de Vehículo</option>
                            <option value="Sedan">Sedan</option>
                            <option value="Truck">Camioneta</option>
                        </select>

                        <input 
                            type="text"
                            name="model"
                            placeholder="Modelo"
                            value={filters.model}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />

                        <input 
                            type="number"
                            name="year"
                            placeholder="Año"
                            value={filters.year}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />

                        <input 
                            type="text"
                            name="brand"
                            placeholder="Marca"
                            value={filters.brand}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>
                    <button className="search-button" onClick={handleSearch}>BUSCAR</button>
                </div>
            </div>

            <div className="results-container">
                {filteredVehicles.map(vehicle => (
                    <CarsCard key={vehicle.id} vehicle={vehicle} />
                ))}
            </div>
        </div>
        </>
    );
}

export default Rental;