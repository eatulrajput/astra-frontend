import React from "react"

interface dataProp {
title:string
content:React.ReactNode
}

export const changelogData:dataProp[] = [
  {
    title: "2026",
    content: (
      <div>
        <p className="mb-8 text-xs font-normal text-neutral-800 md:text-2xl dark:text-neutral-200">
          Built and launched Astra AI
        </p>
      </div>
    ),
  },
  {
    title: "2025",
    content: (
      <div>
        <p className="mb-8 text-xs font-normal text-neutral-800 md:text-2xl dark:text-neutral-200">
          Figuring Out
        </p>
        <p className="mb-8 text-xs font-normal text-neutral-800 md:text-2xl dark:text-neutral-200">
          Lorem ipsum is for people who are too lazy to write copy. But we are
          not. Here are some more example of beautiful designs I built.
        </p>
      </div>
    ),
  },
  {
    title: "Initial Days",
    content: (
      <div>
        <p className="mb-4 text-xs font-normal text-neutral-800 md:text-2xl dark:text-neutral-200">
          Selection of project topic and planning
        </p>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-2xl dark:text-neutral-300">
            1. Team Plan
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-2xl dark:text-neutral-300">
            2. Mentor Approval
          </div>
        </div>
      </div>
    ),
  },
];