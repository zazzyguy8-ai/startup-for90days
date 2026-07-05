import { jsPDF } from "jspdf";
import type { SavedIdea } from "./types";

// Text-based PDF export of the full validation report.
export function exportReportPdf(idea: SavedIdea) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  function ensureSpace(needed: number) {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function heading(text: string, size = 14) {
    ensureSpace(40);
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(80, 70, 230);
    doc.text(text, margin, y);
    y += size + 4;
    doc.setTextColor(30, 30, 40);
  }

  function para(text: string, size = 10, bold = false) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      ensureSpace(size + 4);
      doc.text(line, margin, y);
      y += size + 4;
    }
    y += 2;
  }

  function bullets(items: string[]) {
    for (const item of items) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(item, maxW - 14);
      ensureSpace(14 * lines.length);
      doc.circle(margin + 3, y - 3, 1.5, "F");
      doc.text(lines, margin + 12, y);
      y += 14 * lines.length + 2;
    }
    y += 2;
  }

  const r = idea.report;

  // Cover
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 40);
  doc.text(doc.splitTextToSize(idea.title, maxW), margin, y + 10);
  y += 44;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 135);
  doc.text(
    `Validation Report · ${new Date(idea.createdAt).toLocaleDateString()} · ${idea.industry}`,
    margin,
    y
  );
  y += 24;
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 70, 230);
  doc.text(`${r.verdict.score}/100`, margin, y + 20);
  doc.setFontSize(14);
  doc.text(`Verdict: ${r.verdict.label}`, margin + 150, y + 14);
  y += 40;
  doc.setTextColor(30, 30, 40);

  heading("1. Idea Summary");
  para(r.ideaSummary);

  heading("2. Problem Score");
  para(`Pain: ${r.problemScore.pain.score}/10 — ${r.problemScore.pain.explanation}`);
  para(`Urgency: ${r.problemScore.urgency.score}/10 — ${r.problemScore.urgency.explanation}`);
  para(`Frequency: ${r.problemScore.frequency.score}/10 — ${r.problemScore.frequency.explanation}`);

  heading("3. Target Customer");
  para(`Ideal customer: ${r.targetCustomer.idealCustomer}`);
  para(`Industry: ${r.targetCustomer.industry}`);
  para(`Company size: ${r.targetCustomer.companySize}`);
  para(`Buying behavior: ${r.targetCustomer.buyingBehavior}`);
  para(`Online: ${r.targetCustomer.onlineHangouts.join(", ")}`);

  heading("4. Competition");
  for (const c of r.competition.competitors) {
    para(c.name, 11, true);
    para(`Does well: ${c.doesWell}`);
    para(`Weaknesses: ${c.weaknesses}`);
  }
  para("Market gaps:", 11, true);
  bullets(r.competition.marketGaps);
  para("Differentiation:", 11, true);
  bullets(r.competition.differentiation);

  heading("5. Market Size");
  para(`TAM: ${r.marketSize.tam}   ·   SAM: ${r.marketSize.sam}   ·   SOM: ${r.marketSize.som}`, 11, true);
  para(r.marketSize.reasoning);

  heading("6. Pricing Recommendation");
  para(`$${r.pricing.monthly}/month · $${r.pricing.annual}/year`, 11, true);
  para(`Model: ${r.pricing.model}`);
  para(`Willingness to pay: ${r.pricing.willingnessToPay}`);
  para(r.pricing.reasoning);

  heading("7. MVP Roadmap");
  para("Core features:", 11, true);
  bullets(r.mvpRoadmap.coreFeatures);
  para("Nice-to-have:", 11, true);
  bullets(r.mvpRoadmap.niceToHave);
  para("Build order:", 11, true);
  bullets(r.mvpRoadmap.buildOrder);

  heading("8. Go-To-Market Strategy");
  para("First 100 users:", 11, true);
  bullets(r.gtm.first100);
  para("First 1,000 users:", 11, true);
  bullets(r.gtm.first1000);
  para("Organic growth:", 11, true);
  bullets(r.gtm.organicGrowth);
  para("Content strategy:", 11, true);
  bullets(r.gtm.contentStrategy);
  para("Communities:", 11, true);
  bullets(r.gtm.communities);
  para("Cold outreach:", 11, true);
  bullets(r.gtm.coldOutreach);

  heading("9. Risk Analysis");
  para("Biggest risks:", 11, true);
  bullets(r.risks.biggestRisks);
  para("Why startups like this fail:", 11, true);
  bullets(r.risks.whyStartupsFail);
  para("Technical risks:", 11, true);
  bullets(r.risks.technicalRisks);
  para("Business risks:", 11, true);
  bullets(r.risks.businessRisks);

  heading("10. AI Verdict");
  para(`${r.verdict.score}/100 — ${r.verdict.label}`, 12, true);
  para(r.verdict.explanation);

  heading("SWOT");
  para("Strengths:", 11, true);
  bullets(r.swot.strengths);
  para("Weaknesses:", 11, true);
  bullets(r.swot.weaknesses);
  para("Opportunities:", 11, true);
  bullets(r.swot.opportunities);
  para("Threats:", 11, true);
  bullets(r.swot.threats);

  heading("Investor Summary");
  para(r.investorSummary);

  doc.save(`${idea.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-validation.pdf`);
}
