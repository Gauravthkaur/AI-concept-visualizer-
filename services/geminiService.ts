
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { DiagramData, AllDiagramType, MermaidDiagramData, SmartDiagramResponse, Node } from '../types';
import { DiagramModule, DiagramStyle, SimpleDiagramType, GeneralDiagramType, CodeDiagramType } from '../types';
import { GEMINI_MODEL_TEXT, GEMINI_MODEL_CODE } from '../constants'; 


let ai: GoogleGenAI | null = null;

const getAIInstance = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    console.error("Gemini API Key is not defined in process.env.API_KEY.");
    throw new Error("Gemini API Key is not configured. Please ensure process.env.API_KEY is set.");
  }
  
  if (ai === null) {
    try {
      ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e: any) {
      console.error("Failed to initialize GoogleGenAI with API_KEY from process.env:", e);
      throw new Error(`Failed to initialize AI service: ${e.message}. Ensure process.env.API_KEY is valid.`);
    }
  }
  return ai;
};

const educationalExplanationStructurePrompt = `
"explanation": A string containing an educational explanation for beginners. It MUST be structured with the following sections, each starting on a new line:
  - Title: A concise title for the topic.
  - Introduction: Briefly introduce the topic, its importance/usefulness.
  - Main Explanation: Break down the topic step-by-step. Use subheadings that correspond to the main components of the diagram you are generating. Explain technical terms simply.
  - Diagram Description: Describe how the generated diagram visually represents the concepts in the Main Explanation. Ensure alignment between diagram labels/parts and the Main Explanation subheadings.
  - Real-World Example or Analogy: A relatable example or analogy.
  - Summary: Key points in a bulleted list (e.g., "- Point 1").
  - Quiz Questions (Optional): 2-3 short questions to reinforce learning.
  Example of explanation format:
  \`\`\`
Title: Understanding a Simple Login Process
Introduction: This explanation covers how a basic login system works, which is crucial for secure access to applications.
Main Explanation:
  User Enters Credentials: The user provides their username and password. This corresponds to the 'User Input' node in the diagram.
  System Validates: The system checks if the credentials are correct. This is shown by the 'Validation' node.
  Access Granted/Denied: Based on validation, the user is either taken to the dashboard or shown an error. See 'Dashboard Access' and 'Error Message' nodes.
Diagram Description: The diagram visualizes this flow: 'User Input' leads to 'Validation', which then branches to either 'Dashboard Access' or 'Error Message'.
Real-World Example or Analogy: Think of it like a secret handshake. If you know it (correct credentials), you get in (access dashboard). If not, you're turned away (error).
Summary:
  - Users provide credentials.
  - System checks them.
  - Access is granted or denied.
Quiz Questions:
  1. What is the first step in a login process?
  2. What happens if credentials are invalid?
  \`\`\`
`;


