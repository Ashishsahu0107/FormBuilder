import { QRCodeSVG } from 'qrcode.react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface ShareDialogProps {
  formSlug: string
  isOpen: boolean
  onClose: () => void
}

export function ShareDialog({ formSlug, isOpen, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const publicUrl = `${window.location.origin}/forms/${formSlug}`
  const embedCode = `<iframe src="${publicUrl}?embed=true" width="100%" height="800px" frameborder="0" style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></iframe>`
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="link" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Link & QR</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="py-6 space-y-6 flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <QRCodeSVG value={publicUrl} size={200} level="H" includeMargin={true} />
            </div>
            <div className="w-full space-y-2">
              <label className="text-sm font-medium text-gray-700">Public Link</label>
              <div className="flex gap-2">
                <Input value={publicUrl} readOnly className="bg-gray-50" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(publicUrl)} title="Copy Link">
                  <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : ''}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={() => window.open(publicUrl, '_blank')} title="Open Link">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              {copied && <p className="text-xs text-green-600 text-center mt-1">Copied to clipboard!</p>}
            </div>
          </TabsContent>
          
          <TabsContent value="embed" className="py-6 space-y-4">
            <p className="text-sm text-gray-500">Copy the code below to embed this form directly on your website.</p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all border border-gray-800 shadow-inner">
              {embedCode}
            </div>
            <Button className="w-full gap-2 mt-4" onClick={() => handleCopy(embedCode)}>
              <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy HTML'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}