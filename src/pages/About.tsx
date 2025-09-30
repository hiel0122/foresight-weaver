import { TopNav } from '@/components/TopNav';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold tracking-tight mb-8">About</h1>
          
          <div className="prose">
            <h2>About This Project</h2>
            <p>
              This research project examines the trajectory of artificial intelligence development 
              through 2027, providing evidence-based forecasts for key milestones and potential risks.
            </p>

            <h2>Methodology</h2>
            <p>
              Our forecasts are based on:
            </p>
            <ul>
              <li>Historical trends in compute scaling and AI capabilities</li>
              <li>Expert surveys and interviews with AI researchers</li>
              <li>Analysis of current technological trajectories</li>
              <li>Security and safety assessments</li>
            </ul>

            <h2>Contact</h2>
            <p>
              For inquiries about this research, please contact us at{' '}
              <a href="mailto:research@ai-2027.com">research@ai-2027.com</a>
            </p>

            <h2>Credits</h2>
            <p>
              This project was developed using modern web technologies including React, TypeScript, 
              and Tailwind CSS, with backend powered by Lovable Cloud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
