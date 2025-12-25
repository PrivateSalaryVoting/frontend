//@ts-nocheck
import { ethers, hexlify } from "ethers";
import { useEffect, useState } from "react";
import PrivateSalaryVoting from '../abi/PrivateSalaryVoting.json';
import { getFheInstance, initializeFheInstance } from "../utils/fheInstance";
// submit vote, view your vote and decrypt
// owner computeAverage
// any user can read and decrypt a session finalAverage




export interface SessionProps {
    id: any;
}


const Session: React.FC<SessionProps> = ({id}) => {
    const [session, setSession] = useState({
       owner: '',
       minSalary: '',
       maxSalary: '',
       deadline: '',

        totalSalary: '',
        voteCount: '',

        revealed: '',
        finalAverage: '',
    });
    const [voteAmount, setvoteAmount] = useState('');
    const [voteStep, setvoteStep] = useState<'idle' | 'submitting' | 'success' | 'initializing' | 'ready'>("idle");
    const [revealedStep, setRevealedStep] = useState<'idle' | 'revealing' | 'success'>("idle");
    const [computeAverageStep, setComputeAverageStep] = useState<'idle' | 'computing' | 'success'>("idle");
    const [readAndDecryptAverageStep, setReadAndDecryptAverageStep] = useState<'idle' | 'readAndDecryptAverage' | 'success'>("idle");
    
    const [revealedVote, setrevealedVote] = useState('0');


const formatDateTime = (dateTimeString: any) => {

    const date = new Date(Number(dateTimeString) * 1000); // Convert seconds to milliseconds
  
    // Format: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };


const handleSubmitVote = async (sessionId: any) => {

     const provider = new ethers.BrowserProvider(window.ethereum);
     const signer = await provider.getSigner();
     const user = await signer.getAddress();

     try {


    // Initialize FHEVM if not already initialized
        let fhe = getFheInstance();
        if (!fhe) {
            setvoteStep('initializing');
            fhe = await initializeFheInstance();
            setvoteStep('ready');
        }
        if (!fhe) throw new Error('Failed to initialize FHE instance');

        const ciphertext = await fhe.createEncryptedInput(PrivateSalaryVoting.address, user);
        ciphertext.add64(BigInt(voteAmount));
        const { handles, inputProof } = await ciphertext.encrypt();
        const encryptedHex = hexlify(handles[0]);
        const proofHex = hexlify(inputProof);

        const contract = new ethers.Contract(PrivateSalaryVoting.address, PrivateSalaryVoting.abi, signer);
        const tx = await contract.submitVote(sessionId, encryptedHex, proofHex);
        const res = await tx.wait();
        console.log({res});
        setvoteStep('success');

        } catch(err: any) {
            console.error('Submitting failed:', err);
        }

  };

  // for user
  const handleRevealVote = async (sessionId: any) => {
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    // const user = await signer.getAddress();
    try {
        setRevealedStep('revealing')
        const contract = new ethers.Contract(PrivateSalaryVoting.address, PrivateSalaryVoting.abi, signer);
        const userVoteHandle =  await contract.getUserVote(sessionId);
        console.log("userVoteHandle: ", userVoteHandle)
        // decrypt

        let fhe = getFheInstance();
        if (!fhe) {
            setvoteStep('initializing');
            fhe = await initializeFheInstance();
            setvoteStep('ready');
        }
        if (!fhe) throw new Error('Failed to initialize FHE instance');

      let clearValue = BigInt(0);
      const keypair = fhe!.generateKeypair();
      const handleContractPairs = [
          {
              handle: userVoteHandle,
              contractAddress: PrivateSalaryVoting.address,
          },
      ];
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "1"; // String for consistency
      const contractAddresses = [PrivateSalaryVoting.address];

      const eip712 = fhe!.createEIP712(
          keypair.publicKey, 
          contractAddresses, 
          startTimeStamp, 
          durationDays
      );

      const signature = await signer!.signTypedData(
        eip712.domain,
        {
            UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
    );

    console.log('Signature:', signature);

    const result = await fhe.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature!.replace("0x", ""),
        contractAddresses,
        signer!.address,
        startTimeStamp,
        durationDays,
    );
    clearValue = result[userVoteHandle] as bigint;
    clearValue = BigInt(result[userVoteHandle]);
    console.log("Revealed: ", Number(clearValue));

    setrevealedVote(String(Number(clearValue)));
    setRevealedStep('success')
    } catch (err) {
        console.error('Reveal vote error:', err);
        throw err;
    }

  };

    
const handleComputeAverage = async (sessionId: any) => {

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    // const user = await signer.getAddress();
    try {
        setComputeAverageStep('computing')
        const contract = new ethers.Contract(PrivateSalaryVoting.address, PrivateSalaryVoting.abi, signer);
        const tx =  await contract.computeAverage(sessionId);
        await tx.wait();

        setComputeAverageStep('success')
        console.log()
    } catch (err) {
        console.error('Error in revealing pledge:', err);
        throw err;
    }

  };

  const handleReadAndDecryptAverage = async (sessionId: any) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    // const user = await signer.getAddress();
    try {
        setReadAndDecryptAverageStep('readAndDecryptAverage')
        const contract = new ethers.Contract(PrivateSalaryVoting.address, PrivateSalaryVoting.abi, signer);
        // const contract = new ethers.Contract(PrivateSalaryVoting.address, PrivateSalaryVoting.abi, provider);
        const finalAverage =  (await contract.sessions(sessionId))[7];
        console.log({finalAverage})
        // public decrypt
        let fhe = getFheInstance();
        if (!fhe) {
            setvoteStep('initializing');
            fhe = await initializeFheInstance();
            setvoteStep('ready');
        }
        if (!fhe) throw new Error('Failed to initialize FHE instance');

        const results = await fhe.publicDecrypt([finalAverage]);
        console.log("Public decrypted final average: ", results)

      

        setReadAndDecryptAverageStep('success')
        console.log()
    } catch (err) {
        console.error('Error in revealing pledge:', err);
        throw err;
    }
  };




// use id and read from ethers/wagmi and dsiplay result
  const fetchSession = async() => {
     const provider = new ethers.BrowserProvider(window.ethereum);
     const contract = new ethers.Contract(PrivateSalaryVoting.address, PrivateSalaryVoting.abi, provider);
     const s = await contract.sessions(id);
     setSession({
      owner: s[0],
      minSalary: s[1],
      maxSalary: s[2],
      deadline: s[3],
      totalSalary: s[4],
      voteCount: s[5],
      revealed: s[6],
      finalAverage: s[7]
     })

  }
  useEffect(() => {
    fetchSession()
  }, [])

  return (
    <div key={id} className="bg-white rounded-xl shadow-lg p-6">

                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Session #{id}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-semibold">Owner:</span> {session.owner.slice(0, 6)}...{session.owner.slice(-4)}</p>
                      <p><span className="font-semibold">MinSalary:</span> {session.minSalary}</p>
                      <p><span className="font-semibold">MaxSalary:</span> {session.maxSalary}</p>
                      <p><span className="font-semibold">VoteCount:</span> {session.voteCount}</p>

                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Enter pledge amount"
                      value={voteAmount || ''}
                      onChange={(e) => setvoteAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    
                    <button
                      onClick={() => handleSubmitVote(id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      
                        {voteStep === 'initializing' && ' Initializing FHE...'}
                        {voteStep === 'ready' && ' FHE is ready'}
                        {voteStep === 'submitting' && 'Voting...'}
                        {voteStep === 'success' && 'Voting Successful ✅'}
                        {voteStep === 'idle' && ' Vote'}
                    </button>
                    
                    <button
                      onClick={() => handleRevealVote(id)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      
                        {revealedStep === 'revealing' && 'Revealing...'}
                        {revealedStep === 'success' && 'Revealing Successful ✅'}
                        {revealedStep === 'idle' && ' Reveal Pledge'}
                    </button>

                    <button
                      onClick={() => handleComputeAverage(id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >

                        {computeAverageStep === 'computing' && 'Computing...'}
                        {computeAverageStep === 'success' && 'Computing Successful ✅'}
                        {computeAverageStep === 'idle' && ' Compute Average (Only owner)'}
                    </button>

                    <button
                      onClick={() => handleReadAndDecryptAverage(id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >

                        {readAndDecryptAverageStep === 'readAndDecryptAverage' && 'ReadingAndDecryptingAverage...'}
                        {readAndDecryptAverageStep === 'success' && 'ReadAndDecryptAverage Successful ✅'}
                        {readAndDecryptAverageStep === 'idle' && ' ReadAndDecryptAverage'}
                    </button>
                  </div>
                </div>
  );
};

export default Session; 