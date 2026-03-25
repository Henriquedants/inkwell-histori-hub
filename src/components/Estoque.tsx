import { useState } from "react";
import { useData } from "@/hooks/useData";

const colorClass = (cor: string) => {
  const map: Record<string, string> = { Preto: "preto", Azul: "azul", Magenta: "magenta", Amarelo: "amarelo" };
  return map[cor] || "preto";
};

const statusTag = (qty: number, alerta: number) => {
  if (qty <= 0) return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/15 text-destructive">Zerado</span>;
  if (qty <= alerta) return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning/15 text-warning">Baixo</span>;
  return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/15 text-accent">OK</span>;
};

const Estoque = () => {
  const { cartuchos, addCartucho, deleteCartucho, reporEstoque } = useData();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showRepModal, setShowRepModal] = useState(false);
  const [repCartId, setRepCartId] = useState("");

  // New cartucho form
  const [ncModelo, setNcModelo] = useState("");
  const [ncCor, setNcCor] = useState("Preto");
  const [ncQty, setNcQty] = useState(0);
  const [ncAlerta, setNcAlerta] = useState(5);

  // Reposition form
  const [repQty, setRepQty] = useState(10);
  const [repResp, setRepResp] = useState("");

  const handleNewCartucho = async () => {
    if (!ncModelo) return;
    await addCartucho({ modelo: ncModelo, cor: ncCor, qty: ncQty, alerta: ncAlerta });
    setShowNewModal(false);
    setNcModelo(""); setNcQty(0); setNcAlerta(5);
  };

  const handleRepor = async () => {
    if (!repCartId || repQty <= 0) return;
    await reporEstoque(repCartId, repQty, repResp);
    setShowRepModal(false);
    setRepQty(10); setRepResp("");
  };

  const openRepor = (cartId?: string) => {
    if (cartId) setRepCartId(cartId);
    setShowRepModal(true);
  };

  const cores = ["Preto", "Azul", "Magenta", "Amarelo"];
  const corChipClass: Record<string, string> = {
    Preto: "bg-[rgba(80,80,80,0.3)] text-[#aaa]",
    Azul: "bg-[rgba(74,144,217,0.2)] text-[#4a90d9]",
    Magenta: "bg-[rgba(217,74,144,0.2)] text-[#d94a90]",
    Amarelo: "bg-[rgba(212,192,0,0.2)] text-[#d4c000]",
  };
  const corEmoji: Record<string, string> = { Preto: "⬛", Azul: "🟦", Magenta: "🟪", Amarelo: "🟨" };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Gerenciar Estoque</h1>
      <p className="text-sm text-muted-foreground mb-6">Visualize e atualize as quantidades em estoque</p>

      <div className="flex gap-3 mb-5 flex-wrap">
        <button onClick={() => setShowNewModal(true)} className="bg-accent text-accent-foreground font-bold py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity">
          + Novo Cartucho
        </button>
        <button onClick={() => openRepor()} className="bg-warning text-warning-foreground font-bold py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity">
          ↑ Repor Estoque
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr>
              {["Cartucho", "Modelo", "Cor", "Qtd. Atual", "Status", "Ações"].map((h) => (
                <th key={h} className="bg-surface2 px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cartuchos.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Nenhum cartucho cadastrado</td></tr>
            ) : (
              cartuchos.map((c) => (
                <tr key={c.id} className="hover:bg-primary/5">
                  <td className="px-4 py-3 text-sm font-semibold">{c.modelo} - {c.cor}</td>
                  <td className="px-4 py-3 text-sm"><code className="bg-surface2 px-2 py-0.5 rounded-md text-xs">{c.modelo}</code></td>
                  <td className="px-4 py-3 text-sm"><span className={`color-dot color-${colorClass(c.cor)}`} />{c.cor}</td>
                  <td className="px-4 py-3 font-mono font-semibold">{c.qty}</td>
                  <td className="px-4 py-3">{statusTag(c.qty, c.alerta)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openRepor(c.id)} className="bg-warning/15 border border-warning/30 text-warning text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-warning/25 transition-colors">↑ Repor</button>
                      <button onClick={() => { if (confirm("Excluir este cartucho?")) deleteCartucho(c.id); }} className="bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-destructive/25 transition-colors">✕</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Cartucho */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowNewModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-7 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-5">+ Novo Cartucho</h3>
            <div className="space-y-3.5">
              <Field label="Modelo">
                <input type="text" value={ncModelo} onChange={(e) => setNcModelo(e.target.value)} placeholder="Ex: 964"
                  className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </Field>
              <Field label="Cor">
                <div className="flex gap-2 flex-wrap">
                  {cores.map((cor) => (
                    <button key={cor} onClick={() => setNcCor(cor)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${corChipClass[cor]} ${ncCor === cor ? "border-primary" : "border-transparent"}`}>
                      {corEmoji[cor]} {cor}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Quantidade Inicial">
                <input type="number" value={ncQty} onChange={(e) => setNcQty(Number(e.target.value))} min={0}
                  className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </Field>
              <Field label="Nível de Alerta (padrão: 5)">
                <input type="number" value={ncAlerta} onChange={(e) => setNcAlerta(Number(e.target.value))} min={1}
                  className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </Field>
            </div>
            <div className="flex gap-2.5 justify-end mt-5">
              <button onClick={() => setShowNewModal(false)} className="border border-border text-foreground font-bold py-2 px-5 rounded-lg hover:border-primary hover:text-primary transition-colors">Cancelar</button>
              <button onClick={handleNewCartucho} className="bg-primary text-primary-foreground font-bold py-2 px-5 rounded-lg hover:opacity-90 transition-opacity">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reposição */}
      {showRepModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowRepModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-7 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-5">↑ Repor Estoque</h3>
            <div className="space-y-3.5">
              <Field label="Cartucho">
                <select value={repCartId} onChange={(e) => setRepCartId(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                  <option value="">Selecione...</option>
                  {cartuchos.map((c) => <option key={c.id} value={c.id}>{c.modelo} - {c.cor}</option>)}
                </select>
              </Field>
              <Field label="Quantidade a Adicionar">
                <input type="number" value={repQty} onChange={(e) => setRepQty(Number(e.target.value))} min={1}
                  className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </Field>
              <Field label="Responsável">
                <input type="text" value={repResp} onChange={(e) => setRepResp(e.target.value)} placeholder="Seu nome"
                  className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </Field>
            </div>
            <div className="flex gap-2.5 justify-end mt-5">
              <button onClick={() => setShowRepModal(false)} className="border border-border text-foreground font-bold py-2 px-5 rounded-lg hover:border-primary hover:text-primary transition-colors">Cancelar</button>
              <button onClick={handleRepor} className="bg-accent text-accent-foreground font-bold py-2 px-5 rounded-lg hover:opacity-90 transition-opacity">↑ Repor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

export default Estoque;
