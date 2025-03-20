import './components.css';
import carsCamaro from '../assets/carsCamaro.png'
import carsCharger from '../assets/carsCharger.png'
import CarsCard from './CarsCard';
function SectionTwo(){
    return(
        <>
        <div className='section-two-carsContainer'>
            <CarsCard carImg={carsCamaro} />
            <CarsCard carImg={carsCamaro} />
            <CarsCard carImg={carsCharger} />
        </div>
        </>
    )

}
export default SectionTwo;