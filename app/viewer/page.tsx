import ScrollRouter from "@/app/ScrollRouter";
import Viewer from "@/components/viewer";

export default function ViewerPage() {
  return (
    <>
      <ScrollRouter />
      <div
        id="page"
        className="fullpage page-enter"
        style={{ paddingTop: "50px" }}  
      >
        <Viewer />
      </div>
    </>
  );
}
