
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProposalRequest {
  projectTitle: string;
  projectDescription: string;
  skills?: string[];
  budget: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectTitle, projectDescription, skills, budget }: ProposalRequest = await req.json();

    // Simulate AI proposal generation (replace with actual AI service)
    const proposal = generateProposal(projectTitle, projectDescription, skills, budget);

    return new Response(JSON.stringify({ proposal }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error generating proposal:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate proposal" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateProposal(title: string, description: string, skills?: string[], budget?: number): string {
  const skillsText = skills && skills.length > 0 ? skills.join(", ") : "relevant technologies";
  
  return `Dear Client,

I am excited to submit my proposal for "${title}".

Having reviewed your project requirements, I understand you need ${description.toLowerCase()}.

My Approach:
• I will leverage my expertise in ${skillsText} to deliver a high-quality solution
• I'll follow best practices and maintain clear communication throughout the project
• Regular progress updates and milestone deliveries will ensure transparency

Why Choose Me:
• Proven track record in similar projects
• Attention to detail and commitment to deadlines
• Collaborative approach with client feedback integration

${budget ? `I believe the budget of $${budget} is reasonable for this scope of work.` : ''}

I look forward to discussing your project in more detail and answering any questions you may have.

Best regards,
Your Freelancer`;
}

serve(handler);
