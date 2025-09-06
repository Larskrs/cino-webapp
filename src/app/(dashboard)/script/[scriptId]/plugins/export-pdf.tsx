"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { LineNode } from "../LineNode";
import { LINE_STYLES } from "../lineTypes";
import { getScenesWithIndex } from "../utils";
import { File, LucidePartyPopper, SendHorizonal } from "lucide-react";

type ScriptMetadata = {
  title: string;
  author: string;
  version?: string;
  color?: string;
  productionCompany?: string;
};

type ExportPDFButtonProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export function ExportPDFButton({ containerRef }: ExportPDFButtonProps) {
  const [editor] = useLexicalComposerContext();
  const [scenes, setScenes] = useState<{ index: number; text: string; node: LineNode; }[]>()

  useEffect(() => {
    const updateScenes = () => {
      editor.update(() => {
        setScenes(getScenesWithIndex(editor));
      });
    };
    updateScenes();

    const unregister = editor.registerUpdateListener(() => {
      updateScenes();
    });
    return () => unregister();
  }, [editor]);

  const exportPDF = (metadata: ScriptMetadata) => {
    const container = containerRef.current;
    if (!container) return;
  
    const linesDom = container.querySelectorAll<HTMLElement>(
      ".line-scene, .line-action, .line-character, .line-dialogue, .line-parenthetical, .line-transition"
    );
  
    if (!linesDom || linesDom.length === 0) return;
  
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 72;
    const lineHeight = 20;
  
    // Metadata page
    pdf.setFont("courier", "bold");
    pdf.setFontSize(28);
    pdf.text(metadata.title, pageWidth / 2, pageHeight / 4, { align: "center" });
    pdf.setFontSize(14);
    pdf.setFont("courier", "normal");
  
    let y = pageHeight / 2;
    [
      `Author: ${metadata.author}`,
      metadata.version && `Version: ${metadata.version}`,
      metadata.color && `Color: ${metadata.color}`,
      metadata.productionCompany && `Production Company: ${metadata.productionCompany}`,
      `Total Scenes: ${scenes?.length}`,
    ]
      .filter(Boolean)
      .forEach((line) => {
        pdf.text(line as string, pageWidth / 2, y, { align: "center" });
        y += lineHeight * 1.5;
      });
  
    pdf.addPage();

    // Reset font size for script content
    pdf.setFont("courier", "normal");
    pdf.setFontSize(12); // or whatever size you want for script lines
    
    // Script content
    let yPos = margin;
    let sceneCounter = 0;
    
    const addPageNumber = () => {
      const pageNum = pdf.internal.pages.length;
      pdf.setFont("courier", "normal");
      pdf.setFontSize(10);
      pdf.text(`Page ${pageNum-2}`, pageWidth - margin, pageHeight - 30, { align: "right" });
    };
    
    linesDom.forEach((lineEl) => {
      const type = lineEl.dataset.lineType || "action";
      let content = lineEl.textContent || "";
      let fontStyle: "normal" | "bold" | "italic" = "normal";
      let align: "left" | "center" | "right" = "left";
      let x = margin;
    
      switch (type) {
        case "scene":
          sceneCounter += 1;
          content = `SCENE ${sceneCounter}: ${content.toUpperCase()}`;
          fontStyle = "bold";
          break;
        case "character":
          content = content.toUpperCase();
          fontStyle = "bold";
          align = "center";
          break;
        case "dialogue":
          x += 90;
          break;
        case "parenthetical":
          content = `(${content})`;
          fontStyle = "italic";
          x += 70;
          break;
        case "transition":
          content = `${content.toUpperCase()}:`;
          fontStyle = "bold";
          align = "right";
          x = pageWidth - margin;
          break;
      }
    
      pdf.setFont("courier", fontStyle);
      pdf.setFontSize(12); // <-- ensure each line has consistent font size
    
      const wrapped = pdf.splitTextToSize(content, pageWidth - x - margin);
      wrapped.forEach((line: string) => {
        pdf.text(line, align === "center" ? pageWidth / 2 : x, yPos, { align: align as any });
        yPos += lineHeight;
      });
      yPos += 8;
    
      if (yPos > pageHeight - margin) {
        addPageNumber();
        pdf.addPage();
        yPos = margin;
        pdf.setFont("courier", "normal");
        pdf.setFontSize(12); // reset font size for new page
      }
    });
  
    // Add page number for last page
    addPageNumber();
  
    // Add total page count on first page
    const totalPages = pdf.internal.pages.length;
    pdf.setPage(1);
    pdf.setFont("courier", "normal");
    pdf.setFontSize(12);
    pdf.text(`Total Pages: ${totalPages-2}`, pageWidth / 2, pageHeight - 50, { align: "center" });
  
    pdf.save(`${metadata.title.replace(/\s+/g, "_")}.pdf`);
  };


  return <Button onClick={() => exportPDF({ title: "Manus Anus", author: "Eg/Meg" })}><File/></Button>;
}
