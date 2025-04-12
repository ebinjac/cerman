import { TeamOnboardingForm } from '@/src/components/TeamOnboardingForm';
import React from 'react';

const TeamPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Team Page</h1>
      <p>Welcome to the team page. Here you can manage your teams.</p>
      {/* Add more content or components here */}
      <TeamOnboardingForm />
    </div>
  );
};

export default TeamPage;