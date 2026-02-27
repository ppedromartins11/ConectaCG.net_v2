// components/ProviderLogo.tsx
const providerColors: Record<string, { bg: string; text: string }> = {
  Claro: { bg: '#E02020', text: 'white' },
  TechNet: { bg: '#2563EB', text: 'white' },
  Vivo: { bg: '#6D28D9', text: 'white' },
}

export function ProviderLogo({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors = providerColors[name] || { bg: '#64748B', text: 'white' }
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-base' }

  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold flex-shrink-0`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}
