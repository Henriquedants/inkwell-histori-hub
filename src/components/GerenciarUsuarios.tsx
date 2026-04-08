import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, UserPlus, Shield, User } from "lucide-react";

interface AppUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
}

const GerenciarUsuarios = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");

  const fetchUsers = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    const res = await supabase.functions.invoke("admin-list-users", {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    if (res.error) {
      toast.error("Erro ao listar usuários");
    } else {
      setUsers(res.data.users || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const { data: { session } } = await supabase.auth.getSession();
    
    const res = await supabase.functions.invoke("admin-create-user", {
      body: { email: newEmail, password: newPassword, role: newRole },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    if (res.error || res.data?.error) {
      toast.error(res.data?.error || "Erro ao criar usuário");
    } else {
      toast.success("Usuário criado com sucesso!");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      setShowForm(false);
      fetchUsers();
    }
    setCreating(false);
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja remover ${email}?`)) return;

    const { data: { session } } = await supabase.auth.getSession();
    
    const res = await supabase.functions.invoke("admin-delete-user", {
      body: { userId },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    if (res.error || res.data?.error) {
      toast.error(res.data?.error || "Erro ao remover usuário");
    } else {
      toast.success("Usuário removido!");
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Gerenciar Usuários</h2>
          <p className="text-sm text-muted-foreground">Crie e gerencie acessos ao sistema</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <UserPlus size={16} />
          Novo Usuário
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold">Criar novo usuário</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
                placeholder="usuario@email.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Perfil</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? "Criando..." : "Criar Usuário"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface2">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Perfil</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Criado em</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Carregando...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Nenhum usuário encontrado</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface2/50 transition-colors">
                  <td className="px-5 py-3 font-medium">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.role === "admin"
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {u.role === "admin" ? <Shield size={12} /> : <User size={12} />}
                      {u.role === "admin" ? "Admin" : "Usuário"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
                      title="Remover usuário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GerenciarUsuarios;
