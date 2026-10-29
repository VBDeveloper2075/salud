# Salud

App web personal para **registrar nutrición y actividad física** sin servicios de IA ni APIs de alimentos de pago. Interfaz en **español (Argentina)**.

## Qué hace

- **Nutrición:** formulario manual con catálogo local de alimentos, macros calculados por gramos/porciones, comidas habituales guardadas e ingreso manual de calorías y macros.
- **Actividades:** calendario anual (estilo planilla) con etiquetas: yoga, natación, stretching, gym, club, amigos.
- **Dashboard:** balance calórico diario, macros y gráficos semanales (Recharts).
- **Perfil:** meta de kcal, peso y datos básicos.

Los datos se guardan en **`localStorage`** y, si configurás Supabase e iniciás sesión en **Perfil**, se sincronizan con PostgreSQL (perfil, comidas por día, calendario de actividades y comidas habituales).

## Stack

| Área | Tecnología |
|------|------------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) 4 |
| Lenguaje | [TypeScript](https://www.typescriptlang.org/) |
| Gráficos | [Recharts](https://recharts.org/) |
| Iconos | [Lucide React](https://lucide.dev/) |
| Validación | [Zod](https://zod.dev/) (donde aplica) |
| Backend opcional | [Supabase](https://supabase.com/) Auth + PostgreSQL (sync en Perfil) |

## Requisitos

- Node.js 20+
- npm

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # producción
npm run start   # servir build local
npm run lint
```

### Supabase

1. Creá un proyecto en [Supabase](https://supabase.com/).
2. En **SQL Editor**, ejecutá en orden `supabase/migrations/001_initial_schema.sql` y `002_app_extensions.sql`.
3. Copiá `.env.example` → `.env.local` y completá `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. En **Authentication → Providers**, habilitá **Email** (contraseña).
5. En la app, **Perfil → Cuenta y nube**: registrate o iniciá sesión.

Proyecto compatible con [Vercel](https://vercel.com/) u otro host Next.js; las variables de Supabase son opcionales si solo usás almacenamiento local.

## Despliegue

En el host, definí las mismas variables `NEXT_PUBLIC_*` que en local si querés sync en la nube.
