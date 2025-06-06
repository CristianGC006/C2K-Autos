import React, { useState } from 'react';
import './Location.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Location() {
    const [activeLocation, setActiveLocation] = useState('medellin');

    const locations = {
        medellin: {
            name: 'Medellín',
            address: 'Calle 10 #30-45, El Poblado',
            phone: '+57 3145098751',
            email: 'medellin@c2kautos.com',
            hours: 'Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 9:00 AM - 2:00 PM',
            mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63457.02844498673!2d-75.62337816566163!3d6.244218601253903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4428dfb80fad05%3A0x42137cfcc7b53b56!2sMedell%C3%ADn%2C%20Antioquia!5e0!3m2!1ses!2sco!4v1653698965254!5m2!1ses!2sco'
        },
        bogota: {
            name: 'Bogotá',
            address: 'Carrera 15 #85-24, Zona T',
            phone: '+57 3157420408',
            email: 'bogota@c2kautos.com',
            hours: 'Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 9:00 AM - 2:00 PM',
            mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254508.39280650613!2d-74.24789206444396!3d4.648625932726195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9bfd2da6cb29%3A0x239d635520a33914!2sBogot%C3%A1%2C%20Colombia!5e0!3m2!1ses!2sco!4v1653699025254!5m2!1ses!2sco'
        },
        cali: {
            name: 'Cali',
            address: 'Avenida 6N #28N-10, Granada',
            phone: '+57 3234595193',
            email: 'cali@c2kautos.com',
            hours: 'Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 9:00 AM - 2:00 PM',
            mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127504.42449405052!2d-76.58057086517943!3d3.4152977169374366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e30a6f0cc4bb3f1%3A0x1f0fb5e952ae6168!2sCali%2C%20Valle%20del%20Cauca!5e0!3m2!1ses!2sco!4v1653699085254!5m2!1ses!2sco'
        }
    };

    return (
        <div className="location-page">
            <div className="location-container">
                <h1 className="location-title">Nuestras Sucursales</h1>
                <p className="location-subtitle">Encuentra la sucursal más cercana y visítanos</p>
                
                <div className="location-tabs">
                    <button 
                        className={`location-tab ${activeLocation === 'medellin' ? 'active' : ''}`}
                        onClick={() => setActiveLocation('medellin')}
                    >
                        Medellín
                    </button>
                    <button 
                        className={`location-tab ${activeLocation === 'bogota' ? 'active' : ''}`}
                        onClick={() => setActiveLocation('bogota')}
                    >
                        Bogotá
                    </button>
                    <button 
                        className={`location-tab ${activeLocation === 'cali' ? 'active' : ''}`}
                        onClick={() => setActiveLocation('cali')}
                    >
                        Cali
                    </button>
                </div>
                
                <div className="location-content">
                    <div className="location-info">
                        <h2>{locations[activeLocation].name}</h2>
                        <div className="info-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <p><strong>Dirección:</strong> {locations[activeLocation].address}</p>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-phone"></i>
                            <p><strong>Teléfono:</strong> {locations[activeLocation].phone}</p>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-envelope"></i>
                            <p><strong>Email:</strong> {locations[activeLocation].email}</p>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-clock"></i>
                            <p><strong>Horario:</strong> {locations[activeLocation].hours}</p>
                        </div>
                    </div>
                    
                    <div className="location-map">
                        <iframe 
                            src={locations[activeLocation].mapUrl} 
                            width="100%" 
                            height="450" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Mapa de ${locations[activeLocation].name}`}
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}