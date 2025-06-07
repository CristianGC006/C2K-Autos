import React, { useEffect, useState } from "react";
import validations from "../../helpers/inputValidations";
import {
  genericAlert,
  generateToken,
  redirectionAlert,
} from "../../helpers/functions";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/C2K-LogoNoBackground.png";
import ButtonForm from "../../components/ButtonForm";
import { generateAdminCode } from "../../helpers/functions";
let urlAdmins = "http://localhost:8080/admin";
import "./LoginAdmin.css";

const LoginAdmin = () => {
  const [getEmail, setEmail] = useState("");
  const [getPassword, setPassword] = useState("");
  const [getAdminCode, setAdminCode] = useState("");
  const [admin, setAdmin] = useState([]);

  //estados para manipular el formulario de registro
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmailRegister] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPasswordRegister] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  //Estados de validacion
  const [errors, setErrors] = useState({});

  let redirectLogin = useNavigate();

  function getAdmins() {
    fetch(urlAdmins)
      .then((response) => response.json())
      .then((data) => setAdmin(data));
  }
  useEffect(() => {
    getAdmins();
  }, []);

  //Register functions

  function findAdmin() {
    let adminFound = admin.find((item) => email === item.email);
    return adminFound;
  }

  function registerAdmin() {
    // ✅ LIMPIAR ERRORES PREVIOS
    setErrors({});

    // ✅ VALIDAR TODOS LOS CAMPOS CON LAS EXPRESIONES REGULARES
    const formData = {
      name: name,
      email: email,
      phone: phone,
      password: password,
      documentNumber: documentNumber,
      documentType: documentType,
    };

    
    const validation = validations.validateForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      genericAlert("Error de validación", firstError, "error");
      return;
    }

    // ✅ VALIDACIONES ESPECÍFICAS ADICIONALES

    // Validar campos vacíos
    if (
      !name ||
      !documentType ||
      !documentNumber ||
      !email ||
      !phone ||
      !password
    ) {
      genericAlert("Error", "Por favor completa todos los campos", "error");
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      genericAlert("Error", "Las contraseñas no coinciden", "error");
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Las contraseñas no coinciden",
      }));
      return;
    }
    //enviar correo de administrador
    
    // ✅ VALIDACIONES INDIVIDUALES PARA MOSTRAR MENSAJES ESPECÍFICOS
    if (!validations.email.validate(email)) {
      genericAlert("Error", validations.email.message, "error");
      return;
    }

    if (!validations.passwordSimple.validate(password)) {
      genericAlert("Error", validations.passwordSimple.message, "error");
      return;
    }

    if (!validations.fullName.validate(name)) {
      genericAlert("Error", validations.fullName.message, "error");
      return;
    }

    if (!validations.phoneNumber.validate(phone)) {
      genericAlert("Error", validations.phoneNumber.message, "error");
      return;
    }

    if (!validations.documentNumber.validate(documentNumber)) {
      genericAlert("Error", validations.documentNumber.message, "error");
      return;
    }

    // ✅ SI TODAS LAS VALIDACIONES PASAN, PROCEDER CON EL REGISTRO
    if (!findAdmin()) {
      let newAdmin = {
        name: name,
        identificationType: documentType,
        identificationNumber: documentNumber,
        adminCode: generateAdminCode(),
        email: email,
        phone: phone,
        password: password,
      };



      fetch(urlAdmins, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAdmin),
      })
        .then((response) => {
          console.log("Response status:", response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Registro exitoso:", data);
          getAdmins();

          setTimeout(() => {
            genericAlert(
              "Registro exitoso",
              "Tu cuenta ha sido creada correctamente",
              "success"
            );
          }, 500);

          // ✅ LIMPIAR FORMULARIO Y ERRORES
          setName("");
          setDocumentType("");
          setDocumentNumber("");
          setEmailRegister("");
          setPhone("");
          setPasswordRegister("");
          setConfirmPassword("");
          setErrors({});

          setShowLoginForm(false);
          setShowContainerLink(true);
        })
        .catch((error) => {
          console.error("Error en el registro:", error);
          genericAlert(
            "Error",
            "No se pudo completar el registro. Intenta nuevamente.",
            "error"
          );
        });
    } else {
      genericAlert(
        "Error",
        "Este administrador ya existe, por favor intenta con otro correo",
        "error"
      );
    }
  }

  function getAdmin() {
    let customer = admin.find(
      (item) =>
        item.email == getEmail &&
        item.password == getPassword &&
        item.adminCode == getAdminCode
    );
    return customer;
  }
  function logIn() {
    if (getAdmin()) {
      let accessToken = generateToken();
      localStorage.setItem("Token", JSON.stringify(accessToken));
      localStorage.setItem("Admin", JSON.stringify(getAdmin()));
      redirectionAlert(
        redirectLogin,
        "Bienvenido",
        "Se ha iniciado sesión correctamente",
        "success",
        "/admin/dashboard"
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

  // ✅ FUNCIÓN PARA VALIDAR UN CAMPO Y ACTUALIZAR ERRORES
  const validateField = (fieldName, value, validationType) => {
    const validation = validations.validateField(validationType, value);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: validation.isValid ? "" : validation.message,
    }));

    return validation.isValid;
  };

  // ✅ HANDLERS CON VALIDACIÓN EN TIEMPO REAL
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    validateField("name", value, "fullName");
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailRegister(value);
    validateField("email", value, "email");
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    validateField("phone", value, "phoneNumber");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordRegister(value);
    validateField("password", value, "passwordSimple");
  };

  const handleDocumentChange = (e) => {
    const value = e.target.value;
    setDocumentNumber(value);
    validateField("document", value, "documentNumber");
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    // Validar que coincidan las contraseñas
    if (password && value !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Las contraseñas no coinciden",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
  };

  return (
    <div className="container">
      <section className="container_form">
        {/* Formulario de Login  */}
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
          <input
            onChange={(e) => setAdminCode(e.target.value)}
            className="login_input"
            name="adminCode"
            placeholder="Código de Administrador"
            type="text"
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
        </form>        {/* FORMULARIO DE REGISTRO */}
        <form
          className={`admin_register_form ${
            isTransitioning ? "fade-out" : "fade-in"
          }`}
          action
          style={{ display: showLoginForm ? "flex" : "none" }}
        >
          <h2 className="admin_register_title">Registro de Administrador</h2>
          
            <div className="admin_div_register">
              <input
                onChange={handleNameChange} // ✅ Usar handler con validación
                className={`admin_register_input ${errors.name ? "admin-input-error" : ""}`} // ✅ Clase de error
                placeholder="Nombre"
                type="text"
                value={name}
              />              {errors.name && (
                <span className="admin-error-message">{errors.name}</span>
              )}{" "}
              {/* ✅ Mostrar error */}
            </div>

            <div className="admin_div_register">
              <select
                id="document_type"
                className="admin_register_input"
                onChange={(e) => setDocumentType(e.target.value)}
                value={documentType}
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

            <div className="admin_div_register">
              <input
                onChange={handleDocumentChange} // ✅ Usar handler con validación
                className={`admin_register_input ${
                  errors.document ? "admin-input-error" : ""
                }`}                placeholder="Número de Documento"
                type="text"
                value={documentNumber}
              />
              {errors.document && (
                <span className="admin-error-message">{errors.document}</span>
              )}
            </div>

            <div className="admin_div_register">
              <input
                onChange={handlePasswordChange} // ✅ Usar handler con validación
                className={`admin_register_input ${
                  errors.password ? "admin-input-error" : ""
                }`}
                name="password"
                placeholder="Contraseña"
                type="password"
                value={password}
              />
              {errors.password && (
                <span className="admin-error-message">{errors.password}</span>
              )}
            </div>
         

          
            <div className="admin_div_register">
              <input
                onChange={handleEmailChange} 
                className={`admin_register_input ${
                  errors.email ? "admin-input-error" : ""
                }`}                name="email"
                placeholder="Email"
                type="email"
                value={email}
              />
              {errors.email && (
                <span className="admin-error-message">{errors.email}</span>
              )}
            </div>

            <div className="admin_div_register">
              <input
                onChange={handlePhoneChange} // ✅ Usar handler con validación
                className={`admin_register_input ${
                  errors.phone ? "admin-input-error" : ""
                }`}
                placeholder="Número de Telefono"
                type="tel"
                value={phone}
              />
              {errors.phone && (
                <span className="admin-error-message">{errors.phone}</span>
              )}
            </div>
                <div className="admin_div_register">
              <input
                onChange={handleConfirmPasswordChange} // ✅ Usar handler con validación
                className={`admin_register_input ${
                  errors.confirmPassword ? "admin-input-error" : ""
                }`}                name="password_confirmation"
                placeholder="Confirmar Contraseña"
                type="password"
                value={confirmPassword}
              />
              {errors.confirmPassword && (
                <span className="admin-error-message">{errors.confirmPassword}</span>
              )}
            </div>
        </form>

        {showLoginForm && (
          <ButtonForm
            content="Registrarse"
            onClick={registerAdmin}
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
export default LoginAdmin;
