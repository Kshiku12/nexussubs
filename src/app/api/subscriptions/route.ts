import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { scanForSubscriptions } from "@/lib/gmail";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const anySession = session as any;
  const body = await req.json();
  const { emails, phones } = body; // Array of linked emails and phones

  if (!anySession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let allSubscriptions: any[] = [];

    // If they have a real access token, use it
    if (anySession.accessToken && anySession.accessToken !== "mock-access-token") {
      const realSubs = await scanForSubscriptions(anySession.accessToken as string, anySession.user?.email);
      allSubscriptions = [...realSubs];
    } else {
      // Mock for primary account if no real token
      const primaryMocks = [
        {
          id: `netflix-primary`,
          serviceName: "Netflix",
          account: anySession.user?.email || "user@example.com",
          amount: 649,
          currency: "INR",
          lastPaymentDate: "2026-04-10",
          nextDueDate: "2026-05-10",
          isActive: true,
        },
        {
          id: `spotify-primary`,
          serviceName: "Spotify",
          account: anySession.user?.email || "user@example.com",
          amount: 119,
          currency: "INR",
          lastPaymentDate: "2026-04-22",
          nextDueDate: "2026-05-22",
          isActive: true,
        },
        {
          id: `xbox-primary`,
          serviceName: "Xbox Game Pass",
          account: anySession.user?.email || "user@example.com",
          amount: 349,
          currency: "INR",
          lastPaymentDate: "2026-04-05",
          nextDueDate: "2026-05-05",
          isActive: true,
        }
      ];
      allSubscriptions = [...allSubscriptions, ...primaryMocks];
    }

    // Mock for additional linked emails
    if (emails && emails.length > 0) {
      for (const email of emails) {
        // We mock some random subscriptions for each connected email since we don't have real tokens for them
        const mockSubs = [
          {
            id: `netflix-${email}`,
            serviceName: "Netflix",
            account: email,
            amount: 199,
            currency: "INR",
            lastPaymentDate: "2026-05-01",
            nextDueDate: "2026-06-01",
            isActive: true,
          },
          {
            id: `amazon-${email}`,
            serviceName: "Amazon Prime",
            account: email,
            amount: 299,
            currency: "INR",
            lastPaymentDate: "2026-04-15",
            nextDueDate: "2026-05-15",
            isActive: true,
          }
        ];
        allSubscriptions = [...allSubscriptions, ...mockSubs];
      }
    }

    // Simulate a complex scanning process (reading emails and parsing SMS)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock for linked phones
    if (phones && phones.length > 0) {
      for (const phone of phones) {
        if (phone === "8971636441") {
          // Specific SMS match for Apple Subscriptions
          const appleSubs = [
            {
              id: `apple-music-${phone}`,
              serviceName: "Apple Music",
              account: phone,
              amount: 99,
              currency: "INR",
              lastPaymentDate: "2026-05-02",
              nextDueDate: "2026-06-02",
              isActive: true,
            },
            {
              id: `icloud-${phone}`,
              serviceName: "iCloud+ 50GB",
              account: phone,
              amount: 75,
              currency: "INR",
              lastPaymentDate: "2026-05-10",
              nextDueDate: "2026-06-10",
              isActive: true,
            }
          ];
          allSubscriptions = [...allSubscriptions, ...appleSubs];
        } else if (phone === "9911868100") {
          // Simulating that SMS scan found no active subscriptions for this number
          // Removing Jio/Spotify as requested
        } else {
          // Random dummy data for other unknown numbers
          const randomSubs = [
            {
              id: `disney-${phone}`,
              serviceName: "Disney+ Hotstar",
              account: phone,
              amount: 899,
              currency: "INR",
              lastPaymentDate: "2026-01-15",
              nextDueDate: "2027-01-15",
              isActive: true,
            }
          ];
          allSubscriptions = [...allSubscriptions, ...randomSubs];
        }
      }
    }

    // Add dynamically captured SMS subscriptions
    const dbPath = path.join(process.cwd(), "src", "data", "subscriptions.json");
    if (fs.existsSync(dbPath)) {
      try {
        const fileData = fs.readFileSync(dbPath, "utf-8");
        const smsSubs = JSON.parse(fileData);
        if (Array.isArray(smsSubs)) {
          // ensure no duplicate IDs if phone match already added them
          const existingIds = new Set(allSubscriptions.map(s => s.id));
          for (const sub of smsSubs) {
            if (!existingIds.has(sub.id)) {
               allSubscriptions.push(sub);
            }
          }
        }
      } catch (e) {
        console.error("Error parsing SMS JSON:", e);
      }
    }

    return NextResponse.json({ subscriptions: allSubscriptions });
  } catch (error) {
    console.error("API error fetching subscriptions:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}


export async function GET() {
  const session = await getServerSession(authOptions);
  const anySession = session as any;

  if (!anySession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let subscriptions: any[] = [];
    if (anySession.accessToken) {
      subscriptions = await scanForSubscriptions(anySession.accessToken as string, anySession.user?.email);
    }
    
    // Add dynamically captured SMS subscriptions
    const dbPath = path.join(process.cwd(), "src", "data", "subscriptions.json");
    if (fs.existsSync(dbPath)) {
      try {
        const fileData = fs.readFileSync(dbPath, "utf-8");
        const smsSubs = JSON.parse(fileData);
        if (Array.isArray(smsSubs)) {
          subscriptions = [...subscriptions, ...smsSubs];
        }
      } catch (e) {
        console.error("Error parsing SMS JSON:", e);
      }
    }

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("API error fetching subscriptions:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
