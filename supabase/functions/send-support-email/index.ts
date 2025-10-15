import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

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
  priority: string;
  subject: string;
  message: string;
  ticketNumber?: string;
  attachments?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      name, 
      email, 
      issueType, 
      priority,
      subject, 
      message,
      ticketNumber,
      attachments
    }: SupportEmailRequest = await req.json();

    const attachmentsList = attachments && attachments.length > 0
      ? `<h3>Attachments:</h3><ul>${attachments.map(url => `<li><a href="${url}">${url}</a></li>`).join('')}</ul>`
      : '';

    // Send email to support
    const emailResponse = await resend.emails.send({
      from: "footprintiq Support <onboarding@resend.dev>",
      to: ["support@footprintiq.app"],
      replyTo: email,
      subject: `[${priority.toUpperCase()}] [${issueType.toUpperCase()}] ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>Ticket Number:</strong> ${ticketNumber || 'N/A'}</p>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
        <p><strong>Issue Type:</strong> ${issueType}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <h3>Message:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
        ${attachmentsList}
        <hr />
        <p style="color: #666; font-size: 12px;">This email was sent from the footprintiq support form.</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "footprintiq Support <onboarding@resend.dev>",
      to: [email],
      subject: `Support Ticket Created: ${ticketNumber || 'Pending'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Support Ticket Confirmation</h1>
          
          <p>Hello ${name},</p>
          
          <p>Thank you for contacting footprintiq Support. We have received your support request and will get back to you as soon as possible.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${ticketNumber ? `<p><strong>Ticket Number:</strong> ${ticketNumber}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Issue Type:</strong> ${issueType}</p>
            <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
          </div>
          
          <h3>Your Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
          
          ${attachmentsList}
          
          <p style="margin-top: 30px;">We'll review your request and respond according to the priority level:</p>
          <ul>
            <li><strong>Urgent:</strong> 1-2 hours</li>
            <li><strong>High:</strong> 4-8 hours</li>
            <li><strong>Normal:</strong> 1-2 business days</li>
            <li><strong>Low:</strong> 2-3 business days</li>
          </ul>
          
          <p>If you need to provide additional information, please reply to this email with your ticket number.</p>
          
          <p>If you need immediate assistance, you can reach us at <a href="mailto:support@footprintiq.app">support@footprintiq.app</a></p>
          
          <p>Best regards,<br>The footprintiq Support Team</p>
        </div>
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
    console.error("Error in send-support-email function:", error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'An error occurred sending your support request. Please try again.' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
