import './components.css' 
const ButtonForm = ({content,onClick}) => {
  return (
    <button className="form_btn" type="button" onClick={onClick}>{content}</button>
  );
}
export default ButtonForm;