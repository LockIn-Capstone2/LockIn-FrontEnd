import Image from "next/image";
import Link from "next/link";
import NavBarComponent from "@/components/NavBar";

export default function Home() {
  return (
    <>
      <NavBarComponent />
      <div className="min-h-screen bg-[url('/Shapes.png')] bg-cover bg-center bg-no-repeat">
        {/* Your page content goes here */}
        <div className="p-8 text-white">
          <h1 className="text-4xl font-bold">Welcome to the Homepage</h1>
          <p className="mt-4">
            This content appears over the background image.
          </p>
        </div>
      </div>
    </>
  );
}
