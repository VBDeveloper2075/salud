# Salud

App web personal para **registrar nutrición y actividad física** sin servicios de IA ni APIs de alimentos de pago. Interfaz en **español (Argentina)**.

## Qué hace

- **Nutrición:** formulario manual con catálogo local de alimentos, macros calculados por gramos/porciones, comidas habituales guardadas e ingreso manual de calorías y macros.
- **Actividades:** calendario anual (estilo planilla) con etiquetas: yoga, natación, stretching, gym, club, amigos.
- **Dashboard:** balance calórico diario, macros y gráficos semanales (Recharts).
- **Perfil:** meta de kcal, peso y datos básicos.

Los datos del día (comidas, perfil, actividades) se guardan en **`localStorage`** del navegador. Supabase está preparado en `supabase/migrations/` pero aún no está conectado al flujo principal.

## Stack

| Área | Tecnología |
|------|------------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) 4 |
| Lenguaje | [TypeScript](https://www.typescriptlang.org/) |
| Gráficos | [Recharts](https://recharts.org/) |
| Iconos | [Lucide React](https://lucide.dev/) |
| Validación | [Zod](https://zod.dev/) (donde aplica) |
| Backend opcional | [Supabase](https://supabase.com/) (cliente SSR listo, sin sync activo) |

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

Variables de entorno opcionales (Supabase): copiá `.env.example` a `.env.local` y completá `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` cuando las uses.

## Despliegue

Proyecto compatible con [Vercel](https://vercel.com/) u otro host que soporte Next.js; no requiere variables de entorno para el uso actual solo con almacenamiento local.
