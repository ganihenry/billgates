import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function generateReceiptPDF({ customerName, amount, paidAt, receiptNumber }) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 420])
  const { width, height } = page.getSize()

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const green = rgb(0.43, 0.9, 0.72)
  const dark = rgb(0.08, 0.09, 0.12)
  const grey = rgb(0.42, 0.45, 0.50)
}