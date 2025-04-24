import { Link, useNavigate } from "react-router-dom"
import { redirectionAlert } from "../../helpers/functions"
import '../../pages/UserHome.css'

const Aside = () => {
  let redirection = useNavigate()
  let customer = JSON.parse(localStorage.getItem("customer"))
  
  function logOut() {
    localStorage.removeItem("token")
    localStorage.removeItem("customer")
    redirectionAlert(redirection,"C2K", "Hasta luego, vuelva pronto", "info", "/")
  }
  return (
    <aside className="aplicacion__menu-lateral">
      <h1 className="aplicacion__menu-lateral-logo">Track <span className="aplicacion__menu-lateral-logo--resaltado">X</span></h1>
      <h2>Usuario:{customer ? customer.name : 'Invitado'}</h2>
      <img className="aplicacion__menu-lateral-logo-imagen" src="/logo.jpg" alt="Logo" />
      <nav className="aplicacion__menu-lateral-navegacion">
        <Link className="aplicacion__menu-lateral-navegacion-item" to="">Inicio</Link>
        <Link className="aplicacion__menu-lateral-navegacion-item" to="">Coches Alquilados</Link>
        <Link className="aplicacion__menu-lateral-navegacion-item" to="">Catálogo</Link>
        <button onClick={logOut} type='button' className="aplicacion__menu-lateral-navegacion-item" to="/">Cerrar sesión</button>
      </nav>
    </aside>
  )
}

export default Aside