const constructPromptForInteractiveDiagram = (inputText: string, diagramType: AllDiagramType, module: DiagramModule, diagramStyle: DiagramStyle): string => {
  const diagramTypeName = diagramType.toString();
  const inputType = module === DiagramModule.TEXT ? "text" : "code snippet";

  const exampleNodeDataWithIcon = `"data": { "label": "User Login", "iconKeyword": "user" }`;
  const exampleJson = `{
  "nodes": [
    { "id": "n1", "data": { "label": "Start", "iconKeyword": "play" }, "position": { "x": 250, "y": 0 }, "type": "input" },
    { "id": "n2", "data": { "label": "Process A" }, "position": { "x": 250, "y": 100 } },
    { "id": "n3", ${exampleNodeDataWithIcon}, "position": { "x": 100, "y": 200 } },
    { "id": "n4", "data": { "label": "End", "iconKeyword": "flag" }, "position": { "x": 250, "y": 300 }, "type": "output" }
  ],
  "edges": [
    { "id": "e1-2", "source": "n1", "target": "n2", "label": "Next" },
    { "id": "e2-3", "source": "n2", "target": "n3" },
    { "id": "e3-4", "source": "n3", "target": "n4" }
  ],
  ${educationalExplanationStructurePrompt.replace('"explanation": A string', '"explanation": "An educational explanation based on the input and generated diagram. Example content for the explanation section... (full structure omitted for brevity in this example but must be followed in actual output)"').replace(/\s*Example of explanation format:[\s\S]*/, '')}
}`;

  let systemInstruction = `You are an expert diagram generation AI and an educational content designer. Your task is to convert the provided ${inputType} into a ${diagramTypeName} for an interactive diagramming tool and provide a structured educational explanation.
Focus on creating a visually clear and understandable diagram.
If the text describes a hierarchy, structure the diagram accordingly. Use vertical stacking for main hierarchical levels and horizontal arrangement for peer-level concepts. Ensure generous spacing.
Node labels should be concise keywords or very short phrases.
The explanation should be accessible to beginners with no prior knowledge of the topic.`;

  if (module === DiagramModule.TEXT && diagramStyle === DiagramStyle.SIMPLE && diagramType !== SimpleDiagramType.MERMAID_MIND_MAP) {
    systemInstruction = `You are an expert diagram generation AI and an educational content designer. Your task is to convert the provided text into an EXTREMELY SIMPLE and CLEAR ${diagramTypeName} diagram, suitable for beginners, for an interactive diagramming tool, and provide a structured educational explanation.
The diagram must be MINIMALIST, using the FEWEST possible nodes (e.g., 2-5 core concepts) and connections to represent the CORE IDEA. Prioritize ultra-clarity.
Labels should be very short and simple keywords. For hierarchies, represent only top 1-2 levels. Ensure ample space. Avoid complex branching.
The explanation should be accessible to beginners with no prior knowledge of the topic.`;
  }

  return `
${systemInstruction}
Your response MUST be a single, valid JSON object.
Do NOT include any text, explanations, comments, or summaries before or after the JSON object.
Do NOT use markdown code fences (like \`\`\`json).
Ensure the JSON structure itself is strictly valid. Pay meticulous attention to commas and closing braces/brackets.

The JSON object must have three top-level keys: "nodes", "edges", and "explanation".

"nodes": An array of node objects. Each node object must have:
  - "id": A unique string identifier (e.g., "n1").
  - "data": An object with:
    - "label": A string for the node's display text (concise).
    - "iconKeyword" (optional): A single, generic keyword string for an icon (e.g., "user", "data", "process"). Omit if no simple icon fits.
  - "position": An object with "x" and "y" numerical coordinates. Distribute nodes clearly.
  - "type" (optional): "input" for start, "output" for end.
  Each node object must be correctly formatted and terminated.

"edges": An array of edge objects. Each edge object must have:
  - "id": A unique string identifier (e.g., "e1-2").
  - "source": The "id" of the source node.
  - "target": The "id" of the target node.
  - "label" (optional): A brief string label for the edge.
  Each edge object must be correctly formatted and terminated.

${educationalExplanationStructurePrompt}

Constraints:
- All node IDs unique. Edge source/target IDs refer to existing node IDs.
- Labels concise. JSON validity is paramount.
- Every JSON object and array MUST be correctly closed. Commas are critical.

Input ${inputType}:
---
${inputText}
---

Generate the JSON for a ${diagramTypeName}.
Example of the exact JSON structure expected (explanation content is illustrative and must follow the full structure described above):
${exampleJson}

CRITICAL: The entire response MUST BE ONLY the JSON object. No extra text, comments, or characters before the opening \`{\` or after the closing \`}\`.
  `;
};

