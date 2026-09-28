import { hasPermission } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { getUserClaims } from "@carbon/auth/users.server";
import type { LoaderFunctionArgs } from "react-router";
import { getDelayAnalysis } from "~/modules/production/delay.server";

const kinds = {
  job: "production",
  "sales-order": "sales",
  "purchase-order": "purchasing"
} as const;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const kind = params.type;
  if (kind !== "job" && kind !== "sales-order" && kind !== "purchase-order") {
    throw new Response("Not found", { status: 404 });
  }
  if (!params.id) throw new Response("Not found", { status: 404 });

  const { client, companyId, userId } = await requirePermissions(request, {
    view: kinds[kind],
    bypassRls: true
  });
  const claims = await getUserClaims(userId, companyId);
  try {
    return await getDelayAnalysis(
      client,
      companyId,
      kind,
      params.id,
      (module) => hasPermission(claims.permissions, module, "view", companyId)
    );
  } catch {
    return null;
  }
}
