import { validateXml } from '../xml';

describe('validateXml', () => {
  it('should validate correct XML structure', () => {
    const validXml = `<?xml version="1.0" encoding="utf-8"?>
      <FacturaElectronica>
        <Clave>50601011800310174000100100001010000000011199999999</Clave>
      </FacturaElectronica>`;

    expect(validateXml(validXml)).toBe(true);
  });

  it('should reject invalid XML structure', () => {
    const invalidXml = `<?xml version="1.0" encoding="utf-8"?>
      <OtroDocumento>
        <Clave>123</Clave>
      </OtroDocumento>`;

    expect(validateXml(invalidXml)).toBe(false);
  });
});
