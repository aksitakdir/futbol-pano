"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconHome,
  IconList,
  IconRadar,
  IconUsers,
} from "../../components/icons";

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
  sections: {
    heading: string;
    description?: string;
  }[];
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
      {
        name: "Pau Cubarsí",
        club: "FC Barcelona",
        age: 18,
        position: "Sağ Stoper",
        strengths:
          "Pas kalitesi, pozisyon alma, baskı altında sakinlik; geriden oyun kurarken dikine paslarıyla Barça'nın yapı taşlarından biri.",
      },
      {
        name: "Leny Yoro",
        club: "Manchester United",
        age: 19,
        position: "Sağ Stoper",
        strengths:
          "Hava hakimiyeti, ikili mücadele sertliği ve ceza sahası içi pozisyon alışlarında üst düzey sezgi.",
      },
      {
        name: "Ousmane Diomandé",
        club: "Sporting CP",
        age: 21,
        position: "Sağ Stoper",
        strengths:
          "Fiziksel dominasyon, geniş alan savunma becerisi ve agresif öne çıkışlarıyla Sporting'in savunma çizgisini öne taşıyor.",
      },
      {
        name: "Castello Lukeba",
        club: "RB Leipzig",
        age: 22,
        position: "Sol Stoper",
        strengths:
          "Sol ayaklı stoper olarak pas açılarını iyi kullanıyor; agresif öne çıkış ve pas arası zamanlamasıyla öne çıkıyor.",
      },
      {
        name: "Maxence Lacroix",
        club: "VfL Wolfsburg",
        age: 24,
        position: "Sağ Stoper",
        strengths:
          "Hızlı geri koşuları ve açık alandaki sprintleriyle derin savunma arkası koşuları süpürmede çok etkili.",
      },
      {
        name: "Murillo",
        club: "Nottingham Forest",
        age: 22,
        position: "Sol Stoper",
        strengths:
          "Topla çıkarken dripling tehditi ve çizgiye yakın alanlarda pas kalitesi; Premier League temposuna çabuk adapte oldu.",
      },
      {
        name: "Micky van de Ven",
        club: "Tottenham Hotspur",
        age: 24,
        position: "Sol Stoper",
        strengths:
          "Çok yüksek hız, geniş alan savunmasında atletizm ve geriden oyun kurarken dikine koşuları desteklemesiyle fark yaratıyor.",
      },
      {
        name: "Dean Huijsen",
        club: "Juventus",
        age: 20,
        position: "Sağ Stoper",
        strengths:
          "Uzun boyuna rağmen topla rahat, oyun görüşü yüksek; yarı alanın ortasına kadar çıkarak pas opsiyonu yaratıyor.",
      },
      {
        name: "Ezri Konsa",
        club: "Aston Villa",
        age: 27,
        position: "Sağ Stoper",
        strengths:
          "Satıh savunması ve bire birlerde sakinlik; hata yapmama istikrarıyla Villa'nın üst sıra yarışındaki kilit isimlerinden.",
      },
      {
        name: "Giorgio Scalvini",
        club: "Atalanta",
        age: 21,
        position: "Stoper / Defansif Orta Saha",
        strengths:
          "Atalanta'nın üçlü savunmasında hem stoper hem altı numara oynayabilen hibrit profil; pas açıları ve taktik esneklik sunuyor.",
      },
    ],
  },
  "super-lig-gizli-isimler": {
    title: "Süper Lig'in Gizli İsimleri — 2025-26 Radar Notları",
    intro:
      "Süper Lig, yalnızca manşetlere çıkan yıldızlardan ibaret değil. Henüz uluslararası radarın tamamına takılmamış; ancak veri tarafında istikrarlı yükseliş gösteren genç isimler, gelecek sezonların sürpriz transfer hikâyelerini yazmaya aday.",
    sections: [
      {
        heading: "Neyi 'gizli' yapar?",
        description:
          "Düşük medya görünürlüğü, sınırlı dakika ama yüksek verimlilik, belirli maç tiplerinde parlayan roller ve yaş profilinin hâlâ yükseliş vadetmesi bu oyuncuları 'gizli' kılıyor.",
      },
    ],
    players: [
      {
        name: "Görkem Sağlam",
        club: "Fatih Karagümrük",
        age: 26,
        position: "Ofansif Orta Saha",
        strengths:
          "Ara pas zamanlaması, duran top etkinliği ve ceza sahası yay çevresinde şut tehdidiyle xG katkısını sürekli yukarıda tutuyor.",
      },
      {
        name: "Metehan Baltacı",
        club: "Galatasaray",
        age: 22,
        position: "Stoper",
        strengths:
          "Uzun boyuna rağmen çevik, ikili mücadelelerde zamanlaması iyi; özellikle duran toplarda hem savunmada hem hücumda tehdit.",
      },
      {
        name: "Emirhan İlkhan",
        club: "Beşiktaş",
        age: 21,
        position: "Merkez Orta Saha",
        strengths:
          "Baskı altında dikine dönme becerisi ve topu üçüncü bölgeye taşıyan progresif paslarıyla tempo kıran bir profil.",
      },
      {
        name: "Berkay Vardar",
        club: "Beşiktaş",
        age: 21,
        position: "Merkez Orta Saha",
        strengths:
          "Kısa pas istikrarı, alan kapatma ve bloklar arasındaki kaymalarda pozisyon disipliniyle savunma dengesini koruyor.",
      },
      {
        name: "Yusuf Sarı",
        club: "Adana Demirspor",
        age: 26,
        position: "Sağ Kanat",
        strengths:
          "Çizgiye inip orta tehdidiyle birlikte iç koridora dripling; geçiş hücumlarında doğru koşu zamanlaması ile geniş alanları iyi kullanıyor.",
      },
      {
        name: "Baran Işık",
        club: "Gençlerbirliği",
        age: 19,
        position: "Sol Bek",
        strengths:
          "Atletik profili ve üst üste bindirme koşularıyla hücum genişliğini artırıyor; geriye dönüş hızında da üst seviye işaretler veriyor.",
      },
      {
        name: "Yunus Emre Konak",
        club: "Sivasspor",
        age: 19,
        position: "Defansif Orta Saha",
        strengths:
          "İkili mücadelelerde sertlik, pas arası sezgisi ve savunma geçişlerindeki yerleşimiyle orta blok dengesini sağlıyor.",
      },
      {
        name: "Ahmetcan Kaplan",
        club: "Ajax (kiralık, Süper Lig potansiyeli)",
        age: 22,
        position: "Sol Stoper",
        strengths:
          "Sol ayaklı stoper olarak hem Türkiye hem Avrupa piyasasında değerli; uzun pas isabeti ve hava hakimiyetiyle dikkat çekiyor.",
      },
    ],
  },
  "surpriz-isimler-2025": {
    title: "Bu Sezonun Sürpriz İsimleri — 2025-26",
    intro:
      "Her sezon beklenmedik çıkışlar hikâyeyi değiştirir. 2025-26 sezonunda da birçok genç oyuncu, ilk 11'de düşünülmezken kilit role evrilerek hem verileri hem de oyunun algısını yukarı taşıdı.",
    sections: [
      {
        heading: "Beklentiyi aşmak ne demek?",
        description:
          "Dakika başına üretim, büyük maçlardaki etki, rol değişikliklerine adaptasyon ve yaş profili düşünüldüğünde, bu isimler sezon öncesi projeksiyonların net biçimde önüne geçti.",
      },
    ],
    players: [
      {
        name: "Lamine Yamal",
        club: "FC Barcelona",
        age: 17,
        position: "Sağ Kanat",
        strengths:
          "Çok genç yaşına rağmen üçüncü bölgede karar kalitesi, içe kat eden driplingleri ve gol/assist öncesi aksiyon sayısıyla beklentilerin çok üzerine çıktı.",
      },
      {
        name: "Kobbie Mainoo",
        club: "Manchester United",
        age: 19,
        position: "Merkez Orta Saha",
        strengths:
          "Dar alanda top saklama, baskı kıran dönüşler ve savunma katkısını aynı potada birleştirerek United orta sahasının referans noktası haline geldi.",
      },
      {
        name: "Warren Zaïre-Emery",
        club: "Paris Saint-Germain",
        age: 19,
        position: "Merkez / Box-to-Box Orta Saha",
        strengths:
          "PSG gibi yıldız yoğun bir ortamda oyunun iki yönünü de oynayabilen nadir gençlerden; koşu mesafesi, pres yoğunluğu ve pas kalitesiyle şimdiden omurga oyuncusu.",
      },
      {
        name: "Arda Güler",
        club: "Real Madrid",
        age: 20,
        position: "Ofansif Orta Saha",
        strengths:
          "Sınırlı dakikaya rağmen şut kalitesi, son pas ve set hücumlarında dar alanda çözüm üretme becerisiyle skor katkısını yüksek verimle sağladı.",
      },
      {
        name: "Rico Lewis",
        club: "Manchester City",
        age: 20,
        position: "Ters Bek / İç Orta Saha",
        strengths:
          "Guardiola sisteminde hem bek hem iç orta saha rollerini üstlenerek pozisyonel oyunun karmaşık gerekliliklerini genç yaşta yerine getirebildi.",
      },
      {
        name: "Cole Palmer",
        club: "Chelsea",
        age: 23,
        position: "On Numara / Sağ İç",
        strengths:
          "Chelsea'nin üretim merkezine dönüşerek penaltılar, duran toplar ve açık oyun içinde gol katkısıyla çift haneli skor rakamlarına ulaştı.",
      },
      {
        name: "João Neves",
        club: "Benfica",
        age: 20,
        position: "Defansif / Merkez Orta Saha",
        strengths:
          "Top kapma zamanlaması, alan kapatma ve direkt oyun kurulumunda dikine pas arayışları; üst seviye altı numara projeksiyonu çiziyor.",
      },
      {
        name: "Alejandro Garnacho",
        club: "Manchester United",
        age: 21,
        position: "Sol Kanat",
        strengths:
          "Bire birde adam eksiltme, içe kat edip şut tehdidi ve büyük maçlardaki cesur karar alma profiliyle sezonun en büyük sürprizlerinden biri.",
      },
    ],
  },
};

