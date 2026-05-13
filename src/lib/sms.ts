export type SMSType = "sighting" | "checkin" | "meetup" | "finish" | "general";

type SendSMSOptions = {
  message: string;
  to: string | string[];
  type?: SMSType;
};

export async function sendSMS({ message, to, type = "general" }: SendSMSOptions) {
  const smsFunctionUrl = process.env.SMS_FUNCTION_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!smsFunctionUrl || !serviceRoleKey) {
    console.error("SMS not configured: missing SMS_FUNCTION_URL or SUPABASE_SERVICE_ROLE_KEY");
    return { error: "SMS not configured", success: false };
  }

  try {
    const response = await fetch(smsFunctionUrl, {
      body: JSON.stringify({ message, to, type }),
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = await response.json();

    if (data.status === "success") {
      return { batchId: data.batch_id, success: true };
    }

    console.error("Textlocal error:", data);
    return { error: data.errors?.[0]?.message ?? data.error ?? "Unknown error", success: false };
  } catch (error) {
    console.error("SMS send failed:", error);
    return { error: String(error), success: false };
  }
}

export function formatPhoneForTextlocal(raw: string) {
  return raw.replace(/\D/g, "").replace(/^\+/, "");
}

export function formatPhoneE164(raw: string) {
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  return digits.startsWith("+") ? digits : `+${digits}`;
}
