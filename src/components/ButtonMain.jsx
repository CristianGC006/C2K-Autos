//Estilo de boton
import { useNavigate, Link } from "react-router-dom";


export default function ButtonVehicle({ContentButton,Type}) {
 let navigate = useNavigate()
 console.log(Type);
    if (Type === "Registrate") {
      return (
        <div onClick={() => navigate("/Login")} className="button-vehicle">
            <h3 className="content">{ContentButton}</h3>
        </div>
      );
    } else {
      return (
        <div onClick={() => navigate("/Rental")} className="button-vehicle">
            <h3 className="content">{ContentButton}</h3>
        </div>
      );
    }
 
}