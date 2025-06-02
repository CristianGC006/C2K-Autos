import ProtectedRoute from "../components/ProtectedRoute";
import PrincipalPage from "../pages/PrincipalPage";
import UserHome from "../pages/UserHome";
import Login from "../pages/auth/Login";
import Rental from "../pages/Rental";
import Info from "../pages/Info";
import LoginAdmin from "../pages/auth/LoginAdmin";
import AdminHome from "../pages/Admin/AdminHome";
/*Creacion de rutas*/
export let routes = [
    {
        path: "/",
        element:<PrincipalPage />,
    },
    {
        path: "/login",
        element:<Login/>
    },{
        path:"/adminLogin",
        element:<LoginAdmin/>
    },
    {
        path:"/admin",
        element:<ProtectedRoute security={<AdminHome />} />
    },
    {
        path:"/userHome",
        element:<ProtectedRoute security={<UserHome />} />
    },
    {
        path:"/Rental",
        element:<Rental/>
    },
    {
        path: "/Info",
        element: <Info/>
    }
]