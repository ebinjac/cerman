"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { teamFormSchema, type TeamFormValues } from "./team-schema";

export function NewTeamForm() {
  const router = useRouter();
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      teamName: "",
      alert1: "",
      alert2: "",
      alert3: "",
      escalation: "",
      isActive: true,
    },
  });

  async function onSubmit(data: TeamFormValues) {
    try {
      const response = await fetch("/api/admin/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      toast.success("Team created successfully");
      router.push("/admin/teams");
      router.refresh();
    } catch (error) {
      toast.error("Failed to create team");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="teamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter team name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alert1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Alert Contact</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
              <FormDescription>
                This contact will receive all primary notifications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alert2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Alert Contact</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
              <FormDescription>
                This contact will receive notifications if primary contact is unavailable
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alert3"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tertiary Alert Contact</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
              <FormDescription>
                This contact will receive notifications if both primary and secondary contacts are unavailable
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="escalation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escalation Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter escalation notes"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Additional information about escalation procedures
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Team</FormLabel>
                <FormDescription>
                  Inactive teams will not receive notifications
                </FormDescription>
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

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create Team"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 