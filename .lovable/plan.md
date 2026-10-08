# Rebranding a ClickMotores y rediseño (Módulos 1–3 + textos legales)

## 1. Marca
- Cambiar "JG Motors" por "ClickMotores" en Header, Logo, títulos de cada página, notificaciones, modales, chatbot y mensajes de WhatsApp.
- "ClickMotores.com" solo en metadatos SEO, Footer y enlaces de compartir.
- Leyenda del Footer: "ClickMotores es una marca comercial y vitrina virtual operada legalmente por JG Motors. Todos los derechos reservados."
- Nuevo logotipo con la palabra "ClickMotores" e icono de pestaña (favicon) a juego.

## 2. Portada (Hero)
- Título nuevo: "Conectamos personas, concesionarios y vehículos con total transparencia."
- Subtítulo y aviso de cobertura nacional con los textos que enviaste.
- Pestañas CARROS / MOTOS y buscador rápido (Ciudad, Tipo, Marca, Modelo, Rango de precio). Al buscar, abre el Inventario con esos filtros aplicados.
- Botones: [Ver Inventario] oscuro y [Vender / Consignar Vehículo] blanco con borde.
- Nueva imagen de fondo clara: sedán, SUV compacta, moto, scooter, con detalles de contratos/seguros. Lleva una capa suave encima para que el texto se lea bien.

## 3. Estilo general (claro, cero texto invisible)
- Fuente Plus Jakarta Sans en todo el sitio.
- Fondo blanco o gris muy claro. Tarjetas blancas con borde suave y sombra ligera.
- Títulos en gris casi negro y párrafos en gris de lectura.
- Campos de formulario blancos con placeholder visible y borde resaltado al escribir.
- Solo el Header, el Footer y los botones oscuros llevan texto blanco. Se revisan todas las páginas para eliminar texto blanco sobre fondo claro.
- Botones principales en rojo #DC2626 o amarillo, y secundarios en gris suave.

## 4. Página "Vende tu Vehículo"
- 3 tarjetas: Publicar Gratis, Compra Directa y Consignación Comercial, con los textos que enviaste. Al elegir una, se marca con borde rojo y la página baja sola hasta el formulario.
- Formulario en 3 pasos con barra de progreso:
  1. Vehículo: tipo, marca, modelo, año, kilometraje y ciudad (obligatoria).
  2. Fotos: mínimo 3 para motos y 5 para carros, más la tarjeta de propiedad (frente y reverso) con el aviso de privacidad.
  3. Contacto y precio: nombre y WhatsApp. En "Publicar Gratis" se muestra un precio sugerido según marca, modelo y año.
- Casilla de aceptación con el texto legal nuevo.
- Sección "¿Por qué elegir ClickMotores?" con los 5 diferenciales.

## 5. Datos y seguridad
- Las fotos y las tarjetas de propiedad se guardan en carpetas separadas. Las tarjetas solo las ve el administrador.
- La placa completa queda guardada. En el sitio público solo se muestra "Placa terminada en: X".
- Regla de 90 días: no se puede repetir una publicación gratuita con la misma placa dentro de 90 días. Se valida también en el servidor, no solo en la pantalla.

## 6. Contacto y panel admin
- Se eliminan los campos e iconos de correo electrónico. Todo el contacto va por un solo número de WhatsApp.
- Instagram y Facebook quedan visibles en el Header y el Footer.
- Botón "Exportar a Excel (.csv)" en Leads y Solicitudes, con tildes y eñes correctas al abrir en Excel.

## 7. Textos legales
- Reemplazo de Términos y Habeas Data con el contenido nuevo: operador Jg Motors, NIT 1130674978-2, Yumbo/Cali, Ley 1581 y confidencialidad de la tarjeta de propiedad.

## Aviso importante
- Tu espacio de trabajo no permite carpetas públicas de fotos, así que las fotos de vehículos siguen privadas y se muestran con enlaces de larga duración. El resultado visible es el mismo. Si quieres que la carpeta sea pública, un administrador puede activarlo en Settings → Privacy & Security.
- El precio sugerido es aproximado: se calcula con los vehículos similares del inventario más una regla de depreciación por año. No usa una fuente oficial de precios.

## Detalles técnicos
- Tokens de color en `src/styles.css` (oklch) y fuente cargada con `<link>` en `__root.tsx`.
- Clases `@layer components` pasan a `@utility` de Tailwind v4.
- Regla de 90 días con un trigger de validación en `vehicle_submissions` y `leads`, más una consulta previa en el formulario.
- Imagen de portada generada en `src/assets`.
- Los filtros de búsqueda pasan al Inventario como parámetros en la dirección (`/catalogo?tipo=&marca=...`).
- Exportación CSV en el navegador con BOM UTF-8 (`\uFEFF`).
