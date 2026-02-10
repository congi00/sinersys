import Image from "next/image";
import Header from "./components/Header";
import MenuButton from "./components/MenuButton";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-[#F4F7FA]">
      <main className="flex min-h-[96dvh] w-full max-w-3xl flex-col items-center justify-between bg-[#004D8A] sm:items-start rounded-3xl">
        <Header />
        <MenuButton />
      </main>
    </div>
  );
}
