# Respuestas – TP N° 4 "Biblioteca IPF"

Todas las referencias son a archivos de este repositorio (`archivo:línea`).

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de useLibros

**a) Render por render**

Caso normal (`src/hooks/useLibros.ts`):

| Render | Qué lo provoca | `libros` | `cargando` | `error` |
|---|---|---|---|---|
| 1 | Se monta el Catálogo | `[]` | `true` | `null` |
| 2 | Llega la respuesta: `setLibros`, `setError(null)` y `setCargando(false)` (líneas 20, 21 y 29) | 31 libros | `false` | `null` |

Después del render 1 se ejecuta el efecto (línea 13), que llama a `obtenerLibros()`. Esa promesa tarda 800 ms. Cuando se resuelve, los tres `set` se hacen en la misma tarea y React los agrupa (*automatic batching*), así que hay **un solo** render más. En total son 2 renders.

Cuando falla y la persona toca "Reintentar":

| Render | Qué lo provoca | `libros` | `cargando` | `error` |
|---|---|---|---|---|
| 1 | Montaje | `[]` | `true` | `null` |
| 2 | `obtenerLibros()` lanza el error: `setError(...)` y `setCargando(false)` (líneas 25 y 29) | `[]` | `false` | "No pudimos cargar el catálogo…" |
| 3 | Toca "Reintentar": `setCargando(true)`, `setError(null)`, `setIntento(n + 1)` (líneas 43–45, agrupados) | `[]` | `true` | `null` |
| 4 | Llega la respuesta del segundo pedido | 31 libros | `false` | `null` |

Entre el render 3 y el 4, como cambió `intento`, React ejecuta primero la limpieza del efecto anterior (`activo = false`, línea 38) y después el efecto nuevo, que hace el segundo pedido.

**b) ¿Se desmonta el Catálogo?**

No. Las tabs dejan montadas las pantallas que ya se visitaron, así que al pasar a "Mis reservas" el Catálogo queda en memoria, solo pierde el foco. Al abrir un detalle tampoco: `libro/[isbn]` se apila encima del Catálogo en el Stack de la tab y el Catálogo queda debajo, montado. Con un `console.log` temporal en la limpieza (que después se borra, porque la entrega no puede tener `console.log`) no aparece nada en ninguno de los dos casos.

La limpieza que escribí se ejecuta en estas situaciones reales:
- cuando se toca "Reintentar", porque cambia `intento` y el efecto viejo se limpia antes de correr el nuevo;
- cuando el Catálogo se desmonta de verdad, por ejemplo al cerrar la app o en un *fast refresh* durante el desarrollo.

Aunque pase poco, sirve: si se toca "Reintentar" mientras hay un pedido en camino, la respuesta vieja no pisa a la nueva.

**c) ¿Por qué no se puede pasar una función `async` a `useEffect`?**

Porque `useEffect` espera que la función devuelva nada o una función de limpieza. Una función `async` siempre devuelve una **Promesa**, y React la tomaría como si fuera la limpieza, cosa que no es. Además no habría forma de devolver la limpieza de verdad. Lo resolví declarando una función `async` adentro del efecto y llamándola enseguida:

```ts
// src/hooks/useLibros.ts:13-40
useEffect(() => {
  let activo = true;

  async function cargar() {
    try {
      const datos = await obtenerLibros();
      if (activo) { setLibros(datos); setError(null); }
    } catch {
      if (activo) { setError('No pudimos cargar el catálogo. …'); }
    } finally {
      if (activo) { setCargando(false); }
    }
  }

  cargar();
  return () => { activo = false; };
}, [intento]);
```

**d) ¿Cómo implementé reintentar?**

Con un contador `intento` en el estado (línea 11) que está en el array de dependencias del efecto (línea 40). `reintentar` (líneas 42–46) le suma 1. Como cambia una dependencia, React vuelve a ejecutar el efecto y se hace un pedido nuevo. En el mismo evento pongo `cargando` en `true` y `error` en `null`, así la pantalla muestra el indicador enseguida.

Usé un número y no otro valor porque:
- `libros` o `error` como dependencia generan un ciclo: el efecto los cambia y eso lo vuelve a disparar;
- un booleano que se prende y se apaga necesita otro `set` para volver a su valor, y si dos reintentos dejan el mismo valor el efecto no corre;
- el contador cambia **solo** cuando la persona lo pide y siempre es distinto del anterior.

### B2. La condición de carrera del buscador

| Momento | Qué pasa | Sin limpieza: qué se ve | Con mi código: qué se ve |
|---|---|---|---|
| t = 0 ms | Escribe "bor" → `buscarLibros("bor")` (1.400 ms) | "Buscando…" | "Buscando…" |
| t = 200 ms | Escribe "borges" → `buscarLibros("borges")` (300 ms) | "Buscando…" | "Buscando…". Antes de buscar "borges" se ejecutó la limpieza del efecto de "bor": `vigente = false` |
| t = 500 ms | Llega la respuesta de "borges" | Los libros de Borges | Los libros de Borges |
| t = 1.400 ms | Llega la respuesta de "bor" | **Pisa** los resultados con la respuesta vieja de "bor". Con mis datos coinciden (los tres libros de Borges), pero si hubiera un título o autor con "bor" y sin "borges", aparecería aunque arriba diga "borges" | Sigue mostrando los de Borges: la respuesta de "bor" llega a un efecto con `vigente = false` y se descarta |

Con mi código real el caso es todavía más simple, porque tengo un *debounce* de 300 ms (`src/app/buscar.tsx:31`): a los 200 ms la persona sigue escribiendo, así que el temporizador de "bor" se cancela con `clearTimeout` (línea 53) y ese pedido ni siquiera se hace. La bandera `vigente` cubre el caso en que la persona hace una pausa de más de 300 ms y los dos pedidos salen igual.

