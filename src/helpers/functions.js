import Swal from "sweetalert2";

export function generateToken(){
    //Con el fin de evitar que el token sea predecible, se generan dos cadenas
    //aleatorias y se concatenan en una sola cadena.
    //Esto hace que el token sea más difícil de adivinar y aumenta su seguridad.
    return "token" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateAdminCode(){
    return "ADMIN " + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

export function generateAssessorCode(){
    return "ASESOR " + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}



export function redirectionAlert(fn, tittle, messaje, icon, url){
    let timerInterval;
    Swal.fire({
        title: tittle,
        html: messaje,
        timer: 2000,
        icon: icon,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            // Verificar si existe el elemento antes de intentar modificarlo
            const timer = Swal.getPopup().querySelector("b");
            if (timer) {
                timerInterval = setInterval(() => {
                    timer.textContent = `${Swal.getTimerLeft()}`;
                }, 100);
            }
        },
        willClose: () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            fn(url)
        }
    })
}

export function genericAlert(tittle, messaje, icon){
    Swal.fire({
        title: tittle,
        text: messaje,
        icon: icon,
    })
}

export function moveToLogin(){
    // Verificar si los elementos existen antes de modificarlos
    const formLink = document.querySelector(".form_link");
    const formLogin = document.querySelector(".form_login");
    
    if (formLink) {
        formLink.style.display = "none";
    }
    if (formLogin) {
        formLogin.style.display = "grid";
    }
}