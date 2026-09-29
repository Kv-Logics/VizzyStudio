import jsPDF from 'jspdf';
import { StoryMetadata, StoryPanel } from '../types';

export async function exportStoryToPDF(metadata: StoryMetadata, panels: StoryPanel[]) {
  if (panels.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Page 1: Cover Page
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Title
  pdf.setTextColor(254, 240, 138); // amber-200
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.text(metadata.title.toUpperCase(), pageWidth / 2, 45, { align: 'center' });

  // Subtitle / Genre
  pdf.setTextColor(203, 213, 225);
  pdf.setFontSize(14);
  pdf.text(`GENRE: ${metadata.genre.toUpperCase()} | STYLE: ${metadata.visualStyle.toUpperCase()}`, pageWidth / 2, 60, { align: 'center' });

  // Synopsis Box
  pdf.setDrawColor(217, 119, 6);
  pdf.setLineWidth(1);
  pdf.rect(25, 75, pageWidth - 50, 45);

  pdf.setFontSize(11);
  pdf.setTextColor(226, 232, 240);
  const synopsisLines = pdf.splitTextToSize(metadata.synopsis, pageWidth - 60);
  pdf.text(synopsisLines, 30, 88);

  // Author & Vizzy credit
  pdf.setFontSize(10);
  pdf.setTextColor(148, 163, 184);
  pdf.text(`Created with Vizzy AI Graphic Novel Studio — Author: ${metadata.author}`, pageWidth / 2, 175, { align: 'center' });

  // Render Story Panels (2 panels per page)
  for (let i = 0; i < panels.length; i += 2) {
    pdf.addPage();
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    const panel1 = panels[i];
    const panel2 = panels[i + 1];

    const pWidth = 120;
    const pHeight = 67.5;

    // Panel 1 Left
    if (panel1 && panel1.selectedOption?.imageUrl) {
      try {
        pdf.addImage(panel1.selectedOption.imageUrl, 'PNG', 18, 25, pWidth, pHeight);
        pdf.setDrawColor(217, 119, 6);
        pdf.rect(18, 25, pWidth, pHeight);

        // Title & Description
        pdf.setTextColor(254, 240, 138);
        pdf.setFontSize(12);
        pdf.text(`Panel ${i + 1}: ${panel1.title}`, 18, 100);

        pdf.setTextColor(203, 213, 225);
        pdf.setFontSize(9);
        const desc1 = pdf.splitTextToSize(panel1.description, pWidth);
        pdf.text(desc1, 18, 108);

        // Captions / Dialogue text
        if (panel1.textElements && panel1.textElements.length > 0) {
          pdf.setFontSize(8);
          pdf.setTextColor(251, 191, 36);
          panel1.textElements.forEach((elem, eIdx) => {
            if (eIdx < 3) {
              pdf.text(`• ${elem.speaker ? elem.speaker + ': ' : ''}"${elem.content}"`, 18, 125 + eIdx * 6);
            }
          });
        }
      } catch (err) {
        console.error('Error embedding image into PDF', err);
      }
    }

    // Panel 2 Right
    if (panel2 && panel2.selectedOption?.imageUrl) {
      try {
        pdf.addImage(panel2.selectedOption.imageUrl, 'PNG', 155, 25, pWidth, pHeight);
        pdf.setDrawColor(217, 119, 6);
        pdf.rect(155, 25, pWidth, pHeight);

        // Title & Description
        pdf.setTextColor(254, 240, 138);
        pdf.setFontSize(12);
        pdf.text(`Panel ${i + 2}: ${panel2.title}`, 155, 100);

        pdf.setTextColor(203, 213, 225);
        pdf.setFontSize(9);
        const desc2 = pdf.splitTextToSize(panel2.description, pWidth);
        pdf.text(desc2, 155, 108);

        // Captions / Dialogue text
        if (panel2.textElements && panel2.textElements.length > 0) {
          pdf.setFontSize(8);
          pdf.setTextColor(251, 191, 36);
          panel2.textElements.forEach((elem, eIdx) => {
            if (eIdx < 3) {
              pdf.text(`• ${elem.speaker ? elem.speaker + ': ' : ''}"${elem.content}"`, 155, 125 + eIdx * 6);
            }
          });
        }
      } catch (err) {
        console.error('Error embedding panel 2 image into PDF', err);
      }
    }

    // Page Number
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(9);
    pdf.text(`Page ${Math.floor(i / 2) + 1}`, pageWidth / 2, 190, { align: 'center' });
  }

  const fileName = `${metadata.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_graphic_novel.pdf`;
  pdf.save(fileName);
}
