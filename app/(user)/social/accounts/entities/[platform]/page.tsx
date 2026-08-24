'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Entity {
   id: string;
   name: string;
   avatar: string;
   access_token: string;
}

export default function EntitySelectionPage() {
   const params = useParams();
   const searchParams = useSearchParams();
   const router = useRouter();
   const platform = (params?.platform as string) || '';
   const stateId = searchParams.get('stateId');
   const businessId = searchParams.get('businessId');

   const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
   const [connecting, setConnecting] = useState(false);

   const { data: entities = [], isLoading: loading } = useQuery({
      queryKey: ['social-entities', platform, stateId],
      queryFn: async () => {
         const res = await axios.get(`/api/social/entities/${platform}?stateId=${stateId}`);
         return res.data as Entity[];
      },
      enabled: !!platform && !!stateId,
   });

   useEffect(() => {
      if (entities.length > 0 && !selectedEntity) {
         setSelectedEntity(entities[0].id);
      }
   }, [entities, selectedEntity]);

   const handleFinishConnection = async () => {
      if (!selectedEntity || !stateId) return;
      const entity = entities.find((e: Entity) => e.id === selectedEntity);
      if (!entity) return;

      setConnecting(true);
      try {
         await axios.post(`/api/social/entities/${platform}/connect`, {
            stateId,
            entityId: entity.id,
            entityName: entity.name,
            entityAvatar: entity.avatar,
            entityAccessToken: entity.access_token
         });
         toast.success(`${entity.name} connected successfully!`);
         router.push('/social/accounts?success=true');
      } catch (error) {
         console.error('Connect entity error:', error);
         toast.error("Failed to complete connection");
      } finally {
         setConnecting(false);
      }
   };

   if (loading) {
      return (
         <div className="flex h-[80vh] flex-col items-center justify-center space-y-6">
            <div className="relative">
               <div className="h-20 w-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-blue-500" />
               </div>
            </div>
            <div className="space-y-2 text-center">
               <p className="text-xl font-medium">Fetching your entities...</p>
               <p className="text-muted-foreground animate-pulse">Communicating with {platform.toUpperCase()} APIs</p>
            </div>
         </div>
      );
   }

   return (
      <div className="mx-auto max-w-2xl py-20 px-4 min-h-screen">
         <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-12"
         >
            <div className="space-y-4 text-center">
               <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-2 backdrop-blur-sm ring-1 ring-blue-500/20"
               >
                  <ShieldCheck className="h-8 w-8" />
               </motion.div>
               <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text dark:text-white italic">
                  Choose entity
               </h1>
               <p className="text-muted-foreground text-xl max-w-md mx-auto leading-relaxed">
                  Select the {platform.toUpperCase()} business asset you want to connect to this workspace.
               </p>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
               {entities?.map((entity: Entity, index: number) => (
                  <motion.div
                     key={entity.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.1 * index }}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => setSelectedEntity(entity.id)}
                     className={`group relative flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer ${selectedEntity === entity.id
                        ? 'border-blue-500 bg-blue-500/[0.08] shadow-2xl shadow-blue-500/20 ring-1 ring-blue-500/50'
                        : 'border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                  >
                     <div className="flex items-center space-x-6">
                        <div className="relative">
                           <div className="h-16 w-16 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-blue-500 to-cyan-400">
                              <img
                                 src={entity.avatar}
                                 alt={entity.name}
                                 className="h-full w-full rounded-full object-cover bg-neutral-900"
                              />
                           </div>
                           {selectedEntity === entity.id && (
                              <motion.div
                                 layoutId="selection-check"
                                 className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg border-2 border-neutral-950"
                              >
                                 <Check className="h-4 w-4 stroke-[3px]" />
                              </motion.div>
                           )}
                        </div>
                        <div className="space-y-1">
                           <p className="text-xl font-bold tracking-tight">{entity.name}</p>
                           <p className="text-sm font-mono text-muted-foreground/60">ID: {entity.id}</p>
                        </div>
                     </div>
                     <div className={`p-2 rounded-full transition-colors ${selectedEntity === entity.id ? 'bg-blue-500/20 text-blue-400' : 'text-white/10'}`}>
                        <ArrowRight className="h-5 w-5" />
                     </div>
                  </motion.div>
               ))}

               {entities.length === 0 && (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="py-20 text-center rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.01]"
                  >
                     <p className="text-muted-foreground text-lg">No connectable entities found for this account.</p>
                     <p className="text-sm text-muted-foreground/50 mt-2">Make sure you have appropriate admin permissions.</p>
                  </motion.div>
               )}
            </div>

            <div className="flex flex-col items-center space-y-6 pt-4">
               <Button
                  size="lg"
                  disabled={!selectedEntity || connecting}
                  onClick={handleFinishConnection}
                  className={`group h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl transition-all relative overflow-hidden ${selectedEntity
                     ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 ring-2 ring-blue-400/20'
                     : 'bg-white/5 text-white/20'
                     }`}
               >
                  {connecting ? (
                     <div className="flex items-center">
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        FINISHING...
                     </div>
                  ) : (
                     <div className="flex items-center">
                        FINISH CONNECTION
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                     </div>
                  )}
                  {selectedEntity && (
                     <motion.div
                        initial={{ left: '-100%' }}
                        animate={{ left: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                     />
                  )}
               </Button>

               <p className="text-xs text-muted-foreground/40 font-medium tracking-widest uppercase">
                  Secure connection via {platform.toUpperCase()} OAuth 2.0
               </p>
            </div>
         </motion.div>
      </div>
   );
}
