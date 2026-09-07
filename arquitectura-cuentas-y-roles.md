# 🔐 Mente en Juego — Arquitectura de cuentas, roles y dispositivos
*Especificación para la implementación en Supabase (Fase 2). Complementa el README.*

## 1. Principios innegociables
1. **Los niños NUNCA tienen credenciales**: ni email, ni contraseña, ni cuenta propia. Existen como registros colgados de una familia. (Clave para COPPA, Ley 25.326 y equivalentes.)
2. **Los niños NUNCA tienen acceso de administrador**: su sesión solo puede jugar y sincronizar SU progreso. Todo lo demás (panel, pagos, tareas, vínculos) vive del lado adulto.
3. **Mínimo privilegio por rol**: cada rol ve exactamente lo que necesita, aplicado en la base de datos con Row Level Security (no solo en la interfaz).
4. La docente **jamás** ve estado de pago, ubicación ni datos sensibles de las familias.

## 2. Autenticación (Supabase Auth)
- **Padres/madres/cuidadores**: OAuth con **Google** y **Apple** (Apple es obligatorio si hay app iOS) + **email con código OTP** como alternativa sin redes. Facebook: opcional (evaluar si el público lo usa; hoy aporta poco y suma superficie de riesgo).
- **Docentes y directivos**: mismos métodos, con verificación adicional de pertenencia institucional (invitación del directivo o dominio de email institucional).
- **Niños**: SIN Auth. Sus dispositivos reciben un token de alcance limitado (ver §5).

## 3. Esquema de datos (tablas principales)
| Tabla | Campos clave | Notas |
|---|---|---|
| `familias` | id, creada | La unidad de facturación y privacidad |
| `familia_miembros` | familia_id, user_id, nombre_visible, rol_familiar (admin/adulto) | Hasta 2+ adultos → certificados con ambos nombres |
| `ninos` | id, familia_id, nombre, avatar, nacimiento, ajustes (solito, esi…) | SIN user_id: no son usuarios |
| `dispositivos_nino` | id, nino_id, token_hash, alta, ultima_conexion, revocado | Sesión permanente revocable |
| `codigos_vinculacion` | codigo (8 chars), nino_id, expira (15 min), usado | Un solo uso |
| `sesiones_juego` | nino_id, juego, area, puntos, maximo, fecha, duelo | El progreso |
| `tareas`, `tareas_asignadas` | (formato JSON actual de la app) | Migra tal cual |
| `instituciones` | id, nombre, provincia, ciudad, plan | Colegios/jardines |
| `institucion_miembros` | institucion_id, user_id, rol (directivo/docente/orientacion) | |
| `aulas` | id, institucion_id, nombre, codigo_aula | |
| `aula_alumnos` | aula_id, nino_id, estado (pendiente/confirmado) | El PADRE carga el código y confirma |
| `suscripciones` | familia_id, plan, estado, proveedor (MP/Stripe) | Invisible para docentes |
| `canjes`, `vinculos_amigos`, `certificados` | … | Según lo ya diseñado en la app |

## 4. Matriz de roles y permisos
| Acción | Padre (admin familiar) | Adulto 2 | Dispositivo-niño | Docente | Directivo | Orientación* |
|---|---|---|---|---|---|---|
| Loguearse con OAuth | ✅ | ✅ | ❌ (token) | ✅ | ✅ | ✅ |
| Crear/editar hijos | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Vincular/revocar dispositivos | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Jugar y sync del propio progreso | — | — | ✅ (solo SU niño) | ❌ | ❌ | ❌ |
| Ver panel/informes del hijo | ✅ | ✅ | ❌ | ❌ | ❌ | con permiso |
| Pagar/gestionar suscripción | ✅ | opcional | ❌ | ❌ | ❌ | ❌ |
| Crear tareas y biblioteca | ❌ | ❌ | ❌ | ✅ (sus aulas) | ✅ | ❌ |
| Ver completitud de tareas del aula | ❌ | ❌ | ❌ | ✅ (sí/no + fecha) | ✅ | ❌ |
| Ver progreso individual detallado | solo su hijo | solo su hijo | ❌ | ❌** | ❌** | con permiso |
| Ver estado de pago de familias | — | — | ❌ | ❌ NUNCA | ❌ NUNCA | ❌ |
| Gestionar aulas y docentes | ❌ | ❌ | ❌ | ❌ | ✅ (su institución) | ❌ |
| Métricas agregadas institucionales | ❌ | ❌ | ❌ | su aula | ✅ | ❌ |
| Mapas de calor país/provincia/ciudad | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (solo equipo interno, agregado y anónimo) |

\* Orientación/psicopedagogía escolar: acceso a datos individuales SOLO con permiso explícito y revocable de cada familia (checkbox en el panel del padre).
\** Docentes y directivos ven progreso agregado del aula y completitud de tareas; el detalle individual es de la familia (que puede compartir el informe si quiere).

## 5. Flujo de alta del dispositivo del niño (tu idea, formalizada)
1. El padre se loguea (Google/Apple/OTP) en SU teléfono y da de alta a su hijo.
2. Pide "vincular dispositivo" → el servidor genera un **código de 8 caracteres que expira en 15 minutos** y es de un solo uso.
3. En el celu/tablet del niño se abre la app → "Tengo un código de mi familia" → se ingresa.
4. El servidor valida y emite un **token de dispositivo de larga duración** con alcance `nino:{id}` (solo jugar y sincronizar su progreso). La sesión **queda abierta para siempre**.
5. El padre puede ver los dispositivos vinculados y **revocar cualquiera** desde su panel ("cerrar sesión en ese aparato"), p. ej. si se pierde la tablet.
6. En el dispositivo del niño, el botón Padres pide el **código de familia** (llave local): el panel nunca es alcanzable por el niño.

Rate-limit de códigos (5 intentos), tokens hasheados en DB, y auditoría de vinculaciones.

## 6. Flujo institucional
1. La institución se da de alta (contrato/licencia) → primer **directivo** invitado por email.
2. El directivo crea aulas e invita **docentes** (email institucional o link de invitación).
3. La docente genera el **código de aula**; lo comparte con las familias.
4. **El padre** (nunca la docente) carga el código en su panel y confirma la pertenencia de su hijo → doble confirmación como ya diseñamos.
5. La docente asigna tareas a sus aulas (misma Biblioteca actual, pero con envío directo y tablero de completitud).
6. Bajas: el padre puede sacar a su hijo del aula cuando quiera; fin de ciclo lectivo archiva el aula.

## 7. Estado actual en la app (ya implementado, listo para migrar)
- **Modo dispositivo del peque** local: código de familia + bloqueo del dispositivo a un hijo + sesión siempre abierta + panel bajo llave (Panel → ⚙️ Familia y ajustes → 📱).
- Códigos de tarea/aula con doble confirmación, formato JSON que migra tal cual a `tareas`.
- Consentimiento por país con provincia/ciudad para métricas agregadas.

## 8. Pendientes de decisión (para vos + abogado)
- Proveedores OAuth finales (recomendado: Google + Apple + OTP; Facebook opcional).
- Retención y borrado: qué pasa con los datos del niño al cerrar la familia (propuesta: export + borrado a 30 días).
- Orientación escolar: redacción exacta del permiso por familia.
- Menores como docentes ayudantes, tutores no padres, familias ensambladas con 3+ adultos: contemplar `familia_miembros` N adultos.
