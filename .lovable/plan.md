# Wizard de 3 pasos para “Vende tu Vehículo”

## Objetivo
Dejar la solicitud de venta como un recorrido guiado, seguro y adaptable a celular, conservando las modalidades existentes.

## Cambios
1. **Paso 1 — Datos del vehículo**
   - Solicitar tipo, marca, modelo, año, kilometraje, ciudad y placa.
   - Validar cada dato obligatorio antes de permitir continuar.
   - Conservar la información al avanzar o regresar.

2. **Paso 2 — Fotos y tarjeta de propiedad**
   - Permitir hasta 8 fotos del vehículo, con mínimo de 3 para motos y 5 para carros.
   - Solicitar frente y reverso de la tarjeta de propiedad por separado.
   - Guardar la tarjeta en almacenamiento privado, separada de las fotos del vehículo.
   - Mostrar claramente que el documento es confidencial, se usa solo para validación administrativa y nunca se publica.

3. **Paso 3 — Precio y contacto**
   - Mostrar un precio sugerido aproximado usando vehículos comparables del inventario y su antigüedad.
   - Permitir ingresar el precio esperado.
   - Solicitar nombre y WhatsApp, sin correo electrónico.
   - Exigir la autorización de tratamiento de datos antes del envío.

4. **Experiencia y envío**
   - Mostrar progreso, pasos completados y botones “Atrás” y “Continuar”.
   - Enviar la solicitud únicamente desde el último paso y según la modalidad elegida.
   - Mostrar errores junto al recorrido y una confirmación final clara.
   - Validar nuevamente todos los datos en el servidor antes de guardar la solicitud.

## Validación
- Probar el recorrido completo para moto y carro, incluidos mínimos y máximo de fotos.
- Comprobar el rechazo de datos inválidos y documentos incompletos.
- Confirmar que la tarjeta de propiedad no sea accesible ni visible en páginas públicas.
- Revisar celular y escritorio para evitar textos invisibles, desbordamientos o controles difíciles de usar.
- Ejecutar las pruebas automatizadas de las reglas de fotos y comprobar que la página cargue sin errores.

## Detalles técnicos
- Se reutilizarán las modalidades y el inventario compartido de ClickMotores.
- La validación se mantendrá con esquemas en cliente y servidor.
- Los documentos se almacenarán mediante rutas privadas; la interfaz no expondrá sus direcciones.
