/**
 * ADMIN.JS - Ellel Oversize Administration Panel Logic
 */

const API_BASE = '/api';
const AUTH_KEY = 'ellel_token';
const USER_KEY = 'ellel_user';

const state = {
    token: localStorage.getItem(AUTH_KEY),
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    currentView: 'dashboard',
    stats: {}
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    if (!checkAuth()) {
        renderLogin();
        return;
    }

    renderLayout();
    navigate('dashboard');
}

function checkAuth() {
    return state.token && state.user && state.user.rol === 'admin';
}

// --- Navigation ---
window.navigate = async (view) => {
    state.currentView = view;

    // Update active nav
    document.querySelectorAll('.admin-nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.view === view);
    });

    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="loader">Cargando...</div>';

    switch (view) {
        case 'dashboard':
            await renderDashboard();
            break;
        case 'productos':
            await renderProducts();
            break;
        case 'pedidos':
            await renderOrders();
            break;
        case 'ajustes':
            await renderSettings();
            break;
    }
};

// --- API Wrapper ---
const API = {
    async request(path, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {}),
            ...options.headers
        };

        try {
            const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
            const data = await res.json();

            if (res.status === 401 || res.status === 403) {
                logout();
                return null;
            }

            if (!res.ok) throw new Error(data.error || 'API Error');
            return data;
        } catch (err) {
            console.error('API Request Failed:', err);
            alert('Error: ' + err.message);
            return null;
        }
    },
    get: (path) => API.request(path),
    post: (path, body) => API.request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => API.request(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (path, body) => API.request(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path) => API.request(path, { method: 'DELETE' })
};

// --- Auth Functions ---
function renderLogin() {
    const app = document.getElementById('admin-app');
    app.innerHTML = `
        <div class="login-overlay">
            <div class="admin-login-card">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <img src="./src/assets/img/logo-square.png" style="height: 60px; margin-bottom: 1rem;">
                    <h2 class="admin-page-title">Admin Login</h2>
                </div>
                <form id="admin-login-form">
                    <div class="admin-form-group">
                        <label>Email</label>
                        <input type="email" id="login-email" class="admin-input" required placeholder="admin@ellel.com">
                    </div>
                    <div class="admin-form-group">
                        <label>Contraseña</label>
                        <input type="password" id="login-pass" class="admin-input" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="admin-btn admin-btn-primary" style="width: 100%;">ENTRAR AL PANEL</button>
                    <p id="login-error" style="color: #ef4444; font-size: 0.85rem; margin-top: 1rem; text-align: center; display: none;"></p>
                </form>
            </div>
        </div>
    `;

    document.getElementById('admin-login-form').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-pass').value;

        const res = await API.post('/auth/login', { email, password });
        if (res && res.user && res.user.rol === 'admin') {
            state.token = res.token;
            state.user = res.user;
            localStorage.setItem(AUTH_KEY, res.token);
            localStorage.setItem(USER_KEY, JSON.stringify(res.user));
            init();
        } else if (res) {
            document.getElementById('login-error').textContent = 'No tienes permisos de administrador.';
            document.getElementById('login-error').style.display = 'block';
        }
    };
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    state.token = null;
    state.user = null;
    location.reload();
}

// --- Layout & Components ---
function renderLayout() {
    const app = document.getElementById('admin-app');
    app.innerHTML = `
        <div class="admin-layout">
            <aside class="admin-sidebar">
                <a href="/" class="admin-logo">
                    <img src="./src/assets/img/logo-square.png" alt="Logo">
                    <span>Admin Panel</span>
                </a>
                
                <nav class="admin-nav">
                    <a href="javascript:void(0)" class="admin-nav-item" data-view="dashboard" onclick="navigate('dashboard')">
                        <i class="fas fa-chart-pie"></i> Dashboard
                    </a>
                    <a href="javascript:void(0)" class="admin-nav-item" data-view="productos" onclick="navigate('productos')">
                        <i class="fas fa-tshirt"></i> Productos
                    </a>
                    <a href="javascript:void(0)" class="admin-nav-item" data-view="pedidos" onclick="navigate('pedidos')">
                        <i class="fas fa-shopping-bag"></i> Pedidos
                    </a>
                    <a href="javascript:void(0)" class="admin-nav-item" data-view="ajustes" onclick="navigate('ajustes')">
                        <i class="fas fa-cog"></i> Ajustes
                    </a>
                </nav>
                
                <div class="admin-logout">
                    <a href="javascript:void(0)" class="admin-nav-item" onclick="logout()" style="color: #ef4444;">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </a>
                </div>
            </aside>
            
            <main class="admin-main">
                <div id="admin-content"></div>
            </main>
        </div>
    `;
}

// --- Views Implementation ---

