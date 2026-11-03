import { NextResponse } from "next/server";
import { addMonths, format } from "date-fns";
import fs from "fs";
import path from "path";

// This webhook can receive SMS data from apps like Tasker, MacroDroid, or SMS Forwarder
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Expecting payload: { messages: [{ body: "...", sender: "...", date: "..." }] }
    const { messages, phone } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid payload, expecting an array of messages" }, { status: 400 });
    }

    const newSubscriptions = [];

    for (const msg of messages) {
      const text = msg.body;
      
      // Filter out personal messages; only look for transactional keywords
      if (!/(subscription|recharge|payment|debited|auto-pay|autopay|renewed|invoice)/i.test(text)) {
        continue;
      }

      // Extract the amount using standard currency patterns
      let amount: number | null = null;
      const amountRegex = /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i;
      const match = text.match(amountRegex);
      
      if (match && match[1]) {
        const parsed = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(parsed) && parsed > 0) amount = Math.round((parsed + Number.EPSILON) * 100) / 100;
      }

      if (amount) {
        // Fallback to current date if message date is not provided
        const lastPaymentDate = msg.date ? new Date(msg.date) : new Date();
        const nextDueDate = addMonths(lastPaymentDate, 1);
        
        // Try to clean up the sender name (e.g., AD-JIO -> Jio)
        let serviceName = msg.sender || "SMS Subscription";
        if (serviceName.includes("-")) {
          serviceName = serviceName.split("-")[1] || serviceName;
        }

        newSubscriptions.push({
          id: `sms-${Math.random().toString(36).substring(7)}`,
          serviceName: serviceName,
          amount: amount,
          currency: "INR",
          lastPaymentDate: format(lastPaymentDate, "yyyy-MM-dd"),
          nextDueDate: format(nextDueDate, "yyyy-MM-dd"),
          isActive: true,
          account: phone || "Mobile Device",
          source: "SMS",
        });
      }
    }

    // Save to our JSON database
    if (newSubscriptions.length > 0) {
      const dbPath = path.join(process.cwd(), "src", "data", "subscriptions.json");
      let existing = [];
      try {
        if (fs.existsSync(dbPath)) {
          const fileData = fs.readFileSync(dbPath, "utf-8");
          existing = JSON.parse(fileData);
        }
      } catch (err) {
        console.error("Error reading db:", err);
      }
      
      const updatedDB = [...existing, ...newSubscriptions];
      fs.writeFileSync(dbPath, JSON.stringify(updatedDB, null, 2), "utf-8");
    }

    return NextResponse.json({ success: true, count: newSubscriptions.length, subscriptions: newSubscriptions });
  } catch (error) {
    console.error("SMS Webhook error:", error);
    return NextResponse.json({ error: "Failed to process SMS webhook" }, { status: 500 });
  }
}
