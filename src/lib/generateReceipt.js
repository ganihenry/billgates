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

page.drawRectangle({ x: 0, y: 0, width, height, color: dark })

page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(0.07, 0.08, 0.10) })

page.drawText('BILL GATES', {
  x: 40, y: height - 50,
  size: 24, font: fontBold, color: green,
})

page.drawText('Payment Receipt', {
  x: 40, y: height - 68,
  size: 11, font: fontRegular, color: grey,
})

page.drawText(`Receipt #${receiptNumber}`, {
  x: width - 180, y: height - 50,
  size: 11, font: fontBold, color: green,
})

const formattedDate = new Date(paidAt).toLocaleDateString('en-SG', {
  day: 'numeric', month: 'long', year: 'numeric'
})
page.drawText(formattedDate, {
  x: width - 180, y: height - 68,
  size: 10, font: fontRegular, color: grey,
})