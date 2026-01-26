import ContainerOrEpisodeList from "./_components/cms-list";
import ContainerDialog from "./_components/create-container-dialog";

export default function CMSHome () {
  return (
    <div className="bg-background overflow-x-auto min-h-screen min-w-[calc(100dvw-var(--sidebar-width)-0rem)] flex items-start justify-start">
      <div className="p-4 w-full flex flex-col">
        <h1 className="text-3xl font-bold">Medieinnhold</h1>
        <p>Legg til nytt innhold eller rediger medier, sesonger og episoder.</p>

        <div className="my-4 flex flex-row gap-2">
          <ContainerDialog triggerLabel={"Legg til ny"} className="w-fit h-8 rounded-sm py-0" />
        </div>
        <ContainerOrEpisodeList />
      </div>
    </div>
  )
}
