// functions/_lib/brief-args.js
// Build /stage-brief prompt from brief answers

/**
 * Build prompt args string from brief answers
 * @param {Object} params
 * @param {string} params.email - Client email (from KV)
 * @param {string} params.name - Client name (from KV)
 * @param {string} params.serviceId - Selected service
 * @param {Object} params.answers - Client's brief answers
 * @param {string|number} params.version - Prompt version
 * @returns {string} Complete prompt string
 */
export function buildPrompt({ email, name, serviceId, answers, version }) {
  const lines = [
    `/stage-brief [v${version}]`,
    `Użytkownik: ${name} (${email})`,
    `Usługa: ${serviceId}`,
    `Cel biznesowy: ${answers.businessGoal || "—"}`,
    `Grupa docelowa: ${answers.audience || "—"}`,
    `Typ projektu: ${answers.projectType || "—"}`,
    `Sekcje/funkcje: ${answers.sections || "—"}`,
    `Treści: ${answers.content || "—"}`,
    `Media: ${answers.media || "—"}`,
    `Styl UI/UX: ${answers.uiux || "—"}`,
    `Paleta: ${answers.palette || "—"}`,
    `Fonty: ${answers.fonts || "—"}`,
    `Inspiracje: ${answers.inspirations || "—"}`,
    `CTA: ${answers.cta || "—"}`,
    `SEO: ${answers.seo || "—"}`,
    `Ograniczenia: ${answers.constraints || "—"}`,
  ];
  return lines.join("\n");
}

/**
 * Build plain-text summary of answers (for email body)
 * @param {Object} answers
 * @returns {string}
 */
export function buildAnswersSummary(answers) {
  const labels = {
    businessGoal: "Cel biznesowy",
    audience: "Grupa docelowa",
    projectType: "Typ projektu",
    sections: "Sekcje/funkcje",
    content: "Treści",
    media: "Media",
    uiux: "Styl UI/UX",
    palette: "Paleta",
    fonts: "Fonty",
    inspirations: "Inspiracje",
    cta: "CTA",
    seo: "SEO",
    constraints: "Ograniczenia",
  };

  return Object.entries(labels)
    .map(([key, label]) => `${label}: ${answers[key] || "—"}`)
    .join("\n");
}
