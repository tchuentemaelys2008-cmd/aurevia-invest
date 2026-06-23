// Shared roster used by both the live purchase ticker and the leaderboard so
// the same names/passes appear in both places. The ticker shows these names
// with random pass/amount (purely cosmetic), while the leaderboard turns each
// name into a STABLE "seed" entry (deterministic invested amount derived from
// the name) so the ranking is filled from day one and stays consistent across
// refreshes. As real users buy passes, their real totalInvested merges in and
// outranks these seed entries naturally.

export const displayNames = [
  "Camille Durand", "Noah Kouassi", "Aminata Sow", "Hugo Morel", "Sarah Nguessan",
  "Ibrahim Diallo", "Lea Martin", "Yannick Fofana", "Mariam Traore", "Lucas Bernard",
  "Nadia Mensah", "Arnaud Mbarga", "Fatou Ndiaye", "Kevin Tchoua", "Awa Camara",
  "Eric Mvondo", "Salimata Kone", "Olivier Bamba", "Rokhaya Fall", "Cedric Essomba",
  "Bintou Cisse", "Patrick Owona", "Adjoa Mensah", "Moussa Keita", "Chloe Lefevre",
  "Serge Atangana", "Aissatou Barry", "Thomas Nkolo", "Mariama Balde", "Franck Ngassa",
  "Ramatoulaye Ba", "Dimitri Effa", "Khadija Toure", "Steve Manga", "Oumou Sangare",
  "Romeo Biya", "Coumba Gueye", "Wilfried Yao", "Sokhna Diop", "Junior Ondoua",
  "Maeva Abena", "Ismael Konate", "Grace Ngo", "Boubacar Sylla", "Linda Etoa",
  "Hamed Ouattara", "Prisca Mballa", "Seydou Cisse", "Vanessa Ekani", "Abdoulaye Sy",
  "Marie Tchatchoua", "Jean-Paul Edou", "Aicha Diakite", "Roland Nguema", "Esther Belibi",
  "Mamadou Bah", "Carine Ondo", "Blaise Kamga", "Fanta Doumbia", "Gildas Mboma",
  "Sandra Eyenga", "Souleymane Toure", "Henriette Fotso", "Alassane Coulibaly", "Pamela Ngono",
  "Cheikh Mbaye", "Brice Talla", "Djeneba Sangare", "Landry Onana", "Aminatou Garba",
  "Pascal Mengue", "Habiba Diop", "Ulrich Fokou", "Mariam Cisse", "Donald Eteki",
  "Nafissatou Sy", "Aurelie Etoga", "Yacouba Konate", "Gaelle Manga", "Idrissa Diallo",
  "Brenda Atangana", "Modou Faye", "Larissa Ngo", "Boubacar Traore", "Joelle Mbida",
  "Samuel Owono", "Fatoumata Camara", "Rodrigue Essono", "Hawa Sylla", "Patrice Mbarga",
  "Adama Sow", "Solange Eyenga", "Issa Ouedraogo", "Nadege Fouda", "Karim Bamba",
  "Vivien Tchoumi", "Awa Diallo", "Emmanuel Nkodo", "Zara Hamadou", "Franck Belinga",
  "Ousmane Diop", "Clarisse Ngono", "Aboubakar Sangare", "Michelle Eboa", "Tidiane Ba",
  "Ali Maiga", "Sophie Ngamaleu", "Bakary Toure", "Estelle Mballa", "Demba Niang",
  "Rachel Onguene", "Souleyman Diarra", "Aurore Tagne", "Lamine Sarr", "Diane Mefor",
  "Adama Diakhate", "Pauline Ekambi", "Sekou Conde", "Nathalie Bekolo", "Madi Cisse",
  "Sandrine Ngo Bell", "Oumar Ndoye", "Flore Manga", "Hassan Bello", "Carmen Edzoa",
  "Boubou Sangare", "Yvette Mendomo", "Iliasse Toure", "Bella Nkoa", "Modeste Owona",
  "Djibril Kane", "Henriette Ze", "Mahamat Saleh", "Olga Fouda", "Yao Konan",
];

export const passPool = [
  "Aurevia Gold", "Aurevia Silver", "Aurevia VIP", "Aurevia Boost",
  "Aurevia Platinum", "Aurevia Bronze", "Aurevia Plus", "Aurevia Starter",
];
export const amountPool = [4000, 5000, 8000, 10000, 15000, 25000, 50000, 75000, 100000];
export const colorPool = ["#3b6fd4", "#2d5bcc", "#e6874d", "#e6d44d", "#e6404d", "#b87333"];

// Deterministic FNV-1a hash so a given name always maps to the same profile.
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface SeedEntry {
  id: string;
  name: string;
  totalInvested: number;
  totalEarnings: number;
  level: number;
  isVerified: boolean;
}

// Turn a name into a stable leaderboard "seed" entry: a few accumulated passes,
// earnings as a fraction of the investment, a level scaling with investment.
export function seedLeaderboard(): SeedEntry[] {
  return displayNames.map((name, i) => {
    const h = hash(name);
    const passes = 1 + (h % 6); // 1..6 passes accumulated
    let invested = 0;
    let x = h;
    for (let p = 0; p < passes; p++) {
      x = (Math.imul(x, 1103515245) + 12345) >>> 0;
      invested += amountPool[x % amountPool.length];
    }
    const earnings = Math.round(invested * (0.15 + ((h >> 5) % 60) / 100)); // 15%-74%
    const level = Math.min(12, 1 + Math.floor(invested / 50000));
    const isVerified = h % 100 > 45; // ~54% verified
    return { id: `seed-${i}`, name, totalInvested: invested, totalEarnings: earnings, level, isVerified };
  });
}
