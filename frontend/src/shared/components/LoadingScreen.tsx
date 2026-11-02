import { LoaderCircle } from "lucide-react";

export function LoadingScreen() {
  // Todo: hacer un skeleton más parecido a las pantallas reales cuando estén
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f2] text-[#34463e]">
      <p className="flex items-center gap-2 text-sm" role="status">
        <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
        Cargando…
      </p>
    </main>
  );
}
