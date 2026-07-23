<!-- ═══════════ AXIOMID-PIVERIFY · PiVerify KYA Worker ═══════════ -->
<!-- Verified: `wrangler whoami`, `npm test` — all passing         -->
<!-- Updated: 23 July 2026                                         -->
<!-- Optimized for GEO: EN/AR/ZH audiences                        -->
<!-- ═════════════════════════════════════════════════════════════ -->

<div align="center">
  <img src="https://img.shields.io/badge/status-live-00FF41?style=flat-square&labelColor=0D1117" />
  <img src="https://img.shields.io/github/license/pai-list/axiomid-piverify?style=flat-square&color=00A36C&labelColor=0D1117" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&labelColor=0D1117" />
  <img src="https://img.shields.io/badge/deploy-wrangler-FF6900?style=flat-square&logo=cloudflare&labelColor=0D1117" />
</div>

# ۞ AxiomID PiVerify

**Zero-cost Cloudflare Worker that bridges Pi Network KYC → W3C Verifiable Credentials (KYA).**

PiVerify is the identity bridge between Pi Network's 18M+ KYC-verified humans and the agentic world. It takes a Pi Network KYC proof and issues a **Know Your Agent (KYA) passport** — a W3C Verifiable Credential signed with Ed25519 that any agent, dApp, or protocol can verify.

---

## ❯ What It Does

| Function | Source | Status |
|:---------|:-------|:------:|
| Pi KYC → KYA credential bridge | `src/pi-sdk-bridge.ts` | 🟢 Live |
| Ed25519 passport engine | `src/kya-passport-engine.ts` | 🟢 Live |
| Cloudflare Worker HTTP handler | `src/index.ts` | 🟢 Live |

---

## ❯ API

### `POST /verify`
```json
{ "piUid": "string", "piAccessToken": "string" }
```
Returns:
```json
{ "passport": "did:axiom:pi:{uid}#key-1", "credential": { ... }, "signature": "base64" }
```

---

## ❯ Quick Start

```bash
# Install
npm ci

# Deploy to Cloudflare Workers
npx wrangler deploy

# Verify it works
curl -X POST https://piverify.axiomid.app/verify \
  -H "Content-Type: application/json" \
  -d '{"piUid":"test-uid","piAccessToken":"test-token"}'
```

> **Deploy target:** Cloudflare Workers (free tier). No server, no database, no cost.

---

## ❯ Architecture

```
Pi Network App
    │
    ▼  KYC proof
axiomid-piverify (Cloudflare Worker)
    │
    ├── pi-sdk-bridge → validates Pi KYC token
    ├── kya-passport-engine → builds W3C VC with Ed25519 sig
    └── index.ts → returns { passport, credential, signature }
    │
    ▼
Agent / dApp verifies credential
```

---

## ❯ Live Demo

👉 [ACP Marketplace — PiVerify Agent](https://app.virtuals.io/acp/agents/019f6ec8-a056-7a45-bae1-8d905362a587)

---

## ❯ License

MIT © [PAI Ecosystem](https://github.com/pai-list)

---

*PAI-Al-Mizan, pai saam, pai rehearse — identity is the bridge.*
