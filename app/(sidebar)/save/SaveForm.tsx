"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileJson, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { SaveData } from "@/app/(dashboard)/actions/saveData"

export function SaveForm() {
  const [isSaving, setIsSaving] = useState(false)
  const [fileName, setFileName] = useState("project-backup")
	const router = useRouter()

	const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration') 
    }
  }

  async function handleSave() {
  try {
    setIsSaving(true)
    
    // Get the JSON data from server
    const jsonData = await SaveData()
    
    // Create blob and download
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    
    // Use filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    a.download = `${fileName || 'project-backup'}_${timestamp}.json`
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
  
    handleClose()
  } catch (error) {
    console.error('Save failed:', error)
    // Optionally add toast notification here
  } finally {
    setIsSaving(false)
  }
}

  return (
		<Card className="rounded-2xl shadow-sm">
			<CardContent className="space-y-6">
				<div className="flex items-start gap-3">
					<div className="rounded-xl bg-muted p-3">
						<FileJson className="size-6" />
					</div>

					<p className="text-sm text-muted-foreground">
						Download a JSON file to store this configuration. You can re-upload it at a later date
						to restore everything exactly as it is.
					</p>
				</div>
				
				<div className="space-y-2">
					<Label htmlFor="filename">File name <span className="font-semibold -ml-1">(optional)</span></Label>
					
					<div className="flex items-center gap-2">
						<Input id="filename" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="project-backup"/>
						<span className="text-sm text-muted-foreground">.json</span>
					</div>

					<p className="text-xs text-muted-foreground"> The file will be saved to your default download location.</p>
				</div>

				<div className="flex justify-end gap-2">
					<Button type="button" className="w-18" variant="outline" onClick={handleClose} disabled={isSaving}>Close</Button>
					<Button onClick={handleSave} disabled={isSaving} className="gap-2 w-34">{isSaving ? (<><Loader2 className="size-4 animate-spin" /> Preparing file…</>) : (<><Download className="size-4" />Save JSON</>)}</Button>
				</div>
			</CardContent>
		</Card>
  )
}
