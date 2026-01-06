import ContainerOrEpisodeList from "./_components/cms-list";
import ContainerDialog from "./_components/create-container-dialog";

export default function CMSHome () {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Welcome to the CMS</h1>
        <ContainerOrEpisodeList />
        <ContainerDialog />
      </div>
    </div>
  )
}
