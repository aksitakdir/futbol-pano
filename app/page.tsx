export default function Home() {
  const players = [
    {
      name: "Arda Kaya",
      age: 18,
      club: "Galatasaray U19",
      value: "€3.5M",
      position: "Ofansif Orta Saha",
    },
    {
      name: "Mert Demir",
      age: 19,
      club: "Fenerbahçe U19",
      value: "€2.8M",
      position: "Santrafor",
    },
    {
      name: "Enes Yıldız",
      age: 17,
      club: "Beşiktaş U19",
      value: "€2.2M",
      position: "Stoper",
    },
    {
      name: "Can Karaca",
      age: 18,
      club: "Trabzonspor U19",
      value: "€1.9M",
      position: "Sol Bek",
    },
    {
      name: "Emir Sağlam",
      age: 19,
      club: "Adana Demirspor U19",
      value: "€1.5M",
      position: "Merkez Orta Saha",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/80">
              Scout Intelligence
            </p>
            <h1 className="mt-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl lg:text-5xl">
              Futbol Yetenek Panosu
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300/80 md:text-base">
              Avrupa&apos;nın dört bir yanındaki genç yetenekleri gerçek zamanlı
              veriler ve AI destekli analizlerle takip et.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/30 bg-slate-900/70 px-4 py-3 shadow-[0_0_40px_rgba(16,185,129,0.25)] backdrop-blur">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 ring-2 ring-emerald-400/60" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-300/90">
                Canlı Durum
              </p>
              <p className="text-sm text-slate-100">
                5 öne çıkan yetenek listelendi
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/70 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/15 via-cyan-500/10 to-transparent blur-3xl" />

            <div className="relative flex items-center justify-between px-5 pt-4 pb-3 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                  Öne Çıkan Oyuncular
                </h2>
                <p className="mt-1 text-xs text-slate-300/80">
                  Son 12 ayda performans verileri ile öne çıkan 5 genç yetenek
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/40">
                U19 Segmenti
              </span>
            </div>

            <div className="relative overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-slate-900/80">
                    <th className="sticky left-0 z-10 border-b border-slate-700/80 bg-slate-900/90 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      #
                    </th>
                    <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Oyuncu
                    </th>
                    <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Pozisyon
                    </th>
                    <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Yaş
                    </th>
                    <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Kulüp
                    </th>
                    <th className="border-b border-slate-700/80 px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Piyasa Değeri
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr
                      key={player.name}
                      className="group transition-all duration-200 hover:bg-slate-800/70 hover:shadow-[0_0_0_1px_rgba(45,212,191,0.4)]"
                    >
                      <td className="sticky left-0 z-10 border-b border-slate-800/80 bg-slate-900/80 px-3 py-3 text-xs font-semibold text-slate-300">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/80 text-[11px] text-emerald-300 ring-1 ring-emerald-500/40">
                          {index + 1}
                        </span>
                      </td>
                      <td className="border-b border-slate-800/80 px-3 py-3 text-sm font-medium text-slate-100">
                        <span className="block">{player.name}</span>
                      </td>
                      <td className="border-b border-slate-800/80 px-3 py-3 text-xs font-medium text-emerald-300">
                        {player.position}
                      </td>
                      <td className="border-b border-slate-800/80 px-3 py-3 text-xs text-slate-300">
                        {player.age}
                      </td>
                      <td className="border-b border-slate-800/80 px-3 py-3 text-xs text-slate-300">
                        {player.club}
                      </td>
                      <td className="border-b border-slate-800/80 px-3 py-3 text-right text-sm font-semibold text-emerald-300">
                        {player.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Pano Özeti
              </h3>
              <p className="mt-3 text-sm text-slate-200">
                Bu demo pano, gerçek bir scout ekibinin kullanacağı profesyonel
                bir spor veri platformu hissi vermek için tasarlandı. Oyuncu
                kartları, pozisyon bazlı filtreler ve gelişmiş metrikler kolayca
                eklenebilir.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-slate-800/70 p-3">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Ortalama Yaş
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-50">
                    18.2
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-800/70 p-3">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Toplam Değer
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-emerald-300">
                    €11.9M
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/40 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Yakında
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-200">
                <li className="flex items-center justify-between">
                  <span>Gerçek API entegrasyonu</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/40">
                    Planlandı
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Gelişmiş metrik panosu</span>
                  <span className="rounded-full bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-200">
                    Tasarım
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Scout notları &amp; raporlar</span>
                  <span className="rounded-full bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-200">
                    Tasarım
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}