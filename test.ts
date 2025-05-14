import { HaciendaAPI, validateXml } from './src';

async function test() {
  // Crear instancia del API
  const api = new HaciendaAPI({
    apiUrl: 'https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1',
    clientId: 'test-client',
    environment: 'desarrollo'
  });

  // XML de prueba
  const testXml = `<?xml version="1.0" encoding="utf-8"?>
    <FacturaElectronica xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronica">
      <Clave>50601011800310174000100100001010000000011199999999</Clave>
      <!-- ... resto del XML ... -->
    </FacturaElectronica>`;

  console.log('Validando XML:', validateXml(testXml));
  
  try {
    // Intentar obtener un token (esto fallará porque son credenciales de prueba)
    const token = await api.getToken('test@example.com', 'test123');
    console.log('Token obtenido:', token);
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error esperado al obtener token:', error.message);
    }
  }
}

test();
