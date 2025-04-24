import Swal from "sweetalert2";

export function generateToken(){
    //Con el fin de evitar que el token sea predecible, se generan dos cadenas
    //aleatorias y se concatenan en una sola cadena.
    //Esto hace que el token sea más difícil de adivinar y aumenta su seguridad.
    return "token" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
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