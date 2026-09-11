const source = "DATABASE_URL_DIRECT";

export function migrationConnection(env = process.env) {
  const value = env[source]?.trim();
  if (!value) throw new Error("DATABASE_URL_DIRECT is required for migrations");
  return { source, value };
}
