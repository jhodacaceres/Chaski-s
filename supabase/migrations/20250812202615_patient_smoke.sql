-- Datos de muestra para la aplicación Chaski
-- Ejecuta estas consultas en el SQL Editor de Supabase

-- 1. Primero necesitas registrar usuarios a través de la aplicación o manualmente
-- Estos son los usuarios que vamos a usar (debes registrarlos primero):
-- Email: demo@chaski.com, Password: password123
-- Email: vendedor@chaski.com, Password: password123
-- Email: admin@chaski.com, Password: password123

-- 2. Después de registrar los usuarios, actualiza sus perfiles
-- (Reemplaza los UUIDs con los IDs reales de los usuarios registrados)

-- Ejemplo de cómo insertar perfiles (ajusta los UUIDs según tus usuarios reales):
-- INSERT INTO public.profiles (id, name, role, address, phone_number) VALUES
-- ('uuid-del-usuario-demo', 'Usuario Demo', 'buyer', 'Av. Heroínas 123, Cochabamba', '70123456'),
-- ('uuid-del-usuario-vendedor', 'Vendedor Demo', 'seller', 'Av. América 456, Cochabamba', '70654321'),
-- ('uuid-del-usuario-admin', 'Admin Demo', 'admin', 'Plaza 14 de Septiembre, Cochabamba', '70987654');

-- 3. Crear tiendas de ejemplo (ajusta owner_id con el UUID del vendedor)
INSERT INTO public.stores (name, description, images, address, owner_id, is_active) VALUES
('Tienda Tech', 'Los mejores productos tecnológicos de Cochabamba', 
 ARRAY['https://images.pexels.com/photos/1187765/pexels-photo-1187765.jpeg?auto=compress&cs=tinysrgb&w=400'], 
 'Av. América 123, Cochabamba', 
 'REEMPLAZAR-CON-UUID-DEL-VENDEDOR', 
 true),
('Moda Boliviana', 'Ropa tradicional y moderna', 
 ARRAY['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400'], 
 'Calle España 456, Cochabamba', 
 'REEMPLAZAR-CON-UUID-DEL-VENDEDOR', 
 true);

-- 4. Crear productos de ejemplo (ajusta store_id con los UUIDs de las tiendas creadas)
INSERT INTO public.products (name, description, price, images, store_id, category, stock, is_active) VALUES
('iPhone 15 Pro', 'El último iPhone con tecnología avanzada', 1299.99, 
 ARRAY['https://images.pexels.com/photos/1187765/pexels-photo-1187765.jpeg?auto=compress&cs=tinysrgb&w=400',
       'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400'], 
 'REEMPLAZAR-CON-UUID-DE-TIENDA-TECH', 'Tecnología', 10, true),

('MacBook Air M3', 'Laptop ultradelgada con chip M3', 1199.99, 
 ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400'], 
 'REEMPLAZAR-CON-UUID-DE-TIENDA-TECH', 'Tecnología', 5, true),

('AirPods Pro', 'Auriculares inalámbricos con cancelación de ruido', 249.99, 
 ARRAY['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400'], 
 'REEMPLAZAR-CON-UUID-DE-TIENDA-TECH', 'Tecnología', 20, true),

('Pollera Tradicional', 'Pollera boliviana hecha a mano', 89.99, 
 ARRAY['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400'], 
 'REEMPLAZAR-CON-UUID-DE-TIENDA-MODA', 'Ropa', 15, true),

('Aguayo Artesanal', 'Aguayo tejido a mano con diseños tradicionales', 29.99, 
 ARRAY['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400'], 
 'REEMPLAZAR-CON-UUID-DE-TIENDA-MODA', 'Ropa', 30, true),

('Sombrero de Cholita', 'Sombrero tradicional paceño', 45.99, 
 ARRAY['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400'], 
 'REEMPLAZAR-CON-UUID-DE-TIENDA-MODA', 'Accesorios', 12, true);

-- NOTA IMPORTANTE:
-- Antes de ejecutar estas consultas, necesitas:
-- 1. Registrar usuarios en la aplicación
-- 2. Obtener sus UUIDs de la tabla auth.users
-- 3. Reemplazar los placeholders con los UUIDs reales