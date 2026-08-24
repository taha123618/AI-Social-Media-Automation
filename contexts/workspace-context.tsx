"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface WorkspaceContextType {
  businessId: string | null;
  setBusinessId: (businessId: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [businessId, setBusinessId] = useState<string | null>(null);

  return (
    <WorkspaceContext.Provider value={{ businessId, setBusinessId }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
