APP PARTES TRABAJO MONTEALINA V6 - OPTIMIZADA

Esta versión está optimizada para tablet:
- Los desplegables no consultan Google Sheets cada vez.
- Añadir parte es instantáneo.
- Los cambios son locales hasta pulsar Guardar parte.
- Guardar parte envía una sola llamada a Google Sheets.
- Actualizar datos sincroniza manualmente.
- Valida/avisa si las horas ordinarias de un empleado y día no suman 7,5.
- Subtipos de trabajo corregidos según TRABAJOS.xlsx.

Apps Script:
- Sustituye Code.gs por APPS_SCRIPT_V6.gs.
- Guarda.
- Implementar > Gestionar implementaciones > Editar > Nueva versión > Implementar.

Claves:
- Encargado: encargado
- Administrador: admin

API configurada:
https://script.google.com/macros/s/AKfycbxE4aVciugJpg9UwtOzWpIHmr5o05UH9ZNLxxuf3kl617b2Dd87LYns-4gd2foVU3dl/exec

Estructura Google Sheets:
Empleados:
ID | Nombre | Activo

Partes:
ID | Fecha | Empleado | Situacion | TipoZona | Zona | JM | TipoTrabajo | SubtipoTrabajo | Ordinarias | Peligrosidad | Extras

Instalación en tablet:
1. Sube la carpeta completa a Netlify Drop.
2. Abre la URL en Chrome desde la tablet.
3. Menú ⋮ > Añadir a pantalla de inicio.


V6.1:
- Sustituye el selector de fecha por tres desplegables grandes: día, mes y año.
- Añade botones: Hoy, Ayer, -1 día, +1 día y Última fecha.
- Al añadir parte nuevo, hereda la última fecha usada y datos básicos del parte anterior.
- Pensado para evitar bloqueos del calendario en tablet.


V6.2:
- Separa la pantalla de partes en dos pestañas:
  1) Parte en edición.
  2) Partes ya rellenos.
- Los partes ya rellenos se muestran resumidos.
- Desde "Partes ya rellenos" se puede pulsar Editar o Eliminar.
- El parte en edición muestra el formulario completo y el botón Guardar parte.


V6.3:
- Al pulsar "Añadir parte", ya no se copian datos del parte anterior.
- No se copia empleado, zona, J/M, tipo de trabajo ni subtipo.
- El nuevo parte queda en blanco salvo la fecha inicial.
- Esto evita errores cuando cada empleado realiza tareas distintas.


V6.4:
- Al pulsar Guardar parte, el parte queda guardado y pasa a Partes ya rellenos.
- Después se abre automáticamente un parte nuevo en blanco.
- El nuevo parte solo mantiene la fecha del parte guardado.
- No copia empleado, zona, J/M, tipo ni subtipo.


V6.5:
- Al entrar en la app no se muestra automáticamente el último parte guardado.
- La pestaña "Parte en edición" aparece limpia, con el botón Añadir parte.
- Los partes guardados solo aparecen en "Partes ya rellenos".
- Para modificar un parte guardado, hay que pulsar expresamente "Editar".


V6.7:
- Control diario inteligente.
- Fecha de inicio del control: 2026-05-20.
- No avisa por fechas anteriores.
- Solo revisa la fecha que se está rellenando.
- Para esa fecha comprueba:
  1. que cada empleado activo tenga al menos un parte;
  2. que sus horas ordinarias sumen 7,50.


V6.8:
- Zonas sincronizadas con el Excel oficial 'zonas trabajo.xlsx'.
- Añadida en A) COMUNES: 08 Parcela de la Central Térmica.
- Ajustadas descripciones oficiales de zonas:
  - 04 Sala de los vigilantes/conserjes
  - 05 Instalaciones mantenimiento/jardinería. Sólo almacén y cuartos mto-jardinería
  - 06 Depuradoras 1, 2 y3
  - 07 Parcela depósitos y grupo de presión+Pozos 1-4
  - 10 Pistas tenis y padel
  - 16 Zona H entre transversal 4 y 5 y tros Avda. 42


V6.9.1:
- Parte desde la v6.8 que funcionaba.
- Aplica formato de horas con coma y dos decimales.
- Evita modificar la lógica de acceso.
- Horas visibles como 7,50 / 4,00 / 0,00.


