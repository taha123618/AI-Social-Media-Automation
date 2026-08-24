'use client'
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { LogOut } from 'lucide-react'
import { useState } from 'react';

const Logout = () => {
   const [loading, setLoading] = useState(false)
   const handleLogout = async () => {
      try {
         setLoading(true)
         await authClient.signOut();
         window.location.href = '/login';
      } catch (error) {
         console.error('Logout failed:', error);
      } finally {
         setLoading(false)
      }
   };
   return (
      <Button
         variant="destructive"
         size="default"
         onClick={handleLogout}
         className="w-full rounded-xl font-bold py-6 shadow-lg shadow-rose-500/20"
      >
         <LogOut className="h-5 w-5" />
         {loading ? "Logging out..." :
            "Logout"
         }
      </Button>
   )
}

export default Logout