**a) ¿Qué hace la limpieza?**

```ts
// src/app/buscar.tsx:51-54
return () => {
  vigente = false;
  clearTimeout(temporizador);
};
```

Cada ejecución del efecto tiene su propia variable `vigente` (línea 28). La limpieza pone en `false` la de **esa** ejecución, así que cuando su respuesta llega, el `if (vigente)` (líneas 34, 39 y 43) no deja hacer ningún `set`. También cancela el temporizador del *debounce*. Se ejecuta cuando cambia `texto` (el `q` de la URL): después del render con el texto nuevo y **antes** de ejecutar el efecto nuevo. También se ejecuta si se sale de la pantalla.

**b) La propuesta `if (texto === q)` dentro del `.then()`**

No funciona. La función del `.then()` es una clausura: guarda las variables del render en el que se creó. Ese `q` es el que había cuando se hizo **ese** pedido, que es el mismo `texto` que se buscó. Entonces la comparación siempre da `true` y la respuesta vieja se muestra igual. La clausura no "ve" el `q` actual, que vive en un render posterior. Para que funcionara habría que leer el valor más reciente desde algo que no quede congelado, como un `useRef` que se actualice en cada render. La bandera de la limpieza resuelve lo mismo de forma más directa.

**c) URL y botón atrás**

Con `router.setParams({ q })` (línea 61) la URL cambia en cada tecla (`/buscar?q=b`, `/buscar?q=bo`, …) pero **no se apilan pantallas**: se reemplazan los parámetros de la misma ruta. Al tocar atrás se sale del buscador de una vez, a la pantalla anterior. Si usara `router.push`, cada letra apilaría una pantalla de búsqueda nueva. Para "borges" habría 6 pantallas y la persona tendría que tocar atrás 6 veces, viendo cada búsqueda parcial. Además cada pantalla nueva se monta de cero y pierde el foco del teclado.

### B3. Mutar o reemplazar

**a)** El texto sigue mostrando **0**. `encolar` modifica el objeto que está guardado en el estado, pero no se llama a ningún `set`, así que React no se entera y no vuelve a renderizar. Para React el estado es la misma referencia de siempre.

**b)** Al escribir en el `TextInput` controlado se llama a su `set`, el componente se vuelve a renderizar y en ese render se lee `espera.tamanio`, que ya vale 3 porque el objeto estaba mutado. El número "salta" por un cambio que no tiene nada que ver. Un error que aparece "a veces" es peor que uno que aparece siempre porque depende de otra cosa que pase en la pantalla: cuesta reproducirlo, puede no aparecer en las pruebas y aparecer en el teléfono de alguien, y cuando aparece parece que la culpa es del `TextInput` y no de la cola.

**c) Cómo lo resolví**

En el Context nunca modifico una `Cola` ni una `Pila` que esté en el estado: creo una nueva a partir de la anterior y la guardo con el `set`:

```ts
// src/context/BibliotecaContext.tsx:105-108
const nueva = new Cola(esperas[isbn]?.aArray() ?? []);
nueva.encolar(MI_NOMBRE);
setEsperas((anteriores) => ({ ...anteriores, [isbn]: nueva }));
```

Lo mismo en `entregarAlSiguiente` (líneas 171–173) y con la `Pila` de recientes (líneas 151–153). Para eso las clases reciben un array en el constructor (`src/estructuras/Cola.ts:10`, `src/estructuras/Pila.ts:5`).

| Alternativa | Ventaja | Costo |
|---|---|---|
| **Cola nueva a partir de la anterior** (la mía) | React ve una referencia nueva y renderiza siempre. Los estados viejos no cambian, así que no hay "saltos" | Copia la cola en cada operación (O(n)). Con 2 o 3 personas por libro no importa |
| **Contador de versión** (mutar y hacer `setVersion(v + 1)`) | No copia nada | Es fácil olvidarse del `set`. La cola sigue siendo la misma referencia, así que `useMemo`, `React.memo` o una dependencia de un efecto no detectan el cambio |
| **`useReducer`** | Todas las transiciones quedan en un solo lugar, fáciles de probar | Más código. El reducer igual tiene que devolver objetos nuevos, así que no evita copiar |

### B4. ¿Dónde vive cada dato?

| Dato | Dónde vive en mi app | Por qué ahí y no en otro lugar |
|---|---|---|
| Texto del buscador | **URL** (`q`, `src/app/buscar.tsx:16`) | Así se puede abrir con un deep link (`/buscar?q=borges`). Es una sola fuente: no hay un estado local que se desincronice con la URL |
| Préstamos y reservas | **Context** (`prestamos`, BibliotecaContext.tsx:58) | Los usan varias pantallas que no son padre e hija: el detalle, el modal de reserva, Mis reservas y el mostrador |
| Listas de espera | **Context** (`esperas: Record<isbn, Cola>`, línea 59) | Las leen el detalle, el modal y Mis reservas, y las modifican la reserva y el mostrador |
| Vistos recientemente | **Context** (`recientes: Pila`, línea 60) | Se escriben en el detalle y se leen en el Catálogo, que son pantallas distintas |
| Sesión del personal | **Context** (`sesion`, línea 62) | La necesita el layout raíz para `Stack.Protected` y también el botón "Personal" |
| Ejemplares disponibles | **Se calcula** (`disponibles`, líneas 65–77) | Sale de `ejemplares` del libro menos los préstamos sacados del estante. Si lo guardara aparte, tendría que actualizar dos datos cada vez y podrían quedar distintos |
| Estado del permiso de cámara | **Sistema operativo**. La app tiene una copia en el estado local de `usePermiso` | La persona lo puede cambiar desde Ajustes sin pasar por la app, así que se vuelve a consultar al tomar foco y al volver a primer plano |
| Identificador de la notificación | **Context**, dentro de cada préstamo (`notificacionId`, `src/types/index.ts:13`) | Hace falta para cancelarla al devolver o al apagar el interruptor. El interruptor se calcula a partir de él (`notificacionId !== null`) |

