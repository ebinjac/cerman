'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

import { Certificate } from '@/db/schema'
import { updateCertificate } from '../app/actions'

interface EditCertificateModalProps {
  certificate: Certificate
  teamId: string
  teamApplications: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// Move schema definition inside the component
export function EditCertificateModal({
  certificate,
  teamId,
  teamApplications,
  open,
  onOpenChange,
  onSuccess
}: EditCertificateModalProps) {
  // Dynamic schema based on certificate type
  const formSchema = z.object({
    serverName: z.string().min(2, "Server name required"),
    keystorePath: z.string().min(1, "Keystore path required"),
    uri: z.string().url("Valid URL required"),
    applicationId: z.string().min(1, "Application selection required"),
    comment: z.string().optional(),
    ...(!certificate.isAmexCert && {
      validFrom: z.date().optional(),
      validTo: z.date().optional(),
      environment: z.enum(['E1', 'E2', 'E3']).optional()
    })
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serverName: certificate.serverName ?? '',
      keystorePath: certificate.keystorePath ?? '',
      uri: certificate.uri ?? '',
      applicationId: certificate.applicationId,
      comment: certificate.comment ?? '', // Handle null case
      ...(!certificate.isAmexCert && {
        validFrom: certificate.validFrom ? new Date(certificate.validFrom) : undefined,
        validTo: certificate.validTo ? new Date(certificate.validTo) : undefined,
        environment: certificate.environment as 'E1' | 'E2' | 'E3'
      })
    }
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const updateData = {
        serverName: values.serverName,
        keystorePath: values.keystorePath,
        uri: values.uri,
        applicationId: values.applicationId,
        comment: values.comment,
        ...(!certificate.isAmexCert && {
          environment: values.environment as 'E1' | 'E2' | 'E3',
          validFrom: values.validFrom instanceof Date ? values.validFrom : undefined,
          validTo: values.validTo instanceof Date ? values.validTo : undefined
        })
      };
  
      await updateCertificate(certificate.id, {
        ...updateData,
        teamId
      });
      
      toast.success("Certificate updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to update certificate", {
        description: error.message
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Certificate</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="serverName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keystorePath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keystore Path</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URI</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select application" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamApplications.map(app => (
                        <SelectItem key={app} value={app}>{app}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!certificate.isAmexCert && (
              <>
                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value as 'E1' | 'E2' | 'E3' | undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="E1">E1</SelectItem>
                          <SelectItem value="E2">E2</SelectItem>
                          <SelectItem value="E3">E3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date fields would go here */}
              </>
            )}

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}