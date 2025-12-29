import { SelectedMediaProvider } from "./_components/selected-media-hook";

export default function Layout({ children }:{children: React.ReactNode}) {
  return (
    <SelectedMediaProvider>
      {children}
    </SelectedMediaProvider>
  );
}
