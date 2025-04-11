import { ApiPromise, WsProvider } from '@polkadot/api';
import type { Codec } from '@polkadot/types/types';

/**
 * Creates a proxy call on Kusama using the provided account information
 */
export async function createProxyCall(account: string, pureProxyAccount: string): Promise<{ 
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    // Connect to Kusama and AssetHub Kusama
    const kusama_wsProvider = new WsProvider('wss://kusama.public.curie.radiumblock.co/ws');
    const kusama_api = await ApiPromise.create({ provider: kusama_wsProvider });

    const ah_wsProvider = new WsProvider('wss://kusama-asset-hub-rpc.polkadot.io');
    const ah_api = await ApiPromise.create({ provider: ah_wsProvider });

    // Get proxy definition key
    const proxyDefinitionKey = kusama_api.query.proxy.proxies.key(pureProxyAccount);
    console.log("ProxyDefinition key: " + proxyDefinitionKey.toString());

    // Get block information
    const blockToRootResponse = await ah_api.query.remoteProxyRelayChain.blockToRoot();
    // Convert the response to a string and parse it
    const blockToRootStr = blockToRootResponse.toString();
    const blockToRoot = JSON.parse(blockToRootStr);
    
    // Get the latest block for which AH knows the storage root
    const proofBlock = blockToRoot[blockToRoot.length - 1][0];
    const proofBlockHash = await kusama_api.rpc.chain.getBlockHash(proofBlock);

    console.log("Fetching proof for block " + proofBlock);

    // Build the proof on Kusama
    const keys = [proxyDefinitionKey.toString()];
    const proofResponse = await kusama_api.rpc.state.getReadProof(keys, proofBlockHash);
    // Convert the response to a string and parse it
    const proofResponseStr = proofResponse.toString();
    const proof = JSON.parse(proofResponseStr);

    // The call that will be executed by the proxied account
    const wrapped_call = ah_api.tx.balances.transferAll(account, false);

    // Construct the proxy call
    const proxy_call = ah_api.tx.remoteProxyRelayChain.remoteProxy(
      pureProxyAccount,
      null, 
      wrapped_call.method, 
      { RelayChain: { proof: proof.proof, block: proofBlock }},
    );

    console.log("The call: " + proxy_call.method.toString());
    
    return {
      success: true,
      message: "Proxy call created successfully",
      data: {
        proxyCall: proxy_call.toHex(),
        proxyDefinitionKey: proxyDefinitionKey.toString(),
        proofBlock,
        method: proxy_call.method.toHex()
      }
    };
  } catch (error) {
    console.error("Error creating proxy call:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}