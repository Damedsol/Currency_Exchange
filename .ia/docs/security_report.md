# 🛡️ Reporte de Seguridad e Integridad de Software

**Proyecto:** `currencyExchange` v1.11.0  
**Fecha de auditoría:** 2026-06-27  
**Auditor:** Agente AppSec (security-audit skill)  
**Alcance:** Dependencias directas + transitivas (387 paquetes), skills de IA, licencias

---

## 📊 Nivel de Riesgo General: **MEDIO** 🟡

> 3 vulnerabilidades **HIGH**, 2 **MODERATE**, 2 **LOW** — todas en una única dependencia transitiva (`undici`). No se encontraron CVEs en dependencias directas. No se detectaron conflictos de licencias copyleft. Skills de IA evaluadas como seguras.

---

## 1. Análisis de Vulnerabilidades (CVEs)

### 1.1 Resumen Ejecutivo

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| CRÍTICA ($S \ge 9.0$) | 0 | — |
| ALTA ($7.0 \le S < 9.0$) | 3 | Requiere acción |
| MEDIA ($4.0 \le S < 7.0$) | 2 | Mitigación recomendada |
| BAJA ($S < 4.0$) | 2 | Monitoreo |

**Paquete comprometido único:** `undici@7.27.2` (dependencia transitiva de `jsdom@29.1.1` → usada por `vitest` y `@vitest/coverage-v8`)

**Ruta de dependencia:**
```
currencyExchange
 └─ devDependencies
     ├── jsdom@29.1.1 → undici@7.27.2
     ├── vitest@4.1.8 → jsdom@29.1.1 (peer) → undici@7.27.2
     └── @vitest/coverage-v8@4.1.8 → vitest@4.1.8 (peer) → jsdom@29.1.1 (peer) → undici@7.27.2
```

**Parche disponible:** `undici >= 7.28.0` (publicado) — todas las vulnerabilidades están corregidas en esta versión.

---

### 1.2 Detalle de Vulnerabilidades

#### [GHSA-hm92-r4w5-c3mj] CWE-346 — Cross-Origin Request Routing via SOCKS5 Proxy Pool Reuse — **ALTA**

| Campo | Valor |
|-------|-------|
| **Paquete** | `undici` |
| **Versión vulnerable** | `>=7.23.0 <7.28.0` |
| **Versión instalada** | `7.27.2` |
| **CVSS v3.1** | `7.5` — AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:H |
| **Vector de ataque** | Reutilización de pool de proxy SOCKS5 que permite enrutar solicitudes a orígenes cruzados no autorizados, comprometiendo confidencialidad, integridad y disponibilidad. |
| **Remediación** | Actualizar a `undici >= 7.28.0` |

#### [GHSA-vxpw-j846-p89q] CWE-400/CWE-770 — WebSocket DoS via Fragment Count Bypass — **ALTA**

| Campo | Valor |
|-------|-------|
| **Paquete** | `undici` |
| **Versión vulnerable** | `>=7.0.0 <7.28.0` |
| **Versión instalada** | `7.27.2` |
| **CVSS v3.1** | `7.5` — AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H |
| **Vector de ataque** | Cliente WebSocket vulnerable a denegación de servicio por omisión de límite de fragmentos. Baja complejidad de ataque, sin autenticación requerida. |
| **Remediación** | Actualizar a `undici >= 7.28.0` |

#### [GHSA-vmh5-mc38-953g] CWE-295 — TLS Certificate Validation Bypass via SOCKS5 — **ALTA**

| Campo | Valor |
|-------|-------|
| **Paquete** | `undici` |
| **Versión vulnerable** | `>=7.23.0 <7.28.0` |
| **Versión instalada** | `7.27.2` |
| **CVSS v3.1** | `7.4` — AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N |
| **Vector de ataque** | Omisión de validación de certificados TLS en conexiones SOCKS5 ProxyAgent cuando `requestTls` es omitido. |
| **Remediación** | Actualizar a `undici >= 7.28.0` |

#### [GHSA-p88m-4jfj-68fv] CWE-93 — HTTP Header Injection via Set-Cookie — **MODERADA**

| Campo | Valor |
|-------|-------|
| **Paquete** | `undici` |
| **Versión vulnerable** | `>=7.0.0 <7.28.0` |
| **Versión instalada** | `7.27.2` |
| **CVSS v3.1** | `5.9` — AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:H/A:N |
| **Vector de ataque** | Inyección de cabeceras HTTP mediante decodificación percent-encoding de valores `Set-Cookie`. |
| **Remediación** | Actualizar a `undici >= 7.28.0` |

