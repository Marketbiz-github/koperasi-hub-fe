import { NextResponse } from "next/server";
import { sendSlackMessage } from "@/lib/slack";

export async function GET() {
  const success = await sendSlackMessage(
    "Hello :wave:! This is a test message from Koperasi Hub environment to confirm Slack integration is working."
  );

  if (success) {
    return NextResponse.json({ message: "Test message sent to Slack successfully!" }, { status: 200 });
  } else {
    return NextResponse.json(
      { error: "Failed to send test message to Slack. Check server logs and make sure SLACK_WEBHOOK_URL is set in .env." },
      { status: 500 }
    );
  }
}
