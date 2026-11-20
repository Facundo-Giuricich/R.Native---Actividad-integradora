# Biblioteca IPF

App del TP N° 4 de Taller Complementario – React Native II (Instituto Politécnico Formosa).
Permite consultar el catálogo de la biblioteca, reservar libros, recibir un recordatorio antes de devolverlos y, para el personal, entregar los libros respetando el orden de las listas de espera.

- **SDK de Expo:** 58 (`expo ~58.0.26`, React Native 0.88, React 19.3)
- **Navegación:** Expo Router con rutas tipadas
- **Módulos nativos:** solo `expo-camera` y `expo-notifications`

## Cómo ejecutarlo

```bash
npm install
npx expo start
```

Escanear el QR con **Expo Go** (Android o iOS). Otros comandos:

```bash
npx expo lint       # lint
npx tsc --noEmit    # chequeo de tipos
npm test            # tests de Pila y Cola (jest-expo)
```

**Usuario del personal** (fijo en `src/constants/biblioteca.ts`): usuario `biblioteca`, clave `ipf2026`.

**Catálogo:** 18 libros: *Cien años de soledad*, *El Aleph*, *El túnel*, la colección completa de Harry Potter y ocho libros de Stephen King. Para probar el escáner, el ISBN de `src/data/libros.ts` tiene que coincidir con el de la contratapa del libro que se escanea; si no coincide, se cambia ahí.

## Estructura del proyecto

```
src/
├── app/            rutas (solo pantallas y layouts)
├── components/     componentes reutilizables (uno por archivo)
├── constants/      tema, textos de permisos y constantes de la biblioteca
├── context/        BibliotecaContext (préstamos, esperas, recientes, sesión, avisos)
├── data/           libros y listas de espera iniciales
├── estructuras/    clases Pila y Cola (+ tests)
├── hooks/          useLibros y usePermiso
├── lib/            api simulada, catálogo, fechas, notificaciones y permisos
└── types/          tipos de TypeScript
```

### Árbol de `src/app` y navegador de cada `_layout`

```
src/app/
├── _layout.tsx                 Stack raíz (NavegadorRaiz) + BibliotecaProvider · anchor: (tabs)
├── (tabs)/
│   ├── _layout.tsx             Tabs (expo-router/js-tabs): "Catálogo" y "Mis reservas"
│   ├── (catalogo)/
│   │   ├── _layout.tsx         Stack propio de la tab Catálogo · anchor: index
│   │   ├── index.tsx           /              Catálogo (header con link "Personal")
│   │   └── libro/
│   │       └── [isbn].tsx      /libro/[isbn]  Detalle
│   └── reservas.tsx            /reservas      Mis reservas
├── buscar.tsx                  /buscar?q=     Buscador (Stack raíz)
├── escanear.tsx                /escanear      Escáner (Stack raíz)
├── reservar/
│   └── [isbn].tsx              /reservar/[isbn]       modal
├── permisos/
│   └── [recurso].tsx           /permisos/[recurso]    modal (camara | notificaciones)
├── login.tsx                   /login         modal · Stack.Protected guard={!sesion}
├── mostrador.tsx               /mostrador     Stack.Protected guard={sesion}
├── reserva.tsx                 /reserva       <Redirect href="/reservas" />
└── +not-found.tsx              cualquier otra URL (404)
```

El Stack raíz está en `src/components/NavegadorRaiz.tsx` porque necesita leer la sesión del Context, y el provider tiene que estar más arriba (en `src/app/_layout.tsx`).

Las tabs usan `import { Tabs } from 'expo-router/js-tabs'`, que es el import que corresponde en el SDK 58 (el `Tabs` de `expo-router` quedó marcado como deprecado).

## Plugins de `app.json`

`app.json` no admite comentarios, así que el bloque se muestra comentado acá:

