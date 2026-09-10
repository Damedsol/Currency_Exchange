# ADR-001 — Producción no-root con nginx-unprivileged y pins por digest

- **Fecha:** 2026-09-10 · **Estado:** aceptado · **Contexto:** hallazgos DeepSec `dockerfile-from-mutable-tag` / `dockerfile-run-as-root`.
- **Decisión:** stage `production` usa `nginxinc/nginx-unprivileged:alpine@sha256:…` + `USER nginx` + `listen/EXPOSE 8080`; stages node pineados `node:24-alpine@sha256:…` (multi-arch index digest vía `imagetools inspect`).
- **Consecuencias:** el puerto de producción cambia 80 → 8080 (actualizar mapeos/infra al desplegar); los digests deben rotarse al actualizar base images (los tests `dockerfile.test.ts` fallan si el pin se elimina).
- **Alternativas descartadas:** `USER nginx` sobre `nginx:alpine` (no puede bindear el puerto 80); tags flotantes (riesgo supply-chain).
