import { HaciendaAPI, signXml } from '../src';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config();

async function main() {
  try {
    // 1. Configurar el API
    const api = new HaciendaAPI({
      apiUrl: process.env.HACIENDA_API_URL || 'https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1',
      clientId: process.env.HACIENDA_CLIENT_ID || 'api-stag',
      environment: 'desarrollo'
    });

    // 2. Obtener token
    const token = await api.getToken(
      process.env.HACIENDA_USERNAME || '',
      process.env.HACIENDA_PASSWORD || ''
    );

    // 3. Leer XML de factura
    const xmlPath = path.join(__dirname, 'factura.xml');
    const facturaXml = fs.readFileSync(xmlPath, 'utf8');

    // 4. Firmar documento
    const signedXml = await signXml(facturaXml, {
      certPath: process.env.CERT_PATH || './certificado.p12',
      password: process.env.CERT_PASSWORD || '',
      certType: 'p12'
    });

    // 5. Enviar a Hacienda
    const response = await api.sendDocument(signedXml, token);
    console.log('Documento enviado:', response);

    // 6. Consultar estado
    const status = await api.checkStatus(response.clave, token);
    console.log('Estado del documento:', status);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
