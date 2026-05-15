"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { Search, Star, Clapperboard, Gamepad2, Settings, X, Tv, ArrowLeft } from "lucide-react";
import { MediaType, MediaItem, mockMovies, mockGames, searchMockData } from "@/lib/mockDatabase";

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className={styles.loadingState}><div className={styles.spin}><Settings size={40} /></div><h3>Loading...</h3></div>}>
      <ExploreContent />
    </Suspense>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [activeTab, setActiveTab] = useState<MediaType>("movie");
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStreamingOptions, setShowStreamingOptions] = useState(false);
  const [streamingData, setStreamingData] = useState<{name: string, url: string}[]>([]);
  const [loadingStreaming, setLoadingStreaming] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Custom API Keys for power users
  const [omdbKey, setOmdbKey] = useState("");
  const [rawgKey, setRawgKey] = useState("");
  
  useEffect(() => {
    const savedOmdb = localStorage.getItem("nexus_omdb_key");
    const savedRawg = localStorage.getItem("nexus_rawg_key");
    if (savedOmdb) setOmdbKey(savedOmdb);
    if (savedRawg) setRawgKey(savedRawg);
  }, []);

  const saveKeys = () => {
    localStorage.setItem("nexus_omdb_key", omdbKey);
    localStorage.setItem("nexus_rawg_key", rawgKey);
    setShowSettings(false);
    handleSearch();
  };

  useEffect(() => {
    // If there's an initial query from URL, run the search instead of showing default mocks
    if (initialQuery && (omdbKey || rawgKey || true)) { // true just to ensure it fires the mock search if keys missing
       handleSearch();
    } else {
       setResults(activeTab === "movie" ? mockMovies : mockGames);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchStreamingOptions = async (item: MediaItem) => {
    setShowStreamingOptions(true);
    setLoadingStreaming(true);

    if (item.streamingOptions) {
      setStreamingData(item.streamingOptions);
      setLoadingStreaming(false);
      return;
    }
    
    if (item.type === 'game') {
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
            // Find best match or just take first
            const match = data.description.find((d: any) => d.title.toLowerCase() === item.title.toLowerCase() || (item.year && d.year?.toString() === item.year)) || data.description[0];
            if (match && match.offers) {
               // Filter unique platforms
               const unique: Record<string, string> = {};
               match.offers.forEach((o: any) => {
                 if (!unique[o.name] && o.url) {
                    unique[o.name] = o.url;
                 }
               });
               const options = Object.keys(unique).map(k => ({ name: k, url: unique[k] }));
               setStreamingData(options);
            } else {
               setStreamingData([]);
            }
         } else {
            setStreamingData([]);
         }
      } else {
         setStreamingData([]);
      }
    } catch (err) {
      console.error(err);
      setStreamingData([]);
    } finally {
      setLoadingStreaming(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setResults(activeTab === "movie" ? mockMovies : mockGames);
      return;
    }

    setLoading(true);
    try {
      if (activeTab === "movie") {
        // First try the free IMDB API wrapper
        try {
          const res = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.ok && data.description) {
              const mapped: MediaItem[] = data.description.map((m: any) => ({
                id: m["#IMDB_ID"],
                title: m["#TITLE"],
                year: m["#YEAR"]?.toString() || "N/A",
                poster: m["#IMG_POSTER"] || "https://via.placeholder.com/300x450?text=No+Poster",
                backdrop: m["#IMG_POSTER"] || "",
                score: "N/A", // This API doesn't return score in list
                description: "Description not available in summary view.",
                cast: m["#ACTORS"] || "N/A",
                genre: "N/A",
                type: "movie"
              }));
              setResults(mapped);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Free API failed, falling back to OMDB or Mock");
        }

        // If OMDb key is provided, use it
        if (omdbKey) {
          const res = await fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&s=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data.Search) {
            const mapped: MediaItem[] = data.Search.map((m: any) => ({
              id: m.imdbID,
              title: m.Title,
              year: m.Year,
              poster: m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/300x450?text=No+Poster",
              backdrop: m.Poster !== "N/A" ? m.Poster : "",
              score: "N/A",
              description: "Click to see details.",
              cast: "N/A",
              genre: "N/A",
              type: "movie"
            }));
            setResults(mapped);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to local mock data
        setResults(searchMockData(query, "movie"));
        
      } else {
        // Games search
        if (rawgKey) {
          const res = await fetch(`https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data.results) {
            const mapped: MediaItem[] = data.results.map((g: any) => ({
              id: g.id.toString(),
              title: g.name,
              year: g.released ? g.released.split("-")[0] : "N/A",
              poster: g.background_image || "https://via.placeholder.com/300x450?text=No+Poster",
              backdrop: g.background_image || "",
              score: g.metacritic ? g.metacritic.toString() : "N/A",
              description: "Full description available in details.",
              cast: "N/A",
              genre: g.genres?.map((ge: any) => ge.name).join(", ") || "N/A",
              developer: "N/A",
              type: "game"
            }));
            setResults(mapped);
            setLoading(false);
            return;
          }
        }

        // Fallback to local mock data
        setResults(searchMockData(query, "game"));
      }
    } catch (err) {
      console.error(err);
      // Failsafe
      setResults(searchMockData(query, activeTab));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = async (item: MediaItem) => {
    setSelectedItem(item);
    setShowStreamingOptions(false);
    
    // If it's a mocked item with real data already, don't fetch
    if (item.description !== "Description not available in summary view." && item.description !== "Click to see details." && item.description !== "Full description available in details.") {
       return;
    }

    setLoadingDetails(true);
    try {
       let updatedItem = { ...item };
       
       if (item.type === 'movie') {
          if (omdbKey) {
             const res = await fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&i=${item.id}&plot=full`);
             const data = await res.json();
             if (data.Response === "True") {
                updatedItem.description = data.Plot !== "N/A" ? data.Plot : updatedItem.description;
                updatedItem.score = data.imdbRating !== "N/A" ? data.imdbRating : updatedItem.score;
                updatedItem.genre = data.Genre !== "N/A" ? data.Genre : updatedItem.genre;
                updatedItem.director = data.Director !== "N/A" ? data.Director : updatedItem.director;
                updatedItem.cast = data.Actors !== "N/A" ? data.Actors : updatedItem.cast;
             }
          } else {
             // Free tier: Fetch rating from JustWatch, Description from Wikipedia
             try {
                const jwRes = await fetch(`https://imdb.iamidiotareyoutoo.com/justwatch?q=${encodeURIComponent(item.title)}`);
                if (jwRes.ok) {
                   const jwData = await jwRes.json();
                   if (jwData.description && jwData.description.length > 0) {
                      const match = jwData.description.find((d: any) => d.title.toLowerCase() === item.title.toLowerCase() || (item.year && d.year?.toString() === item.year)) || jwData.description[0];
                      if (match) {
                         if (match.tomatoMeter) {
                            updatedItem.score = `${match.tomatoMeter}% (RT)`;
                         } else if (match.jwRating) {
                            updatedItem.score = `${Math.round(match.jwRating * 100)}% (JW)`;
                         }
                      }
                   }
                }
             } catch (e) {}

             try {
                const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&origin=*&format=json&titles=${encodeURIComponent(item.title + " (film)")}`);
                const wikiData = await wikiRes.json();
                const pages = wikiData.query?.pages;
                if (pages) {
                   const pageId = Object.keys(pages)[0];
                   if (pageId !== "-1" && pages[pageId].extract) {
                      updatedItem.description = pages[pageId].extract.split('\n')[0];
                   } else {
                      const wikiRes2 = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&origin=*&format=json&titles=${encodeURIComponent(item.title)}`);
                      const wikiData2 = await wikiRes2.json();
                      const pages2 = wikiData2.query?.pages;
                      if (pages2) {
                         const pageId2 = Object.keys(pages2)[0];
                         if (pageId2 !== "-1" && pages2[pageId2].extract) {
                            updatedItem.description = pages2[pageId2].extract.split('\n')[0];
                         }
                      }
                   }
                }
             } catch (e) {}
             
             if (updatedItem.description === "Description not available in summary view." || !updatedItem.description) {
                updatedItem.description = "We couldn't find a description for this title in the free database. Add an OMDb API key in settings for complete metadata.";
             }
          }
       } else {
          // Games
          if (rawgKey) {
             const res = await fetch(`https://api.rawg.io/api/games/${item.id}?key=${rawgKey}`);
             const data = await res.json();
             if (data.id) {
                updatedItem.description = data.description_raw || updatedItem.description;
                updatedItem.developer = data.developers?.map((d: any) => d.name).join(", ") || "N/A";
             }
          } else {
             try {
                const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&origin=*&format=json&titles=${encodeURIComponent(item.title + " (video game)")}`);
                const wikiData = await wikiRes.json();
                const pages = wikiData.query?.pages;
                if (pages) {
                   const pageId = Object.keys(pages)[0];
                   if (pageId !== "-1" && pages[pageId].extract) {
                      updatedItem.description = pages[pageId].extract.split('\n')[0];
                   } else {
                      const wikiRes2 = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&origin=*&format=json&titles=${encodeURIComponent(item.title)}`);
                      const wikiData2 = await wikiRes2.json();
                      const pages2 = wikiData2.query?.pages;
                      if (pages2) {
                         const pageId2 = Object.keys(pages2)[0];
                         if (pageId2 !== "-1" && pages2[pageId2].extract) {
                            updatedItem.description = pages2[pageId2].extract.split('\n')[0];
                         }
                      }
                   }
                }
             } catch (e) {}
             
             if (updatedItem.description === "Full description available in details.") {
                 updatedItem.description = "We couldn't find a full description. Add a RAWG API key in settings for complete game metadata.";
             }
          }
       }

       setSelectedItem(updatedItem);
       setResults(prev => prev.map(r => r.id === updatedItem.id ? updatedItem : r));
    } catch (e) {
       console.error("Failed to fetch details", e);
    } finally {
       setLoadingDetails(false);
    }
  };

  return (
    <div className={styles.exploreContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Nexus Database</h1>
          <p>Search any movie, show, or game in existence.</p>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <Link href="/dashboard" className="btn-secondary" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
          <button className="btn-secondary" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={20} /> API Setup
          </button>
        </div>
      </div>

      {showSettings && (
        <div className={styles.apiSettings}>
          <h3><Settings size={18} /> Power User Database Integration</h3>
          <p>To access the entire global database, provide your free API keys from OMDB and RAWG.</p>
          <div className={styles.apiInputGroup}>
            <input 
              type="password" 
              placeholder="OMDB API Key (Movies)" 
              value={omdbKey}
              onChange={e => setOmdbKey(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="RAWG API Key (Games)" 
              value={rawgKey}
              onChange={e => setRawgKey(e.target.value)}
            />
            <button className="btn-primary" onClick={saveKeys}>Save Keys</button>
          </div>
        </div>
      )}

      <div className={styles.searchSection}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'movie' ? styles.active : ''}`}
            onClick={() => { setActiveTab('movie'); setQuery(''); }}
          >
            <Clapperboard size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom'}}/>
            Movies & TV
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'game' ? styles.active : ''}`}
            onClick={() => { setActiveTab('game'); setQuery(''); }}
          >
            <Gamepad2 size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom'}}/>
            Video Games
          </button>
        </div>

        <form onSubmit={handleSearch} className={styles.searchBox}>
          <input 
            type="text" 
            className={styles.searchInput}
            placeholder={`Search for a ${activeTab === 'movie' ? 'movie or show' : 'game'}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>
            <Search size={20} /> Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spin} style={{display:'inline-block'}}><Settings size={40} /></div>
          <h3>Accessing Global Database...</h3>
        </div>
      ) : results.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No results found for "{query}"</h3>
          <p>Try refining your search or add your API keys in the setup for a larger dataset.</p>
        </div>
      ) : (
        <div className={styles.resultsGrid}>
          {results.map((item, idx) => (
            <div key={item.id + idx} className={styles.mediaCard} onClick={() => handleSelectItem(item)}>
              <div className={styles.posterWrapper}>
                <img 
                  src={item.poster} 
                  alt={item.title} 
                  className={styles.poster}
                  onError={(e) => { (e.target as any).src = "https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Poster"; }}
                />
                {item.score && item.score !== "N/A" && (
                  <div className={styles.scoreBadge}>
                    <Star size={14} fill="#ffd700" /> {item.score}
                  </div>
                )}
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <span className={styles.cardYear}>{item.year}</span>
                <div className={styles.cardTags}>
                  {item.genre.split(", ").slice(0, 2).map((g, i) => (
                    <span key={i} className={styles.tag}>{g}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>
              <X size={24} />
            </button>
            
            <div className={styles.modalHero}>
              <img 
                src={selectedItem.backdrop || selectedItem.poster} 
                alt={selectedItem.title} 
                className={styles.modalBackdrop}
                onError={(e) => { (e.target as any).src = "https://via.placeholder.com/1200x400/1a1a2e/ffffff?text=No+Backdrop"; }}
              />
              <div className={styles.modalHeroGradient}></div>
            </div>

            <div className={styles.modalInfo}>
              <img 
                src={selectedItem.poster} 
                alt={selectedItem.title} 
                className={styles.modalPoster}
                onError={(e) => { (e.target as any).src = "https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Poster"; }}
              />
              
              <div className={styles.modalDetails}>
                <h2 className={styles.modalTitle}>{selectedItem.title}</h2>
                <div className={styles.modalMeta}>
                  <span>{selectedItem.year}</span>
                  <span>•</span>
                  <span>{selectedItem.genre}</span>
                  {selectedItem.score && selectedItem.score !== "N/A" && (
                    <>
                      <span>•</span>
                      <div className={styles.modalScore}>
                        <Star size={16} fill="#ffd700" /> {selectedItem.score}
                      </div>
                    </>
                  )}
                </div>

                {loadingDetails ? (
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem'}}>
                    <Settings className={styles.spin} size={16} color="var(--accent-primary)" />
                    <span style={{color: 'var(--text-secondary)'}}>Fetching detailed description...</span>
                  </div>
                ) : (
                  <p className={styles.modalDescription}>{selectedItem.description}</p>
                )}

                <div className={styles.infoGrid}>
                  {selectedItem.cast && selectedItem.cast !== "N/A" && (
                    <div className={styles.infoItem}>
                      <h4>Cast / Actors</h4>
                      <p>{selectedItem.cast}</p>
                    </div>
                  )}
                  {selectedItem.director && selectedItem.director !== "N/A" && (
                    <div className={styles.infoItem}>
                      <h4>Director</h4>
                      <p>{selectedItem.director}</p>
                    </div>
                  )}
                  {selectedItem.developer && selectedItem.developer !== "N/A" && (
                    <div className={styles.infoItem}>
                      <h4>Developer</h4>
                      <p>{selectedItem.developer}</p>
                    </div>
                  )}
                </div>
                
                {!showStreamingOptions ? (
                  <button 
                    className="btn-primary" 
                    style={{marginTop: '1rem', width: '100%'}}
                    onClick={() => fetchStreamingOptions(selectedItem)}
                  >
                    {selectedItem.type === 'movie' ? <><Tv size={18} style={{marginRight: '8px'}}/> Find Streaming Services</> : <><Gamepad2 size={18} style={{marginRight: '8px'}}/> Buy Game</>}
                  </button>
                ) : loadingStreaming ? (
                  <div style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--accent-primary)'}}>
                    <Settings className={styles.spin} size={24} style={{display: 'inline-block'}} />
                    <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Scanning global providers...</p>
                  </div>
                ) : streamingData.length > 0 ? (
                  <div className={styles.streamingOptions}>
                    <h4>{selectedItem.type === 'movie' ? 'Available on:' : 'Store Options:'}</h4>
                    <div className={styles.platformsGrid}>
                      {streamingData.map((platform, idx) => {
                        let domain = 'google.com';
                        const lower = platform.name.toLowerCase();
                        if (lower.includes('netflix')) domain = 'netflix.com';
                        else if (lower.includes('prime') || lower.includes('amazon')) domain = 'primevideo.com';
                        else if (lower.includes('disney') || lower.includes('hotstar')) domain = 'hotstar.com';
                        else if (lower.includes('apple')) domain = 'tv.apple.com';
                        else if (lower.includes('hulu')) domain = 'hulu.com';
                        else if (lower.includes('max') || lower.includes('hbo')) domain = 'max.com';
                        else if (lower.includes('youtube') || lower.includes('google')) domain = 'youtube.com';
                        else if (lower.includes('steam')) domain = 'store.steampowered.com';
                        else if (lower.includes('epic')) domain = 'epicgames.com';
                        else if (lower.includes('playstation')) domain = 'playstation.com';
                        else if (lower.includes('xbox')) domain = 'xbox.com';
                        else if (lower.includes('crunchyroll')) domain = 'crunchyroll.com';
                        else if (lower.includes('paramount')) domain = 'paramountplus.com';
                        
                        return (
                          <a key={idx} href={platform.url} target="_blank" rel="noreferrer" className={styles.platformBtn}>
                            <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt={platform.name} className={styles.platformIcon} />
                            <span style={{textAlign: 'center'}}>{platform.name}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign: 'center', marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', borderRadius: '12px', border: '1px solid rgba(255,0,0,0.2)'}}>
                    <p style={{color: '#ff6b6b', margin: 0}}>Not currently available on major streaming platforms.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
