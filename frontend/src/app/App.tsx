
import { Footer } from '@/components/footer/Footer';
import { Header } from '@/components/header/Header';
import { NavBar } from '@/components/navBar/NavBar';
import { ActiveVisitGuard } from '@/components/visitNavigationGuard/VisitNavigationGuard';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import "tailwindcss";




export const App: React.FC = () => {
 
  return (<> 
    <div className='flex  h-screen' >
      <div className='flex flex-col'>
         <ActiveVisitGuard />
        <NavBar />
       <Footer />
      </div>
      <div className='flex-1 flex flex-col'>
        <Header /> 
        <main className="flex-1 pt-[24px] pl-[24px] pr-[24px]  overflow-auto bg-[#F3F4F6]  ">
          <Toaster 
       position="bottom-right"
  reverseOrder={false}/> <Outlet/>
        </main>
      </div>
      
       
    </div>
   
  
   
    
</>
    
  );
};
