import Image from "next/image";
import Link from "next/link";
import NavBarComponent from "@/components/NavBar";

export default function Home() {
  return (
    <>
      {/* <div>
        <Link href="/LogIn">Log In</Link>
        <Link href="/SignUp">Sign Up</Link>
      </div> */}
      <NavBarComponent />
    </>
  );
}
