import PrincipalPage from "../pages/PrincipalPage";
import Login from "../pages/auth/Login";
/*Creacion de rutas*/
export let routes = [
    {
        path: "/",
        element:<PrincipalPage/>,
    },
    {
        path: "/login",
        element:<Login/>
    },
    //ruta de la pagina panel de usuario don de se pueda visualizar las rentas
]