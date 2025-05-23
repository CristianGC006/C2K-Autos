import './components.css';
import carsCamaro from '../assets/carsCamaro.png'
import carsCharger from '../assets/carsCharger.png'
import carsAudi from '../assets/carsAudi.jpg'
import CarouselCars from './CarouselCars';
import MultiFunctionalButton from './MultiFunctionalButton';
import MultiFunctionalButtonV2 from './MultiFunctionalButtonV2';

function SectionTwo(){
    // Datos de ejemplo para el carrusel
    const carsData = [
        {
            id: 1,
            name: 'Chevrolet Camaro',
            image: carsAudi,
            type: 'Deportivo',
            year: '2023',
            Color: 'Amarillo',
            Plate: 'ABC123'
        },
        {
            id: 2,
            name: 'Chevrolet Camaro',
            image: carsCamaro,
            type: 'Deportivo',
            year: '2023',
            Color: 'Amarillo',
            Plate: 'DEF456'
        },
        {
            id: 3,
            name: 'Dodge Charger',
            image: carsCharger,
            type: 'Deportivo',
            year: '2023',
            Color: 'Negro',
            Plate: 'GHI789'
        }
    ];

    return(
        <>
        <section className='cars-main'>
            <CarouselCars cars={carsData} />
        </section>
        <section className='search-bar'>
            <MultiFunctionalButton type='input' label={"Escribe tu lugar de recogida"}/>
            <MultiFunctionalButtonV2 type='date' label='Fecha' icon='' />
            <MultiFunctionalButtonV2 type='time' label='Hora' icon='' />
            <button type='submit' className='search-button'>Consultar Disponibilidad</button>
        </section>
        </>
    )
}

export default SectionTwo;