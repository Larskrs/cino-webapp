"use client"
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { motion } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { LINE_TYPES, LINE_STYLES, type LineTypeKey } from "./lineTypes"

export interface LineData {
  id: string
  index: number
  type: LineTypeKey
  content: string
}

const A4_RATIO = 1 / Math.SQRT2
const BASE_A4_WIDTH_PX = 595
const BASE_FONT_PX = 20

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function getLineIdAtIndex(lines: { id: string }[], index: number): string | null | undefined {
  if (index < 0 || index >= lines.length) return null
  return lines?.[index]?.id
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function setCaretPosition(el: HTMLElement, pos: number) {
  el.focus()
  const range = document.createRange()
  const sel = window.getSelection()
  if (!sel) return
  const child = el.firstChild
  if (child && child.nodeType === Node.TEXT_NODE) {
    range.setStart(child, Math.min(pos, child.textContent?.length ?? 0))
    range.collapse(true)
  } else {
    range.selectNodeContents(el)
    range.collapse(false)
  }
  sel.removeAllRanges()
  sel.addRange(range)
}

function useSize<T extends HTMLElement>(): [React.RefObject<T>, { width: number; height: number }] {
  const ref = useRef<T>(null)
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const cr = e.contentRect
        setSize({ width: cr.width, height: cr.height })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, { width, height }]
}

function useLineHeights() {
  const mapRef = useRef<Map<string, number>>(new Map())
  const observers = useRef<Map<string, ResizeObserver>>(new Map())

  const observe = useCallback((id: string, el: HTMLElement | null) => {
    const prev = observers.current.get(id)
    if (prev) prev.disconnect()
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        mapRef.current.set(id, e.contentRect.height)
      }
    })
    ro.observe(el)
    observers.current.set(id, ro)
  }, [])

  const get = useCallback((id: string) => mapRef.current.get(id) ?? 0, [])
  const snapshot = useCallback(() => new Map(mapRef.current), [])

  useEffect(() => () => observers.current.forEach((o) => o.disconnect()), [])

  return { observe, get, snapshot }
}

function paginate(lines: LineData[], heights: Map<string, number>, pageInnerHeight: number, gap: number) {
  const pageById = new Map<string, number>()
  let currentPage = 0
  let y = 0
  for (const line of lines) {
    const h = heights.get(line.id) ?? 24
    const needed = y === 0 ? h : h + gap
    if (y + needed > pageInnerHeight) {
      currentPage += 1
      y = h
      pageById.set(line.id, currentPage)
    } else {
      pageById.set(line.id, currentPage)
      y += needed
    }
  }
  return pageById
}

function lineClass(type: LineTypeKey) {
  switch (type) {
    case "scene":
      return "uppercase tracking-wide font-semibold font-black"
    case "action":
      return ""
    case "character":
      return "text-center uppercase"
    case "dialogue":
      return "pl-[12%] pr-[20%]"
    case "parenthetical":
      return "pl-[10%] italic"
    case "transition":
      return "uppercase text-right pr-[5%]"
    default:
      return ""
  }
}

interface LineToolbarProps {
  value: LineTypeKey;
  onTypeChange: (t: LineTypeKey) => void;
  onRemove: () => void;
}

