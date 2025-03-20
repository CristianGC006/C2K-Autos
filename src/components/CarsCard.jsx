import './components.css'
const CarsCard = ({ carImg }) => {
    return (
        <div className="cars-card">
            <img src={carImg} alt="car" />
        </div>
    )
}

export default CarsCard;