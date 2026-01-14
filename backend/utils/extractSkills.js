const normalizeSkill = require("./normalizeSkill");
const SKILLS = require("./skillDictionary");

module.exports = function extractSkills(text) {
  if (!text) return [];

  // Clean text: lowercase and replace non-alphanumeric with spaces
  const cleanText = text
    .toLowerCase()
    .replace(/[^a-z0-9+/.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const foundSkills = new Set();

  // Sort skills by length (longest first) to match "react" before "r"
  SKILLS
    .sort((a, b) => b.length - a.length)
    .forEach(skill => {
      // Escape special regex characters
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      
      // Create word boundary regex
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      
      // Test for whole word match
      if (regex.test(cleanText)) {
        foundSkills.add(normalizeSkill(skill));
      }
    });

  return Array.from(foundSkills).map(name => ({ name }));
};
