import { TeamOnboardingForm } from "../components/TeamOnboardingForm";

export default function TeamOnboardingPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Team Onboarding</h1>
      <TeamOnboardingForm />
    </div>
  );
}