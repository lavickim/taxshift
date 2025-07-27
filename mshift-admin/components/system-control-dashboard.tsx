'use client';

import { useEffect, useState } from 'react';

import {
  Activity,
  CheckCircle,
  Clock,
  Database,
  Download,
  Eye,
  Play,
  RefreshCw,
  RotateCcw,
  Server,
  Smartphone,
  Square,
  Terminal,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';

// import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ServiceStatus {
  name: string;
  port: number;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  pid?: number;
  startTime?: string;
  icon: React.ReactNode;
  description: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'error' | 'warning' | 'debug';
  service: string;
  message: string;
}

export function SystemControlDashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Backend API',
      port: 8080,
      status: 'stopped',
      icon: <Server className='h-4 w-4' />,
      description: 'Spring Boot API Server',
    },
    {
      name: 'Admin Frontend',
      port: 3000,
      status: 'running',
      icon: <Activity className='h-4 w-4' />,
      description: 'NextJS Admin Panel',
    },
    {
      name: 'PostgreSQL',
      port: 5432,
      status: 'stopped',
      icon: <Database className='h-4 w-4' />,
      description: 'Main Database',
    },
    {
      name: 'Redis',
      port: 6379,
      status: 'stopped',
      icon: <Zap className='h-4 w-4' />,
      description: 'Cache & Session Store',
    },
    {
      name: 'Mobile App',
      port: 19002,
      status: 'stopped',
      icon: <Smartphone className='h-4 w-4' />,
      description: 'React Native Mobile App',
    },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogService, setSelectedLogService] = useState<string>('all');

  // 서비스 상태 확인
  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/system/status');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error('Failed to check service status:', error);
    }
  };

  // 전체 시스템 시작
  const startAllServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system/start-all', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        await checkServiceStatus();
        addLogEntry('system', 'info', 'All services started successfully');
      } else {
        addLogEntry(
          'system',
          'error',
          `Failed to start services: ${data.message}`
        );
      }
    } catch (error) {
      addLogEntry('system', 'error', `Error starting services: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 전체 시스템 중지
  const stopAllServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system/stop-all', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        await checkServiceStatus();
        addLogEntry('system', 'info', 'All services stopped successfully');
      } else {
        addLogEntry(
          'system',
          'error',
          `Failed to stop services: ${data.message}`
        );
      }
    } catch (error) {
      addLogEntry('system', 'error', `Error stopping services: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 개별 서비스 제어
  const controlService = async (
    serviceName: string,
    action: 'start' | 'stop' | 'restart'
  ) => {
    try {
      const response = await fetch(
        `/api/system/service/${serviceName}/${action}`,
        { method: 'POST' }
      );
      const data = await response.json();

      if (data.success) {
        await checkServiceStatus();
        addLogEntry(serviceName, 'info', `Service ${action}ed successfully`);
      } else {
        addLogEntry(
          serviceName,
          'error',
          `Failed to ${action} service: ${data.message}`
        );
      }
    } catch (error) {
      addLogEntry(serviceName, 'error', `Error ${action}ing service: ${error}`);
    }
  };

  // 로그 엔트리 추가
  const addLogEntry = (
    service: string,
    level: LogEntry['level'],
    message: string
  ) => {
    const newEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
    };
    setLogs(prev => [newEntry, ...prev].slice(0, 1000)); // 최대 1000개 유지
  };

  // 로그 가져오기
  const fetchLogs = async (service: string = 'all') => {
    try {
      const response = await fetch(`/api/system/logs?service=${service}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  // 로그 파일 다운로드
  const downloadLogs = async (service: string) => {
    try {
      const response = await fetch(
        `/api/system/logs/download?service=${service}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${service}-logs-${new Date().toISOString().split('T')[0]}.log`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download logs:', error);
    }
  };

  // 로그 지우기
  const clearLogs = () => {
    setLogs([]);
    addLogEntry('system', 'info', 'Logs cleared');
  };

  // 초기 로드 및 주기적 업데이트
  useEffect(() => {
    checkServiceStatus();
    fetchLogs();

    const interval = setInterval(checkServiceStatus, 5000); // 5초마다 상태 확인
    return () => clearInterval(interval);
  }, []);

  // 상태별 색상 및 아이콘
  const getStatusDisplay = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'running':
        return {
          color: 'bg-green-500',
          icon: <CheckCircle className='h-3 w-3' />,
          text: '실행중',
        };
      case 'stopped':
        return {
          color: 'bg-gray-500',
          icon: <XCircle className='h-3 w-3' />,
          text: '중지됨',
        };
      case 'starting':
        return {
          color: 'bg-blue-500',
          icon: <Clock className='h-3 w-3' />,
          text: '시작중',
        };
      case 'stopping':
        return {
          color: 'bg-orange-500',
          icon: <Clock className='h-3 w-3' />,
          text: '중지중',
        };
      case 'error':
        return {
          color: 'bg-red-500',
          icon: <XCircle className='h-3 w-3' />,
          text: '오류',
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: <XCircle className='h-3 w-3' />,
          text: '알 수 없음',
        };
    }
  };

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'debug':
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredLogs =
    selectedLogService === 'all'
      ? logs
      : logs.filter(log => log.service === selectedLogService);

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>시스템 제어 센터</h1>
          <p className='mt-2 text-muted-foreground'>
            MoneyShift AI Platform의 모든 서비스를 한 곳에서 관리하세요
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={checkServiceStatus}>
            <RefreshCw className='mr-2 h-4 w-4' />
            상태 새로고침
          </Button>
        </div>
      </div>

      {/* 전체 제어 패널 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Terminal className='h-5 w-5' />
            시스템 제어
          </CardTitle>
          <CardDescription>
            전체 시스템을 한 번에 시작하거나 중지할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4'>
            <Button
              onClick={startAllServices}
              disabled={isLoading}
              className='flex-1'
              size='lg'
            >
              <Play className='mr-2 h-4 w-4' />
              전체 시작
            </Button>
            <Button
              onClick={stopAllServices}
              disabled={isLoading}
              variant='destructive'
              className='flex-1'
              size='lg'
            >
              <Square className='mr-2 h-4 w-4' />
              전체 중지
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 서비스 상태 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {services.map(service => {
          const statusDisplay = getStatusDisplay(service.status);
          return (
            <Card key={service.name}>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {service.icon}
                    <CardTitle className='text-lg'>{service.name}</CardTitle>
                  </div>
                  <Badge className={`${statusDisplay.color} text-white`}>
                    <div className='flex items-center gap-1'>
                      {statusDisplay.icon}
                      {statusDisplay.text}
                    </div>
                  </Badge>
                </div>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='text-sm text-muted-foreground'>
                    포트: {service.port}
                    {service.pid && ` • PID: ${service.pid}`}
                  </div>
                  {service.startTime && (
                    <div className='text-sm text-muted-foreground'>
                      시작 시각:{' '}
                      {new Date(service.startTime).toLocaleString('ko-KR')}
                    </div>
                  )}
                  <div className='flex gap-2 pt-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => controlService(service.name, 'start')}
                      disabled={
                        service.status === 'running' ||
                        service.status === 'starting'
                      }
                    >
                      <Play className='mr-1 h-3 w-3' />
                      시작
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => controlService(service.name, 'stop')}
                      disabled={
                        service.status === 'stopped' ||
                        service.status === 'stopping'
                      }
                    >
                      <Square className='mr-1 h-3 w-3' />
                      중지
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => controlService(service.name, 'restart')}
                      disabled={
                        service.status === 'starting' ||
                        service.status === 'stopping'
                      }
                    >
                      <RotateCcw className='mr-1 h-3 w-3' />
                      재시작
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 로그 뷰어 */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Eye className='h-5 w-5' />
                실시간 로그
              </CardTitle>
              <CardDescription>
                시스템 전체 또는 개별 서비스의 로그를 실시간으로 확인하세요
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <select
                value={selectedLogService}
                onChange={e => setSelectedLogService(e.target.value)}
                className='rounded border px-3 py-1 text-sm'
              >
                <option value='all'>전체 로그</option>
                {services.map(service => (
                  <option key={service.name} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
              <Button
                size='sm'
                variant='outline'
                onClick={() => downloadLogs(selectedLogService)}
              >
                <Download className='mr-1 h-4 w-4' />
                다운로드
              </Button>
              <Button size='sm' variant='outline' onClick={clearLogs}>
                <Trash2 className='mr-1 h-4 w-4' />
                지우기
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className='h-96 rounded border p-4'>
            {filteredLogs.length === 0 ? (
              <div className='py-8 text-center text-muted-foreground'>
                로그가 없습니다
              </div>
            ) : (
              <div className='space-y-1'>
                {filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`rounded p-2 text-xs ${getLogLevelColor(log.level)}`}
                  >
                    <div className='flex items-center gap-2'>
                      <span className='font-mono'>
                        {new Date(log.timestamp).toLocaleTimeString('ko-KR')}
                      </span>
                      <Badge variant='outline' className='text-xs'>
                        {log.service}
                      </Badge>
                      <Badge variant='outline' className='text-xs'>
                        {log.level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className='mt-1'>{log.message}</div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
