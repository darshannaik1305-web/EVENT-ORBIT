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
    <div className={`flex flex-col gap-5 w-full ${className}`}>
      <div className="flex flex-col items-center text-center gap-2 select-none">
        <Logo size="md" variant="primary" />
        {title && <h2 className="text-2xl font-headings font-extrabold tracking-tight text-[#202020] mt-2">{title}</h2>}
        {description && <p className="text-xs text-[#666666] max-w-sm leading-relaxed">{description}</p>}
      </div>
      <div className="mt-1">{children}</div>
      {footer && <div className="text-center text-xs text-[#666666] mt-2">{footer}</div>}
    </div>
  )
}
