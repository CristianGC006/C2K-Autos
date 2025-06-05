
import { useState } from "react";
import Aside from "../components/userPanel/Aside";
import HeaderUser from "../components/userPanel/HeaderUser";
import Panel from "../components/userPanel/Panel";
import "../components/userPanel/userHome.css";

const UserHome = () => {
  const [activeSection, setActiveSection] = useState("inicio");
  const user = JSON.parse(localStorage.getItem("User")) || {};

  return (
    <div className="aplicacion">
      <HeaderUser />
      <div className="user-panel-container">
        <Aside activeSection={activeSection} setActiveSection={setActiveSection} />
        <Panel activeSection={activeSection} setActiveSection={setActiveSection} user={user} />
      </div>
    </div>
  );
};

export default UserHome;