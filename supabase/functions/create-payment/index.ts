
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  projectId: string;
  amount: number;
  recipientId: string;
  cardData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, amount, recipientId, cardData }: PaymentRequest = await req.json();

    // Simulate Stripe payment processing
    // In a real implementation, you would use the Stripe API
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, always return success
    // In production, integrate with actual Stripe API
    const response = {
      success: true,
      paymentIntentId,
      amount,
      status: 'succeeded'
    };

    console.log('Payment processed:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({ error: "Payment processing failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
