import C2KLogoNoBackground from "../assets/C2K-LogoNoBackground.png";
import UserNavImg from "../assets/UserNavImg.png";
import ButtonCatalog from "./ButtonCatalog";
import ButtonMain from "./ButtonMain";
import SectionOne from "./SectionOne";
import '../index.css';
export default function Header() {
    return(
        <header className="header">
        <nav className="nav-bar">
            <img className="logo" alt="C2K-Logo" src={C2KLogoNoBackground} />
            <ul className="nav-list">
                <li>
                    <a href="#">Solicitar Vehículo</a>
                </li>
                <li>
                    <a href="#">¿Quiénes somos?</a>
                </li>
                <li>
                    <a href="#">¿Dónde estamos?</a>
                </li>
                <li className="user-container">
                    <a href="#">Iniciar sesión</a>
                    <img className="img-user" src={UserNavImg} alt="User" />
                </li>
            </ul>
        </nav>
        <span className="background-yellow"></span>
        <div className="container-buttons">
            <ButtonCatalog />
           <ButtonMain ContentButton={"Alquile ahora"} />
        </div>  
    </header>
    )
}