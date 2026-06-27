import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const textInput = formData.get("textInput") as string;
    const outputFormat = formData.get("outputFormat") as string;

    if (outputFormat === "pdf") {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;

      page.drawText(textInput, {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();

      return new NextResponse(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=question-paper.pdf",
        },
      });
    } else {
      return NextResponse.json(
        { error: "Output format not supported yet." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error generating question paper:", error);
    return NextResponse.json(
      { error: "Failed to generate question paper" },
      { status: 500 }
    );
  }
}
