import './components.css' 
const ButtonForm = ({content,onClick, disabled}) => {
  return (
    <button className="form_btn" type="button" disabled={disabled} onClick={onClick}>{content}</button>
  );
}
export default ButtonForm;