// app/gallery/page.tsx

import ScrollRouter from '@/app/ScrollRouter';
import SectionGallery from '@/components/sectiongallery';

export default function GalleryPage() {
  return (
    <>
      <ScrollRouter />
      <div id="page" className="fullpage page-enter">
        <SectionGallery />
      </div>
    </>
  );
}
