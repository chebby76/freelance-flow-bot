
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'application' | 'message' | 'project_update' | 'payment';
  projectId: string;
  message: string;
  userId?: string;
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

    const { type, projectId, message, userId }: NotificationRequest = await req.json();

    // Get project details to determine recipient
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('client_id, freelancer_id, title')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Determine recipient based on notification type
    let recipientId = userId;
    if (!recipientId) {
      recipientId = type === 'application' ? project.client_id : project.freelancer_id;
    }

    if (!recipientId) {
      throw new Error('No recipient found for notification');
    }

    // Create notification
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: recipientId,
        title: getNotificationTitle(type, project.title),
        message,
        type,
        related_id: projectId
      });

    if (notificationError) throw notificationError;

    // Send email notification
    await supabaseClient.functions.invoke('send-email', {
      body: {
        to: recipientId,
        subject: getNotificationTitle(type, project.title),
        message
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getNotificationTitle(type: string, projectTitle: string): string {
  switch (type) {
    case 'application':
      return `New Application for "${projectTitle}"`;
    case 'message':
      return `New Message for "${projectTitle}"`;
    case 'project_update':
      return `Project Update: "${projectTitle}"`;
    case 'payment':
      return `Payment Update for "${projectTitle}"`;
    default:
      return `Update for "${projectTitle}"`;
  }
}

serve(handler);
