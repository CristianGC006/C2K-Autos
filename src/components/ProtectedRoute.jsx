import { Navigate } from "react-router-dom";


function ProtectedRoute({ security }){
	let accessToken = localStorage.getItem("Token")
	console.log(accessToken);
	return accessToken ? security : <Navigate to = "/" />
	
	
	//por el momento como no tenemeos redireccion a la vista de una pagina despues  del login, el componente Navigate se deja vacío
	//para que no redireccione a ninguna parte, pero en el futuro se puede cambiar por una ruta especifica
}

export default ProtectedRoute;