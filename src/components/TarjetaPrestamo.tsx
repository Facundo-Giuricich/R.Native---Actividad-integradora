import { StyleSheet, Switch, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio } from '../constants/tema';
import { buscarLibroPorIsbn } from '../lib/catalogo';
import { formatearFecha } from '../lib/fechas';
import type { Prestamo } from '../types';
import { Boton } from './Boton';

type Props = {
  prestamo: Prestamo;
  onCambiarRecordatorio: (activar: boolean) => void;
  onDevolver: () => void;
};

export function TarjetaPrestamo({ prestamo, onCambiarRecordatorio, onDevolver }: Props) {
  const titulo = buscarLibroPorIsbn(prestamo.isbn)?.titulo ?? prestamo.isbn;
  const recordatorioActivo = prestamo.notificacionId !== null;

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.detalle}>Devolvelo antes del {formatearFecha(prestamo.vence)}</Text>
      <View style={estilos.fila}>
        <Text style={estilos.detalle}>Recordarme</Text>
        <Switch
          value={recordatorioActivo}
          onValueChange={onCambiarRecordatorio}
          trackColor={{ true: colores.primario, false: colores.borde }}
          accessibilityLabel={`Recordarme la devolución de ${titulo}`}
        />
      </View>
      <Boton titulo="Devolver" icono="return-down-back" variante="secundario" onPress={onDevolver} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.normal,
    padding: espaciado.l,
    marginHorizontal: espaciado.l,
    marginBottom: espaciado.m,
    gap: espaciado.s,
  },
  titulo: {
    fontSize: fuente.mediana,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: fuente.normal,
    color: colores.textoSuave,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
