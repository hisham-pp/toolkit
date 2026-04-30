import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileA = formData.get("fileA") as File;
    const fileB = formData.get("fileB") as File;

    if (!fileA || !fileB) {
      return NextResponse.json({ error: "Two files are required" }, { status: 400 });
    }

    const bufferA = Buffer.from(await fileA.arrayBuffer());
    const bufferB = Buffer.from(await fileB.arrayBuffer());

    const workbookA = XLSX.read(bufferA);
    const workbookB = XLSX.read(bufferB);

    const sheetNameA = workbookA.SheetNames[0];
    const sheetNameB = workbookB.SheetNames[0];

    const sheetA = workbookA.Sheets[sheetNameA];
    const sheetB = workbookB.Sheets[sheetNameB];

    const dataA = XLSX.utils.sheet_to_json(sheetA, { header: 1 }) as any[][];
    const dataB = XLSX.utils.sheet_to_json(sheetB, { header: 1 }) as any[][];

    const maxRows = Math.max(dataA.length, dataB.length);
    const diffs: any[] = [];

    for (let r = 0; r < maxRows; r++) {
      const rowA = dataA[r] || [];
      const rowB = dataB[r] || [];
      const maxCols = Math.max(rowA.length, rowB.length);

      const rowDiffs: any[] = [];
      let hasChange = false;

      for (let c = 0; c < maxCols; c++) {
        const valA = rowA[c];
        const valB = rowB[c];

        if (valA !== valB) {
          hasChange = true;
          rowDiffs.push({
            col: XLSX.utils.encode_col(c),
            old: valA === undefined ? "(empty)" : valA,
            new: valB === undefined ? "(empty)" : valB
          });
        }
      }

      if (hasChange) {
        diffs.push({
          row: r + 1,
          changes: rowDiffs
        });
      }
    }

    return NextResponse.json({
      summary: {
        totalRowsA: dataA.length,
        totalRowsB: dataB.length,
        diffCount: diffs.length
      },
      diffs
    });
  } catch (error: any) {
    console.error("Excel Diff Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
