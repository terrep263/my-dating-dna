import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, filename = "results.pdf" } = body;

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    // Launch browser with optimized settings
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu"
      ],
      headless: true,
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 2,
    });

    // Create a complete HTML document with optimized styling for PDF
    const completeHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dating DNA Results</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #ffffff;
            font-size: 14px;
          }
          
          .pdf-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #7c3aed;
          }
          
          .logo {
            font-size: 32px;
            font-weight: 700;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          
          .subtitle {
            font-size: 18px;
            color: #64748b;
            font-weight: 500;
          }
          
          .results-section {
            margin-bottom: 35px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 20px;
            padding: 15px 20px;
            background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%);
            color: white;
            border-radius: 12px;
            text-align: center;
          }
          
          .type-card {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 25px;
            text-align: center;
          }
          
          .type-name {
            font-size: 28px;
            font-weight: 700;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          
          .type-description {
            font-size: 16px;
            color: #475569;
            line-height: 1.7;
          }
          
          .insights-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .insight-card {
            background: #f0f9ff;
            border: 2px solid #0ea5e9;
            border-radius: 12px;
            padding: 20px;
          }
          
          .insight-title {
            font-size: 18px;
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 10px;
          }
          
          .insight-content {
            font-size: 14px;
            color: #0c4a6e;
            line-height: 1.6;
          }
          
          .growth-areas {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
          }
          
          .growth-title {
            font-size: 18px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 15px;
          }
          
          .growth-list {
            list-style: none;
            padding: 0;
          }
          
          .growth-item {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 4px solid #f59e0b;
          }
          
          .growth-item-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
          }
          
          .growth-item-content {
            font-size: 13px;
            color: #92400e;
            line-height: 1.5;
          }
          
          .quick-wins {
            background: #ecfdf5;
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
          }
          
          .quick-wins-title {
            font-size: 18px;
            font-weight: 600;
            color: #065f46;
            margin-bottom: 15px;
          }
          
          .quick-wins-list {
            list-style: none;
            padding: 0;
          }
          
          .quick-wins-item {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 4px solid #10b981;
          }
          
          .quick-wins-item-title {
            font-weight: 600;
            color: #065f46;
            margin-bottom: 5px;
          }
          
          .quick-wins-item-content {
            font-size: 13px;
            color: #065f46;
            line-height: 1.5;
          }
          
          .plan-section {
            background: #f1f5f9;
            border: 2px solid #64748b;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
          }
          
          .plan-title {
            font-size: 18px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .plan-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .week-card {
            background: white;
            border-radius: 8px;
            padding: 15px;
            border: 1px solid #e2e8f0;
          }
          
          .week-title {
            font-weight: 600;
            color: #334155;
            margin-bottom: 10px;
            text-align: center;
            font-size: 14px;
          }
          
          .week-list {
            list-style: disc;
            padding-left: 20px;
            font-size: 12px;
            color: #475569;
            line-height: 1.4;
          }
          
          .week-list li {
            margin-bottom: 5px;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
          }
          
          .footer-logo {
            font-size: 20px;
            font-weight: 700;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          
          @media print {
            .pdf-container {
              padding: 20px;
            }
            
            .results-section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="pdf-container">
          ${html}
        </div>
      </body>
      </html>
    `;

    // Set content with the complete HTML
    await page.setContent(completeHTML, {
      waitUntil: "networkidle0",
    });

    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate PDF with optimized settings
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
      displayHeaderFooter: false,
    });

    await browser.close();

    // Return PDF as response
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
