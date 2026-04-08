import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import Dashboard from "@/components/Dashboard";
import RegistrarTroca from "@/components/RegistrarTroca";
import Estoque from "@/components/Estoque";
import Historico from "@/components/Historico";
import Impressoras from "@/components/Impressoras";
import GerenciarUsuarios from "@/components/GerenciarUsuarios";
import { DataProvider } from "@/hooks/useData";

type Tab = "dashboard" | "troca" | "estoque" | "historico" | "impressoras" | "usuarios";

const InkControlApp = () => {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "troca", label: "Registrar Troca" },
    { id: "estoque", label: "Estoque" },
    { id: "historico", label: "Histórico" },
    { id: "impressoras", label: "Impressoras" },
    { id: "usuarios", label: "Usuários", adminOnly: true },
  ];

  const visibleTabs = tabs.filter((t) => !t.adminOnly || isAdmin);

  return (
    <DataProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex items-center justify-between px-7 py-3.5 bg-surface border-b border-border">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
            Controle de Cartuchos
          </div>
          <nav className="flex gap-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab.id
                    ? "bg-surface2 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface2"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            <button
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="max-w-[1300px] mx-auto p-7">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "troca" && <RegistrarTroca />}
          {activeTab === "estoque" && <Estoque />}
          {activeTab === "historico" && <Historico />}
          {activeTab === "impressoras" && <Impressoras />}
          {activeTab === "usuarios" && isAdmin && <GerenciarUsuarios />}
        </main>
      </div>
    </DataProvider>
  );
};

export default InkControlApp;
