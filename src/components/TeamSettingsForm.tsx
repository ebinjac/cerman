"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateTeam } from "@/src/app/actions";
import { useRouter } from "next/navigation";
import { EmailTagInput } from "./EmailTagInput";

const formSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters"),
  escalation: z.string().min(1, "Escalation contact is required"),
  alert1: z.array(z.string().email("Invalid email format")).min(1, "At least one alert contact is required"),
  alert2: z.array(z.string().email("Invalid email format")).optional(),
  alert3: z.array(z.string().email("Invalid email format")).optional(),
  snowGroup: z.string().min(1, "ServiceNow group is required"),
  prcGroup: z.string().min(1, "PRC group is required"),
  applications: z.string().min(1, "At least one application is required"),
});

interface TeamSettingsFormProps {
  team: {
    id: string;
    teamName: string;
    escalation: string | null;
    alert1: string | null;
    alert2: string | null;
    alert3: string | null;
    snowGroup: string | null;
    prcGroup: string | null;
    applications: string[] | null;
  };
}

export function TeamSettingsForm({ team }: TeamSettingsFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: team.teamName,
      escalation: team.escalation || "",
      alert1: team.alert1 ? [team.alert1] : [],
      alert2: team.alert2 ? [team.alert2] : [],
      alert3: team.alert3 ? [team.alert3] : [],
      snowGroup: team.snowGroup || "",
      prcGroup: team.prcGroup || "",
      applications: team.applications?.join(", ") || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const applications = values.applications
        .split(",")
        .map((app) => app.trim())
        .filter(Boolean);

      await updateTeam(team.id, {
        ...values,
        alert1: values.alert1.join(", "),
        alert2: values.alert2?.join(", ") || "",
        alert3: values.alert3?.join(", ") || "",
        applications,
      });

      toast.success("Team settings updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update team settings");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="teamName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="escalation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escalation Contact</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <EmailTagInput
                  label="Primary Alert Contacts"
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.alert1?.message}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alert2"
            render={({ field }) => (
              <FormItem>
                <EmailTagInput
                  label="Secondary Alert Contacts"
                  value={field.value || []}
                  onChange={field.onChange}
                  error={form.formState.errors.alert2?.message}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alert3"
            render={({ field }) => (
              <FormItem>
                <EmailTagInput
                  label="Tertiary Alert Contacts"
                  value={field.value || []}
                  onChange={field.onChange}
                  error={form.formState.errors.alert3?.message}
                />
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
                  <Input {...field} />
                </FormControl>
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applications"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Applications</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter applications separated by commas"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
} 