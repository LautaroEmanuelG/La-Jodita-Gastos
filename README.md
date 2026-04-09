# 💸 Divisor de Gastos

> Dividí gastos entre amigos de forma simple, rápida y visual.
> Soporta múltiples monedas y calcula automáticamente quién le debe a quién.

![Astro](https://img.shields.io/badge/Astro-4.x-BC52EE?style=flat-square&logo=astro)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?style=flat-square&logo=javascript)
![CSS](https://img.shields.io/badge/CSS-Pure-1572B6?style=flat-square&logo=css3)
![Upstash Redis](https://img.shields.io/badge/Redis-Upstash-00E9A3?style=flat-square&logo=redis)

---

## ✨ Funcionalidades

| Feature                     | Descripción                                                   |
| --------------------------- | ------------------------------------------------------------- |
| 👥 **Participantes**        | Avatares con color único generado por nombre                  |
| 💱 **Multi-moneda**         | Moneda base configurable + equivalencias opcionales           |
| ⚡ **Carga rápida**         | Click en avatar para seleccionar pagador, Enter para agregar  |
| ✏️ **Edición inline**       | Editá quién pagó y la división sin salir de la lista          |
| 🧮 **Liquidación**          | Mínimas transferencias para saldar todas las deudas           |
| 💾 **Persistencia local**   | Todo se guarda en `localStorage`, sin cuenta ni login         |
| 🔗 **Sesiones compartidas** | Guarda snapshot en Redis y genera links cortos para compartir |

---

## 🚀 Inicio rápido

```bash
git clone git@github.com:LautaroEmanuelG/Divisor-Gastos.git
cd Divisor-Gastos
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

## ☁️ Variables de entorno (Vercel)

Para habilitar sesiones compartidas entre usuarios, configurá estas variables en el proyecto de Vercel:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Sin esas variables, las rutas de sesión (`/api/s`) responderán con error `503`.

### Estructura del proyecto

```text
Divisor-Gastos/
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
npm run dev      # Servidor de desarrollo (http://localhost:4321)
npm run build    # Build de producción en /dist
npm run preview  # Preview del build de producción
```

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

Este proyecto incluye [CLAUDE.md](./CLAUDE.md) con instrucciones para agentes IA.

Si usás Claude Code, el agente lee el contexto automáticamente:

```bash
claude
```