#### [GHSA-pr7r-676h-xcf6] CWE-524 — Cross-User Info Disclosure via Shared Cache — **MODERADA**

| Campo | Valor |
|-------|-------|
| **Paquete** | `undici` |
| **Versión vulnerable** | `>=7.0.0 <7.28.0` |
| **Versión instalada** | `7.27.2` |
| **CVSS v3.1** | `5.9` — AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N |
| **Vector de ataque** | Divulgación de información entre usuarios por omisión de whitespace en caché compartida. |
| **Remediación** | Actualizar a `undici >= 7.28.0` |

#### [GHSA-g8m3-5g58-fq7m] CWE-183 — Set-Cookie SameSite Downgrade — **BAJA**

| Campo | Valor |
|-------|-------|
| **Paquete** | `undici` |
| **Versión vulnerable** | `>=7.0.0 <7.28.0` |
| **Versión instalada** | `7.27.2` |
| **CVSS v3.1** | `3.7` — AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N |
| **Remediación** | Actualizar a `undici >= 7.28.0` |

#### [GHSA-35p6-xmwp-9g52 / CVE-2026-6733] CWE-367 — HTTP Response Queue Poisoning — **BAJA**

| Campo | Valor |
|-------|-------|
| **Paquete** | `undici` |
| **Versión vulnerable** | `>=7.0.0 <7.28.0` |
| **Versión instalada** | `7.27.2` |
| **Severidad** | LOW (GitHub Advisory) |
| **Vector de ataque** | Envenenamiento de cola de respuestas HTTP/1.1 en sockets keep-alive reutilizados. Requiere servidor upstream comprometido. |
| **Remediación** | Actualizar a `undici >= 7.28.0` |

---

### 1.3 Dependencias Directas Verificadas (OSV + NVD)

Las siguientes dependencias directas fueron verificadas contra las bases OSV y NVD sin encontrar vulnerabilidades conocidas:

| Paquete | Versión instalada | OSV | NVD |
|---------|-------------------|-----|-----|
| `react` | 19.2.6 | ✅ Limpio | ✅ Limpio |
| `react-dom` | 19.2.6 | ✅ Limpio | ✅ Limpio |
| `@fluentui/react-components` | 9.74.1 | ✅ Limpio | ✅ Limpio |
| `@fluentui/react-icons` | 2.0.328 | ✅ Limpio | ✅ Limpio |
| `vite` | 8.0.16 | ✅ Limpio | ✅ Limpio |
| `vitest` | 4.1.8 | ✅ Limpio | ✅ Limpio |
| `typescript` | 6.0.3 | ✅ Limpio | ✅ Limpio |
| `@playwright/test` | 1.60.0 | ✅ Limpio | ✅ Limpio |
| `oxlint` | 1.66.0 | ✅ Limpio | ✅ Limpio |
| `jsdom` | 29.1.1 | ✅ Limpio | ✅ Limpio |

---

## 2. Cumplimiento de Licencias

### 2.1 Licencia del Proyecto

El proyecto se distribuye bajo **CC BY 4.0** (Creative Commons Attribution 4.0 International). Esta es una licencia **no diseñada para software** — la CC BY 4.0 es más adecuada para contenido/documentación. Se recomienda evaluar el cambio a una licencia estándar de software como MIT, Apache-2.0 o BSD para el código fuente.

### 2.2 Dependencias Directas

| Dependencia | Licencia | Compatibilidad |
|-------------|----------|----------------|
| `react` | MIT | ✅ |
| `react-dom` | MIT | ✅ |
| `scheduler` | MIT | ✅ |
| `@fluentui/react-components` | MIT | ✅ |
| `vite` | MIT | ✅ |
| `vitest` | MIT | ✅ |
| `jsdom` | MIT | ✅ |
| `@biomejs/biome` | MIT OR Apache-2.0 | ✅ |
| `oxlint` | MIT | ✅ |
| `typescript` | Apache-2.0 | ✅ |
| `@playwright/test` | Apache-2.0 | ✅ |
| `@vitest/coverage-v8` | MIT | ✅ |
| `@vitejs/plugin-react` | MIT | ✅ |
| `@commitlint/cli` | MIT | ✅ |
| `@testing-library/react` | MIT | ✅ |
| `husky` | MIT | ✅ |
| `lint-staged` | MIT | ✅ |

### 2.3 Dependencias Transitivas

**No se detectaron licencias GPL, AGPL, LGPL, MPL, SSPL, BSL, Elastic License, RSAL ni CC-BY-NC** en el árbol completo de 387 dependencias transitivas. Todas las licencias son permisivas (MIT, Apache-2.0, ISC, BSD).

