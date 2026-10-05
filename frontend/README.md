# Frontend

Interfaz web de Chiga Tech. React 19 + TypeScript, con Vite, Tailwind CSS v4 y React Router.

Para el setup general del repo (requisitos, BD, flujo de trabajo) ver el [README de la raíz](../README.md).

## Comandos

Se corren desde `frontend/`:

| Comando                     | Qué hace                                                                      |
| --------------------------- | ----------------------------------------------------------------------------- |
| `npm install`               | Instala las dependencias (solo la primera vez o cuando cambia `package.json`) |
| `npm run dev`               | Levanta el servidor de desarrollo en http://localhost:5173                    |
| `npm run build`             | Verifica tipos y genera el build de producción en `dist/`                     |
| `npm test`                  | Corre los tests una vez                                                       |
| `npm run test:watch`        | Corre los tests y los repite al guardar                                       |
| `npm run typecheck`         | Verifica los tipos de TypeScript                                              |
| `npm run lint` / `lint:fix` | Revisa el código / corrige lo que se pueda automáticamente                    |
| `npm run format`            | Formatea el código con Prettier                                               |

El servidor de desarrollo **no muestra errores de tipos**: los ves en el editor, con `npm run typecheck` o al hacer commit/push.

## Estructura

```
src/
├── features/          # Una carpeta por funcionalidad del sistema
│   ├── auth/
│   │   ├── Login.tsx        # Página principal de la feature
│   │   ├── components/      # Elementos propios de esta feature
│   │   ├── hooks/
│   │   └── models/
│   ├── clientes/
│   ├── empleados/
│   ├── stock/
│   └── ventas/
├── shared/            # Elementos compartidos en toda la app
│   ├── components/
│   ├── hooks/
│   └── lib/
├── routes.tsx         # Definición de rutas (URL → página)
├── main.tsx           # Punto de entrada
└── index.css          # Estilos globales y Tailwind
```

- Cada funcionalidad nueva (ventas, clientes, stock...) va en su propia carpeta dentro de `features/`.
- Para agregar una página, creala dentro de su feature y registrala en `routes.tsx`.
- Los estilos se escriben con clases de Tailwind directamente en el JSX. Los íconos salen de [lucide-react](https://lucide.dev/icons/).

## Convenciones

- **Tipos de la API:** cada tipo replica a mano un DTO del backend, incluida su nulabilidad (`string?` en C# -> `string | null`). Si cambiás un DTO, actualizá el tipo en el mismo cambio. Ver el [ADR técnico 0001](../docs/adr/tecnico/0001-typescript-en-el-frontend.md).
- **`any`:** se permite como último recurso, en typescript hay que evitarlo y tipar con un tipo adecuado, pero el lint solo lo marcará como advertencia.
- **Tests:** van al lado del archivo que prueban, con el nombre `*.test.ts` o `*.test.tsx` (Vitest).
- **Lint:** [oxlint](https://oxc.rs/) hace el lint general (`.oxlintrc.json`) y ESLint solo revisa reglas de seguridad (`eslint.config.mjs`). El formato lo define `.prettierrc`.

Al hacer commit, husky corre el lint y Prettier sobre los archivos que cambiaste; si algo no se puede corregir solo, el commit se detiene y te muestra el error. Se puede instalar las extensiones de oxlint y Prettier en el editor para verlo antes.
