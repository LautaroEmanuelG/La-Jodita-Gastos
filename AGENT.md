# 🤖 agent.md — Guía Operativa de La Jodita

Documento de referencia rápida para cualquier agente IA o colaborador técnico.

---

## 🎯 Objetivo

Mantener y evolucionar La Jodita sin romper:

- flujo de 4 pasos
- persistencia local existente
- estilo visual actual
- compatibilidad de sesiones compartidas

---

## 🧱 Alcance técnico

- App de archivo único en src/pages/index.astro
- Toda la UI y lógica vive en HTML + CSS global + JS inline
- API de sesiones en src/pages/api/s
- Redis para snapshots compartidos (sin vencimiento)

---

## ✨ Funcionalidades clave

- Participantes con avatar y color determinista
- Carga de gastos con 3 modos de división
- Liquidación automática por balances
- Historial local de hasta 10 sesiones
- Compartido por link solo para sesiones creadas por el usuario
- Redondeo visual global sin decimales
- Badge de versión visible en header

---

## 🧩 Patrones de implementación

- Secuencia obligatoria: mutar state -> save() -> render()
- Evitar duplicar lógica de formateo de montos
- Reutilizar helpers: roundAmount, formatAmount, formatMoney
- Mantener IDs y classes de UI consistentes
- Priorizar cambios pequeños y localizados

---

## 🎨 Patrones de estilos

- Mantener paleta y lenguaje visual actual
- No quitar style is:global
- Mantener responsive mobile
- No introducir librerías de estilos externas

## 🔍 SEO y OpenGraph

No tocar sin revisar la sección de SEO y OpenGraph en este README y en CLAUDE.md.

Archivos críticos:

- `src/pages/index.astro` — metatags de home
- `src/pages/s/[id].astro` — metatags de sesiones compartidas
- `src/pages/api/og/[id].png.ts` — generador de imágenes dinámicas (Vercel OG)
- `public/robots.txt` — configuración para buscadores

Reglas de SEO:

- No cambiar la estructura de metatags sin entender OpenGraph
- La imagen OG se genera automáticamente en `/api/og/[id].png` — NO editar endpoints sin revisar cache headers
- Las sesiones compartidas incluyen `og:image` que apunta a `/api/og/[id].png`
- Cache optimizado: 24h en CDN de Vercel, 5min en navegador

---

## 🔖 Versionado

Constante actual en frontend:

- APP_VERSION = { major, minor, patch }

Criterio de incremento:

- patch: cambios pequeños y fixes (1.0.1, 1.0.2, ...)
- minor: mejoras grandes compatibles (1.1.0, 1.2.0, ...)
- major: cambios disruptivos (2.0.0, ...)

Regla obligatoria:

- Antes de avanzar versión major, consultar y confirmar con el usuario.
- Para patch/minor se puede proponer avance automático según impacto.
- En UI mostrar solo v{major}.{minor} junto al título.

---

## 🤝 Forma de trabajo

1. Leer la sección afectada completa antes de editar.
2. Hacer cambios mínimos que cumplan el requerimiento.
3. Compilar con npm run build.
4. Si hay cambios funcionales, actualizar README.md, CLAUDE.md y este archivo.
5. No cambiar claves de localStorage ya publicadas.
6. No generar archivos markdown extra de información, resumen, guía o quick-start; la documentación operativa debe concentrarse en README.md, CLAUDE.md y AGENT.md.

---

## 🧪 Validación mínima

- npm run build sin errores
- recorrido manual de pasos 1 a 4
- prueba de compartir/cargar sesión
- verificación de historial y badge de versión

---

## 🌐 Dev tunnel (opcional)

`npm run dev:bitrix` levanta `astro dev` + Cloudflare Tunnel como procesos vinculados.

- Orquestador: `scripts/dev-bitrix.ts` (kit portable, idéntico entre proyectos — no editar)
- Env vars: `CLOUDFLARE_TUNNEL_TOKEN` en `.env.local` (ver `env.example`)
- Config: `astro.config.mjs` activa HMR remoto solo cuando `npm_lifecycle_event === 'dev:bitrix'`
- Guía completa: `DevelopLocal/promptInicial.md` (gitignored, toolkit interno)

Si no hace falta exponer a internet, seguir usando `npm run dev` normal.
