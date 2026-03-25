
-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Cartuchos (ink cartridges)
CREATE TABLE public.cartuchos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modelo TEXT NOT NULL,
  cor TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  alerta INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cartuchos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view cartuchos"
  ON public.cartuchos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert cartuchos"
  ON public.cartuchos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update cartuchos"
  ON public.cartuchos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete cartuchos"
  ON public.cartuchos FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_cartuchos_updated_at
  BEFORE UPDATE ON public.cartuchos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Impressoras (printers)
CREATE TABLE public.impressoras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  modelo TEXT NOT NULL DEFAULT '',
  local TEXT NOT NULL DEFAULT '',
  cartuchos TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.impressoras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view impressoras"
  ON public.impressoras FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert impressoras"
  ON public.impressoras FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update impressoras"
  ON public.impressoras FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete impressoras"
  ON public.impressoras FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_impressoras_updated_at
  BEFORE UPDATE ON public.impressoras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Historico (exchange history)
CREATE TABLE public.historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  impressora_id UUID REFERENCES public.impressoras(id) ON DELETE SET NULL,
  cartucho_id UUID REFERENCES public.cartuchos(id) ON DELETE SET NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  responsavel TEXT NOT NULL DEFAULT '',
  obs TEXT DEFAULT '',
  tipo TEXT NOT NULL DEFAULT 'troca',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view historico"
  ON public.historico FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert historico"
  ON public.historico FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete historico"
  ON public.historico FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_historico_updated_at
  BEFORE UPDATE ON public.historico
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
