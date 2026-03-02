import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('mb-6 flex items-center gap-1.5 text-sm', className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-brand-200 select-none">›</span>
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-medium text-brand-400 transition-colors hover:text-brand-500"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(
                isLast
                  ? 'font-semibold text-brand-900'
                  : 'font-medium text-brand-400'
              )}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
