ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banReason" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banExpires" timestamptz;
ALTER TABLE session ADD COLUMN IF NOT EXISTS "impersonatedBy" text;

UPDATE "user" AS auth_user
SET role = roles.role
FROM (
  SELECT DISTINCT ON (user_id) user_id, role
  FROM user_roles
  ORDER BY user_id, CASE role WHEN 'admin' THEN 0 WHEN 'user' THEN 1 ELSE 2 END
) AS roles
WHERE auth_user.id = roles.user_id;
