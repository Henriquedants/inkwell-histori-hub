import { useData } from "@/hooks/useData";

const colorClass = (cor: string) => {
  const map: Record<string, string> = { Preto: "preto", Azul: "azul", Magenta: "magenta", Amarelo: "amarelo" };
  return map[cor] || "preto";
};

const statusClass = (qty: number, alerta: number) => {
  if (qty <= 0) return "critical";
  if (qty <= alerta) return "warn";
  return "ok";
};

const formatDt = (dt: string) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const Dashboard = () => {
  const { cartuchos, impressoras, historico } = useData();

  const total = cartuchos.reduce((a, c) => a + c.qty, 0);
  const criticos = cartuchos.filter((c) => c.qty <= 0).length;
  const baixos = cartuchos.filter((c) => c.qty > 0 && c.qty <= c.alerta).length;
  const oks = cartuchos.filter((c) => c.qty > c.alerta).length;
  const alertas = cartuchos.filter((c) => c.qty <= c.alerta);
  const recentes = historico.slice(0, 5);
  const maxQty = Math.max(...cartuchos.map((c) => c.qty), 20);

  const getImpressora = (id: string | null) => impressoras.find((i) => i.id === id);
  const getCartucho = (id: string | null) => cartuchos.find((c) => c.id === id);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {cartuchos.length} tipos de cartucho · {impressoras.length} impressoras · {historico.length} trocas registradas
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-7">
        <SummaryCard label="Total em Estoque" value={total} sub="unidades" />
        <SummaryCard label="Cartuchos OK" value={oks} sub="acima do mínimo" variant="ok" />
        <SummaryCard label="Estoque Baixo" value={baixos} sub="≤ nível de alerta" variant="warn" />
        <SummaryCard label="Zerados" value={criticos} sub="sem estoque" variant={criticos > 0 ? "alert" : undefined} />
        <SummaryCard label="Impressoras" value={impressoras.length} sub="cadastradas" />
        <SummaryCard label="Trocas (Total)" value={historico.length} sub="registradas" />
      </div>

      {/* Alerts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">⚠️ Alertas de Estoque Baixo</h3>
          {alertas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-3xl mb-2">✅</div>
              Nenhum alerta no momento
            </div>
          ) : (
            <div className="space-y-2">
              {alertas.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-3.5 py-2.5 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <span className="text-lg">{c.qty <= 0 ? "🔴" : "🟡"}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      <span className={`color-dot color-${colorClass(c.cor)}`} />
                      {c.modelo} - {c.cor}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.qty <= 0 ? "Estoque zerado!" : "Estoque abaixo do mínimo"}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-destructive/20 text-destructive">
                    {c.qty} un.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">🕓 Trocas Recentes</h3>
          {recentes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-3xl mb-2">📋</div>
              Nenhuma troca registrada
            </div>
          ) : (
            <div className="space-y-0">
              {recentes.map((h) => {
                const imp = getImpressora(h.impressora_id);
                const cart = getCartucho(h.cartucho_id);
                return (
                  <div key={h.id} className="flex items-center gap-2.5 py-2 border-b border-border last:border-b-0 text-sm">
                    <span className="font-mono text-xs text-muted-foreground min-w-[80px]">{formatDt(h.data)}</span>
                    <span className="font-semibold">{imp?.nome || "—"}</span>
                    <span className="text-muted-foreground flex-1">{cart ? `${cart.modelo} - ${cart.cor}` : "—"} ×{h.qty}</span>
                    <span className="text-xs text-muted-foreground">{h.responsavel || "—"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Stock Bars */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">📦 Nível de Estoque por Cartucho</h3>
        <div className="space-y-3">
          {cartuchos.map((c) => {
            const pct = Math.min((c.qty / maxQty) * 100, 100);
            const sc = statusClass(c.qty, c.alerta);
            return (
              <div key={c.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold">
                    <span className={`color-dot color-${colorClass(c.cor)}`} />
                    {c.modelo} - {c.cor}
                  </span>
                  <span className={`font-mono text-sm font-medium ${
                    sc === "critical" ? "text-destructive" : sc === "warn" ? "text-warning" : "text-accent"
                  }`}>
                    {c.qty} un.
                  </span>
                </div>
                <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sc === "critical" ? "bg-destructive" : sc === "warn" ? "bg-warning" : "bg-accent"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, sub, variant }: {
  label: string; value: number; sub: string; variant?: "ok" | "warn" | "alert";
}) => (
  <div className={`bg-surface border rounded-xl p-4 flex flex-col gap-1.5 ${
    variant === "alert" ? "border-destructive/40 bg-destructive/5" : "border-border"
  }`}>
    <span className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className={`text-2xl font-bold font-mono ${
      variant === "ok" ? "text-accent" : variant === "warn" ? "text-warning" : variant === "alert" ? "text-destructive" : ""
    }`}>
      {value}
    </span>
    <span className="text-xs text-muted-foreground">{sub}</span>
  </div>
);

export default Dashboard;
