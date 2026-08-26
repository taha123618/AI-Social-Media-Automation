import { Suspense } from 'react';
import Link from 'next/link';
import { Brain, Sparkles, Database, FileText } from 'lucide-react';
import { KnowledgeLayout } from './_components/knowledge-layout';
import { getKnowledgeProfile, getKnowledgeDocuments } from './actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const profile = await getKnowledgeProfile();
  const documents = await getKnowledgeDocuments(search);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-card border border-border/80 rounded-2xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
            <Brain className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Setup Your Brand DNA</h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Configure your business profile and brand voice guidelines. Our autonomous AI agents will use this knowledge context to write authentic content tailored to your audience.
          </p>
          <Link href="/settings">
            <Button className="w-full h-9 rounded-lg text-xs font-semibold">
              Complete Business Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Brand Knowledge &amp; DNA Hub
            </h1>
            <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/20">
              RAG CONTEXT
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Manage core business properties, audit version history, and ingest vector knowledge documents for LLM grounding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="outline" size="sm" className="h-9 px-3.5 text-xs font-semibold rounded-lg">
              Voice Settings
            </Button>
          </Link>
          <Link href="/studio">
            <Button size="sm" className="h-9 px-4 text-xs font-semibold rounded-lg gap-1.5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Studio Dispatch</span>
            </Button>
          </Link>
        </div>
      </div>

      <KnowledgeLayout profile={profile} documents={documents} />
    </div>
  );
}
