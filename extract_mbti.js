const fs = require('fs');

const content = fs.readFileSync('constants.ts', 'utf8');

// A very hacky way to extract the baseDb object from constants.ts
const match = content.match(/const baseDb: Record<string, MbtiResultData> = ({[\s\S]*?});\n\n  const/);
if (match) {
  let objectString = match[1];
  // Replace some things to make it valid JSON-like or evaluatable
  objectString = objectString.replace(/getBgColor\("[A-Z]{4}"\)/g, '""');
  objectString = objectString.replace(/characterImageUrl/g, '""');
  objectString = objectString.replace(/DESSERT_IMAGES\.[A-Z_]+/g, '""');
  
  try {
    const fn = new Function('return ' + objectString);
    const data = fn();
    
    const result = [];
    for (const key in data) {
      const p = data[key];
      result.push({
        id: p.id,
        title: p.title,
        summary: p.summary,
        quote: p.quote,
        coreAnalysis: p.coreAnalysis,
        soulQuestions: p.soulQuestions.join(' | ')
      });
    }
    fs.writeFileSync('extracted_mbti.json', JSON.stringify(result, null, 2));
    console.log("Extracted successfully.");
  } catch (e) {
    console.error("Evaluation failed", e);
  }
} else {
  console.log("Match not found");
}
