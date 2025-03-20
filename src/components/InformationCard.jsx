import './components.css';
const cardInfo=[
    {
        title: 'Soporte 24/7',
        icon: '🔧',
        image: 'path/to/image1.png',
        description: 'En C2K Autos, nunca estarás solo. Nuestro equipo está disponible las 24 horas del día, los 7 días de la semana, para asistirte en carretera, resolver tus dudas o ayudarte en emergencias. Llámanos o escríbenos por WhatsApp.'
    },
    {
        title: 'Precios transparentes',
        icon: '💡',
        image: 'path/to/image2.png', // Reemplaza con la ruta de la imagen
        description: 'Sin letras pequeñas, sin sorpresas. En C2K Autos, creemos en la honestidad: todas nuestras tarifas incluyen seguro, mantenimiento e impuestos. ¡Sabrás exactamente lo que pagas desde el primer clic!',
      },
      {
        title: 'Entrega estimada en 30 minutos',
        icon: '🚗',
        image: 'path/to/image3.png', // Reemplaza con la ruta de la imagen
        description: '¿Necesitas un auto rápido? Lo tendrás en menos de 30 minutos. Elige tu ubicación (aeropuerto, hotel o domicilio) y nosotros llevamos el auto hasta ti. ¡Tu tiempo es valioso, y lo respetamos!',
      },
];

const InformationCard = () => {
    return (
        <section className="section-three">
          {cardInfo.map((card, index) => (
            <div className="card" key={index}>
              <div className="card-icon">{card.icon}</div>
              <h3 className="card-title">{card.title}</h3>
              <img src={card.image} alt={card.title} className="card-image" />
              <p className="card-description">{card.description}</p>
            </div>
          ))}
        </section>
      );
    };
    
    export default InformationCard;
