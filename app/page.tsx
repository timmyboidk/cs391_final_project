import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
      // Main Page Components Here (zach / alex)
      <div className="flex w-3/4 m-auto flex-col align-items-center bg-green-100 min-h-screen">
        <Header/>
          <p className="text-black text-2xl"> rest of components/content </p>
        <Footer/>
      </div>
  );
}