**¿Quién se vuelve a renderizar cuando cambia el `value`?**

Todos los componentes que llaman a `useBiblioteca()`. El `value` está en un `useMemo` (líneas 208–247), pero cambia cuando cambia **cualquiera** de sus partes. La pantalla del Catálogo en sí no usa el Context, pero `EncabezadoCatalogo` (que solo lee `recientes`) y `BotonPersonal` sí. Entonces **sí**: al activar un recordatorio en Mis reservas cambia `prestamos`, se crea un `value` nuevo y esos dos componentes se vuelven a renderizar aunque no usen préstamos. Las filas del catálogo no, porque no leen el Context.

Para evitarlo se podría dividir en varios contextos (`RecientesContext`, `SesionContext`, `PrestamosContext`) o usar selectores. En una app de este tamaño no vale la pena: son dos componentes chicos, el render es instantáneo y la división agregaría varios archivos y providers sin una mejora que se note.

---

## Parte C · Navegación y rutas

### C1. La pila en tu app

| # | Acción | Pilas resultantes (de base a tope) |
|---|---|---|
| 1 | Abre la app | **Stack raíz:** `(tabs)` · **Tabs:** Catálogo activa · **Stack de Catálogo:** `index` |
| 2 | Toca un libro | Stack raíz: `(tabs)` · Stack de Catálogo: `index` → `libro/[isbn]` |
| 3 | Toca "Reservar" | Stack raíz: `(tabs)` → `reservar/[isbn]` (modal) · Stack de Catálogo: `index` → `libro/[isbn]` |
| 4 | Toca "Confirmar" | Stack raíz: `(tabs)` · Tabs: **Mis reservas** activa · Stack de Catálogo: `index` → `libro/[isbn]` (sigue igual) |
| 5 | Toca atrás (Android) | Stack raíz: `(tabs)` · Tabs: vuelve a **Catálogo** (las tabs vuelven a la primera) · Stack de Catálogo: `index` → `libro/[isbn]`: se ve el detalle |
| 6 | Toca la tab "Catálogo" | Stack raíz: `(tabs)` · Stack de Catálogo: `index` (tocar la tab que ya está activa vuelve al principio de su Stack) |

**a)** En el paso 4 usé `router.dismissTo('/reservas')` (`src/app/reservar/[isbn].tsx:49`). `dismissTo` cierra pantallas hasta llegar a la ruta indicada. Como `/reservas` está dentro de `(tabs)`, que está debajo del modal, cierra el modal y cambia a la tab Mis reservas.
- Con **`push`** se apilaría `(tabs)` otra vez encima del modal. Al tocar atrás, la persona volvería a la confirmación y podría reservar dos veces.
- Con **`replace`** el modal se cambiaría por la pantalla de reservas, pero en el Stack raíz. Quedarían dos `(tabs)` en la pila, y atrás llevaría a una copia vieja de las pestañas.
- **`dismissTo`** saca el modal de la pila, así que "atrás" no vuelve a la confirmación, que era lo que pedía la consigna.

**b)** En el paso 5 ya se ve el detalle, porque cada tab guarda su propia pila y la del Catálogo quedó en `index → libro`. En el paso 6, al tocar de nuevo la tab que está activa, el Stack vuelve a su primera pantalla y se ve el **Catálogo**. Me parece correcto: si alguien vuelve a la tab, encuentra el libro que estaba mirando, y si toca la tab otra vez, vuelve a la lista. Es lo mismo que hacen la mayoría de las apps.

### C2. El escáner que dispara de más

**a)** `onBarcodeScanned` se llama muchas veces por segundo mientras el código está frente a la cámara. Sin protección, cada llamada haría un `router.push`. Como vimos en el TP 2, las acciones de navegación entran en una cola y se procesan una tras otra, así que se apilarían 5, 10 o 20 detalles iguales. La persona tendría que tocar atrás muchas veces, y cada detalle además apila el libro en "recientes".

**b)** Usé **`useRef`** (`src/app/escanear.tsx:17`). Un `useState` puesto en `true` no alcanza porque el cambio recién se ve en el **render siguiente**. Las llamadas que ya llegaron antes de ese render usan una función creada en el render anterior, que todavía ve el valor viejo (`false`) por la clausura. Un ref en cambio se modifica al instante (`yaNavego.current = true`, línea 21) y todas las llamadas leen el mismo objeto, así que la segunda ya lo ve en `true` (línea 27).

**c)** Uso `router.replace` (línea 23) porque el escáner ya cumplió su función: si la persona toca atrás en el detalle, vuelve al Catálogo y no a una cámara abierta. Con `push`, al tocar atrás volvería al escáner, y si el libro sigue frente a la cámara volvería a abrir el detalle enseguida.

**d)** Si el ISBN no está en el catálogo, muestro un aviso amarillo ("El código … no está en el catálogo. Podés seguir escaneando.") y la cámara sigue activa (líneas 34–38). Para que no aparezca diez veces, guardo el último código desconocido en otro ref (`ultimoDesconocido`, línea 18) y solo actualizo el aviso si el código leído es distinto (línea 35). Así el mismo código no vuelve a hacer un `setState` en cada lectura.

