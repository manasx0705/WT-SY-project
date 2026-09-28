// Basic Javascript for student project

let allProducts = [];

// Fetch products from JSON
function loadProducts() {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            
            // If on products page, display them
            if(document.getElementById('products-container')) {
                displayProducts(allProducts);
                
                // If there's a category in URL, filter it
                const urlParams = new URLSearchParams(window.location.search);
                const category = urlParams.get('category');
                const search = urlParams.get('search');
                
                if (category) {
                    document.getElementById('categoryFilter').value = category;
                    filterProducts();
                } else if (search) {
                    document.getElementById('searchInput').value = search;
                    searchProducts();
                }
            }
            
            // If on home page, display featured (first 4)
            if(document.getElementById('featured-products')) {
                displayProducts(allProducts.slice(0, 4), 'featured-products');
            }

            // If on single product page
            if(document.getElementById('single-product')) {
                showProductDetails();
            }
        });
}

// Display products in the grid
function displayProducts(products, containerId = 'products-container') {
    let container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }
    
    products.forEach(product => {
        let card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.category}</p>
            <p class="price">₹${product.price}</p>
            <a href="product.html?id=${product.id}" class="btn">View</a>
            <button onclick="addToCart(${product.id})" class="btn">Add to Cart</button>
        `;
        container.appendChild(card);
    });
}

// Search functionality
function searchProducts() {
    let query = document.getElementById('searchInput').value.toLowerCase();
    
    // Redirect to products page if searching from header
    if(!document.getElementById('products-container')) {
        window.location.href = `products.html?search=${query}`;
        return;
    }

    let filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
    displayProducts(filtered);
}

// Filter and Sort functionality
function filterProducts() {
    let category = document.getElementById('categoryFilter').value;
    let sort = document.getElementById('sortFilter').value;
    
    let filtered = allProducts;
    
    if (category !== 'All') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (sort === 'priceLow') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'priceHigh') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    displayProducts(filtered);
}

// Single Product Page
function showProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    let product = allProducts.find(p => p.id == id);
    if (product) {
        document.getElementById('prodImage').src = product.image;
        document.getElementById('prodName').innerText = product.name;
        document.getElementById('prodCategory').innerText = "Category: " + product.category;
        document.getElementById('prodPrice').innerText = "Price: ₹" + product.price;
        document.getElementById('prodDesc').innerText = product.description;
        
        document.getElementById('addToCartBtn').onclick = function() {
            let qty = parseInt(document.getElementById('prodQty').value);
            addToCart(product.id, qty);
        };
    } else {
        document.getElementById('single-product').innerHTML = "<h2>Product not found</h2>";
    }
}

// Cart Functionality
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let count = 0;
    cart.forEach(item => count += item.qty);
    
    let countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = count;
}

function addToCart(id, qty = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // In products page we might not have loaded allProducts yet if called too fast, but usually it's there
    let product = allProducts.find(p => p.id == id);
    
    // If not found in allProducts (like on a different page), fetch it from local storage temp or re-fetch (simplification: assume allProducts has it)
    if (product) {
        let existing = cart.find(item => item.id == id);
        if (existing) {
            existing.qty += qty;
        } else {
            product.qty = qty;
            cart.push(product);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        alert("Added to cart!");
        updateCartCount();
    }
}

function loadCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let tbody = document.getElementById('cart-body');
    let totalEl = document.getElementById('cart-total');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cart is empty</td></tr>';
        totalEl.innerText = "0";
        return;
    }
    
    cart.forEach((item, index) => {
        let itemTotal = item.price * item.qty;
        total += itemTotal;
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>₹${item.price}</td>
            <td>
                <input type="number" value="${item.qty}" min="1" onchange="updateQty(${index}, this.value)" style="width: 50px;">
            </td>
            <td>₹${itemTotal}</td>
            <td><button onclick="removeItem(${index})" class="btn btn-danger">Remove</button></td>
        `;
        tbody.appendChild(tr);
    });
    
    totalEl.innerText = total;
}

function updateQty(index, newQty) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if(newQty > 0) {
        cart[index].qty = parseInt(newQty);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

// Checkout Functionality
function loadCheckout() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let summary = document.getElementById('order-summary');
    
    if (!summary) return;
    
    if(cart.length === 0) {
        summary.innerHTML = "<p>Cart is empty. Cannot checkout.</p>";
        document.getElementById('checkout-form').style.display = 'none';
        return;
    }
    
    let subtotal = 0;
    let html = "<ul>";
    cart.forEach(item => {
        subtotal += (item.price * item.qty);
        html += `<li>${item.name} (x${item.qty}) - ₹${item.price * item.qty}</li>`;
    });
    html += "</ul><br>";
    
    let shipping = 100;
    let total = subtotal + shipping;
    
    html += `<p>Subtotal: ₹${subtotal}</p>`;
    html += `<p>Shipping: ₹${shipping}</p>`;
    html += `<h3>Total: ₹${total}</h3>`;
    
    summary.innerHTML = html;
}

function placeOrder(e) {
    let cart = localStorage.getItem('cart');
    let cartDataInput = document.getElementById('cart_data');
    if (cartDataInput) {
        cartDataInput.value = cart;
    }
    localStorage.removeItem('cart');
    // Let the form submit naturally to PHP
}

function loadOrders() {
    let container = document.getElementById('orders-container');
    if (!container) return;

    fetch('orders.json')
        .then(response => {
            if(!response.ok) return [];
            return response.json();
        })
        .then(orders => {
            container.innerHTML = '';
            if (!orders || orders.length === 0) {
                container.innerHTML = '<p>You have no orders yet.</p>';
                return;
            }

            // Reverse to show newest first
            orders.reverse().forEach(order => {
                let itemsHtml = order.items.map(item => `${item.name} (x${item.qty})`).join(', ');
                let total = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0) + 100; // adding 100 shipping
                
                let orderHtml = `
                    <div class="admin-container" style="margin-bottom: 20px;">
                        <h3>Order #${order.order_id}</h3>
                        <p><strong>Date:</strong> ${order.date}</p>
                        <p><strong>Products:</strong> ${itemsHtml}</p>
                        <p><strong>Total:</strong> ₹${total} (Includes Shipping)</p>
                        <p><strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">${order.status}</span></p>
                    </div>
                `;
                container.innerHTML += orderHtml;
            });
        })
        .catch(err => {
            container.innerHTML = '<p>Could not load orders.</p>';
        });
}

// Login and Auth stuff
function login(e) {
    e.preventDefault();
    let email = document.getElementById('email').value;
    localStorage.setItem('user', JSON.stringify({email: email, name: "Student Demo User"}));
    window.location.href = "account.html";
}

function register(e) {
    e.preventDefault();
    alert("Registration successful!");
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = "login.html";
}

function checkAuth() {
    let user = JSON.parse(localStorage.getItem('user'));
    
    let accLink = document.getElementById('account-link');
    if (user && accLink) {
        accLink.innerText = "My Account";
        accLink.href = "account.html";
    }
    
    if (document.getElementById('account-details')) {
        if (user) {
            document.getElementById('acc-name').innerText = user.name;
            document.getElementById('acc-email').innerText = user.email;
        } else {
            window.location.href = "login.html";
        }
    }
}

// Initialization
window.onload = function() {
    loadProducts();
    updateCartCount();
    loadCart();
    loadCheckout();
    loadOrders();
    checkAuth();
    
    let checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', placeOrder);
    }
    
    let loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
    
    let regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.addEventListener('submit', register);
    }
};
