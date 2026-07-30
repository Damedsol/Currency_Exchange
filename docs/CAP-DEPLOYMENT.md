# Guía de Despliegue e Implementación — Cap Standalone

## Stack: `10-apps-cap` | Dominio: `captcha.damedsol.dev`

Esta guía describe cómo **desplegar** el stack de Cap Standalone en la infraestructura V3 y cómo **implementarlo** en proyectos frontend/backend como alternativa self-hosted a Cloudflare Turnstile o hCaptcha.

---

## 1. Despliegue del Stack

### 1.1 Prerrequisitos

- Stack `01-core` operativo (NPM + bases de datos centrales)
- Red `db_internal` creada (`docker network create db_internal`)
- Red `private_services` creada (`docker network create private_services`)
- DNS: registro A para `captcha.damedsol.dev` apuntando al VPS

### 1.2 Configurar variables de entorno

```bash
# Editar docker/stacks/01-core/.env
# Generar clave administradora:
openssl rand -hex 32

# Contenido esperado del .env:
UID=1000
TZ=Atlantic/Canary
CAP_ADMIN_KEY=<resultado_del_comando_anterior>
```

### 1.3 Crear directorio de assets

```bash
mkdir -p /home/remotevps/infra/data/cap/assets
```

### 1.4 Desplegar el stack

**En 01-core**
Tener desplegada valkey
```yaml
# --- BACKEND VALKEY ---
  db-valkey:
    image: valkey/valkey:9-alpine
    container_name: db-valkey
    restart: unless-stopped
    user: "0"
    init: true
    security_opt:
      - no-new-privileges:true
    volumes:
      - /home/remotevps/infra/data/backends/valkey:/data
    command: valkey-server --save 60 1 --loglevel warning --maxmemory-policy noeviction
    ports:
        - 127.0.0.1:8202:6379
    deploy:
      resources:
        limits:
          memory: 256M
    networks:
      - db_internal
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 60s
      timeout: 30s
      retries: 3
      start_period: 60s
```

**En 02-app-utils**
Tener desplegada cap en app-utils
```yaml
# --- APP CAP ---
  db-cap:
    image: cap/cap:9-alpine
    container_name: db-cap
    restart: unless-stopped
    user: "0"
    init: true
    security_opt:
      - no-new-privileges:true
    volumes:
      - /home/remotevps/infra/data/backends/cap:/data
    command: cap-server --save 60 1 --loglevel warning --maxmemory-policy noeviction
    ports:
        - 127.0.0.1:8203:3000
    deploy:
      resources:
        limits:
          memory: 256M
    networks:
      - db_internal
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "cap-cli", "ping"]
      interval: 60s
      timeout: 30s
      retries: 3
      start_period: 60s
```
Verificar que ambos servicios estén saludables en Portainer

### 1.5 Configurar Nginx Proxy Manager

Crear un **Proxy Host** en NPM con:

| Campo | Valor |
|:---|---|
| Domain | `captcha.damedsol.dev` |
| Scheme | `http` |
| Forward Hostname/IP | `cap-app` |
| Forward Port | `3000` |
| SSL | Solicitar certificado Let's Encrypt |
| Cache | Desactivado |

**Rutas bloqueadas** (no exponer a Internet): añadir Access List o Custom Locations con `deny all` para `/login`, `/admin`, `/dashboard`, `/api/admin`.

### 1.6 Verificar despliegue

```bash
# Desde Internet - el helper-widget debe servirse correctamente
curl -sI https://captcha.damedsol.dev/assets/helper-widget.js | head -5
# HTTP/2 200

# Rutas admin deben estar bloqueadas
curl -sI https://captcha.damedsol.dev/login | head -5
# HTTP/2 403 o 404
```

---

## 2. Acceso Administrativo (SSH Tunnel)

El panel de administración de Cap NO está expuesto a Internet. Para acceder:

```bash
# Abrir túnel SSH desde tu máquina local
ssh -L 8305:127.0.0.1:8305 usuario@IP_DEL_VPS

# En el navegador local abre:
# http://localhost:8305
```

Desde el panel podrás gestionar **Site Keys** y **Secret Keys** para tus proyectos.

---

## 3. Implementación en Proyectos Frontend

### 3.1 HTML / Vanilla JS

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Cargar el Web Component helper -->
  <script src="https://captcha.damedsol.dev/assets/helper-widget.js" defer></script>
</head>
<body>
  <form id="myForm">
    <!-- Modo visible clásico -->
    <cap-secure-widget sitekey="TU_SITE_KEY"></cap-secure-widget>

    <!-- Modo invisible (verificación en background) -->
    <!-- <cap-secure-widget sitekey="TU_SITE_KEY" invisible></cap-secure-widget> -->

    <button type="submit">Enviar</button>
  </form>

  <script>
    document.getElementById('myForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      // Obtener el token generado por Cap
      const widget = document.querySelector('cap-secure-widget');
      const capWidget = widget.querySelector('cap-widget');
      // El token se envía automáticamente con el formulario
      // o se extrae del DOM según la documentación de Cap

      // Enviar formulario con el token al backend
      const formData = new FormData(e.target);
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData
      });
    });
  </script>
</body>
</html>
```

### 3.2 React

```jsx
import { useEffect, useRef } from 'react';

