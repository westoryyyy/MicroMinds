#!/usr/bin/env bash
# script/export.sh - Export deployment artifact for Backend/Frontend/Indexer

CHAIN_ID=${1:-10143}
BROADCAST_FILE="broadcast/Deploy.s.sol/$CHAIN_ID/run-latest.json"
OUTPUT_FILE="deployments/monad-testnet.json"

if [ ! -f "$BROADCAST_FILE" ]; then
  echo "Error: Broadcast file not found at $BROADCAST_FILE. Run deployment first."
  exit 1
fi

ADDRESS=$(jq -r '.transactions[] | select(.transactionType=="CREATE") | .contractAddress' "$BROADCAST_FILE" | head -n 1)
TX_HASH=$(jq -r '.transactions[] | select(.transactionType=="CREATE") | .hash' "$BROADCAST_FILE" | head -n 1)

if [ -z "$ADDRESS" ] || [ "$ADDRESS" == "null" ]; then
  echo "Error: Could not find CREATE transaction in broadcast file."
  exit 1
fi

# Extract ABI from forge compilation output
jq -n \
  --arg addr "$ADDRESS" \
  --arg tx "$TX_HASH" \
  --slurpfile abi out/Escrow.sol/Escrow.json \
  '{
    address: $addr,
    transactionHash: $tx,
    abi: $abi[0].abi
  }' > "$OUTPUT_FILE"

echo "✅ Successfully exported deployment to $OUTPUT_FILE"
echo "Address: $ADDRESS"
