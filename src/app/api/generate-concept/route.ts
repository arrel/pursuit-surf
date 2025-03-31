import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ConceptResponse } from "@/types";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idea, prompt } = body;

    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    // Call the OpenAI API with structured output
    const response = await openai.responses.create({
      model: "gpt-4o-2024-08-06",
      input: [
        { role: "system", content: prompt },
        { role: "user", content: idea },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "concept_summary_feedback",
          schema: {
            type: "object",
            properties: {
              conceptSummary: { type: "string" },
              strengths: { type: "string" },
              areasForImprovement: { type: "string" },
              suggestions: { type: "string" },
              scores: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    criterion: { type: "string" },
                    score: { type: "number" },
                    feedback: { type: "string" },
                  },
                  required: ["criterion", "score", "feedback"],
                  additionalProperties: false,
                },
              },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    criterion: { type: "string" },
                    reason: { type: "string" },
                  },
                  required: ["question", "criterion", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: [
              "conceptSummary",
              "strengths",
              "areasForImprovement",
              "suggestions",
              "scores",
              "questions",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    // Extract the response content
    const responseContent = response.output_text;

    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const parsedResponse: ConceptResponse = JSON.parse(responseContent);

    // Return the structured response
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Error generating concept:", error);
    return NextResponse.json(
      { error: "Failed to generate concept" },
      { status: 500 }
    );
  }
}
