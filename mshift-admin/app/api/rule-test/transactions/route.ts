import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const TRANSACTION_FILE_PATH = path.join(process.cwd(), '../data/app-data/bank-a-transaction.json');

export async function GET() {
  try {
    // JSON 파일 읽기
    const fileContent = await fs.readFile(TRANSACTION_FILE_PATH, 'utf8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading transaction file:', error);
    return NextResponse.json(
      { error: 'Failed to read transaction data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // JSON 파일에 쓰기 (전체 데이터 덮어쓰기)
    await fs.writeFile(TRANSACTION_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing transaction file:', error);
    return NextResponse.json(
      { error: 'Failed to save transaction data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newTransaction = await request.json();
    
    // 기존 JSON 파일 읽기
    const fileContent = await fs.readFile(TRANSACTION_FILE_PATH, 'utf8');
    const data = JSON.parse(fileContent);
    
    // 새 거래 추가
    data.transactions.push(newTransaction);
    
    // JSON 파일에 쓰기
    await fs.writeFile(TRANSACTION_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    
    // 업데이트된 전체 데이터 반환
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding new transaction:', error);
    return NextResponse.json(
      { error: 'Failed to add new transaction' },
      { status: 500 }
    );
  }
}