import { MealRequestFlow } from "@/features/meal-request/MealRequestFlow";

export const metadata = {
  title: "Finish My Dinner — what's at home?",
};

export default function StartPage() {
  return <MealRequestFlow />;
}
