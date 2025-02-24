"use client";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Link from "next/link";
import MemoryGame from "@/app/games/memory/page";

export default function GamePage() {
  //const router = useRouter();
  //const { gameId } = router.query;
  /*
  const GameComponent = dynamic(() => import(`../../games/${gameId}/page`), {
    loading: () => <p>Loading...</p>,
    ssr: false, // Disable server-side rendering if needed
  });*/

  return(<h1>Hello</h1>)

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <Link href="/" legacyBehavior>
          <a className="mb-8 inline-block text-gray-600 hover:text-gray-800">
            ← Back to Home
          </a>
        </Link>
        {/*GameComponent && <MemoryGame />*/}
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { gameId: "memory" } },
      { params: { gameId: "quick" } },
      { params: { gameId: "trivia" } },
    ],
    fallback: false,
  };
}
