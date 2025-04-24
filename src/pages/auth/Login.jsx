import React, { useEffect, useState } from 'react';
import { genericAlert,
  generateToken,
  redirectionAlert
 } from "../../helpers/functions"
import { useNavigate } from 'react-router-dom';

let urlCustomers = "https://fakeapic2k.onrender.com/Customers"

import './Login.css'; 
const Login = () => {


  const[getEmail, setEmail,] = useState("")
  const[getPassword, setPassword] = useState("")
  const[customers, setCustomers] = useState([])

  let redirectLogin = useNavigate()

   function getCustomers() {
     fetch("https://fakeapic2k.onrender.com/Customers")
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

    console.log("User logged in:", getCustomer());
    redirectionAlert( redirectLogin, 
      "Bienvenido", 
      "Redirigiendo...", 
      "success", 
      "")
  } else {
    genericAlert("Error", "Usuario o contraseña incorrectos", "error")
  }

}

  return (   
      <div className="wrapper">
        <div className="card-switch">
          <label className="switch">
            <input type="checkbox" className="toggle" />
            <span className="slider" />
            <span className="card-side" />
            <div className="flip-card__inner">
              <div className="flip-card__front">
                <div className="title">Log in</div>
                <form className="flip-card__form" action>
                  <input onChange={(e) => setEmail(e.target.value)} className="flip-card__input" name="email" placeholder="Email" type="email" />
                  <input onChange={(e) => setPassword(e.target.value)} className="flip-card__input" name="password" placeholder="Password" type="password" />
                  <button  onClick={() => logIn(getEmail, getPassword)} type='button' className="flip-card__btn">Let`s go!</button>
                </form>
              </div>
              <div className="flip-card__back">
                <div className="title">Sign up</div>
                <form className="flip-card__form" action>
                  <input className="flip-card__input" placeholder="Name" type="name" />
                  <input className="flip-card__input" name="email" placeholder="Email" type="email" />
                  <input className="flip-card__input" name="password" placeholder="Password" type="password" />
                  <button className="flip-card__btn">Confirm!</button>
                </form>
              </div>
            </div>
          </label>
        </div>   
      </div>
  );
}
export default Login;