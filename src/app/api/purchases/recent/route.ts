export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Large pool of realistic names (FR / West & Central Africa) so the live ticker
// shows plenty of variety instead of repeating the same few.
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
  "Nafissatou Sy", "Christelle Abomo", "Yacouba Konate", "Gaelle Manga", "Idrissa Diallo",
  "Brenda Atangana", "Modou Faye", "Larissa Ngo", "Boubacar Traore", "Joelle Mbida",
  "Samuel Owono", "Fatoumata Camara", "Rodrigue Essono", "Hawa Sylla", "Patrice Mbarga",
  "Adama Sow", "Solange Eyenga", "Issa Ouedraogo", "Nadege Fouda", "Karim Bamba",
  "Vivien Tchoumi", "Awa Diallo", "Emmanuel Nkodo", "Zara Hamadou", "Franck Belinga",
  "Ousmane Diop", "Clarisse Ngono", "Aboubakar Sangare", "Michelle Eboa", "Tidiane Ba",
];

const passPool = ["Aurevia Gold", "Aurevia Silver", "Aurevia VIP", "Aurevia Boost", "Aurevia Platinum", "Aurevia Bronze", "Aurevia Plus", "Aurevia Starter"];
const amountPool = [4000, 5000, 8000, 10000, 15000, 25000, 50000, 75000, 100000];
const colorPool = ["#e23744", "#b51d2c", "#e6874d", "#e6d44d", "#e6404d", "#b87333"];

// Build a varied synthetic feed used when there are no real purchases yet.
function buildFallback() {
  const shuffled = [...displayNames].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 14).map((name, i) => ({
    id: `live-${i}`,
    user: name,
    verified: Math.random() > 0.55,
    pass: passPool[Math.floor(Math.random() * passPool.length)],
    amount: amountPool[Math.floor(Math.random() * amountPool.length)],
    color: colorPool[Math.floor(Math.random() * colorPool.length)],
    createdAt: new Date(Date.now() - i * 60000).toISOString(),
  }));
}

function cleanDisplayName(name: string, index: number) {
  const looksFake = /test|demo|user|admin|123|xxx|fake/i.test(name) || name.trim().length < 3;
  return looksFake ? displayNames[index % displayNames.length] : name.trim();
}

export async function GET() {
  try {
    const purchases = await prisma.userPass.findMany({
      where: { status: { in: ["ACTIVE", "PENDING"] } },
      orderBy: { createdAt: "desc" },
      take: 14,
      include: {
        user: { select: { name: true, isVerified: true } },
        pass: { select: { name: true, price: true, color: true } },
      },
    });

    const data = purchases.map((purchase, index) => ({
      id: purchase.id,
      user: cleanDisplayName(purchase.user.name, index),
      verified: purchase.user.isVerified,
      pass: purchase.pass.name,
      amount: purchase.amountPaid || purchase.pass.price,
      color: purchase.pass.color,
      createdAt: purchase.createdAt,
    }));

    // Always blend in synthetic entries so the feed never looks empty or repetitive.
    const merged = [...data, ...buildFallback()].slice(0, 16);
    return NextResponse.json({ purchases: merged });
  } catch {
    return NextResponse.json({ purchases: buildFallback() });
  }
}
