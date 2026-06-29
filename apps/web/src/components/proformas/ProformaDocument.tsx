import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { ProformaData } from './ProformaGenerator';

// Crear estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#10b981',
    paddingBottom: 20,
  },
  logo: {
    width: 150,
    height: 43,
  },
  proformaTitle: {
    fontSize: 22,
    color: '#10b981',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  proformaInfo: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'right',
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    textTransform: 'uppercase',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    paddingLeft: 6,
  },
  textRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 100,
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#0f172a',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCell: {
    fontSize: 10,
    color: '#334155',
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#10b981',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginRight: 20,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    lineHeight: 1.5,
  },
});

export function ProformaDocument({
  data,
  userEmail,
  total,
}: { data: ProformaData; userEmail: string; total: number }) {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  let validDate = 'No definida';
  if (data.validUntil) {
    const parts = data.validUntil.split('-');
    if (parts.length === 3) {
      validDate = new Date(
        Number.parseInt(parts[0]),
        Number.parseInt(parts[1]) - 1,
        Number.parseInt(parts[2])
      ).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Image src="/logo.png" style={styles.logo} />
          </View>
          <View>
            <Text style={styles.proformaTitle}>PROFORMA</Text>
            <Text style={styles.proformaInfo}>
              Fecha de emisión: {currentDate}
            </Text>
            <Text style={styles.proformaInfo}>Válido hasta: {validDate}</Text>
            <Text style={styles.proformaInfo}>Emitido por: {userEmail}</Text>
          </View>
        </View>

        {/* Información del Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <View style={styles.textRow}>
            <Text style={styles.label}>Empresa / Cliente:</Text>
            <Text style={styles.value}>{data.clientName || '---'}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Correo de Contacto:</Text>
            <Text style={styles.value}>{data.clientEmail || '---'}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Nombre del Proyecto:</Text>
            <Text style={styles.value}>{data.projectName || '---'}</Text>
          </View>
        </View>

        {/* Tabla de Ítems */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle del Proyecto</Text>

          <View style={styles.table}>
            {/* Cabecera Tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>
                Descripción del Concepto
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>
                Cantidad
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>
                P. Unitario
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>
                Subtotal
              </Text>
            </View>

            {/* Filas Tabla */}
            {data.items.map((item) => (
              <View style={styles.tableRow} key={item.id}>
                <Text style={[styles.tableCell, styles.colDesc]}>
                  {item.description || '...'}
                </Text>
                <Text style={[styles.tableCell, styles.colQty]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, styles.colPrice]}>
                  $
                  {item.unitPrice.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </Text>
                <Text style={[styles.tableCell, styles.colTotal]}>
                  $
                  {(item.quantity * item.unitPrice).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Estimado (USD):</Text>
            <Text style={styles.totalValue}>
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Pie de página */}
        <Text style={styles.footer}>
          Documento generado automáticamente por el sistema ERP Disagro. {'\n'}
          Para confirmación, consultas o pagos, por favor responda al asesor
          comercial a través del correo de emisión.
        </Text>
      </Page>
    </Document>
  );
}
