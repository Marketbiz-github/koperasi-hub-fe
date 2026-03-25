/**
 * Utility to send a message to a Slack channel via WebHOOK URL.
 */
export async function sendSlackMessage(text: string) {
  const isProd = process.env.NODE_ENV === "production";
  const forceLog = process.env.FORCE_SLACK_LOG === "true";

  if (!isProd && !forceLog) return false;

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error("SLACK_WEBHOOK_URL is not defined in environment variables.");
    return false;
  }

  const envFlag = isProd ? "[PROD]" : "[LOCAL]";
  const messageWithFlag = `${envFlag} ${text}`;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: messageWithFlag }),
    });

    if (!response.ok) {
      console.error(`Error sending message to Slack: ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending message to Slack:", error);
    return false;
  }
}
