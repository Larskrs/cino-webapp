// ThemeInjection.tsx
export type ThemeColor = {
  primary?: string
  secondary?: string
  background?: string
  text?: string
}

export default function ThemeInjection({ color }: { color?: ThemeColor }) {
  if (!color) return null

  const vars: string[] = []

  if (color.background) {
    vars.push(`--background: ${color.background};`)
    vars.push(`background: ${color.background};`)
  }

  if (color.secondary) {
    vars.push(`--secondary: ${color.secondary};`)
  }

  if (color.primary) {
    vars.push(`--primary: ${color.primary};`)
  }

  if (color.text) {
    vars.push(`--text: ${color.text};`)
    vars.push(`--accent: ${color.text};`)
  }

  if (!vars.length) return null

  const css = `
    :root {
      ${vars.join("\n")}
    }
  `

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
