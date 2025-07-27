import { NextResponse } from 'next/server';

import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const scriptPath = path.join(
      process.cwd(),
      'scripts/generate-brand-transaction-strings.js'
    );

    console.log('Starting brand transaction string generation...');

    // 스크립트 실행
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`);

    if (stderr) {
      console.error('Script stderr:', stderr);
    }

    console.log('Script output:', stdout);

    return NextResponse.json({
      success: true,
      message: 'Brand transaction strings generated successfully',
      output: stdout,
    });
  } catch (error) {
    console.error('Error generating brand transaction strings:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate brand transaction strings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
