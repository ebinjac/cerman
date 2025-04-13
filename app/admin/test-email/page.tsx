"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function TestEmailPage() {
  const [isSending, setIsSending] = useState(false);

  const sendTestEmail = async () => {
    setIsSending(true);
    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success("Test email sent successfully");
      } else {
        toast.error("Failed to send test email");
      }
    } catch (error) {
      toast.error("Failed to send test email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Email System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Click the button below to send a test email. This will verify that your email service is properly configured.
              </p>
              <Button onClick={sendTestEmail} disabled={isSending}>
                {isSending ? "Sending..." : "Send Test Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 