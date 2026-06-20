# 🛡️ Reporte de Seguridad e Integridad de Software

**Proyecto:** `currencyExchange` v1.11.0  
**Fecha de Auditoría:** 20 de junio de 2026  
**Auditor:** Agente AppSec automatizado  
**Stack:** React 19.2.6 · TypeScript 6.0.3 · Vite 8.0.16 · pnpm 11.2.2 · Node 24.17.0

---

## 📊 Nivel de Riesgo General: **MEDIO**

---

## 1. Resumen Ejecutivo

| Categoría | Estado |
|---|---|
| Vulnerabilidades en dependencias directas | ✅ Sin incidencias |
| Vulnerabilidades en dependencias transitivas | ⚠️ 8 hallazgos (3 HIGH, 4 MODERATE, 1 LOW) |
| Licencias copyleft/GPL detectadas | ✅ Ninguna |
| Compatibilidad de licencias para uso comercial | ✅ Apto |
| Configuración de infraestructura (Docker) | ❌ Inconsistencia crítica |
| Configuración de resolución de dependencias | ⚠️ Riesgo latente mitigado |

---

## 2. Análisis de Vulnerabilidades (CVEs)

### 2.1 undici@7.27.2 (Transitiva: jsdom → vitest) — **7 CVEs**

| ID | Severidad | CVSS | CWE | Descripción |
|---|---|---|---|---|
| GHSA-vmh5-mc38-953g | **HIGH** | — | CWE-295 | TLS certificate validation bypass via SOCKS5 ProxyAgent |
| GHSA-vxpw-j846-p89q | **HIGH** | — | CWE-400/770 | WebSocket DoS via fragment count bypass |
| GHSA-hm92-r4w5-c3mj | **HIGH** | — | CWE-346 | Cross-origin request routing via SOCKS5 proxy pool reuse |
| GHSA-pr7r-676h-xcf6 | MODERATE | — | CWE-524 | Cross-user information disclosure via shared cache bypass |
| GHSA-p88m-4jfj-68fv | MODERATE | — | CWE-93 | HTTP header injection via Set-Cookie percent-decoding |
| GHSA-h67p-54hq-rp68 | MODERATE | — | CWE-407 | (js-yaml) Quadratic-complexity DoS in merge key handling |
| GHSA-35p6-xmwp-9g52 | LOW | — | CWE-367 | HTTP response queue poisoning via keep-alive socket reuse |
| GHSA-g8m3-5g58-fq7m | LOW | — | CWE-183 | Set-Cookie SameSite attribute downgrade |

**Versión vulnerable:** `>=7.0.0 <7.28.0`  
**Versión parcheada:** `>=7.28.0`  
**Versión en uso:** `7.27.2` ❌  
**Rutas de dependencia:**
```
currencyExchange → jsdom@29.1.1 → undici@7.27.2
currencyExchange → vitest@4.1.8 → jsdom@29.1.1 → undici@7.27.2
currencyExchange → @vitest/coverage-v8@4.1.8 → vitest@4.1.8 → jsdom@29.1.1 → undici@7.27.2
```

### 2.2 js-yaml@4.1.1 (Transitiva: commitlint) — **1 CVE**

| ID | Severidad | CWE | Descripción |
|---|---|---|---|
| GHSA-h67p-54hq-rp68 | MODERATE | CWE-407 | Quadratic-complexity DoS en merge key handling via aliases repetidos |

**Versión vulnerable:** `<=4.1.1`  
**Versión parcheada:** `>=4.1.2`  
**Versión en uso:** `4.1.1` ❌  
**⚠️ Problema agravado:** El override en `pnpm-workspace.yaml` define `"js-yaml": ">=4.1.1"`, que **no fuerza la versión parcheada 4.1.2**.  
**Ruta:** `currencyExchange → @commitlint/cli → @commitlint/load → cosmiconfig → js-yaml@4.1.1`

### 2.3 Vite — Verificación de CVEs en Tiempo Real (GitHub Advisory DB)

Se identificaron **4 CVEs recientes** para Vite en la GitHub Advisory Database. **Todos están parcheados** en la versión en uso (8.0.16):