V6.9.2:
- Subtipo automático.
- Si un tipo de trabajo tiene un único subtipo, se rellena automáticamente.
- En ese caso se oculta el desplegable de subtipo y se muestra como campo bloqueado.
- Evita clics innecesarios y reduce errores.


V6.10.1:
- Parte desde la v6.9.2 estable.
- Añade redondeo seguro a medias horas.
- Se aplica a Ordinarias, Peligrosidad y Extras.
- 7,30 -> 7,50
- 7,20 -> 7,00
- 4 -> 4,00
- 0,25 -> 0,50


V6.10.2:
- Avance automático tipo tabulador.
- Al elegir Empleado pasa a Situación.
- Después Tipo zona, Zona, J/M, Tipo trabajo, Subtipo y horas.
- Si el subtipo es automático, salta directamente a Horas ordinarias.
- En horas se puede pulsar Enter para avanzar.
- Después de Extras se enfoca Guardar parte.


V6.10.3:
- Corrige el salto automático.
- Si el subtipo es automático, al elegir Tipo trabajo salta directamente a Horas ordinarias.
- No se queda en el campo Subtipo.


V6.10.4:
- Al rellenar un campo, intenta abrir automáticamente el desplegable del siguiente campo.
- Usa showPicker() en navegadores compatibles.
- Si el subtipo es automático, intenta saltar directamente a Horas ordinarias.
- En campos de horas, Enter pasa al siguiente campo.


V6.10.5:
- Base estable: v6.10.4.
- Añade búsqueda rápida de empleados.
- Añade botón "Copiar anterior" para copiar el empleado del parte anterior.
- Añade botón "Duplicar" para crear un parte nuevo partiendo de uno existente.
- No modifica login, Google Sheets ni Apps Script.


V6.10.6:
- Base estable: v6.10.5.
- Añade pestaña "Revisar extras" para buscar por empleado y revisar sus horas extras.
- Muestra total de extras, ordinarias, peligrosidad y listado de partes con extras.
- Si Extras > 0,00, Ordinarias pasa automáticamente a 0,00.
- Corrige "Copiar anterior" para que copie el empleado del parte anterior real, no el primero.


V6.10.7:
- La pestaña "Revisar extras" también está disponible para el encargado.
- El encargado puede buscar por empleado y comprobar si las horas extras están metidas.
- Dashboard, informes, validaciones y copias siguen siendo solo de administrador.


V6.10.8:
- En Parte en edición se quita el botón Duplicar.
- En Parte en edición quedan solo Guardar parte y Eliminar parte.
- El botón Duplicar queda únicamente en Partes ya rellenos.


V6.10.9:
- En "Revisar extras" se añaden filtros de fecha propios.
- Permite revisar extras de un empleado entre dos fechas concretas.
- Botón "Usar fechas generales" para copiar Desde/Hasta de la pantalla principal.


V6.10.10:
- Se elimina el botón "Copiar anterior" de Añadir parte.
- Se mantiene "Duplicar" solo en Partes ya rellenos.
- Nueva pestaña "Revisar ordinarias" disponible para encargado y administrador.
- Permite revisar por empleado y fechas:
  - días sin parte;
  - días con menos de 7,50 h ordinarias;
  - días con más de 7,50 h ordinarias;
  - días correctos.


V6.10.11:
- Corrige el botón Editar desde las pantallas de revisión.
- Al pulsar Editar, abre el parte en la pestaña Parte en edición.
- En Revisar extras añade botón Eliminar.
- En Revisar ordinarias añade acciones Editar / Eliminar para cada parte del día.
- Útil para borrar partes duplicados o erróneos desde la revisión por empleado.


V6.10.12:
- Añade calendario laboral 2026.
- No genera avisos en sábados ni domingos.
- No genera avisos en festivos del calendario laboral Madrid 2026 adjunto:
  01/01, 06/01, 02/04, 03/04, 01/05, 02/05, 15/05, 15/08,
  12/10, 02/11, 09/11, 07/12, 08/12 y 25/12.
- Revisar ordinarias solo comprueba días laborables.


V6.10.13:
- Orden diario fijo: Abdeslam, Enrique, Sonia, Fernando, Antonio, Jose, Miguel y Luis.
- Al crear/guardar un parte propone al siguiente trabajador pendiente de 7,50 h.
- Muestra progreso diario y horas pendientes por trabajador.


