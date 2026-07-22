import { EnvBindings } from "./index";

export interface KYAPassportRequest {
  humanPiUid: string;        // Verified via Pi Network KYC
  humanUsername: string;     // Pi Pioneer Username
  agentName: string;         // Name of AI Agent
  agentRole: string;         // Agent Specialty / Role
  agentCapabilities: string[]; // MCP Tools & Skills
}

export class KYAPassportEngine {
  /**
   * Transforms Pi KYC (Know Your Customer) into KYA (Know Your Agent)
   * Anchors AI Agent to a verified human Pioneer DID
   */
  static async issueKYAPassport(env: EnvBindings, req: KYAPassportRequest) {
    const humanDID = `did:axiom:pi:${req.humanPiUid}`;
    const agentUUID = crypto.randomUUID().slice(0, 8);
    const agentDID = `did:axiom:agent:${agentUUID}`;

    // WebCrypto Ed25519 Keypair generation for Agent
    const keyPair = await crypto.subtle.generateKey(
      { name: "Ed25519" },
      true,
      ["sign", "verify"]
    ) as CryptoKeyPair;

    const rawPubKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const pubKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(rawPubKey)));

    // W3C Verifiable Credential KYA Passport
    const kyaPassportVC = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://github.com/pai-list/openidentity.md/schema/kya.schema.json"
      ],
      id: `urn:uuid:${crypto.randomUUID()}`,
      type: ["VerifiableCredential", "KnowYourAgentPassport"],
      issuer: "did:axiom:piverify-kya-issuer",
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: agentDID,
        agentName: req.agentName,
        agentRole: req.agentRole,
        capabilities: req.agentCapabilities,
        publicKey: pubKeyBase64,
        humanSponsor: {
          did: humanDID,
          username: req.humanUsername,
          kycProvider: "PiNetworkKYC",
          kycVerified: true
        }
      }
    };

    // Sign KYA Passport with Ed25519
    const encoder = new TextEncoder();
    const sigBuffer = await crypto.subtle.sign(
      { name: "Ed25519" },
      keyPair.privateKey,
      encoder.encode(JSON.stringify(kyaPassportVC))
    );
    const proofSignature = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));

    const signedKYAPassport = {
      ...kyaPassportVC,
      proof: {
        type: "Ed25519Signature2020",
        created: new Date().toISOString(),
        verificationMethod: `${agentDID}#keys-1`,
        proofPurpose: "assertionMethod",
        proofValue: proofSignature
      }
    };

    return {
      success: true,
      agentDID,
      humanDID,
      passport: signedKYAPassport
    };
  }
}
