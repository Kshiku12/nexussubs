"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import styles from "./page.module.css";
import extrasStyles from "./extras.module.css";
import { SubscriptionData } from "@/lib/gmail";
import { LogOut, RefreshCw, Smartphone, Plus, Mail, Trash2, Phone, X, PlayCircle, Music } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState(0);
  
  const [linkedEmails, setLinkedEmails] = useState<string[]>([]);
  const [linkedPhones, setLinkedPhones] = useState<string[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [showAddPhone, setShowAddPhone] = useState(false);

  const [rechargeModalOpen, setRechargeModalOpen] = useState<SubscriptionData | null>(null);
  const [selectedSub, setSelectedSub] = useState<SubscriptionData | null>(null);
  const [alerts, setAlerts] = useState<{type: "expired" | "expiring", message: string}[]>([]);
  const [alertsShown, setAlertsShown] = useState(false);

  // Removed handleMessage logic as we now use Google Identity Services directly

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load from local storage on mount
  useEffect(() => {
    const savedEmails = localStorage.getItem("nexus_linked_emails");
    if (savedEmails) {
      setLinkedEmails(JSON.parse(savedEmails));
    }
    const savedPhones = localStorage.getItem("nexus_linked_phones");
    if (savedPhones) {
      setLinkedPhones(JSON.parse(savedPhones));
    }
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: linkedEmails, phones: linkedPhones }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions);
        
        const total = data.subscriptions.reduce((acc: number, sub: SubscriptionData) => acc + (sub.amount || 0), 0);
        setTotalCost(total);

        // Calculate Expiration Alerts
        const newAlerts: {type: "expired" | "expiring", message: string}[] = [];
        data.subscriptions.forEach((sub: SubscriptionData) => {
          const due = new Date(sub.nextDueDate);
          const now = new Date();
          const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
          if (diffDays < 0) {
             newAlerts.push({ type: "expired", message: `${sub.serviceName} has expired! Please recharge it.`});
          } else if (diffDays <= 3) {
             newAlerts.push({ type: "expiring", message: `${sub.serviceName} is expiring in ${diffDays} day(s).`});
          }
        });
        if (newAlerts.length > 0 && !alertsShown) {
           setAlerts(newAlerts);
           setAlertsShown(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchSubscriptions();
    }
  }, [status, linkedEmails, linkedPhones]);

  const connectRealGoogle = async () => {
    try {
      const res = await fetch("/api/google-client-id");
      const { clientId } = await res.json();
      
      if (!clientId) {
        alert("Google Client ID not configured in the server!");
        return;
      }

      // @ts-ignore
      if (!window.google) {
        alert("Google Identity Services script is still loading or failed to load. Please try again in a moment.");
        return;
      }

      // @ts-ignore
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        callback: async (response: any) => {
          if (response.access_token) {
            try {
              // Fetch the email address tied to this access token
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${response.access_token}` }
              });
              const userInfo = await userInfoRes.json();
              const newEmail = userInfo.email;
              
              if (newEmail && !linkedEmails.includes(newEmail)) {
                const updatedEmails = [...linkedEmails, newEmail];
                setLinkedEmails(updatedEmails);
                localStorage.setItem("nexus_linked_emails", JSON.stringify(updatedEmails));
              }
            } catch (err) {
              console.error("Failed to get user info from Google", err);
            }
          }
        },
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      console.error("Failed to initialize Google Auth", err);
    }
  };

  const removeEmail = (emailToRemove: string) => {
    const updatedEmails = linkedEmails.filter(e => e !== emailToRemove);
    setLinkedEmails(updatedEmails);
    localStorage.setItem("nexus_linked_emails", JSON.stringify(updatedEmails));
  };

  const handleAddPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhone && !linkedPhones.includes(newPhone)) {
      const updatedPhones = [...linkedPhones, newPhone];
      setLinkedPhones(updatedPhones);
      localStorage.setItem("nexus_linked_phones", JSON.stringify(updatedPhones));
      setNewPhone("");
      setShowAddPhone(false);
    }
  };

  const removePhone = (phoneToRemove: string) => {
    const updatedPhones = linkedPhones.filter(p => p !== phoneToRemove);
    setLinkedPhones(updatedPhones);
    localStorage.setItem("nexus_linked_phones", JSON.stringify(updatedPhones));
  };

  if (status === "loading" || loading) {
    return <div className={styles.loadingState}><RefreshCw className={styles.spin} size={48} /><h2>Syncing with Nexus...</h2></div>;
  }

  const getMockUsage = (serviceName: string) => {
     const lower = serviceName.toLowerCase();
     
     // Cloud Storage
     if (lower.includes('icloud') || lower.includes('google one') || lower.includes('dropbox') || lower.includes('drive')) {
         return { 
           type: "Cloud",
           label: "Storage Used",
           value: "42 GB / 50 GB",
           percent: 84,
           recent: [],
           color: "#007AFF",
           icon: "Cloud",
           buttonText: "Manage Storage",
           url: "https://www.icloud.com",
           hint: "You are utilizing 84% of your cloud storage. Good value!"
         };
     }
     
     // Delivery
     if (lower.includes('swiggy') || lower.includes('zomato') || lower.includes('dash')) {
         return { 
           type: "Delivery",
           label: "Orders this Month",
           value: "8 Orders",
           percent: 60,
           recent: [],
           color: "#FC8019",
           icon: "ShoppingBag",
           buttonText: "Order Food",
           url: lower.includes('swiggy') ? "https://www.swiggy.com" : "https://www.zomato.com",
           hint: "You've saved roughly ₹400 in delivery fees this month!"
         };
     }

     // Video
     if (lower.includes('netflix') || lower.includes('prime') || lower.includes('hotstar') || lower.includes('zee5') || lower.includes('disney')) {
         const h = Math.floor(Math.random() * 40) + 10;
         return { 
           type: "Video",
           label: "Watch Time",
           value: `${h} hrs/month`,
           percent: Math.min((h/50)*100, 100),
           recent: ["The Boys", "Stranger Things", "Gen V"],
           color: "#E50914",
           icon: "Tv",
           buttonText: "Start Watching",
           url: `https://www.${lower.replace(/ /g, '')}.com`,
           hint: "You are using this service actively. Excellent value for money!"
         };
     }
     
     // Audio
     if (lower.includes('spotify') || lower.includes('music') || lower.includes('apple')) {
         const h = Math.floor(Math.random() * 60) + 20;
         return { 
           type: "Audio",
           label: "Listen Time",
           value: `${h} hrs/month`,
           percent: Math.min((h/100)*100, 100),
           recent: ["Daily Mix 1", "Top 50 Global", "Discover Weekly"],
           color: "#1DB954",
           icon: "Music",
           buttonText: "Listen Now",
           url: lower.includes('spotify') ? "https://open.spotify.com" : "https://music.apple.com",
           hint: "You are using this service actively. Excellent value for money!"
         };
     }
     
     // Gaming
     if (lower.includes('xbox') || lower.includes('playstation') || lower.includes('game')) {
         const h = Math.floor(Math.random() * 30) + 5;
         return { 
           type: "Gaming",
           label: "Hours Played",
           value: `${h} hrs/month`,
           percent: Math.min((h/40)*100, 100),
           recent: [],
           color: "#107C10",
           icon: "Gamepad2",
           buttonText: "Browse Games",
           url: "https://www.xbox.com/xbox-game-pass",
           hint: "You've played a solid amount this month!"
         };
     }
     
     // General
     return { 
       type: "General",
       label: "App Usage",
       value: "Active",
       percent: 100,
       recent: [],
       color: "#8A2BE2",
       icon: "Activity",
       buttonText: "Visit Website",
       url: `https://www.google.com/search?q=${lower}`,
       hint: "Your subscription is currently active and in good standing."
     };
  };

  const getLogoUrl = (serviceName: string) => {
    const lower = serviceName.toLowerCase();
    let domain = `${lower.replace(/ /g, '')}.com`;
    
    if (lower.includes("netflix")) domain = "netflix.com";
    else if (lower.includes("prime")) domain = "primevideo.com";
    else if (lower.includes("swiggy")) domain = "swiggy.in";
    else if (lower.includes("xbox")) domain = "xbox.com";
    else if (lower.includes("hotstar")) domain = "hotstar.com";
    else if (lower.includes("zee5")) domain = "zee5.com";
    else if (lower.includes("spotify")) domain = "spotify.com";
    else if (lower.includes("icloud")) domain = "icloud.com";
    else if (lower.includes("apple music")) domain = "music.apple.com";
    else if (lower.includes("apple")) domain = "apple.com";
    
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Welcome, <span className={styles.highlight}>{session?.user?.name?.split(' ')[0] || 'User'}</span></h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/explore" className="btn-primary" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            Explore Database
          </Link>
          <button className="btn-secondary" onClick={() => fetchSubscriptions()}>
            <RefreshCw size={18} /> Refresh Data
          </button>
          <button className="btn-secondary" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <div className={styles.summaryStats}>
        <div className={`glass-card ${styles.statCard}`}>
          <h3>Total Monthly Spend</h3>
          <p className={styles.statValue}>₹{totalCost}</p>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <h3>Active Subs</h3>
          <p className={styles.statValue}>{subscriptions.length}</p>
        </div>
        
        <div className={`glass-card ${styles.linkedAccountsCard}`}>
           <div className={styles.linkedHeader}>
             <h3>Linked Gmail Accounts</h3>
             <button className={styles.googleConnectBtn} onClick={connectRealGoogle}>
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width="16" height="16" />
               Connect
             </button>
           </div>
           
           <ul className={styles.emailList}>
             {session?.user?.email && (
               <li className={styles.emailItem}>
                 <div><Mail size={16} /> {session.user.email} (Primary)</div>
               </li>
             )}
             {linkedEmails.map(email => (
               <li key={email} className={styles.emailItem}>
                 <div><Mail size={16} /> {email}</div>
                 <button className={styles.removeBtn} onClick={() => removeEmail(email)} title="Remove Account">
                   <Trash2 size={16} />
                 </button>
               </li>
             ))}
             {!session?.user?.email && linkedEmails.length === 0 && (
               <li className={styles.emptyEmail}>No accounts linked</li>
             )}
           </ul>
        </div>

        <div className={`glass-card ${styles.linkedAccountsCard}`}>
           <div className={styles.linkedHeader}>
             <h3>Linked Mobile Numbers</h3>
             <button className={styles.iconBtn} onClick={() => setShowAddPhone(!showAddPhone)}>
               <Plus size={20} />
             </button>
           </div>
           
           {showAddPhone && (
             <form onSubmit={handleAddPhone} className={styles.addEmailForm}>
               <input 
                 type="tel" 
                 placeholder="Enter mobile number" 
                 value={newPhone}
                 onChange={(e) => setNewPhone(e.target.value)}
                 className={styles.emailInput}
                 required
               />
               <button type="submit" className="btn-primary" style={{padding: '8px 16px', fontSize: '0.9rem'}}>Add</button>
             </form>
           )}

           <ul className={styles.emailList}>
             {linkedPhones.map(phone => (
               <li key={phone} className={styles.emailItem}>
                 <div><Phone size={16} /> {phone}</div>
                 <button className={styles.removeBtn} onClick={() => removePhone(phone)} title="Remove Phone">
                   <Trash2 size={16} />
                 </button>
               </li>
             ))}
             {linkedPhones.length === 0 && (
               <li className={styles.emptyEmail}>No phone numbers linked</li>
             )}
           </ul>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Your Active Subscriptions</h2>
      
      {subscriptions.length === 0 ? (
        <div className={`glass-card ${styles.emptyState}`}>
          <p>No active subscriptions found. Link an account or phone number above to start scanning.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {subscriptions.map((sub, index) => (
            <div key={sub.id} className={`glass-card ${styles.serviceCard}`} style={{animationDelay: `${index * 0.1}s`}}>
               <div className={styles.serviceHeader} onClick={() => setSelectedSub(sub)} style={{cursor: 'pointer'}}>
                  <img 
                    src={getLogoUrl(sub.serviceName)} 
                    alt={sub.serviceName} 
                    className={styles.serviceAvatar}
                    onError={(e) => { (e.target as any).style.display = 'none'; (e.target as any).nextSibling.style.display = 'flex'; }}
                  />
                  <div className={extrasStyles.fallbackAvatar} style={{display: 'none'}}>
                     {sub.serviceName.charAt(0)}
                  </div>
                  <h3>{sub.serviceName}</h3>
               </div>
               
               <div className={styles.serviceDetails} onClick={() => setSelectedSub(sub)} style={{cursor: 'pointer'}}>
                  <div className={styles.detailRow}>
                    <span>Account</span>
                    <span className={styles.accountText} title={sub.account}>{sub.account}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Next Due</span>
                    <span className={styles.dueHighlight}>{sub.nextDueDate}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Amount</span>
                    <span>₹{sub.amount}</span>
                  </div>
               </div>
               
               <div className={extrasStyles.cardFooter}>
                 {new Date(sub.nextDueDate).getTime() < new Date().getTime() ? (
                   <span className={styles.activePill} style={{background: 'rgba(255, 69, 58, 0.2)', color: '#ff453a'}}>Expired</span>
                 ) : (
                   <span className={styles.activePill}>Active</span>
                 )}
                 <button 
                   className="btn-secondary" 
                   style={{padding: '6px 12px', fontSize: '0.85rem'}}
                   onClick={(e) => { e.stopPropagation(); setRechargeModalOpen(sub); }}
                 >
                   Recharge
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      <h2 className={styles.sectionTitle} style={{ marginTop: '48px' }}>Discover Subscriptions</h2>
      <div className={styles.grid}>
         {[
           { name: "Netflix", price: "₹199/mo", type: "Video", color: "#E50914", url: "https://www.netflix.com/signup", icon: "https://www.google.com/s2/favicons?domain=netflix.com&sz=128" },
           { name: "Spotify Premium", price: "₹119/mo", type: "Audio", color: "#1DB954", url: "https://www.spotify.com/premium/", icon: "https://www.google.com/s2/favicons?domain=spotify.com&sz=128" },
           { name: "Amazon Prime", price: "₹299/mo", type: "Video", color: "#00A8E1", url: "https://www.primevideo.com/offers", icon: "https://www.google.com/s2/favicons?domain=primevideo.com&sz=128" },
           { name: "Zee5 Premium", price: "₹99/mo", type: "Video", color: "#8230C6", url: "https://www.zee5.com/myaccount/subscription", icon: "https://www.google.com/s2/favicons?domain=zee5.com&sz=128" },
           { name: "SonyLIV", price: "₹299/mo", type: "Video", color: "#FF9900", url: "https://www.sonyliv.com/subscription", icon: "https://www.google.com/s2/favicons?domain=sonyliv.com&sz=128" },
           { name: "EA Play", price: "₹315/mo", type: "Gaming", color: "#FF4747", url: "https://www.ea.com/ea-play", icon: "https://www.google.com/s2/favicons?domain=ea.com&sz=128" },
         ].map((suggested, idx) => (
           <div key={idx} className={`glass-card ${styles.serviceCard}`}>
              <div className={styles.serviceHeader}>
                 <img src={suggested.icon} alt={suggested.name} className={styles.serviceAvatar} />
                 <div>
                   <h3>{suggested.name}</h3>
                   <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{suggested.type}</span>
                 </div>
              </div>
              <div className={styles.serviceDetails}>
                 <div className={styles.detailRow}>
                   <span>Starting at</span>
                   <span style={{ color: suggested.color, fontWeight: 'bold' }}>{suggested.price}</span>
                 </div>
              </div>
              <div className={extrasStyles.cardFooter}>
                 <button 
                   className="btn-primary" 
                   style={{ width: '100%', padding: '8px', background: suggested.color }}
                   onClick={() => window.open(suggested.url, "_blank")}
                 >
                   Get Subscription
                 </button>
              </div>
           </div>
         ))}
      </div>

      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />

      {alerts.length > 0 && (
        <div className={extrasStyles.alertOverlay}>
           <div className={extrasStyles.alertBox}>
              <h3>⚠️ Subscription Alerts</h3>
              <ul>
                 {alerts.map((a, i) => (
                   <li key={i} className={a.type === 'expired' ? extrasStyles.alertExpired : extrasStyles.alertExpiring}>
                     {a.message}
                   </li>
                 ))}
              </ul>
              <button className="btn-primary" onClick={() => setAlerts([])}>Dismiss</button>
           </div>
        </div>
      )}

      {rechargeModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeModalBtn} onClick={() => setRechargeModalOpen(null)}><X size={20} /></button>
            <h2>Recharge {rechargeModalOpen.serviceName}</h2>
            <p>Amount: ₹{rechargeModalOpen.amount}</p>
            <div className={extrasStyles.paymentMethods}>
               <button onClick={() => { alert(`Redirecting to Paytm to pay ₹${rechargeModalOpen.amount}...`); setRechargeModalOpen(null); }}>Pay with Paytm</button>
               <button onClick={() => { alert(`Redirecting to UPI Gateway for ₹${rechargeModalOpen.amount}...`); setRechargeModalOpen(null); }}>Pay with UPI</button>
               <button onClick={() => { alert(`Redirecting to Card Payment for ₹${rechargeModalOpen.amount}...`); setRechargeModalOpen(null); }}>Pay with Card</button>
            </div>
          </div>
        </div>
      )}

      {selectedSub && (
        <div className={styles.modalOverlay} onClick={() => setSelectedSub(null)}>
          <div className={extrasStyles.vastModalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setSelectedSub(null)}><X size={20} /></button>
            
            <div className={extrasStyles.vastHero} style={{ background: `linear-gradient(135deg, rgba(20,20,25,0.9), rgba(0,0,0,0.9))` }}>
               <img src={getLogoUrl(selectedSub.serviceName)} className={extrasStyles.vastLogo} />
               <div className={extrasStyles.vastHeroText}>
                  <h2>{selectedSub.serviceName}</h2>
                  <span className={extrasStyles.vastStatus}>Active Subscription</span>
               </div>
            </div>

            <div className={extrasStyles.vastBody}>
               <div className={extrasStyles.vastRow}>
                  <div className={extrasStyles.vastMetric}>
                     <span className={extrasStyles.metricLabel}>Monthly Cost</span>
                     <span className={extrasStyles.metricValue}>₹{selectedSub.amount}</span>
                  </div>
                  <div className={extrasStyles.vastMetric}>
                     <span className={extrasStyles.metricLabel}>Next Billing</span>
                     <span className={extrasStyles.metricValue} style={{color: 'var(--accent-danger)'}}>{selectedSub.nextDueDate}</span>
                  </div>
               </div>

               <div className={extrasStyles.vastSection}>
                  <h3>Usage Analytics</h3>
                  <div className={extrasStyles.analyticsCard}>
                     <div className={extrasStyles.progressHeader}>
                        <span>{getMockUsage(selectedSub.serviceName).label}</span>
                        <span>{getMockUsage(selectedSub.serviceName).value}</span>
                     </div>
                     <div className={extrasStyles.progressBar}>
                        <div className={extrasStyles.progressFill} style={{ width: `${getMockUsage(selectedSub.serviceName).percent}%`, background: getMockUsage(selectedSub.serviceName).color }}></div>
                     </div>
                     <p className={extrasStyles.analyticsHint}>{getMockUsage(selectedSub.serviceName).hint}</p>
                  </div>
               </div>

               {['Video', 'Audio'].includes(getMockUsage(selectedSub.serviceName).type) && (
                 <div className={extrasStyles.vastSection}>
                    <h3>Recently {getMockUsage(selectedSub.serviceName).type === 'Audio' ? 'Listened' : 'Watched'}</h3>
                    <div className={extrasStyles.recentList}>
                       {getMockUsage(selectedSub.serviceName).recent.map((item, idx) => (
                          <div key={idx} className={extrasStyles.recentItemClean}>
                             <div className={extrasStyles.recentIconBlock} style={{ background: `${getMockUsage(selectedSub.serviceName).color}22`, color: getMockUsage(selectedSub.serviceName).color }}>
                                {getMockUsage(selectedSub.serviceName).type === 'Audio' ? <Music size={28} /> : <PlayCircle size={28} />}
                             </div>
                             <span>{item}</span>
                          </div>
                       ))}
                    </div>
                 </div>
               )}
               
               <button 
                  className={extrasStyles.vastAppBtn} 
                  style={{ background: getMockUsage(selectedSub.serviceName).color }}
                  onClick={() => window.open(getMockUsage(selectedSub.serviceName).url, "_blank")}
               >
                  {getMockUsage(selectedSub.serviceName).buttonText}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
