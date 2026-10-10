const { createWalletClient, http, privateKeyToAccount } = require('viem');
const { monadTestnet } = require('viem/chains');

const account = privateKeyToAccount('0x6b4b05af325662ac7da5296db5eb8d90fbd2f1380e8c2f4c2c218717505ff5a0');
const client = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http('https://monad-testnet.g.alchemy.com/v2/alch_wA_ps-oDwEvBTV8roAIcV')
});

async function main() {
  try {
    const tx = await client.sendTransaction({
      to: '0x949ffef3147aa7ede144c93bc257d63b6ef50128',
      value: 100n
    });
    console.log("TX OK:", tx);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
main();
