export interface HaciendaConfig {
  /** URL base del API de Hacienda */
  apiUrl: string;
  /** ID del cliente para autenticación */
  clientId: string;
  /** Ambiente (desarrollo o producción) */
  environment: 'desarrollo' | 'produccion';
}

export interface SignatureOptions {
  /** Ruta al archivo del certificado .p12 o .pem */
  certPath: string;
  /** Contraseña del certificado */
  password: string;
  /** Tipo de certificado */
  certType: 'p12' | 'pem';
}

export interface DocumentResponse {
  /** Clave del documento */
  clave: string;
  /** Fecha de recepción */
  fecha: string;
  /** Estado del documento */
  estado: 'aceptado' | 'rechazado' | 'procesando';
  /** Mensaje de respuesta */
  mensaje?: string;
}
