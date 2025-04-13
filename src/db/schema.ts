import { pgTable, varchar, boolean, timestamp, uuid, index, text, jsonb, unique, serial, date, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const teamsTable = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamName: varchar("team_name", { length: 255 }).unique().notNull(),
  escalation: varchar("escalation", { length: 255 }),
  alert1: varchar("alert1", { length: 255 }),
  alert2: varchar("alert2", { length: 255 }),
  alert3: varchar("alert3", { length: 255 }),
  notificationEmails: text("notification_emails").notNull().default('[]'),
  snowGroup: varchar("snow_group", { length: 255 }),
  prcGroup: varchar("prc_group", { length: 255 }),
  applications: varchar("applications", { length: 255 }).array(),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  updatedBy: varchar("updated_by", { length: 255 }),
  deletedAt: timestamp("deleted_at"),
  status: varchar("status", { length: 20 }).default('pending').notNull(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  teamId: uuid("team_id").references(() => teamsTable.id),
});

export const certificatesTable = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  certificateIdentifier: varchar("certificate_identifier", { length: 512 }).notNull(),
  teamId: uuid("team_id").references(() => teamsTable.id).notNull(),
  
  // Certificate Fields
  commonName: varchar("common_name", { length: 255 }).notNull(),
  serialNumber: varchar("serial_number", { length: 128 }).notNull(),
  // Add/Update these fields to match CertaaS response
  certificateStatus: varchar("certificate_status", { length: 64 }).notNull(),
  certificatePurpose: varchar("certificate_purpose", { length: 128 }).notNull(),
  environment: varchar("environment", { length: 64 }).notNull(),
  zeroTouch: boolean("zero_touch").default(false).notNull(),
  revokeRequestId: varchar("revoke_request_id", { length: 128 }),
  requestId: varchar("request_id", { length: 128 }).notNull(),
  requestedByUser: varchar("requested_by", { length: 255 }).notNull(),
  requestedForUser: varchar("requested_for", { length: 255 }).notNull(),
  approvedByUser: varchar("approved_by", { length: 255 }).notNull(),
  hostingTeamName: varchar("hosting_team", { length: 255 }).notNull(),
  requestChannelName: varchar("request_channel", { length: 255 }).notNull(),
  taClientName: varchar("ta_client", { length: 64 }).notNull(),
  applicationId: varchar("application_id", { length: 128 }).notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  subjectAlternateNames: text("subject_alternate_names"),
  issuerCertAuthName: varchar("issuer_ca", { length: 255 }),
  isAmexCert: boolean("is_amex_cert").notNull().default(false),
  currentCert: boolean("current_cert"),
  idaasIntegrationId: varchar("idaas_id", { length: 128 }),
  certType: varchar("cert_type", { length: 64 }),
  acknowledgedBy: varchar("acknowledged_by", { length: 64 }),
  centralID: varchar("central_id", { length: 64 }),
  applicationName: varchar("application_name", { length: 255 }),
  comment: text("comment"),
  renewingTeamName: varchar("renewing_team", { length: 255 }),
  changeNumber: varchar("change_number", { length: 64 }),
  serverName: varchar("server_name", { length: 255 }),
  keystorePath: varchar("keystore_path", { length: 512 }),
  uri: varchar("uri", { length: 512 }),
  revokeDate: timestamp("revoke_date"),
  certNotifications: jsonb("cert_notifications"),
  devices: varchar("devices", { length: 255 }).array(),
  agentVaultCerts: jsonb("agent_vault_certs"),

  // Tracking Fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  renewedBy: varchar("renewed_by", { length: 255 }),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  // Update unique constraint to include both serialNumber and commonName
  certUnique: unique("cert_unique").on(
    table.teamId,
    table.serialNumber,
    table.commonName
  ),
}));

export const teamRelations = relations(teamsTable, ({ many }) => ({
  certificates: many(certificatesTable),
}));

export const certificateRelations = relations(certificatesTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [certificatesTable.teamId],
    references: [teamsTable.id]
  }),
}));

// Add TypeScript type for certificates
export type Certificate = typeof certificatesTable.$inferSelect;

export const serviceIds = pgTable('service_ids', {
  id: uuid('id').primaryKey().defaultRandom(),
  svcid: text('svcid').notNull(),
  env: text('env').notNull(),
  application: text('application').notNull(),
  lastReset: date('last_reset'),
  expDate: date('exp_date').notNull(),
  renewalProcess: text('renewal_process').notNull(),
  status: text('status').notNull(),
  acknowledgedBy: text('acknowledged_by'),
  appCustodian: text('app_custodian'),
  scidOwner: text('scid_owner'),
  appAimId: text('app_aim_id'),
  description: text('description'),
  comment: text('comment'),
  lastNotification: integer('last_notification'),
  lastNotificationOn: date('last_notification_on'),
  renewingTeamId: uuid('renewing_team_id').references(() => teamsTable.id),
  changeNumber: text('change_number'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ServiceId = typeof serviceIds.$inferSelect;
export type NewServiceId = typeof serviceIds.$inferInsert;

export const notificationHistory = pgTable('notification_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: text('item_id').notNull(),
  itemType: text('item_type').notNull(), // 'certificate' or 'serviceId'
  itemName: text('item_name').notNull(),
  teamId: uuid('team_id').references(() => teamsTable.id).notNull(),
  daysUntilExpiry: text('days_until_expiry').notNull(),
  notificationType: text('notification_type').notNull(), // 'email' or 'other'
  recipients: text('recipients').notNull(), // JSON array of email addresses
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  status: text('status').notNull(), // 'success' or 'failed'
  errorMessage: text('error_message'),
  triggeredBy: text('triggered_by').notNull(), // 'system' or 'admin'
});