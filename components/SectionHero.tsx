export default function SectionHero() {
  return (
    <section id="home" className="anchor">
      <div className="container">
        <div className="grid-2 items-center">
          <div>
            <h1 className="text-[32px] font-semibold text-white">
              UCONN - SDPTEAM52 - 3D Mesh Generation
            </h1>

            <p
              className="text-[14px] text-white/80 leading-[1.65] mt-3"
              style={{ maxWidth: 560 }}
            >
              A lightweight demo site to showcase our image-to-3D pipeline and
              project progress.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
