"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import styles from "./page.module.css";
import { Gamepad2, Tv2, User, KeyRound, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleNormalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      signIn("credentials", { username, password, callbackUrl: "/dashboard" });
    }
  };

  return (
    <div className={styles.container}>

      
      <div className={`glass-card ${styles.loginCard} animate-fade-in`}>
        <div className={styles.iconContainer}>
          <Tv2 size={40} className={styles.iconOtt} />
          <Gamepad2 size={40} className={styles.iconGame} />
        </div>
        <h1 className={styles.title}>NexusSubs</h1>
        <p className={styles.subtitle}>
          Enter the Nexus to track your subscriptions
        </p>

        <form onSubmit={handleNormalLogin} className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <User className={styles.inputIcon} size={20} />
            <input 
              type="text" 
              placeholder="Username" 
              className={styles.inputField}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <KeyRound className={styles.inputIcon} size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            Initialize <ChevronRight size={18} />
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>
        
        <button className={`btn-secondary ${styles.googleBtn}`} onClick={handleGoogleLogin}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" height="20" />
          Continue with Google
        </button>
        
        <div className={styles.footer}>
          <p>Securely sync and monitor your recurring digital expenses.</p>
        </div>
      </div>
    </div>
  );
}
