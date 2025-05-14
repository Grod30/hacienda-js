import { signXml } from '../signature';
import { readFileSync } from 'fs';
import { SignedXml } from 'xml-crypto';
import path from 'path';
import { SignatureOptions } from '../types';

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));

jest.mock("xml-crypto", () => {
  const mockSignedXml = jest.fn();
  mockSignedXml.mockImplementation(() => ({
    keyInfoProvider: null,
    signingKey: null,
    addReference: jest.fn(),
    computeSignature: jest.fn(),
    getSignedXml: jest
      .fn()
      .mockReturnValue("<SignedXml>mock-signed-xml</SignedXml>"),
  }));
  return { SignedXml: mockSignedXml };
});

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('mock-cert-content')
}));

const mockFs = jest.mocked(require('fs'));

const mockCert = Buffer.from("mock-certificate");
const mockXml = `<?xml version="1.0" encoding="utf-8"?>
  <FacturaElectronica xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronica">
    <Clave>50601011800310174000100100001010000000011199999999</Clave>
    <NumeroConsecutivo>00100001010000000011</NumeroConsecutivo>
    <FechaEmision>2025-05-13T22:00:00-06:00</FechaEmision>
  </FacturaElectronica>`;

describe("signXml", () => {
  let mockSignedXml: any;

  beforeAll(() => {
    mockSignedXml = require("xml-crypto").SignedXml;
  });

  beforeEach(() => {
    (readFileSync as jest.Mock).mockReturnValue(mockCert);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should properly configure SignedXml instance", async () => {
    const options = {
      certPath: "./cert.p12",
      password: "test123",
      certType: "p12" as const,
    };

    await signXml(mockXml, options);

    const mockInstance = mockSignedXml.mock.results[0].value;
    expect(mockInstance.keyInfoProvider).toBeDefined();
    expect(mockInstance.signingKey).toBeDefined();
    expect(mockInstance.addReference).toHaveBeenCalled();
    expect(mockInstance.computeSignature).toHaveBeenCalled();
    expect(mockInstance.getSignedXml).toHaveBeenCalled();
  });

  it("should handle file read errors", async () => {
    const options = {
      certPath: "./nonexistent.p12",
      password: "test123",
      certType: "p12" as const,
    };

    (readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("File not found");
    });

    await expect(signXml(mockXml, options)).rejects.toThrow("File not found");
  });

  it('should handle missing certificate type', async () => {
    const options = {
      certPath: './cert.p12',
      password: 'test123'
    } as any;

    await expect(signXml(mockXml, options))
      .rejects.toThrow('Certificate type is required');
  });

  it('should handle invalid certificate type', async () => {
    const options = {
      certPath: './cert.invalid',
      password: 'test123',
      certType: 'invalid' as any
    };

    await expect(signXml(mockXml, options))
      .rejects.toThrow('Invalid certificate type');
  });

  it("should handle null options", async () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error("Should not be called");
    });
    await expect(signXml(mockXml, null as unknown as SignatureOptions)).rejects.toThrow("Invalid options");
  });

  it("should handle undefined options", async () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error("Should not be called");
    });
    await expect(signXml(mockXml, undefined as unknown as SignatureOptions)).rejects.toThrow("Invalid options");
  });

  it("should handle non-object options", async () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error("Should not be called");
    });
    await expect(signXml(mockXml, 'invalid' as unknown as SignatureOptions)).rejects.toThrow("Invalid options");
  });

  it('should handle signing errors', async () => {
    const options = {
      certPath: './cert.p12',
      password: 'test123',
      certType: 'p12' as const
    };

    mockFs.readFileSync.mockReturnValueOnce(mockCert);
    const mockSignedXml = require('xml-crypto').SignedXml;
    mockSignedXml.mockImplementationOnce(() => ({
      keyInfoProvider: null,
      signingKey: null,
      addReference: jest.fn(),
      computeSignature: () => { throw new Error('Signing failed'); },
      getSignedXml: jest.fn()
    }));

    await expect(signXml(mockXml, options))
      .rejects.toThrow('Signing failed');
  });

  it('should sign XML with P12 certificate', async () => {
    const options = {
      certPath: './cert.p12',
      password: 'test123',
      certType: 'p12' as const
    };

    mockFs.readFileSync.mockReturnValueOnce(mockCert);
    const signedXml = await signXml(mockXml, options);
    
    expect(mockFs.readFileSync).toHaveBeenCalledWith('./cert.p12');
    expect(signedXml).toContain('SignedXml');
  });

  it('should sign XML with PEM certificate', async () => {
    const options = {
      certPath: './cert.pem',
      password: 'test123',
      certType: 'pem' as const
    };

    mockFs.readFileSync.mockReturnValueOnce(mockCert);
    const signedXml = await signXml(mockXml, options);
    
    expect(mockFs.readFileSync).toHaveBeenCalledWith('./cert.pem');
    expect(signedXml).toContain('SignedXml');
  });

  it("should use certificate content in keyInfo", async () => {
    const options = {
      certPath: "./cert.p12",
      password: "test123",
      certType: "p12" as const,
    };

    await signXml(mockXml, options);

    const mockInstance = mockSignedXml.mock.results[0].value;
    const keyInfo = mockInstance.keyInfoProvider.getKeyInfo();
    expect(keyInfo).toContain("<X509Data>");
    expect(keyInfo).toContain("<X509Certificate>");
    expect(keyInfo).toContain(mockCert.toString("base64"));
  });

  it("should throw error if certificate file not found", async () => {
    (readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("File not found");
    });

    const options = {
      certPath: "./nonexistent.p12",
      password: "test123",
      certType: "p12" as const,
    };

    await expect(signXml(mockXml, options)).rejects.toThrow("File not found");
  });
});