const parseGeminiResponseToDiagramData = (responseText: string, forValidationOnly: boolean = false): DiagramData => {
  let jsonCandidate = responseText.trim();
  
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonCandidate.match(fenceRegex);
  if (match && match[2]) {
    jsonCandidate = match[2].trim();
  }

  let startIndex = jsonCandidate.indexOf('{');
  let endIndex = jsonCandidate.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    console.error("Response (after fence removal) doesn't contain a recognizable JSON object:", jsonCandidate);
    throw new Error("AI response does not appear to contain a valid JSON object structure.");
  }
  
  const finalJsonStr = jsonCandidate.substring(startIndex, endIndex + 1);

  try {
    const parsed: any = JSON.parse(finalJsonStr);

    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error("Parsed JSON is not an object.");
    }
    
    // Validate 'nodes'
    if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
      parsed.nodes = []; 
    }
    parsed.nodes.forEach((node: any, index: number) => {
      if (typeof node !== 'object' || node === null) throw new Error(`Node at index ${index} is not an object.`);
      if (typeof node.id !== 'string' || node.id.trim() === '') throw new Error(`Node at index ${index} has invalid or empty 'id'.`);
      if (typeof node.data !== 'object' || node.data === null) throw new Error(`Node at index ${index} has invalid 'data' object.`);
      if (typeof node.data.label !== 'string') {
        node.data.label = String(node.data.label || node.id); 
      }
      if (node.data.iconKeyword !== undefined && typeof node.data.iconKeyword !== 'string') {
        delete node.data.iconKeyword;
      }
      if (typeof node.position !== 'object' || node.position === null) throw new Error(`Node at index ${index} has invalid 'position' object.`);
      if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        const x = parseFloat(node.position.x);
        const y = parseFloat(node.position.y);
        if (isNaN(x) || isNaN(y)) {
             throw new Error(`Node at index ${index} has invalid 'position.x' or 'position.y'. Received x: ${node.position.x}, y: ${node.position.y}`);
        }
        node.position.x = x;
        node.position.y = y;
      }
    });

    // Validate 'edges'
    if (!parsed.edges || !Array.isArray(parsed.edges)) {
      parsed.edges = []; 
    }
    const nodeIds = new Set(parsed.nodes.map((n:any) => n.id));
    parsed.edges.forEach((edge: any, index: number) => {
      if (typeof edge !== 'object' || edge === null) throw new Error(`Edge at index ${index} is not an object.`);
      if (typeof edge.id !== 'string' || edge.id.trim() === '') throw new Error(`Edge at index ${index} has invalid or empty 'id'.`);
      if (typeof edge.source !== 'string' || edge.source.trim() === '') throw new Error(`Edge at index ${index} has invalid or empty 'source' node ID.`);
      if (typeof edge.target !== 'string' || edge.target.trim() === '') throw new Error(`Edge at index ${index} has invalid or empty 'target' node ID.`);
      
      if (!forValidationOnly) {
          if (parsed.nodes.length > 0) { 
              if (!nodeIds.has(edge.source)) throw new Error(`Edge at index ${index} refers to a non-existent source node ID: '${edge.source}'.`);
              if (!nodeIds.has(edge.target)) throw new Error(`Edge at index ${index} refers to a non-existent target node ID: '${edge.target}'.`);
          } else if (parsed.edges.length > 0) { 
              throw new Error(`Edge at index ${index} exists but no nodes are defined.`);
          }
      }
      if (edge.label !== undefined && typeof edge.label !== 'string') {
        edge.label = String(edge.label);
      }
    });
    
    // Validate 'explanation'
    if (parsed.explanation !== undefined && typeof parsed.explanation !== 'string') {
      console.warn(`'explanation' field was not a string. Converting to string or setting to default.`);
      parsed.explanation = String(parsed.explanation || "No explanation provided by AI in the expected format.");
    }
    
    return {
        nodes: parsed.nodes,
        edges: parsed.edges,
        explanation: parsed.explanation 
    } as DiagramData;

  } catch (e: any) {
    console.error("Failed to parse or validate JSON response for DiagramData. Content submitted:", finalJsonStr, "Original error:", e);
    let errorMessage = `AI returned malformed data. Could not parse or validate diagram structure. Error: ${e.message}.`;
    throw new Error(errorMessage);
  }
};

