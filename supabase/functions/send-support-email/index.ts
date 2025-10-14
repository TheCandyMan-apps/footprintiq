import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  issueType: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, issueType, subject, message }: SupportEmailRequest = await req.json();

    // Send email to support
    const emailResponse = await resend.emails.send({
      from: "footprintiq Support <onboarding@resend.dev>",
      to: ["support@footprintiq.app"],
      replyTo: email,
      subject: `[${issueType.toUpperCase()}] ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Issue Type:</strong> ${issueType}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <h3>Message:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">This email was sent from the footprintiq support form.</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "footprintiq Support <onboarding@resend.dev>",
      to: [email],
      subject: "We've received your support request",
      html: `
        <h2>Thank you for contacting us, ${name}!</h2>
        <p>We have received your support request and will get back to you as soon as possible.</p>
        <p><strong>Issue Type:</strong> ${issueType}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <h3>Your Message:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr />
        <p>If you need immediate assistance, you can reach us at <a href="mailto:support@footprintiq.app">support@footprintiq.app</a></p>
        <p>Best regards,<br>The footprintiq Team</p>
      `,
    });

    console.log("Support emails sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
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
