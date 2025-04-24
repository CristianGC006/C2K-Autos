import { Navigate } from "react-router-dom";


function ProtectedRoute({ security }){
	let accessToken = localStorage.getItem("Token")
	console.log(accessToken);
	return accessToken ? security : <Navigate to = "/" />
}

export default ProtectedRoute;