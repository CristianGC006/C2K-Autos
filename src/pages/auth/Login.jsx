import React, { useEffect, useState } from "react";
import {
  genericAlert,
  generateToken,
  redirectionAlert,
} from "../../helpers/functions";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/C2K-LogoNoBackground.png";
import ButtonForm from "../../components/ButtonForm";

let urlCustomers = "http://localhost:8080/customer";
import Header from "../../components/Header";
import "./Login.css";

const Login = () => {
  const [getEmail, setEmail] = useState("");
  const [getPassword, setPassword] = useState("");
  const [customers, setCustomers] = useState([]);

  //estados para manipular el formulario de registro
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [genderType, setGenderType] = useState("");
  const [nationality, setNationality] = useState("");
  const [email, setEmailRegister] = useState("");
  const [phone, setPhone] = useState("");
  const [haveLicense, setHaveLicense] = useState("");
  const [license, setLicense] = useState("");
  const [password, setPasswordRegister] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recordDate, setRecordDate] = useState(Date.now());

  let redirectLogin = useNavigate();

  function getCustomers() {
    fetch(urlCustomers)
      .then((response) => response.json())
      .then((data) => setCustomers(data));
  }
  useEffect(() => {
    getCustomers();
  }, []);

  //Register functions

  function findUser() {
    let user = customers.find((item) => getCustomer == item.user);
    return user;
  }

  function registerCustomer() {
    if (password !== confirmPassword) {
      genericAlert("Error", "Las contraseñas no coinciden", "error");
      return;
    }
    if (haveLicense.toLowerCase() === "no") {
      genericAlert("Error", "Es necesario que cuentes con licencia de conducción, de lo contrario no podrás rentar con C2K", "error");
      return;
    }
    if (!findUser()) {
      const recordDateformatted = new Date(recordDate).toISOString().split("T")[0];
      let newCustomer = {
        name: name,
        lastName: lastName,
        identificationType: documentType,
        identificationNumber: documentNumber,
        genderType: genderType,
        nationality: nationality,
        email: email,
        phone: phone,
        license: license,
        password: password,
        recordDate: recordDateformatted,
      };
      fetch(urlCustomers, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      }).then(() => {
        getCustomers();
        setTimeout(() => {
        genericAlert(
          "Registro exitoso",
          "Tu cuenta ha sido creada correctamente",
          "success"
        );
      }, 500);
        setShowLoginForm(false);
        setShowContainerLink(true);

        redirectionAlert(
          redirectLogin,
          "Bienvenido",
          "Redirigiendo...",
          "success",
          "/login"
        );
      });
    } else {
      genericAlert(
        "Error",
        "El usuario ya existe, por favor intenta con otro correo",
        "error"
      );
    }
  }

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
  const [showContainerLink, setShowContainerLink] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false); // Nuevo estado para manejar la transición

  const toggleForms = () => {
    setIsTransitioning(true); // Activar la transición
    setTimeout(() => {
      setShowLoginForm(!showLoginForm); // Cambiar el formulario después de la animación
      setShowContainerLink(!showContainerLink);
      setIsTransitioning(false); // Desactivar la transición
    }, 500); // Duración de la animación en milisegundos
  };

  return (
    <div className="container">
      <section className="container_form">
        <form
          className={`login_form ${isTransitioning ? "fade-out" : "fade-in"}`}
          action
          style={{ display: showLoginForm ? "none" : "flex" }}
        >
          <div className="logo_login">
            <img src={Logo} alt="LogoC2K" />
          </div>
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="login_input"
            id="email"
            name="email"
            placeholder="Correo Electronico"
            type="email"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="login_input"
            name="password"
            placeholder="Contraseña"
            type="password"
          />
          <ButtonForm
            content="Iniciar Sesión"
            onClick={logIn}
            disabled={isTransitioning}
          />
          <section className="container_link_login">
            <p className="form_link_login" onClick={toggleForms}>
              ¿No tienes cuenta?{" "}
            </p>
            <p className="form_link_forgotPassword">
              ¿Olvidaste tu contraseña?
            </p>
          </section>
        </form>
        <form
          className={`register_form ${
            isTransitioning ? "fade-out" : "fade-in"
          }`}
          action
          style={{ display: showLoginForm ? "grid" : "none" }}
        >
          <section className="form_register_left">
            <div className="div_register">
              <input
                onChange={(e) => setName(e.target.value)}
                className="register_input"
                placeholder="Nombre"
                type="name"
              />
            </div>
            <div className="div_register">
              <input
                onChange={(e) => setLastName(e.target.value)}
                className="register_input"
                placeholder="Apellidos"
                type="name"
              />
            </div>
            <div className="div_register">
              <select
                id="document_type"
                className="register_input"
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="">Tipo de Documento</option>
                <option value="CEDULA_DE_CIUDADANIA">
                  Cédula de ciudadanía
                </option>
                <option value="CEDULA_DE_EXTRANJERIA">
                  Cédula de extranjería
                </option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div className="div_register">
              <input
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="register_input"
                placeholder="Número de Documento"
                type="text"
              />
            </div>
            <div className="div_register">
              <input
                onChange={(e) => setPasswordRegister(e.target.value)}
                className="register_input"
                name="password"
                placeholder="Contraseña"
                type="password"
              />
            </div>
            <div className="div_register">
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                onChange={(e) => setEmailRegister(e.target.value)}
                className="register_input"
                name="email"
                placeholder="Email"
                type="email"
              />
            </div>
            <div className="div_register">
              <input
                onChange={(e) => setPhone(e.target.value)}
                className="register_input"
                placeholder="Número de Telefono"
                type="tel"
              />
            </div>
            <div className="div_register">
              <select
                id="Sex"
                className="register_input"
                onChange={(e) => setGenderType(e.target.value)}
              >
                <option value="">Sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="div_register">
              <input
                onChange={(e) => setNationality(e.target.value)}
                className="register_input"
                placeholder="Nacionalidad"
                type="text"
              />
            </div>
            <div className="radio_group">
              <label>Tiene Licencia de Conducción</label>
              <input type="radio" name="licencia" value="si" onChange={(e)=>setHaveLicense(e.target.value)} /> Sí
              <input type="radio" name="licencia" value="no" onChange={(e)=>setHaveLicense(e.target.value)} />No
            </div>

            <div className="div_register">
              <input
                onChange={(e) => setLicense(e.target.value)}
                className="register_input"
                placeholder="Número de licencia"
                type="text"
              />
            </div>
          </section>
        </form>
        {showLoginForm && (
          <ButtonForm
            content="Registrarse"
            onClick={registerCustomer}
            disabled={isTransitioning}
          />
        )}
      </section>
      {showLoginForm && (
        <section className="container_link">
          <p>
            {" "}
            Atención recuerda los datos ingresados van a ser importantes para
            completar tu registro
          </p>
          <p onClick={toggleForms} className="form_link">
            {" "}
            ¿Ya tienes cuenta?{" "}
          </p>
        </section>
      )}
    </div>
  );
};
export default Login;
