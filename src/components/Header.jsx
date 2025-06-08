import C2KLogoNoBackground from "../assets/C2K-LogoNoBackground.png";
import UserNavImg from "../assets/UserNavImg.png";
import './header.css';
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from 'react';

export default function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLoginRedirect = (userType) => {
        setIsDropdownOpen(false);
        // Redirigir según el tipo de usuario
        if (userType === 'cliente') {
            navigate('/Login');
        } else if (userType === 'admin') {
            navigate('/adminLogin');
        }else if (userType === 'assessor') {
            navigate('/assessorLogin');
        }else if (userType === 'logisticOp') {
            navigate('/logisticOp');
        }
    };

    return(
        <header className="header">
        <nav className="nav-bar">
            
            <img className="logo" alt="C2K-Logo" src={C2KLogoNoBackground} />
            <ul className="nav-list">
                <li>
                    <Link to="/Rental">Solicitar Vehículo</Link>
                </li>
                <li className="user-container">
                <Link to="/Info">¿Quienes Somos?</Link>
                </li>
                <li>
                <Link to="/Location">¿Dónde estamos?</Link>
                </li>
                <li className="user-container-login" ref={dropdownRef}>
                        <button 
                            className="login-dropdown-button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            Iniciar sesión ▼
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="login-dropdown-menu">
                                <button 
                                    className="login-dropdown-item"
                                    onClick={() => handleLoginRedirect('cliente')}
                                >
                                    Cliente
                                </button>
                                <button 
                                    className="login-dropdown-item"
                                    onClick={() => handleLoginRedirect('admin')}
                                >
                                    Administrador
                                </button>
                                <button 
                                    className="login-dropdown-item"
                                    onClick={() => handleLoginRedirect('assessor')}
                                >
                                    Asesor
                                </button>
                                <button 
                                    className="login-dropdown-item"
                                    onClick={() => handleLoginRedirect('logisticOp')}
                                >
                                    Operador Logístico
                                </button>
                            </div>
                        )}
                        
                        <img className="img-user" src={UserNavImg} alt="User" />
                    </li>
            </ul>  
        </nav>
      
    </header>
    )
}