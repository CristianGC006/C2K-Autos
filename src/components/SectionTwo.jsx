import './components.css';
import carsCamaro from '../assets/carsCamaro.png'
import carsCharger from '../assets/carsCharger.png'
import CarsCard from './CarsCard';
import MultiFunctionalButton from './MultiFunctionalButton';
import MultiFunctionalButtonV2 from './MultiFunctionalButtonV2';
function SectionTwo(){
    return(
        <>
        <section className='cars-main'>
        <div className='section-two-carsContainer'>
            <CarsCard carImg={carsCamaro} />
            <CarsCard carImg={carsCamaro} />
            <CarsCard carImg={carsCharger} />
        </div>
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