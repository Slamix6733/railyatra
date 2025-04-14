import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures a DOM element and converts it to a PDF
 * @param element The DOM element to capture
 * @param filename The filename for the PDF
 */
export const generateTicketPDF = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Get element dimensions
    const { offsetWidth, offsetHeight } = element;
    
    // Add a temporary class for better PDF rendering
    element.classList.add('printing-pdf');
    
    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow cross-origin images
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Remove temporary class
    element.classList.remove('printing-pdf');
    
    // Calculate PDF dimensions with some margin
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (offsetHeight * imgWidth) / offsetWidth;
    
    // Create PDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add image to PDF
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      imgWidth,
      imgHeight
    );
    
    // Handle multi-page if needed
    let position = 0;
    let remainingHeight = imgHeight;
    
    while (remainingHeight > pageHeight) {
      // Add a new page
      pdf.addPage();
      position -= pageHeight;
      
      // Add the image again but at the new position
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      
      remainingHeight -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * High-level function to generate a ticket PDF from a ticket element
 * @param ticketRef React ref to the ticket element
 * @param pnr PNR number to use in the filename
 */
export const downloadTicketAsPDF = (ticketRef: HTMLElement | null, pnr: string): void => {
  if (!ticketRef) {
    console.error('Ticket element not found');
    return;
  }
  
  const filename = `RailYatra_Ticket_${pnr}`;
  
  generateTicketPDF(ticketRef, filename)
    .then(() => {
      console.log('PDF generated successfully');
    })
    .catch((error) => {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again later.');
    });
}; 