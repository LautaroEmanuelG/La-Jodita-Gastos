# 🎉 La Jodita

> Dividí gastos entre amigos de forma simple, rápida y visual.
> Soporta múltiples monedas y calcula automáticamente quién le debe a quién.

![Astro](https://img.shields.io/badge/Astro-4.x-BC52EE?style=flat-square&logo=astro)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?style=flat-square&logo=javascript)
![CSS](https://img.shields.io/badge/CSS-Pure-1572B6?style=flat-square&logo=css3)
![Upstash Redis](https://img.shields.io/badge/Redis-Upstash-00E9A3?style=flat-square&logo=redis)

---

## ✨ Funcionalidades

| Feature                      | Descripción                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| 👥 **Participantes**         | Avatares con color único generado por nombre                  |
| 💱 **Multi-moneda**          | Moneda base configurable + equivalencias opcionales           |
| ⚡ **Carga rápida**          | Click en avatar para seleccionar pagador, Enter para agregar  |
| ✏️ **Edición inline**        | Editá quién pagó y la división sin salir de la lista          |
| 🧮 **Liquidación**           | Mínimas transferencias para saldar todas las deudas           |
| 💾 **Persistencia local**    | Todo se guarda en `localStorage`, sin cuenta ni login         |
| 🔗 **Sesiones compartidas**  | Link corto vía Redis, con fallback a link autocontenido (sesión comprimida en la URL) |
| 🖼️ **Compartir imagen**     | Genera un PNG del resumen y lo copia al portapapeles |
| 🧾 **Historial inteligente** | Guarda sesiones vistas/propias (máximo 10 por usuario)        |
| 🔖 **Versionado visible**    | Badge de versión en header con tracking mayor/menor           |
| 📱 **Mobile optimizado**     | En liquidación, columna Persona muestra solo avatar en mobile |

---

## 🔖 Versionado de producto

La app muestra su versión al lado del título en el header.

- Formato: `major.minor.patch`
- Tracking visible: cantidad de actualizaciones mayores y menores

Ejemplo de estructura en frontend:

```js
APP_VERSION = {
  major: 2,
  minor: 1,
  patch: 0,
  majorUpdates: 2,
  minorUpdates: 1,
};
```

Regla práctica:

- major: cambios grandes de UX o arquitectura
- minor: nuevas funcionalidades compatibles
- patch: fixes sin cambios de flujo

---

## 🚀 Inicio rápido

```bash
git clone git@github.com:LautaroEmanuelG/La-Jodita-Gastos.git
cd La-Jodita-Gastos
npm install
npm run dev
```

Abrí `http://localhost:4321` y seguí los 4 pasos de la app.

---

## 🗺️ Flujo de uso

```text
① Grupo       →  Nombre del viaje + agregar participantes
② Monedas     →  Moneda base y equivalencias (opcional)
③ Gastos      →  Cargá cada gasto: monto, quién pagó, cómo dividir
④ Liquidación →  Quién le paga a quién y cuánto
```

### Formas de dividir un gasto

- **Igual entre todos** — divide automáticamente en partes iguales
- **Solo algunos** — elegís quiénes participan de ese gasto
- **Montos exactos** — ingresás cuánto le corresponde a cada uno

### Multi-moneda

Configurá cuántas unidades de moneda adicional equivalen a 1 unidad base.

Ejemplo: base `ARS`, agregar `USD` con tasa `0.00068` (1 ARS = 0.00068 USD).

---

## 🏗️ Stack técnico

```text
Astro 4      Framework estático (SSG)
Vanilla JS   Lógica de app en <script is:inline>
CSS puro     Sin frameworks de UI — is:global para elementos dinámicos
Astro API     Endpoints `/api/s` para publicar/cargar sesiones
Upstash Redis Persistencia temporal de sesiones compartidas (TTL 30 días)
localStorage  Persistencia local para historial del navegador
```

---

## 🧩 Patrones de código

- Flujo principal: mutar `state` -> `save()` -> render de UI afectada
- Helpers de formato monetario centralizados
- Cálculos de liquidación en centavos para evitar drift de floats
- Render dinámico con `innerHTML` apoyado en `style is:global`
- Restricción de compartido: solo sesión propia puede re-compartirse

---

## 🎨 Patrones de estilos

- Diseño de tarjetas suaves y acento violeta
- Animaciones cortas y consistentes (fade/slide/pop)
- Responsive first en bloques críticos
- En mobile, la tabla de balance prioriza avatar sobre texto
- No reemplazar `style is:global`

## 🔍 SEO y OpenGraph

La Jodita está completamente optimizada para compartir en redes sociales y para búsquedas:

- **Meta tags SEO**: descripción, keywords, robots, revisit-after
- **OpenGraph**: para Facebook, LinkedIn, WhatsApp, Slack
- **Twitter Card**: preview completo al compartir en Twitter/X
- **Imágenes dinámicas**: cada sesión genera su propia imagen OG con el total y emojis
- **Cache optimizado**: imágenes cacheadas 24h en CDN de Vercel
- **Robots.txt**: configuración correcta para buscadores

Cuando alguien comparte `https://la-jodita.vercel.app/s/abc123`, la plataforma automáticamente descarga una imagen PNG personalizada generada en el servidor.

Para ver la tarjeta antes de compartir, abrí `/open-graph` o usá `/open-graph?id=abc123` con un ID real de sesión.
Esa vista de preview solo responde en `localhost`; en producción devuelve `404`.

La documentación de desarrollo, patrones, SEO y operativa debe mantenerse únicamente en [CLAUDE.md](./CLAUDE.md), [AGENT.md](./AGENT.md) y este README.

Para habilitar sesiones compartidas entre usuarios, configurá estas variables en el proyecto de Vercel:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Sin esas variables, las rutas de sesión (`/api/s`) responderán con error `503`.

### Estructura del proyecto

```text
La-Jodita-Gastos/
├── src/
│   └── pages/
│       └── index.astro    ← Toda la app (HTML + CSS global + JS inline)
├── CLAUDE.md              ← Instrucciones para el agente IA
├── astro.config.mjs
├── package.json
└── .gitignore
```

---

## 🛠️ Comandos

```bash
npm run dev         # Servidor de desarrollo (http://localhost:4321)
npm run dev:bitrix  # Dev server + Cloudflare Tunnel (URL HTTPS pública)
npm run build       # Build de producción en /dist
npm run preview     # Preview del build de producción
```

### 🌐 Dev tunnel (opcional)

`npm run dev:bitrix` levanta el dev server **y** un Cloudflare Tunnel en un único proceso.
Útil para exponer la app a URL HTTPS pública (testear desde celular, webhooks, iframes).

Requisitos:

- `cloudflared` instalado (`winget install Cloudflare.cloudflared` / `brew install cloudflared`)
- `CLOUDFLARE_TUNNEL_TOKEN` en `.env.local` (ver [env.example](./env.example))
- Public Hostname configurado en Cloudflare Zero Trust apuntando a `localhost:4321`

El orquestador vive en [scripts/dev-bitrix.ts](./scripts/dev-bitrix.ts). Guía completa en
[DevelopLocal/promptInicial.md](./DevelopLocal/promptInicial.md) (carpeta gitignored, toolkit interno).

---

## 🤝 Forma de trabajo

1. Leer completo el bloque que se va a tocar antes de editar.
2. Aplicar cambios puntuales (sin refactors masivos no solicitados).
3. Correr `npm run build` para validar.
4. Si hay cambios de producto, mantener sincronizados:
   - `README.md`
   - `CLAUDE.md`
   - `agent.md`
5. No crear markdown extra de información, resumen o guías; si hace falta documentar algo relevante, actualizar solo estos tres archivos.
6. No romper compatibilidad de claves en localStorage.

---

## 📐 Algoritmo de liquidación

El algoritmo minimiza la cantidad de transferencias necesarias:

1. **Pagos** — suma total pagado por cada persona (en moneda base)
2. **Consumos** — suma de lo que le corresponde según las divisiones
3. **Balance** = `pagado − consumido`
   - Positivo → acreedor (le deben plata)
   - Negativo → deudor (debe plata)
4. **Compensación greedy** — ordena deudores y acreedores de mayor a menor,
   asigna transferencias mínimas hasta saldar todos los balances

---

## 🤖 Desarrollo con IA

Este proyecto incluye [CLAUDE.md](./CLAUDE.md) y [agent.md](./agent.md) con instrucciones para agentes IA.

Si usás Claude Code, el agente lee el contexto automáticamente:

```bash
claude
```
