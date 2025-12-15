"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileJson, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { LoadData } from "@/app/(dashboard)/actions/loadData"

export function LoadForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/json") {
      setSelectedFile(file)
    } else {
      alert("Please select a valid JSON file")
      e.target.value = ""
    }
  }

  async function handleLoad() {
    if (!selectedFile) {
      alert("Please select a file first")
      return
    }

    try {
      setIsLoading(true)

      // Read the file
      const fileContent = await selectedFile.text()
      const jsonData = JSON.parse(fileContent)

      // Send to server action
      await LoadData(jsonData)

    

      // Close modal on success
      handleClose()
    } catch (error) {
      console.error('Load failed:', error)
      alert("Failed to load file. Please check the file format.")
    } finally {
      setIsLoading(false)
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
            Upload a previously saved JSON file to restore your configuration. This will replace all current data with the contents of the file.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fileupload">Select JSON file</Label>
          
          <Input 
            id="fileupload" 
            type="file" 
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              Selected: {selectedFile.name}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Only JSON files from previous saves are accepted.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            className="w-18" 
            variant="outline" 
            onClick={handleClose} 
            disabled={isLoading}
          >
            Close
          </Button>
          <Button 
            onClick={handleLoad} 
            disabled={isLoading || !selectedFile} 
            className="gap-2 w-34"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> 
                Loading data…
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Load JSON
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}