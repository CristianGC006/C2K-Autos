//Estilo de boton
import { BrowserRouter, Link } from "react-router-dom";
export default function ButtonVehicle({ContentButton}) {

    return (
       <div className="button-vehicle">
         <h3 className="content">{ContentButton}</h3>
       </div>
    );
}