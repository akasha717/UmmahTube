export default function Home() {
  return (
    <main className="min-h-screen bg-emerald-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-emerald-700">
          🕌 UmmahTube
        </h1>
        <button className="px-4 py-2 rounded bg-emerald-600 text-white">
          Sign In
        </button>
      </header>

      <section className="px-6 py-10">
        <h2 className="text-xl font-semibold mb-4">
          Latest Islamic Videos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((v) => (
            <div
              key={v}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="h-40 bg-emerald-100 rounded mb-3" />
              <h3 className="font-medium">
                Islamic Video Title
              </h3>
              <p className="text-sm text-gray-500">
                By Ummah Contributor
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-16 py-6 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} UmmahTube</p>
        <p className="mt-1">
          Supported by <strong>Suleiman Maumo</strong>
        </p>
      </footer>
    </main>
  );
}
