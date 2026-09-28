// Admin Javascript

let adminProducts = [];

function checkAdminAuth() {
    let admin = localStorage.getItem('admin_logged_in');
    
    // If not logged in and not on login page
    if (!admin && !window.location.pathname.includes('index.html')) {
        window.location.href = "index.html";
    }
    // If logged in and on login page
    if (admin && window.location.pathname.includes('index.html')) {
        window.location.href = "dashboard.html";
    }
}

function adminLogin(e) {
    e.preventDefault();
    let user = document.getElementById('username').value;
    let pass = document.getElementById('password').value;
    
    if (user === "admin" && pass === "admin123") {
        localStorage.setItem('admin_logged_in', 'true');
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials. Try admin / admin123");
    }
}

function adminLogout() {
    localStorage.removeItem('admin_logged_in');
    window.location.href = "index.html";
}

// Simulate fetching JSON then storing in localStorage if not exists, 
// so admin can add/edit/delete locally in browser memory.
function loadAdminProducts() {
    if (!localStorage.getItem('admin_products')) {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('admin_products', JSON.stringify(data));
                adminProducts = data;
                displayManageProducts();
                updateDashboardStats();
            });
    } else {
        adminProducts = JSON.parse(localStorage.getItem('admin_products'));
        displayManageProducts();
        updateDashboardStats();
        setupEditForm();
    }
}

function updateDashboardStats() {
    if(document.getElementById('total-products')) {
        document.getElementById('total-products').innerText = adminProducts.length;
    }
}

function displayManageProducts() {
    let tbody = document.getElementById('manage-products-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    adminProducts.forEach((p, index) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image}" width="50" alt="img"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>₹${p.price}</td>
            <td><a href="edit-product.html?id=${p.id}" class="btn">Edit</a></td>
            <td><button onclick="deleteProduct(${index})" class="btn btn-danger">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteProduct(index) {
    if(confirm("Are you sure you want to delete this product?")) {
        adminProducts.splice(index, 1);
        localStorage.setItem('admin_products', JSON.stringify(adminProducts));
        displayManageProducts();
    }
}

function addProduct(e) {
    e.preventDefault();
    
    let newId = 1;
    if (adminProducts.length > 0) {
        newId = adminProducts[adminProducts.length - 1].id + 1;
    }
    
    let product = {
        id: newId,
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: parseInt(document.getElementById('price').value),
        category: document.getElementById('category').value,
        image: "https://placehold.co/200x200/eee/31343C?text=" + document.getElementById('category').value
    };
    
    adminProducts.push(product);
    localStorage.setItem('admin_products', JSON.stringify(adminProducts));
    
    alert("Product Added Successfully!");
    window.location.href = "manage-products.html";
}

function setupEditForm() {
    let form = document.getElementById('edit-product-form');
    if (!form) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    let product = adminProducts.find(p => p.id == id);
    if(product) {
        document.getElementById('edit_id').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('description').value = product.description;
        document.getElementById('price').value = product.price;
        document.getElementById('category').value = product.category;
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let editId = parseInt(document.getElementById('edit_id').value);
        let index = adminProducts.findIndex(p => p.id === editId);
        
        if (index !== -1) {
            adminProducts[index].name = document.getElementById('name').value;
            adminProducts[index].description = document.getElementById('description').value;
            adminProducts[index].price = parseInt(document.getElementById('price').value);
            adminProducts[index].category = document.getElementById('category').value;
            
            localStorage.setItem('admin_products', JSON.stringify(adminProducts));
            alert("Product Updated!");
            window.location.href = "manage-products.html";
        }
    });
}

window.onload = function() {
    checkAdminAuth();
    loadAdminProducts();
    
    let loginForm = document.getElementById('admin-login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', adminLogin);
    }
    
    let addForm = document.getElementById('add-product-form');
    if(addForm) {
        addForm.addEventListener('submit', addProduct);
    }
};
