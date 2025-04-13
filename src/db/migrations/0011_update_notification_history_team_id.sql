-- First, create a temporary column
ALTER TABLE notification_history ADD COLUMN team_id_new uuid;

-- Update the temporary column with the converted UUID values
UPDATE notification_history 
SET team_id_new = team_id::uuid 
WHERE team_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Drop the old column
ALTER TABLE notification_history DROP COLUMN team_id;

-- Rename the new column
ALTER TABLE notification_history RENAME COLUMN team_id_new TO team_id;

-- Add the foreign key constraint
ALTER TABLE notification_history 
ADD CONSTRAINT notification_history_team_id_fkey 
FOREIGN KEY (team_id) REFERENCES teams(id); 