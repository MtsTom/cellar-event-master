Biblioteca
/
PROJECT-actualizado-final.md


🍷 Cellar Event Master
Proyecto Final
Aplicación web para la gestión de eventos en bodegas de Mendoza.

Estado del Proyecto
Progreso general
███████████████████████████████░░

98% Completado

Tecnologías
Backend
Node.js

Express.js

MongoDB Atlas

Mongoose

JWT

bcrypt

Nodemailer

Frontend
HTML5

CSS3

JavaScript (Vanilla)

Arquitectura
Se implementó una arquitectura basada en MVC + Repository Pattern.

Frontend

↓

API REST

↓

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

MongoDB Atlas

Módulos Completados
✅ Módulo 1
Configuración inicial

Express

Variables de entorno

MongoDB Atlas

Estructura del proyecto

✅ Módulo 2
Usuarios

Modelo User

Registro

Validaciones

✅ Módulo 3
Autenticación

Login

JWT

Middleware Protect

Roles

✅ Módulo 4
Bodegas

Crear bodegas

Listar bodegas

Relación con organizadores

✅ Módulo 5
Eventos

Crear eventos

Listar eventos

Capacidad

Precio

Estado

Relación con bodegas

✅ Módulo 6
Reservas

Crear reservas

Cancelar reservas

Listado de reservas

Actualización automática de cupos

✅ Módulo 7
Dashboard Cliente

Ver reservas

Cancelar reservas

Estado de reservas

✅ Módulo 8
Dashboard Organizador

Ver eventos propios

Estadísticas

Personas reservadas

Ingresos

Reservas confirmadas

✅ Módulo 9
Frontend

Login

Eventos

Dashboards

Navegación

Sesiones

✅ Módulo 10
Protección de páginas

Validación de token

Validación de roles

✅ Módulo 11
Dashboard Cliente Web

Visualización

Cancelación

Actualización automática

✅ Módulo 12
Dashboard Organizador Web

Eventos

Estadísticas

Integración con Backend

✅ Módulo 13
Crear Eventos desde la Web

Formulario

Validaciones

Integración con API

✅ Módulo 14
Reservar Eventos desde la Web

Funcionalidades implementadas
Listado de eventos

Botón Reservar

Página de reserva

Consulta individual del evento

Cálculo automático del total

Validación de cupos

Confirmación de reserva

Actualización automática de capacidad

Prevención de doble envío

Mensajes de éxito

Redirección automática

Cancelación de reservas

Actualización correcta de estadísticas del organizador

Arquitectura REST implementada
Eventos
GET /api/events

GET /api/events/

POST /api/events

GET /api/events/my-events

Reservas
POST /api/reservations

GET /api/reservations/my-reservations

PATCH /api/reservations//cancel

Seguridad
✔ JWT

✔ Middleware Protect

✔ Roles

✔ Validaciones

✔ Contraseñas encriptadas

Base de Datos
Colecciones:

Users

Wineries

Events

Reservations

Relaciones mediante ObjectId.

Uso de populate() para obtener información relacionada.

Mejoras implementadas
Repository Pattern

Arquitectura por capas

API REST

Validaciones de negocio

Prevención de reservas inválidas

Actualización automática de cupos

Estadísticas reales del organizador

Mejor experiencia de usuario

Botones con estado de carga

Prevención de doble clic

Mensajes de confirmación

Mejoras visuales finales
Tipografías unificadas en toda la aplicación.

Botones unificados.

Dashboard de cliente mejorado.

Dashboard de organizador mejorado.

Corrección de métricas visuales.

Mejoras responsive.

Ajustes finales de interfaz.

Próximo módulo
✅ Módulo 15
Perfil del usuario

Completado

Ver perfil

Editar nombre y apellido

Cambio opcional de contraseña

Correo y rol de solo lectura

Saludo dinámico con el nombre del usuario

Módulo 16
Registro de usuarios (Pendiente)

Página Registrarse

Selección de rol (Cliente / Organizador)

Conexión con el endpoint de registro

Corregir enlaces "Crear cuenta" y "Registrarse"

Módulo 17
Registro de bodegas (Pendiente)

Formulario desde el panel del organizador

Registrar bodegas sin usar Postman

Mostrar automáticamente las nuevas bodegas al crear eventos

Módulo 18
Carga de imágenes (A revisar)

Verificar requerimiento del PDF

Subida de imágenes para bodegas y/o eventos

Mostrar imágenes en "Bodegas destacadas" si corresponde

Módulo 19
Deploy

Pendiente.

Objetivo Final
Sistema completo de gestión de eventos para bodegas, desarrollado con Node.js, Express, MongoDB Atlas y JavaScript Vanilla siguiendo arquitectura MVC y Repository Pattern.