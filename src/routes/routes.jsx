import ProtectedRoute from "../components/ProtectedRoute";
import PrincipalPage from "../pages/PrincipalPage";
import UserHome from "../pages/UserHome";
import Login from "../pages/auth/Login";
import Rental from "../pages/Rental";
/*Creacion de rutas*/
export let routes = [
    {
        path: "/",
        element:<PrincipalPage />,
    },
    {
        path: "/login",
        element:<Login/>
    },
    {
        path:"/userHome",
        element:<ProtectedRoute security={<UserHome />} />
    },
    {
        path:"/Rental",
        element:<Rental/>
    }
]