'use client'
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { getAmexCertTemplateContent, getNonAmexCertTemplateContent } from "../app/actions"

interface DownloadTemplateButtonProps {
  teamId: string;
}

export function DownloadTemplateButton({ teamId }: DownloadTemplateButtonProps) {
  const handleDownloadAmexTemplate = async () => {
    const content = await getAmexCertTemplateContent(teamId);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'amex-certificate-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadNonAmexTemplate = async () => {
    const content = await getNonAmexCertTemplateContent(teamId);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'non-amex-certificate-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleDownloadAmexTemplate}
      >
        <Download className="mr-2 h-4 w-4" />
        AMEX Template
      </Button>
      <Button 
        variant="outline" 
        onClick={handleDownloadNonAmexTemplate}
      >
        <Download className="mr-2 h-4 w-4" />
        Non-AMEX Template
      </Button>
    </div>
  )
}