import { ApiPromise, WsProvider } from '@polkadot/api';

document.addEventListener('DOMContentLoaded', async function() {
    const constructButton = document.getElementById('constructCall');
    const spinner = document.getElementById('loadingSpinner');
    const resultOutput = document.getElementById('resultOutput');
    const errorMessage = document.getElementById('errorMessage');
    
    // Display initial status
    resultOutput.textContent = 'Polkadot.js libraries loaded successfully. Ready to construct proxy calls.';
    
    constructButton.addEventListener('click', async function() {
        try {
            // Clear previous results and show spinner
            errorMessage.style.display = 'none';
            resultOutput.textContent = '';
            spinner.style.display = 'block';
            
            // Get user inputs
            const YOUR_ACCOUNT = document.getElementById('yourAccount').value || '5EjdajLJp5CKhGVaWV21wiyGxUw42rhCqGN32LuVH4wrqXTN';
            const PROXIED_ACCOUNT = document.getElementById('proxiedAccount').value || 'D9o7gYB92kXgr1UTjYWLDwXK5BeJdxR2irjwaoDEhJnNCfp';
            
            resultOutput.textContent += `Using accounts:\nYour Account: ${YOUR_ACCOUNT}\nProxied Account: ${PROXIED_ACCOUNT}\n\nConnecting to networks...\n`;
            
            // Connect to Kusama and AssetHub Kusama
            resultOutput.textContent += 'Connecting to Kusama network...\n';
            const kusama_wsProvider = new WsProvider('wss://kusama.public.curie.radiumblock.co/ws');
            const kusama_api = await ApiPromise.create({ provider: kusama_wsProvider });
            
            resultOutput.textContent += 'Connecting to AssetHub Kusama network...\n';
            const ah_wsProvider = new WsProvider('wss://kusama-asset-hub-rpc.polkadot.io');
            const ah_api = await ApiPromise.create({ provider: ah_wsProvider });
            
            resultOutput.textContent += 'Connections established.\n\n';
            
            // Get proxy definition key
            const proxyDefinitionKey = kusama_api.query.proxy.proxies.key(PROXIED_ACCOUNT);
            resultOutput.textContent += `ProxyDefinition key: ${proxyDefinitionKey}\n\n`;
            
            // Get block to root
            const blockToRoot = await ah_api.query.remoteProxyRelayChain.blockToRoot();
            const blockToRootJson = JSON.parse(blockToRoot.toString());
            
            // Get the latest block for which AH knows the storage root
            const proofBlock = blockToRootJson[blockToRootJson.length - 1][0];
            const proofBlockHash = await kusama_api.rpc.chain.getBlockHash(proofBlock);
            
            resultOutput.textContent += `Fetching proof for block ${proofBlock}\n`;
            
            // Build the proof on Kusama
            const proof = await kusama_api.rpc.state.getReadProof([proxyDefinitionKey], proofBlockHash);
            const proofJson = JSON.parse(proof.toString());
            
            // The call that will be executed by the proxied account
            const your_wrapped_call = ah_api.tx.balances.transferAll(YOUR_ACCOUNT, false);
            
            // Construct the proxy call
            const proxy_call = ah_api.tx.remoteProxyRelayChain.remoteProxy(
                PROXIED_ACCOUNT,
                null, 
                your_wrapped_call.method, 
                { RelayChain: { proof: proofJson.proof, block: proofBlock }}
            );
            
            resultOutput.textContent += `\nCopy this call, sign and submit in Polkadot-JS UI: \n\n ${proxy_call.method.toHex()}\n\n`;
            
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = `Error: ${error.message}`;
            errorMessage.style.display = 'block';
            resultOutput.textContent = 'An error occurred while processing your request. Check the console for more details.';
        } finally {
            // Hide spinner
            spinner.style.display = 'none';
        }
    });
});