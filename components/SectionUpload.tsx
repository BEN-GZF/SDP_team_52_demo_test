export default function SectionUpload(){
  return (
    <section id="upload" className="anchor">
      <div className="container section">
        <h2>Upload (Demo)</h2>
        <div style={{display:'grid', gap:16, gridTemplateColumns:'1.1fr 1fr', marginTop:16}}>
          <div className="card" style={{padding:18, minHeight:220}}>
            <div style={{opacity:.9, fontWeight:600}}>Upload</div>
            <div style={{
              marginTop:12, height:150, border:'1px dashed var(--ring)',
              borderRadius:14, display:'grid', placeItems:'center', color:'#8ea6cc'
            }}>
              Drag & drop file here (placeholder)
            </div>
          </div>
          <div className="card" style={{padding:18, minHeight:220}}>
            <div style={{opacity:.9, fontWeight:600}}>Result</div>
            <p style={{marginTop:12}}>Output preview will appear here.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
