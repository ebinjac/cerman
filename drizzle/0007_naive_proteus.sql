ALTER TABLE "certificates" DROP CONSTRAINT "team_cert_unique";--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "cert_unique" UNIQUE("team_id","serial_number","common_name");