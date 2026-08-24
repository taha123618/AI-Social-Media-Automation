import { Suspense } from 'react';
import { Brain } from 'lucide-react';
import { KnowledgeLayout } from './_components/knowledge-layout';
import { getKnowledgeProfile, getKnowledgeDocuments } from './actions';

export default async function KnowledgePage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
   const { search } = await searchParams;
   const profile = await getKnowledgeProfile();
   const documents = await getKnowledgeDocuments(search);

   if (!profile) return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
         <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-10 max-w-lg w-full text-center shadow-sm">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
               <Brain className="h-10 w-10 text-blue-600 dark:text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Setup Your Brand</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
               Create your business profile to start managing your brand voice and knowledge documents. This helps our AI generate perfectly tailored content for you!
            </p>
            <div className="grid grid-cols-1 gap-4">
               <a href="/settings" className="block px-6 py-3 bg-[#2D46FF] hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-md active:scale-95">
                  Complete Business Profile
               </a>
            </div>
         </div>
      </div>
   );

   return (
      <div className="mx-auto max-w-7xl px-6 py-10">
         <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <Brain className="h-8 w-8 text-blue-600" />
               Brand Knowledge & DNA Hub
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
               Manage core business properties, audit version history, review AI DNA positioning, and ingest knowledge context libraries.
            </p>
         </div>

         <KnowledgeLayout profile={profile} documents={documents} />
      </div>
   );
}
