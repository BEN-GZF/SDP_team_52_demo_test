export default function SectionTeam(){
  const people = ['Kevin Chen', 'Ben (Zhefan Guo)', 'Reed Burdick',];
  return (
    <section id="team" className="anchor">
      <div className="container section">
        <h2>Team</h2>
        <div style={{display:'grid', gap:14, gridTemplateColumns:'repeat(4,1fr)', marginTop:14}}>
          {people.map(n=>(
            <div key={n} className="card" style={{padding:'14px 16px'}}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
