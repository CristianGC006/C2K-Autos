import PrincipalPage from "../pages/PrincipalPage";
import Login from "../pages/auth/Login";

export let routes = [
    {
        path: "/",
        element:<PrincipalPage/>,
    },
    {
        path: "/login",
        element:<Login/>
    }
]