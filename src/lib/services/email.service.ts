/**
 * ============================================================================
 * EMAIL SERVICE
 * ============================================================================
 * 
 * Replaces Google Apps Script MailApp with Resend API
 * Sends emails with PDF attachments
 * ============================================================================
 */

import { Resend } from 'resend';
import { CONFIG } from '../config';

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY || '';
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export interface SendQuoteEmailParams {
  clientName: string;
  commercial: string;
  fileName: string;
  pdfBuffer: Buffer;
  assemblyInfo?: {
    baseDossier: string;
    productsFound: number;
    totalPages: number;
  };
}

/**
 * Send quote email with PDF attachment
 */
export async function sendQuoteEmail(params: SendQuoteEmailParams): Promise<boolean> {
  try {
    console.log('📧 Preparing email...');
    
    const { clientName, commercial, fileName, pdfBuffer, assemblyInfo } = params;
    
    // Prepare email body
    let htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .info-box {
      background: white;
      border-left: 4px solid #0066cc;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .info-item {
      margin: 10px 0;
      padding: 5px 0;
    }
    .label {
      font-weight: bold;
      color: #0066cc;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📄 Nouveau Devis Dialarme</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      <p>Un nouveau devis a été généré avec succès.</p>
      
      <div class="info-box">
        <div class="info-item">
          <span class="label">📋 Nom du fichier:</span> ${fileName}
        </div>
        <div class="info-item">
          <span class="label">👤 Client:</span> ${clientName}
        </div>
        <div class="info-item">
          <span class="label">💼 Commercial:</span> ${commercial}
        </div>
        <div class="info-item">
          <span class="label">📅 Date:</span> ${new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
      
      ${assemblyInfo ? `
      <div class="info-box">
        <h3 style="margin-top: 0; color: #0066cc;">📦 Dossier complet assemblé</h3>
        <div class="info-item">
          <span class="label">Dossier de base:</span> ${assemblyInfo.baseDossier}
        </div>
        <div class="info-item">
          <span class="label">Fiches techniques:</span> ${assemblyInfo.productsFound} produit(s)
        </div>
        <div class="info-item">
          <span class="label">Total de pages:</span> ${assemblyInfo.totalPages}
        </div>
      </div>
      ` : ''}
      
      <p>Le PDF est en pièce jointe.</p>
      
      <p style="margin-top: 30px;">
        Cordialement,<br>
        <strong>Système Dialarme</strong>
      </p>
    </div>
    <div class="footer">
      <p>Cet email a été généré automatiquement par le système de devis Dialarme.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    // Plain text version
    let textBody = `
Bonjour,

Un nouveau devis a été généré :

📋 Nom du fichier : ${fileName}
👤 Client : ${clientName}
💼 Commercial : ${commercial}
📅 Date : ${new Date().toLocaleDateString('fr-FR')}
`;
    
    if (assemblyInfo) {
      textBody += `
📦 Dossier complet assemblé :
   - Dossier de base : ${assemblyInfo.baseDossier}
   - Fiches techniques : ${assemblyInfo.productsFound} produit(s)
   - Total de pages : ${assemblyInfo.totalPages}
`;
    }
    
    textBody += `
Le PDF est en pièce jointe.

Cordialement,
Système Dialarme
    `;
    
    // Send email via Resend
    const { data, error } = await getResendClient().emails.send({
      from: `Dialarme <${CONFIG.email.from}>`,
      to: [CONFIG.email.recipients.internal],
      subject: `Nouveau devis Dialarme - ${clientName} - ${commercial}`,
      html: htmlBody,
      text: textBody,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
        },
      ],
    });
    
    if (error) {
      console.error('❌ Email send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    console.log('✅ Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send test email without attachment
 */
export async function sendTestEmail(toEmail: string): Promise<boolean> {
  try {
    const { data, error } = await getResendClient().emails.send({
      from: `Dialarme <${CONFIG.email.from}>`,
      to: [toEmail],
      subject: 'Test - Dialarme Quote Generator',
      html: `
<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>✅ Email Service Test Successful</h2>
  <p>This is a test email from the Dialarme Quote Generator.</p>
  <p>Email service is working correctly.</p>
  <p><small>Generated at: ${new Date().toISOString()}</small></p>
</div>
      `,
      text: `
Email Service Test Successful

This is a test email from the Dialarme Quote Generator.
Email service is working correctly.

Generated at: ${new Date().toISOString()}
      `,
    });
    
    if (error) {
      console.error('Test email error:', error);
      return false;
    }
    
    console.log('Test email sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}

