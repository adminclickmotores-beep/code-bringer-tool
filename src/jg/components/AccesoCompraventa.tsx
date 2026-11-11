import { Store } from 'lucide-react';

export function AccesoCompraventa({ onIr }: { onIr: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-jg-red/15 text-jg-red">
        <Store className="h-7 w-7" />
      </div>
      <h1 className="font-display text-xl font-bold text-jg-text-dark">Esta área es solo para administración</h1>
      <p className="mt-2 text-sm text-gray-400">
        Tu cuenta es de Compra-Venta. Administra tus vehículos y comparte tu catálogo desde tu panel.
      </p>
      <button onClick={onIr} className="btn-primary mt-5">
        Ir a mi panel de Compra-Venta
      </button>
    </div>
  );
}
