"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function SimulateGoogleAuth() {
  const [emails, setEmails] = useState([
    "csgnverma2235@gmail.com",
    "kshitij.v2003@gmail.com",
    "developer.nexus@gmail.com"
  ]);

  const selectAccount = (email: string) => {
    // Send message to parent window
    if (window.opener) {
      window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS", email }, "*");
    }
    window.close();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="32" height="32" />
          <h1>Choose an account</h1>
          <p>to continue to <strong>NexusSubs</strong></p>
        </div>
        
        <div className={styles.accountList}>
          {emails.map(email => (
            <div key={email} className={styles.accountItem} onClick={() => selectAccount(email)}>
              <div className={styles.avatar}>{email.charAt(0).toUpperCase()}</div>
              <div className={styles.accountInfo}>
                <div className={styles.name}>{email.split("@")[0]}</div>
                <div className={styles.email}>{email}</div>
              </div>
            </div>
          ))}
          <div className={styles.accountItem} onClick={() => {
            const custom = prompt("Enter email address:");
            if (custom) selectAccount(custom);
          }}>
            <div className={styles.avatarIcon}>
              <svg aria-hidden="true" fill="currentColor" width="20" height="20" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
            </div>
            <div className={styles.accountInfo}>
              <div className={styles.name}>Use another account</div>
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <p>To continue, Google will share your name, email address, and language preference with NexusSubs. Before using this app, you can review NexusSubs's <a href="#">privacy policy</a> and <a href="#">terms of service</a>.</p>
        </div>
      </div>
    </div>
  );
}
