export default function SectionArchitecture(){
  return (
    <section id="architecture" className="anchor">
      <div className="container section">
        <h2>How it works</h2>
        <p style={{marginTop:8}}>A simple 3-step overview of our demo flow.</p>

        <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(3,1fr)', marginTop:18}}>
          {[
            {title:'1. Upload', desc:'User uploads an image from the web UI.'},
            {title:'2. Process', desc:'Backend stores the file (Supabase later), triggers model.'},
            {title:'3. Visualize', desc:'Result mesh displayed interactively on the page.'},
          ].map((s)=>(
            <div key={s.title} className="card" style={{padding:18}}>
              <div style={{fontWeight:700}}>{s.title}</div>
              <p style={{marginTop:8}}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{marginTop:18, padding:18, height:200, display:'grid', placeItems:'center', color:'#8ea6cc'}}>
          Placeholder for diagram / result preview
        </div>
      </div>
    </section>
  );
}
