import Toastify from "toastify-js";
import "./toast.css";

function showToast(message: string) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
    //   background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
}

export { showToast };
