// app/architecture/page.tsx
import ScrollRouter from '@/app/ScrollRouter';
import SectionArchitecture from '@/components/SectionArchitecture';

export default function ArchitecturePage() {
  return (
    <>
      <ScrollRouter />
      <div id="page" className="fullpage page-enter">
        <SectionArchitecture />
      </div>
    </>
  );
}