function resolvePageConfig(slug: string | undefined): PageConfig | null {
  if (!slug) return null;
  const config = CONTENT_BY_SLUG[slug];
  if (config) return config;

  return {
    title: slug.replace(/-/g, " "),
    intro:
      "Bu slug için özel bir içerik henüz hazırlanmadı. Yakında bu alanı zenginleştirilmiş analizlerle dolduracağız.",
    sections: [],
    players: [],
  };
}

function positionColor(position: string): string {
  const p = position.toLowerCase();
  if (p.includes("stoper") || p.includes("defans")) {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  }
  if (p.includes("orta") || p.includes("merkez") || p.includes("box")) {
    return "bg-sky-500/15 text-sky-300 border-sky-500/40";
  }
  if (p.includes("kanat") || p.includes("forvet") || p.includes("numara")) {
    return "bg-rose-500/15 text-rose-300 border-rose-500/40";
  }
  return "bg-slate-500/15 text-slate-200 border-slate-500/40";
}

export default function ListDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const config = resolvePageConfig(slug);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-[0_0_40px_rgba(16,185,129,0.7)]" />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-sm font-semibold tracking-[0.22em] text-transparent">
                SCOUT INTELLIGENCE
              </span>
            </Link>
            <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex">
              <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
                <IconHome /> Ana Sayfa
              </Link>
              <Link href="/listeler" className="flex items-center gap-1.5 text-emerald-300">
                <IconList /> Listeler
              </Link>
              <Link href="/radar" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
                <IconRadar /> Radar
              </Link>
              <Link href="/oyuncular" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
                <IconUsers /> Oyuncular
              </Link>
            </nav>
            <div className="flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 p-0.5 text-xs">
              <button className="rounded-full bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.5)]">
                TR
              </button>
              <button className="rounded-full px-3 py-1 text-slate-300 hover:text-emerald-200">
                EN
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-8 lg:py-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-300/90">
                  Liste İçeriği
                </p>
                <h1 className="mt-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent md:text-2xl">
                  {config?.title ?? "Liste Detayı"}
                </h1>
              </div>
              <Link
                href="/"
                className="rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-500/70 hover:text-emerald-200"
              >
                Ana sayfaya dön
              </Link>
            </div>

            <section className="mb-6 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
              <p className="text-sm leading-relaxed text-slate-200">
                {config?.intro}
              </p>

              {config?.sections.map((section) => (
                <div key={section.heading} className="mt-5">
                  <h2 className="text-sm font-semibold text-slate-50">
                    {section.heading}
                  </h2>
                  {section.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {section.description}
                    </p>
                  )}
                </div>
              ))}
            </section>

            {config?.players?.length ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Oyuncu Kartları
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    Toplam {config.players.length} oyuncu
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {config.players.map((player) => (
                    <div
                      key={player.name}
                      className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.9)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-50">
                            {player.name}
                          </h3>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {player.club} • {player.age} yaş
                          </p>
                        </div>
                        <span
                          className={[
                            "inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                            positionColor(player.position),
                          ].join(" ")}
                        >
                          {player.position}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-slate-200">
                        {player.strengths}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="mt-6 text-sm text-slate-300">
                Bu slug için henüz detaylı oyuncu kartları hazırlanmadı.
              </section>
            )}
          </div>
        </div>

        <footer className="border-t border-slate-800/80 bg-slate-950/90">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row">
            <span className="font-medium text-slate-300">
              Scout Intelligence
            </span>
            <div className="flex items-center gap-4">
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
            </div>
            <span className="text-[11px] text-slate-500">
              © 2026 Scout Intelligence
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}

