const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const createTemplate = (title, description) => {
  return new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `[${title}]`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: description,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "[Full Name]", bold: true, size: 32 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "[Email] | [Phone] | [Location]",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "[LinkedIn URL] | [GitHub URL] | [Portfolio URL]",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Professional Summary",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "[Write a brief summary of your professional background and goals here.]",
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Education",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "[Degree Name] - [Institution Name] ([Start Year] - [End Year])",
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Technical Skills",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "[List your technical skills separated by commas, e.g., JavaScript, React, Node.js]",
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Soft Skills",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "[List your soft skills separated by commas, e.g., Communication, Leadership, Problem Solving]",
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Work Experience",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "[Job Title] - [Company Name] ([Start Date] - [End Date])",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• [Describe your responsibilities and achievements in this role.]",
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Projects",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "[Project Name]",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• [Describe the project, technologies used, and your contribution.]",
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Certifications",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "[Certification Name] - [Issuing Organization]",
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Achievements",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "• [Describe a notable achievement or award.]",
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Languages",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "[Language 1] - [Proficiency Level], [Language 2] - [Proficiency Level]",
            spacing: { after: 400 },
          }),
        ],
      },
    ],
  });
};

const templates = [
  { name: 'Professional Resume', filename: 'Professional_Resume_Template.docx', desc: 'A clean, standard format suitable for corporate roles.' },
  { name: 'Modern Resume', filename: 'Modern_Resume_Template.docx', desc: 'A contemporary layout for modern companies and startups.' },
  { name: 'Fresher Resume', filename: 'Fresher_Resume_Template.docx', desc: 'Optimized for recent graduates with less experience.' },
  { name: 'Software Developer Resume', filename: 'Software_Developer_Resume_Template.docx', desc: 'Focused on technical skills, projects, and GitHub/Portfolio links.' },
  { name: 'Simple ATS-Friendly Resume', filename: 'Simple_ATS_Friendly_Resume_Template.docx', desc: 'A basic, text-focused format ensuring high ATS parsability.' },
];

const targetDir = path.join(__dirname, 'uploads', 'templates');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function generate() {
  for (const t of templates) {
    const doc = createTemplate(t.name, t.desc);
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(targetDir, t.filename), buffer);
    console.log(`Generated ${t.filename}`);
  }
  console.log('All templates generated successfully.');
}

generate().catch(console.error);
