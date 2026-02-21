const fs = require('fs');
const constantsContent = fs.readFileSync('constants.ts', 'utf-8');

const zhData = {};
const mbtiMatchRegex = /case\s+['"]([A-Z]{4})['"]:\s*return\s+\{([\s\S]*?)(?=case\s+['"][A-Z]{4}['"]:\s*|default:\s*)/g;
let match;
while ((match = mbtiMatchRegex.exec(constantsContent)) !== null) {
    const mbti = match[1];
    const block = match[2];

    const strengthsMatch = block.match(/strengths:\s*\[([\s\S]*?)\]/);
    const strengths = strengthsMatch ? strengthsMatch[1].split(',').map(s => s.replace(/["'\n]/g, '').trim()).filter(Boolean) : [];

    const blindSpotsMatch = block.match(/blindSpots:\s*\[([\s\S]*?)\]/);
    const blindSpots = blindSpotsMatch ? blindSpotsMatch[1].split(',').map(s => s.replace(/["'\n]/g, '').trim()).filter(Boolean) : [];

    const careerMatch = block.match(/career:\s*\{\s*style:\s*['"](.*?)['"],\s*advice:\s*['"](.*?)['"]\s*\}/);
    const career = careerMatch ? { style: careerMatch[1], advice: careerMatch[2] } : { style: '', advice: '' };

    const relMatch = block.match(/relationships:\s*\{\s*romance:\s*['"](.*?)['"],\s*advice:\s*['"](.*?)['"]\s*\}/);
    const relationships = relMatch ? { romance: relMatch[1], advice: relMatch[2] } : { romance: '', advice: '' };

    zhData[mbti] = { strengths, blindSpots, career, relationships };
}

const esfpMatch = constantsContent.match(/case\s+['"]ESFP['"]:\s*return\s+\{([\s\S]*?)\n\s*\};/);
if (esfpMatch) {
    const block = esfpMatch[1];
    const strengthsMatch = block.match(/strengths:\s*\[([\s\S]*?)\]/);
    const strengths = strengthsMatch ? strengthsMatch[1].split(',').map(s => s.replace(/["'\n]/g, '').trim()).filter(Boolean) : [];
    const blindSpotsMatch = block.match(/blindSpots:\s*\[([\s\S]*?)\]/);
    const blindSpots = blindSpotsMatch ? blindSpotsMatch[1].split(',').map(s => s.replace(/["'\n]/g, '').trim()).filter(Boolean) : [];
    const careerMatch = block.match(/career:\s*\{\s*style:\s*['"](.*?)['"],\s*advice:\s*['"](.*?)['"]\s*\}/);
    const career = careerMatch ? { style: careerMatch[1], advice: careerMatch[2] } : { style: '', advice: '' };
    const relMatch = block.match(/relationships:\s*\{\s*romance:\s*['"](.*?)['"],\s*advice:\s*['"](.*?)['"]\s*\}/);
    const relationships = relMatch ? { romance: relMatch[1], advice: relMatch[2] } : { romance: '', advice: '' };
    zhData["ESFP"] = { strengths, blindSpots, career, relationships };
}

fs.writeFileSync('zh_extracted.json', JSON.stringify(zhData, null, 2));
console.log('Extracted ' + Object.keys(zhData).length + ' types to zh_extracted.json');
