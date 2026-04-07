# Recomendados (`recomendados`)

Aplicación web donde personas autenticadas publican recomendaciones de **películas, series o libros** (título, descripción, imagen y enlace a la ficha). El resto puede **votar a favor o en contra**; los listados priorizan el consenso (saldo neto de votos), con desempates definidos en la especificación. La interfaz está pensada en **español**, con criterio **rioplatense** cuando encaja.

## Características (MVP)

- Registro, inicio de sesión y recuperación de contraseña.
- Crear recomendaciones con los campos previstos por producto.
- Votar en recomendaciones (un voto por usuario y recomendación; cambiar de signo reemplaza el voto).
- Listado principal y vista por usuario; reputación según las reglas documentadas.
- Rol `admin` para tareas de moderación (p. ej. gestión de usuarios).

El detalle de requisitos, modelo de datos y reglas de negocio está en [SPECS/SPECS.md](SPECS/SPECS.md).

## Stack técnico

| Área | Tecnología |
|------|------------|
| Framework | [Next.js](https://nextjs.org) (App Router), `src/app/` |
| UI | React 19, Tailwind CSS 4, componentes tipo shadcn en `src/components/ui/` |
| Datos | [Drizzle ORM](https://orm.drizzle.team/), esquema y migraciones en `src/server/db/` |
| Base | LibSQL (p. ej. [Turso](https://turso.tech/)) vía `@libsql/client` |
| Sesión | [iron-session](https://github.com/vvo/iron-session), capa de acceso en `src/lib/dal.ts` |
| Mutaciones | Server Actions junto a las rutas y en `src/app/actions/` |
| Calidad | [Biome](https://biomejs.dev/) (`lint`, `format`) |

Arquitectura, convenciones de carpetas, seguridad de cookies y variables de entorno: [SPECS/SPECS.md](SPECS/SPECS.md) (sección 4 en adelante).

## Requisitos previos

- [Bun](https://bun.sh/) (recomendado; el repo incluye `bun.lock`) o otro runtime compatible con los scripts de `package.json`.
- Base LibSQL/Turso y un secreto de sesión seguro en producción.

Copiá `.env.example` a `.env` y completá al menos:

- `SESSION_SECRET` — obligatorio para la sesión (`src/lib/session.ts`).
- `TURSO_DATABASE_URL` o `DATABASE_URL`, y si aplica `TURSO_AUTH_TOKEN` o `DATABASE_AUTH_TOKEN`.

Opcionales según entorno: `APP_URL`, credenciales de admin seed, `RESEND_*` para email de recuperación de contraseña. Ver comentarios en [`.env.example`](.env.example).

## Desarrollo local

```bash
bun install
bun run db:push    # aplicar esquema (o db:generate + migraciones si preferís ese flujo)
bun run db:seed    # opcional: datos iniciales
bun run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Servidor de desarrollo Next.js |
| `bun run build` / `bun run start` | Build y servidor de producción |
| `bun run lint` / `bun run format` | Biome check / formateo |
| `bun run typecheck` | TypeScript sin emitir |
| `bun run db:generate` | Generar migraciones SQL (Drizzle Kit) |
| `bun run db:push` | Aplicar esquema a la base |
| `bun run db:studio` | Drizzle Studio |
| `bun run db:seed` | Ejecutar seed |

También podés usar `npm run` / `pnpm run` con los mismos nombres de script.

## Documentación en el repo

- [SPECS/IDEA.md](SPECS/IDEA.md) — idea de producto en lenguaje natural.
- [SPECS/SPECS.md](SPECS/SPECS.md) — especificación funcional y técnica (MVP, datos, ordenación, reputación, roadmap).
- [SPECS/referred-by/SPECS.md](SPECS/referred-by/SPECS.md) — **evolutivo**: referidos, aprobación de registros y reglas de reputación ligadas al invitador (fuera del núcleo MVP descrito arriba).

## Deploy

La forma habitual de publicar una app Next.js es [Vercel](https://vercel.com/docs/frameworks/nextjs) u otro host que ejecute Node. Configurá las mismas variables de entorno que en local y revisá la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying).
