import React, { useEffect, useState } from "react";
import {
  genericAlert,
  generateToken,
  redirectionAlert,
} from "../../helpers/functions";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/C2K-LogoNoBackground.png";
import ButtonForm from "../../components/ButtonForm";
import { moveToLogin } from "../../helpers/functions";

let urlCustomers = "https://fakeapic2k.onrender.com/Customers";
import Header from "../../components/Header";
import "./Login.css";
import VoidHeader from "../../layout/VoidHeader";
const Login = () => {
  const [getEmail, setEmail] = useState("");
  const [getPassword, setPassword] = useState("");
  const [customers, setCustomers] = useState([]);
  

  let redirectLogin = useNavigate();

  function getCustomers() {
    fetch(urlCustomers)
      .then((response) => response.json())
      .then((data) => setCustomers(data));
  }
  useEffect(() => {
    getCustomers();
  }, []);

  function getCustomer() {
    let customer = customers.find(
      (item) => item.email == getEmail && item.password == getPassword
    );
    return customer;
  }
  
  function logIn() {
    if (getCustomer()) {
      let accessToken = generateToken();
      localStorage.setItem("Token", JSON.stringify(accessToken));
      localStorage.setItem("User", JSON.stringify(getCustomer()));
      redirectionAlert(
        redirectLogin,
        "Bienvenido",
        "Redirigiendo...",
        "success",
        "/userHome"
      );
    } else {
      genericAlert("Error", "Usuario o contraseña incorrectos", "error");
    }
  }

  const [showLoginForm, setShowLoginForm] = useState(false);

  const toggleForms = () => {
    setShowLoginForm(!showLoginForm);
  };

  return (
    <div className="container">
    <section className="container_form">
      <form className="login_form" action style={{ display: showLoginForm ? "none" : "flex" }}>

        <div className="logo_login">
          <img src={Logo} alt="LogoC2K" />
        </div>
        <input
          onChange={(e) => setEmail(e.target.value)}
          className="login_input"
          id="email"
          name="email"
          placeholder="Email"
          type="email"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          className="login_input"
          name="password"
          placeholder="Password"
          type="password"
        />
        <ButtonForm content="Iniciar Sesión" onClick={logIn} />
      </form>
      
      <form className="register_form" action style={{ display: showLoginForm ? "grid" : "none" }}>
        <section className="form_register_left">
          <div className="div_register">
            <input
              className="register_input"
              placeholder="Nombre"
              type="name"
            />
          </div>
          <div className="div_register">
            <input
              className="register_input"
              placeholder="Apellidos"
              type="name"
            />
          </div>
          <div className="div_register">
            <select id="document_type" className="register_input">
              <option value="Tipo de Documento">Tipo de Documento</option>
              <option value="Cedula de Ciudadania">Cedula de ciudadania</option>
              <option value="Cedula de extranjeria">
                Cedula de extranjeria
              </option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </div>
          <div className="div_register">
            <input
              className="register_input"
              placeholder="Número de Documento"
              type="text"
            />
          </div>
          <div className="div_register">
            <input
              className="register_input"
              name="password"
              placeholder="Contraseña"
              type="password"
            />
          </div>
          <div className="div_register">
            <input
              className="register_input"
              name="password_confirmation"
              placeholder="Confirmar Contraseña"
              type="password"
            />
          </div>
        </section>
        <section className="form_register_right">
          <div className="div_register">
            <input
              className="register_input"
              name="email"
              placeholder="Email"
              type="email"
            />
          </div>
          <div className="div_register">
            <input
              className="register_input"
              placeholder="Número de Telefono"
              type="tel"
            />
          </div>
          <div className="div_register">
            <select id="Sex" className="register_input">
              <option value="Sexo">Sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="div_register">
            <input
              className="register_input"
              placeholder="Nacionalidad"
              type="text"
            />
          </div>
          <div class="radio_group">
            <label>Tiene Licencia de Conducción</label>
            <input type="radio" name="licencia" value="si" /> Sí
            <input type="radio" name="licencia" value="no" /> No
          </div>

          <div className="div_register">
            <input
              className="register_input"
              placeholder="Número de licencia"
              type="text"
            />
          </div>
        </section>
      </form>



      <ButtonForm content="Registrarse" onClick={"."} />



    
        
    </section>

    <section className="container_link">
<p> Atención recuerda los datos ingresados van a ser importantes para completar tu registro</p>
<p onClick={toggleForms} className= "form_link" >  ¿YA TIENES CUENTA? </p>
</section>
    </div>
  );
};
export default Login;
