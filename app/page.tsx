export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Futbol Yetenek Panosu
      </h1>
      <p className="text-gray-500 mb-8">
        Genç yetenekleri keşfet, AI destekli analizler oku
      </p>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          En İyi 10 Genç Defans Oyuncusu
        </h2>
        <p className="text-sm text-gray-400">
          Yakında — API entegrasyonu yapılıyor
        </p>
      </div>
    </main>
  );
}