### C3. Deep links y rutas protegidas

| Link | Qué ve la persona | Qué queda debajo en la pila | Qué parte de mi código lo decide |
|---|---|---|---|
| `bibliotecaipf://libro/9780132350884` | El detalle de *Clean Code*, con el título en el header | Catálogo (`index`) en el Stack de la tab, y `(tabs)` en el Stack raíz | `anchor: 'index'` en `src/app/(tabs)/(catalogo)/_layout.tsx:8` y `anchor: '(tabs)'` en `src/app/_layout.tsx:11` |
| `bibliotecaipf://libro/123` | "El código no es un ISBN válido" con el link "Volver al catálogo" | Igual que el anterior | La validación de `src/app/(tabs)/(catalogo)/libro/[isbn].tsx:15-16` y el `if (!libro)` de la línea 24 |
| `bibliotecaipf://buscar?q=borges` | El buscador con "borges" escrito y sus resultados | `(tabs)` con el Catálogo | `anchor: '(tabs)'` en `src/app/_layout.tsx:11`; `q` se lee con `useLocalSearchParams` (`buscar.tsx:16`) |
| `bibliotecaipf://mostrador` (sin sesión) | No ve el mostrador: queda en el Catálogo | `(tabs)` | `<Stack.Protected guard={sesion}>` en `src/components/NavegadorRaiz.tsx:28`. Con `guard` en `false` la ruta no existe y el router va a la ruta ancla |
| `bibliotecaipf://reserva` | Mis reservas | `(tabs)` (el `Redirect` reemplaza, no apila) | `<Redirect href="/reservas" />` en `src/app/reserva.tsx:5` |
| `bibliotecaipf://escanear` (cámara bloqueada) | El escáner con "La cámara está bloqueada…", el botón "Abrir Ajustes" y el ingreso manual del ISBN | `(tabs)` con el Catálogo | `aEstadoPermiso` (`src/lib/permisos.ts:12`) y el `case 'bloqueado'` de `src/app/escanear.tsx:67` |

**¿Por qué `/libro/123` llega al detalle?** Porque el router solo mira la **forma** de la URL: `libro/[isbn]` es un segmento dinámico que acepta cualquier texto, y el router no sabe qué libros existen. La responsabilidad de responder bien es de la **pantalla**: tiene que validar el parámetro y mostrar un mensaje claro con una salida. Eso hace mi detalle con `esIsbnValido` y `buscarLibroPorIsbn` (`src/lib/catalogo.ts`).

### C4. Foco, montaje y primer plano

**a)**
- `useEffect` con `[]`: se ejecuta una sola vez, cuando el componente **se monta**.
- `useFocusEffect`: se ejecuta cada vez que la pantalla **toma foco** dentro de la navegación (cambiar de tab, cerrar un modal, volver con atrás) y se limpia cuando lo pierde.
- `AppState`: avisa cuando **la app** pasa a segundo plano o vuelve a primer plano (`active` / `background`).

**b)** Si la persona va a Ajustes y vuelve, solo se entera **`AppState`**: la pantalla nunca se desmontó ni perdió el foco dentro de la app. Si va a la tab Catálogo y vuelve a Mis reservas, solo se entera **`useFocusEffect`**: la app nunca pasó a segundo plano y la pantalla ya estaba montada.

**c)** En `usePermiso` uso **las dos**: `useFocusEffect` (`src/hooks/usePermiso.ts:26`) y un listener de `AppState` con su `remove()` en la limpieza (líneas 29–41). `useFocusEffect` cubre la vuelta del modal `/permisos/...` y el cambio de pestaña. `AppState` cubre la vuelta desde Ajustes. No uso `useEffect` con `[]` porque solo consultaría una vez y quedaría desactualizado. Con solo `useFocusEffect`, si la persona habilita las notificaciones en Ajustes y vuelve, Mis reservas seguiría diciendo "Notificaciones desactivadas" hasta cambiar de pestaña.

---

## Parte D · Permisos en tu app

### D1. Recorrido completo de la cámara (Android 14)

| # | Acción | Qué muestra mi app | `status` | `canAskAgain` |
|---|---|---|---|---|
| 1 | Toca "Escanear" por primera vez | Un instante "Revisando el permiso…" y después el estado *preguntable*: "Para escanear necesitamos usar la cámara…", el botón "Activar cámara" (que abre `/permisos/camara` con el beneficio y "Continuar") y el ingreso manual | `undetermined` | `true` |
| 2 | "Continuar" → "No permitir" | Se cierra el modal y el escáner sigue en *preguntable*, con el ingreso manual | `denied` | `true` |
| 3 | Toca "Escanear" otra vez | Lo mismo: *preguntable* | `denied` | `true` |
| 4 | "Continuar" → "No permitir" | Al cerrar el modal, el escáner pasa a *bloqueado*: "La cámara está bloqueada…", "Abrir Ajustes" e ingreso manual | `denied` | `false` |
| 5 | Toca "Escanear" otra vez | *Bloqueado*. Si abriera `/permisos/camara`, el único botón sería "Abrir Ajustes" | `denied` | `false` |
| 6 | "Abrir Ajustes" → habilita → vuelve | Al volver, el listener de `AppState` consulta de nuevo y aparece la cámara | `granted` | `true` |

En Android 11 o superior, después de **dos** rechazos el sistema ya no muestra el diálogo y `canAskAgain` pasa a `false`.

**a) En iOS** el diálogo se muestra **una sola vez**. Cambia en el **paso 2**: después del primer "No permitir" queda `denied` y `canAskAgain: false`. En el paso 3 mi app ya muestra el estado *bloqueado* con "Abrir Ajustes", sin esperar un segundo rechazo.

