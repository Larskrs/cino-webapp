"use client";

import { cn } from "@/lib/utils";
import { useSession, signIn } from "next-auth/react";
import { api } from "@/trpc/react";
import { ProjectList } from "@/app/_components/projects/list-projects";
import { motion } from "framer-motion";

export default function ProjectPage() {
  const session = useSession();

  if (session.status === "loading") {
    return (
      <main className={cn("flex min-h-screen flex-col items-center justify-center")}>
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <motion.p
          className="mt-4 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
        >
          Loading your projects...
        </motion.p>
      </main>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <main className={cn("flex min-h-screen flex-col items-center justify-center")}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-lg">Hei! Du er nødt til å være logget inn for å lage prosjekter.</p>
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
          >
            Log In
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className={cn("flex w-full min-h-screen flex-col items-center justify-start")}>
      <div className="max-w-5xl w-full flex flex-col items-center justify-start gap-4 px-4 pt-4">
        <div className="max-w-5xl w-full flex flex-col gap-2">
          {session?.data?.user && <ProjectList />}
        </div>
      </div>
    </main>
  );
}
