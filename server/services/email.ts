import { MailService } from "@sendgrid/mail";

const mailService = new MailService();
const apiKey = process.env.SENDGRID_API_KEY || "";

if (apiKey) {
  mailService.setApiKey(apiKey);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export class EmailService {
  static async sendEmail(params: EmailParams): Promise<boolean> {
    if (!apiKey) {
      console.warn("SendGrid API key not configured, email not sent");
      return false;
    }

    try {
      const emailData: any = {
        to: params.to,
        from: params.from,
        subject: params.subject,
      };
      
      if (params.text) emailData.text = params.text;
      if (params.html) emailData.html = params.html;
      if (params.attachments) emailData.attachments = params.attachments;
      
      await mailService.send(emailData);
      return true;
    } catch (error) {
      console.error("SendGrid email error:", error);
      return false;
    }
  }

  static async sendInvoiceEmail(
    customerEmail: string,
    customerName: string,
    invoiceNumber: string,
    pdfBuffer: Buffer
  ): Promise<boolean> {
    const subject = `Invoice ${invoiceNumber} from InvoicePro`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Invoice from InvoicePro</h2>
        <p>Dear ${customerName},</p>
        <p>Please find attached your invoice <strong>${invoiceNumber}</strong>.</p>
        <p>Thank you for your business!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e5e5;">
        <p style="color: #666; font-size: 12px;">
          <h1>Design 4 you</h1>
              Shop no 44 to 46</br>
              Kheri Markanda, Kurukshetra</br>
              Haryana</br>
              +91-92542-22221</br>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: customerEmail,
      from: "noreply@invoicepro.com",
      subject,
      html,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: `invoice-${invoiceNumber}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });
  }
}
