// app/team/page.tsx
import ScrollRouter from '@/app/ScrollRouter';
import SectionTeam from '@/components/SectionTeam';

export default function TeamPage() {
  return (
    <>
      <ScrollRouter />
      <div id="page" className="fullpage page-enter">
        <SectionTeam />
      </div>
    </>
  );
}
