import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type Cartucho = Tables<"cartuchos">;
type Impressora = Tables<"impressoras">;
type Historico = Tables<"historico">;

interface DataContextType {
  cartuchos: Cartucho[];
  impressoras: Impressora[];
  historico: Historico[];
  loading: boolean;
  refresh: () => Promise<void>;
  addCartucho: (c: { modelo: string; cor: string; qty: number; alerta: number }) => Promise<void>;
  deleteCartucho: (id: string) => Promise<void>;
  addImpressora: (i: { nome: string; modelo: string; local: string; cartuchos: string }) => Promise<void>;
  deleteImpressora: (id: string) => Promise<void>;
  registrarTroca: (data: { data: string; impressora_id: string; cartucho_id: string; qty: number; responsavel: string; obs: string }) => Promise<void>;
  reporEstoque: (cartucho_id: string, qty: number, responsavel: string) => Promise<void>;
  deleteHistorico: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType>({} as DataContextType);
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cartuchos, setCartuchos] = useState<Cartucho[]>([]);
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [c, i, h] = await Promise.all([
      supabase.from("cartuchos").select("*").order("modelo"),
      supabase.from("impressoras").select("*").order("nome"),
      supabase.from("historico").select("*").order("data", { ascending: false }),
    ]);
    if (c.data) setCartuchos(c.data);
    if (i.data) setImpressoras(i.data);
    if (h.data) setHistorico(h.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const addCartucho = async (c: { modelo: string; cor: string; qty: number; alerta: number }) => {
    const { error } = await supabase.from("cartuchos").insert(c);
    if (error) { toast.error(error.message); return; }
    toast.success(`Cartucho ${c.modelo} - ${c.cor} cadastrado!`);
    refresh();
  };

  const deleteCartucho = async (id: string) => {
    const { error } = await supabase.from("cartuchos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Cartucho removido");
    refresh();
  };

  const addImpressora = async (i: { nome: string; modelo: string; local: string; cartuchos: string }) => {
    const { error } = await supabase.from("impressoras").insert(i);
    if (error) { toast.error(error.message); return; }
    toast.success(`Impressora "${i.nome}" cadastrada!`);
    refresh();
  };

  const deleteImpressora = async (id: string) => {
    const { error } = await supabase.from("impressoras").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Impressora removida");
    refresh();
  };

  const registrarTroca = async (data: { data: string; impressora_id: string; cartucho_id: string; qty: number; responsavel: string; obs: string }) => {
    const cart = cartuchos.find((c) => c.id === data.cartucho_id);
    if (!cart) return;
    if (cart.qty < data.qty) {
      toast.error(`Estoque insuficiente (${cart.qty} disponível)`);
      return;
    }

    const { error: hError } = await supabase.from("historico").insert({
      data: data.data || new Date().toISOString(),
      impressora_id: data.impressora_id,
      cartucho_id: data.cartucho_id,
      qty: data.qty,
      responsavel: data.responsavel,
      obs: data.obs,
      tipo: "troca",
      user_id: user?.id,
    });
    if (hError) { toast.error(hError.message); return; }

    const { error: uError } = await supabase
      .from("cartuchos")
      .update({ qty: cart.qty - data.qty })
      .eq("id", data.cartucho_id);
    if (uError) { toast.error(uError.message); return; }

    toast.success(`Troca registrada! Restam ${cart.qty - data.qty} un.`);
    if (cart.qty - data.qty <= cart.alerta) {
      setTimeout(() => toast.warning(`⚠️ ${cart.modelo} - ${cart.cor} com estoque baixo!`), 500);
    }
    refresh();
  };

  const reporEstoque = async (cartucho_id: string, qty: number, responsavel: string) => {
    const cart = cartuchos.find((c) => c.id === cartucho_id);
    if (!cart) return;

    const { error: hError } = await supabase.from("historico").insert({
      cartucho_id,
      qty,
      responsavel,
      obs: "Reposição de estoque",
      tipo: "reposicao",
      user_id: user?.id,
    });
    if (hError) { toast.error(hError.message); return; }

    const { error: uError } = await supabase
      .from("cartuchos")
      .update({ qty: cart.qty + qty })
      .eq("id", cartucho_id);
    if (uError) { toast.error(uError.message); return; }

    toast.success(`Estoque reposto! ${cart.modelo} - ${cart.cor}: ${cart.qty + qty} un.`);
    refresh();
  };

  const deleteHistorico = async (id: string) => {
    const { error } = await supabase.from("historico").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Registro removido");
    refresh();
  };

  return (
    <DataContext.Provider
      value={{
        cartuchos, impressoras, historico, loading, refresh,
        addCartucho, deleteCartucho, addImpressora, deleteImpressora,
        registrarTroca, reporEstoque, deleteHistorico,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