**b) La línea que decide**

```ts
// src/lib/permisos.ts:12
return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
```

Y en la pantalla previa: `{bloqueado ? ( …"Abrir Ajustes"… ) : ( …"Continuar"… )}` (`src/components/PreguntaPermiso.tsx:47`). Usa **`canAskAgain`**. Con `status` no alcanza porque vale `denied` tanto después del primer rechazo (todavía se puede preguntar) como cuando quedó bloqueado. Si solo mirara `status`, en el bloqueado mostraría "Continuar" y al tocarlo no pasaría nada, porque el sistema ya no muestra el diálogo.

**c)** Se entera el listener de `AppState` de `usePermiso` (`src/hooks/usePermiso.ts:29-41`): cuando el estado vuelve a `active`, llama a `actualizar()` y consulta el permiso otra vez. Si no existiera, la app seguiría mostrando "La cámara está bloqueada" aunque ya esté habilitada, hasta salir de la pantalla y volver a entrar.

### D2. Notificaciones y consistencia

**a)** Si no la cancelara, a los 15 segundos llegaría "Acordate de devolver …" de un libro que ya se devolvió. Es un aviso falso y la persona pierde la confianza en los recordatorios. Por eso `devolver` cancela la notificación si existe (`src/context/BibliotecaContext.tsx:114-123`), y `desactivarRecordatorio` hace lo mismo (líneas 133–144).

**b)** El identificador se guarda en el Context, dentro del préstamo (`notificacionId`), o sea **en memoria**. Si la app se cierra antes de que llegue:
- la notificación **sigue programada** en el sistema operativo y llega igual a los 15 segundos;
- el identificador **se pierde**, junto con el préstamo, porque el estado en memoria desaparece.

El problema: al abrir la app de nuevo no hay préstamo ni forma de cancelar esa notificación, que queda "huérfana". Lo resolvería guardando préstamos e identificadores con AsyncStorage (el desafío de persistencia). También se puede, al iniciar, comparar `getAllScheduledNotificationsAsync()` con los préstamos guardados y cancelar las que no correspondan a ninguno.

**c)** En Android 13 o superior las notificaciones necesitan el permiso `POST_NOTIFICATIONS`, y el sistema muestra el diálogo **solo si la app ya tiene al menos un canal**. Si se pide antes de crear el canal, el diálogo puede no aparecer y el pedido vuelve denegado. Por eso `pedirPermisoNotificaciones` primero llama a `crearCanal()` (`src/lib/notificaciones.ts:32-35`). En Android 12 o anterior no existe ese permiso: las notificaciones están permitidas desde la instalación, no aparece ningún diálogo y `requestPermissionsAsync` devuelve `granted`. El canal igual hace falta (desde Android 8) para que la notificación se muestre en ese canal.

**d)** Si el permiso está denegado, el Context agrega un **aviso dentro de la app** que aparece arriba en Mis reservas (`TarjetaAviso`), y el libro se agrega a "Mis préstamos":

```ts
// src/context/BibliotecaContext.tsx:186-191
// Se consulta el permiso en este momento: pudo cambiar en Ajustes.
if (await notificacionesPermitidas()) {
  await avisarLibroDisponible(titulo);
} else {
  agregarAviso(`Ya podés retirar "${titulo}". Lo agregamos a tus préstamos.`);
}
```

Consulta el permiso **en ese momento** (`getPermissionsAsync` en `src/lib/notificaciones.ts:38`), no usa un valor guardado. Importa porque la persona lo puede cambiar en Ajustes en cualquier momento. Con un valor viejo podría pasar que se mande una notificación que el sistema no muestra (y la persona no se entera de nada), o que se muestre el aviso interno cuando ya tenía las notificaciones activadas.

### D3. Lo que tu app pide y lo que no

| Plataforma | Permiso o clave declarada | Función de la app que lo justifica | ¿Quién lo agrega? |
|---|---|---|---|
| Android | `android.permission.CAMERA` | Leer el código de barras en /escanear | El plugin de `expo-camera` |
| Android | `android.permission.POST_NOTIFICATIONS` | Recordatorio de devolución y aviso de libro disponible (Android 13+) | El manifest de `expo-notifications` |
| Android | `android.permission.RECEIVE_BOOT_COMPLETED` | Que las notificaciones programadas sigan después de reiniciar el teléfono | El manifest de `expo-notifications` |
| iOS | `NSCameraUsageDescription` | Texto de propósito de la cámara ("Usamos tu cámara para leer el código de barras…") | El plugin de `expo-camera`, con mi texto de `app.json` |
| iOS | (sin clave) notificaciones | En iOS el permiso de notificaciones no lleva texto en `Info.plist`: se pide en ejecución | `expo-notifications` |

**a)** `expo-camera` agrega `RECORD_AUDIO` por defecto para poder grabar video con sonido. Mi app solo lee códigos de barras, así que lo desactivo en el plugin y además lo bloqueo:

```json
["expo-camera", {
  "cameraPermission": "Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin tener que escribir el ISBN.",
  "microphonePermission": false,
  "recordAudioAndroid": false
}]
```

```json
"blockedPermissions": ["android.permission.RECORD_AUDIO", "…"]
```

**b)** Usaría `expo-image-picker` con `launchImageLibraryAsync`. En Android 13+ y en iOS 14+ abre el selector de fotos del sistema, que **no necesita permiso** de galería, porque la persona elige una foto y la app solo recibe esa. Igual hace falta una **build nueva** y no alcanza con una actualización OTA: `expo-image-picker` tiene código nativo que no está en el binario instalado, y además tendría que sacar de `blockedPermissions` lo que el módulo necesite y agregar su plugin. Una OTA solo cambia el JavaScript y los assets.

