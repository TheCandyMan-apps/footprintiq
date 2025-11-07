import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response("Webhook Error: Missing signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata from the checkout session
        const userId = session.metadata?.user_id;
        const workspaceId = session.metadata?.workspace_id;
        const credits = parseInt(session.metadata?.credits || "0");
        const priceId = session.metadata?.price_id;

        if (!userId || !workspaceId || !credits) {
          console.error("Missing required metadata in checkout session", {
            userId,
            workspaceId,
            credits,
            metadata: session.metadata
          });
          break;
        }

        console.log(`Processing credit purchase: ${credits} credits for workspace ${workspaceId}`);

        // Add credits to workspace's ledger
        const { error: creditError } = await supabase
          .from("credits_ledger")
          .insert({
            workspace_id: workspaceId,
            delta: credits,
            reason: `Credit purchase - ${credits} credits`,
            reference_type: "stripe_payment",
            reference_id: session.id,
            meta: {
              stripe_session_id: session.id,
              stripe_price_id: priceId,
              amount_paid: session.amount_total,
              currency: session.currency,
              payment_status: session.payment_status,
            }
          });

        if (creditError) {
          console.error("Failed to credit account:", creditError);
          throw creditError;
        }

        console.log(`✅ Successfully credited ${credits} credits to workspace ${workspaceId}`);
        
        // Send confirmation email
        try {
          // Get user email
          const { data: authUser } = await supabase.auth.admin.getUserById(userId);
          const userEmail = authUser?.user?.email;

          if (userEmail) {
            const amountPaid = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";
            const currency = session.currency?.toUpperCase() || "GBP";

            await resend.emails.send({
              from: "Credits Purchase <onboarding@resend.dev>",
              to: [userEmail],
              subject: `${credits} Credits Added to Your Account! 🎉`,
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  </head>
                  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                      <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful!</h1>
                    </div>
                    
                    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                      <p style="font-size: 18px; margin-bottom: 20px;">Great news! Your credit purchase has been processed successfully.</p>
                      
                      <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #667eea;">Purchase Details</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Credits Added:</td>
                            <td style="padding: 8px 0; font-weight: bold; text-align: right; font-size: 24px; color: #667eea;">${credits} credits</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${currency} ${amountPaid}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Transaction ID:</td>
                            <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px; color: #6b7280;">${session.id}</td>
                          </tr>
                        </table>
                      </div>

                      <p style="margin-top: 30px;">Your credits are now available and ready to use. You can start using them immediately for:</p>
                      
                      <ul style="list-style: none; padding: 0; margin: 20px 0;">
                        <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">✓ Dark web monitoring</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">✓ OSINT investigations</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">✓ Premium data exports</li>
                        <li style="padding: 10px 0;">✓ Advanced threat intelligence</li>
                      </ul>

                      <div style="text-align: center; margin-top: 40px;">
                        <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">Thank you for your purchase!</p>
                        <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">If you have any questions, please don't hesitate to reach out to our support team.</p>
                      </div>
                    </div>

                    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                      <p style="margin: 5px 0;">This is an automated receipt for your credit purchase.</p>
                      <p style="margin: 5px 0;">Please keep this email for your records.</p>
                    </div>
                  </body>
                </html>
              `,
            });

            console.log(`📧 Confirmation email sent to ${userEmail}`);
          } else {
            console.warn("Could not send email: user email not found");
          }
        } catch (emailError) {
          // Don't fail the webhook if email fails
          console.error("Failed to send confirmation email:", emailError);
        }
        
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;

        const email = customer.email;
        if (!email) break;

        // Find user by email
        const { data: userData } = await supabase.auth.admin.listUsers();
        const user = userData?.users.find(u => u.email === email);
        if (!user) break;

        // Map Stripe price to subscription tier
        const priceId = subscription.items.data[0]?.price.id;
        let tier: "free" | "basic" | "premium" | "enterprise" = "free";
        
        if (priceId === Deno.env.get("STRIPE_PRICE_ANALYST")) tier = "basic";
        else if (priceId === Deno.env.get("STRIPE_PRICE_PRO")) tier = "premium";
        else if (priceId === Deno.env.get("STRIPE_PRICE_ENTERPRISE")) tier = "enterprise";

        // Update user subscription
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({
            subscription_tier: tier,
            subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Failed to update subscription:", updateError);
          throw updateError;
        }

        console.log(`Updated subscription for ${email} to ${tier}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;

        const email = customer.email;
        if (!email) break;

        const { data: userData } = await supabase.auth.admin.listUsers();
        const user = userData?.users.find(u => u.email === email);
        if (!user) break;

        // Downgrade to free tier
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({
            subscription_tier: "free",
            subscription_expires_at: null,
          })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Failed to downgrade subscription:", updateError);
          throw updateError;
        }

        console.log(`Downgraded ${email} to free tier`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Webhook handler failed",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
