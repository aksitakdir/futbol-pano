export default function Home() {
  const players = [
    { name: "Arda Kaya", age: 18, club: "Galatasaray U19", value: "€3.5M" },
    { name: "Mert Demir", age: 19, club: "Fenerbahçe U19", value: "€2.8M" },
    { name: "Enes Yıldız", age: 17, club: "Beşiktaş U19", value: "€2.2M" },
    { name: "Can Karaca", age: 18, club: "Trabzonspor U19", value: "€1.9M" },
    { name: "Emir Sağlam", age: 19, club: "Adana Demirspor U19", value: "€1.5M" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Futbol Yetenek Panosu
      </h1>
      <p className="text-gray-500 mb-8">
        Genç yetenekleri keşfet, AI destekli analizler oku
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Örnek Oyuncu Listesi
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  İsim
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Yaş
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Kulüp
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Piyasa Değeri
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr
                  key={player.name}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-800 border-b">
                    {player.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {player.age}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {player.club}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-emerald-600 border-b">
                    {player.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}