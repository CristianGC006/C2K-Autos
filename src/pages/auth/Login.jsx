import React, { useEffect, useState } from 'react';
import { genericAlert,
  generateToken,
  redirectionAlert
 } from "../../helpers/functions"
import { useNavigate } from 'react-router-dom';
import Logo from "../../assets/C2K-LogoNoBackground.png"

let urlCustomers = "https://fakeapic2k.onrender.com/Customers";

import './Login.css'; 
const Login = () => {


  const[getEmail, setEmail,] = useState("")
  const[getPassword, setPassword] = useState("")
  const[customers, setCustomers] = useState([])

  let redirectLogin = useNavigate()

   function getCustomers() {
     fetch(urlCustomers)
     .then(response => response.json())
     .then(data => setCustomers(data))
     }
   useEffect(() => {
     getCustomers()
   }, [])

   function getCustomer(){
      let customer=customers.find((item) => item.email == getEmail && item.password == getPassword)
      return customer
   }


function logIn(){
  if (getCustomer()) {
    let accessToken = generateToken();
    localStorage.setItem("Token", JSON.stringify(accessToken));
    localStorage.setItem("User", JSON.stringify(getCustomer()));
    redirectionAlert( redirectLogin, 
      "Bienvenido", 
      "Redirigiendo...", 
      "success", 
      "/userHome")
  } else {
    genericAlert("Error", "Usuario o contraseña incorrectos", "error")
  }

}

  return (   
      <section className='container_form'>

                <form className="login_form" action>
                <div className="logo_login">
                  <img src={Logo} alt="LogoC2K" />
                </div>
                  <input onChange={(e) => setEmail(e.target.value)} className="login_input" id='email' name="email" placeholder="Email" type="email" />
                  <input onChange={(e) => setPassword(e.target.value)} className="login_input"  name="password" placeholder="Password" type="password" />
                  //El boton de iniciar sesion lleva onClick
                </form> 
            
               <div className="title">Registro</div>
                <form className="register_form" action>
                  <div className='div_register'>
                  <input className="register_input" placeholder="Nombre" type="name" />
                  </div>
                  <div className="div_register">
                  <input className="register_input" name="email" placeholder="Email" type="email" />
                  </div>
                  <div className="div_register">
                  <input className="register_input" placeholder="Apellidos" type="name" />
                  </div>
                  <div className="div_register">
                  <input className="register_input" placeholder="Número de Telefono" type="tel" />
                  </div>
                  <div className="div_register">
                  <select id='document_type' className="register_input">
                    <option value="Tipo de Documento">Tipo de Documento</option>
                    <option value="Cedula de Ciudadania">Cedula de ciudadania</option>
                    <option value="Cedula de extranjeria">Cedula de extranjeria</option>
                    <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <div className="div_register">
                  <select id="Sex" className='register_input'>
                    <option value="Sexo">Sexo</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                  </div>
                  <div className="div_register">
                  <input className="register_input" placeholder="Número de Documento" type="text"/>
                  </div>
                  <div className="div_register">
                  <input className="register_input" placeholder="Nacionalidad" type="text" />
                  </div>
                  <div className="div_register">
                  <input className="register_input" name="password" placeholder="Contraseña" type="password" />
                  </div>
                  <div id='span' className="div_register">
                  <span>¿Tiene licencia de conducción?</span>
                  <label htmlFor="license">Si</label>
                  <input type="checkbox" />
                  <label htmlFor="license">No</label>
                  <input type="checkbox" />
                  </div>
                  <div className="div_register">
                  <input className="register_input" name="password_confirmation" placeholder="Confirmar Contraseña" type="password" />
                  </div>
                  <div className="div_register">
                  <input className="register_input" placeholder="Número de licencia" type="text" />
                  </div>
                </form> 
                </section>   
  );
}
export default Login;