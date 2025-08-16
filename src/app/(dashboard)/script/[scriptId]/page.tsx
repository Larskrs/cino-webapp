// app/project/[id]/page.tsx
import ScreenplayEditor from "./_components/ScreenplayEditor";
import MyEditor from "./editor";
import RichTextEditor from "./editor";

interface PageProps {
  params: Promise<{ scriptId: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const scriptId = (await params).scriptId;

  return (
    <div>
      {/* <ScreenplayEditor scriptId={scriptId} /> */}
      <MyEditor />
    </div>
  );
}
