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
