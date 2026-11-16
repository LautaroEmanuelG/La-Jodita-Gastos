# 🎯 CLAUDE.md — La Jodita

Guía operativa para agentes IA y colaboradores técnicos del proyecto.

---

## 🧱 Arquitectura

La app es una SPA estática de archivo único:

```text
src/pages/index.astro
```

- HTML: estructura de los 4 pasos
- style is:global: estilos globales (requerido por componentes dinámicos con innerHTML)
- script is:inline: estado, lógica y renderizado

No introducir componentes Astro separados ni frameworks de UI sin pedido explícito.

---

## 🧠 Estado y persistencia

```js
// localStorage
KEY = 'divisor-v2'                 // estado principal
HISTORY_KEY = 'divisor-history-v1' // historial de sesiones
USER_KEY = 'divisor-user-v1'       // identificador local de usuario

state = {
  tripName: string,
  participants: string[],
  baseCurrency: string,
  extraCurrencies: [{ code, rate }],
  expenses: [{
    id,
    description,
    paidBy,
    currency,
    amount,
    amountInBase,
    splits,
    emoji
  }]
}
```

Regla crítica: siempre ejecutar save() después de mutar state.

---

## 🚀 Funcionalidades

- Carga de participantes con avatar/color determinista
- Gastos multi-moneda con conversión a moneda base
- Liquidación automática por compensación greedy
- Historial local de sesiones (máximo 10)
- Compartir sesiones vía API + Redis (sin vencimiento) con fallback a link autocontenido `/#d=<v>.<base64url>` (deflate-raw) si el servidor falla
- Compartir resumen como imagen PNG (canvas) → portapapeles, share sheet nativo o descarga
- Datos de usuario en innerHTML siempre con `esc()`; argumentos en handlers inline con `jsArg()`; snapshots externos pasan por `sanitizeSnapshot()`
- Abrir un link compartido resguarda la sesión local en curso en el historial antes de reemplazarla
- Restricción de compartido: solo creador puede re-compartir
- Redondeo visual global sin decimales
- Versión visible en header con conteo de cambios mayores/menores
- Página de preview Open Graph en `/open-graph`
- La vista `/open-graph` solo debe responder en localhost; en producción devuelve 404 y no debe indexarse

---

## 🧩 Patrones de código

- Flujo render-first: mutar estado, save(), render de sección afectada
- Helpers de formato centralizados: roundAmount, formatAmount, formatMoney
- Variables globales de UI controladas por prefijo \_ (ejemplo: \_liquidacion)
- IDs en DOM con naming semántico (history-count, btn-compartir)
- Cálculos monetarios internos en centavos para liquidación

---

## 🎨 Estilos y UX

- Mantener diseño actual: tarjetas suaves, acento violeta, tipografía limpia
- En mobile, la tabla de balance muestra solo avatar en columna Persona
- Evitar cambios de tema drásticos sin aprobación
- Mantener animaciones ligeras y consistentes (fade/slide/pop)
- No quitar style is:global

---

## 🔖 Versionado de producto

Se usa versionado semántico visible en header:

```text
APP_VERSION = { major, minor, patch }
```

Reglas de avance:

- patch: cambios pequeños y correcciones (1.0.1, 1.0.2, ...)
- minor: cambios grandes compatibles de funcionalidad (1.1.0, 1.2.0, ...)
- major: cambios disruptivos de flujo/arquitectura (2.0.0, 3.0.0, ...)

Política obligatoria:

- Antes de subir una versión major, siempre preguntar al usuario.
- Para patch/minor se puede proponer el incremento automáticamente según el alcance del cambio.
- Mostrar en header solo `v{major}.{minor}`.

---

## 🤝 Forma de trabajo

1. Leer el bloque afectado completo antes de editar.
2. Aplicar cambios puntuales en index.astro (sin refactors amplios no pedidos).
3. Validar con npm run build.
4. Si se toca documentación, actualizar README.md + CLAUDE.md + agent.md.
5. No crear archivos markdown extra de información, resumen, guías o quick-start; toda la información relevante de desarrollo, patrones, SEO y operativa debe vivir solo en README.md, CLAUDE.md y AGENT.md.
6. No romper compatibilidad de localStorage keys existentes.

---

## 🛠️ Comandos

```bash
npm run dev         # Astro dev local (http://localhost:4321)
npm run dev:bitrix  # Astro dev + Cloudflare Tunnel en un solo proceso
npm run build
npm run preview
```

`dev:bitrix` lee `.env.local` (ver `env.example`), auto-detecta Astro como framework, y levanta
`cloudflared tunnel run --token $CLOUDFLARE_TUNNEL_TOKEN` junto con `astro dev`.
Procesos vinculados: si uno muere, el otro se cierra. Orquestador en `scripts/dev-bitrix.ts`
(idéntico entre proyectos — no modificar). `astro.config.mjs` activa `hmr.clientPort: 443` solo
cuando `npm_lifecycle_event === 'dev:bitrix'`, así el `npm run dev` local no se rompe.

---

## 🚫 No hacer

- No cambiar KEY = 'divisor-v2'
- No quitar style is:global ni script is:inline
- No agregar backend adicional fuera de las APIs ya existentes
- No introducir dependencias de UI sin aprobación
