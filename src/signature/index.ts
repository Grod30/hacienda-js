import { SignedXml } from "xml-crypto";
import { readFileSync } from "fs";
import { SignatureOptions } from "../types";

export async function signXml(xml: string, options: SignatureOptions): Promise<string> {
  // Validate input parameters
  if (!xml || typeof xml !== "string") {
    throw new Error("Invalid XML");
  }

  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new Error("Invalid options");
  }

  const { certPath, certType } = options;

  if (!certType) {
    throw new Error("Certificate type is required");
  }

  if (!certPath) {
    throw new Error("Certificate path is required");
  }

  if (certType !== "p12" && certType !== "pem") {
    throw new Error("Invalid certificate type");
  }

  try {
    const cert = readFileSync(certPath);
    const sig = new SignedXml();

    sig.keyInfoProvider = {
      getKeyInfo: () =>
        `<X509Data><X509Certificate>${cert.toString("base64")}</X509Certificate></X509Data>`,
      getKey: () => cert,
    };

    sig.addReference("", [
      "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
    ]);

    sig.signingKey = cert;
    sig.computeSignature(xml);

    return sig.getSignedXml();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error('File not found');
      }
      throw error;
    }
    throw new Error('Signing failed');
  }
}
