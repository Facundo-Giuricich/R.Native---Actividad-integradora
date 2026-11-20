import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { MensajeEstado } from '../../components/MensajeEstado';
import { TarjetaAviso } from '../../components/TarjetaAviso';
import { TarjetaEspera } from '../../components/TarjetaEspera';
import { TarjetaPrestamo } from '../../components/TarjetaPrestamo';
import { colores, espaciado, fuente } from '../../constants/tema';
import { useBiblioteca } from '../../context/BibliotecaContext';
import { usePermiso } from '../../hooks/usePermiso';

export default function MisReservas() {
  const {
    prestamos,
    esperas,
    avisos,
    posicionEnEspera,
    activarRecordatorio,
    desactivarRecordatorio,
    devolver,
    descartarAviso,
  } = useBiblioteca();
  const { estado: permisoNotificaciones } = usePermiso('notificaciones');

  const misEsperas = Object.keys(esperas).filter((isbn) => posicionEnEspera(isbn) > 0);

  function cambiarRecordatorio(isbn: string, activar: boolean) {
    if (!activar) {
      desactivarRecordatorio(isbn);
    } else if (permisoNotificaciones === 'concedido') {
      activarRecordatorio(isbn);
    } else {
      // El permiso se pide recién acá, al activar el interruptor.
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones', isbn } });
    }
  }

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.encabezado}>
        <Text style={estilos.estadoPermiso}>
          {permisoNotificaciones === 'concedido'
            ? 'Notificaciones permitidas.'
            : 'Notificaciones desactivadas: los avisos te aparecen acá.'}
        </Text>
        {avisos.map((aviso) => (
          <TarjetaAviso key={aviso.id} aviso={aviso} onDescartar={() => descartarAviso(aviso.id)} />
        ))}
      </View>

      <Text style={estilos.seccion}>Mis préstamos</Text>
      <FlatList
        style={estilos.lista}
        data={prestamos}
        keyExtractor={(prestamo) => prestamo.isbn}
        renderItem={({ item }) => (
          <TarjetaPrestamo
            prestamo={item}
            onCambiarRecordatorio={(activar) => cambiarRecordatorio(item.isbn, activar)}
            onDevolver={() => devolver(item.isbn)}
          />
        )}
        ListEmptyComponent={<MensajeEstado icono="book-outline" titulo="No tenés libros prestados." />}
      />

      <Text style={estilos.seccion}>En lista de espera</Text>
      <FlatList
        style={estilos.lista}
        data={misEsperas}
        keyExtractor={(isbn) => isbn}
        renderItem={({ item }) => (
          <TarjetaEspera
            isbn={item}
            posicion={posicionEnEspera(item)}
            total={esperas[item]?.tamanio ?? 0}
          />
        )}
        ListEmptyComponent={
          <MensajeEstado icono="time-outline" titulo="No estás esperando ningún libro." />
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  encabezado: {
    padding: espaciado.l,
    gap: espaciado.s,
  },
  estadoPermiso: {
    fontSize: fuente.chica,
    color: colores.textoSuave,
  },
  seccion: {
    fontSize: fuente.normal,
    fontWeight: '700',
    color: colores.textoSuave,
    paddingHorizontal: espaciado.l,
    paddingBottom: espaciado.s,
  },
  lista: {
    flex: 1,
  },
});
