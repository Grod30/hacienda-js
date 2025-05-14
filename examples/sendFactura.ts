import { HaciendaAPI, signXml } from '../src';

async function main() {
  // Configuración del cliente
  const api = new HaciendaAPI({
    apiUrl: 'https://api.hacienda.go.cr/fe/ae',
    clientId: 'api-stag',
    environment: 'desarrollo'
  });

  try {
    // 1. Obtener token
    const token = await api.getToken('usuario@ejemplo.com', 'contraseña');

    // 2. XML de ejemplo (en producción esto vendría de tu sistema)
    const facturaXml = `<?xml version="1.0" encoding="utf-8"?>
      <FacturaElectronica xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronica">
        <!-- ... contenido de la factura ... -->
      </FacturaElectronica>`;

    // 3. Firmar el XML
    const signedXml = await signXml(facturaXml, {
      certPath: './certificado.p12',
      password: 'contraseña-del-certificado',
      certType: 'p12'
    });

    // 4. Enviar a Hacienda
    const response = await api.sendDocument(signedXml);
    console.log('Documento enviado:', response);

    // 5. Consultar estado
    const status = await api.checkStatus(response.clave);
    console.log('Estado del documento:', status);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