```jsonc
"plugins": [
  // Rutas basadas en archivos.
  "expo-router",

  // Pantalla de carga (viene de la plantilla).
  ["expo-splash-screen", { "backgroundColor": "#1E3A8A", "image": "./assets/images/splash-icon.png", "imageWidth": 76 }],

  // Cámara para leer el código de barras.
  ["expo-camera", {
    // Texto de propósito de iOS (NSCameraUsageDescription), con el molde "Usamos tu [dato] para [beneficio]".
    "cameraPermission": "Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin tener que escribir el ISBN.",
    // La app no graba video: no se declara el micrófono en iOS...
    "microphonePermission": false,
    // ...ni RECORD_AUDIO en Android.
    "recordAudioAndroid": false
  }],

  // Notificaciones locales (recordatorio de devolución y aviso de libro disponible).
  "expo-notifications"
]
```

Además: `"scheme": "bibliotecaipf"` para los deep links y `experiments.typedRoutes: true` para las rutas tipadas.

## Permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si se niega |
|---|---|---|---|
| Cámara | `expo-camera` | Al tocar "Activar cámara" en /escanear, después de la pantalla previa /permisos/camara | Escribir el ISBN a mano en la misma pantalla |
| Notificaciones | `expo-notifications` | Solo al activar el interruptor "Recordarme" de un préstamo (pasa por /permisos/notificaciones). En Android se crea antes el canal `prestamos` | Los avisos aparecen dentro de la app, en /reservas |

La app no pide ningún otro permiso. El estado de cada permiso lo maneja el hook `usePermiso` (`src/hooks/usePermiso.ts`) con cuatro estados: `cargando`, `concedido`, `preguntable` y `bloqueado`.

### `blockedPermissions` (Android)

Algunas librerías (o sus dependencias) pueden agregar permisos al `AndroidManifest` aunque la app no los use. Con `blockedPermissions` se sacan del manifest final, siguiendo el principio de mínimo privilegio:

| Permiso bloqueado | Por qué |
|---|---|
| `RECORD_AUDIO` | `expo-camera` lo agrega para grabar video con sonido; la app solo lee códigos de barras. Se bloquea además de usar `recordAudioAndroid: false`, por si otra dependencia lo agrega. |
| `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` | La app no usa la ubicación (no instala `expo-location`). |
| `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` | La app no lee ni guarda fotos o archivos (no instala `expo-image-picker`). |
| `SYSTEM_ALERT_WINDOW` | La app no dibuja ventanas sobre otras apps. |

## Deep links de prueba

En Expo Go se usa la forma `exp://IP:8081/--/ruta` (la IP la muestra `npx expo start`). En una build propia, `bibliotecaipf://ruta`.

| Link | Qué debería pasar |
|---|---|
| `bibliotecaipf://libro/9788497592208` | Detalle de *Cien años de soledad*, con el Catálogo debajo |
| `bibliotecaipf://libro/123` | Mensaje "El código no es un ISBN válido" con link al Catálogo |
| `bibliotecaipf://buscar?q=borges` | Buscador con "borges" y sus resultados, con las tabs debajo |
| `bibliotecaipf://mostrador` | Sin sesión, la ruta está protegida y no se muestra |
| `bibliotecaipf://reserva` | Redirige a Mis reservas |
| `bibliotecaipf://escanear` | Escáner (con la cámara bloqueada muestra "Abrir Ajustes" y el ingreso manual) |
| `bibliotecaipf://cualquier-cosa` | Pantalla 404 que muestra la URL |

Ejemplo con adb: `adb shell am start -W -a android.intent.action.VIEW -d "exp://192.168.0.10:8081/--/buscar?q=borges"`

## Desafíos opcionales hechos

- **Pruebas:** 7 tests de `Pila` y `Cola` con jest-expo (incluye desencolar una cola vacía) en `src/estructuras/__tests__/estructuras.test.ts`.
- **Debounce:** el buscador espera 300 ms sin escribir antes de llamar a `buscarLibros`, y limpia el temporizador (`src/app/buscar.tsx`).

## Capturas

Van en la carpeta `capturas/`: Catálogo cargando, con error y con datos; buscador; detalle inexistente; reserva con y sin ejemplares; escáner en sus cuatro estados; notificación recibida; mostrador antes y después de "Entregar al siguiente"; pantalla 404.

## Salida de lint y TypeScript

```
$ npx expo lint
(sin errores ni advertencias, código de salida 0)

$ npx tsc --noEmit
(sin errores, código de salida 0)

$ npm test
Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```
