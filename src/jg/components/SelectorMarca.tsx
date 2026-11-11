import { marcasPorTipo } from '@/jg/lib/marcas';

/** Lista de marcas reconocidas; "Otra marca" deja escribirla a mano. */
export function SelectorMarca({
  value, onChange, tipo, className,
}: { value: string; onChange: (v: string) => void; tipo: 'moto' | 'carro'; className?: string }) {
  const lista = marcasPorTipo(tipo);
  const esOtra = value !== '' && !lista.includes(value);
  const cls = className ?? 'select-field';
  return (
    <div className="space-y-2">
      <select
        value={esOtra ? '__otra' : value}
        onChange={(e) => onChange(e.target.value === '__otra' ? ' ' : e.target.value)}
        required
        className={cls}
      >
        <option value="">Elige una marca</option>
        {lista.map((m) => (<option key={m} value={m}>{m}</option>))}
        <option value="__otra">Otra marca...</option>
      </select>
      {esOtra && (
        <input
          value={value.trimStart()}
          onChange={(e) => onChange(e.target.value)}
          maxLength={60}
          placeholder="Escribe la marca"
          className={cls}
        />
      )}
    </div>
  );
}
