import Aside from "../components/userPanel/Aside";
import Panel from "../components/userPanel/Panel";

const UserHome = () => {
    return(
        <div className="aplicacion">
        <Aside />
        <div className="aplicacion__contenido">
          <div className="aplicacion__contenido-fondo"></div>
          <main className="aplicacion__principal">
            <section className="aplicacion__eslogan">
              <h2 className="aplicacion__eslogan-texto"><span>C2K:</span>Confianza sobre ruedas, compromiso en cada Kilómetro</h2>
            </section>
            <Panel />
          </main>
        </div>
      </div>
    )
}
export default UserHome;