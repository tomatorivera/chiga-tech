# Frontend

React 19 + TypeScript, con Vite, Tailwind CSS v4 y React Router.

## Comandos

Desde `frontend/`:

| Comando                     | Qué hace                                        |
| --------------------------- | ----------------------------------------------- |
| `npm run dev`               | Servidor de desarrollo en http://localhost:5173 |
| `npm test` / `test:watch`   | Tests una vez / al guardar                      |
| `npm run typecheck`         | Verifica tipos                                  |
| `npm run lint` / `lint:fix` | Revisa / corrige el código                      |
| `npm run format`            | Formatea con Prettier                           |
| `npm run build`             | Build de producción en `dist/`                  |

`npm run dev` **no muestra errores de tipos**: miralos en el editor o con `typecheck`.

## Estructura

```
src/
├── features/          # Una carpeta por funcionalidad
│   ├── auth/
│   │   ├── Login.tsx      # Página principal de la feature
│   │   ├── components/    # Solo de esta feature
│   │   ├── hooks/
│   │   └── models/
│   ├── clientes/
│   ├── empleados/
│   ├── stock/
│   └── ventas/
├── shared/            # Compartido por toda la app
│   ├── components/
│   ├── hooks/
│   └── lib/
├── routes.tsx         # URL → página
├── main.tsx           # Punto de entrada
└── index.css          # Estilos globales y Tailwind
```

Para agregar una página: creala en su feature y registrala en `routes.tsx`. Estilos con clases de Tailwind en el JSX; íconos de [lucide-react](https://lucide.dev/icons/).

## Convenciones

- **Código en general:** en `../AGENTS.md`
- **Tipos de la API:** replican a mano los DTOs del backend, con su nulabilidad (`string?` → `string | null`). Si cambia un DTO, se actualiza en el mismo cambio ([ADR técnico 0001](../docs/adr/tecnico/0001-typescript-en-el-frontend.md)).
- **`any`:** solo como último recurso; el lint lo marca como advertencia.
- **Tests:** junto al archivo que prueban, como `*.test.ts(x)` (Vitest).
- **Lint y formato:** [oxlint](https://oxc.rs/) para el lint general, ESLint solo para seguridad, Prettier para formato. Instalá sus extensiones en el editor para ver los errores antes del commit.

---

[**<- Anterior**](../backend/README.md) (backend) -- [**Siguiente ->**](../docs/GIT.md) (flujo de trabajo)
