import React from 'react'

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onClose,
  onCancel,
}) {
  if (!isOpen) return null

  const handleClose = () => {
    if (typeof onClose === 'function') onClose()
    else if (typeof onCancel === 'function') onCancel()
  }

  const variantStyles = {
    danger: 'bg-[#B42318] hover:bg-[#912018] text-white shadow-sm shadow-[#B42318]/25',
    warning: 'bg-[#F28D1E] hover:bg-[#D97706] text-white shadow-sm shadow-[#F28D1E]/25',
    primary: 'bg-[#202020] hover:bg-[#333333] text-white shadow-sm',
  }

  const iconMap = {
    danger: '🗑️',
    warning: '⚠️',
    primary: '❓',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="academic-card max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-[#E5E1DC] animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#B42318]/10 border border-[#B42318]/20 flex items-center justify-center text-2xl">
            {iconMap[confirmVariant] || '🗑️'}
          </div>
          <div>
            <h3 className="text-lg font-headings font-extrabold text-[#202020]">{title}</h3>
            <p className="text-xs text-[#666666] mt-0.5">Please review before confirming</p>
          </div>
        </div>

        <p className="text-xs text-[#202020] bg-[#F7F6F3] border border-[#E5E1DC] p-4 rounded-xl leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 bg-[#F7F6F3] hover:bg-[#E5E1DC] text-[#202020] text-xs font-bold rounded-xl border border-[#E5E1DC] transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (typeof onConfirm === 'function') {
                await onConfirm()
              }
              handleClose()
            }}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${variantStyles[confirmVariant] || variantStyles.danger}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
