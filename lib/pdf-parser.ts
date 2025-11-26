/**
 * PDF Parser utility
 * Uses pdf2json for better Next.js compatibility
 */

import PDFParser from 'pdf2json'

export async function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser()
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('PDF parsing error:', errData.parserError)
      reject(new Error('Unable to parse PDF content. The PDF might be password protected or corrupted.'))
    })
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        // Extract text from all pages
        let text = ''
        
        if (pdfData && pdfData.Pages) {
          for (const page of pdfData.Pages) {
            if (page.Texts) {
              for (const textItem of page.Texts) {
                if (textItem.R) {
                  for (const run of textItem.R) {
                    if (run.T) {
                      // Decode URI encoded text
                      text += decodeURIComponent(run.T) + ' '
                    }
                  }
                }
              }
            }
            text += '\n'
          }
        }
        
        resolve(text.trim())
      } catch (error: any) {
        reject(new Error('Failed to extract text from PDF: ' + error.message))
      }
    })
    
    // Parse the buffer
    pdfParser.parseBuffer(buffer)
  })
}
