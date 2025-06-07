import ProtectedRoute from "../components/ProtectedRoute";
import PrincipalPage from "../pages/PrincipalPage";
import UserHome from "../pages/UserHome";
import Login from "../pages/auth/Login";
import Rental from "../pages/Rental";
import Info from "../pages/Info";
import LoginAdmin from "../pages/auth/LoginAdmin";
import AdminHome from "../pages/Admin/AdminHome";
import AssessorHome from "../pages/Assessor/AssessorHome";
import Location from "../pages/Location";
import LoginAssessor from "../pages/auth/LoginAssessor";
import LoginLogisticOp from "../pages/auth/LoginLogisticOp";
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
        path:"/adminLogin",
        element:<LoginAdmin/>
    },
    {
        path:"/assessorLogin",
        element:<LoginAssessor/>
    },
    {
        path:"/logisticOp",
        element: <LoginLogisticOp/>
    },
    {
        path:"/adminHome",
        element:<ProtectedRoute security={<AdminHome />} />
    },
    {
        path:"/userHome",
        element:<ProtectedRoute security={<UserHome />} />
    },
    {
        path:"/assessor",
        element:<ProtectedRoute security={<AssessorHome />} />
    },
    {
        path:"/Rental",
        element:<Rental/>
    },
    {
        path: "/Info",
        element: <Info/>
    },
    {
        path: "/Location",
        element: <Location/>
    }
]