### 2.4 Evaluación de Riesgo de Licencias: **SEGURO** ✅

No existen conflictos de licencias copyleft que impidan la distribución propietaria o comercial del software.

---

## 3. Auditoría de Skills de IA (SkillSpector)

### 3.1 Skill: `fluent-ui-react`

| Campo | Valor |
|-------|-------|
| **Ruta** | `/skills/fluent-ui-react/SKILL.md` |
| **Score de Riesgo ($S$)** | `0` — **SAFE** ✅ |
| **Severidad** | LOW |
| **Issues** | Ninguno |
| **Componentes** | 1 archivo Markdown (229 líneas, 7.3 KB) |
| **Scripts ejecutables** | No |
| **Análisis LLM** | No aplicado (--no-llm) |
| **Veredicto** | Skill de documentación pura con patrones de diseño de Fluent UI y React 19. Sin riesgos. |

### 3.2 Skill: `modern-linting`

| Campo | Valor |
|-------|-------|
| **Ruta** | `/skills/modern-linting/SKILL.md` |
| **Score de Riesgo ($S$)** | `18` — **SAFE** ✅ |
| **Severidad** | LOW |
| **Issues** | 1 falso positivo detectado |
| **Componentes** | 1 archivo Markdown (204 líneas, 6.4 KB) |
| **Scripts ejecutables** | No |
| **Análisis LLM** | No aplicado (--no-llm) |
| **Veredicto** | Skill de documentación segura. El issue detectado es un falso positivo. |

#### Falso Positivo Detectado (TM1)

| Campo | Detalle |
|-------|---------|
| **ID** | TM1 — Tool Parameter Abuse |
| **Severidad reportada** | HIGH (falso positivo) |
| **Confianza** | 0.75 |
| **Ubicación** | Línea 200 de SKILL.md |
| **Patrón** | `--no-verify` |
| **Evaluación** | El texto documenta explícitamente: *"❌ DO NOT bypass Git hooks (`git commit --no-verify`)"*. SkillSpector detectó el string `--no-verify` como parámetro peligroso, pero el contexto semántico es una **advertencia contra su uso**, no una instrucción de usarlo. **Falso positivo confirmado.** |

---

## 4. Propuesta de Mitigación

### 4.1 Acción Crítica Recomendada: Forzar `undici >= 7.28.0`

Agregar un override en `pnpm-workspace.yaml` para forzar la versión parcheada de `undici`:

```yaml
# En pnpm-workspace.yaml, sección "overrides":
"undici": ">=7.28.0"
```

**Justificación:** `jsdom@29.1.1` declara `undici: ^7.25.0`, lo cual permite `7.27.2` (vulnerable). La versión `7.28.0` es compatible con el rango semver `^7.25.0` y contiene los parches para las 7 vulnerabilidades. El override garantiza que todas las rutas de dependencia (jsdom → undici) usen la versión segura.

**Riesgo de regresión:** Bajo. `undici` 7.28.0 es un parche de seguridad menor dentro del mismo major. Los tests del proyecto (`pnpm test`, `pnpm test:e2e`) validarán la compatibilidad.

### 4.2 Recomendaciones Adicionales

| # | Recomendación | Prioridad |
|---|---------------|-----------|
| 1 | ⚠️ Reconsiderar licencia **CC BY 4.0** para código fuente — no es una licencia de software estándar. Evaluar migrar a **MIT** o **Apache-2.0**. | MEDIA |
| 2 | Verificar disponibilidad de `jsdom >= 29.2.0` que podría incluir `undici >= 7.28.0` como dependencia directa, eliminando la necesidad del override. | BAJA |
| 3 | Habilitar `pnpm audit` en CI/CD (ej. GitHub Actions) para detectar vulnerabilidades automáticamente en cada PR. | MEDIA |
| 4 | Ejecutar `skillspector scan` con LLM (`SKILLSPECTOR_PROVIDER=openai`) para análisis semántico profundo de skills al menos una vez por trimestre. | BAJA |

---

## 5. Notas de la Auditoría

- **Herramientas utilizadas:** `pnpm audit --json`, `skillspector scan --no-llm`, OSV API, NVD API
- **Ecosistema:** Node.js (npm/pnpm), 387 paquetes totales
- **Archivos de dependencias:** `package.json` + `pnpm-workspace.yaml` (catálogos)
- **Skills evaluadas:** 2/2 (100% cobertura)
- **Licencias transfronterizas evaluadas:** 387/387 (100% cobertura)
- **Duración total del escaneo:** ~45 segundos

---

*Reporte generado automáticamente por el agente AppSec conforme al protocolo security-audit v2.3.5*
