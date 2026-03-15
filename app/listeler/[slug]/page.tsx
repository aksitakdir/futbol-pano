"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ArticleLayout from "../../components/article-layout";

type SupabaseRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  created_at: string;
  youtube_id?: string;
  cover_image?: string;
};

type Player = {
  name: string;
  club: string;
  age: number;
  position: string;
  strengths: string;
};

type PageConfig = {
  title: string;
  intro: string;
  sections: { heading: string; description?: string }[];
  players: Player[];
};

const CONTENT_BY_SLUG: Record<string, PageConfig> = {
  "en-iyi-10-genc-stoper": {
    title: "2025-26 Avrupa'nın En İyi 10 Genç Stoperi",
    intro:
      "2025-26 sezonunda Avrupa genelinde savunma hattını domine eden genç stoperler, sadece fiziksel güçleriyle değil, oyun kurulumuna katkılarıyla da ön plana çıkıyor. Aşağıdaki listede, büyük sahnenin yeni lider adaylarını bulacaksın.",
    sections: [
      {
        heading: "Modern stoper profilinin bileşenleri",
        description:
          "Derine inen pas açıları, geniş alan savunması, geriden oyun kurma kalitesi ve baskı altında karar verme, modern stoperlerin temel bileşenleri. Bu liste, bu metriklerde öne çıkan oyuncuları bir araya getiriyor.",
      },
    ],
    players: [
      { name: "Pau Cubarsí", club: "FC Barcelona", age: 18, position: "Sağ Stoper", strengths: "Pas kalitesi, pozisyon alma, baskı altında sakinlik; geriden oyun kurarken dikine paslarıyla Barça'nın yapı taşlarından biri." },
      { name: "Leny Yoro", club: "Manchester United", age: 19, position: "Sağ Stoper", strengths: "Hava hakimiyeti, ikili mücadele sertliği ve ceza sahası içi pozisyon alışlarında üst düzey sezgi." },
      { name: "Ousmane Diomandé", club: "Sporting CP", age: 21, position: "Sağ Stoper", strengths: "Fiziksel dominasyon, geniş alan savunma becerisi ve agresif öne çıkışlarıyla Sporting'in savunma çizgisini öne taşıyor." },
      { name: "Castello Lukeba", club: "RB Leipzig", age: 22, position: "Sol Stoper", strengths: "Sol ayaklı stoper olarak pas açılarını iyi kullanıyor; agresif öne çıkış ve pas arası zamanlamasıyla öne çıkıyor." },
      { name: "Maxence Lacroix", club: "VfL Wolfsburg", age: 24, position: "Sağ Stoper", strengths: "Hızlı geri koşuları ve açık alandaki sprintleriyle derin savunma arkası koşuları süpürmede çok etkili." },
      { name: "Murillo", club: "Nottingham Forest", age: 22, position: "Sol Stoper", strengths: "Topla çıkarken dripling tehditi ve çizgiye yakın alanlarda pas kalitesi; Premier League temposuna çabuk adapte oldu." },
      { name: "Micky van de Ven", club: "Tottenham Hotspur", age: 24, position: "Sol Stoper", strengths: "Çok yüksek hız, geniş alan savunmasında atletizm ve geriden oyun kurarken dikine koşuları desteklemesiyle fark yaratıyor." },
      { name: "Dean Huijsen", club: "Juventus", age: 20, position: "Sağ Stoper", strengths: "Uzun boyuna rağmen topla rahat, oyun görüşü yüksek; yarı alanın ortasına kadar çıkarak pas opsiyonu yaratıyor." },
      { name: "Ezri Konsa", club: "Aston Villa", age: 27, position: "Sağ Stoper", strengths: "Satıh savunması ve bire birlerde sakinlik; hata yapmama istikrarıyla Villa'nın üst sıra yarışındaki kilit isimlerinden." },
      { name: "Giorgio Scalvini", club: "Atalanta", age: 21, position: "Stoper / Defansif Orta Saha", strengths: "Atalanta'nın üçlü savunmasında hem stoper hem altı numara oynayabilen hibrit profil; pas açıları ve taktik esneklik sunuyor." },
    ],
  },
  "super-lig-gizli-isimler": {
    title: "Süper Lig'in Gizli İsimleri — 2025-26 Radar Notları",
    intro:
      "Süper Lig, yalnızca manşetlere çıkan yıldızlardan ibaret değil. Henüz uluslararası radarın tamamına takılmamış; ancak veri tarafında istikrarlı yükseliş gösteren genç isimler, gelecek sezonların sürpriz transfer hikâyelerini yazmaya aday.",
    sections: [
      { heading: "Neyi 'gizli' yapar?", description: "Düşük medya görünürlüğü, sınırlı dakika ama yüksek verimlilik, belirli maç tiplerinde parlayan roller ve yaş profilinin hâlâ yükseliş vadetmesi bu oyuncuları 'gizli' kılıyor." },
    ],
    players: [
      { name: "Görkem Sağlam", club: "Fatih Karagümrük", age: 26, position: "Ofansif Orta Saha", strengths: "Ara pas zamanlaması, duran top etkinliği ve ceza sahası yay çevresinde şut tehdidiyle xG katkısını sürekli yukarıda tutuyor." },
      { name: "Metehan Baltacı", club: "Galatasaray", age: 22, position: "Stoper", strengths: "Uzun boyuna rağmen çevik, ikili mücadelelerde zamanlaması iyi; özellikle duran toplarda hem savunmada hem hücumda tehdit." },
      { name: "Emirhan İlkhan", club: "Beşiktaş", age: 21, position: "Merkez Orta Saha", strengths: "Baskı altında dikine dönme becerisi ve topu üçüncü bölgeye taşıyan progresif paslarıyla tempo kıran bir profil." },
      { name: "Berkay Vardar", club: "Beşiktaş", age: 21, position: "Merkez Orta Saha", strengths: "Kısa pas istikrarı, alan kapatma ve bloklar arasındaki kaymalarda pozisyon disipliniyle savunma dengesini koruyor." },
      { name: "Yusuf Sarı", club: "Adana Demirspor", age: 26, position: "Sağ Kanat", strengths: "Çizgiye inip orta tehdidiyle birlikte iç koridora dripling; geçiş hücumlarında doğru koşu zamanlaması ile geniş alanları iyi kullanıyor." },
      { name: "Baran Işık", club: "Gençlerbirliği", age: 19, position: "Sol Bek", strengths: "Atletik profili ve üst üste bindirme koşularıyla hücum genişliğini artırıyor; geriye dönüş hızında da üst seviye işaretler veriyor." },
      { name: "Yunus Emre Konak", club: "Sivasspor", age: 19, position: "Defansif Orta Saha", strengths: "İkili mücadelelerde sertlik, pas arası sezgisi ve savunma geçişlerindeki yerleşimiyle orta blok dengesini sağlıyor." },
      { name: "Ahmetcan Kaplan", club: "Ajax (kiralık, Süper Lig potansiyeli)", age: 22, position: "Sol Stoper", strengths: "Sol ayaklı stoper olarak hem Türkiye hem Avrupa piyasasında değerli; uzun pas isabeti ve hava hakimiyetiyle dikkat çekiyor." },
    ],
  },
  "surpriz-isimler-2025": {
    title: "Bu Sezonun Sürpriz İsimleri — 2025-26",
    intro:
      "Her sezon beklenmedik çıkışlar hikâyeyi değiştirir. 2025-26 sezonunda da birçok genç oyuncu, ilk 11'de düşünülmezken kilit role evrilerek hem verileri hem de oyunun algısını yukarı taşıdı.",
    sections: [
      { heading: "Beklentiyi aşmak ne demek?", description: "Dakika başına üretim, büyük maçlardaki etki, rol değişikliklerine adaptasyon ve yaş profili düşünüldüğünde, bu isimler sezon öncesi projeksiyonların net biçimde önüne geçti." },
    ],
    players: [
      { name: "Lamine Yamal", club: "FC Barcelona", age: 17, position: "Sağ Kanat", strengths: "Çok genç yaşına rağmen üçüncü bölgede karar kalitesi, içe kat eden driplingleri ve gol/assist öncesi aksiyon sayısıyla beklentilerin çok üzerine çıktı." },
      { name: "Kobbie Mainoo", club: "Manchester United", age: 19, position: "Merkez Orta Saha", strengths: "Dar alanda top saklama, baskı kıran dönüşler ve savunma katkısını aynı potada birleştirerek United orta sahasının referans noktası haline geldi." },
      { name: "Warren Zaïre-Emery", club: "Paris Saint-Germain", age: 19, position: "Merkez / Box-to-Box Orta Saha", strengths: "PSG gibi yıldız yoğun bir ortamda oyunun iki yönünü de oynayabilen nadir gençlerden; koşu mesafesi, pres yoğunluğu ve pas kalitesiyle şimdiden omurga oyuncusu." },
      { name: "Arda Güler", club: "Real Madrid", age: 20, position: "Ofansif Orta Saha", strengths: "Sınırlı dakikaya rağmen şut kalitesi, son pas ve set hücumlarında dar alanda çözüm üretme becerisiyle skor katkısını yüksek verimle sağladı." },
      { name: "Rico Lewis", club: "Manchester City", age: 20, position: "Ters Bek / İç Orta Saha", strengths: "Guardiola sisteminde hem bek hem iç orta saha rollerini üstlenerek pozisyonel oyunun karmaşık gerekliliklerini genç yaşta yerine getirebildi." },
      { name: "Cole Palmer", club: "Chelsea", age: 23, position: "On Numara / Sağ İç", strengths: "Chelsea'nin üretim merkezine dönüşerek penaltılar, duran toplar ve açık oyun içinde gol katkısıyla çift haneli skor rakamlarına ulaştı." },
      { name: "João Neves", club: "Benfica", age: 20, position: "Defansif / Merkez Orta Saha", strengths: "Top kapma zamanlaması, alan kapatma ve direkt oyun kurulumunda dikine pas arayışları; üst seviye altı numara projeksiyonu çiziyor." },
      { name: "Alejandro Garnacho", club: "Manchester United", age: 21, position: "Sol Kanat", strengths: "Bire birde adam eksiltme, içe kat edip şut tehdidi ve büyük maçlardaki cesur karar alma profiliyle sezonun en büyük sürprizlerinden biri." },
    ],
  },
};

