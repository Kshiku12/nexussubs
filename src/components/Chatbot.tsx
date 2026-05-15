"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, CheckCircle, Star, Clapperboard, Loader2, Tv, Gamepad2, Paperclip, Image as ImageIcon, Search, Sparkles } from "lucide-react";
import styles from "./Chatbot.module.css";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  imagePreview?: string;
  action?: {
    type: "cancel_subscription" | "recommend_media" | "identify_media";
    data?: any;
  };
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your NexusSubs AI Assistant. I can help you manage your subscriptions, cancel them, or recommend movies and games based on your mood. How can I help you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  const [showRecPopup, setShowRecPopup] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [streamingData, setStreamingData] = useState<any[]>([]);
  const [loadingStreaming, setLoadingStreaming] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string>("");
  const [showIdentifyPopup, setShowIdentifyPopup] = useState(false);
  const [identifiedItems, setIdentifiedItems] = useState<any[]>([]);
  const [identifyLoading, setIdentifyLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!mounted) return null;

  const fetchDetails = async (item: any) => {
    setSelectedMedia(item);
    setLoadingDetails(true);
    setStreamingData([]);
    
    try {
      // Fetch full plot and details from OMDB
      const apiKey = localStorage.getItem("nexus_omdb_key") || "mock_key"; 
      const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey === "mock_key" ? "c0379201" : apiKey}&i=${item.id}&plot=full`);
      const data = await res.json();
      
      if (data.Response === "True") {
        setSelectedMedia((prev: any) => ({
          ...prev,
          description: data.Plot && data.Plot !== "N/A" ? data.Plot : item.aiDesc,
          genre: data.Genre,
          score: data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : item.aiRating,
          director: data.Director,
          cast: data.Actors,
          backdrop: item.poster
        }));
      } else {
        // Fallback to AI-generated data if OMDB fails
        setSelectedMedia((prev: any) => ({
          ...prev,
          description: item.aiDesc,
          score: item.aiRating,
          backdrop: item.poster
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchStreaming = async (item: any) => {
    setLoadingStreaming(true);
    
    if (item.type?.toLowerCase() === 'game') {
      setStreamingData([
         { name: "Steam", url: `https://store.steampowered.com/search/?term=${encodeURIComponent(item.title)}` },
         { name: "Epic Games", url: `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(item.title)}` },
         { name: "PlayStation Store", url: `https://store.playstation.com/en-us/search/${encodeURIComponent(item.title)}` },
         { name: "Xbox", url: `https://www.xbox.com/en-US/Search?q=${encodeURIComponent(item.title)}` }
      ]);
      setLoadingStreaming(false);
      return;
    }

    try {
      const res = await fetch(`https://imdb.iamidiotareyoutoo.com/justwatch?q=${encodeURIComponent(item.title)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.description && data.description.length > 0) {
          const match = data.description[0];
          if (match.offers) {
            const unique: Record<string, string> = {};
            match.offers.forEach((o: any) => { if (!unique[o.name] && o.url) unique[o.name] = o.url; });
            setStreamingData(Object.keys(unique).map(k => ({ name: k, url: unique[k] })));
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStreaming(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB.');
      return;
    }
    setAttachedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = () => {
    setAttachedImage(null);
    setAttachedFileName('');
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedImage) return;

    const userText = input.trim();
    const imageToSend = attachedImage;
    setInput("");
    setAttachedImage(null);
    setAttachedFileName('');
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText || (imageToSend ? '🔍 Identify this screenshot' : ''),
      sender: "user",
      imagePreview: imageToSend || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText || 'What movie or game is this from?', image: imageToSend || undefined }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.text,
          sender: "bot",
          action: data.action,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble connecting to my brain right now.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (action: any) => {
    if (action.type === "cancel_subscription") {
       alert(`Simulating OFFICIAL cancellation for: ${action.data.services.join(", ")}\nA confirmation SMS/Email has been sent to your registered contacts.`);
    } else if (action.type === "recommend_media") {
       const rawItems = action.data.items || [];
       const items: any[] = Array.from(new Map(rawItems.map((item: any) => [item.title.toLowerCase(), item])).values());
       
       setShowRecPopup(true);
       setIsFetchingRecs(true);
       setRecommendations([]);
       
       const rawgKey = localStorage.getItem("nexus_rawg_key");
       
       try {
         const fetchedItems = [];
          for (const item of items) {
             try {
               if (item.type === "game") {
                 let gData = null;
                 try {
                   const gameRes = await fetch(`https://api.rawg.io/api/games?key=${rawgKey || 'c542e67aec3a4340908f9d9e86032542'}&search=${encodeURIComponent(item.title)}&page_size=1`);
                   if (gameRes.ok) gData = await gameRes.json();
                 } catch (e) {
                   console.warn("RAWG fetch blocked or failed, trying IMDb fallback.");
                   try {
                     const imdbRes = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(item.title + " video game")}`);
                     if (imdbRes.ok) {
                       const imdbData = await imdbRes.json();
                       if (imdbData.ok && imdbData.description && imdbData.description.length > 0) {
                         const m = imdbData.description[0];
                         gData = { results: [{ id: m["#IMDB_ID"], name: m["#TITLE"], released: m["#YEAR"], background_image: m["#IMG_POSTER"], genres: [{ name: "Game" }] }] };
                       }
                     }
                   } catch (ie) {}
                 }
                 
                 if (gData && gData.results && gData.results.length > 0) {
                   const g = gData.results[0];
                   fetchedItems.push({
                     id: g.id.toString(),
                     title: g.name || item.title,
                     year: g.released ? g.released.split("-")[0] : "N/A",
                     poster: g.background_image || "https://via.placeholder.com/300x450?text=No+Poster",
                     actors: g.genres?.map((ge: any) => ge.name).join(", ") || "Game",
                     type: "game",
                     aiDesc: item.description || item.desc,
                     aiRating: item.rating || (g.metacritic ? `${g.metacritic}/100` : "N/A")
                   });
                 } else {
                   fetchedItems.push({
                     id: Math.random().toString(),
                     title: item.title,
                     year: "N/A",
                     poster: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop",
                     actors: "Video Game",
                     type: "game",
                     aiDesc: item.description || item.desc,
                     aiRating: item.rating
                   });
                 }
               } else {
                 let mData = null;
                 try {
                   const res = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(item.title)}`);
                   if (res.ok) mData = await res.json();
                 } catch (e) {
                   console.warn("IMDb fetch blocked or failed.");
                 }

                 if (mData && mData.ok && mData.description && mData.description.length > 0) {
                   const m = mData.description[0];
                   fetchedItems.push({
                     id: m["#IMDB_ID"] || Math.random().toString(),
                     title: m["#TITLE"] || item.title,
                     year: m["#YEAR"] || "N/A",
                     poster: m["#IMG_POSTER"] || "https://via.placeholder.com/300x450?text=No+Poster",
                     actors: m["#ACTORS"] || "N/A",
                     type: "movie",
                     aiDesc: item.description || item.desc,
                     aiRating: item.rating
                   });
                 } else {
                   fetchedItems.push({
                     id: Math.random().toString(),
                     title: item.title,
                     year: "N/A",
                     poster: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop",
                     actors: "N/A",
                     type: "movie",
                     aiDesc: item.description || item.desc,
                     aiRating: item.rating
                   });
                 }
               }
             } catch (e) {
               console.error(`Error processing ${item.title}`, e);
               // FINAL SAFETY PUSH: If everything fails, use the item's original data
               fetchedItems.push({
                 id: Math.random().toString(),
                 title: item.title,
                 year: "N/A",
                 poster: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop",
                 actors: item.type === "game" ? "Video Game" : "Movie",
                 type: item.type || "movie",
                 aiDesc: item.description || item.desc,
                 aiRating: item.rating
               });
             }
          }
          setRecommendations(fetchedItems);
       } catch (err) {
         console.error("Failed to fetch recommendations", err);
       } finally {
         setIsFetchingRecs(false);
       }
    } else if (action.type === "identify_media") {
       const rawItems = action.data?.items || [];
       if (rawItems.length === 0) return;
       
       setShowIdentifyPopup(true);
       setIdentifyLoading(true);
       setIdentifiedItems([]);
       
       const rawgKey = localStorage.getItem("nexus_rawg_key");
       
       try {
         const fetchedItems = [];
         for (const item of rawItems) {
           try {
             const isGame = item.type === "game";
             if (isGame) {
               let gData = null;
               try {
                 const gameRes = await fetch(`https://api.rawg.io/api/games?key=${rawgKey || 'c542e67aec3a4340908f9d9e86032542'}&search=${encodeURIComponent(item.title)}&page_size=1`);
                 if (gameRes.ok) gData = await gameRes.json();
               } catch (e) {
                 try {
                   const imdbRes = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(item.title + " video game")}`);
                   if (imdbRes.ok) {
                     const imdbData = await imdbRes.json();
                     if (imdbData.ok && imdbData.description?.length > 0) {
                       const m = imdbData.description[0];
                       gData = { results: [{ id: m["#IMDB_ID"], name: m["#TITLE"], released: m["#YEAR"], background_image: m["#IMG_POSTER"], genres: [{ name: "Game" }] }] };
                     }
                   }
                 } catch (ie) {}
               }
               if (gData?.results?.length > 0) {
                 const g = gData.results[0];
                 fetchedItems.push({ id: g.id?.toString() || Math.random().toString(), title: g.name || item.title, year: g.released ? g.released.split("-")[0] : item.year || "N/A", poster: g.background_image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop", actors: g.genres?.map((ge: any) => ge.name).join(", ") || "Video Game", type: "game", aiDesc: item.description, aiRating: item.rating, confidence: item.confidence });
               } else {
                 fetchedItems.push({ id: Math.random().toString(), title: item.title, year: item.year || "N/A", poster: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop", actors: "Video Game", type: "game", aiDesc: item.description, aiRating: item.rating, confidence: item.confidence });
               }
             } else {
               let mData = null;
               try {
                 const res = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(item.title)}`);
                 if (res.ok) mData = await res.json();
               } catch (e) {}
               if (mData?.ok && mData.description?.length > 0) {
                 const m = mData.description[0];
                 fetchedItems.push({ id: m["#IMDB_ID"] || Math.random().toString(), title: m["#TITLE"] || item.title, year: m["#YEAR"] || item.year || "N/A", poster: m["#IMG_POSTER"] || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop", actors: m["#ACTORS"] || "N/A", type: item.type === "tv_show" ? "movie" : (item.type || "movie"), aiDesc: item.description, aiRating: item.rating, confidence: item.confidence });
               } else {
                 fetchedItems.push({ id: Math.random().toString(), title: item.title, year: item.year || "N/A", poster: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop", actors: "N/A", type: item.type || "movie", aiDesc: item.description, aiRating: item.rating, confidence: item.confidence });
               }
             }
           } catch (e) {
             fetchedItems.push({ id: Math.random().toString(), title: item.title, year: item.year || "N/A", poster: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop", actors: item.type === "game" ? "Video Game" : "Movie", type: item.type || "movie", aiDesc: item.description, aiRating: item.rating, confidence: item.confidence });
           }
         }
         setIdentifiedItems(fetchedItems);
       } catch (err) {
         console.error("Failed to fetch identification results", err);
       } finally {
         setIdentifyLoading(false);
       }
    }
  };

  return (
    <div className={styles.chatbotWrapper}>
      {!isOpen && (
        <button className={styles.chatButton} onClick={() => setIsOpen(true)}>
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <div className={styles.statusIndicator}></div>
              <h3>Nexus AI</h3>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${
                  msg.sender === "user" ? styles.userMessage : styles.botMessage
                }`}
              >
                {msg.imagePreview && (
                  <div className={styles.msgImagePreview}>
                    <img src={msg.imagePreview} alt="Attached" className={styles.msgImage} />
                  </div>
                )}
                {msg.text}
                
                {msg.action && (
                  <div className={styles.toolCard}>
                    {msg.action.type === "cancel_subscription" && (
                       <>
                         <h4><CheckCircle size={16} /> Cancellation Request</h4>
                         <p style={{fontSize: '0.8rem', margin: '0 0 8px 0'}}>Services: {msg.action.data.services?.join(", ")}</p>
                         <button className={styles.toolActionBtn} onClick={() => executeAction(msg.action)}>
                           Confirm Cancellation
                         </button>
                       </>
                    )}
                    {msg.action.type === "recommend_media" && (
                       <>
                         <h4><Bot size={16} /> Media Recommendation</h4>
                         <p style={{fontSize: '0.8rem', margin: '0 0 8px 0'}}>Topic: {msg.action.data.query}</p>
                         <button className={styles.toolActionBtn} onClick={() => executeAction(msg.action)}>
                           View Recommendations
                         </button>
                       </>
                    )}
                    {msg.action.type === "identify_media" && (
                       <>
                         <h4><Sparkles size={16} /> Media Identified</h4>
                         {msg.action.data?.items?.length > 0 ? (
                           <>
                             <p style={{fontSize: '0.8rem', margin: '0 0 8px 0'}}>
                               Found {msg.action.data.items.length} match{msg.action.data.items.length > 1 ? 'es' : ''}
                             </p>
                             <button className={styles.toolActionBtn} onClick={() => executeAction(msg.action)}>
                               <Search size={14} style={{marginRight: '6px'}} /> View Details & Lookup
                             </button>
                           </>
                         ) : (
                           <p style={{fontSize: '0.8rem', margin: '0', color: 'var(--text-secondary)'}}>Could not identify. Try a clearer screenshot.</p>
                         )}
                       </>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.loadingMessage}`}>
                <Bot size={16} />
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {attachedImage && (
            <div className={styles.attachmentPreview}>
              <img src={attachedImage} alt="Preview" className={styles.attachThumb} />
              <div className={styles.attachInfo}>
                <ImageIcon size={14} />
                <span>{attachedFileName || 'Image'}</span>
              </div>
              <button className={styles.attachRemove} onClick={removeAttachment}>
                <X size={14} />
              </button>
            </div>
          )}

          <div className={styles.inputArea}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <button
              className={styles.attachBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Attach screenshot to identify a movie or game"
            >
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              className={styles.input}
              placeholder={attachedImage ? 'Add a message or send to identify...' : 'Ask me anything...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={(!input.trim() && !attachedImage) || isLoading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {showRecPopup && (
        <div className={styles.recPopupOverlay} onClick={() => setShowRecPopup(false)}>
          <div className={styles.recPopupContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.recPopupHeader}>
              <h4>
                {recommendations[0]?.type?.toLowerCase() === "game" ? <Bot size={20} /> : <Clapperboard size={20} />}
                {recommendations[0]?.type?.toLowerCase() === "game" ? " Game Recommendations" : " Movie Recommendations"}
              </h4>
              <button className={styles.closeBtn} onClick={() => setShowRecPopup(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.recGrid}>
              {isFetchingRecs ? (
                <div className={styles.loadingRecs}>
                  <Loader2 className={styles.spin} size={40} color="var(--accent-primary)" />
                  <p>Nexus AI is hand-picking for you...</p>
                </div>
              ) : recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div key={rec.id} className={styles.recCard} onClick={() => fetchDetails(rec)}>
                    <div className={styles.recPosterWrapper}>
                      <img 
                        src={`/api/proxy-image?url=${encodeURIComponent(rec.poster)}`} 
                        alt={rec.title} 
                        className={styles.recPoster} 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop"; 
                        }}
                      />
                    </div>
                    <div className={styles.recInfo}>
                      <h5 className={styles.recTitle}>{rec.title}</h5>
                      <div className={styles.recMeta}>
                        <span>{rec.year}</span>
                        <span style={{color: '#ffd700', display: 'flex', alignItems: 'center', gap: '4px'}}><Star size={14} fill="#ffd700" /> Highly Recommended</span>
                      </div>
                      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                        {rec.actors}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.loadingRecs}>
                  <p>No specific matches found. Try a different query!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedMedia && (
        <div className={styles.detailsOverlay} onClick={() => setSelectedMedia(null)}>
          <div className={styles.detailsContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} style={{position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px'}} onClick={() => setSelectedMedia(null)}>
              <X size={24} />
            </button>
            
            <div className={styles.detailsHero}>
              <img 
                src={`/api/proxy-image?url=${encodeURIComponent(selectedMedia.backdrop || selectedMedia.poster)}`} 
                alt={selectedMedia.title} 
                className={styles.detailsBackdrop}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&h=600&auto=format&fit=crop";
                }}
              />
              <div className={styles.detailsHeroGradient}></div>
            </div>
            
            <div className={styles.detailsBody}>
              <div className={styles.detailsPosterSide}>
                <img 
                  src={`/api/proxy-image?url=${encodeURIComponent(selectedMedia.poster)}`} 
                  alt={selectedMedia.title} 
                  className={styles.detailsMainPoster} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop";
                  }}
                />
              </div>
              
              <div className={styles.detailsBody}>
                <h2 className={styles.detailsTitle}>{selectedMedia.title}</h2>
                <div className={styles.detailsMeta}>
                  <span>{selectedMedia.year}</span>
                  <span>•</span>
                  <span>{selectedMedia.type?.toLowerCase() === 'game' ? 'Video Game' : (selectedMedia.genre || 'Movie')}</span>
                  {selectedMedia.score && (
                    <>
                      <span>•</span>
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#ffd700'}}>
                        <Star size={16} fill="#ffd700" /> {selectedMedia.score}
                      </div>
                    </>
                  )}
                </div>

                {loadingDetails ? (
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--accent-primary)'}}>
                    <Loader2 className={styles.spin} size={20} />
                    <span>Fetching cinematic data...</span>
                  </div>
                ) : (
                  <p className={styles.detailsDescription}>{selectedMedia.description}</p>
                )}

                {!streamingData.length && !loadingStreaming ? (
                  <button 
                    className="btn-primary" 
                    style={{width: '100%', marginTop: '10px'}}
                    onClick={() => fetchStreaming(selectedMedia)}
                  >
                    {selectedMedia.type?.toLowerCase() === 'game' ? <Gamepad2 size={18} style={{marginRight: '8px'}}/> : <Tv size={18} style={{marginRight: '8px'}}/>}
                    {selectedMedia.type?.toLowerCase() === 'game' ? ' Find Where to Play' : ' Find Where to Watch'}
                  </button>
                ) : loadingStreaming ? (
                  <div style={{textAlign: 'center', padding: '20px'}}>
                    <Loader2 className={styles.spin} size={24} color="var(--accent-primary)" />
                    <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '10px'}}>
                      {selectedMedia.type?.toLowerCase() === 'game' ? 'Scanning gaming platforms...' : 'Scanning global streaming platforms...'}
                    </p>
                  </div>
                ) : (
                  <div style={{marginTop: '20px'}}>
                    <h4 style={{marginBottom: '10px', fontSize: '0.9rem', color: 'var(--accent-primary)'}}>
                      {selectedMedia.type?.toLowerCase() === 'game' ? 'Available on:' : 'Stream on:'}
                    </h4>
                    <div className={styles.platformsGrid}>
                      {streamingData.map((p, i) => {
                        let domain = 'google.com';
                        const n = p.name.toLowerCase();
                        if (n.includes('netflix')) domain = 'netflix.com';
                        else if (n.includes('prime') || n.includes('amazon')) domain = 'primevideo.com';
                        else if (n.includes('disney') || n.includes('hotstar')) domain = 'hotstar.com';
                        else if (n.includes('apple') || n.includes('itunes')) domain = 'tv.apple.com';
                        else if (n.includes('hulu')) domain = 'hulu.com';
                        else if (n.includes('hbo') || n.includes('max')) domain = 'max.com';
                        else if (n.includes('jiocinema') || n.includes('jio')) domain = 'jiocinema.com';
                        else if (n.includes('zee5')) domain = 'zee5.com';
                        else if (n.includes('sonyliv')) domain = 'sonyliv.com';
                        else if (n.includes('youtube')) domain = 'youtube.com';
                        else if (n.includes('google')) domain = 'play.google.com';
                        else if (n.includes('lionsgate')) domain = 'lionsgateplay.com';
                        else if (n.includes('mubi')) domain = 'mubi.com';
                        else if (n.includes('vudu')) domain = 'vudu.com';
                        else if (n.includes('paramount')) domain = 'paramountplus.com';
                        else if (n.includes('crunchyroll')) domain = 'crunchyroll.com';
                        else if (n.includes('steam')) domain = 'steampowered.com';
                        else if (n.includes('epic')) domain = 'epicgames.com';
                        else if (n.includes('playstation')) domain = 'playstation.com';
                        else if (n.includes('xbox')) domain = 'xbox.com';
                        
                        return (
                          <a key={i} href={p.url} target="_blank" rel="noreferrer" className={styles.platformBtn}>
                            <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt={p.name} className={styles.platformIcon} />
                            <span>{p.name}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showIdentifyPopup && (
        <div className={styles.recPopupOverlay} onClick={() => setShowIdentifyPopup(false)}>
          <div className={styles.recPopupContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.recPopupHeader}>
              <h4>
                <Sparkles size={20} />
                {' Visual Lookup Results'}
              </h4>
              <button className={styles.closeBtn} onClick={() => setShowIdentifyPopup(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.recGrid}>
              {identifyLoading ? (
                <div className={styles.loadingRecs}>
                  <Loader2 className={styles.spin} size={40} color="var(--accent-primary)" />
                  <p>Searching databases for matches...</p>
                </div>
              ) : identifiedItems.length > 0 ? (
                identifiedItems.map((rec) => (
                  <div key={rec.id} className={styles.recCard} onClick={() => fetchDetails(rec)}>
                    <div className={styles.recPosterWrapper}>
                      <img 
                        src={`/api/proxy-image?url=${encodeURIComponent(rec.poster)}`} 
                        alt={rec.title} 
                        className={styles.recPoster} 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=450&auto=format&fit=crop"; 
                        }}
                      />
                    </div>
                    <div className={styles.recInfo}>
                      <h5 className={styles.recTitle}>{rec.title}</h5>
                      <div className={styles.recMeta}>
                        <span>{rec.year}</span>
                        {rec.confidence && (
                          <span className={styles.confidenceBadge} data-level={rec.confidence}>
                            {rec.confidence === 'high' ? '🎯' : rec.confidence === 'medium' ? '🔍' : '❓'} {rec.confidence} confidence
                          </span>
                        )}
                      </div>
                      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                        {rec.actors || rec.type}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.loadingRecs}>
                  <p>No matches found. Try a different screenshot!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
