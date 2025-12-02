// app/gallery/page.tsx
import ScrollRouter from '@/app/ScrollRouter';
import SectionHero from '@/components/SectionHero';
import SectionTeam from '@/components/SectionTeam';

export default function HomePage() {
  return (
    <>
      <ScrollRouter />
      <div id="page" className="fullpage page-enter">

        <SectionHero />

        <SectionTeam />

      </div>
    </>
  );
}
