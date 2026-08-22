import { authenticateRequest, type AuthContext } from "@/lib/auth/request-auth";
import { toErrorResponse } from "@/lib/api/respond";

type AuthedHandler = (
  req: Request,
  ctx: AuthContext,
  params: Record<string, string>,
) => Promise<Response>;

export function withAuth(handler: AuthedHandler) {
  return async (
    req: Request,
    route?: { params: Promise<Record<string, string>> },
  ): Promise<Response> => {
    try {
      const auth = await authenticateRequest(req);
      const params = route?.params ? await route.params : {};
      return await handler(req, auth, params);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