function CapWidget({ siteKey, invisible = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Cargar el helper-widget si no está ya cargado
    if (!document.querySelector('script[src*="helper-widget.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://captcha.damedsol.dev/assets/helper-widget.js';
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <cap-secure-widget
      ref={containerRef}
      sitekey={siteKey}
      {...(invisible ? { invisible: '' } : {})}
    />
  );
}

// Uso:
// <CapWidget siteKey="your_site_key" />
// <CapWidget siteKey="your_site_key" invisible />
```

### 3.3 Vue 3

```vue
<template>
  <cap-secure-widget
    :sitekey="siteKey"
    :invisible="isInvisible ? '' : undefined"
  />
</template>

<script setup>
import { onMounted } from 'vue';

const props = defineProps({
  siteKey: { type: String, required: true },
  isInvisible: { type: Boolean, default: false }
});

onMounted(() => {
  if (!document.querySelector('script[src*="helper-widget.js"]')) {
    const script = document.createElement('script');
    script.src = 'https://captcha.damedsol.dev/assets/helper-widget.js';
    script.defer = true;
    document.head.appendChild(script);
  }
});
</script>
```

---

## 4. Validación en Backend

El backend debe validar el token recibido del frontend contra el endpoint interno de Cap. La comunicación se realiza dentro de la red `private_services` (nunca desde Internet).

### 4.1 Node.js / Express

```javascript
// utils/captcha.js
const https = require('https');

/**
 * Valida un token CAPTCHA contra el servidor interno de Cap
 * @param {string} captchaToken - Token generado por el widget
 * @param {string} siteKey - Site Key del proyecto
 * @param {string} secretKey - Secret Key del proyecto
 * @returns {Promise<boolean>}
 */
async function verifyCaptcha(captchaToken, siteKey, secretKey) {
  try {
    // NOTA: La comunicación usa el nombre del contenedor Docker
    // Solo funciona desde servicios dentro de la red private_services
    const response = await fetch(`http://cap-app:3000/${siteKey}/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: captchaToken
      })
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error al validar captcha en red interna:', error);
    return false;
  }
}

// Uso en un endpoint
app.post('/api/submit', async (req, res) => {
  const { captchaToken, siteKey } = req.body;

  const isValid = await verifyCaptcha(
    captchaToken,
    siteKey,
    process.env.CAP_SECRET_KEY
  );

  if (!isValid) {
    return res.status(403).json({ error: 'CAPTCHA validation failed' });
  }

  // Procesar formulario...
  res.json({ success: true });
});
```

### 4.2 Python / FastAPI

```python
import httpx
from fastapi import FastAPI, HTTPException

app = FastAPI()

CAP_INTERNAL_URL = "http://cap-app:3000"  # Nombre del contenedor Docker

async def verify_captcha(token: str, site_key: str, secret_key: str) -> bool:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{CAP_INTERNAL_URL}/{site_key}/siteverify",
                json={
                    "secret": secret_key,
                    "response": token
                },
                timeout=5.0
            )
            result = response.json()
            return result.get("success") is True
        except Exception as e:
            print(f"Error validating captcha: {e}")
            return False

@app.post("/api/submit")
async def submit_form(token: str, site_key: str):
    is_valid = await verify_captcha(
        token,
        site_key,
        "your-secret-key-here"
    )

    if not is_valid:
        raise HTTPException(status_code=403, detail="CAPTCHA validation failed")

    return {"success": True}
```

### 4.3 PHP

```php
<?php
function verifyCaptcha(string $token, string $siteKey, string $secretKey): bool {
    $url = "http://cap-app:3000/{$siteKey}/siteverify";

    $data = json_encode([
        'secret' => $secretKey,
        'response' => $token
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) return false;

    $result = json_decode($response, true);
    return $result['success'] === true;
}

// Uso:
// if (!verifyCaptcha($_POST['token'], $siteKey, $secretKey)) {
//     http_response_code(403);
//     echo json_encode(['error' => 'CAPTCHA validation failed']);
//     exit;
// }
```

---

## 5. Integración con Docker (red interna)

Si tu servicio backend se ejecuta en la misma infraestructura Docker, debe conectarse a la red `private_services` para alcanzar a Cap por nombre de contenedor:

```yaml
# En el stack.yml de tu servicio:
services:
  tu-app:
    # ...
    networks:
      - private_services    # ← Necesaria para alcanzar cap-app

networks:
  private_services:
    external: true
```

---

## 6. Verificación y Troubleshooting

### 6.1 Pruebas de conectividad

```bash
# Desde cualquier contenedor en private_services
docker exec -it tu-app curl -s http://cap-app:3000/
# Debería responder con la página de inicio de Cap

# Verificar que Valkey responde
docker exec cap-app wget -q --spider http://cap-valkey:6379/

# Verificar healthchecks
docker inspect --format='{{.State.Health.Status}}' cap-app
docker inspect --format='{{.State.Health.Status}}' cap-valkey
```

### 6.2 Logs

```bash
# Logs de Cap
docker logs cap-app --tail 50

# Logs de Valkey
docker logs cap-valkey --tail 50
```

### 6.3 Problemas comunes

| Síntoma | Causa probable | Solución |
|:---|---|:---|
| `wget: bad address 'cap-app'` | El contenedor no está en `private_services` | Verificar redes en stack.yml |
| Healthcheck `unhealthy` | Cap no responde en puerto 3000 | Revisar `docker logs cap-app` |
| `403` en rutas admin | NPM bloquea correctamente ✅ | Sin acción requerida |
| Widget no carga WASM | URL de assets incorrecta | Verificar `CAP_CUSTOM_WASM_URL` en helper-widget.js |

---

*Documento actualizado para infraestructura V3 — Julio 2026.*
