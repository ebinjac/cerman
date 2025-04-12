'use client'

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { createTeam } from "../app/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Add this import at the top
import { useRouter } from "next/navigation";

const formSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters"),
  escalation: z.string()
    .refine(val => !val || val.split(',').every(e => z.string().email().safeParse(e.trim()).success), 
      "Contains invalid email addresses"),
  alert1: z.string()
    .refine(val => !val || val.split(',').every(e => z.string().email().safeParse(e.trim()).success), 
      "Contains invalid email addresses"),
  alert2: z.string()
    .refine(val => !val || val.split(',').every(e => z.string().email().safeParse(e.trim()).success), 
      "Contains invalid email addresses"),
  alert3: z.string()
    .refine(val => !val || val.split(',').every(e => z.string().email().safeParse(e.trim()).success), 
      "Contains invalid email addresses"),
  applications: z.string().min(1, "At least one application is required"),
  snowGroup: z.string().optional(),
  prcGroup: z.string().optional(),
  createdBy: z.string().email("Invalid email format")
});

export function TeamOnboardingForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
      escalation: "",
      alert1: "",
      alert2: "",
      alert3: "",
      applications: "",
      snowGroup: "",
      prcGroup: "",
      createdBy: ""
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      await createTeam(formData);
      router.push(`/team-submission-status?team=${encodeURIComponent(data.teamName)}`);
    } catch (error: any) {
      if (error.message.includes('Team name already exists')) {
        form.setError('teamName', {
          type: 'manual',
          message: error.message
        });
      } else {
        console.error('Error creating team:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Team Onboarding</CardTitle>
        <CardDescription>Create a new team with notification contacts and associated applications</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Engineering Team" />
                    </FormControl>
                    <FormDescription>Unique identifier for your team</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="escalation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escalation Emails</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="admin@example.com, manager@example.com" />
                    </FormControl>
                    <FormDescription>Comma-separated email addresses</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {[1, 2, 3].map((num) => (
                <FormField
                  key={`alert${num}`}
                  control={form.control}
                  name={`alert${num}` as "alert1" | "alert2" | "alert3"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert {num} Emails</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={`alert${num}@example.com`} />
                      </FormControl>
                      <FormDescription>Comma-separated email addresses</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="applications"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Applications *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter application names separated by commas"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>List of managed applications</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="snowGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ServiceNow Group</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SNOW-1234" />
                    </FormControl>
                    <FormDescription>ServiceNow group ID</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prcGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PRC Group</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PRC-5678" />
                    </FormControl>
                    <FormDescription>Problem Review Committee ID</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="createdBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Created By *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="john.doe@example.com" />
                    </FormControl>
                    <FormDescription>Creator's email address</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating Team..." : "Create Team"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}