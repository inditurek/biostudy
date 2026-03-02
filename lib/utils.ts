// cn: combina clases Tailwind filtrando valores falsy (undefined, false, null, '')
// Útil para construir className condicionalmente sin instalar clsx
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
