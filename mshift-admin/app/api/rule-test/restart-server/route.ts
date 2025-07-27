import { NextResponse } from 'next/server';

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('Restarting API server...');

    // 기존 Spring Boot 프로세스 종료
    try {
      await execAsync('pkill -f "mvn spring-boot:run"');
      console.log('Killed existing Spring Boot processes');
    } catch (error) {
      console.log('No existing Spring Boot processes found');
    }

    // 포트 8080 사용 중인 프로세스 종료
    try {
      await execAsync('lsof -ti:8080 | xargs kill -9');
      console.log('Killed processes using port 8080');
    } catch (error) {
      console.log('No processes using port 8080');
    }

    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 새로운 Spring Boot 서버 시작
    const projectRoot = process.cwd();
    const apiPath = `${projectRoot}/../../mshift-api`;

    // 백그라운드에서 서버 시작
    exec(
      `cd "${apiPath}" && mvn spring-boot:run > ../server.log 2>&1 &`,
      (error, stdout, stderr) => {
        if (error) {
          console.error('Error starting server:', error);
        } else {
          console.log('Server restart initiated');
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'API server restart initiated',
    });
  } catch (error) {
    console.error('Error restarting API server:', error);
    return NextResponse.json(
      { error: 'Failed to restart API server' },
      { status: 500 }
    );
  }
}
