import ButtonMain from './ButtonMain'
import '../index.css';
import carImage from '../assets/carImage.jpg';
function SectionOne(){
	return(
	<section className="section-one">
		<div className='section-one-div-one'> 
		</div>
		<div className='section-one-div-two'>
			<h2 className='section-one-div-two-h2'>BIENVENIDO A C2K AUTOS</h2>
			<p className='section-one-div-two-p'>Tu aliado en movilidad con sabor paisa.
			Alquila con confianza, flexibilidad y estilo
			</p>
            <div className='vehicle-button-section'>
            <ButtonMain ContentButton={"Registrate"}/>
            </div>
            
		</div>

      </section>
	  )
	}
	export default SectionOne;