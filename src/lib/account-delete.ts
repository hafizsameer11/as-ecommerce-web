import { storeAuthApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth-store";

/**
 * Self-service account deletion: DELETE /store/me { confirm: "DELETE", password }.
 * The server requires the password for accounts that have one. Signs the customer out afterwards.
 */
export async function deleteMyAccount(password?: string) {
  const result = await storeAuthApi.deleteAccount({
    confirm: "DELETE",
    password: password?.trim() ? password : undefined,
  });
  await useAuth.getState().signOut();
  return result;
}
