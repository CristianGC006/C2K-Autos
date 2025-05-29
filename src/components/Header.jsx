import C2KLogoNoBackground from "../assets/C2K-LogoNoBackground.png";
import UserNavImg from "../assets/UserNavImg.png";
import './header.css';
import { Link, useNavigate } from "react-router-dom";
export default function Header() {
    const navigate = useNavigate();
    return(
        <header className="header">
        <nav className="nav-bar">
            
            <img className="logo" alt="C2K-Logo" src={C2KLogoNoBackground} />
            <ul className="nav-list">
                <li>
                    <a href="#">Solicitar Vehículo</a>
                </li>
                <li className="user-container">
                <Link to="/Info">¿Quienes Somos?</Link>
                </li>
                <li>
                    <a href="#">¿Dónde estamos?</a>
                </li>
                <li className="user-container-login">
                    <Link to="/Login">Iniciar sesión</Link>
                    <img className="img-user" src={UserNavImg} alt="User" onClick={() => navigate("/Login")}/>
                </li>
            </ul>  
        </nav>
      
    </header>
    )
}