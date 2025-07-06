
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, subject, message }: EmailRequest = await req.json();

    // Get user email from profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', to)
      .single();

    if (profileError || !profile?.email) {
      throw new Error('User email not found');
    }

    const emailResponse = await resend.emails.send({
      from: "FreelanceBot <notifications@yourdomain.com>",
      to: [profile.email],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">FreelanceBot</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hello ${profile.full_name || 'there'},
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              ${message}
            </p>
            <div style="text-align: center;">
              <a href="https://your-app-url.com/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; display: inline-block;">
                View Dashboard
              </a>
            </div>
          </div>
          <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>© 2025 FreelanceBot. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
