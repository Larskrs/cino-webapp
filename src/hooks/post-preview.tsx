"use client";
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface PostPreviewContextValue {
  post: number | undefined;
  setPost: (theme: number | undefined) => void;
}
const PostPreviewContext = createContext<PostPreviewContextValue | undefined>(undefined);

export function PostPreviewProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [post, setPost] = useState<number | undefined>()

  return (
    <PostPreviewContext.Provider value={{ post: post, setPost: setPost }}>
      <body
      >
        {children}
      </body>
    </PostPreviewContext.Provider>
  );
}


export function usePostPreview() {
  const ctx = useContext(PostPreviewContext);
  if (!ctx) throw new Error("usePostPreview must be used within PostPreviewProvider");
  return ctx;
}