export const generateDiagramData = async (
  inputText: string,
  diagramType: AllDiagramType,
  module: DiagramModule,
  diagramStyle: DiagramStyle 
): Promise<DiagramData> => {
  let currentAI: GoogleGenAI;
  try {
    currentAI = getAIInstance();
  } catch (error: any) {
    if (error.message && error.message.toLowerCase().includes("api key")) {
        throw new Error("Gemini API key is not configured or invalid. Please ensure process.env.API_KEY is set and valid.");
    }
    throw error; 
  }
  
  const prompt = constructPromptForInteractiveDiagram(inputText, diagramType, module, diagramStyle);
  const modelName = module === DiagramModule.TEXT ? GEMINI_MODEL_TEXT : GEMINI_MODEL_CODE;

  try {
    const response: GenerateContentResponse = await currentAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json", 
        temperature: module === DiagramModule.TEXT && diagramStyle === DiagramStyle.SIMPLE && diagramType !== SimpleDiagramType.MERMAID_MIND_MAP ? 0.15 : 0.25, 
        topP: 0.9, 
        topK: module === DiagramModule.TEXT && diagramStyle === DiagramStyle.SIMPLE && diagramType !== SimpleDiagramType.MERMAID_MIND_MAP ? 25 : 45,
      }
    });

    const responseText = response.text;
    if (!responseText || responseText.trim() === "") {
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== "STOP") {
         throw new Error(`Received empty response from AI. Generation finished due to: ${candidate.finishReason}. ${candidate.finishMessage || ''}`);
      }
      return { nodes: [], edges: [], explanation: "AI returned an empty response." };
    }
    
    const diagramData = parseGeminiResponseToDiagramData(responseText);
    diagramData.nodes = diagramData.nodes.map(node => ({ ...node, type: 'custom' }));
    return diagramData;

  } catch (error: any) {
    console.error("Gemini API call for DiagramData failed:", error);
    if (error.message && (error.message.toLowerCase().includes("api key") || error.message.toLowerCase().includes("permission denied"))) { 
        if (!error.message.includes("Gemini API key not configured")) { 
             throw new Error("Gemini API key is not valid, missing, or lacks permissions. Check process.env.API_KEY. Original error: " + error.message);
        }
    }
    const defaultErrorExplanation = `Failed to generate diagram due to an API error: ${error.message || 'Unknown error'}`;
    throw new Error(error.message + ` | Explanation: ${defaultErrorExplanation}`);
  }
};

