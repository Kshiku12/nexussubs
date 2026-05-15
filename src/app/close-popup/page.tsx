"use client";

import { useEffect } from "react";

export default function ClosePopup() {
  useEffect(() => {
    // Notify opener and close
    if (window.opener) {
      window.opener.postMessage({ type: "REAL_GOOGLE_AUTH_SUCCESS" }, "*");
    }
    window.close();
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0a", color: "white", fontFamily: "sans-serif" }}>
      <h2>Authentication successful. Closing window...</h2>
    </div>
  );
}