**c)** En Expo Go no se puede verificar:
- **el texto de propósito de la cámara**: Expo Go muestra su propio diálogo con el texto de Expo Go, no el de mi `app.json`, porque el `Info.plist` y el `AndroidManifest` son los de Expo Go;
- **`blockedPermissions` y `recordAudioAndroid: false`**: el manifest es el de Expo Go, que tiene muchos más permisos;
- **el nombre del canal "Préstamos"** en los ajustes de notificaciones de Android, que aparece dentro de los ajustes de Expo Go.

Lo verificaría con un *development build* (`npx expo run:android` o `eas build --profile development`): ahí se ve el diálogo con mi texto. También revisando el `AndroidManifest.xml` generado con `npx expo prebuild`, para confirmar que no está `RECORD_AUDIO`.

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

**a) Problemas encontrados**

| # | Línea | Tipo | Problema y por qué pasa | Corrección |
|---|---|---|---|---|
| 1 | 18–20 | Rendimiento / error de ejecución | `useEffect` **sin array de dependencias**: corre después de cada render. Como `setLibros` recibe un array nuevo, provoca otro render, y se hace un pedido tras otro sin fin | `useLibros()` con su efecto dependiendo de `[intento]` |
| 2 | 19 | Error de ejecución | La promesa no tiene `catch`. `obtenerLibros()` falla 1 de cada 5 veces y queda un *unhandled promise rejection*, con la lista vacía y sin mensaje | `try/catch` y estado `error` con "Reintentar" |
| 3 | 19 | Mala práctica | El efecto no tiene limpieza: una respuesta puede llegar después de desmontar la pantalla o pisar a otra más nueva | Bandera `activo` en la limpieza |
| 4 | 13–16 | Mala práctica (y motivo de rechazo) | Pide cámara y notificaciones **al abrir el catálogo**, sin contexto y sin pantalla previa. La persona no sabe para qué es | Pedirlos solo al usar la función (escanear / "Recordarme") con `/permisos/[recurso]` antes |
| 5 | 16 | Advertencia | Falta `pedirPermiso` en las dependencias (`react-hooks/exhaustive-deps`), y la promesa de la línea 15 tampoco se maneja | Sacar ese efecto (ver 4) |
| 6 | 10 y 22 | Mala práctica | `any[]` y `libro: any`: se pierde el tipado y un error de nombre (`libro.titlo`) no se detecta | `useState<Libro[]>` y `{ libro: Libro }` |
| 7 | 22–30 | Rendimiento | `Fila` está **declarado adentro** de `Catalogo`: en cada render es un componente nuevo, así que React desmonta y vuelve a montar todas las filas | Componente a nivel de módulo, en su propio archivo (`FilaLibro.tsx`) |
| 8 | 25 | Mala práctica | Estilos en línea con color y tamaños fijos (`'#333'`, `16`, `12`): se crea un objeto en cada render y no usa el tema | `StyleSheet.create` con `colores` / `fuente` / `espaciado` de `tema.ts` |
| 9 | 33–36 | Rendimiento | `ScrollView` + `map` renderiza todos los libros juntos, aunque no se vean | `FlatList` |
| 10 | 35 | Advertencia / bug | `key={i}` usa el índice: si la lista cambia de orden, React reutiliza filas equivocadas | `keyExtractor={(l) => l.isbn}` |
| 11 | 37–39 | Accesibilidad | Botón con **solo un ícono** sin `accessibilityRole` ni `accessibilityLabel`: un lector de pantalla dice "botón" sin nombre | `accessibilityRole="button"` y `accessibilityLabel="Escanear código de barras"`, o un botón con texto |
| 12 | 24 y 37 | Accesibilidad | Áreas táctiles chicas: el ícono mide 28 y la fila no tiene alto mínimo | `minHeight: 44` / `minWidth: 44` |
| 13 | — | Mala práctica | No hay estados de **carga, error ni vacío**: la persona ve una pantalla en blanco y no sabe si está cargando o si falló | `Cargando`, `MensajeEstado` y `ListEmptyComponent` |
| 14 | 11 | Advertencia | `permiso` se declara y no se usa (`no-unused-vars`) | Borrarlo |
| 15 | 24 | Mala práctica | `'/libro/' + libro.isbn` arma la ruta concatenando: con rutas tipadas conviene un *template literal* `` `/libro/${isbn}` `` que TypeScript puede chequear | Template literal |

**b) El efecto sin array de dependencias, en el primer minuto**

1. Render 1 (`libros = []`). Después se ejecuta el efecto y se pide el catálogo.
2. A los 800 ms llega la respuesta, `setLibros(datos)` con un **array nuevo** y render 2.
3. Como no hay array de dependencias, el efecto corre **otra vez** después del render 2: nuevo pedido.
4. A los 800 ms, otro array nuevo, otro render, otro pedido… Así sigue para siempre.

En un minuto son unos 75 pedidos y 75 renders. La lista "parpadea" y puede saltar el scroll, la batería y los datos se gastan sin motivo, y cada ~4 segundos (1 de cada 5) hay un rechazo sin manejar. Si `obtenerLibros()` devolviera **siempre el mismo array**, el segundo `setLibros` recibiría la misma referencia, React compararía con `Object.is`, vería que no cambió y **no** haría otro render. El ciclo se cortaría después del segundo pedido. Por eso la API "real" (que trae objetos nuevos en cada respuesta) muestra el problema y una API con datos cacheados lo esconde.

