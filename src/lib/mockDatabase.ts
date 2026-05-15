export type MediaType = "movie" | "game";

export interface MediaItem {
  id: string;
  title: string;
  year: string;
  poster: string;
  backdrop: string;
  score: string;
  description: string;
  cast: string;
  genre: string;
  director?: string;
  developer?: string;
  type: MediaType;
  streamingOptions?: { name: string; url: string; icon?: string }[];
}

export const mockMovies: MediaItem[] = [
  {
    id: "tt0468569",
    title: "The Dark Knight",
    year: "2008",
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0OF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    score: "9.0",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    cast: "Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine",
    genre: "Action, Crime, Drama",
    director: "Christopher Nolan",
    type: "movie",
    streamingOptions: [
      { name: "Max", url: "https://www.max.com/" },
      { name: "Amazon Video", url: "https://www.amazon.com/" }
    ]
  },
  {
    id: "tt1375666",
    title: "Inception",
    year: "2010",
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    score: "8.8",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
    cast: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy",
    genre: "Action, Adventure, Sci-Fi",
    director: "Christopher Nolan",
    type: "movie",
    streamingOptions: [
      { name: "Apple TV Store", url: "https://tv.apple.com/" },
      { name: "Amazon Prime Video", url: "https://www.amazon.com/Prime-Video/" }
    ]
  },
  {
    id: "tt0111161",
    title: "The Shawshank Redemption",
    year: "1994",
    poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    score: "9.3",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    cast: "Tim Robbins, Morgan Freeman, Bob Gunton, William Sadler",
    genre: "Drama",
    director: "Frank Darabont",
    type: "movie",
    streamingOptions: [
      { name: "Netflix", url: "https://www.netflix.com/" }
    ]
  },
  {
    id: "tt0133093",
    title: "The Matrix",
    year: "1999",
    poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/icmmSD4vTTDKOq2vvdulafOGw9H.jpg",
    score: "8.7",
    description: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
    cast: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving",
    genre: "Action, Sci-Fi",
    director: "Lana Wachowski, Lilly Wachowski",
    type: "movie",
    streamingOptions: [
      { name: "Max", url: "https://www.max.com/" }
    ]
  },
  {
    id: "tt0816692",
    title: "Interstellar",
    year: "2014",
    poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    score: "8.7",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Mackenzie Foy",
    genre: "Adventure, Drama, Sci-Fi",
    director: "Christopher Nolan",
    type: "movie",
    streamingOptions: [
      { name: "Paramount+", url: "https://www.paramountplus.com/" },
      { name: "Amazon Prime Video", url: "https://www.amazon.com/Prime-Video/" }
    ]
  },
  {
    id: "tt0109830",
    title: "Forrest Gump",
    year: "1994",
    poster: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg",
    score: "8.8",
    description: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
    cast: "Tom Hanks, Robin Wright, Gary Sinise",
    genre: "Drama, Romance",
    director: "Robert Zemeckis",
    type: "movie",
    streamingOptions: [
      { name: "Netflix", url: "https://www.netflix.com/" },
      { name: "Paramount+", url: "https://www.paramountplus.com/" }
    ]
  },
  {
    id: "tt0120737",
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: "2001",
    poster: "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xU141441lY08XoP954B4B9vN0X6.jpg",
    score: "8.8",
    description: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
    cast: "Elijah Wood, Ian McKellen, Orlando Bloom",
    genre: "Action, Adventure, Drama",
    director: "Peter Jackson",
    type: "movie",
    streamingOptions: [
      { name: "Max", url: "https://www.max.com/" }
    ]
  },
  {
    id: "tt4154796",
    title: "Avengers: Endgame",
    year: "2019",
    poster: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_SX300.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    score: "8.4",
    description: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions.",
    cast: "Robert Downey Jr., Chris Evans, Mark Ruffalo",
    genre: "Action, Adventure, Drama",
    director: "Anthony Russo, Joe Russo",
    type: "movie",
    streamingOptions: [
      { name: "Disney+", url: "https://www.disneyplus.com/" }
    ]
  }
];

