import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MESSAGEBIRD_URL = "https://rest.messagebird.com/messages";
const SENDER = "RACEHQ";

type SMSType = "sighting" | "checkin" | "meetup" | "finish" | "general";

type SMSRequest = {
  message: string;
  to: string | string[];
  type?: SMSType;
};

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (serviceRoleKey && authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { to, message, type }: SMSRequest = await req.json();

    if (!to || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, message" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const apiKey = Deno.env.get("MESSAGEBIRD_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "MESSAGEBIRD_API_KEY secret not configured" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const recipients = (Array.isArray(to) ? to : [to]).map((phoneNumber) =>
      phoneNumber.replace(/\D/g, ""),
    );
    const safeMessage = message.length > 160 ? `${message.substring(0, 157)}...` : message;

    const response = await fetch(MESSAGEBIRD_URL, {
      body: JSON.stringify({
        body: safeMessage,
        originator: SENDER,
        recipients,
      }),
      headers: {
        Authorization: `AccessKey ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const result = await response.json();

    if (response.ok) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        serviceRoleKey ?? "",
      );

      await supabase.from("sms_log").insert({
        message_type: type ?? "general",
        recipient_count: Array.isArray(to) ? to.length : 1,
        status: "sent",
        textlocal_batch_id: Number(result.id) || null,
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: response.ok ? 200 : 502,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
