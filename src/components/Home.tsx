//@ts-nocheck
import { useEffect, useState } from 'react';
import PrivateSalaryVoting from '../abi/PrivateSalaryVoting.json';
import { ethers } from 'ethers';


import Session from './Session';

export default function Crowdfund() {
  const [currentPage, setCurrentPage] = useState('mint');
  const [sessionForm, setSessionForm] = useState({
    minimumSalary: '',
    maximumSalary: '',
    deadline: ''
  });
  const [sessionLength, setSessionLength] = useState('0');

   const [createSessionStep, setCreateSessionStep] = useState<'idle' | 'creating' | 'success'>("idle");
   


  const handleCreateSession = async() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const user = await signer.getAddress();
    console.log({user});
    setCreateSessionStep("creating");
    if (sessionForm.minimumSalary && sessionForm.maximumSalary && sessionForm.deadline) {
        // convert deadline from hrs to seconds
        const deadline = 60 * 60 * Number(sessionForm.deadline);
        try {
          const contract = new ethers.Contract(PrivateSalaryVoting.address, PrivateSalaryVoting.abi, signer);
          const tx = await contract.createSession(sessionForm.minimumSalary, sessionForm.maximumSalary, deadline);
          const res = await tx.wait();
          console.log({res});
          setCreateSessionStep('success');
            
        } catch(err: any) {
             console.error('Creating session failed:', err);
        }
    }
  };


  const fetchSessionLength = async() => {
     const provider = new ethers.BrowserProvider(window.ethereum);
     const contract = new ethers.Contract(PrivateSalaryVoting.address, PrivateSalaryVoting.abi, provider);
     const sessionLength = await contract.nextSessionId();
     setSessionLength(sessionLength.toString());

  }
  useEffect(() => {
    fetchSessionLength()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className='text-white bg-white'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore enim eius tenetur praesentium iste cumque distinctio fugiat animi porro sunt impedit, dicta architecto magnam blanditiis illo sint, quasi, sapiente similique.</div>
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentPage('create')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                currentPage === 'create'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Create session
            </button>
            <button
              onClick={() => setCurrentPage('sessions')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                currentPage === 'sessions'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All sessions
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 mt-8">

        
        {currentPage === 'create' && (
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full">
              <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Create Session
              </h1>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Salary
                  </label>
                  <input
                    value={sessionForm.minimumSalary}
                    onChange={(e) => setSessionForm({...sessionForm, minimumSalary: e.target.value})}
                    placeholder="Enter minimum salary"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Salary
                  </label>
                  <input
                    value={sessionForm.maximumSalary}
                    onChange={(e) => setSessionForm({...sessionForm, maximumSalary: e.target.value})}
                    placeholder="Enter maximum salary"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline (in hrs)
                  </label>
                  <input
                    value={sessionForm.deadline}
                    onChange={(e) => setSessionForm({...sessionForm, deadline: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleCreateSession}
                  disabled={createSessionStep === 'creating'}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-md"
                >
                    {createSessionStep === 'creating' && 'Creating Session...'}
                    {createSessionStep === 'success' && 'Creating Session Successful ✅'}
                    {createSessionStep === 'idle' && ' Create Session'}
                 
                </button>
              </div>
            </div>
          </div>
        )}

        
        {currentPage === 'sessions' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              All sessions
            </h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: sessionLength }, (_, i) => i).map((id, index) => (
               <Session key={index} id={id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}