**c) La pantalla reescrita con mi app** (es la de `src/app/(tabs)/(catalogo)/index.tsx`)

```tsx
import { FlatList, StyleSheet, View } from 'react-native';

import { Boton } from '../../../components/Boton';
import { Cargando } from '../../../components/Cargando';
import { EncabezadoCatalogo } from '../../../components/EncabezadoCatalogo';
import { FilaLibro } from '../../../components/FilaLibro';
import { MensajeEstado } from '../../../components/MensajeEstado';
import { colores } from '../../../constants/tema';
import { useLibros } from '../../../hooks/useLibros';

export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();

  if (cargando) {
    return <Cargando mensaje="Cargando el catálogo…" />;
  }

  if (error) {
    return (
      <MensajeEstado icono="cloud-offline-outline" titulo="Algo salió mal" detalle={error} esError>
        <Boton titulo="Reintentar" icono="refresh" onPress={reintentar} />
      </MensajeEstado>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={libros}
        keyExtractor={(libro) => libro.isbn}
        renderItem={({ item }) => <FilaLibro libro={item} />}
        ListHeaderComponent={EncabezadoCatalogo}
        ListEmptyComponent={
          <MensajeEstado icono="book-outline" titulo="El catálogo está vacío por ahora." />
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
});
```

El botón de escanear está en `EncabezadoCatalogo` como un `Boton` con texto, ícono, `accessibilityRole` y 44 de alto. Los permisos se piden recién en `/escanear` y en "Recordarme".

**d)**
- **Rechazo en la tienda: pedir los permisos al abrir la app sin contexto (líneas 13–16).** Apple (guía 5.1.1) y Google piden que los permisos se soliciten cuando se usa la función que los necesita y que se explique para qué. Pedir cámara y notificaciones apenas se abre un catálogo, sin relación con lo que la persona está haciendo, es un motivo típico de rechazo. Además, si faltara el texto de propósito, iOS cierra la app al pedir la cámara.
- **Lo que haría que alguien la desinstale primero: también la primera impresión.** Al abrirla aparecen dos diálogos del sistema seguidos sin explicación, y después una lista que parpadea y gasta datos y batería por el efecto infinito. Si tengo que elegir uno, elijo el **efecto sin dependencias**: los diálogos se pueden rechazar una vez, pero el consumo de batería y datos sigue todo el tiempo que la app esté abierta.

### E2. Organización y acoplamiento

**a) Quién importa a quién**

```
app ────────► components, hooks, context, lib, constants, types
components ─► components, hooks, context, lib, constants, types
hooks ──────► lib, types
context ────► estructuras, lib, data, constants, types
lib ────────► data, constants, types
data ───────► types
constants ──► types
estructuras ► (nada)
types ──────► (nada)
```

No hay importaciones "hacia arriba": nada importa de `src/app`. Sería un problema porque los archivos de `src/app` son **rutas**: Expo Router los carga como pantallas, y si un hook importara una pantalla se podría formar un ciclo de importaciones (pantalla → hook → pantalla). Además, mover o renombrar una ruta (que cambia la URL) rompería código que no tiene nada que ver con la navegación. Las dependencias tienen que ir de lo más específico (pantallas) a lo más general (tipos, estructuras).

**b) Si el catálogo viniera de una API real**

Cambiarían:
1. `src/lib/api.ts`: `fetch` en vez de `LIBROS`;
2. `src/lib/catalogo.ts`: `buscarLibroPorIsbn` hoy busca de forma sincrónica en `LIBROS`;
3. las pantallas y componentes que usan `buscarLibroPorIsbn` para mostrar un título: el detalle, el modal de reserva, `EncabezadoCatalogo`, `TarjetaPrestamo`, `TarjetaEspera`, `FilaMostrador`, y el Context (`disponibles` y los títulos de los avisos);
4. `src/data/libros.ts` dejaría de usarse (salvo las esperas iniciales).

Son más de dos archivos, y eso me dice que mi diseño está **acoplado a que los datos sean locales y sincrónicos**. `useLibros` está bien aislado, pero la búsqueda por ISBN no pasa por la API. Para mejorarlo, haría un hook `useLibro(isbn)` con estados de carga y error, o guardaría el catálogo en el Context después de pedirlo una vez, así cambiar la fuente toca un solo lugar.

**c) `<ConPermiso recurso="camara">…</ConPermiso>`**

- **Ganaría:** menos código en la pantalla. Envolver la cámara alcanzaría para que aparezcan solos los estados cargando, preguntable y bloqueado.
- **Perdería:**
  - flexibilidad: en mi escáner el ingreso manual del ISBN se muestra **siempre**, con o sin permiso, y el componente tendría que aceptar un *fallback*;
  - la pantalla previa como ruta (`/permisos/camara`), que es un modal con su URL y se reutiliza para los dos recursos;
  - control de **cuándo** se pide.
