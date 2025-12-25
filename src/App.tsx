//@ts-nocheck
import { FaChartBar } from 'react-icons/fa';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Home from './components/Home';



function App() {


    const location = useLocation();
    const path = location.pathname;
 

  return (
    <>
      <header className="w-screen flex justify-between items-center px-4 sm:px-8 py-3 sm:py-4 bg-blue-600 shadow fixed top-0 left-0 z-10">
        <div className="flex items-center gap-1 sm:gap-2 cursor-pointer select-none">
          <FaChartBar className="text-orange-500 text-xl sm:text-2xl drop-shadow" />
          <span className="text-lg sm:text-2xl font-extrabold text-mint-700 tracking-tight drop-shadow-sm text-white">PrivateSalaryVoting</span>
        </div>
        <div className="flex gap-1 sm:gap-2 items-center">
          <ConnectButton showBalance={false} accountStatus="address" />
        </div>
      </header>
      <div className="flex flex-col items-center min-h-screen w-full bg-gray-50 p-2 sm:p-4 pt-16 sm:pt-20 overflow-x-hidden">



      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">

        {/* Main content under tabs */}
        <Routes>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
                 
      {
        path === '/' ? (
          
          <div className=''>
            <Home />
          </div>
        ) : ""
      }                     

      </div>
    </>
  );
}

export default App;
