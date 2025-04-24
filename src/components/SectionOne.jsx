import ButtonMain from "./ButtonMain";
import ButtonCatalog from "./ButtonCatalog";
import "../index.css";
import ButtonVehicle from "./ButtonMain";
function SectionOne() {
  return (
    <>
      <div className="container-buttons">
        <ButtonCatalog />
        <ButtonVehicle Type={"Alquila ahora"} ContentButton={"Alquila ahora"}/>  
      </div>
      <section className="section-one">
        <div className="section-one-containerImg"></div>
        <div className="section-one-containerText">
        <h2 className="section-one-div-two-h2">BIENVENIDO A C2K AUTOS</h2>
          <p className="section-one-div-two-p">
            Tu aliado en movilidad con sabor paisa. Alquila con confianza,
            flexibilidad y estilo
          </p>
          <div className="vehicle-button-section">
            <ButtonMain  ContentButton={"Registrate"} Type={"Registrate"} />
          </div>
        </div>
      </section>
    </>
  );
}
export default SectionOne;