export const generateMermaidMindMapAndSummary = async (
  inputText: string
): Promise<MermaidDiagramData> => {
  let currentAI: GoogleGenAI;
  try {
    currentAI = getAIInstance();
  } catch (error: any) {
    const errorMessage = `Title: Error Initializing AI
Introduction: Could not connect to the AI service.
Main Explanation:
  Service Unavailable: The AI service required to generate the mind map and explanation could not be initialized. This is often due to API key issues.
Diagram Description: An error state mind map is shown.
Real-World Example or Analogy: Like trying to call someone but the phone line is down.
Summary:
  - AI service failed to start.
  - Check API key configuration.
Quiz Questions:
  1. What is a common cause for AI service initialization failure?`;
    return {
        mermaidSyntax: `mindmap\n  root((Error))\n    AI Service Initialization Failed\n    ${error.message || 'Unknown error.'}`,
        explanation: errorMessage
    };
  }

  // Node label formatting instructions
  const nodeLabelInstructions = `Node labels:
   - Use clear, descriptive text for all nodes
   - For complex node text (with spaces or special characters), enclose in quotes: \`"Node Text"\`
   - For better readability, use node IDs with labels: \`nodeId["Node Label"]\``;
  
  // Use the instructions in the prompt

  const prompt = `
You are an expert educational content designer creating clear, structured Mermaid.js mind maps.
Generate a JSON response with these keys:

1. "mermaidSyntax": A well-structured Mermaid mind map with:
   - Clear hierarchy using 2-space indentation
   - ALL nodes MUST be connected to the root node
   - Use descriptive node IDs (e.g., "concept_id[\\"Label\\"]")
   - Short, focused node labels (1-3 words)
   - Group related concepts with %% comments
   - Example structure:
     "mermaid\nmindmap\n  %% Core Concepts\n  root((Main Idea))\n    core[\\\"Core Concept\\\"]\n      def[\\\"Definition\\\"]\n      imp[\\\"Importance\\\"]\n    \\n  %% Related Topics\n    related[\\\"Related Topic\\\"]\n  "
   - CRITICAL: Ensure all nodes are properly connected to the root or its children
   - Never have disconnected nodes at the same level as the root

Node labels formatting:
- Use clear, descriptive text for all nodes
- For complex node text (with spaces or special characters), enclose in quotes: \`"Node Text"\`
- For better readability, use node IDs with labels: \`nodeId["Node Label"]\`

Example response (must be valid JSON):
{
  "mermaidSyntax": "mindmap\\n  %% Main Structure\\n  root((Central Concept))\\n    core[\\\"Core Idea\\\"]\\n      sub1[\\\"Key Aspect 1\\\"]\\n        detail1[\\\"Specific Detail\\\"]\\n    \\\"Supporting Concept\\\"\\n  \\n  %% Applications\\n    apps[\\\"Real-World Uses\\\"]\\n      example1[\\\"Example 1\\\"]\\n      example2[\\\"Example 2\\\"]\",
  "explanation": "Title: Understanding [Central Concept]\\nOverview: This mind map breaks down [Central Concept] into key components for better understanding.\\nKey Concepts:\\n- Core Idea: [Explanation]\\n  - Key Aspect 1: [Details]\\n  - Specific Detail: [More info]\\n- Supporting Concept: [Explanation]\\nRelationships: [How concepts connect and interact]\\nApplications: [Practical examples and use cases]\\nSummary: [Key takeaways and main points]"
}

Input to analyze:
---
${inputText}
---

Additional guidelines:
- Mermaid syntax must be valid
- Keep node text concise
- Use proper escaping for quotes
- Group related concepts with comments
- Ensure proper indentation for readability
`;

  try {
    const response: GenerateContentResponse = await currentAI.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json", 
        temperature: 0.2, 
        topP: 0.9,
        topK: 40,
      }
    });

    const responseText = response.text.trim();
    if (!responseText) {
      throw new Error("AI returned an empty response for Mermaid diagram generation.");
    }

    let jsonStr = responseText;
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsed: any = JSON.parse(jsonStr);

    if (typeof parsed.mermaidSyntax !== 'string' || !parsed.mermaidSyntax.toLowerCase().startsWith('mindmap')) {
        parsed.mermaidSyntax = `mindmap\n  root((Error))\n    AI returned invalid Mermaid syntax.`;
        console.warn("Parsed Mermaid syntax was invalid or not starting with 'mindmap'.");
    }
    if (typeof parsed.explanation !== 'string' || parsed.explanation.length < 50) { // Basic check for structured explanation
        parsed.explanation = `Title: Error in Explanation
Introduction: The AI did not provide a valid structured explanation.
Main Explanation:
  Content Missing: The detailed breakdown is unavailable.
Diagram Description: The diagram might be present but its explanation is missing.
Real-World Example or Analogy: Not available.
Summary:
  - Explanation generation failed.
Quiz Questions:
  1. Was the explanation generated correctly? (Answer: No)`;
        console.warn("Parsed explanation was not a string or seemed too short for the structure.");
    }
    
    return { 
        mermaidSyntax: parsed.mermaidSyntax,
        explanation: parsed.explanation
    };

  } catch (error: any) {
    console.error("Gemini API call for Mermaid diagram failed or parsing failed:", error);
    const errorIsApiKey = error.message && (error.message.toLowerCase().includes("api key") || error.message.toLowerCase().includes("permission denied"));
    const serviceErrorMessage = `Title: API Error
Introduction: Failed to generate the Mermaid Mind Map and its explanation due to an API or parsing issue.
Main Explanation:
  Error Details: ${error.message || 'Unknown error.'}
  Troubleshooting: If this is an API key issue, please ensure your process.env.API_KEY is correctly configured and has permissions. Otherwise, the AI response might have been malformed.
Diagram Description: An error state mind map is displayed.
Real-World Example or Analogy: Imagine asking for a drawing and a story, but the artist encountered a problem.
Summary:
  - API call failed or response was unparsable.
  - Check API key if applicable.
Quiz Questions:
  1. What should be checked if an API error occurs?`;
    
    return {
        mermaidSyntax: `mindmap\n  root((Error))\n    Gemini API Call Failed or Parsing Error\n    ${error.message || 'Unknown error.'}`,
        explanation: serviceErrorMessage
    };
  }
};


