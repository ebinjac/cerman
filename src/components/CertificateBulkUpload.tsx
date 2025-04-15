'use client'
import { Button } from "@/components/ui/button"
import { Upload, Download, FileUp, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { bulkUploadCertificates } from "../app/actions"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CertificatePreviewTable } from "./CertificatePreviewTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CertificateBulkUploadProps {
  teamId: string
  teamApplications: string[]
}

interface CertificateRecord {
  commonName: string;
  serialNumber: string;
  environment: string;
  serverName: string;
  keystorePath: string;
  uri: string;
  applicationName: string;
  comment?: string;
  validFrom?: string;
  validTo?: string;
  isAmexCert?: boolean;
}

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

interface ValidationErrors {
  [key: string]: string;
}

export function CertificateBulkUpload({ 
  teamId,
  teamApplications 
}: CertificateBulkUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors[]>([]);
  const [activeTab, setActiveTab] = useState<"amex" | "non-amex">("amex");
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateCertificate = (record: CertificateRecord, teamApplications: string[]): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    // Common validations
    if (!record.commonName) errors.commonName = "Common name is required";
    if (!record.serialNumber) errors.serialNumber = "Serial number is required";
    if (!record.applicationName) errors.applicationName = "Application name is required";
    
    // Validate application exists in team
    if (!teamApplications.includes(record.applicationName)) {
      errors.applicationName = "Application not found in team";
    }

    // Validate dates if present
    if (record.validFrom && !isValidDate(record.validFrom)) {
      errors.validFrom = "Invalid date format";
    }
    if (record.validTo && !isValidDate(record.validTo)) {
      errors.validTo = "Invalid date format";
    }

    return errors;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const records = content.split('\n')
        .slice(1) // Skip header
        .filter(line => line.trim() !== '')
        .map(line => {
          const values = line.split(',');
          const record: CertificateRecord = {
            isAmexCert: activeTab === "amex",
            commonName: values[0],
            serialNumber: values[1],
            environment: values[2],
            ...(activeTab === "non-amex" ? {
              validFrom: values[3] || undefined,
              validTo: values[4] || undefined,
              serverName: values[5],
              keystorePath: values[6],
              uri: values[7],
              applicationName: values[8],
              comment: values[9]
            } : {
              serverName: values[3],
              keystorePath: values[4],
              uri: values[5],
              applicationName: values[6],
              comment: values[7]
            })
          };
          return record;
        });

      // Validate each record
      const errors = records.map((record, index) => validateCertificate(record, teamApplications));
      setValidationErrors(errors);
      setPreviewData(records);
      
    } catch (error) {
      console.error('Error parsing file:', error);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const results = await bulkUploadCertificates(teamId, new File([JSON.stringify(previewData)], 'certificates.json', { type: 'application/json' }));
      setUploadResults(results);
      setUploadProgress(100);
      router.refresh();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setPreviewData([]);
    setValidationErrors([]);
    setUploadResults([]);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/certificates/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setValidationErrors(data.errors || []);
      setUploadResults(data.results || []);
      setPreviewData(data.preview || []);
    } catch (error) {
      console.error('Error uploading file:', error);
      setValidationErrors([{ error: 'Failed to upload file' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="amex" className="w-full" onValueChange={(value) => {
      setActiveTab(value as "amex" | "non-amex");
      handleRemoveFile(); // Clear any existing data when switching tabs
    }}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="amex">AMEX Certificates</TabsTrigger>
        <TabsTrigger value="non-amex">Non-AMEX Certificates</TabsTrigger>
      </TabsList>
      <TabsContent value="amex">
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Download Template</CardTitle>
              <CardDescription>
                Download the AMEX certificate template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => {
                  const template = [
                    'commonName,serialNumber,environment,serverName,keystorePath,uri,applicationName,comment',
                    'example.com,123456789,E1,server1,/path/to/keystore,https://example.com,Example App,Optional comment'
                  ].join('\n');
                  downloadCsv(template, 'amex-certificate-template.csv');
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Certificates</CardTitle>
              <CardDescription>
                Drag and drop your CSV file or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-muted",
                  isUploading && "pointer-events-none opacity-50"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file && file.name.endsWith('.csv')) {
                    const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleFileChange(event);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileUp className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? "Uploading..." : "Click to browse or drag and drop your CSV file here"}
                  </p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
                disabled={isUploading}
              />
            </CardContent>
          </Card>
        </div>

        {previewData.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    Review your certificates before uploading
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove File
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CertificatePreviewTable 
                data={previewData}
                validationErrors={validationErrors}
                teamApplications={teamApplications}
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear & Re-upload
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={validationErrors.length > 0 || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Confirm Upload'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isUploading && (
          <Card className="mt-6">
            <CardContent className="py-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading certificates...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {uploadResults.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>
                Status of your certificate uploads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploadResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "p-4 rounded-lg",
                      result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}
                  >
                    {result.success ? (
                      <p>Successfully uploaded {result.data.commonName}</p>
                    ) : (
                      <p>Failed to upload {result.data.commonName}: {result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
      <TabsContent value="non-amex">
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Download Template</CardTitle>
              <CardDescription>
                Download the non-AMEX certificate template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => {
                  const template = [
                    'commonName,serialNumber,environment,validFrom,validTo,serverName,keystorePath,uri,applicationName,comment',
                    'example2.com,987654321,E2,2023-01-01,2024-01-01,server2,/another/path,https://example2.com,APP456,Another comment'
                  ].join('\n');
                  downloadCsv(template, 'non-amex-certificate-template.csv');
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Certificates</CardTitle>
              <CardDescription>
                Drag and drop your CSV file or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-muted",
                  isUploading && "pointer-events-none opacity-50"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file && file.name.endsWith('.csv')) {
                    const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleFileChange(event);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileUp className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? "Uploading..." : "Click to browse or drag and drop your CSV file here"}
                  </p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
                disabled={isUploading}
              />
            </CardContent>
          </Card>
        </div>

        {previewData.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Review your certificates before uploading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CertificatePreviewTable 
                data={previewData}
                validationErrors={validationErrors}
                teamApplications={teamApplications}
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpload}
                  disabled={validationErrors.length > 0 || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Confirm Upload'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isUploading && (
          <Card className="mt-6">
            <CardContent className="py-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading certificates...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {uploadResults.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>
                Status of your certificate uploads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploadResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "p-4 rounded-lg",
                      result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}
                  >
                    {result.success ? (
                      <p>Successfully uploaded {result.data.commonName}</p>
                    ) : (
                      <p>Failed to upload {result.data.commonName}: {result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}