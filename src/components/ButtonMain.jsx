//Estilo de boton
import { BrowserRouter, Link } from "react-router-dom";
export default function ButtonVehicle({ContentButton,Type}) {
//Con el operador ternario se determina si el boton es de registro o de alquiler
    if (Type === "Registrate") {
      return (
        <div className="button-vehicle">
          <Link to="/login">
            <h3 className="content">{ContentButton}</h3>
          </Link>
        </div>
        //usenavigate
      );
    } else {
      return (
        <div className="button-vehicle">
          <Link to="/Alquiler">
            <h3 className="content">{ContentButton}</h3>
          </Link>
        </div>
      );
    }
 
}