## Qué hice

<!-- Lo que hice, qué cambia y por qué. Acá se explica muy brevemente el contexto si hace falta y después se detalla técnicamente lo que se hizo -->

## Cómo probarlo

<!-- Pasos para que quien revisa pueda verificar el cambio. Por ejemplo:

1. `npm run db:reset` (si hay migraciones o seeds nuevos)
2. Levantar backend y frontend
3. Ir a /clientes, cargar un cliente y verificar que aparezca en la lista

-->

## Issue(s) relacionadas

<!-- Una lista que contenga por ejemplo:

- Closes #12
- Closes #13
- Esperando que se resuelva #14

Estos hashtags apuntan a issues, al relacionarlas acá en la PR sabemos el 
contexto del problema resuelto en esta PR y además poner "Closes" antes del
hashtag cierra automáticamente la issue cuando la PR se mergea a dev/
-->

## Checklist

### Sobre el repositorio en general

- [ ] Los checks del CI están en verde
- [ ] Si cambié un DTO del backend, actualicé su tipo en el frontend
- [ ] Si cambié la BD, lo hice con una migración nueva (no edité una `V...` existente) y probé `npm run db:reset`
- [ ] Actualicé la documentación afectada (README, ADR, ERS, CONTEXT)

### Sobre tus cambios

<!-- Acá agregas la lista de checks completados, varios de ellos pueden haberse
agregado previamente en la issue que esté relacionada con esta PR -->
