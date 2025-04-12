DROP INDEX "team_cert_unique";--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "team_cert_unique" UNIQUE("team_id","certificate_identifier");