import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/init';

export async function POST() {
  try {
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error) {
    console.error('Database initialization API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database initialization failed'
      },
      { status: 500 }
    );
  }
} 