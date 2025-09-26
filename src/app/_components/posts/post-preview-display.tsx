import { useEffect } from "react";
import { usePostPreview } from "@/hooks/post-preview";
import { api } from "@/trpc/react";
import { PostCard } from "./post-card";

export default function PostPreviewDisplay() {
  const { post: postPreview, setPost: setPostPreview } = usePostPreview();

  // Prevent body scroll when preview is open
  useEffect(() => {
    if (postPreview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [postPreview]);

  if (!postPreview) return null;

  return (
    <div
      onClick={(e) => {
        setPostPreview(undefined);
        e.stopPropagation();
      }}
      className="fixed inset-0 z-10 flex justify-center overflow-y-auto backdrop-blur-sm"
    >
      <PostContent id={postPreview} />
    </div>
  );
}

function PostContent({ id }: { id: number }) {
  const [post] = api.post.byId.useSuspenseQuery({ id });
  const [replies] = api.post.replies.useSuspenseQuery({ postId: id! });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-20 mb-20 max-w-2xl w-full"
    >
      <PostCard post={{ ...(post as any) }} />
      <div className="mt-16 flex flex-col gap-2">
        {replies.map((r) => (
          <PostCard key={r.id} post={{ ...(r as any) }} />
        ))}
      </div>
    </div>
  );
}
