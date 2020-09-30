const UYU_TO_USD = 40;

const s = document.querySelector.bind(document);
const sAll = document.querySelectorAll.bind(document);

const cartProductList = s('#cart-products'),
    totalElement = s('#cart-total'),
    totalProductCountElement = s('#total-product-count');

let products;
let totalProductCount = 0;
let total;

getJSONData(CART_INFO_URL).then(({ data }) => {
    products = data.articles;
    updateTotal();
    showCartProducts();
});

function updateTotal() {
    total = products.reduce((accum, product) => {
        let total = accum + product.count * product.unitCost;

        if (product.currency === 'UYU') {
            total /= UYU_TO_USD;
        }

        return total;
    }, 0);

    totalElement.innerHTML = `${products[0].currency} ${total}`;
}

function updateSubtotal(idx) {
    let subtotal;

    subtotal = products[idx].count * products[idx].unitCost;

    if (products[idx].currency === 'UYU') {
        subtotal /= UYU_TO_USD;
    }

    document.getElementById(`product-subtotal-${idx}`).innerHTML =
        'USD ' + subtotal;
}

function showCartProducts() {
    cartProductList.innerHTML = products.reduce((currentHtml, product, idx) => {
        // totalProductCount += product.count;
        totalProductCount++;

        return (
            currentHtml +
            `
              <div class="cart-product" min="0">
                <div id="product-left-info">
                  <li class="list-group-item">
                    <img src="${product.src}" />
                    ${product.name}
                    <span class="badge badge-primary" id="product-count-badge-${idx}">${product.count}</span>
                  </li>
                  <p class="product-unitprice">Precio por unidad: ${product.currency} ${product.unitCost}</p>
                </div>
                <div id="product-right-info">
                Subtotal: <span id="product-subtotal-${idx}">0</span>
                <br/>
                Cantidad: <input type="number" class="product-count-input" data-product-idx="${idx}" value="${product.count}" min="0"/>
                </div>
                </div>
            `
        );
    }, '');

    totalProductCountElement.innerHTML = totalProductCount;

    for (let productCountInput of sAll('.product-count-input')) {
        const idx = productCountInput.dataset.productIdx;

        updateSubtotal(idx);

        productCountInput.addEventListener('input', ({ target }) => {
            products[idx].count = +target.value;

            document.getElementById(
                `product-count-badge-${idx}`
            ).innerHTML = +target.value;

            updateSubtotal(idx);
            updateTotal();
        });
    }
}
