import allowCors from "@/utils/allow-cors";
import { NextApiRequest, NextApiResponse } from "next";
import { PDFDocument, StandardFonts } from "pdf-lib";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid content. Provide a string." });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontSize = 8;
    const lineHeight = fontSize + 4;

    // Calculate required page height based on content
    const lines = content.split("\n");
    const requiredHeight = lines.length * lineHeight + 100; // 100 for margins
    const pageWidth = 612; // Standard US Letter width in points

    // Create a single page with custom dimensions
    const page = pdfDoc.addPage([pageWidth, requiredHeight]);
    let yPosition = requiredHeight - 50; // Start from top with margin

    // Draw all text on the single page
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font,
      });
      yPosition -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="generated.pdf"');
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF." });
  }
}

export default allowCors(handler);
