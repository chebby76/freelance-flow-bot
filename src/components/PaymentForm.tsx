
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentFormProps {
  projectId: string;
  amount: number;
  recipientId: string;
  onSuccess?: () => void;
}

const PaymentForm = ({ projectId, amount, recipientId, onSuccess }: PaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const processPayment = async () => {
    setLoading(true);
    try {
      // Create payment intent via edge function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          projectId,
          amount: amount * 100, // Convert to cents
          recipientId,
          cardData
        }
      });

      if (error) throw error;

      // Record payment in database
      const { error: dbError } = await supabase
        .from('payments')
        .insert({
          project_id: projectId,
          payer_id: (await supabase.auth.getUser()).data.user?.id,
          recipient_id: recipientId,
          amount,
          stripe_payment_intent_id: data.paymentIntentId,
          status: 'completed'
        });

      if (dbError) throw dbError;

      // Send notification to recipient
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'payment',
          projectId,
          userId: recipientId,
          message: `Payment of $${amount} has been processed for your project.`
        }
      });

      toast.success('Payment processed successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Pay ${amount} securely with Stripe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="cardholderName">Cardholder Name</Label>
          <Input
            id="cardholderName"
            value={cardData.cardholderName}
            onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
            placeholder="John Doe"
          />
        </div>
        
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            value={cardData.cardNumber}
            onChange={(e) => setCardData(prev => ({ ...prev, cardNumber: e.target.value }))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              value={cardData.expiryDate}
              onChange={(e) => setCardData(prev => ({ ...prev, expiryDate: e.target.value }))}
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              value={cardData.cvv}
              onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
              placeholder="123"
              maxLength={4}
            />
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 my-4">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <Button 
          className="w-full" 
          onClick={processPayment}
          disabled={loading}
        >
          {loading ? (
            'Processing...'
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              Pay ${amount}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
