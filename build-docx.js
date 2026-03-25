const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, PageBreak,
  Header, Footer, PageNumber, AlignmentType, HeadingLevel,
} = require("docx");

const msDir = path.join(__dirname, "manuscript");

// Reading order
const files = [
  "prologue.md",
  "chapter-zero.md",
  "chapter-01.md",
  "chapter-02.md",
  "chapter-03.md",
  "chapter-04.md",
  "chapter-05.md",
  "chapter-06.md",
  "chapter-07.md",
  "chapter-07b.md",
  "chapter-08.md",
  "chapter-09.md",
  "chapter-10.md",
  "chapter-11.md",
  "chapter-12.md",
  "chapter-13.md",
  "chapter-14.md",
  "chapter-15.md",
  "chapter-final.md",
];

function mdToSectionChildren(md, isFirst) {
  const lines = md.split("\n");
  const children = [];

  if (!isFirst) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "---") {
      // Section divider - blank line + centered mark + blank line
      children.push(new Paragraph({ spacing: { before: 200 } }));
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "＊", font: "Yu Mincho", size: 24 })],
        })
      );
      children.push(new Paragraph({ spacing: { after: 200 } }));
      continue;
    }

    if (trimmed.startsWith("# ")) {
      // Chapter title
      const title = trimmed.replace(/^# /, "");
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 400 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: title,
              bold: true,
              font: "Yu Mincho",
              size: 32,
            }),
          ],
        })
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      // Section number
      const section = trimmed.replace(/^## /, "");
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: section,
              bold: true,
              font: "Yu Mincho",
              size: 26,
            }),
          ],
        })
      );
      continue;
    }

    if (trimmed === "") {
      children.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    // Body text - handle bold markers
    const runs = [];
    const parts = trimmed.split(/(\*\*[^*]+\*\*)/);
    for (const part of parts) {
      if (part.startsWith("**") && part.endsWith("**")) {
        runs.push(
          new TextRun({
            text: part.slice(2, -2),
            bold: true,
            font: "Yu Mincho",
            size: 22,
          })
        );
      } else if (part) {
        runs.push(
          new TextRun({
            text: part,
            font: "Yu Mincho",
            size: 22,
          })
        );
      }
    }

    if (runs.length > 0) {
      children.push(
        new Paragraph({
          spacing: { after: 60, line: 360 },
          indent: { firstLine: 440 },
          children: runs,
        })
      );
    }
  }

  return children;
}

// Build all children
let allChildren = [];

// Title page
allChildren.push(
  new Paragraph({ spacing: { before: 4000 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "赤い桜",
        bold: true,
        font: "Yu Mincho",
        size: 56,
      }),
    ],
  }),
  new Paragraph({ spacing: { before: 400 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "Akai Sakura",
        font: "Yu Mincho",
        size: 28,
        italics: true,
      }),
    ],
  }),
  new Paragraph({ spacing: { before: 800 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "カイザーライヒ世界線の仮想戦記",
        font: "Yu Mincho",
        size: 22,
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// Process each chapter
for (let i = 0; i < files.length; i++) {
  const filePath = path.join(msDir, files[i]);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${files[i]} not found`);
    continue;
  }
  const md = fs.readFileSync(filePath, "utf-8");
  const children = mdToSectionChildren(md, false);
  allChildren = allChildren.concat(children);
  console.log(`OK: ${files[i]}`);
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Yu Mincho", size: 22 },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Yu Mincho" },
        paragraph: {
          spacing: { before: 600, after: 400 },
          outlineLevel: 0,
        },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Yu Mincho" },
        paragraph: {
          spacing: { before: 400, after: 200 },
          outlineLevel: 1,
        },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: {
            top: 1800,
            right: 1440,
            bottom: 1800,
            left: 1440,
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "赤い桜",
                  font: "Yu Mincho",
                  size: 18,
                  color: "999999",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: "Yu Mincho",
                  size: 18,
                  color: "999999",
                }),
              ],
            }),
          ],
        }),
      },
      children: allChildren,
    },
  ],
});

const outPath = path.join(__dirname, "赤い桜_2稿.docx");
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log(`\nGenerated: ${outPath}`);
  console.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
