import React from 'react'
import Logo from '@/components/common/Logo'

export default function AuthFormContainer({
  title,
  description,
  children,
  footer,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-6 w-full ${className}`}>
      <div className="flex flex-col items-center text-center gap-2 select-none">
        <Logo size="md" variant="primary" />
        {title && <h2 className="text-2xl font-bold tracking-tight text-white mt-4">{title}</h2>}
        {description && <p className="text-sm text-slate-400 max-w-sm">{description}</p>}
      </div>
      <div className="mt-2">{children}</div>
      {footer && <div className="text-center text-xs text-slate-400 mt-2">{footer}</div>}
    </div>
  )
}
