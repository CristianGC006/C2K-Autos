import "./principalPage.css";
import Header from "../components/Header";
import SectionOne from "../components/SectionOne";
import SectionTwo from "../components/SectionTwo";
import SectionThree from "../components/SectionThree";
import Footer from "../components/Footer";
export default function PrincipalPage() {

return (
    <>    
    <main className="div-principal">
    <Header/>
    <SectionOne/>
    <SectionTwo/>
    <SectionThree/>
    <Footer/>
    </main>
   
    </>
);
}
