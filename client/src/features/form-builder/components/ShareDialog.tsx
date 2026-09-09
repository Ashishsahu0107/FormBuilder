import { QRCodeSVG } from 'qrcode.react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface ShareDialogProps {
  formSlug: string
  isOpen: boolean
  onClose: () => void
}

export function ShareDialog({ formSlug, isOpen, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  
  // We assume the frontend URL is running on window.location.origin
  const publicUrl = `${window.location.origin}/forms/${formSlug}`
  
  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6 flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <QRCodeSVG value={publicUrl} size={200} level="H" includeMargin={true} />
          </div>
          
          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-gray-700">Public Link</label>
            <div className="flex gap-2">
              <Input value={publicUrl} readOnly className="bg-gray-50" />
              <Button variant="outline" size="icon" onClick={handleCopy} title="Copy Link">
                <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => window.open(publicUrl, '_blank')} title="Open Link">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            {copied && <p className="text-xs text-green-600 text-center mt-1">Copied to clipboard!</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}