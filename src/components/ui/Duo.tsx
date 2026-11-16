import type { ElementType, ReactNode } from 'react';

/**
 * Título com contraste de pesos: a primeira linha (até a quebra) em peso forte,
 * a segunda em peso leve — tratamento tipográfico da apresentação Grifo.
 */
export function Duo({ text, as: Tag = 'h2', className = '', id }: { text?: string; as?: ElementType; className?: string; id?: string }) {
  if (!text) return null;
  const [a, ...rest] = text.split('\n');
  const b = rest.join(' ').trim();
  return (
    <Tag id={id} className={`duo ${className}`}>
      <span className="duo-a">{a}</span>
      {b ? <> <span className="duo-b">{b}</span></> : null}
    </Tag>
  );
}

export function PlaceholderFlag({ children = 'Pendente de validação' }: { children?: ReactNode }) {
  return (
    <span className="placeholder-flag" title="Conteúdo pendente de validação — não aparece em produção">
      <span>{children}</span>
    </span>
  );
}