async function renderDashboard() {
    const stats = await API.get('/admin/stats');
    if (!stats) return;

    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <div class="admin-view-header">
            <h1 class="admin-page-title">Dashboard</h1>
            <div class="admin-text-muted">Resumen general de la tienda</div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Ventas Totales</div>
                <div class="stat-value">$${stats.ventasTotales.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pedidos Totales</div>
                <div class="stat-value">${stats.totalPedidos}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Productos Activos</div>
                <div class="stat-value">${stats.productosActivos} / ${stats.totalProductos}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Usuarios</div>
                <div class="stat-value">${stats.totalUsuarios}</div>
            </div>
        </div>
        
        <div class="admin-view-header" style="margin-top: 2rem;">
            <h2 class="admin-page-title" style="font-size: 1.4rem;">Actividad Reciente</h2>
        </div>
        <p class="admin-text-muted">Selecciona una sección en el menú lateral para gestionar los datos.</p>
    `;
}

async function renderProducts() {
    const products = await API.get('/admin/productos');
    if (!products) return;

    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <div class="admin-view-header">
            <h1 class="admin-page-title">Productos</h1>
            <button class="admin-btn admin-btn-primary" onclick="openProductModal()">+ NUEVO PRODUCTO</button>
        </div>
        
        <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td><img src="${p.imagen_url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;"></td>
                            <td><strong>${p.nombre}</strong></td>
                            <td>${p.categoria_nombre || 'Sin categoría'}</td>
                            <td>$${p.precio.toFixed(2)} ${p.precio_oferta ? `<span style="color: #10b981; font-size: 0.8rem;">($${p.precio_oferta})</span>` : ''}</td>
                            <td><span class="badge" style="background: ${p.estado === 'activo' ? '#10b981' : '#64748b'}; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem;">${p.estado.toUpperCase()}</span></td>
                            <td>
                                <button class="admin-btn" onclick="openProductModal(${JSON.stringify(p).replace(/"/g, '&quot;')})" style="padding: 8px;"><i class="fas fa-edit"></i></button>
                                <button class="admin-btn" onclick="deleteProduct(${p.id})" style="padding: 8px; color: #ef4444;"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderOrders() {
    const orders = await API.get('/admin/pedidos');
    if (!orders) return;

    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <div class="admin-view-header">
            <h1 class="admin-page-title">Pedidos</h1>
        </div>
        
        <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr>
                            <td>#${o.id}</td>
                            <td>
                                <strong>${o.nombre_envio}</strong><br>
                                <span style="font-size: 0.8rem; color: var(--admin-text-muted);">${o.email_envio}</span>
                            </td>
                            <td>$${o.total.toFixed(2)}</td>
                            <td>${new Date(o.fecha).toLocaleDateString()}</td>
                            <td>
                                <select onchange="updateOrderStatus(${o.id}, this.value)" class="admin-input" style="padding: 4px 8px; width: auto;">
                                    <option value="pendiente" ${o.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                                    <option value="procesando" ${o.estado === 'procesando' ? 'selected' : ''}>Procesando</option>
                                    <option value="enviado" ${o.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
                                    <option value="entregado" ${o.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
                                    <option value="cancelado" ${o.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                                </select>
                            </td>
                            <td>
                                <button class="admin-btn" onclick="viewOrderDetails(${o.id})" style="padding: 8px;"><i class="fas fa-eye"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderSettings() {
    const ajustes = await API.get('/ajustes');
    if (!ajustes) return;

    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <div class="admin-view-header">
            <h1 class="admin-page-title">Ajustes de Tienda</h1>
        </div>
        
        <div style="max-width: 600px; background: white; padding: 2rem; border-radius: 20px;">
            <form id="settings-form">
                <div class="admin-form-group">
                    <label>Quiénes Somos</label>
                    <textarea id="set-about" class="admin-input" rows="8">${ajustes.quienes_somos || ''}</textarea>
                </div>
                <button type="submit" class="admin-btn admin-btn-primary">GUARDAR AJUSTES</button>
            </form>
        </div>
    `;

    document.getElementById('settings-form').onsubmit = async (e) => {
        e.preventDefault();
        const value = document.getElementById('set-about').value;
        await API.put('/ajustes', { quienes_somos: value });
        alert('Ajustes guardados');
    };
}

// --- Dynamic Modal / Actions ---

window.updateOrderStatus = async (id, status) => {
    await API.patch(`/admin/pedidos/${id}/estado`, { estado: status });
    alert('Pedido actualizado');
};

window.deleteProduct = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        await API.delete(`/admin/productos/${id}`);
        navigate('productos');
    }
};

window.openProductModal = (product = null) => {
    // Basic implementation for now - could be a real modal
    const val = prompt('ESTO ES UNA DEMO - En una app real abriríamos un modal completo con todos los campos.\n\nIngrese nuevo nombre si desea editar:', product ? product.nombre : '');
    if (val && product) {
        // Update demo
        API.put(`/admin/productos/${product.id}`, { ...product, nombre: val }).then(() => navigate('productos'));
    }
};

window.viewOrderDetails = (id) => {
    alert('Viendo detalles del pedido #' + id + '\n\nEn una app real abriríamos un modal con los artículos comprados.');
};
