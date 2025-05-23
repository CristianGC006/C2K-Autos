import { useState } from 'react';
import "./Info.css"

function Info() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const accordionData = [
    {
      title: "Misión de C2K Autos",
      content: "En C2K Autos, nos dedicamos a ofrecer soluciones de movilidad innovadoras, accesibles y confiables, diseñadas para satisfacer las necesidades de todos nuestros clientes. Nos comprometemos a operar con responsabilidad social, civismo y respeto, transformando cada viaje en una experiencia segura, cómoda y memorable. A través de un servicio de calidad, promovemos la confianza y la solidaridad, contribuyendo al desarrollo sostenible de nuestras comunidades y al bienestar de quienes nos eligen como su aliado en movilidad."
    },
    {
      title: "Visión de C2K Autos",
      content: "En cinco años, C2K Autos será reconocida como la empresa líder en soluciones de movilidad en Colombia, destacándonos por nuestra innovación tecnológica, responsabilidad social y un servicio al cliente excepcional. Transformaremos la experiencia del renting, siendo referentes en confianza, accesibilidad y calidad, mientras impulsamos un futuro más sostenible y conectado para todos. Nuestra visión es ser el aliado preferido de los colombianos, ofreciendo no solo autos, sino soluciones integrales que mejoren su calidad de vida y contribuyan al desarrollo del país."
    },
    {
      title: "Valores de C2K Autos",
      content: "· Respeto: en nuestra organización el respeto es el corazón de todo lo que hacemos. Valoramos a cada persona, ya sea cliente, colaborador o miembro de la comunidad, reconociendo su dignidad, sus necesidades y sus diferencias. Nos comprometemos a tratar a todos con equidad, escuchar con atención y actuar con consideración en cada interacción. El respeto no solo define nuestras relaciones humanas, sino también nuestra relación con el entorno, promoviendo prácticas sostenibles y responsables. Para nosotros, el respeto no es solo un valor, es la base de una convivencia armoniosa y un servicio excepcional.· Confianza: En C2K Autos, la confianza es el cimiento de todo lo que hacemos. Nos esforzamos por construir relaciones sólidas y duraderas con nuestros clientes, colaboradores y comunidades, basadas en la transparencia, la integridad y la seguridad. Cada auto que ofrecemos, cada servicio que brindamos y cada interacción que tenemos está diseñada para generar tranquilidad y certeza. Sabemos que, cuando nuestros clientes eligen C2K Autos, no solo confían en un vehículo, sino en una experiencia completa que les permitirá moverse con libertad y sin preocupaciones. Para nosotros, la confianza no es solo un valor, es una promesa que renovamos en cada kilómetro.· Solidaridad: En C2K Autos, la solidaridad es más que un valor; es un compromiso activo con las personas y las comunidades que nos rodean. Creemos en la importancia de apoyar a quienes más lo necesitan, ya sea a través de iniciativas sociales, programas de inclusión o acciones que promuevan el bienestar común. Para nosotros, ser solidarios significa entender que cada viaje es una oportunidad para hacer la diferencia, ya sea ayudando a un cliente en una situación difícil, colaborando con causas sociales o fomentando un ambiente laboral donde todos se sientan valorados y apoyados. En C2K Autos, no solo movemos autos, movemos vidas.· Compromiso: En C2K Autos, el compromiso es la esencia de nuestra relación con clientes, colaboradores y la comunidad. Nos dedicamos a cumplir lo que prometemos, superando expectativas y actuando con responsabilidad en cada decisión que tomamos. Para nosotros, el compromiso no es solo una palabra, es una acción constante que se refleja en la calidad de nuestros servicios, la atención al cliente y el impacto positivo que generamos en nuestro entorno. Cada auto que entregamos, cada solución que ofrecemos y cada interacción que tenemos está respaldada por un compromiso inquebrantable con la excelencia y la satisfacción de quienes confían en nosotros.· Civismo: En C2K Autos, el civismo es un pilar fundamental de nuestra operación y nuestra relación con la comunidad. Creemos en la importancia de actuar con respeto, responsabilidad y consideración hacia los demás, tanto en la vía como en cada interacción que tenemos. Promovemos una cultura de conducción segura, cumplimiento de las normas de tránsito y respeto por el espacio público, porque entendemos que nuestras acciones impactan no solo a nuestros clientes, sino a toda la sociedad. Para nosotros, el civismo no es solo una obligación, es una forma de contribuir a un entorno más seguro, ordenado y armonioso para todos."
    }
  ];

  return (
    <div className="info-container">
      <h1 className="info-title" >Quienes Somos</h1>
      
      <div className="accordion">
        {accordionData.map((item, index) => (
          <div className="accordion-item" key={index}>
            <div 
              className={`accordion-title ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              <h2>{item.title}</h2>
              <span className="accordion-icon">
                {activeIndex === index ? '−' : '+'}
              </span>
            </div>
            <div 
              className={`accordion-content ${activeIndex === index ? 'active' : ''}`}
            >
              <p>{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Info;