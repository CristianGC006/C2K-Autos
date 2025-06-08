import ProtectedRoute from "../components/ProtectedRoute";
import PrincipalPage from "../pages/PrincipalPage";
import UserHome from "../pages/UserHome";
import Login from "../pages/auth/Login";
import Rental from "../pages/Rental";
import Info from "../pages/Info";
import LoginAdmin from "../pages/auth/LoginAdmin";
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import CustomerManagement from "../pages/Admin/CustomerManagement";
import VehicleManagement from "../pages/Admin/VehicleManagement";
import AdminManagement from "../pages/Admin/AdminManagement";
import AssessorManagement from "../pages/Admin/AssessorManagement";
import LogisticManagement from "../pages/Admin/LogisticManagement";
import RentalManagement from "../pages/Admin/RentalManagement";
import BranchManagement from "../pages/Admin/BranchManagement";
import AdminReports from "../pages/Admin/AdminReports";
import AdminSettings from "../pages/Admin/AdminSettings";
import AssessorHome from "../pages/Assessor/AssessorHome";
import Location from "../pages/Location";
import LoginAssessor from "../pages/auth/LoginAssessor";
import LoginLogisticOp from "../pages/auth/LoginLogisticOp";
import LogisticOperatorLayout from '../pages/LogisticOperator/LogisticOperatorLayout';
import VehicleManagementLO from '../pages/LogisticOperator/VehicleManagementLO';

/*Creacion de rutas*/
export let routes  = [
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
        element: <LoginLogisticOp/>,
        
    },    {
        path:"/admin",
        element:<ProtectedRoute security={<AdminLayout />} />,
        children: [
            {
                path: "dashboard",
                element: <AdminDashboard />
            },            {
                path: "customers",
                element: <CustomerManagement />
            },            {
                path: "vehicles",
                element: <VehicleManagement />
            },
            {
                path: "branches",
                element: <BranchManagement />
            },
            {
                path: "admins",
                element: <AdminManagement />
            },
            {
                path: "assessors",
                element: <AssessorManagement />
            },            {
                path: "logistics",
                element: <LogisticManagement />
            },
            {
                path: "rentals",
                element: <RentalManagement />
            },
            {
                path: "reports",
                element: <AdminReports />
            },
            {
                path: "settings",
                element: <AdminSettings />
            },
            {
                // Redirección por defecto al dashboard
                index: true,
                element: <AdminDashboard />
            }
        ]
    },
    {
        // Mantener compatibilidad con la ruta antigua
        path:"/adminHome",
        element:<ProtectedRoute security={<AdminLayout />} />
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
    },    {
        path: "/Location",
        element: <Location/>
    },
    {
        path: '/logisticOpHome',
        element: <ProtectedRoute security={<LogisticOperatorLayout />} />,
        children: [
            { 
                path: 'vehicles', 
                element: <VehicleManagementLO /> 
            },
            {
                // Redirección por defecto a vehículos
                index: true,
                element: <VehicleManagementLO />
            }
        ]
    }
]