import ScrollRouter from "@/app/ScrollRouter";
import TextGenerateWidget from "@/components/textuploadwidget";

export default function TextGeneratePage() {
  return (
    <>
      <ScrollRouter />
      <div id="page" className="fullpage page-enter">
        <TextGenerateWidget />
      </div>
    </>
  );
}
