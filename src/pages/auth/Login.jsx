import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 
const Login = () => {


  const[getEmail, setEmail,] = useState("")
  const[getPassword, setPassword] = useState("")
  // const[customers, setCustomers] = useState([])

  let redirectLogin = useNavigate()

  // function getCustomers() {
  //   fetch("http://localhost:3050/customer")
  //   .then(response => response.json())
  //   .then(data => setCustomers(data))
  //   }
  // }
  // getCustomers()
  // console.log(customers)


function iniciarSesion(email, password){
  if (email == "test@correo.com" && password == "1234") {
    redirectLogin("")
  } else {
    alert ("error de credenciales")
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
                  <button  onClick={() => iniciarSesion(getEmail, getPassword)} type='button' className="flip-card__btn">Let`s go!</button>
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