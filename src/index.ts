import { Env } from "@cloudflare/workers-types";

export interface EnvBindings {
  AI: any;
  PASSPORTS: any;
}

export default {
  async fetch(req: Request, env: EnvBindings): Promise<Response> {
    const url = new URL(req.url);

    // CORS Headers for Pi Browser & AxiomID web app
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-pi-access-token",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ── 1. SSE Streaming AI Chat Endpoint (/api/v1/chat) ──
    if (url.pathname === "/api/v1/chat" && req.method === "POST") {
      const { message, history = [] } = await req.json() as any;
      if (!env.AI) {
        return Response.json({ error: "Cloudflare Workers AI not bound" }, { status: 500, headers: corsHeaders });
      }

      const messages = [
        { role: "system", content: "You are AxiomID Passport Agent. You guide users through zero-cost identity verification and passport issuance." },
        ...history,
        { role: "user", content: message }
      ];

      const stream = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages,
        stream: true,
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // ── 2. Speech-to-Text Voice Endpoint (/api/v1/voice/stt) ──
    if (url.pathname === "/api/v1/voice/stt" && req.method === "POST") {
      if (!env.AI) return Response.json({ error: "AI not bound" }, { status: 500, headers: corsHeaders });
      const audioBuffer = await req.arrayBuffer();
      const input = new Uint8Array(audioBuffer);

      const result = await env.AI.run("@cf/openai/whisper", { audio: [...input] });
      return Response.json({ text: (result as any).text || "" }, { headers: corsHeaders });
    }

    // ── 3. Text-to-Speech Synthesis (/api/v1/voice/tts) ──
    if (url.pathname === "/api/v1/voice/tts" && req.method === "POST") {
      const { text } = await req.json() as any;
      if (!env.AI) return Response.json({ error: "AI not bound" }, { status: 500, headers: corsHeaders });

      const result = await env.AI.run("@cf/myshell/melotts-english", { prompt: text });
      return new Response(result, {
        headers: { ...corsHeaders, "Content-Type": "audio/mpeg" }
      });
    }

    // ── 4. Interactive W3C Passport Issuance & Ed25519 Signing (/api/v1/passport/issue) ──
    if (url.pathname === "/api/v1/passport/issue" && req.method === "POST") {
      const { username, piUid, attributes } = await req.json() as any;

      // Generate Ed25519 Keypair via WebCrypto API (Zero-Cost Crypto)
      const keyPair = await crypto.subtle.generateKey(
        { name: "Ed25519" },
        true,
        ["sign", "verify"]
      ) as CryptoKeyPair;

      const rawPublicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const pubKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(rawPublicKey)));
      const did = `did:axiom:${piUid || crypto.randomUUID().slice(0, 8)}`;

      // W3C Verifiable Credential Passport JSON
      const passportVC = {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://github.com/pai-list/openidentity.md/schema/openidentity.schema.json"
        ],
        id: `urn:uuid:${crypto.randomUUID()}`,
        type: ["VerifiableCredential", "OpenIdentityPassport"],
        issuer: "did:axiom:piverify-issuer",
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: did,
          username: username || "Pioneer",
          piUid: piUid || null,
          attributes: attributes || {},
          publicKey: pubKeyBase64,
          verificationMethod: "Ed25519Signature2020",
        }
      };

      // Sign the passport credential with Ed25519
      const encoder = new TextEncoder();
      const signatureBuffer = await crypto.subtle.sign(
        { name: "Ed25519" },
        keyPair.privateKey,
        encoder.encode(JSON.stringify(passportVC))
      );
      const proofSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

      const signedPassport = {
        ...passportVC,
        proof: {
          type: "Ed25519Signature2020",
          created: new Date().toISOString(),
          verificationMethod: `${did}#keys-1`,
          proofPurpose: "assertionMethod",
          proofValue: proofSignature,
        }
      };

      // Store in KV if bound
      if (env.PASSPORTS) {
        await env.PASSPORTS.put(`passport:${did}`, JSON.stringify(signedPassport));
      }

      return Response.json({ success: true, did, passport: signedPassport }, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === "/health" || url.pathname === "/") {
      return Response.json({ status: "healthy", service: "axiomid-piverify", version: "1.0.0" }, { headers: corsHeaders });
    }

    return new Response("axiomid-piverify — Not Found", { status: 404, headers: corsHeaders });
  }
};
