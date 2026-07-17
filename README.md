# Culinaria - Catálogo de Utensilios de Cocina

Aplicación Angular 18 (Standalone Components + Signals + nuevo Control Flow) para mostrar un catálogo de productos de cocina con filtros por categoría.

## Requisitos previos
- Node.js 18.19+ o 20+
- npm 9+
- Angular CLI 18 (`npm install -g @angular/cli@18`)

## Instalación
```
npm install
```

## Desarrollo local
```
npm start
```
Abre http://localhost:4200

## Build de producción
```
npm run build:prod
```
El resultado se genera en `dist/catalogo-utensilios/browser` (Angular 17+ con application builder agrupa el output del navegador en la subcarpeta `browser`).

## Despliegue en Linux (Nginx/Apache)
1. Sube el contenido de `dist/catalogo-utensilios/browser` por SSH o FTP a tu servidor, por ejemplo a `/var/www/catalogo-utensilios`.
2. Configura tu servidor web usando `nginx.conf.example` como referencia (o el `.htaccess` equivalente para Apache).
3. Reinicia el servicio: `sudo systemctl restart nginx`.
# Catalogo-Royal
# Catalogo-Royal
