const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

function extractFirstJson(str) {
  let depth = 0;
  let start = str.indexOf("{");
  for (let i = start; i < str.length; i++) {
    if (str[i] === "{") depth++;
    if (str[i] === "}") depth--;
    if (depth === 0) return str.slice(start, i + 1);
  }
  throw new Error("No valid JSON object found");
}
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert interview coach. Analyze the resume, self-description, and job description below.

Return ONLY a valid JSON object that EXACTLY follows this structure — no extra fields, no markdown, no explanation:

{
  "matchScore": <number between 0 and 100>,
  "title": "<job title from the job description>",
  "technicalQuestions": [
    {
      "question": "<technical interview question>",
      "intention": "<why the interviewer asks this>",
      "answer": "<how the candidate should answer this>"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "<behavioral interview question>",
      "intention": "<why the interviewer asks this>",
      "answer": "<how the candidate should answer this>"
    }
  ],
  "skillGaps": [
    {
      "skill": "<missing skill name>",
      "severity": "<low | medium | high>"
    }
  ],
  "preparationPlan": [
    {
      "day": <day number starting from 1>,
      "focus": "<main topic for this day>",
      "tasks": ["<task 1>", "<task 2>"]
    }
  ]
}

Rules:
- technicalQuestions must have exactly 3 items
- behavioralQuestions must have exactly 3 items
- skillGaps must have at least 3 items
- preparationPlan must have exactly 5 days
- severity must be one of: "low", "medium", "high"
- Return ONLY the JSON object. No text before or after.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
  } catch (apiErr) {
    console.error("Gemini API call failed:", apiErr);
    throw apiErr;
  }

  console.log("=== RAW GEMINI RESPONSE ===");
  console.log(response.text);
  console.log("===========================");

  // Parse JSON — strip markdown fences if Gemini adds them anyway
  let raw;
  try {
    raw = JSON.parse(extractFirstJson(response.text));
  } catch (err) {
    console.error("Failed to parse Gemini JSON response:", response.text);
    throw new Error("AI returned invalid JSON: " + err.message);
  }

  // Validate and sanitize each field defensively
  const formatted = {
    matchScore:
      typeof raw.matchScore === "number"
        ? Math.min(100, Math.max(0, raw.matchScore))
        : 0,

    title: raw.title || "Interview Report",

    technicalQuestions: Array.isArray(raw.technicalQuestions)
      ? raw.technicalQuestions.map((q) => ({
          question: String(q.question || ""),
          intention: String(q.intention || ""),
          answer: String(q.answer || ""),
        }))
      : [],

    behavioralQuestions: Array.isArray(raw.behavioralQuestions)
      ? raw.behavioralQuestions.map((q) => ({
          question: String(q.question || ""),
          intention: String(q.intention || ""),
          answer: String(q.answer || ""),
        }))
      : [],

    skillGaps: Array.isArray(raw.skillGaps)
      ? raw.skillGaps.map((s) => ({
          skill: String(s.skill || ""),
          severity: ["low", "medium", "high"].includes(s.severity)
            ? s.severity
            : "medium",
        }))
      : [],

    preparationPlan: Array.isArray(raw.preparationPlan)
      ? raw.preparationPlan.map((p) => ({
          day: typeof p.day === "number" ? p.day : parseInt(p.day) || 0,
          focus: String(p.focus || ""),
          tasks: Array.isArray(p.tasks)
            ? p.tasks.map(String)
            : typeof p.tasks === "string"
              ? [p.tasks]
              : [],
        }))
      : [],
  };

  console.log("=== FINAL FORMATTED RESULT ===");
  console.log(JSON.stringify(formatted, null, 2));
  console.log("==============================");

  return formatted;
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", margin:{
    top: "19mm",
    bottom: "19mm",
    left: "19mm",
    right: "19mm"
  }, });
  await browser.close();
  return pdfBuffer;
}
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumepdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });

  const prompt = `Generate a resume for a candidate with the following details:
                  Resume: ${resume}
                  Self Description: ${selfDescription}
                  Job Description: ${jobDescription}
                  
                  The response should be a JSON object with a single field "html" containing the HTML content of the resume which can be converted to PDF using any library like puppeteer. The JSON should be the only content in the response, with no additional text or markdown formatting.
                  
                  The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                  
                  The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                  
                  you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                  
                  The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                  
                  The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumepdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);
  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);
  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
