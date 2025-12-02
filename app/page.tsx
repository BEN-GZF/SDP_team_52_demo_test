// app/page.tsx
import ScrollRouter from '@/app/ScrollRouter';
import SectionHero from '@/components/SectionHero';

export default function HomePage() {
  return (
    <>
      <ScrollRouter />
      <div id="page" className="fullpage page-enter">
        <SectionHero />
      </div>
    </>
  );
}
