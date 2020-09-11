// Esperamos a que llegue el JSON y luego instanciamos ProductsList
getJSONData(PRODUCTS_URL).then(function (products) {
    if (products.status === 'ok') {
        new ProductsList(products.data);
    }
});

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
                // Filtro del buscador
                searchFilter() {},
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

        // Input buscador
        this.searchInput;

        // Container para mostrar los productos
        this.productsContainer;

        // ============= Bindeos =============
        this.toggleCostSort = this.toggleCostSort.bind(this);
        this.toggleSoldCount = this.toggleSoldCount.bind(this);
        this.filterByCost = this.filterByCost.bind(this);
        this.search = this.search.bind(this);
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
        const s = document.querySelector.bind(document);

        // Icono del sort por precio
        const sortByCost = s('#sortByCost');
        this.costIcon = s('#sortByCost .fas');

        // Icono del sort por relevancia
        const sortBySoldCount = s('#sortBySoldCount');
        this.soldCountIcon = s('#sortBySoldCount .fas');

        // Inputs de filtro por precio
        this.minFilter = s('#rangeFilterCountMin');
        this.maxFilter = s('#rangeFilterCountMax');

        // Input buscador
        this.searchInput = s('#search');

        // Contenedor para mostrar productos
        this.productsContainer = s('#prod-list-container');

        // ======== Preparar eventos =========

        // Clicks en botones de ordenamiento
        sortByCost.onclick = this.toggleCostSort;
        sortBySoldCount.onclick = this.toggleSoldCount;

        // Click en botón filtrar
        s('#rangeFilterCount').onclick = this.filterByCost;

        // Click en botón limpiar
        s('#clearRangeFilter').onclick = this.cleanFilters;

        // Escribir en el buscador
        this.searchInput.oninput = this.search;

        // Render inicial de la lista
        this.renderProducts();
    }

    // Función para renderizar productos
    renderProducts() {
        let htmlContentToAppend = '';

        // Obtener array filtrado
        const products = this.filterProducts();

        if (!products.length) {
            htmlContentToAppend = '<h2>No se encontraron coincidencias</h2>';
        } else {
            for (let i = 0; i < products.length; i++) {
                let product = products[i];

                htmlContentToAppend += `
                <a href="product-info.html">
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
                </a>
                `;
            }
        }
        // Animación de mostrar productos
        const transitionTime = 200;

        this.productsContainer.style.transition = `all ${transitionTime}ms`;
        this.productsContainer.style.opacity = '0.25';
        setTimeout(() => {
            this.productsContainer.innerHTML = htmlContentToAppend;
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
        this.filters.sortProducts = (products) => {
            return products.sort(({ cost: a }, { cost: b }) =>
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
        this.filters.sortProducts = (products) => {
            return products.sort(({ soldCount: a }, { soldCount: b }) =>
                this.soldCountSortSwitch ? a > b : a < b
            );
        };
    }

    // Filtro por rango de precio
    filterByCost() {
        let minValue = this.minFilter.value;
        let maxValue = this.maxFilter.value;

        if (!minValue && !maxValue) {
            this.filters.filterByCost = () => {};
            return;
        } else if (minValue && !maxValue) {
            maxValue = Infinity;
        }

        // Agrega el filtro al objeto filters
        this.filters.filterByCost = (products) => {
            return products.filter(
                ({ cost }) => minValue <= cost && maxValue >= cost
            );
        };
    }

    // Se busca en el título y la descripción de los artículos, ignorando
    // mayúsculas, espacios, y acentos (tildes)
    search() {
        const searchString = this.searchInput.value
            .toLowerCase()
            .replace(/\s+/g, '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        // Agrega el filtro al objeto filters
        this.filters.searchFilter = (products) =>
            products.filter(
                (product) =>
                    // Juntar strings de título y descripción
                    (product.name + product.description)
                        // Pasar a minúsculas
                        .toLowerCase()
                        // Quitar espacios
                        .replace(/\s+/g, '')
                        // Quitar tildes
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        // Búsqueda
                        .search(searchString) >= 0
            );
    }

    // Reiniciar todo a default
    cleanFilters() {
        this.minFilter.value = '';
        this.maxFilter.value = '';
        this.searchInput.value = '';

        this.costSortSwitch = true;
        this.costIcon.style.transform = 'scaleY(-1)';
        this.costIcon.parentElement.classList.remove('active');

        this.soldCountSortSwitch = true;
        this.soldCountIcon.style.transform = 'scaleY(1)';
        this.soldCountIcon.parentElement.classList.remove('active');

        this.filters.sortProducts = () => {};
        this.filters.filterByCost = () => {};
        this.filters.searchFilter = () => {};
    }
}
