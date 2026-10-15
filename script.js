const WHATSAPP_NUMBER = "220833104397";

const defaultProducts = [
    {
        id: 1,
        name: "Elegant Dress",
        description: "A stylish outfit for different occasions.",
        price: 750,
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 2,
        name: "Beautiful Fabric",
        description: "Fashionable fabric for your clothing needs.",
        price: 500,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 3,
        name: "Ladies Fashion",
        description: "A beautiful style for your wardrobe.",
        price: 900,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80"
    }
];

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

let products = loadData("rawdaProducts", defaultProducts);
let cart = loadData("rawdaCart", []);

function saveProducts() {
    try {
        localStorage.setItem("rawdaProducts", JSON.stringify(products));
        return true;
    } catch (error) {
        alert("Could not save the clothes. The photo may be too large. Try a smaller photo.");
        return false;
    }
}

function saveCart() {
    try {
        localStorage.setItem("rawdaCart", JSON.stringify(cart));
    } catch (error) {
        console.error("Could not save the shopping cart.", error);
    }
}

function formatPrice(amount) {
    return "D" + Number(amount).toFixed(2);
}

function displayProducts() {
    const productList = document.getElementById("product-list");

    if (!productList) return;

    productList.innerHTML = products.map(function (product) {
        return `
            <article class="product-card">
                <img
                    class="product-image"
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <p class="product-price">Price: ${formatPrice(product.price)}</p>

                    <div class="product-actions">
                        <button
                            type="button"
                            class="btn add-button"
                            data-product-id="${product.id}"
                        >Add to Order</button>

                        <button
                            type="button"
                            class="btn delete-button"
                            data-product-id="${product.id}"
                        >Delete Clothes</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function addToCart(productId) {
    const product = products.find(function (item) {
        return item.id === productId;
    });

    if (!product) return;

    const existingItem = cart.find(function (item) {
        return item.id === productId;
    });

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    renderCart();
    showMessage(product.name + " added to your order.");
}

function changeQuantity(productId, change) {
    const item = cart.find(function (product) {
        return product.id === productId;
    });

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(function (product) {
            return product.id !== productId;
        });
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(function (item) {
        return item.id !== productId;
    });

    saveCart();
    renderCart();
    showMessage("Product removed from your order.");
}

function renderCart() {
    const orderList = document.getElementById("order-list");
    const cartTotal = document.getElementById("cart-total");

    if (!orderList || !cartTotal) return;

    if (cart.length === 0) {
        orderList.innerHTML =
            '<p class="empty-cart">Your order is currently empty.</p>';

        cartTotal.textContent = formatPrice(0);
        return;
    }

    orderList.innerHTML = cart.map(function (item) {
        return `
            <div class="order-item">
                <div>
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-price">
                        Price: ${formatPrice(item.price)} each
                    </div>
                    <div>Quantity: ${item.quantity}</div>
                    <div>Subtotal: ${formatPrice(item.price * item.quantity)}</div>
                </div>

                <div class="order-item-controls">
                    <button
                        type="button"
                        class="quantity-button"
                        data-action="decrease"
                        data-product-id="${item.id}"
                        aria-label="Decrease quantity"
                    >−</button>

                    <span>${item.quantity}</span>

                    <button
                        type="button"
                        class="quantity-button"
                        data-action="increase"
                        data-product-id="${item.id}"
                        aria-label="Increase quantity"
                    >+</button>

                    <button
                        type="button"
                        class="remove-button"
                        data-action="remove"
                        data-product-id="${item.id}"
                    >Remove</button>
                </div>
            </div>
        `;
    }).join("");

    const total = cart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    cartTotal.textContent = formatPrice(total);
}

function showMessage(message) {
    const messageElement = document.getElementById("cart-message");

    if (messageElement) {
        messageElement.textContent = message;
    }
}

function checkoutWhatsApp() {
    if (cart.length === 0) {
        showMessage("Please add a product to your order first.");
        return;
    }

    const total = cart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    let message =
        "Hello Rawda's Clothing! I would like to place an order:\n\n";

    cart.forEach(function (item) {
        message += item.name + " x " + item.quantity +
            " = " + formatPrice(item.price * item.quantity) + "\n";
    });

    message += "\nTotal: " + formatPrice(total);
    message += "\n\nPlease confirm product availability and delivery or collection details.";

    const whatsappURL = "https://wa.me/" + WHATSAPP_NUMBER +
        "?text=" + encodeURIComponent(message);

    window.open(whatsappURL, "_blank", "noopener,noreferrer");
}

function setupWebsite() {
    displayProducts();
    renderCart();

    const productList = document.getElementById("product-list");

    if (productList) {
        productList.addEventListener("click", function (event) {
            const deleteButton = event.target.closest(".delete-button");

            if (deleteButton) {
                const productId = Number(deleteButton.dataset.productId);
                const product = products.find(function (item) {
                    return item.id === productId;
                });

                if (!product) return;

                if (!confirm("Are you sure you want to delete " + product.name + "?")) {
                    return;
                }

                const oldProducts = products.slice();

                products = products.filter(function (item) {
                    return item.id !== productId;
                });

                if (!saveProducts()) {
                    products = oldProducts;
                    return;
                }

                cart = cart.filter(function (item) {
                    return item.id !== productId;
                });

                saveCart();
                displayProducts();
                renderCart();
                showMessage(product.name + " has been deleted.");
                return;
            }

            const addButton = event.target.closest(".add-button");

            if (addButton) {
                addToCart(Number(addButton.dataset.productId));
            }
        });
    }

    const orderList = document.getElementById("order-list");

    if (orderList) {
        orderList.addEventListener("click", function (event) {
            const button = event.target.closest("[data-action]");

            if (!button) return;

            const productId = Number(button.dataset.productId);
            const action = button.dataset.action;

            if (action === "increase") {
                changeQuantity(productId, 1);
            } else if (action === "decrease") {
                changeQuantity(productId, -1);
            } else if (action === "remove") {
                removeFromCart(productId);
            }
        });
    }

    const checkoutButton = document.getElementById("checkout-button");

    if (checkoutButton) {
        checkoutButton.addEventListener("click", checkoutWhatsApp);
    }

    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const showFormButton = document.getElementById("show-add-form");
    const addForm = document.getElementById("add-clothes-form");
    const cancelButton = document.getElementById("cancel-add-form");

    if (showFormButton && addForm) {
        showFormButton.addEventListener("click", function () {
            addForm.hidden = false;
        });
    }

    if (cancelButton && addForm) {
        cancelButton.addEventListener("click", function () {
            addForm.hidden = true;
        });
    }

    if (addForm) {
        addForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("clothes-name").value.trim();
            const description = document.getElementById("clothes-description").value.trim();
            const price = Number(document.getElementById("clothes-price").value);
            const imageInput = document.getElementById("clothes-image");
            const file = imageInput.files[0];

            if (!name || !description || !Number.isFinite(price) ||
                price <= 0 || !file) {
                alert("Please enter a name, description, valid price, and photo.");
                return;
            }

            if (!file.type.startsWith("image/")) {
                alert("Please select an image file.");
                return;
            }

            const reader = new FileReader();

            reader.onload = function () {
                const newProduct = {
                    id: Date.now(),
                    name: name,
                    description: description,
                    price: price,
                    image: reader.result
                };

                products.push(newProduct);

                if (!saveProducts()) {
                    products.pop();
                    return;
                }

                displayProducts();
                addForm.reset();
                addForm.hidden = true;

                alert("New clothes added and saved successfully!");
            };

            reader.onerror = function () {
                alert("The photo could not be read. Please try another photo.");
            };

            reader.readAsDataURL(file);
        });
    }
}

document.addEventListener("DOMContentLoaded", setupWebsite);