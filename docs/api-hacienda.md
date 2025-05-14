# API de Hacienda

## Endpoints

### 1. Autenticación
- **URL**: `/token`
- **Método**: `POST`
- **Descripción**: Obtiene un token de acceso para usar el API

```typescript
const token = await api.getToken('usuario@ejemplo.com', 'contraseña');
```

### 2. Envío de Documentos
- **URL**: `/recepcion`
- **Método**: `POST`
- **Descripción**: Envía un documento XML firmado a Hacienda

```typescript
const response = await api.sendDocument(signedXml, token);
```

### 3. Consulta de Estado
- **URL**: `/recepcion/{clave}`
- **Método**: `GET`
- **Descripción**: Consulta el estado de un documento enviado

```typescript
const status = await api.checkStatus(clave, token);
```

## Ambientes

### Desarrollo
```typescript
const api = new HaciendaAPI({
  apiUrl: 'https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1',
  clientId: 'api-stag',
  environment: 'desarrollo'
});
```

### Producción
```typescript
const api = new HaciendaAPI({
  apiUrl: 'https://api.comprobanteselectronicos.go.cr/recepcion/v1',
  clientId: 'api-prod',
  environment: 'produccion'
});
```

## Respuestas del API

### Envío de Documentos
```typescript
interface DocumentResponse {
  clave: string;         // Clave del documento
  fecha: string;         // Fecha de recepción
  estado: string;        // Estado del documento
  mensaje: string;       // Mensaje descriptivo
}
```

### Estados Posibles
- `aceptado`: Documento recibido correctamente
- `rechazado`: Documento con errores
- `procesando`: Documento en proceso de validación
- `error`: Error en el proceso

## Manejo de Errores

### 1. Error de Autenticación
```typescript
try {
  const token = await api.getToken(username, password);
} catch (error) {
  if (error.message === 'Authentication failed') {
    console.error('Credenciales inválidas');
  }
}
```

### 2. Error de Envío
```typescript
try {
  const response = await api.sendDocument(xml, token);
} catch (error) {
  if (error.response?.status === 400) {
    console.error('Documento inválido');
  }
}
```

### 3. Error de Consulta
```typescript
try {
  const status = await api.checkStatus(clave, token);
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Documento no encontrado');
  }
}
```

## Recomendaciones

1. **Reintentos**
   - Implementar política de reintentos para errores temporales
   - Usar exponential backoff para los reintentos
   - Limitar el número máximo de reintentos

2. **Tokens**
   - Almacenar el token de forma segura
   - Renovar el token antes de que expire
   - Manejar errores de token expirado

3. **Monitoreo**
   - Registrar todos los intentos de envío
   - Monitorear tiempos de respuesta
   - Alertar sobre errores recurrentes

4. **Optimización**
   - Reutilizar instancias de HaciendaAPI
   - Implementar caché de tokens
   - Usar conexiones persistentes
