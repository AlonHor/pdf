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
    let page = pdfDoc.addPage();
    const fontSize = 8;
    const { width, height } = page.getSize();
    const lineHeight = fontSize + 4;

    const lines = content.split("\n");
    let yPosition = height - 50;

    for (const line of lines) {
      if (yPosition < 50) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }
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
