import Link from "next/link";
import { ArrowRight, Gamepad2, Tv2 } from "lucide-react";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: "800px", padding: "64px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "32px" }}>
          <Tv2 size={64} color="var(--accent-primary)" style={{ filter: "drop-shadow(0 0 15px var(--accent-primary))" }} />
          <Gamepad2 size={64} color="var(--accent-secondary)" style={{ filter: "drop-shadow(0 0 15px var(--accent-secondary))" }} />
        </div>
        
        <h1 style={{ fontSize: "4rem", fontWeight: 900, marginBottom: "24px", background: "linear-gradient(135deg, var(--text-primary), var(--text-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Control Your <span style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Digital Life</span>
        </h1>
        
        <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: "48px", maxWidth: "600px", margin: "0 auto 48px auto", lineHeight: 1.6 }}>
          NexusSubs automatically scans your email to track, manage, and optimize all your OTT and Gaming subscriptions in one beautiful dashboard. No manual entry required.
        </p>

        <Link href="/login" className="btn-primary" style={{ padding: "16px 32px", fontSize: "1.2rem" }}>
          Get Started <ArrowRight size={20} />
        </Link>
      </div>
    </main>
  );
}
