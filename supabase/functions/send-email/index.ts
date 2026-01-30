import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const emailPayload: EmailRequest = await req.json();

    // Validate required fields
    if (!emailPayload.to || !emailPayload.subject || !emailPayload.html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Send email using Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: emailPayload.to,
        subject: emailPayload.subject,
        html: emailPayload.html,
      }),
    });

    const resendData = await resendResponse.json();

    console.log("Resend API Response Status:", resendResponse.status);
    console.log("Resend API Response Data:", resendData);

    if (!resendResponse.ok) {
      console.error("Failed to send email:", resendData);
      return new Response(
        JSON.stringify({ error: resendData.message || "Failed to send email", details: resendData }),
        {
          status: resendResponse.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log("Email sent successfully to:", emailPayload.to);
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: resendData.id,
        message: "Email sent successfully"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
