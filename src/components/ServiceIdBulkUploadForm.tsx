'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { bulkUploadServiceIds, getServiceIdTemplateContent } from '@/src/app/actions'
import { toast } from 'sonner'

interface ServiceIdBulkUploadFormProps {
  teamId: string
  teamApplications: string[]
}

export function ServiceIdBulkUploadForm({ teamId, teamApplications }: ServiceIdBulkUploadFormProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const templateContent = await getServiceIdTemplateContent(teamId)
      const blob = new Blob([templateContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'service-id-bulk-upload-template.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast.error('Failed to download template')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      await bulkUploadServiceIds(teamId, file, (progress) => {
        setUploadProgress(progress)
      })
      toast.success('Service IDs uploaded successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to upload service IDs')
    } finally {
      setIsUploading(false)
      setFile(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Service IDs</CardTitle>
        <CardDescription>
          Upload multiple service IDs using a CSV file. Make sure to follow the template format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={isUploading}
            >
              Download Template
            </Button>
            <Button type="submit" disabled={!file || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 