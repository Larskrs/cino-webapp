// app/project/[id]/page.tsx
import MyEditor from "@/components/editor";

interface PageProps {
  params: Promise<{ scriptId: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const scriptId = (await params).scriptId;

  return (
    <div className="">
      {/* <ScreenplayEditor scriptId={scriptId} /> */}
      <MyEditor scriptId={scriptId} />
    </div>
  );
}