function positionColor(position: string): string {
  const p = position.toLowerCase();
  if (p.includes("stoper") || p.includes("defans") || p.includes("bek"))
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  if (p.includes("orta") || p.includes("merkez") || p.includes("box"))
    return "bg-sky-500/15 text-sky-300 border-sky-500/40";
  if (p.includes("kanat") || p.includes("forvet") || p.includes("numara"))
    return "bg-rose-500/15 text-rose-300 border-rose-500/40";
  return "bg-slate-500/15 text-slate-200 border-slate-500/40";
}

function staticToMarkdown(config: PageConfig): string {
  let md = config.intro + "\n\n";
  for (const s of config.sections) {
    md += `## ${s.heading}\n\n`;
    if (s.description) md += s.description + "\n\n";
  }
  return md;
}

function PlayerCards({ players }: { players: Player[] }) {
  if (players.length === 0) return null;
  return (
    <section className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Oyuncu Kartları</h2>
        <span className="text-[11px] text-slate-500">Toplam {players.length} oyuncu</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {players.map((player) => (
          <div key={player.name} className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.9)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-50">{player.name}</h3>
                <p className="mt-1 text-[11px] text-slate-400">{player.club} • {player.age} yaş</p>
              </div>
              <span className={["inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", positionColor(player.position)].join(" ")}>
                {player.position}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-200">{player.strengths}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ListDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [dbContent, setDbContent] = useState<SupabaseRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    async function fetchFromDb() {
      const { data } = await supabase
        .from("contents")
        .select("*")
        .eq("slug", slug)
        .eq("status", "yayinda")
        .single();

      if (data) setDbContent(data);
      setLoading(false);
    }
    fetchFromDb();
  }, [slug]);

  const staticConfig = slug ? CONTENT_BY_SLUG[slug] : undefined;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Yükleniyor...
        </div>
      </main>
    );
  }

  if (dbContent) {
    return (
      <ArticleLayout
        title={dbContent.title}
        content={dbContent.content}
        category={dbContent.category}
        date={dbContent.created_at}
        slug={dbContent.slug}
        activeNav="listeler"
        backHref="/listeler"
        backLabel="Listelere Dön"
        youtubeId={dbContent.youtube_id}
        coverImage={dbContent.cover_image}
      />
    );
  }

  if (staticConfig) {
    const markdown = staticToMarkdown(staticConfig);
    return (
      <ArticleLayout
        title={staticConfig.title}
        content={markdown}
        category="listeler"
        date="2026-03-01T00:00:00Z"
        slug={slug!}
        activeNav="listeler"
        backHref="/listeler"
        backLabel="Listelere Dön"
      >
        <PlayerCards players={staticConfig.players} />
      </ArticleLayout>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <h1 className="mb-2 text-2xl font-extrabold">404</h1>
      <p className="mb-6 text-sm text-slate-400">Bu liste bulunamadı veya henüz yayınlanmadı.</p>
      <Link
        href="/listeler"
        className="inline-flex rounded-full border border-slate-700/80 bg-slate-900/70 px-5 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-500/70 hover:text-emerald-200"
      >
        ← Listelere Dön
      </Link>
    </main>
  );
}