| CVE | Severidad | CVSS | Afecta | Parche |
|---|---|---|---|---|
| CVE-2026-53571 | HIGH | 8.2 | `>=8.0.0 <=8.0.15` | 8.0.16 ✅ |
| CVE-2026-39364 | HIGH | 8.2 | `>=8.0.0 <=8.0.4` | 8.0.5 ✅ |
| CVE-2026-39363 | HIGH | 8.2 | `>=8.0.0 <=8.0.4` | 8.0.5 ✅ |
| CVE-2026-39365 | MODERATE | 6.3 | `>=8.0.0 <=8.0.4` | 8.0.5 ✅ |

---

## 3. Cumplimiento de Licencias

### 3.1 Distribución de licencias (387 paquetes)

| Licencia | Cantidad | Riesgo |
|---|---|---|
| MIT | 275 | Permisiva ✅ |
| ISC | 13 | Permisiva ✅ |
| Apache-2.0 | 9 | Permisiva ✅ |
| BSD-3-Clause | 6 | Permisiva ✅ |
| MIT OR Apache-2.0 | 2 | Dual permisiva ✅ |
| MIT-0 | 2 | Permisiva ✅ |
| BSD-2-Clause | 2 | Permisiva ✅ |
| MPL-2.0 | 2 | Copyleft débil (nivel archivo) ⚠️ |
| Python-2.0 | 1 | Permisiva (PSF) ✅ |
| BlueOak-1.0.0 | 1 | Permisiva ✅ |
| CC0-1.0 | 1 | Dominio público ✅ |
| 0BSD | 1 | Permisiva (Zero Clause) ✅ |

### 3.2 Detalle de licencias no-MIT

| Paquete | Versión | Licencia | Evaluación |
|---|---|---|---|
| `lightningcss` | 1.32.0 | MPL-2.0 | Copyleft a nivel de archivo. Usado por Vite/Biome como binario externo. No se modifica ni vincula estáticamente. **Compatible con uso comercial.** |
| `lightningcss-linux-x64-gnu` | 1.32.0 | MPL-2.0 | Ídem. |
| `argparse` | 2.0.1 | Python-2.0 | PSF License. Permisiva, compatible con propietario. |
| `lru-cache` | 11.5.1 | BlueOak-1.0.0 | Permisiva. Equivalente a BSD/MIT en la práctica. |
| `mdn-data` | 2.27.1 | CC0-1.0 | Dedicación al dominio público. Sin restricciones. |
| `tslib` | 2.8.1 | 0BSD | BSD Zero Clause. Sin restricciones. |

### 3.3 Veredicto de Licencias

✅ **No se detectaron licencias GPL, AGPL, LGPL ni ninguna licencia copyleft fuerte.**  
✅ **Todas las dependencias son compatibles con despliegue en entornos propietarios/comerciales.**  
⚠️ MPL-2.0 (lightningcss): copyleft débil a nivel de archivo. Sin riesgo para este proyecto ya que lightningcss se consume como herramienta independiente (no se modifica ni se enlaza su código fuente con el proyecto).

---

## 4. Auditoría de Infraestructura (Docker)

### 4.1 ❌ Inconsistencia de versión de Node en Dockerfile

| Artefacto | Versión Node requerida |
|---|---|
| `package.json` → `engines.node` | `>=24.0.0` |
| `Dockerfile` → `ARG NODE_VERSION` | `22-alpine` |

**Impacto:** Node 22 está fuera de soporte activo y no cumple con el requisito mínimo del proyecto. Puede causar fallos en tiempo de ejecución debido a APIs no disponibles en Node 22 (el proyecto requiere `>=24.0.0`).

**Riesgo adicional:** Node 22 no recibe los parches de seguridad más recientes disponibles en Node 24. Dado que `engineStrict: true` está activado en `package.json` y `pnpm-workspace.yaml`, pnpm rechazará la instalación en entornos con Node 22.

---

## 5. Configuración de Resolución de Dependencias

### 5.1 ⚠️ `resolutionMode: lowest-direct`

El archivo `pnpm-workspace.yaml` configura `resolutionMode: lowest-direct`, lo que significa que pnpm resuelve la versión **más baja** que satisface el rango semver, en lugar de la más alta (comportamiento por defecto). Esto **puede llevar a la instalación de versiones antiguas con vulnerabilidades conocidas** en dependencias transitivas.

