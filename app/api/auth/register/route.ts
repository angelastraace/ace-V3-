import { registrationDisabledResponse } from "../../../../lib/server-auth";

/** Public account creation is closed; preview accounts are created only by the CLI provisioner. */
export async function POST() {
  return registrationDisabledResponse();
}
