import { handleMealCompletionRequest } from "@/server/meal-completion/handler";

export async function POST(request: Request): Promise<Response> {
  return handleMealCompletionRequest(request);
}
