"use client";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Link from "next/link";

export default function GamePage() {
  const router = useRouter();
  const { gameId } = router.query;
  const GameComponent = dynamic(() => import(`../../games/${gameId}/page`));

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <Link href="/" legacyBehavior>
          <a className="mb-8 inline-block text-gray-600 hover:text-gray-800">
            ← Back to Home
          </a>
        </Link>
        {GameComponent && <GameComponent />}
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
