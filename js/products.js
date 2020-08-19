const ORDER_BY_PROD_SOLD_COUNT = 'Relevancia';
const ORDER_BY_PROD_COST = 'Precio';

class ProductsList {
    constructor(productsArray = []) {
        // ====== Propiedades de estado ======

        // En productsArray guardamos el estado incial de los items,
        // nunca lo modificamos.
        this.productsArray = productsArray;

        // filters es un objeto donde guardamos las funciones por las que debe
        // pasar productsArray antes de ser renderizado.

        // Envolvemos filters en un Proxy para volver a renderizar los productos
        // si hay cambios en el mismo.

        const productsList = this;

        this.filters = new Proxy(
            // Objeto filters
            {
                // Ordena los items por relevancia o precio.
                sortProducts() {},
                // Filtra dentro de un rango de precios.
                filterByCost() {},
            },
            // Captura cambios en el Objeto filters
            {
                set(target, key, value) {
                    target[key] = value;
                    productsList.renderProducts();
                    return true;
                },
            }
        );

        // ======== Elementos del DOM ========

        // Inputs para filtrar por rango de precio
        this.minFilter;
        this.maxFilter;

        // Switches para ordenar por precio o relevancia
        this.costIcon;
        this.soldCountIcon;
        this.costSortSwitch = true;
        this.soldCountSortSwitch = true;

        // Container para mostrar los productos
        this.productsContainer;

        // ============= Bindeos =============
        this.toggleCostSort = this.toggleCostSort.bind(this);
        this.toggleSoldCount = this.toggleSoldCount.bind(this);
        this.filterByCost = this.filterByCost.bind(this);
        this.cleanFilters = this.cleanFilters.bind(this);

        // ============= Lógica ==============

        // Ejecutar onInit cuando el DOM esté cargado
        document.readyState === 'complete'
            ? this.onInit()
            : document.addEventListener('DOMContentLoaded', this.onInit);
    }

    onInit() {
        // Operaciones del DOM

        // ====== Seleccionar elementos ======

        // Icono del sort por precio
        const sortByCost = document.getElementById('sortByCost');
        this.costIcon = sortByCost.querySelector('.fas');

        // Icono del sort por relevancia
        const sortBySoldCount = document.getElementById('sortBySoldCount');
        this.soldCountIcon = sortBySoldCount.querySelector('.fas');

        // Inputs de filtro por precio
        this.minFilter = document.getElementById('rangeFilterCountMin');
        this.maxFilter = document.getElementById('rangeFilterCountMax');

        // ======== Preparar eventos =========

        // Clicks en botones de ordenamiento
        sortByCost.addEventListener('click', this.toggleCostSort);
        sortBySoldCount.addEventListener('click', this.toggleSoldCount);

        // Click en botón filtrar
        document
            .getElementById('rangeFilterCount')
            .addEventListener('click', this.filterByCost);

        // Click en botón limpiar
        document
            .getElementById('clearRangeFilter')
            .addEventListener('click', this.cleanFilters);

        // Contenedor para mostrar productos
        this.productsContainer = document.getElementById('prod-list-container');

        // Render inicial de la lista
        this.renderProducts();
    }

    // Función para renderizar productos
    renderProducts() {
        let htmlContentToAppend = '';

        // Obtener array filtrado
        const products = this.filterProducts();

        // Solo se vuelve a renderizar si el array filtrado es distinto al anterior
        this.filteredProducts = products;

        for (let i = 0; i < products.length; i++) {
            let product = products[i];

            htmlContentToAppend += `
                <div class="list-group-item list-group-item-action">
                    <div class="row">
                        <div class="col-3">
                            <img src="${product.imgSrc}" class="img-thumbnail">
                        </div>
                        <div class="col">
                            <div class="d-flex w-100 justify-content-between">
                                <h4 class="mb-1">${product.name}</h4>
                                <small class="font-muted">
                                    <b>${product.currency} $${product.cost}</b><br>
                                    ${product.soldCount} artículos vendidos
                                </small>
                            </div>
                            ${product.description}
                        </div>
                    </div>
                </div>
                `;
        }

        // Animación de mostrar productos
        const transitionTime = 200;

        this.productsContainer.style.transition = `all ${transitionTime}ms`;
        this.productsContainer.style.opacity = '0.25';
        setTimeout(() => {
            htmlContentToAppend &&
                (this.productsContainer.innerHTML = htmlContentToAppend);
            this.productsContainer.style.opacity = '1';
        }, transitionTime);
    }

    // Crea un nuevo array de productos y lo retorna filtrado
    filterProducts() {
        // Crear copia
        let toFilter = [...this.productsArray];

        // Se pasa el array por todos los filtros del objeto filters
        Object.values(this.filters).forEach((filter) => {
            toFilter = filter(toFilter) || toFilter;
        });

        return toFilter;
    }

    // Ordenamiento por precio
    toggleCostSort() {
        // Voltea el ícono del botón
        this.costIcon.style.transform = `scaleY(${
            this.costSortSwitch ? -1 : 1
        })`;

        // Cambia el switch de orden ascendente/descendente
        this.costSortSwitch = !this.costSortSwitch;

        // Agrega el filtro al objeto filters
        this.filters.sortProducts = (toFilter) => {
            return toFilter.sort(({ cost: a }, { cost: b }) =>
                this.costSortSwitch ? a < b : a > b
            );
        };
    }

    // Ordenamiento por relevancia
    toggleSoldCount() {
        // Voltea el ícono del botón
        this.soldCountIcon.style.transform = `scaleY(${
            this.soldCountSortSwitch ? 1 : -1
        })`;

        // Cambia el switch de orden ascendente/descendente
        this.soldCountSortSwitch = !this.soldCountSortSwitch;

        // Agrega el filtro al objeto filters
        this.filters.sortProducts = (toFilter) => {
            return toFilter.sort(({ soldCount: a }, { soldCount: b }) =>
                this.soldCountSortSwitch ? a > b : a < b
            );
        };
    }

    filterByCost() {
        let minValue = this.minFilter.value;
        let maxValue = this.maxFilter.value;

        if (!minValue && !maxValue) {
            this.filters.filterByCost = () => {};
            return;
        } else if (minValue && !maxValue) {
            maxValue = Infinity;
        }

        this.filters.filterByCost = (toFilter) => {
            return toFilter.filter(
                ({ cost }) => minValue <= cost && maxValue >= cost
            );
        };
    }

    // Reiniciar todo a default
    cleanFilters() {
        this.minFilter.value = '';
        this.maxFilter.value = '';

        this.costSortSwitch = true;
        this.costIcon.style.transform = 'scaleY(-1)';
        this.costIcon.parentElement.classList.remove('active');

        this.soldCountSortSwitch = true;
        this.soldCountIcon.style.transform = 'scaleY(1)';
        this.soldCountIcon.parentElement.classList.remove('active');

        this.filters.sortProducts = () => {};
        this.filters.filterByCost = () => {};
    }
}

// Esperamos a que llegue el JSON y luego instanciamos ProductsList
getJSONData(PRODUCTS_URL).then(function (products) {
    if (products.status === 'ok') {
        new ProductsList(products.data);
    }
});
