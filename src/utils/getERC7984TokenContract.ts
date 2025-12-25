import { ethers } from "ethers";
import ERC7984TokenABI from '../abi/ERC7984Token.json';


export function getERC7984TokenContract(providerOrSigner?: any) {

  let runner: any = providerOrSigner;
  // If runner is not an ethers v6 Signer/Provider, fall back to a BrowserProvider for reads
  const isEthersRunner = runner && (typeof runner === 'object') && (
    'provider' in runner || // Signer
    'getBlockNumber' in runner || // Provider
    'call' in runner // Fallback check
  );
  if (!isEthersRunner) {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      runner = new ethers.BrowserProvider((window as any).ethereum);
    } else {
      runner = ethers.getDefaultProvider();
    }
  }

  return new ethers.Contract(ERC7984TokenABI.address, ERC7984TokenABI.abi, runner);
}