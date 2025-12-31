// ThemeInjection.tsx
type ThemeColor = {
  primary: string
  secondary: string
  background: string
  text: string
}

export default function ThemeInjection({ color }: { color: ThemeColor }) {
  const css = `
    :root {
      --background: ${color.background};
      --secondary: ${color.secondary};
      --primary: ${color.primary};
      --accent: ${color.text};
    }
  `

  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
    />
  )
}