- **Para las notificaciones no serviría:** no hay ninguna pantalla que envolver. El permiso se pide como reacción a una acción (activar el interruptor de un préstamo), así que hace falta algo imperativo como `usePermiso().pedir()`. Por eso prefiero el hook. Un `ConPermiso` se podría construir encima del hook para los casos de "pantalla que necesita un permiso", pero no lo reemplaza.

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja (archivo y línea) |
|---|---|---|
| `obtenerLibros()` falla | Ícono de nube, "Algo salió mal", "No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo." y el botón "Reintentar" | `src/hooks/useLibros.ts:23-26` y `src/app/(tabs)/(catalogo)/index.tsx:18-24` |
| Se abre `/libro/abc` | "El código no es un ISBN válido", con la explicación de los 13 números y el link "Volver al catálogo" | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx:15-16` y `24-41` |
| Se escanea un ISBN que no está en el catálogo | Aviso amarillo "El código … no está en el catálogo. Podés seguir escaneando." (una sola vez por código) | `src/app/escanear.tsx:30-38` |
| La cámara está bloqueada | "La cámara está bloqueada para esta app…", botón "Abrir Ajustes" y el ingreso manual del ISBN | `src/lib/permisos.ts:12` y `src/app/escanear.tsx:67-81` |
| Las notificaciones están denegadas | En Mis reservas: "Notificaciones desactivadas: los avisos te aparecen acá." Al activar "Recordarme" se abre la pantalla previa (con "Abrir Ajustes" si está bloqueado). Los avisos del mostrador aparecen como tarjetas dentro de la app | `src/app/(tabs)/reservas.tsx:27-36` y `42-44`; `src/context/BibliotecaContext.tsx:186-191` |
| Se intenta reservar un libro ya reservado | "Ya reservaste este libro. No se puede reservar dos veces…", con "Ver mis reservas" y "Cerrar" | `src/app/reservar/[isbn].tsx:29-38`; además el Context lo rechaza en `BibliotecaContext.tsx:94-96` |
| "Entregar al siguiente" con la lista vacía | El libro deja de aparecer en el mostrador. Si se llamara igual, el Context devuelve `undefined` y se muestra "Nadie está esperando … en este momento." | `src/app/mostrador.tsx:15` y `20-24`; `src/context/BibliotecaContext.tsx:168-170` |
| Login con clave incorrecta | "El usuario o la clave no son correctos. Revisalos y probá de nuevo." en rojo, y el modal sigue abierto | `src/app/login.tsx:17-19` |

Ninguna situación termina en "nada" ni en "la app se rompe".

### E4. Decisiones con argumentos

**a) Identificador: ISBN como parámetro y `key`.**
Elegí el **ISBN**. Es un identificador real y único por edición, es lo que lee el escáner (EAN-13), así que el código leído **es** la URL (`/libro/9780132350884`) sin tener que traducirlo, y sirve para deep links que cualquiera puede armar. Dos ediciones del mismo título tienen ISBN distinto, y eso está bien: son libros distintos en el estante. El punto débil son los libros **sin ISBN** (muy viejos o apuntes del instituto). Para eso se podría usar un código interno de 13 dígitos con un prefijo propio, y la validación de 13 dígitos seguiría funcionando. Sobre el tipo: `useLocalSearchParams` siempre devuelve **strings** (o arrays de strings). Con un id numérico habría que convertir con `Number()` y validar `NaN`, y además un ISBN como número perdería los ceros iniciales. Como string se compara directo con `libro.isbn` y se valida con una expresión regular (`src/lib/catalogo.ts:4-6`).

**b) Estructuras: clase `Pila` con `#items`.**
Usé las **clases**. Me dieron:
- **encapsulamiento**: nadie puede hacer `cola.items.shift()` ni meterse en el medio de la lista de espera, solo se puede `encolar` y `desencolar`, que es justo la regla de "respetar el orden de las reservas";
- nombres que dicen lo que pasa (`verFrente`, `verTope`);
- una implementación de `Cola` sin `shift()`, con índices de inicio y fin;
- se pueden probar solas con Jest.

Lo que me complicó con React: son **objetos mutables**, y React detecta cambios por referencia. Fue el problema de B3. Tuve que agregar un constructor que recibe un array, para poder crear siempre una copia (`new Cola(vieja.aArray())`) y nunca mutar lo que está en el estado. Con un array y `[...pila, x]` eso viene gratis, pero se pierde el encapsulamiento.

**c) Memorización.**
Usé `useMemo` y `useCallback` en el **Context** (`BibliotecaContext.tsx`). Ahí sí aportan: sin `useMemo` en el `value` (líneas 208–247), cada render del provider crearía un objeto nuevo y **todos** los que usan `useBiblioteca` se volverían a renderizar. Además `registrarVisto` tiene que ser estable porque es dependencia del efecto del detalle (`libro/[isbn].tsx:18-22`). Si cambiara en cada render, el efecto se ejecutaría de nuevo. En `useLibros` uso `useCallback` en `reintentar` para que la referencia no cambie entre renders.

Donde serían **ruido**: en funciones como `abrir()` de `IngresoIsbn` o `entregar()` del mostrador, que se pasan a un `Pressable` que no está memorizado. Envolverlas en `useCallback` no evita ningún render y agrega código. Además el proyecto tiene activado el React Compiler, que ya memoriza automáticamente gran parte de esto.

Para comprobarlo en vez de suponerlo usaría el **Profiler de React DevTools** (`j` en la terminal de `npx expo start` abre las herramientas): grabar mientras activo un recordatorio y ver qué componentes se renderizan y por qué ("why did this render"). Lo haría con y sin la memorización.

**d) Datos duplicados: los ejemplares disponibles se calculan.**
No guardo "disponibles" en ningún lado: `disponibles(isbn)` (`BibliotecaContext.tsx:65-77`) lo calcula como `libro.ejemplares` menos la cantidad de préstamos de ese libro que salieron del estante. Si guardara un número de disponibles además de los préstamos, el mismo dato viviría en dos lugares. Cada reserva y cada devolución tendría que actualizar los dos, y si me olvido de uno (por ejemplo, en "Devolver") el detalle diría "2 disponibles" mientras la reserva dice que no hay. Es un error que aparece solo en algunos caminos y es difícil de encontrar. Al calcularlo desde una sola fuente (los préstamos), es imposible que quede desincronizado: devolver un libro saca el préstamo y el número se corrige solo en el próximo render.
