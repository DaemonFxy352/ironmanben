import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { formatPhoneForTextlocal, sendSMS } from "@/lib/sms";
import type { Database } from "@/types/supabase";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey);
}

export async function POST(req: NextRequest) {
  try {
    const { note, spottedAt, spottedBy } = await req.json();

    if (!spottedAt || !spottedBy) {
      return NextResponse.json({ error: "Missing spottedAt or spottedBy" }, { status: 400 });
    }

    const supabase = getAdminClient();

    if (!supabase) {
      return NextResponse.json({ error: "SMS not configured" }, { status: 503 });
    }

    const { data: subscribers, error } = await supabase.rpc("get_subscriber_phones", {
      notification_type: "sighting",
    });

    if (error) {
      console.error("Failed to fetch subscribers:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    if (!subscribers?.length) {
      return NextResponse.json({ message: "No subscribers", sent: 0, success: true });
    }

    const noteText = note ? ` "${note}"` : "";
    const message = `Ben spotted at ${spottedAt}!${noteText} - ${spottedBy} · ironmanben.vercel.app`;
    const phones = subscribers.map((subscriber) => formatPhoneForTextlocal(subscriber.phone_e164));
    const result = await sendSMS({ message, to: phones, type: "sighting" });

    await supabase
      .from("notification_subscribers")
      .update({ last_notified_at: new Date().toISOString() })
      .in(
        "phone_e164",
        subscribers.map((subscriber) => subscriber.phone_e164),
      );

    return NextResponse.json({ sent: phones.length, success: result.success });
  } catch (error) {
    console.error("Sighting notification error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
