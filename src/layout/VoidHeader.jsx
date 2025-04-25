import React from "react";

const VoidHeader = ({  head }) => {
    const styles = {
        header: {
          backgroundColor: "#044b35",
          color: "white",
          textAlign: "center",
          padding: "20px 0",
        },
        title: {
          margin: 0,
          fontSize: "24px",
          fontWeight: "bold",
        },
      };
if (head === "Iniciar Sesión") {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Iniciar Sesion</h1>
    </header>
  );
} else if (head === "registro") {
    return (
      <header style={styles.header}>
        <h1 style={styles.title}>Registro</h1>
      </header>
    );
}}
  
export default VoidHeader;