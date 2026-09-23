import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Lock, Unlock, ShieldAlert } from 'lucide-react'

interface DeleteFormModalProps {
  form: { id: string; title: string } | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (formId: string) => Promise<void>
}

export function DeleteFormModal({ form, isOpen, onClose, onConfirm }: DeleteFormModalProps) {
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculate matching progress
  const targetText = form?.title || ''
  const isMatch = deleteConfirmText === targetText
  
  let matchPercentage = 0
  if (targetText.length > 0) {
    let matches = 0
    for (let i = 0; i < deleteConfirmText.length; i++) {
      if (deleteConfirmText[i] === targetText[i]) matches++
      else break // Stop counting if there's a mismatch
    }
    matchPercentage = Math.min(100, Math.round((matches / targetText.length) * 100))
  }
  if (isMatch) matchPercentage = 100

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteConfirmText('')
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!form || !isMatch) return
    setIsDeleting(true)
    try {
      await onConfirm(form.id)
    } finally {
      setIsDeleting(false)
      setDeleteConfirmText('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white">
        <DialogTitle className="sr-only">Delete Form</DialogTitle>
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-red-600 to-red-900 px-6 py-8 text-white relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trash2 className="w-48 h-48 rotate-12 transform translate-x-12 -translate-y-12" />
          </div>
          
          <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold relative z-10 tracking-tight">Destroy Form Data</h2>
          <p className="text-red-100 text-sm mt-2 relative z-10 font-medium">
            This action is irreversible and catastrophic.
          </p>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Type <span className="font-mono bg-gray-100 text-red-600 px-1.5 py-0.5 rounded border border-gray-200">{form?.title}</span> to confirm
              </label>
              {isMatch ? (
                <Unlock className="w-4 h-4 text-green-500 animate-in zoom-in duration-300" />
              ) : (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            
            <div className="relative group">
              <Input 
                value={deleteConfirmText} 
                onChange={e => setDeleteConfirmText(e.target.value)} 
                placeholder={form?.title}
                className={`font-mono text-sm h-12 transition-all duration-300 pr-10 ${
                  isMatch 
                    ? 'border-green-500 ring-2 ring-green-500/20 bg-green-50/50' 
                    : deleteConfirmText.length > 0 && matchPercentage < 100 && deleteConfirmText !== targetText.substring(0, deleteConfirmText.length)
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/50 animate-shake'
                      : 'border-gray-300 focus:border-red-500 focus:ring-red-500/20'
                }`}
                autoComplete="off"
              />
              
              {/* Progress Bar inside input border */}
              <div className="absolute bottom-0 left-0 h-1 bg-gray-100 rounded-b-md w-full overflow-hidden opacity-50">
                <div 
                  className={`h-full transition-all duration-300 ${isMatch ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="destructive" 
              className={`w-full h-12 text-white font-bold shadow-lg transition-all duration-300 ${
                isMatch 
                  ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/30' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none hover:bg-gray-200'
              }`}
              disabled={!isMatch || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? 'Deleting Forever...' : isMatch ? 'Yes, Delete Form' : 'Awaiting Confirmation...'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
