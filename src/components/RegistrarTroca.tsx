import { useState } from "react";
import { useData } from "@/hooks/useData";

const RegistrarTroca = () => {
  const { cartuchos, impressoras, registrarTroca } = useData();
  const [data, setData] = useState(new Date().toISOString().slice(0, 16));
  const [impressoraId, setImpressoraId] = useState("");
  const [cartuchoId, setCartuchoId] = useState("");
  const [qty, setQty] = useState(1);
  const [responsavel, setResponsavel] = useState("");
  const [obs, setObs] = useState("");

  const handleSubmit = async () => {
    if (!impressoraId || !cartuchoId) return;
    await registrarTroca({
      data,
      impressora_id: impressoraId,
      cartucho_id: cartuchoId,
      qty,
      responsavel,
      obs,
    });
    setQty(1);
    setObs("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Registrar Troca</h1>
      <p className="text-sm text-muted-foreground mb-6">Informe quando um cartucho for trocado em uma impressora</p>

      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Field label="Data e Hora">
            <input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)}
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors" />
          </Field>
          <Field label="Impressora">
            <select value={impressoraId} onChange={(e) => setImpressoraId(e.target.value)}
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors">
              <option value="">Selecione...</option>
              {impressoras.map((i) => <option key={i.id} value={i.id}>{i.nome} — {i.local}</option>)}
            </select>
          </Field>
          <Field label="Responsável">
            <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Seu nome"
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors" />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Field label="Cartucho / Toner">
            <select value={cartuchoId} onChange={(e) => setCartuchoId(e.target.value)}
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors">
              <option value="">Selecione...</option>
              {cartuchos.map((c) => <option key={c.id} value={c.id}>{c.modelo} - {c.cor} ({c.qty} un.)</option>)}
            </select>
          </Field>
          <Field label="Quantidade Trocada">
            <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} min={1}
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors" />
          </Field>
        </div>
        <Field label="Observação (opcional)">
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2}
            placeholder="Ex: Troca por baixa qualidade de impressão"
            className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors mb-4" />
        </Field>
        <button onClick={handleSubmit}
          className="bg-primary text-primary-foreground font-bold py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity">
          ✓ Registrar Troca
        </button>
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

export default RegistrarTroca;
