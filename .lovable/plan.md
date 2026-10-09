# Formulario Wizard de 3 pasos para “Vende tu Vehículo”

## Objetivo
Convertir el formulario actual en un proceso guiado, claro y adaptable a celular, conservando las tres modalidades de venta existentes.

## Cambios
1. **Paso 1 — Datos del vehículo**
   - Tipo, marca, modelo, año, kilometraje, ciudad y placa.
   - Validar los campos obligatorios antes de permitir avanzar.

2. **Paso 2 — Fotos y documentos**
   - Solicitar mínimo 3 fotos para motos y 5 para carros, con máximo de 8.
   - Añadir carga separada de tarjeta de propiedad: frente y reverso.
   - Mantener esos documentos en almacenamiento privado, separados de las fotos públicas del vehículo.
   - Mostrar un aviso visible de confidencialidad y uso exclusivo para validación administrativa.

3. **Paso 3 — Precio y contacto**
   - Mostrar un precio sugerido aproximado usando vehículos comparables del inventario y una depreciación por antigüedad.
   - Permitir que el usuario indique su precio esperado.
   - Solicitar nombre y número de WhatsApp, sin correo electrónico.
   - Incluir aceptación del tratamiento de datos y enviar la solicitud según la modalidad elegida.

4. **Experiencia del Wizard**
   - Barra de progreso con el paso actual y estados completados.
   - Botones “Atrás” y “Continuar”; solo el último paso envía la solicitud.
   - Conservar la información al cambiar entre pasos.
   - Al escoger una modalidad, marcarla y desplazar la página automáticamente al formulario.
   - Mostrar errores junto al campo correspondiente y un resumen final de éxito.

## Validación
- Probar los recorridos para moto y carro, incluyendo mínimos de fotos, documentos y campos obligatorios.
- Confirmar que las tarjetas de propiedad no aparezcan en vistas públicas.
- Revisar el formulario en celular y escritorio y comprobar que no haya texto invisible ni desbordamientos.
