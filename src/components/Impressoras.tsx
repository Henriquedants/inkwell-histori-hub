import { useState } from "react";
import { useData } from "@/hooks/useData";

const Impressoras = () => {
  const { impressoras, historico, addImpressora, deleteImpressora } = useData();
  const [nome, setNome] = useState("");
  const [modelo, setModelo] = useState("");
  const [local, setLocal] = useState("");
  const [carts, setCarts] = useState("");

  const handleCadastrar = async () => {
    if (!nome) return;
    await addImpressora({ nome, modelo, local, cartuchos: carts });
    setNome(""); setModelo(""); setLocal(""); setCarts("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Cadastro de Impressoras</h1>
      <p className="text-sm text-muted-foreground mb-6">Gerencie as impressoras cadastradas</p>

      <div className="bg-surface border border-border rounded-2xl p-5 mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Nova Impressora</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Field label="Nome / Identificação">
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: HP Office 1"
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
          </Field>
          <Field label="Modelo">
            <input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ex: HP OfficeJet Pro 9010"
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
          </Field>
          <Field label="Local / Setor">
            <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex: Sala de Reuniões"
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
          </Field>
        </div>
        <Field label="Cartuchos Compatíveis">
          <input type="text" value={carts} onChange={(e) => setCarts(e.target.value)} placeholder="Ex: 964, 954 (separados por vírgula)"
            className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary mb-4" />
        </Field>
        <button onClick={handleCadastrar}
          className="bg-primary text-primary-foreground font-bold py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity">
          + Cadastrar Impressora
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr>
              {["Nome", "Modelo", "Local", "Cartuchos", "Trocas (Total)", "Ações"].map((h) => (
                <th key={h} className="bg-surface2 px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {impressoras.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">
                <div className="text-3xl mb-2">🖨️</div>Nenhuma impressora cadastrada
              </td></tr>
            ) : (
              impressoras.map((imp) => {
                const trocas = historico.filter((h) => h.impressora_id === imp.id).length;
                return (
                  <tr key={imp.id} className="hover:bg-primary/5">
                    <td className="px-4 py-3 text-sm font-semibold">{imp.nome}</td>
                    <td className="px-4 py-3 text-sm">{imp.modelo}</td>
                    <td className="px-4 py-3"><span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary">{imp.local}</span></td>
                    <td className="px-4 py-3"><code className="bg-surface2 px-2 py-0.5 rounded-md text-xs">{imp.cartuchos}</code></td>
                    <td className="px-4 py-3"><span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/15 text-accent">{trocas}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => { if (confirm("Excluir esta impressora?")) deleteImpressora(imp.id); }}
                        className="bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-destructive/25 transition-colors">✕</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

export default Impressoras;
