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
    const { finishTime } = await req.json();
    const supabase = getAdminClient();

    if (!supabase) {
      return NextResponse.json({ error: "SMS not configured" }, { status: 503 });
    }

    const { data: subscribers } = await supabase.rpc("get_subscriber_phones", {
      notification_type: "finish",
    });

    if (!subscribers?.length) {
      return NextResponse.json({ sent: 0, success: true });
    }

    const timeText = finishTime ? ` at ${finishTime}` : "";
    const message = `BEN FINISHED${timeText}! Get to the finish line at Memorial Park! ironmanben.vercel.app`;
    const phones = subscribers.map((subscriber) => formatPhoneForTextlocal(subscriber.phone_e164));
    const result = await sendSMS({ message, to: phones, type: "finish" });

    await supabase
      .from("notification_subscribers")
      .update({ last_notified_at: new Date().toISOString() })
      .in(
        "phone_e164",
        subscribers.map((subscriber) => subscriber.phone_e164),
      );

    return NextResponse.json({ sent: phones.length, success: result.success });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
