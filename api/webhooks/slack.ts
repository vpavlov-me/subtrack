import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: 'Slack webhook URL not configured' });
  }

  try {
    const { message, channel, attachments } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const payload = {
      text: message,
      channel: channel || '#general',
      attachments: attachments || [],
      username: 'SubTrack Bot',
      icon_emoji: ':chart_with_upwards_trend:'
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Slack webhook error:', error);
    res.status(500).json({ error: 'Failed to send Slack notification' });
  }
} 