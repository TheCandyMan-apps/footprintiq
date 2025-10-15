import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rate limiting: Track submissions by IP address
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5; // 5 submissions per hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Remove timestamps outside the current window
  const recentTimestamps = timestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  
  // Check if limit exceeded
  if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  // Add current timestamp and update map
  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);
  
  // Cleanup old entries periodically (every 100 requests)
  if (rateLimitMap.size > 100) {
    for (const [key, value] of rateLimitMap.entries()) {
      const filtered = value.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (filtered.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, filtered);
      }
    }
  }
  
  return true;
}

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
    // Rate limiting: Extract IP address and check rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";
    
    if (!checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many support requests. Please try again later.',
          retryAfter: '1 hour'
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": "3600",
            ...corsHeaders 
          },
        }
      );
    }
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

    // HTML escape function to prevent XSS
    const escapeHtml = (text: string): string => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    const attachmentsList = attachments && attachments.length > 0
      ? `<h3>Attachments:</h3><ul>${attachments.map(url => `<li><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>`).join('')}</ul>`
      : '';

    // Send email to support (all user inputs are escaped)
    const emailResponse = await resend.emails.send({
      from: "footprintiq Support <onboarding@resend.dev>",
      to: ["support@footprintiq.app"],
      replyTo: email,
      subject: `[${escapeHtml(priority.toUpperCase())}] [${escapeHtml(issueType.toUpperCase())}] ${escapeHtml(subject)}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>Ticket Number:</strong> ${escapeHtml(ticketNumber || 'N/A')}</p>
        <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p><strong>Priority:</strong> ${escapeHtml(priority.toUpperCase())}</p>
        <p><strong>Issue Type:</strong> ${escapeHtml(issueType)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr />
        <h3>Message:</h3>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        ${attachmentsList}
        <hr />
        <p style="color: #666; font-size: 12px;">This email was sent from the footprintiq support form.</p>
      `,
    });

    // Send confirmation to user (all user inputs are escaped)
    await resend.emails.send({
      from: "footprintiq Support <onboarding@resend.dev>",
      to: [email],
      subject: `Support Ticket Created: ${escapeHtml(ticketNumber || 'Pending')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Support Ticket Confirmation</h1>
          
          <p>Hello ${escapeHtml(name)},</p>
          
          <p>Thank you for contacting footprintiq Support. We have received your support request and will get back to you as soon as possible.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${ticketNumber ? `<p><strong>Ticket Number:</strong> ${escapeHtml(ticketNumber)}</p>` : ''}
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Issue Type:</strong> ${escapeHtml(issueType)}</p>
            <p><strong>Priority:</strong> ${escapeHtml(priority.toUpperCase())}</p>
          </div>
          
          <h3>Your Message:</h3>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          
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
