import '../index.css';
import { Calendar, Clock } from "lucide-react";
    
function SectionTwo(){
    return(
        <section className="section-two">
            <div className='section-two-first-div'>
                <section><img src="" alt="" /></section>
                <section><img src="" alt="" /></section>
                <section><img src="" alt="" /></section>
            </div>
            <div className='section-two-second-div'>
                <section className='section-two-second-second-div'>
                    <ul className='nav-disponibility'>
                        <li><a href="">Bello</a></li>
                        <li><a href="">Itagui</a></li>
                        <li><a href="">Guarne</a></li>
                        <li><a href="">Santa Elena</a></li>
                        <li><a href="">Aranjuez</a></li>
                    </ul>
                    <button className="calendary-button">
            <Calendar className="text-yellow-400" size={20} />
            <span>Fecha</span>
          </button>

                
                </section>
            </div>
            <button className="Clock-button">
              <Clock className="text-yellow-400" size={20} />
              <span>Hora</span>
            </button>


        </section>
    )

}
export default SectionTwo;