**Mitigación parcial:** `preferFrozenLockfile: true` garantiza que las instalaciones reproducibles usen el lockfile como fuente de verdad, reduciendo el riesgo en entornos CI/CD.

**Recomendación:** Evaluar cambiar a `resolutionMode: highest` (por defecto) para maximizar la resolución de parches de seguridad en dependencias transitivas.

### 5.2 ⚠️ Override `js-yaml` insuficiente

```yaml
# pnpm-workspace.yaml L51 — ACTUAL
"js-yaml": ">=4.1.1"
```

El override actual permite `4.1.1`, que es vulnerable. Debe ajustarse a `>=4.1.2`.

---

## 6. Propuesta de Mitigación

### 🔴 Acciones Críticas (ejecutar inmediatamente)

| # | Acción | Detalle |
|---|---|---|
| 1 | **Corregir override `js-yaml`** | Cambiar `"js-yaml": ">=4.1.1"` → `"js-yaml": ">=4.1.2"` en `pnpm-workspace.yaml` |
| 2 | **Forzar `undici` a >=7.28.0** | Agregar override: `"undici": ">=7.28.0"` en `pnpm-workspace.yaml` |

### 🟠 Acciones Prioritarias (próximo sprint)

| # | Acción | Detalle |
|---|---|---|
| 3 | **Corregir versión de Node en Dockerfile** | Cambiar `ARG NODE_VERSION=22-alpine` → `ARG NODE_VERSION=24-alpine` en `Dockerfile` |
| 4 | **Evaluar `resolutionMode`** | Considerar eliminar `resolutionMode: lowest-direct` o documentar la razón explícita de su uso |

### 🟡 Acciones Recomendadas (mejora continua)

| # | Acción | Detalle |
|---|---|---|
| 5 | **Automatizar auditoría** | Agregar `pnpm audit` al pipeline de CI/CD con bloqueo en hallazgos HIGH/CRITICAL |
| 6 | **Actualizar `jsdom`** | Evaluar actualizar `jsdom` a una versión que dependa de `undici >=7.28.0` directamente |

### 📋 Comandos de remediación propuestos

```bash
# 1. Ajustar overrides en pnpm-workspace.yaml manualmente:
#    "js-yaml": ">=4.1.2"
#    Agregar: "undici": ">=7.28.0"

# 2. Reinstalar dependencias
pnpm install

# 3. Verificar corrección
pnpm audit

# 4. Verificar versiones resueltas
pnpm ls undici js-yaml --depth 0
```

---

## 7. Archivos de Dependencias Identificados

| Archivo | Tipo | Estado |
|---|---|---|
| `package.json` | Manifiesto principal (npm/pnpm) | Analizado |
| `pnpm-lock.yaml` | Lockfile (pnpm) | Analizado |
| `pnpm-workspace.yaml` | Configuración de workspace + catálogo | Analizado |
| `Dockerfile` | Infraestructura (multi-stage) | Analizado |
| `docker-compose.yml` | Orquestación de contenedores | Analizado |

No se detectaron manifiestos de Python (`requirements.txt`, `pyproject.toml`), Rust (`Cargo.toml`), Go (`go.mod`), Ruby (`Gemfile`), Java (`pom.xml`, `build.gradle`), ni .NET.

---

## 8. Métricas de Auditoría

| Métrica | Valor |
|---|---|
| Total de dependencias | 387 |
| Dependencias directas (prod) | 5 |
| Dependencias directas (dev) | 22 |
| Vulnerabilidades detectadas (pnpm audit) | 8 |
| CVEs verificados en vivo (GitHub Advisory DB) | 4 (todos parcheados) |
| Licencias únicas identificadas | 13 |
| Licencias de alto riesgo (GPL/AGPL) | 0 |
| Tiempo total de auditoría | ~2 min |

---

*Reporte generado automáticamente por el agente de seguridad AppSec siguiendo el protocolo de auditoría SCA.*  
*Skill: `security-audit` · Base: `/home/david/.config/opencode/skills/security-audit/`*
