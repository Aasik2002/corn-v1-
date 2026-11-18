const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter.
 * If credentials are provided in .env, it uses them.
 * Otherwise, it generates an ephemeral Ethereal test inbox for instant zero-config testing.
 */
async function getTransporter() {
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (user && pass) {
        const cleanPass = pass.replace(/\s+/g, '');
        const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';

        if (host.includes('gmail') || user.includes('@gmail.com')) {
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user,
                    pass: cleanPass
                }
            });
        }

        const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587', 10);
        const secure = port === 465;

        return nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass: cleanPass
            }
        });
    }

    // Attempt Ethereal test mailer for development if online
    try {
        console.log('ℹ️ No EMAIL_USER/EMAIL_PASS in .env — attempting Ethereal test mailer.');
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    } catch (testErr) {
        console.warn('⚠️ Could not connect to external test mailer (offline/no internet). Running in local simulation mode.');
        return null;
    }
}

/**
 * Sends an email with the PDF scan report attached.
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.farmerName - Farmer's full name
 * @param {string} options.period - 'weekly' | 'monthly'
 * @param {Object} options.stats - Diagnostic statistics summary
 * @param {Buffer} options.pdfBuffer - PDF file buffer
 * @param {string} options.filename - Attachment filename
 * @returns {Promise<Object>} Delivery info and optional test preview URL
 */
async function sendReportEmail({
    to,
    subject,
    farmerName = 'Farmer',
    period = 'weekly',
    stats = {},
    pdfBuffer,
    filename = 'CornAI_Report.pdf'
}) {
    const transporter = await getTransporter();
    const isWeekly = period.toLowerCase() === 'weekly';
    const periodTitle = isWeekly ? 'Weekly Diagnostic Report' : 'Monthly Diagnostic Report';

    const fromAddress = process.env.EMAIL_FROM || '"CornAI Agricultural Intelligence" <diagnostics@cornai.farm>';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0E1611; color: #E2E8F0; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #132218; border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #064E3B 0%, #047857 100%); padding: 30px; text-align: center; }
            .header h1 { margin: 0; color: #FFFFFF; font-size: 24px; font-weight: bold; letter-spacing: 0.5px; }
            .header p { margin: 6px 0 0 0; color: #A7F3D0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
            .content { padding: 30px; }
            .salutation { font-size: 16px; color: #FFFFFF; margin-bottom: 16px; font-weight: 600; }
            .lead-text { color: #94A3B8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
            .stat-box { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 16px; border-radius: 12px; }
            .stat-label { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #94A3B8; margin-bottom: 4px; }
            .stat-val { font-size: 22px; font-weight: 800; color: #84CC16; }
            .footer { background: #0B130E; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid rgba(255, 255, 255, 0.05); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌽 CornAI Crop Diagnostics</h1>
                <p>${periodTitle}</p>
            </div>
            <div class="content">
                <div class="salutation">Hello ${farmerName},</div>
                <div class="lead-text">
                    Your <strong>${periodTitle}</strong> is ready. Our AI vision diagnostic models have compiled your scan analytics, pathogen alert frequencies, and recommended agronomic actions.
                </div>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                        <td width="48%" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 14px; border-radius: 10px;">
                            <div style="font-size: 10px; color: #94A3B8; font-weight: bold; text-transform: uppercase;">Crop Vitality</div>
                            <div style="font-size: 22px; color: #84CC16; font-weight: bold; margin-top: 4px;">${stats.vitality || 0}%</div>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 14px; border-radius: 10px;">
                            <div style="font-size: 10px; color: #94A3B8; font-weight: bold; text-transform: uppercase;">Total Scans</div>
                            <div style="font-size: 22px; color: #38BDF8; font-weight: bold; margin-top: 4px;">${stats.total || 0}</div>
                        </td>
                    </tr>
                    <tr><td height="10" colspan="3"></td></tr>
                    <tr>
                        <td width="48%" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 14px; border-radius: 10px;">
                            <div style="font-size: 10px; color: #94A3B8; font-weight: bold; text-transform: uppercase;">Common Rust (CR)</div>
                            <div style="font-size: 20px; color: #F59E0B; font-weight: bold; margin-top: 4px;">${stats.cr || 0} detections</div>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 14px; border-radius: 10px;">
                            <div style="font-size: 10px; color: #94A3B8; font-weight: bold; text-transform: uppercase;">Gray Leaf Spot (GR)</div>
                            <div style="font-size: 20px; color: #F43F5E; font-weight: bold; margin-top: 4px;">${stats.gr || 0} detections</div>
                        </td>
                    </tr>
                </table>

                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 14px; border-radius: 10px; font-size: 13px; color: #A7F3D0; margin-bottom: 20px;">
                    📎 <strong>Attached:</strong> The full comprehensive diagnostic report is attached as a PDF: <code>${filename}</code>.
                </div>

                <div style="font-size: 12px; color: #64748B; line-height: 1.5;">
                    Stay proactive against corn leaf fungal pathogens by consulting with local agricultural extension offices before applying systemic fungicides.
                </div>
            </div>
            <div class="footer">
                © ${new Date().getFullYear()} CornAI Precision Agriculture • Empowering Sustainable Crop Health
            </div>
        </div>
    </body>
    </html>
    `;

    if (!transporter) {
        console.log(`📬 [Local Dev Mode] PDF diagnostic report generated & simulated delivery to ${to}`);
        return {
            messageId: `dev-simulated-${Date.now()}`,
            previewUrl: null,
            simulated: true
        };
    }

    const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: subject || `🌽 Your CornAI ${periodTitle} - ${new Date().toLocaleDateString()}`,
        html: htmlContent,
        attachments: [
            {
                filename,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log(`✉️ Email sent to Ethereal Test Inbox! Preview URL: ${previewUrl}`);
    } else {
        console.log(`✉️ Email successfully dispatched to ${to} (MessageId: ${info.messageId})`);
    }

    return {
        messageId: info.messageId,
        previewUrl: previewUrl || null
    };
}

module.exports = { sendReportEmail };
