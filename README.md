# Sistema de Pagos E-commerce

Este proyecto implementa un sistema completo de pagos para e-commerce, con un backend desarrollado en NestJS y un frontend en React. El sistema permite la gestión de productos, sesiones de pago y transacciones, integrándose con la pasarela de pagos.

## Arquitectura del Sistema

El proyecto está dividido en dos componentes principales:

### Backend (NestJS)

- **Tecnología**: NestJS (Framework de Node.js)
- **Base de datos**: PostgreSQL
- **Despliegue**: Google Cloud Run
- **Características principales**:
  - API RESTful para gestión de productos y pagos
  - Integración con pasarela de pagos
  - Manejo de sesiones de pago y transacciones
  - Validación y seguridad con Helmet

### Frontend (React)

- **Tecnología**: React + TypeScript + Vite
- **Despliegue**: Firebase Hosting
- **Características principales**:
  - Interfaz de usuario para selección de productos
  - Formulario de pago integrado
  - Gestión de estado de transacciones
  - Diseño responsive

## Diagramas del Sistema

El proyecto incluye los siguientes diagramas para facilitar la comprensión de su arquitectura y funcionamiento:

### Diagrama de Clases

El [diagrama de clases](./diagrama-clases.md) muestra la estructura de las entidades principales del sistema:

- ProductEntity
- PaymentSessionEntity
- TransactionEntity
- Servicios y casos de uso relacionados

### Diagrama Entidad-Relación

El [diagrama entidad-relación](./diagrama-entidad-relacion.md) muestra la estructura de la base de datos:

- Tabla PRODUCT
- Tabla PAYMENT_SESSION
- Tabla TRANSACTION
- Relaciones entre las tablas

### Diagrama de Flujo Completo

El [diagrama de flujo](./diagrama-flujo-completo.md) detalla el proceso completo de pago:

1. Selección de producto
2. Creación de sesión de pago
3. Procesamiento de la transacción
4. Actualización de estado
5. Proceso automático de expiración

## Configuración del Proyecto

### Backend (NestJS)

1. **Instalación de dependencias**:

   ```bash
   cd BackEnd/testb
   npm install
   ```

2. **Configuración de variables de entorno**:
   Crea un archivo `.env` en la carpeta `BackEnd/testb` con las siguientes variables:

   ```
   # Configuración de la base de datos
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db

   # Configuración de la pasarela de pagos
   PAYMENT_GATEWAY_URL=https://api-sandbox.co.uat.wompi.dev/v1
   PAYMENT_GATEWAY_PUBLIC_KEY=pk_test_your_public_key
   PAYMENT_GATEWAY_PRIVATE_KEY=sk_test_your_private_key

   # Configuración de CORS
   CORS_ORIGIN=http://localhost:5173

   # Puerto de la aplicación
   PORT=3000
   ```

3. **Ejecución en desarrollo**:

   ```bash
   npm run start:dev
   ```

4. **Ejecución de pruebas**:
   ```bash
   npm run test
   ```

### Frontend (React)

1. **Instalación de dependencias**:

   ```bash
   cd FrontEnd/e-commerce
   npm install
   ```

2. **Configuración de variables de entorno**:
   Crea un archivo `.env` en la carpeta `FrontEnd/e-commerce` basado en el archivo `.env.example`:

   ```
   # URL del backend
   VITE_API_URL=http://localhost:3000

   # URL de la pasarela de pagos (sandbox/desarrollo)
   VITE_PAYMENT_GATEWAY_URL=https://api-sandbox.co.uat.wompi.dev/v1

   # Credenciales de la pasarela de pagos
   VITE_PAYMENT_GATEWAY_PUBLIC_KEY=pk_test_your_public_key
   VITE_PAYMENT_GATEWAY_PRIVATE_KEY=sk_test_your_private_key

   # Configuración de entorno
   VITE_NODE_ENV=development

   # Puerto para desarrollo
   VITE_PORT=5173
   ```

3. **Ejecución en desarrollo**:
   ```bash
   npm run dev
   ```

## Despliegue

### Backend (Google Cloud Run)

El backend está configurado para ser desplegado en Google Cloud Run. Para más detalles, consulta el archivo [DEPLOY-CLOUD-RUN.md](./BackEnd/testb/DEPLOY-CLOUD-RUN.md).

Pasos básicos:

1. Construir la imagen Docker
2. Subir la imagen a Google Container Registry
3. Desplegar en Cloud Run con las variables de entorno necesarias

### Frontend (Firebase Hosting)

El frontend está configurado para ser desplegado en Firebase Hosting:

1. **Construir la aplicación**:

   ```bash
   cd FrontEnd/e-commerce
   npm run build
   ```

2. **Desplegar en Firebase**:
   ```bash
   firebase deploy
   ```

## Flujo de Pago

1. **Selección de Producto**: El usuario selecciona un producto para comprar.
2. **Inicio de Pago**: El usuario proporciona su correo electrónico e inicia el proceso de pago.
3. **Creación de Sesión**: El backend crea una sesión de pago y una transacción pendiente.
4. **Formulario de Pago**: El frontend muestra el formulario de pago integrado.
5. **Procesamiento**: El usuario ingresa los datos de pago y procesa la transacción.
6. **Actualización de Estado**: El backend actualiza el estado de la transacción según la respuesta .
7. **Resultado**: El frontend muestra el resultado del pago al usuario.

## API de Pasarela de Pagos

El proyecto incluye una colección de Postman para probar la API de la pasarela de pagos. Esta colección contiene todas las solicitudes configuradas para interactuar con los endpoints del sistema de pagos.

### Colección Postman

El archivo `Payment Gateway API.postman_collection.json` contiene las siguientes operaciones:

- **Products**: Obtener todos los productos disponibles
- **Payments**: Procesar pagos para productos
- **Transactions**: Actualizar y consultar estados de transacciones
- **Acceptance Tokens**: Obtener tokens de aceptación del comercio

### Cómo usar la colección

1. **Importar la colección en Postman**:

   - Abre Postman
   - Haz clic en "Import" y selecciona el archivo `Payment Gateway API.postman_collection.json`

2. **Configurar variables de entorno**:

   - La colección utiliza las siguientes variables:
     - `baseUrl`: URL base de la API (por defecto: http://localhost:3000)
     - `paymentToken`: Token JWT recibido al procesar un pago
     - `transactionId`: ID de la transacción para consultas

3. **Ejecutar las solicitudes**:
   - Puedes probar cada endpoint individualmente
   - Las solicitudes están organizadas por categorías para facilitar su uso

### Ejemplos de uso

- **Obtener productos**: GET {{baseUrl}}/products
- **Procesar pago**: POST {{baseUrl}}/payments (con datos del producto y usuario)
- **Verificar estado de transacción**: GET {{baseUrl}}/transactions/{{transactionId}}
- **Actualizar estado de transacción**: PUT {{baseUrl}}/transactions/status

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