export function LineToolbar({ value, onTypeChange, onRemove }: LineToolbarProps) {
  const types: LineTypeKey[] = ["scene_header", "action", "character", "dialogue", "parenthetical", "transition"];

  const SelectedIcon = LINE_TYPES[value as LineTypeKey]?.icon || LINE_TYPES.action.icon;

  return (
    <div className="absolute -left-10 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity select-none">
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer flex items-center justify-center text-xs border rounded px-1 py-0.5 bg-white dark:bg-neutral-800">
          <SelectedIcon className="size-5" />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-32">
          {types.map((t) => {
            const Icon = LINE_TYPES?.[t]?.icon;
            return (
              <DropdownMenuItem
                key={t}
                className={value === t ? "font-semibold flex items-center gap-2" : "flex items-center gap-2"}
                onClick={() => onTypeChange(t)}
              >
                <Icon className="w-4 h-4" />
                <span>{LINE_TYPES[t].displayName}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        className="text-xs border rounded px-1 py-0.5 bg-red-500 text-white hover:bg-red-600"
        onClick={onRemove}
        title="Delete line"
      >
        ✕
      </button>
    </div>
  );
}

export default function ScreenplayEditor() {
  const [lines, setLines] = useState<LineData[]>([
    { id: uid(), index: 0, type: "scene_header", content: "INT. LOCATION - DAY" },
    { id: uid(), index: 1, type: "action", content: "A quick description." },
  ])

  // Get all lines with a specific type
  const getLinesByType = useCallback((type: LineTypeKey): LineData[] => {
    return lines.filter(line => line.type === type)
  }, [lines])
  
  // Get all unique character names (content of lines with type "character"), case-insensitive
  const getAllCharacters = useCallback((): string[] => {
    const characterLines = lines.filter(line => line.type === "character")
    const uniqueNames = new Set<string>()
    characterLines.forEach(line => {
      const name = line.content.trim().toUpperCase() // normalize to uppercase
      if (name) uniqueNames.add(name)
    })
    return Array.from(uniqueNames)
  }, [lines])

  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [cursorOffset, setCursorOffset] = useState<number>(0)
  const [pagePaddingPx, setPagePaddingPx] = useState(48)

  const [pageRef, pageSize] = useSize<HTMLDivElement>()
  const fontSize = useMemo(() => clamp((pageSize.width / BASE_A4_WIDTH_PX) * BASE_FONT_PX, 14, 24), [pageSize.width])

  useEffect(() => setPagePaddingPx(Math.round(fontSize * 3)), [fontSize])

  const { observe, snapshot } = useLineHeights()
  const gapPx = Math.round(fontSize * 0.6)

  const [pageOfLine, setPageOfLine] = useState<Map<string, number>>(new Map())
  const pageCount = useMemo(() => Math.max(-1, ...Array.from(pageOfLine.values())) + 1, [pageOfLine])

  useLayoutEffect(() => {
    const heights = snapshot()
    const innerHeight = pageSize.height - pagePaddingPx * 2
    if (innerHeight > 0) {
      setPageOfLine(paginate([...lines].sort((a, b) => a.index - b.index), heights, innerHeight, gapPx))
    }
  }, [lines, snapshot, pageSize.height, pagePaddingPx, gapPx])

  const updateLine = useCallback((id: string, patch: Partial<LineData>) => {
    setLines(prev => {
      const i = prev.findIndex(l => l.id === id)
      if (i === -1) return prev
      const next = [...prev]
      next[i] = { ...next[i], ...patch }
      return next
    })
  }, [])
  const removeLine = useCallback((id: string) => setLines(prev => prev.filter(l => l.id !== id).map((l, i) => ({ ...l, index: i }))), [])
  const insertLineAfter = useCallback((afterId: string, line?: Partial<LineData>) => {
    const newId = uid()
    setLines(prev => {
      const out: LineData[] = []
      prev.slice().sort((a, b) => a.index - b.index).forEach(l => {
        out.push(l)
        if (l.id === afterId) {
          out.push({ id: newId, type: line?.type ?? "action", content: line?.content ?? "", index: l.index + 0.5 })
        }
      })
      return out.map((l, i) => ({ ...l, index: i }))
    })
    return newId
  }, [])

  function nextTypeAfter(t: LineTypeKey): LineTypeKey {
    switch (t) {
      case "scene_header": return "action"
      case "character": return "dialogue"
      case "dialogue": return "action"
      default: return "action"
    }
  }

  const pages = useMemo(() => {
    const byPage: Record<number, LineData[]> = {}
    lines.forEach(l => {
      const p = pageOfLine.get(l.id) ?? 0
      if (!byPage[p]) byPage[p] = []
      byPage[p].push(l)
    })
    Object.keys(byPage).forEach(p => byPage[+p].sort((a, b) => a.index - b.index))
    return byPage
  }, [lines, pageOfLine])

  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const draftTimeout = useRef<number | null>(null)
  useEffect(() => () => { if (draftTimeout.current) window.clearTimeout(draftTimeout.current) }, [])
  const commitDraft = useCallback((id: string) => setLines(prev => prev.map(l => l.id === id ? { ...l, content: drafts[id] ?? l.content } : l)), [drafts])

const handleKeyDown = useCallback(
  (e: React.KeyboardEvent<HTMLDivElement>, line: LineData) => {
    const sel = window.getSelection()
    const offset = sel?.anchorOffset ?? 0

    if (e.key === "Enter") {
      e.preventDefault()
      commitDraft(line.id)

      // Figure out current page of this line
      const currentPage = pageOfLine.get(line.id) ?? 0
      const targetPage = currentPage + 1

      // If the next page exists but isn't visible, force load it
      if (targetPage < pageCount && !visiblePages.has(targetPage)) {
        setVisiblePages(prev => new Set([...Array.from(prev), targetPage]))
      }
    
      // Insert line after
      const newId = insertLineAfter(line.id, { type: nextTypeAfter(line.type) })
    
      // Focus the new line
      setTimeout(() => {
        const next = document.querySelector(`[data-line-id="${newId}"]`) as HTMLElement | null
        if (next) {
          setFocusedId(newId)
          setCursorOffset(0)
          setTimeout(() => setCaretPosition(next, 0), 0)
        }
      }, 0)
    } else if (e.key === "Backspace") {
      const text = drafts[line.id] ?? line.content
      if (text.length === 0) {
        e.preventDefault()
        const prevId = getLineIdAtIndex(lines, line.index - 1)
        removeLine(line.id)
        if (prevId) {
          setTimeout(() => {
            const prevEl = document.querySelector(`[data-line-id="${prevId}"]`) as HTMLElement | null
            if (prevEl) {
              setFocusedId(prevId)
              setCursorOffset(prevEl.innerText.length)
              setTimeout(() => setCaretPosition(prevEl, prevEl.innerText.length), 0)
            }
          }, 0)
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const prevId = getLineIdAtIndex(lines, line.index - 1)
      if (prevId) {
        const prevEl = document.querySelector(`[data-line-id="${prevId}"]`) as HTMLElement | null
        if (prevEl) {
          setFocusedId(prevId)
          setCursorOffset(prevEl.innerText.length)
          setTimeout(() => setCaretPosition(prevEl, prevEl.innerText.length), 0)
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const nextId = getLineIdAtIndex(lines, line.index + 1)
      if (nextId) {
        const nextEl = document.querySelector(`[data-line-id="${nextId}"]`) as HTMLElement | null
        if (nextEl) {
          setFocusedId(nextId)
          setCursorOffset(nextEl.innerText.length)
          setTimeout(() => setCaretPosition(nextEl, nextEl.innerText.length), 0)
        }
      }
    } else {
      setCursorOffset(offset)
    }
  },
  [lines, drafts, commitDraft, insertLineAfter, removeLine]
)

  const handleInput = useCallback((id: string, value: string) => {
    setDrafts(prev => ({ ...prev, [id]: value }))
    if (draftTimeout.current) window.clearTimeout(draftTimeout.current)
    draftTimeout.current = window.setTimeout(() => commitDraft(id), 500)
  }, [commitDraft])

  useEffect(() => {
    if (focusedId) {
      const el = document.querySelector(`[data-line-id="${focusedId}"]`) as HTMLElement | null
      if (el) setCaretPosition(el, cursorOffset)
    }
  }, [focusedId, cursorOffset])

  // Visible pages state
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set([0]))
  const observerRef = useRef<IntersectionObserver>(null)
  useEffect(() => {
  observerRef.current = new IntersectionObserver(
    (entries) => {
      setVisiblePages(prev => {
        const newVisible = new Set(prev)
        entries.forEach(entry => {
          const pageIndex = Number(entry.target.getAttribute("data-page-index"))
          if (entry.isIntersecting) newVisible.add(pageIndex)
          else newVisible.delete(pageIndex)
        })
        return newVisible
      })
    },
    { root: null, threshold: 0.01 }
  )
  return () => observerRef.current?.disconnect()
}, [])

  return (
    <div className="w-full min-h-[100dvh] bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col items-center py-8">
      <div className="w-full max-w-5xl px-4 flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Screenplay Editor</h1>
        <div className="text-sm opacity-70">Font: {Math.round(fontSize)}px · Pages: {pageCount || 1}</div>
      </div>
      <div className="flex flex-col items-center gap-8 w-full">
        {Array.from({ length: Math.max(1, pageCount || 1) }).map((_, pageIndex) => (
          <motion.div
            key={pageIndex}
            data-page-index={pageIndex}
            ref={el => { if (el) observerRef.current?.observe(el) }}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-neutral-800 shadow-xl rounded-2xl overflow-hidden"
            style={{ aspectRatio: `${1}/${1 / A4_RATIO}`, width: "min(100%, 820px)", fontSize: `${fontSize}px` }}
          >
            {pageIndex === 0 && <div ref={pageRef} className="absolute inset-0 pointer-events-none" />}
            <div className="absolute inset-0" style={{ padding: pagePaddingPx }}>
              <div className="flex flex-col" style={{ gap: gapPx }}>
                {visiblePages.has(pageIndex) &&
                  (pages[pageIndex] || []).map((line) => (
                    <Line
                      key={line.id}
                      line={line}
                      draft={drafts[line.id]}
                      focusedId={focusedId}
                      cursorOffset={cursorOffset}
                      observe={observe}
                      updateLine={updateLine}
                      removeLine={removeLine}
                      handleInput={handleInput}
                      handleKeyDown={handleKeyDown}
                      commitDraft={commitDraft}
                      setFocusedId={setFocusedId}
                    />
                ))}
              </div>
            </div>
            <div className="absolute bottom-2 right-4 text-xs opacity-50 select-none">{pageIndex + 1}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}



interface CharacterDropdownProps {
  lineId: string
  lines: LineData[]
  inputValue: string
  onSelect: (value: string) => void
  onClose: () => void
}

export function CharacterDropdown({ lineId, lines, inputValue, onSelect, onClose }: CharacterDropdownProps) {
  const [filtered, setFiltered] = useState<string[]>([])
  const [highlightIndex, setHighlightIndex] = useState(0)

  // Gather all character names from lines, uppercased, unique
  const getAllCharacters = useCallback(() => {
    const chars = lines
      .filter(l => l.type === "character" && l.content.trim())
      .map(l => l.content.toUpperCase())
    return Array.from(new Set(chars))
  }, [lines])

  useEffect(() => {
    if (!inputValue) return setFiltered([])
    const allChars = getAllCharacters()
    const matches = allChars.filter(c => c.startsWith(inputValue.toUpperCase()))
    setFiltered(matches)
    setHighlightIndex(0)
  }, [inputValue, getAllCharacters])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!filtered.length) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex(prev => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      onSelect(filtered[highlightIndex])
      onClose()
    } else if (e.key === "Escape") {
      onClose()
    }
  }, [filtered, highlightIndex, onSelect, onClose])

  if (!filtered.length) return null

  return (
    <div
      className="absolute z-50 bg-white dark:bg-neutral-800 border rounded shadow mt-1 w-max max-w-xs"
      onKeyDown={handleKeyDown}
    >
      {filtered.map((c, i) => (
        <div
          key={c}
          className={`px-2 py-1 cursor-pointer ${i === highlightIndex ? "bg-sky-500 text-white" : ""}`}
          onMouseDown={(e) => { e.preventDefault(); onSelect(c); onClose() }}
        >
          {c}
        </div>
      ))}
    </div>
  )
}

interface LineProps {
  line: LineData
  draft: string | undefined
  focusedId: string | null
  cursorOffset: number
  observe: (id: string, el: HTMLElement | null) => void
  updateLine: (id: string, patch: Partial<LineData>) => void
  removeLine: (id: string) => void
  handleInput: (id: string, value: string) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, line: LineData) => void
  commitDraft: (id: string) => void
  setFocusedId: (id: string) => void
}

const Line = React.memo(function Line({
  line,
  draft,
  focusedId,
  cursorOffset,
  observe,
  updateLine,
  removeLine,
  handleInput,
  handleKeyDown,
  commitDraft,
  setFocusedId,
}: LineProps) {
  return (
    <div className="group relative">
      <LineToolbar
        value={line.type}
        onTypeChange={t => updateLine(line.id, { type: t })}
        onRemove={() => removeLine(line.id)}
      />

      {line.type === "character" && focusedId === line.id && (
        <CharacterDropdown
          lineId={line.id}
          lines={[]} // inject only what you need
          inputValue={draft ?? line.content}
          onSelect={(value) => updateLine(line.id, { content: value })}
          onClose={() => {/* close dropdown */}}
        />
      )}

      <div
        data-line-id={line.id}
        data-line-index={line.index}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        className={
          "outline-none focus:ring-2 ring-black/40 rounded px-2 -mx-2 " +
          "whitespace-pre-wrap break-words leading-relaxed " +
          lineClass(line.type)
        }
        onFocus={() => setFocusedId(line.id)}
        onBlur={() => commitDraft(line.id)}
        onInput={(e) => handleInput(line.id, e.currentTarget.innerText)}
        onKeyDown={(e) => handleKeyDown(e, line)}
        ref={(el) => {
          observe(line.id, el)
          if (el && el.innerText !== (draft ?? line.content)) {
            el.innerText = draft ?? line.content
          }
        }}
      />
    </div>
  )
})