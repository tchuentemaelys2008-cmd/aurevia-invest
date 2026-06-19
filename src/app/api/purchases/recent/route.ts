export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

// The live ticker is purely cosmetic: it shows ALL the names written below
// (not real database purchases), each paired with a random pass/amount.
const displayNames = [
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

const passPool = ["Aurevia Gold", "Aurevia Silver", "Aurevia VIP", "Aurevia Boost", "Aurevia Platinum", "Aurevia Bronze", "Aurevia Plus", "Aurevia Starter"];
const amountPool = [4000, 5000, 8000, 10000, 15000, 25000, 50000, 75000, 100000];
const colorPool = ["#e23744", "#b51d2c", "#e6874d", "#e6d44d", "#e6404d", "#b87333"];

export async function GET() {
  // Show every name in the list above, in a random order, each with a random
  // pass/amount. No database access.
  const shuffled = [...displayNames].sort(() => Math.random() - 0.5);
  const purchases = shuffled.map((name, i) => ({
    id: `live-${i}`,
    user: name,
    verified: Math.random() > 0.55,
    pass: passPool[Math.floor(Math.random() * passPool.length)],
    amount: amountPool[Math.floor(Math.random() * amountPool.length)],
    color: colorPool[Math.floor(Math.random() * colorPool.length)],
    createdAt: new Date(Date.now() - i * 60000).toISOString(),
  }));

  return NextResponse.json({ purchases });
}
