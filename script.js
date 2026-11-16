
// Load saved data from browser storage
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

// Save all data
function saveData() {
    localStorage.setItem("customers", JSON.stringify(customers));
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("orders", JSON.stringify(orders));
}

// Change dashboard sections
function showSection(sectionName) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(sectionName).classList.remove("hidden");

    document.querySelectorAll(".sidebar nav a").forEach(link => {
        link.classList.remove("active");
    });

    const links = document.querySelectorAll(".sidebar nav a");
    links.forEach(link => {
        if (link.getAttribute("onclick")?.includes(sectionName)) {
            link.classList.add("active");
        }
    });

    if (sectionName === "dashboard") {
        document.querySelector(".sidebar nav a").classList.add("active");
    }

    updateDashboard();
}

// Add a customer
function addCustomer() {
    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();

    if (!name || !email || !phone) {
        alert("Please fill all customer details.");
        return;
    }

    customers.push({
        id: Date.now(),
        name: name,
        email: email,
        phone: phone
    });

    saveData();
    renderCustomers();
    updateDropdowns();

    document.getElementById("customerName").value = "";
    document.getElementById("customerEmail").value = "";
    document.getElementById("customerPhone").value = "";

    alert("Customer added successfully!");
}

// Delete a customer
function deleteCustomer(id) {
    if (!confirm("Delete this customer?")) return;

    customers = customers.filter(customer => customer.id !== id);

    // Remove their orders too
    orders = orders.filter(order => order.customerId !== id);

    saveData();
    renderCustomers();
    renderOrders();
    updateDropdowns();
}

// Add a product
function addProduct() {
    const name = document.getElementById("productName").value.trim();
    const price = Number(document.getElementById("productPrice").value);

    if (!name || price <= 0 || !Number.isFinite(price)) {
        alert("Enter a product name and a valid price.");
        return;
    }

    products.push({
        id: Date.now(),
        name: name,
        price: price
    });

    saveData();
    renderProducts();
    updateDropdowns();

    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";

    alert("Product added successfully!");
}

// Delete a product
function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    products = products.filter(product => product.id !== id);

    // Remove orders containing this product
    orders = orders.filter(order => order.productId !== id);

    saveData();
    renderProducts();
    renderOrders();
    updateDropdowns();
}

// Create an order
function addOrder() {
    const customerId = Number(document.getElementById("orderCustomer").value);
    const productId = Number(document.getElementById("orderProduct").value);

    const customer = customers.find(item => item.id === customerId);
    const product = products.find(item => item.id === productId);

    if (!customer || !product) {
        alert("Please select a customer and a product.");
        return;
    }

    orders.push({
        id: Date.now(),
        customerId: customer.id,
        customerName: customer.name,
        productId: product.id,
        productName: product.name,
        amount: product.price,
        status: "Completed"
    });

    saveData();
    renderOrders();
    updateDropdowns();

    alert("Order created successfully!");
}

// Show customers
function renderCustomers() {
    const table = document.getElementById("customerTable");

    table.innerHTML = "";

    customers.forEach(customer => {
        table.innerHTML += `
            <tr>
                <td>${escapeHTML(customer.name)}</td>
                <td>${escapeHTML(customer.email)}</td>
                <td>${escapeHTML(customer.phone)}</td>
                <td>
                    <button class="delete-btn"
                    onclick="deleteCustomer(${customer.id})">
                    Delete
                    </button>
                </td>
            </tr>
        `;
    });

    updateDashboard();
    updateDropdowns();
}

// Show products
function renderProducts() {
    const table = document.getElementById("productTable");

    table.innerHTML = "";

    products.forEach(product => {
        table.innerHTML += `
            <tr>
                <td>${escapeHTML(product.name)}</td>
                <td>₹${product.price.toLocaleString("en-IN")}</td>
                <td>
                    <button class="delete-btn"
                    onclick="deleteProduct(${product.id})">
                    Delete
                    </button>
                </td>
            </tr>
        `;
    });

    updateDashboard();
    updateDropdowns();
}

// Show orders
function renderOrders() {
    const table = document.getElementById("orderTable");

    table.innerHTML = "";

    orders.forEach(order => {
        table.innerHTML += `
            <tr>
                <td>${escapeHTML(order.customerName)}</td>
                <td>${escapeHTML(order.productName)}</td>
                <td>₹${order.amount.toLocaleString("en-IN")}</td>
                <td>${order.status}</td>
            </tr>
        `;
    });

    updateDashboard();
    updateDropdowns();
}

// Refresh dropdowns
function updateDropdowns() {
    const customerSelect = document.getElementById("orderCustomer");
    const productSelect = document.getElementById("orderProduct");

    customerSelect.innerHTML = '<option value="">Select Customer</option>';
    productSelect.innerHTML = '<option value="">Select Product</option>';

    customers.forEach(customer => {
        customerSelect.innerHTML += `
            <option value="${customer.id}">${escapeHTML(customer.name)}</option>
        `;
    });

    products.forEach(product => {
        productSelect.innerHTML += `
            <option value="${product.id}">${escapeHTML(product.name)}</option>
        `;
    });
}

// Prevent user-entered text from becoming HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Update dashboard statistics
function updateDashboard() {
    document.getElementById("customerCount").textContent = customers.length;
    document.getElementById("productCount").textContent = products.length;
    document.getElementById("orderCount").textContent = orders.length;

    const revenue = orders.reduce((total, order) => {
        return total + order.amount;
    }, 0);

    document.getElementById("revenue").textContent =
        "₹" + revenue.toLocaleString("en-IN");

    const recent = document.getElementById("recentCustomers");

    if (customers.length === 0) {
        recent.innerHTML = '<tr><td colspan="3">No customers added yet.</td></tr>';
    } else {
        recent.innerHTML = customers.slice(-5).reverse().map(customer => `
            <tr>
                <td>${escapeHTML(customer.name)}</td>
                <td>${escapeHTML(customer.email)}</td>
                <td>${escapeHTML(customer.phone)}</td>
            </tr>
        `).join("");
    }

    document.getElementById("reportSummary").textContent =
        `You have ${customers.length} customers, ${products.length} products, ` +
        `${orders.length} orders and ₹${revenue.toLocaleString("en-IN")} in revenue.`;
}

// Start the application
function initCRM() {
    renderCustomers();
    renderProducts();
    renderOrders();
    updateDropdowns();
    updateDashboard();
}

initCRM();
