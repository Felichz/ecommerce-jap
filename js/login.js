const domElements = {
    form: 'form.signin',
    submitButton: 'button[type="submit"]',
    emailInput: 'input[name="email"]',
    pwdInput: 'input[name="password"]',
    errorElement: '#error-element',
    loader: '.loader',
    inputs: 'input[]',
};

const errorMessages = {
    'auth/invalid-email': 'Email inválido',
    'auth/wrong-password': 'Datos incorrectos',
    'auth/user-not-found': 'Datos incorrectos',
    'auth/too-many-requests': 'Demasiados intentos, intente más tarde',
};

//Función que se ejecuta una vez que se haya lanzado el evento de
//que el documento se encuentra cargado, es decir, se encuentran todos los
//elementos HTML presentes.
document.addEventListener('DOMContentLoaded', function () {
    selectDomElements(domElements, (element, idx) => {
        window[idx] = element;
    });

    form.addEventListener('submit', onSubmit);
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
            .signInWithEmailAndPassword(emailInput.value, pwdInput.value)
            .then(() => {
                loadingOff();
            })
            .catch(function (error) {
                loadingOff();

                showError(errorMessages[error.code] || 'Error');
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

function selectDomElements(domElements, callback) {
    for (element in domElements) {
        let currentElement;
        if (domElements[element].endsWith('[]')) {
            currentElement = document.querySelectorAll(
                domElements[element].slice(0, -2)
            );
        } else {
            currentElement = document.querySelector(domElements[element]);
        }

        callback(currentElement, element);
    }
}
