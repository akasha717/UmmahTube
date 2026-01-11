export default function Home() {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>UmmahTube</h1>
        <p>Halal video platform for the Ummah</p>
  
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <div>Video 1</div>
          <div>Video 2</div>
          <div>Video 3</div>
        </div>
  
        <footer style={{ marginTop: "4rem" }}>
          Supported by Suleiman Maumo
        </footer>
      </main>
    );
  }
  