-- =============================================
-- ELLEL OVERSIZE - Esquema D1
-- =============================================

DROP TABLE IF EXISTS pedido_items;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS carrito;
DROP TABLE IF EXISTS colores;
DROP TABLE IF EXISTS tallas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS ajustes;

-- Ajustes (Contenido editable)
CREATE TABLE ajustes (
  clave TEXT PRIMARY KEY,
  valor TEXT
);

CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  imagen_url TEXT,
  activa INTEGER DEFAULT 1
);

-- Productos
CREATE TABLE productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio REAL NOT NULL,
  precio_oferta REAL,
  categoria_id INTEGER,
  imagen_url TEXT,
  genero TEXT DEFAULT 'unisex',
  destacado INTEGER DEFAULT 0,
  nuevo INTEGER DEFAULT 0,
  estado TEXT DEFAULT 'activo',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Usuarios
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  rol TEXT DEFAULT 'cliente',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tallas
CREATE TABLE tallas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER,
  nombre TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Colores
CREATE TABLE colores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER,
  nombre TEXT NOT NULL,
  hex_code TEXT,
  imagen_url TEXT,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Carrito (Persistencia opcional/admin)
CREATE TABLE carrito (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  producto_id INTEGER,
  talla_id INTEGER,
  color_id INTEGER,
  cantidad INTEGER DEFAULT 1,
  fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Pedidos
CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  total REAL NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  nombre_envio TEXT,
  direccion_envio TEXT,
  telefono_envio TEXT,
  email_envio TEXT,
  notas TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Items de Pedido
CREATE TABLE pedido_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER,
  producto_id INTEGER,
  nombre_producto TEXT,
  talla TEXT,
  color TEXT,
  cantidad INTEGER,
  precio_unitario REAL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- SEED DATA
INSERT INTO categorias (id, nombre, imagen_url) VALUES 
(1, 'Buzos', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600'), 
(2, 'Conjuntos', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'), 
(3, 'Camisetas', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'), 
(4, 'Pantalones', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600');

-- Admin (password: admin123)
-- Hash: h_g10hvh
INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES 
(1, 'Admin Ellel', 'admin@ellel.com', 'h_g10hvh', 'admin');

-- Ajustes iniciales
INSERT INTO ajustes (clave, valor) VALUES 
('quienes_somos', 'Ellel Oversize redefine la comodidad y el estilo urbano.');
