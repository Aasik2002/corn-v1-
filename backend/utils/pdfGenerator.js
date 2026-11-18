const PDFDocument = require('pdfkit');

/**
 * Generates an executive crop diagnostic PDF report.
 * @param {Object} options
 * @param {Object} options.user - User information (fullName, email, organization)
 * @param {string} options.period - 'weekly' | 'monthly'
 * @param {Array} options.scans - Array of scan documents
 * @param {Object} options.stats - Aggregated stats { total, vitality, cr, gr, ht }
 * @returns {Promise<Buffer>} Resolves to a PDF Buffer
 */
function generateCropReportPDF({ user, period = 'weekly', scans = [], stats }) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 40,
                info: {
                    Title: `CornAI ${period === 'weekly' ? 'Weekly' : 'Monthly'} Diagnostic Report`,
                    Author: 'CornAI Agricultural Intelligence',
                    Subject: 'Corn Leaf Disease Diagnostics & Agronomic Recommendations'
                }
            });

            const buffers = [];
            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', err => reject(err));

            const isWeekly = period.toLowerCase() === 'weekly';
            const periodLabel = isWeekly ? 'Weekly Scan Report' : 'Monthly Scan Report';
            const dateRangeLabel = isWeekly ? 'Past 7 Days Activity' : 'Past 30 Days Activity';
            const reportDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Color Palette
            const primaryGreen = '#059669'; // Emerald 600
            const darkGreen = '#064E3B';    // Emerald 900
            const limeGreen = '#84CC16';    // Lime 500
            const slateDark = '#1E293B';    // Slate 800
            const slateLight = '#64748B';   // Slate 500
            const warningAmber = '#D97706'; // Amber 600
            const criticalRose = '#E11D48'; // Rose 600

            // 1. TOP HEADER BANNER
            doc.rect(40, 40, 515, 65).fill(darkGreen);

            doc.fillColor('#FFFFFF')
               .fontSize(22)
               .font('Helvetica-Bold')
               .text('CornAI Diagnostics', 55, 52);

            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#A7F3D0')
               .text('AI-POWERED PRECISION AGRICULTURE PLATFORM', 55, 78);

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#FFFFFF')
               .text(reportDate, 400, 56, { width: 140, align: 'right' });

            doc.fontSize(9)
               .font('Helvetica')
               .fillColor('#D1FAE5')
               .text(periodLabel.toUpperCase(), 400, 72, { width: 140, align: 'right' });

            // 2. FARMER PROFILE & METADATA SECTION
            let currentY = 120;
            doc.rect(40, currentY, 515, 50).fillAndStroke('#F8FAFC', '#E2E8F0');

            doc.fontSize(9).font('Helvetica-Bold').fillColor(slateDark);
            doc.text('FARMER / OPERATOR:', 55, currentY + 12);
            doc.text('ORGANIZATION / FIELD:', 55, currentY + 28);

            doc.font('Helvetica').fillColor('#334155');
            doc.text(user.fullName || 'Registered Farmer', 180, currentY + 12);
            doc.text(user.organization || 'CornAI Monitored Field #1', 180, currentY + 28);

            doc.font('Helvetica-Bold').fillColor(slateDark);
            doc.text('EMAIL ADDRESS:', 320, currentY + 12);
            doc.text('TIMEFRAME:', 320, currentY + 28);

            doc.font('Helvetica').fillColor('#334155');
            doc.text(user.email || 'N/A', 415, currentY + 12);
            doc.text(dateRangeLabel, 415, currentY + 28);

            // 3. EXECUTIVE METRICS SUMMARY
            currentY = 185;
            doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGreen);
            doc.text('EXECUTIVE FIELD METRICS', 40, currentY);

            currentY += 18;
            const cardWidth = 120;
            const cardGap = 11.6;

            // Metric 1: Crop Vitality
            doc.rect(40, currentY, cardWidth, 55).fillAndStroke('#ECFDF5', '#A7F3D0');
            doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryGreen).text('CROP VITALITY', 45, currentY + 8);
            doc.fontSize(18).font('Helvetica-Bold').fillColor(darkGreen).text(`${stats.vitality}%`, 45, currentY + 22);
            doc.fontSize(7).font('Helvetica').fillColor(primaryGreen).text(stats.vitality >= 70 ? 'Optimal Range' : 'Risk Elevated', 45, currentY + 42);

            // Metric 2: Total Scans
            const c2X = 40 + cardWidth + cardGap;
            doc.rect(c2X, currentY, cardWidth, 55).fillAndStroke('#F0F9FF', '#BAE6FD');
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#0284C7').text('TOTAL SCANS', c2X + 5, currentY + 8);
            doc.fontSize(18).font('Helvetica-Bold').fillColor('#0369A1').text(`${stats.total}`, c2X + 5, currentY + 22);
            doc.fontSize(7).font('Helvetica').fillColor('#0284C7').text('Specimens Evaluated', c2X + 5, currentY + 42);

            // Metric 3: Pathogen Detections
            const c3X = c2X + cardWidth + cardGap;
            const pathogenCount = (stats.cr || 0) + (stats.gr || 0);
            doc.rect(c3X, currentY, cardWidth, 55).fillAndStroke('#FEF2F2', '#FECDD3');
            doc.fontSize(8).font('Helvetica-Bold').fillColor(criticalRose).text('PATHOGEN ALERTS', c3X + 5, currentY + 8);
            doc.fontSize(18).font('Helvetica-Bold').fillColor('#9F1239').text(`${pathogenCount}`, c3X + 5, currentY + 22);
            doc.fontSize(7).font('Helvetica').fillColor(criticalRose).text(`CR: ${stats.cr} | GR: ${stats.gr}`, c3X + 5, currentY + 42);

            // Metric 4: Healthy Samples
            const c4X = c3X + cardWidth + cardGap;
            doc.rect(c4X, currentY, cardWidth, 55).fillAndStroke('#F7FEE7', '#D9F99D');
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#65A30D').text('HEALTHY LEAVES', c4X + 5, currentY + 8);
            doc.fontSize(18).font('Helvetica-Bold').fillColor('#3F6212').text(`${stats.ht || 0}`, c4X + 5, currentY + 22);
            doc.fontSize(7).font('Helvetica').fillColor('#65A30D').text('Zero Pathogen Sign', c4X + 5, currentY + 42);

            // 4. DISEASE DISTRIBUTION BREAKDOWN TABLE
            currentY += 70;
            doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGreen);
            doc.text('PATHOGEN CLASSIFICATION SUMMARY', 40, currentY);

            currentY += 18;
            doc.rect(40, currentY, 515, 20).fill(darkGreen);
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
            doc.text('CONDITION / PATHOGEN', 50, currentY + 6);
            doc.text('SCIENTIFIC NAME', 200, currentY + 6);
            doc.text('DETECTIONS', 350, currentY + 6);
            doc.text('SHARE (%)', 420, currentY + 6);
            doc.text('THREAT LEVEL', 475, currentY + 6);

            const totalCorn = (stats.cr || 0) + (stats.gr || 0) + (stats.ht || 0);
            const breakdownData = [
                {
                    name: 'Healthy Corn Leaf',
                    scientific: 'Zea mays (Optimal)',
                    count: stats.ht || 0,
                    percent: totalCorn > 0 ? (((stats.ht || 0) / totalCorn) * 100).toFixed(1) : 0,
                    level: 'Normal',
                    color: '#059669'
                },
                {
                    name: 'Common Rust',
                    scientific: 'Puccinia sorghi',
                    count: stats.cr || 0,
                    percent: totalCorn > 0 ? (((stats.cr || 0) / totalCorn) * 100).toFixed(1) : 0,
                    level: 'Warning',
                    color: warningAmber
                },
                {
                    name: 'Gray Leaf Spot',
                    scientific: 'Cercospora zeae-maydis',
                    count: stats.gr || 0,
                    percent: totalCorn > 0 ? (((stats.gr || 0) / totalCorn) * 100).toFixed(1) : 0,
                    level: 'Critical',
                    color: criticalRose
                }
            ];

            currentY += 20;
            breakdownData.forEach((row, idx) => {
                const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                doc.rect(40, currentY, 515, 20).fillAndStroke(bg, '#E2E8F0');
                doc.fontSize(8).font('Helvetica-Bold').fillColor(slateDark).text(row.name, 50, currentY + 6);
                doc.font('Helvetica-Oblique').fillColor(slateLight).text(row.scientific, 200, currentY + 6);
                doc.font('Helvetica-Bold').fillColor(slateDark).text(`${row.count}`, 350, currentY + 6);
                doc.font('Helvetica').fillColor(slateDark).text(`${row.percent}%`, 420, currentY + 6);
                doc.font('Helvetica-Bold').fillColor(row.color).text(row.level, 475, currentY + 6);
                currentY += 20;
            });

            // 5. RECENT SCAN LOGS TABLE
            currentY += 15;
            doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGreen);
            doc.text('RECENT SPECIMEN DIAGNOSTICS LOG', 40, currentY);

            currentY += 18;
            doc.rect(40, currentY, 515, 20).fill(darkGreen);
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
            doc.text('TIMESTAMP', 50, currentY + 6);
            doc.text('SPECIMEN FILE', 160, currentY + 6);
            doc.text('DIAGNOSIS', 290, currentY + 6);
            doc.text('CONFIDENCE', 400, currentY + 6);
            doc.text('STATUS', 475, currentY + 6);

            const displayScans = (scans || []).slice(0, 10);
            currentY += 20;

            if (displayScans.length === 0) {
                doc.rect(40, currentY, 515, 22).fillAndStroke('#FFFFFF', '#E2E8F0');
                doc.fontSize(8).font('Helvetica-Oblique').fillColor(slateLight).text('No scan specimens recorded for this reporting period.', 50, currentY + 7);
                currentY += 22;
            } else {
                displayScans.forEach((scan, idx) => {
                    const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                    doc.rect(40, currentY, 515, 20).fillAndStroke(bg, '#E2E8F0');

                    const scanDate = scan.createdAt
                        ? new Date(scan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'N/A';
                    
                    const fileName = (scan.imageName || 'Specimen.jpg').length > 20 
                        ? (scan.imageName || 'Specimen.jpg').substring(0, 18) + '...' 
                        : (scan.imageName || 'Specimen.jpg');

                    const rawDisease = (scan.diseaseName || '').toLowerCase();
                    let diseaseDisplay = 'Healthy';
                    let statusLabel = 'Optimal';
                    let statusColor = primaryGreen;

                    if (rawDisease.includes('rust')) {
                        diseaseDisplay = 'Common Rust';
                        statusLabel = 'Warning';
                        statusColor = warningAmber;
                    } else if (rawDisease.includes('gray')) {
                        diseaseDisplay = 'Gray Leaf Spot';
                        statusLabel = 'Critical';
                        statusColor = criticalRose;
                    } else if (rawDisease.includes('not')) {
                        diseaseDisplay = 'Not Corn Leaf';
                        statusLabel = 'Ignored';
                        statusColor = slateLight;
                    }

                    const confDisplay = scan.confidence ? `${scan.confidence}%` : 'N/A';

                    doc.fontSize(7.5).font('Helvetica').fillColor(slateDark).text(scanDate, 50, currentY + 6);
                    doc.text(fileName, 160, currentY + 6);
                    doc.font('Helvetica-Bold').text(diseaseDisplay, 290, currentY + 6);
                    doc.font('Helvetica').text(confDisplay, 400, currentY + 6);
                    doc.font('Helvetica-Bold').fillColor(statusColor).text(statusLabel, 475, currentY + 6);

                    currentY += 20;
                });
            }

            // 6. AGRONOMIC ACTION PLAN & RECOMMENDATIONS
            currentY += 15;
            doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGreen);
            doc.text('AGRONOMIC TREATMENT & ACTION PLAN', 40, currentY);

            currentY += 18;
            doc.rect(40, currentY, 515, 68).fillAndStroke('#F8FAFC', '#CBD5E1');

            doc.fontSize(8).font('Helvetica-Bold').fillColor(slateDark);
            doc.text('1. Common Rust (Puccinia sorghi):', 50, currentY + 8);
            doc.font('Helvetica').fillColor('#334155').text(
                'If early pustules are visible across more than 5% of the upper canopy, apply triazole or strobilurin-based fungicides (e.g. Pyraclostrobin, Azoxystrobin). Minimize overhead irrigation during evening hours.',
                50, currentY + 18, { width: 495 }
            );

            doc.font('Helvetica-Bold').fillColor(slateDark).text('2. Gray Leaf Spot (Cercospora zeae-maydis):', 50, currentY + 38);
            doc.font('Helvetica').fillColor('#334155').text(
                'Gray rectangular lesions indicate fungal sporulation. Use certified hybrid corn varieties with multi-genic resistance and practice crop rotation with non-host crops (soybeans). Implement tillage to bury infected residue.',
                50, currentY + 48, { width: 495 }
            );

            // 7. FOOTER
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(slateLight)
               .text('CornAI Agricultural Intelligence • Automated Diagnostic System • Empowering Crop Health', 40, 785, {
                   align: 'center',
                   width: 515
               });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateCropReportPDF };
