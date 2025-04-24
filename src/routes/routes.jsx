import PrincipalPage from "../pages/PrincipalPage";
import UserHome from "../pages/UserHome";
import Login from "../pages/auth/Login";
/*Creacion de rutas*/
export let routes = [
    {
        path: "/",
        element:<PrincipalPage security={<UserHome/>}/>,
    },
    {
        path: "/login",
        element:<Login/>
    },
    {
        path:"/userHome",
        element:<UserHome security={<PrincipalPage/>}/>
    }
]