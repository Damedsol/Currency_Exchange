# 🐳 Guía de Uso Docker - Currency Exchange

## 📋 Comandos Principales

### 🚀 Desarrollo

```bash
# Levantar entorno de desarrollo
docker-compose --profile development up

# Levantar en segundo plano
docker-compose --profile development up -d

# Ver logs del entorno de desarrollo
docker-compose --profile development logs -f

# Parar entorno de desarrollo
docker-compose --profile development down
```

### 🏭 Producción

```bash
# Levantar entorno de producción
docker-compose --profile production up

# Levantar en segundo plano
docker-compose --profile production up -d

# Ver logs del entorno de producción
docker-compose --profile production logs -f

# Parar entorno de producción
docker-compose --profile production down
```

## 🔧 Comandos de Construcción

### Construir imágenes específicas

```bash
# Construir solo imagen de desarrollo
docker-compose --profile development build

# Construir solo imagen de producción
docker-compose --profile production build

# Reconstruir sin cache
docker-compose --profile development build --no-cache
```

## 🧹 Limpieza

### Limpiar contenedores y volúmenes

```bash
# Parar y eliminar contenedores
docker-compose --profile development down -v

# Eliminar imágenes no utilizadas
docker system prune -f

# Eliminar volúmenes no utilizados
docker volume prune -f
```

## 🌐 Puertos

- **Desarrollo**: `http://localhost:5173`
- **Producción**: `http://localhost:80`

## 📁 Estructura de Archivos Docker

```
docker/
├── nginx/
│   ├── nginx.dev.conf      # Configuración Nginx para desarrollo
│   └── nginx.prod.conf     # Configuración Nginx para producción
├── .env.development        # Variables de entorno para desarrollo
└── .env.production         # Variables de entorno para producción
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Puerto ya en uso

```bash
# Verificar qué proceso usa el puerto
netstat -ano | findstr :5173
netstat -ano | findstr :80

# Matar proceso si es necesario
taskkill /PID <PID> /F
```

#### 2. Volúmenes no se montan correctamente

```bash
# Recrear volúmenes
docker-compose --profile development down -v
docker-compose --profile development up
```

#### 3. Cache de Vite no funciona

```bash
# Limpiar cache de Vite
docker-compose --profile development exec frontend-dev rm -rf /app/node_modules/.vite
```

### Logs y Debugging

#### Ver logs en tiempo real

```bash
# Logs de desarrollo
docker-compose --profile development logs -f frontend-dev

# Logs de producción
docker-compose --profile production logs -f frontend-prod
```

#### Acceder al contenedor

```bash
# Desarrollo
docker-compose --profile development exec frontend-dev sh

# Producción
docker-compose --profile production exec frontend-prod sh
```

## 🚀 Desarrollo Rápido

### Workflow Recomendado

1. **Iniciar desarrollo**:

   ```bash
   docker-compose --profile development up
   ```

2. **Hacer cambios** en el código (hot reload automático)

3. **Probar producción**:

   ```bash
   docker-compose --profile production up
   ```

4. **Limpiar** cuando termines:
   ```bash
   docker-compose --profile development down
   docker-compose --profile production down
   ```

## 📊 Monitoreo

### Ver estado de contenedores

```bash
# Estado de desarrollo
docker-compose --profile development ps

# Estado de producción
docker-compose --profile production ps
```

### Ver uso de recursos

```bash
# Estadísticas de contenedores
docker stats
```

## 🔒 Variables de Entorno

### Desarrollo

- `NODE_ENV=development`
- `VITE_DEBUG=true`
- `VITE_HMR=true`
- `CHOKIDAR_USEPOLLING=true`

### Producción

- `NODE_ENV=production`
- `VITE_DEBUG=false`
- `VITE_HMR=false`
- Logs mínimos para rendimiento
