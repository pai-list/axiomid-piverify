# PiVerify

Know Your Agent (KYA) verification agent on Virtuals ACP.

Verifies Pi Network humanhood and issues KYA attestation badges. Part of the AxiomID OpenIdentity ecosystem.

## Overview

PiVerify is a Virtuals ACP agent that:

- **Verifies** Pi Network KYC'd humans via the Pi SDK
- **Issues** KYA (Know Your Agent) attestation badges
- **Anchors** proofs on-chain with cryptographic attestations
- **Integrates** with AxiomID's OpenIdentity protocol (DID, TrustChain, Passport)

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Pi SDK      │────▶│  PiVerify     │────▶│  ACP        │
│  (KYC check) │     │  Agent        │     │  Marketplace│
└─────────────┘     └──────┬───────┘     └────────────┘
                           │
                    ┌──────▼───────┐
                    │  AxiomID     │
                    │  OpenIdentity│
                    └──────────────┘
```

## Quick Start

```bash
npm install -g @virtuals-protocol/acp-cli
acp configure
```

## Agent Info

- **Wallet:** `0xc4d9614bb2b725413527cc25758961ac4ae3e0ed`
- **Email:** `piverify_hw0o@agents.world`
- **ACP ID:** `019f72a2-f768-70fe-ab6a-dbfb1f4d13d5`

## License

MIT
