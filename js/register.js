let loginForm;
let submitButton;
let emailInput;
let pwdInput;
let inputs;
let errorElement;
let loader;

//Función que se ejecuta una vez que se haya lanzado el evento de
//que el documento se encuentra cargado, es decir, se encuentran todos los
//elementos HTML presentes.
document.addEventListener('DOMContentLoaded', function () {
    loginForm = document.forms['login'];
    submitButton = document.querySelector('button[type="submit"]');
    emailInput = document.querySelector('input[name="email"]');
    pwdInput = document.querySelector('input[name="password"]');
    inputs = loginForm.getElementsByTagName('input');
    errorElement = document.getElementById('error-element');
    loader = document.querySelector('.loader');

    loginForm.addEventListener('submit', onSubmit);
});

function onSubmit(e) {
    e.preventDefault();
    let hasErrors = false;

    for (input of inputs) {
        if (!input.value) {
            hasErrors = true;

            showError(`Todos los campos son requeridos`);
            input.style.boxShadow =
                '0px 0px 2px red, 0px 0px 2px red, 0px 0px 2px red';
        } else {
            input.style.boxShadow = '';
        }
    }

    if (!hasErrors) {
        loadingOn();

        firebase
            .auth()
            .createUserWithEmailAndPassword(emailInput.value, pwdInput.value)
            .catch(function (error) {
                loadingOff();

                showError('Formulario inválido');
            });
    }
}

function showError(message) {
    errorElement.getElementsByTagName('h4')[0].innerHTML = message;
    errorElement.style.display = 'block';
}

function loadingOn() {
    loader.style.opacity = 1;
    submitButton.style.backgroundColor = '#EEE';
    submitButton.style.boxShadow = '0px 0px 2px #AAA';
}

function loadingOff() {
    loader.style.opacity = 0;
    submitButton.style.backgroundColor = 'white';
    submitButton.style.boxShadow = 'none';
}
