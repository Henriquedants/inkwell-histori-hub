import { useState } from "react";
import { useData } from "@/hooks/useData";

const colorClass = (cor: string) => {
  const map: Record<string, string> = { Preto: "preto", Azul: "azul", Magenta: "magenta", Amarelo: "amarelo" };
  return map[cor] || "preto";
};

const formatDt = (dt: string) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const Historico = () => {
  const { cartuchos, impressoras, historico, deleteHistorico } = useData();
  const [filtroImp, setFiltroImp] = useState("");
  const [filtroCart, setFiltroCart] = useState("");
  const [filtroDe, setFiltroDe] = useState("");
  const [filtroAte, setFiltroAte] = useState("");

  const getImpressora = (id: string | null) => impressoras.find((i) => i.id === id);
  const getCartucho = (id: string | null) => cartuchos.find((c) => c.id === id);

  let dados = [...historico];
  if (filtroImp) dados = dados.filter((h) => h.impressora_id === filtroImp);
  if (filtroCart) dados = dados.filter((h) => h.cartucho_id === filtroCart);
  if (filtroDe) dados = dados.filter((h) => h.data >= filtroDe);
  if (filtroAte) dados = dados.filter((h) => h.data <= filtroAte + "T23:59:59");

  const limpar = () => { setFiltroImp(""); setFiltroCart(""); setFiltroDe(""); setFiltroAte(""); };

  const exportCSV = () => {
    const headers = ["Data", "Impressora", "Local", "Cartucho", "Quantidade", "Responsavel", "Observacao"];
    const rows = historico.map((h) => {
      const imp = getImpressora(h.impressora_id);
      const cart = getCartucho(h.cartucho_id);
      return [formatDt(h.data), imp?.nome || "", imp?.local || "", cart ? `${cart.modelo} - ${cart.cor}` : "", h.qty, h.responsavel || "", h.obs || ""];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    download("historico_cartuchos.csv", csv, "text/csv");
  };

  const exportJSON = () => {
    download("historico_cartuchos.json", JSON.stringify(historico, null, 2), "application/json");
  };

  const download = (name: string, content: string, type: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Histórico de Trocas</h1>
      <p className="text-sm text-muted-foreground mb-6">Consulte e filtre todas as trocas registradas</p>

      <div className="flex gap-2.5 flex-wrap items-end mb-4">
        <Field label="Impressora">
          <select value={filtroImp} onChange={(e) => setFiltroImp(e.target.value)}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary min-w-[160px]">
            <option value="">Todas</option>
            {impressoras.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
        </Field>
        <Field label="Cartucho">
          <select value={filtroCart} onChange={(e) => setFiltroCart(e.target.value)}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary min-w-[160px]">
            <option value="">Todos</option>
            {cartuchos.map((c) => <option key={c.id} value={c.id}>{c.modelo} - {c.cor}</option>)}
          </select>
        </Field>
        <Field label="De">
          <input type="date" value={filtroDe} onChange={(e) => setFiltroDe(e.target.value)}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
        </Field>
        <Field label="Até">
          <input type="date" value={filtroAte} onChange={(e) => setFiltroAte(e.target.value)}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
        </Field>
        <button onClick={() => {}} className="border border-border text-foreground font-bold py-2 px-4 rounded-lg hover:border-primary hover:text-primary transition-colors text-sm">🔍 Filtrar</button>
        <button onClick={limpar} className="border border-border text-foreground font-bold py-2 px-4 rounded-lg hover:border-primary hover:text-primary transition-colors text-sm">✕ Limpar</button>
      </div>

      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <span className="text-xs text-muted-foreground font-semibold">Exportar:</span>
        <button onClick={exportCSV} className="border border-border text-foreground font-bold py-1.5 px-3.5 rounded-lg hover:border-primary hover:text-primary transition-colors text-xs">📄 CSV</button>
        <button onClick={exportJSON} className="border border-border text-foreground font-bold py-1.5 px-3.5 rounded-lg hover:border-primary hover:text-primary transition-colors text-xs">{"{ }"} JSON</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr>
              {["Data/Hora", "Impressora", "Local", "Cartucho", "Qtd.", "Responsável", "Observação", ""].map((h) => (
                <th key={h} className="bg-surface2 px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">
                <div className="text-3xl mb-2">📋</div>Nenhum registro encontrado
              </td></tr>
            ) : (
              dados.map((h) => {
                const imp = getImpressora(h.impressora_id);
                const cart = getCartucho(h.cartucho_id);
                return (
                  <tr key={h.id} className="hover:bg-primary/5">
                    <td className="px-4 py-3 font-mono text-xs">{formatDt(h.data)}</td>
                    <td className="px-4 py-3 text-sm">{imp?.nome || "—"}</td>
                    <td className="px-4 py-3"><span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary">{imp?.local || "—"}</span></td>
                    <td className="px-4 py-3 text-sm">
                      {cart && <span className={`color-dot color-${colorClass(cart.cor)}`} />}
                      {cart ? `${cart.modelo} - ${cart.cor}` : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold">{h.qty}</td>
                    <td className="px-4 py-3 text-sm">{h.responsavel || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{h.obs || "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { if (confirm("Excluir este registro?")) deleteHistorico(h.id); }}
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

export default Historico;