export const mockGames: MediaItem[] = [
  {
    id: "g1",
    title: "The Witcher 3: Wild Hunt",
    year: "2015",
    poster: "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
    backdrop: "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
    score: "92",
    description: "You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will. Your current contract? Tracking down Ciri — the Child of Prophecy, a living weapon that can alter the shape of the world.",
    cast: "Doug Cockle, Denise Gough, Jo Wyatt",
    genre: "Action, RPG",
    developer: "CD PROJEKT RED",
    type: "game"
  },
  {
    id: "g2",
    title: "Grand Theft Auto V",
    year: "2013",
    poster: "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
    backdrop: "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
    score: "92",
    description: "When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the criminal underworld, the U.S. government and the entertainment industry, they must pull off a series of dangerous heists to survive in a ruthless city in which they can trust nobody, least of all each other.",
    cast: "Shawn Fonteno, Ned Luke, Steven Ogg",
    genre: "Action, Adventure",
    developer: "Rockstar North",
    type: "game"
  },
  {
    id: "g3",
    title: "Red Dead Redemption 2",
    year: "2018",
    poster: "https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg",
    backdrop: "https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg",
    score: "97",
    description: "Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, RDR2 is the epic tale of outlaw Arthur Morgan and the infamous Van der Linde gang, on the run across America at the dawn of the modern age. Also includes access to the shared living world of Red Dead Online.",
    cast: "Roger Clark, Rob Wiethoff, Cali Elizabeth Moore",
    genre: "Action, Adventure",
    developer: "Rockstar Games",
    type: "game"
  },
  {
    id: "g4",
    title: "Minecraft",
    year: "2011",
    poster: "https://media.rawg.io/media/games/b4e/b4e4c73d5aa427ed40b53f03a4582bba.jpg",
    backdrop: "https://media.rawg.io/media/games/b4e/b4e4c73d5aa427ed40b53f03a4582bba.jpg",
    score: "83",
    description: "Explore infinite worlds and build everything from the simplest of homes to the grandest of castles. Play in creative mode with unlimited resources or mine deep into the world in survival mode, crafting weapons and armor to fend off dangerous mobs.",
    cast: "N/A",
    genre: "Arcade, Simulation",
    developer: "Mojang Studios",
    type: "game"
  },
  {
    id: "g5",
    title: "Elden Ring",
    year: "2022",
    poster: "https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56efdf54724ce1ce.jpg",
    backdrop: "https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56efdf54724ce1ce.jpg",
    score: "96",
    description: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
    cast: "N/A",
    genre: "Action, RPG",
    developer: "FromSoftware",
    type: "game"
  },
  {
    id: "g6",
    title: "Cyberpunk 2077",
    year: "2020",
    poster: "https://media.rawg.io/media/games/26d/26d440e0abf48e91ceb7c062c3f878f7.jpg",
    backdrop: "https://media.rawg.io/media/games/26d/26d440e0abf48e91ceb7c062c3f878f7.jpg",
    score: "86",
    description: "Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
    cast: "Keanu Reeves, Cherami Leigh, Gavin Drea",
    genre: "Action, RPG",
    developer: "CD PROJEKT RED",
    type: "game"
  },
  {
    id: "g7",
    title: "God of War",
    year: "2018",
    poster: "https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be59.jpg",
    backdrop: "https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be59.jpg",
    score: "94",
    description: "His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters. It is in this harsh, unforgiving world that he must fight to survive.",
    cast: "Christopher Judge, Sunny Suljic",
    genre: "Action, Adventure",
    developer: "Santa Monica Studio",
    type: "game"
  },
  {
    id: "g8",
    title: "The Legend of Zelda: Breath of the Wild",
    year: "2017",
    poster: "https://media.rawg.io/media/games/cc1/cc196a5076e4418080f03222a7f5cfed.jpg",
    backdrop: "https://media.rawg.io/media/games/cc1/cc196a5076e4418080f03222a7f5cfed.jpg",
    score: "97",
    description: "Step into a world of discovery, exploration, and adventure in The Legend of Zelda: Breath of the Wild, a boundary-breaking new game in the acclaimed series.",
    cast: "Kengo Takanashi, Yu Shimamura",
    genre: "Action, Adventure",
    developer: "Nintendo",
    type: "game"
  }
];

export const searchMockData = (query: string, type: MediaType): MediaItem[] => {
  const dataset = type === "movie" ? mockMovies : mockGames;
  if (!query) return dataset;
  return dataset.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.description.toLowerCase().includes(query.toLowerCase())
  );
};
