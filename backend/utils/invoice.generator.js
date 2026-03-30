const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceGenerator {
  /**
   * Generate PDF invoice
   */
  static async generateInvoice(invoiceData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Create invoice directory if it doesn't exist
        const invoiceDir = path.dirname(outputPath);
        if (!fs.existsSync(invoiceDir)) {
          fs.mkdirSync(invoiceDir, { recursive: true });
        }

        const doc = new PDFDocument({
          margin: 50,
        });

        const stream = fs.createWriteStream(outputPath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
        doc.moveDown(0.5);

        // Invoice details
        doc.fontSize(10).font('Helvetica');
        doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`);
        doc.text(`Issue Date: ${new Date(invoiceData.issuedDate).toLocaleDateString()}`);
        if (invoiceData.dueDate) {
          doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`);
        }
        doc.moveDown();

        // Company info (left) and Customer info (right)
        doc.fontSize(11).font('Helvetica-Bold').text('Bill From:', 0, 150);
        doc.fontSize(10).font('Helvetica');
        doc.text('Gridcoin Energy Trading Platform', 50);
        doc.text('support@gridcoin.io', 50);
        doc.text('www.gridcoin.io', 50);

        doc.fontSize(11).font('Helvetica-Bold').text('Bill To:', 300, 150);
        doc.fontSize(10).font('Helvetica');
        doc.text(invoiceData.customerName, 300);
        doc.text(invoiceData.customerEmail, 300);
        if (invoiceData.customerPhone) {
          doc.text(invoiceData.customerPhone, 300);
        }

        doc.moveDown(2);

        // Items table
        const tableTop = 250;
        const col1 = 50;
        const col2 = 250;
        const col3 = 350;
        const col4 = 450;

        // Table header
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Description', col1, tableTop);
        doc.text('Qty', col2, tableTop);
        doc.text('Unit Price', col3, tableTop);
        doc.text('Amount', col4, tableTop);

        // Horizontal line
        doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table rows
        doc.fontSize(9).font('Helvetica');
        let yPosition = tableTop + 30;

        invoiceData.items.forEach((item) => {
          doc.text(item.description, col1, yPosition);
          doc.text(item.quantity.toString(), col2, yPosition);
          doc.text(`₹${item.unitPrice.toFixed(2)}`, col3, yPosition);
          doc.text(`₹${item.amount.toFixed(2)}`, col4, yPosition);
          yPosition += 20;
        });

        // Total line
        doc.moveTo(col1, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 10;

        // Totals
        doc.fontSize(10).font('Helvetica');
        doc.text('Subtotal:', col3, yPosition);
        doc.text(`₹${invoiceData.subtotal.toFixed(2)}`, col4, yPosition);

        yPosition += 20;
        if (invoiceData.tax > 0) {
          doc.text(`Tax (${invoiceData.taxPercentage || 0}%):`, col3, yPosition);
          doc.text(`₹${invoiceData.tax.toFixed(2)}`, col4, yPosition);
          yPosition += 20;
        }

        // Grand total
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Total:', col3, yPosition);
        doc.text(`₹${invoiceData.total.toFixed(2)}`, col4, yPosition);

        // Notes
        if (invoiceData.notes) {
          doc.moveDown(2);
          doc.fontSize(10).font('Helvetica-Bold').text('Notes:');
          doc.fontSize(9).font('Helvetica').text(invoiceData.notes);
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).font('Helvetica').text('Thank you for your business!', { align: 'center' });
        doc.text('Payment ID: ' + invoiceData.paymentId, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate invoice data from payment and user info
   */
  static prepareInvoiceData(payment, user, invoiceNumber) {
    return {
      invoiceNumber,
      issuedDate: new Date(),
      dueDate: null,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone || '',
      items: [
        {
          description: payment.description || `${payment.type} - Energy Trading`,
          quantity: 1,
          unitPrice: payment.amount,
          amount: payment.amount,
        },
      ],
      subtotal: payment.amount,
      tax: 0,
      taxPercentage: 0,
      total: payment.amount,
      paymentId: payment.razorpayPaymentId,
      notes: `Payment Status: ${payment.status}\nPayment Method: ${payment.paymentMethod}`,
    };
  }

  /**
   * Generate subscription invoice
   */
  static prepareSubscriptionInvoiceData(subscription, user, invoiceNumber) {
    const amount = subscription.amount;
    return {
      invoiceNumber,
      issuedDate: new Date(),
      dueDate: null,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone || '',
      items: [
        {
          description: `${subscription.plan} Plan - ${subscription.billingPeriod}`,
          quantity: 1,
          unitPrice: amount,
          amount: amount,
        },
      ],
      subtotal: amount,
      tax: 0,
      taxPercentage: 0,
      total: amount,
      paymentId: subscription.razorpaySubscriptionId,
      notes: `Subscription Status: ${subscription.status}\nBilling Period: ${subscription.billingPeriod}`,
    };
  }

  /**
   * Generate invoice PDF as buffer for direct delivery
   */
  static async generateInvoicePDF(invoiceData) {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔧 Starting PDF generation with data:', {
          invoiceNumber: invoiceData.invoiceNumber,
          customerName: invoiceData.customerName,
          itemsCount: invoiceData.items ? invoiceData.items.length : 0,
          totalAmount: invoiceData.totalAmount,
        });

        const doc = new PDFDocument({
          margin: 50,
        });

        const buffers = [];
        
        doc.on('data', (buffer) => {
          console.log('📦 PDF chunk received:', buffer.length, 'bytes');
          buffers.push(buffer);
        });
        
        doc.on('error', (err) => {
          console.error('❌ PDF document error:', err);
          reject(err);
        });
        
        doc.on('end', () => {
          const finalBuffer = Buffer.concat(buffers);
          console.log('✅ PDF generation complete. Total size:', finalBuffer.length, 'bytes');
          resolve(finalBuffer);
        });

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
        doc.moveDown(0.5);

        // Invoice details
        doc.fontSize(10).font('Helvetica');
        doc.text(`Invoice Number: ${invoiceData.invoiceNumber || 'N/A'}`);
        doc.text(`Issue Date: ${invoiceData.issuedDate ? new Date(invoiceData.issuedDate).toLocaleDateString() : new Date().toLocaleDateString()}`);
        if (invoiceData.dueDate) {
          doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`);
        }
        doc.moveDown();

        // Company info and Customer info
        doc.fontSize(11).font('Helvetica-Bold').text('Bill From:', 0, 150);
        doc.fontSize(10).font('Helvetica');
        doc.text('Gridcoin Energy Trading Platform', 50);
        doc.text('support@gridcoin.io', 50);
        doc.text('www.gridcoin.io', 50);

        doc.fontSize(11).font('Helvetica-Bold').text('Bill To:', 300, 150);
        doc.fontSize(10).font('Helvetica');
        doc.text(invoiceData.customerName || 'Customer', 300);
        doc.text(invoiceData.customerEmail || '', 300);
        if (invoiceData.customerPhone) {
          doc.text(invoiceData.customerPhone, 300);
        }

        doc.moveDown(2);

        // Items table
        const tableTop = 250;
        const col1 = 50;
        const col2 = 250;
        const col3 = 350;
        const col4 = 450;

        // Table header
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Description', col1, tableTop);
        doc.text('Qty', col2, tableTop);
        doc.text('Unit Price', col3, tableTop);
        doc.text('Amount', col4, tableTop);

        // Horizontal line
        doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table rows
        doc.fontSize(9).font('Helvetica');
        let yPosition = tableTop + 30;

        const items = invoiceData.items || [];
        console.log('📋 Adding items to PDF:', items.length);
        
        items.forEach((item, index) => {
          try {
            const desc = (item.description || '').substring(0, 40);
            const qty = String(item.quantity || 1);
            const unitPrice = parseFloat(item.unitPrice || 0);
            const amount = parseFloat(item.amount || 0);
            
            doc.text(desc, col1, yPosition);
            doc.text(qty, col2, yPosition);
            doc.text(`$${unitPrice.toFixed(2)}`, col3, yPosition);
            doc.text(`$${amount.toFixed(2)}`, col4, yPosition);
            yPosition += 20;
          } catch (itemErr) {
            console.error(`❌ Error adding item ${index}:`, itemErr.message);
          }
        });

        // Total line
        doc.moveTo(col1, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 10;

        // Totals
        doc.fontSize(10).font('Helvetica');
        doc.text('Subtotal:', col3, yPosition);
        doc.text(`$${(parseFloat(invoiceData.subtotal) || 0).toFixed(2)}`, col4, yPosition);

        yPosition += 20;
        if (parseFloat(invoiceData.tax || 0) > 0) {
          doc.text(`Tax (${invoiceData.taxPercentage || 0}%):`, col3, yPosition);
          doc.text(`$${(parseFloat(invoiceData.tax) || 0).toFixed(2)}`, col4, yPosition);
          yPosition += 20;
        }

        // Grand total
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Total:', col3, yPosition);
        const total = parseFloat(invoiceData.totalAmount || invoiceData.total || 0);
        console.log('💰 Final total to display:', total);
        doc.text(`$${total.toFixed(2)}`, col4, yPosition);

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).font('Helvetica').text('Thank you for your business!', { align: 'center' });
        doc.text(`Status: ${invoiceData.status || 'Paid'}`, { align: 'center' });

        console.log('📄 Calling doc.end() to finalize PDF');
        doc.end();
      } catch (error) {
        console.error('❌ Outer try-catch error:', error.message);
        console.error('   Stack:', error.stack);
        reject(error);
      }
    });
  }
}

module.exports = InvoiceGenerator;