export const generateSmartDiagramWithJustification = async (
  inputText: string,
  module: DiagramModule
): Promise<SmartDiagramResponse> => {
  let currentAI: GoogleGenAI;
  try {
    currentAI = getAIInstance();
  } catch (error: any) {
    const defaultErrorType = module === DiagramModule.CODE ? CodeDiagramType.CONTROL_FLOW_GRAPH : SimpleDiagramType.MERMAID_MIND_MAP;
    const errorExplanation = `Justification for Diagram Choice: Default error type chosen due to AI initialization failure.
Title: AI Initialization Error
Introduction: Could not connect to the AI service for smart diagram generation.
Main Explanation:
  Service Unavailable: ${error.message || 'Unknown error.'}
Diagram Description: An error diagram is shown.
Real-World Example or Analogy: Trying to use a smart assistant that's offline.
Summary:
  - AI service failed.
Quiz Questions:
  1. What component failed during smart selection?`;
    const errorNode: Node = {
        id: 'err-smart-init', type: 'custom', 
        data: { label: 'Error initializing AI', iconKeyword: 'error' },
        position: { x: 50, y: 50 }
    };
    return {
        suggestedDiagramType: defaultErrorType,
        explanation: errorExplanation,
        ...(defaultErrorType === SimpleDiagramType.MERMAID_MIND_MAP 
            ? { mermaidSyntax: `mindmap\n  root((Error))\n    AI Service Initialization Failed` } 
            : { diagramData: { nodes: [errorNode], edges: [] }})
    };
  }

  const availableDiagramTypes = Object.values(module === DiagramModule.CODE ? CodeDiagramType : {...GeneralDiagramType, ...SimpleDiagramType});
  
  const smartExplanationStructurePrompt = `
"explanation": A string. It MUST start with a "Justification for Diagram Choice:" section, followed by the full educational explanation structure (Title, Introduction, Main Explanation, Diagram Description, Real-World Example, Summary, Quiz Questions).
  - Justification for Diagram Choice: Explain why this diagram type was chosen for the input.
  - Then, follow the educational structure:
    - Title: A concise title for the topic.
    - Introduction: Briefly introduce the topic, its importance/usefulness.
    - Main Explanation: Break down the topic step-by-step. Use subheadings that correspond to the main components of the diagram you are generating. Explain technical terms simply.
    - Diagram Description: Describe how the generated diagram visually represents the concepts in the Main Explanation. Ensure alignment between diagram labels/parts and the Main Explanation subheadings.
    - Real-World Example or Analogy: A relatable example or analogy.
    - Summary: Key points in a bulleted list (e.g., "- Point 1").
    - Quiz Questions (Optional): 2-3 short questions to reinforce learning.
  Example explanation for smart selection:
  \`\`\`
Justification for Diagram Choice: A Flowchart is suitable here because the input describes a sequential process with clear steps.
Title: Understanding the Process
Introduction: This flowchart explains the process X, highlighting its key stages.
Main Explanation:
  Step 1 Name (Node 1): Description of Step 1.
  Step 2 Name (Node 2): Description of Step 2.
Diagram Description: The flowchart shows 'Step 1 Name' leading to 'Step 2 Name'.
Real-World Example or Analogy: Like following a recipe.
Summary:
  - Process X involves Step 1 then Step 2.
Quiz Questions:
  1. What is the first step in Process X?
  \`\`\`
`;

const nodeLabelingInstructions = `Node labels:
   - Use clear, descriptive text for all nodes
   - For complex node text (with spaces or special characters), enclose in quotes: \`"Node Text"\`
   - For better readability, use node IDs with labels: \`nodeId["Node Label"]\``;

  const prompt = `
You are an advanced AI diagramming assistant and an educational content designer. Your task is to analyze the provided input (${module === DiagramModule.CODE ? 'code snippet' : 'textual description'}), select the MOST SUITABLE and SIMPLEST diagram type, generate its data, AND provide a structured educational explanation including your justification for the chosen diagram type.
Focus on simplification for complex inputs. The explanation should be accessible to beginners.

Input ${module === DiagramModule.CODE ? 'Code Snippet' : 'Text'}:
---
${inputText}
---

Instructions:
1.  Analyze input: Understand core concepts, relationships, structure.
2.  Select Diagram Type: Choose the most appropriate and simplest from: ${availableDiagramTypes.join(', ')}. Prioritize clarity.
3.  Generate Diagram Data & Explanation:

Your entire response MUST be a single, valid JSON object with NO markdown fences.
The JSON object must contain:
- "suggestedDiagramType": A string, exactly one of the valid diagram types.
- ${smartExplanationStructurePrompt}
- EITHER "mermaidSyntax" (string) if "${SimpleDiagramType.MERMAID_MIND_MAP}" was chosen.
  - Mermaid syntax must be valid, start with "mindmap", use indentation.
  - ${nodeLabelingInstructions}
  - No \`:::className\` after mind map node definitions.
- OR "diagramData" (object with "nodes" and "edges" arrays) for all other types.
  - Nodes: "id", "data" (with "label", optional "iconKeyword"), "position". Concise labels. Simple "iconKeyword" if applicable.
  - Edges: "id", "source", "target", optional "label".
  - Ensure all JSON sub-objects (nodes, data, position, edges) are correctly formatted and terminated. Pay meticulous attention to commas.

Example for Mermaid Mind Map (explanation content is illustrative and must follow the full structure described above):
{
  "suggestedDiagramType": "${SimpleDiagramType.MERMAID_MIND_MAP}",
  ${smartExplanationStructurePrompt.replace('"explanation": A string', '"explanation": "Justification for Diagram Choice: A Mermaid Mind Map was chosen..."').replace(/\s*Example explanation for smart selection:[\s\S]*/, '')},
  "mermaidSyntax": "mindmap\\n  root((Main Idea))\\n    section1_id[\\\"Section 1 (Details)\\\"]\\n      Detail A\\n    \\\\\"Section 2 (Overview)\\\"\"
}

Example for Simple Flowchart (explanation content is illustrative and must follow the full structure described above):
{
  "suggestedDiagramType": "${GeneralDiagramType.FLOWCHART}",
  ${smartExplanationStructurePrompt.replace('"explanation": A string', '"explanation": "Justification for Diagram Choice: A Flowchart is suitable here..."').replace(/\s*Example explanation for smart selection:[\s\S]*/, '')},
  "diagramData": {
    "nodes": [
      { "id": "s1", "data": { "label": "Start", "iconKeyword": "play" }, "position": { "x": 100, "y": 50 }, "type":"input" },
      { "id": "s2", "data": { "label": "Core Step", "iconKeyword": "gear" }, "position": { "x": 100, "y": 150 } },
      { "id": "s3", "data": { "label": "End", "iconKeyword": "flag" }, "position": { "x": 100, "y": 250 }, "type":"output" }
    ],
    "edges": [
      { "id": "e1-2", "source": "s1", "target": "s2" },
      { "id": "e2-3", "source": "s2", "target": "s3" }
    ]
  }
}
CRITICAL: Ensure the output is ONLY the JSON object. NO extraneous characters or comments. The explanation MUST follow the detailed structured format including the justification.
`;

  const modelName = module === DiagramModule.TEXT ? GEMINI_MODEL_TEXT : GEMINI_MODEL_CODE;

  try {
    const response: GenerateContentResponse = await currentAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.35, 
        topP: 0.9,
        topK: 50,
      }
    });

    const responseText = response.text.trim();
    if (!responseText) {
      throw new Error("AI returned an empty response for smart diagram generation.");
    }

    let jsonStr = responseText;
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    try {
      const parsed: any = JSON.parse(jsonStr);

      if (!parsed.suggestedDiagramType || typeof parsed.suggestedDiagramType !== 'string' || !availableDiagramTypes.includes(parsed.suggestedDiagramType as AllDiagramType)) {
        throw new Error(`AI returned an invalid or missing 'suggestedDiagramType'. Received: ${parsed.suggestedDiagramType}`);
      }
      if (typeof parsed.explanation !== 'string' || !parsed.explanation.toLowerCase().includes("justification for diagram choice:") || parsed.explanation.length < 70) { // Basic check for structure
        throw new Error(`AI returned an invalid or missing 'explanation' or it lacked the required 'Justification for Diagram Choice:' section. Received: ${parsed.explanation}`);
      }
      
      const smartResponse: SmartDiagramResponse = {
        suggestedDiagramType: parsed.suggestedDiagramType as AllDiagramType,
        explanation: parsed.explanation,
      };

      if (parsed.suggestedDiagramType === SimpleDiagramType.MERMAID_MIND_MAP) {
        if (typeof parsed.mermaidSyntax !== 'string' || parsed.mermaidSyntax.trim() === "") {
          throw new Error(`For Mermaid Mind Map, 'mermaidSyntax' must be a non-empty string.`);
        }
        smartResponse.mermaidSyntax = parsed.mermaidSyntax;
      } else {
        if (!parsed.diagramData || typeof parsed.diagramData !== 'object') {
          throw new Error(`For interactive diagrams, 'diagramData' object is required.`);
        }
        const validatedDiagramData = parseGeminiResponseToDiagramData(JSON.stringify(parsed.diagramData), false); 
        validatedDiagramData.nodes = validatedDiagramData.nodes.map(node => ({ ...node, type: 'custom' }));
        smartResponse.diagramData = validatedDiagramData;
      }
      return smartResponse;

    } catch (e: any) {
      console.error("Failed to parse or validate JSON response for SmartDiagram. Raw AI response:", responseText, "Processed JSON string:", jsonStr);
      throw new Error(`AI returned malformed or invalid JSON for smart diagram. Error: ${e.message}. Content sample: ${jsonStr.substring(0, 200)}`);
    }

  } catch (error: any) {
    console.error("Gemini API call for SmartDiagram failed:", error);
    const errorIsApiKey = error.message && (error.message.toLowerCase().includes("api key") || error.message.toLowerCase().includes("permission denied"));
     const serviceErrorMessage = `Justification for Diagram Choice: Default error type selected due to API failure.
Title: Smart Diagram Generation Error
Introduction: Failed to generate the smart diagram and explanation due to an API issue.
Main Explanation:
  Error Details: ${error.message || 'Unknown error.'}
  Troubleshooting: If this is an API key issue, please check process.env.API_KEY.
Diagram Description: An error diagram is shown.
Real-World Example or Analogy: Your smart assistant encountered an unexpected problem.
Summary:
  - Smart diagram generation failed.
  - API error occurred.
Quiz Questions:
  1. What might cause an API error?`;
    
    const defaultErrorType = module === DiagramModule.CODE ? CodeDiagramType.CONTROL_FLOW_GRAPH : SimpleDiagramType.MERMAID_MIND_MAP;
    const errorNode: Node = {
        id: 'err-smart-api', type: 'custom',
        data: { label: 'Error generating diagram', iconKeyword: 'error' },
        position: { x: 50, y: 50 }
    };
    
    return {
        suggestedDiagramType: defaultErrorType,
        explanation: serviceErrorMessage,
        ...(defaultErrorType === SimpleDiagramType.MERMAID_MIND_MAP
            ? { mermaidSyntax: `mindmap\n  root((Error))\n    Gemini API Call Failed` }
            : { diagramData: { nodes: [errorNode], edges: [] } })
    };
  }
};