V6.10.13.1:
- Corrige el error "Maximum call stack size exceeded".
- La función de ordenación ya no se llama a sí misma.
- Mantiene el orden diario de trabajadores y el control de 7,50 horas.


V6.10.14:
- Cuando todos los empleados del día alcanzan 7,50 horas ordinarias,
  el siguiente parte se abre automáticamente en el siguiente día laborable.
- Salta sábados, domingos y festivos del calendario laboral 2026.
- Si todavía falta algún empleado u horas, mantiene la misma fecha.


V6.10.15:
- El administrador puede dar de baja empleados.
- Dar de baja NO borra al empleado ni sus partes anteriores.
- Los empleados de baja dejan de aparecer al crear nuevos partes.
- Los históricos, revisiones e informes siguen mostrando sus partes.
- Se puede reactivar un empleado dado de baja.


V6.10.16:
- Corrige el salto al siguiente día laborable.
- La comprobación incluye el parte que acaba de guardarse, evitando usar datos antiguos.
- Cuando todos los empleados activos alcanzan 7,50 h, abre el siguiente día laborable.
- Los empleados nuevos aparecen detrás del último empleado del orden fijo.
- Entre empleados nuevos se respeta el orden de alta de Google Sheets.


V6.10.17:
- Corrige el salto de Fernando a Jose.
- El orden ahora identifica el primer nombre de forma exacta.
- Orden garantizado: Abdeslam, Enrique, Sonia, Fernando, Antonio, Jose, Miguel y Luis.
- Los empleados nuevos continúan apareciendo al final.


V6.10.18:
- Añadido el subtipo "V. Limpieza jardinería" dentro de "06. Limpieza".
- Se mantienen sin cambios los subtipos existentes T y U.
- Actualizada la caché de la PWA para cargar esta versión.


V6.10.19:
- Si la situación es distinta de Trabajo, se borran Tipo zona, Zona,
  Jardinería/Mantenimiento, Tipo de trabajo y Subtipo.
- Peligrosidad y Extras quedan a 0 y bloqueadas.
- Las horas ordinarias se fijan automáticamente en 7,50 y no se pueden modificar.
- Tras elegir una situación distinta de Trabajo, el asistente pasa directamente a Guardar.
- La validación vuelve a aplicar estas reglas antes de enviar el parte a Google Sheets.


V6.10.20:
- Añade FechaAlta y FechaBaja a la hoja Empleados.
- La fecha de alta es obligatoria al crear un empleado.
- El administrador puede editar y guardar ambas fechas.
- Dar de baja propone la fecha actual y conserva todos los partes anteriores.
- Reactivar elimina la fecha de baja.
- La revisión de ordinarias solo exige partes entre FechaAlta y FechaBaja.
- El orden diario y el salto al siguiente empleado solo incluyen a quienes estaban
  de alta en la fecha concreta del parte.
- Los empleados antiguos sin FechaAlta usan provisionalmente 20/05/2026.


V6.10.21 - CORRECCIÓN:
- La revisión de ordinarias y extras utiliza todos los partes recibidos de Google Sheets,
  no solo los incluidos en el rango general de la pantalla.
- Corrige el caso en que el 12/06/2026 aparecía sin partes aunque sí existieran.
- El guardado de FechaAlta y FechaBaja localiza las columnas por su encabezado real.
- La preparación de hojas añade columnas ausentes sin sobrescribir columnas existentes.
- Después de guardar fechas, la aplicación comprueba que Google Sheets las devuelve.
- La aplicación detecta si el Apps Script publicado sigue siendo una versión anterior.


V6.10.22 - MODO COMPATIBLE:
- La aplicación ya no queda bloqueada si el Apps Script es antiguo.
- Solo se desactivan las funciones de FechaAlta y FechaBaja.
- Se muestra un aviso informativo en lugar de impedir el acceso.
- Para activar las fechas debe publicarse el APPS_SCRIPT_V6.gs incluido.


V6.10.23:
- URL correcta de Google Apps Script configurada.
- Eliminado el modo compatible y sus avisos.
- FechaAlta y FechaBaja activas.
- Se mantienen las correcciones de revisión usando todos los partes.
- API: https://script.google.com/macros/s/AKfycbyAmDTfuC8RMQXAytyn0VyfwwtP0IhZz_gujCJm7yX49W5Z0MaieoGk35w2nkia9h3d/exec
