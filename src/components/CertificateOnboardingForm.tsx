'use client'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { importCertificateFromCertaas } from "../app/actions"
import { toast } from "sonner"
import { Loader, CalendarIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface CertificateFormProps {
  teamId: string;
  teamApplications: string[];
  onSuccess?: () => void;
}

// Update the form schema definition
// Update the form schema to make these fields optional
const formSchema = z.object({
  commonName: z.string().min(2, "Common name required"),
  serialNumber: z.string().min(1, "Serial number required"),
  serverName: z.string().optional(), // Changed to optional
  keystorePath: z.string().optional(), // Changed to optional
  uri: z.string()
    .optional()
    .refine(val => !val || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL when provided"
    }),
  applicationId: z.string().min(1, "Application selection required"),
  comment: z.string().optional(),
  isAmexCert: z.boolean(),
  validFrom: z.date().optional(),
  validTo: z.date().optional(),
  // In the formSchema definition
  environment: z.enum(['E1', 'E2', 'E3']).optional()
}).superRefine((data, ctx) => {
  if (!data.isAmexCert) {
    if (!data.validFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid from date required",
        path: ["validFrom"]
      });
    }
    if (!data.validTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid to date required",
        path: ["validTo"]
      });
    }
    if (!data.environment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Environment selection required",
        path: ["environment"]
      });
    }
  }
});

export function CertificateOnboardingForm({ 
  teamId,
  teamApplications,
  onSuccess 
}: CertificateFormProps) {
  // Update useForm initialization to:
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commonName: "",
      serialNumber: "",
      serverName: "",
      keystorePath: "",
      uri: "",
      applicationId: "",
      comment: "",
      isAmexCert: true, // Explicit initial value
    }
  })

  // Update handleSubmit function
  const handleSubmit = async (formData: z.infer<typeof formSchema>) => {
    try {
      // Destructure first to avoid duplicates
      const { isAmexCert, validFrom, validTo, environment, ...restData } = formData;
      
      const result = await importCertificateFromCertaas({
        teamId,
        isAmexCert,
        validFrom,
        validTo,
        environment,
        ...restData,
        // Ensure required fields are not undefined
        serverName: restData.serverName || '', // Fallback to empty string if undefined
        keystorePath: restData.keystorePath || '', // Fallback to empty string if undefined
        uri: restData.uri || '', // Fallback to empty string if undefined
        comment: restData.comment || '' // Fallback to empty string if undefined
      })
      
      toast.success("Certificate onboarded successfully", {
        description: `${result.commonName} added to the system`
      })
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to onboard certificate", {
        description: (error as Error).message
      })
    }
  }

  // Update server action call in form component
  <FormField
    control={form.control}
    name="applicationId"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Associated Application</FormLabel>
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Core Certificate Information Section */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className=" font-semibold">Core Certificate Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter the essential details of your certificate
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="commonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="valified.aexp.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Certificate serial number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isAmexCert"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <FormLabel>CertaaS Managed Certificate</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Toggle if this is an American Express managed certificate
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Validity Period Section */}
        {!form.watch('isAmexCert') && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className=" font-semibold">Validity Period</h3>
              <p className="text-sm text-muted-foreground">
                Specify the certificate's validity period and environment
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid From</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid To</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="environment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="E1">E1 (Development)</SelectItem>
                        <SelectItem value="E2">E2 (Staging)</SelectItem>
                        <SelectItem value="E3">E3 (Production)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Server Configuration Section */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className=" font-semibold">Server Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Provide details about where the certificate is deployed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="serverName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Production server name" />
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
                    <Input {...field} placeholder="/path/to/keystore" />
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
                  <FormLabel>Certificate URI</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://certificate.url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Application and Comments Section */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className=" font-semibold">Additional Information</h3>
            <p className="text-sm text-muted-foreground">
              Link the certificate to an application and add any relevant notes
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="applicationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Application</FormLabel>
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

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Add any additional notes about this certificate"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Button Section */}
        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="submit"
            disabled={form.formState.isSubmitting}
            className="min-w-[200px]"
          >
            {form.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Importing...
              </span>
            ) : (
              "Import Certificate"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}