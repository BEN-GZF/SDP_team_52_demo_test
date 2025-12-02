import ScrollRouter from '@/app/ScrollRouter';
import UploadWidget from '@/components/Uploadwidget';

export default function UploadPage() {
  return (
    <>
      <ScrollRouter />
      <div id="page" className="fullpage page-enter">
        <UploadWidget />
      </div>
    </>
  );
}
