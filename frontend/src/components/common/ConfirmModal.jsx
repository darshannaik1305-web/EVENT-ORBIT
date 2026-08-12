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
}) {
  if (!isOpen) return null

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30',
    warning: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20',
    primary: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30',
  }

  const iconMap = {
    danger: '🗑️',
    warning: '⚠️',
    primary: '❓',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 shadow-2xl animate-scaleUp">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-2xl">
            {iconMap[confirmVariant] || '🗑️'}
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Please review before confirming</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 bg-slate-950/60 border border-white/5 p-4 rounded-2xl leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${variantStyles[confirmVariant] || variantStyles.danger}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
