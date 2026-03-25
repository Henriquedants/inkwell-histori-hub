import { useAuth, AuthProvider } from "@/hooks/useAuth";
import AuthPage from "@/pages/AuthPage";
import InkControlApp from "@/components/InkControlApp";

const IndexContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))] animate-pulse" />
          <span className="text-sm text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;
  return <InkControlApp />;
};

const Index = () => (
  <AuthProvider>
    <IndexContent />
  </AuthProvider>
);

export default Index;
