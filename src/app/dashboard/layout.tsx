export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="grid grid-cols-[16em_1fr] p-0 gap-0 w-screen h-screen">
            <aside className="bg-neutral-900">

            </aside>
            
            <main className="bg-neutral-950 overflow-y-auto">{children}</main>
        </div>
    )
}