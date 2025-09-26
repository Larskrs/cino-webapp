import { usePostPreview } from "@/hooks/post-preview";
import { api } from "@/trpc/react";
import { PostCard } from "./post-card";

export default function PostPreviewDisplay() {
  const { post: postPreview, setPost: setPostPreview } = usePostPreview();

  return (
    <div
      onClick={(e) => {
        setPostPreview(undefined);
        e.stopPropagation();
      }}
      className="fixed inset-0 z-10 flex items-center justify-center backdrop-blur-sm"
    >
      {postPreview && <PostContent id={postPreview} />}
    </div>
  );
}

function PostContent({ id }: { id: number }) {
  const [post] = api.post.byId.useSuspenseQuery({ id });
  const [replies] = api.post.replies.useSuspenseQuery({ postId: id! });

  return (
    <div
       // prevent closing when clicking inside
      className="max-h-screen h-screen px-10 py-20  mx-auto items-center justify-center overflow-y-auto rounded-2xl shadow-lg"
    >
        <div onClick={(e) => e.stopPropagation()}>
          <PostCard post={{ ...(post as any) }} />
          <div className="mt-16 mx-auto flex flex-col gap-2">
            {replies.map((r) => (
              <PostCard key={r.id} post={{ ...(r as any) }} />
          ))}
        </div>
      </div>
    </div>
  );
}
