# Guía de Firma Digital

## Tipos de Certificados Soportados

### 1. Certificado P12 (.p12)
- Formato PKCS#12
- Contiene tanto el certificado como la clave privada
- Protegido por contraseña
- Formato más común para certificados de firma digital en Costa Rica

### 2. Certificado PEM (.pem)
- Formato Base64
- Puede contener certificado y clave privada
- Puede estar protegido por contraseña
- Útil para sistemas que no soportan P12

## Proceso de Firma

1. **Validación del Certificado**
   - Verificación del formato
   - Validación de la contraseña
   - Comprobación de fechas de validez

2. **Firma del Documento**
   - Cálculo del hash del documento
   - Firma con la clave privada
   - Inclusión de la información del certificado

3. **Validación de la Firma**
   - Verificación de la integridad
   - Comprobación de la cadena de certificados

## Ejemplos de Uso

### Firma con Certificado P12

```typescript
const signedXml = await signXml(xmlDocument, {
  certPath: './certificado.p12',
  password: 'contraseña',
  certType: 'p12'
});
```

### Firma con Certificado PEM

```typescript
const signedXml = await signXml(xmlDocument, {
  certPath: './certificado.pem',
  password: 'contraseña',
  certType: 'pem'
});
```

## Manejo de Errores

### Errores Comunes

1. **Certificado no encontrado**
```typescript
try {
  await signXml(xml, options);
} catch (error) {
  if (error.message === 'File not found') {
    console.error('El archivo del certificado no existe');
  }
}
```

2. **Contraseña incorrecta**
```typescript
try {
  await signXml(xml, options);
} catch (error) {
  if (error.message.includes('password')) {
    console.error('La contraseña del certificado es incorrecta');
  }
}
```

3. **Tipo de certificado inválido**
```typescript
try {
  await signXml(xml, options);
} catch (error) {
  if (error.message === 'Invalid certificate type') {
    console.error('El tipo de certificado no es válido');
  }
}
```

## Recomendaciones

1. **Seguridad**
   - Nunca almacenar contraseñas en texto plano
   - Usar variables de entorno para las contraseñas
   - Mantener los certificados en un lugar seguro

2. **Rendimiento**
   - Reutilizar la instancia de firma cuando sea posible
   - Validar el XML antes de firmar
   - Manejar correctamente los recursos del certificado

3. **Mantenimiento**
   - Monitorear las fechas de vencimiento de los certificados
   - Mantener copias de seguridad de los certificados
   - Documentar los procesos de renovación
