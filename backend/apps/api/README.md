# MicroMinds API

This is the backend API for MicroMinds, handling proxy requests, rate limiting, validation, and escrow payment processing.

## Operator Rotation (Ownable2Step)

The `Escrow` contract implements `Ownable2Step` for operator key rotation to ensure secure transfer of the operator role. If the operator's private key (`OPERATOR_PRIVATE_KEY` in `.env`) needs to be rotated (e.g. for security reasons or transitioning from testing to production), follow this two-step process:

1. **Initiate Transfer:** Using the *current* operator key, call `transferOwnership(newOperatorAddress)` on the Escrow contract.
2. **Accept Transfer:** Using the *new* operator key, call `acceptOwnership()` on the Escrow contract.

Once accepted, update the `OPERATOR_PRIVATE_KEY` environment variable in the backend and restart the API to seamlessly switch to the new key.
