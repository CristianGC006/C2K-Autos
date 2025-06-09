import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "./rental-form.css";

function RentalFormComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const vehicle = location.state?.vehicle;
  
  const [formData, setFormData] = useState({
    rentalDays: 1,
    paymentMethod: "CREDIT_CARD",
    startDate: new Date().toISOString().split('T')[0],
    endDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});

  // Cargar información del usuario
  useEffect(() => {
    const storedUser = localStorage.getItem("User");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);