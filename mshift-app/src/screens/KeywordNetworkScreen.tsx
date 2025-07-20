import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  PanResponder,
  Animated,
  Platform
} from 'react-native';

// 웹에서는 제스처 핸들러 사용 안함
let Gesture, GestureDetector, useSharedValue, useAnimatedStyle, runOnJS, ReanimatedView;
let gestureHandlersAvailable = false;

if (Platform.OS !== 'web') {
  try {
    // 더 안전한 로드 방식
    const { Gesture: GestureImport, GestureDetector: GestureDetectorImport } = require('react-native-gesture-handler');
    const reanimated = require('react-native-reanimated');
    const { useSharedValue: useSharedValueImport, useAnimatedStyle: useAnimatedStyleImport, runOnJS: runOnJSImport, default: ReanimatedDefault } = reanimated;
    
    Gesture = GestureImport;
    GestureDetector = GestureDetectorImport;
    useSharedValue = useSharedValueImport;
    useAnimatedStyle = useAnimatedStyleImport;
    runOnJS = runOnJSImport;
    ReanimatedView = ReanimatedDefault.View;
    
    gestureHandlersAvailable = true;
    console.log('✅ Gesture handlers and reanimated loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load gesture handlers:', error);
    console.log('🔄 Falling back to basic touch events');
    gestureHandlersAvailable = false;
  }
} else {
  console.log('🌐 Web platform - gesture handlers disabled');
}
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import * as d3 from 'd3';
import { Colors } from '../constants/colors';
import { useAppSelector } from '../store/hooks';

const { width, height } = Dimensions.get('window');
const svgWidth = width - 32;
const svgHeight = height - 200;

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'merchant' | 'category' | 'amount';
  value: number;
  color: string;
  radius: number;
  transactions?: number;
  category?: string;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  strength: number;
  strokeWidth: number;
}

const KeywordNetworkScreen: React.FC = () => {
  const navigation = useNavigation();
  const { transactions } = useAppSelector(state => state.transaction);
  const insets = useSafeAreaInsets();
  
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [links, setLinks] = useState<NetworkLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [simulationRef, setSimulationRef] = useState<d3.Simulation<NetworkNode, NetworkLink> | null>(null);
  const [showSampleData, setShowSampleData] = useState(false);
  
  // 줌과 팬을 위한 애니메이션 값들 (reanimated shared values 또는 기본 Animated)
  const scale = Platform.OS !== 'web' && gestureHandlersAvailable && useSharedValue ? 
    useSharedValue(1) : 
    useRef(new Animated.Value(1)).current;
  const translateX = Platform.OS !== 'web' && gestureHandlersAvailable && useSharedValue ? 
    useSharedValue(0) : 
    useRef(new Animated.Value(0)).current;
  const translateY = Platform.OS !== 'web' && gestureHandlersAvailable && useSharedValue ? 
    useSharedValue(0) : 
    useRef(new Animated.Value(0)).current;
  
  // 제스처 상태
  const [gestureState, setGestureState] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  
  // 노드 드래그 모드 감지
  const [isDraggingNode, setIsDraggingNode] = useState(false);

  const animatedNodes = useRef(new Map<string, { x: Animated.Value; y: Animated.Value }>()).current;

  useEffect(() => {
    generateNetworkData();
  }, [transactions, showSampleData]);

  useEffect(() => {
    if (nodes.length > 0) {
      setupSimulation();
    }
  }, [nodes]);

  const generateSampleTransactions = () => {
    return [
      { id: 1, merchant: 'GS25 편의점', amount: 5000, type: 'expense' as const, category: '편의점', transactionDate: '2024-01-15', status: 'approved' as const, confidence: 0.95 },
      { id: 2, merchant: '스타벅스 강남점', amount: 4500, type: 'expense' as const, category: '카페', transactionDate: '2024-01-15', status: 'approved' as const, confidence: 0.92 },
      { id: 3, merchant: 'SK주유소', amount: 50000, type: 'expense' as const, category: '차량유지비', transactionDate: '2024-01-14', status: 'approved' as const, confidence: 0.98 },
      { id: 4, merchant: '삼성전자', amount: 120000, type: 'expense' as const, category: '사무용품비', transactionDate: '2024-01-14', status: 'pending' as const, confidence: 0.87 },
      { id: 5, merchant: '네이버페이', amount: 8000, type: 'expense' as const, category: '온라인서비스', transactionDate: '2024-01-13', status: 'approved' as const, confidence: 0.94 },
      { id: 6, merchant: 'CU편의점', amount: 3500, type: 'expense' as const, category: '편의점', transactionDate: '2024-01-13', status: 'approved' as const, confidence: 0.96 },
      { id: 7, merchant: '현대오일뱅크', amount: 45000, type: 'expense' as const, category: '차량유지비', transactionDate: '2024-01-12', status: 'approved' as const, confidence: 0.97 },
      { id: 8, merchant: '이디야커피', amount: 3000, type: 'expense' as const, category: '카페', transactionDate: '2024-01-12', status: 'approved' as const, confidence: 0.93 },
      { id: 9, merchant: '쿠팡', amount: 25000, type: 'expense' as const, category: '온라인서비스', transactionDate: '2024-01-11', status: 'approved' as const, confidence: 0.89 },
      { id: 10, merchant: '세븐일레븐', amount: 4200, type: 'expense' as const, category: '편의점', transactionDate: '2024-01-11', status: 'approved' as const, confidence: 0.95 },
      { id: 11, merchant: 'LG전자', amount: 80000, type: 'expense' as const, category: '사무용품비', transactionDate: '2024-01-10', status: 'approved' as const, confidence: 0.91 },
      { id: 12, merchant: 'S-OIL', amount: 48000, type: 'expense' as const, category: '차량유지비', transactionDate: '2024-01-10', status: 'approved' as const, confidence: 0.98 },
      { id: 13, merchant: '컴포즈커피', amount: 2500, type: 'expense' as const, category: '카페', transactionDate: '2024-01-09', status: 'approved' as const, confidence: 0.94 },
      { id: 14, merchant: '11번가', amount: 15000, type: 'expense' as const, category: '온라인서비스', transactionDate: '2024-01-09', status: 'pending' as const, confidence: 0.86 },
      { id: 15, merchant: '미니스톱', amount: 6000, type: 'expense' as const, category: '편의점', transactionDate: '2024-01-08', status: 'approved' as const, confidence: 0.97 },
      { id: 16, merchant: '애플', amount: 150000, type: 'expense' as const, category: '사무용품비', transactionDate: '2024-01-08', status: 'approved' as const, confidence: 0.99 },
      { id: 17, merchant: '할리스커피', amount: 5500, type: 'expense' as const, category: '카페', transactionDate: '2024-01-07', status: 'approved' as const, confidence: 0.92 },
      { id: 18, merchant: 'GS칼텍스', amount: 52000, type: 'expense' as const, category: '차량유지비', transactionDate: '2024-01-07', status: 'approved' as const, confidence: 0.98 },
      { id: 19, merchant: '카카오페이', amount: 12000, type: 'expense' as const, category: '온라인서비스', transactionDate: '2024-01-06', status: 'approved' as const, confidence: 0.95 },
      { id: 20, merchant: 'e마트24', amount: 7800, type: 'expense' as const, category: '편의점', transactionDate: '2024-01-06', status: 'approved' as const, confidence: 0.96 },
    ];
  };

  const generateNetworkData = () => {
    let transactionData = transactions;
    
    // 샘플 데이터 모드이거나 실제 데이터가 없는 경우
    if (showSampleData || (!transactions || transactions.length === 0)) {
      if (showSampleData) {
        transactionData = generateSampleTransactions();
      } else {
        console.log('No transaction data found, showing empty state...');
        setNodes([]);
        setLinks([]);
        return;
      }
    }

    // 거래처별 통계 계산
    const merchantStats = new Map<string, { count: number; totalAmount: number; categories: Set<string> }>();
    const categoryStats = new Map<string, { count: number; totalAmount: number; merchants: Set<string> }>();

    transactionData.forEach(transaction => {
      const merchant = transaction.merchant;
      const category = transaction.category;
      const amount = transaction.amount;

      // 거래처 통계
      if (!merchantStats.has(merchant)) {
        merchantStats.set(merchant, { count: 0, totalAmount: 0, categories: new Set() });
      }
      const merchantStat = merchantStats.get(merchant)!;
      merchantStat.count++;
      merchantStat.totalAmount += amount;
      merchantStat.categories.add(category);

      // 카테고리 통계
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { count: 0, totalAmount: 0, merchants: new Set() });
      }
      const categoryStat = categoryStats.get(category)!;
      categoryStat.count++;
      categoryStat.totalAmount += amount;
      categoryStat.merchants.add(merchant);
    });

    // 노드 생성
    const networkNodes: NetworkNode[] = [];
    const networkLinks: NetworkLink[] = [];

    // 거래처 노드들
    merchantStats.forEach((stat, merchant) => {
      const radius = Math.max(8, Math.min(25, stat.count * 3));
      networkNodes.push({
        id: `merchant-${merchant}`,
        label: merchant,
        type: 'merchant',
        value: stat.count,
        color: '#2196F3',
        radius,
        transactions: stat.count,
        category: Array.from(stat.categories)[0] // 주요 카테고리
      });
    });

    // 카테고리 노드들
    const categoryColors: { [key: string]: string } = {
      '매출': '#4CAF50',
      '광고선전비': '#FF9800',
      '사무용품비': '#2196F3',
      '차량유지비': '#9C27B0',
      '복리후생비': '#FF5722',
      '온라인서비스': '#607D8B',
      '기타': '#757575'
    };

    categoryStats.forEach((stat, category) => {
      const radius = Math.max(12, Math.min(30, stat.count * 2));
      networkNodes.push({
        id: `category-${category}`,
        label: category,
        type: 'category',
        value: stat.count,
        color: categoryColors[category] || '#757575',
        radius,
        transactions: stat.count
      });
    });

    // 연결 생성 (거래처 - 카테고리)
    transactionData.forEach(transaction => {
      const merchantId = `merchant-${transaction.merchant}`;
      const categoryId = `category-${transaction.category}`;
      
      // 이미 존재하는 링크인지 확인
      const existingLink = networkLinks.find(link => 
        (link.source === merchantId && link.target === categoryId) ||
        (link.source === categoryId && link.target === merchantId)
      );

      if (existingLink) {
        existingLink.strength++;
        existingLink.strokeWidth = Math.min(6, Math.max(2, existingLink.strength * 0.8));
      } else {
        networkLinks.push({
          source: merchantId,
          target: categoryId,
          strength: 1,
          strokeWidth: 2
        });
      }
    });

    // 상위 노드들만 선택 (너무 많으면 복잡해짐)
    const topMerchants = networkNodes
      .filter(n => n.type === 'merchant')
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);

    const topCategories = networkNodes
      .filter(n => n.type === 'category')
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const finalNodes = [...topMerchants, ...topCategories];
    const finalLinks = networkLinks.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return finalNodes.find(n => n.id === sourceId) && finalNodes.find(n => n.id === targetId);
    });

    setNodes(finalNodes);
    setLinks(finalLinks);

    // 애니메이션을 위한 Animated.Value 초기화
    finalNodes.forEach(node => {
      animatedNodes.set(node.id!, {
        x: new Animated.Value(svgWidth / 2),
        y: new Animated.Value(svgHeight / 2)
      });
    });
  };

  const setupSimulation = () => {
    // 시뮬레이션 전에 초기 좌표 설정
    nodes.forEach(node => {
      if (!node.x) node.x = svgWidth / 2 + (Math.random() - 0.5) * 100;
      if (!node.y) node.y = svgHeight / 2 + (Math.random() - 0.5) * 100;
    });

    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(links)
        .id(d => d.id!)
        .distance(80)
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody()
        .strength(-300)
        .distanceMin(10)
        .distanceMax(200)
      )
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .force('collision', d3.forceCollide()
        .radius(d => d.radius + 5)
      )
      .alphaDecay(0.02)
      .on('tick', handleTick);

    setSimulationRef(simulation);
  };

  const handleTick = () => {
    const updatedCoordinates: {[key: string]: {x: number, y: number}} = {};
    
    nodes.forEach(node => {
      if (node.x !== undefined && node.y !== undefined) {
        const boundedX = Math.max(node.radius, Math.min(svgWidth - node.radius, node.x));
        const boundedY = Math.max(node.radius, Math.min(svgHeight - node.radius, node.y));
        
        // 노드 위치 업데이트
        updatedCoordinates[node.id!] = { x: boundedX, y: boundedY };
        
        const animatedNode = animatedNodes.get(node.id!);
        if (animatedNode) {
          Animated.timing(animatedNode.x, {
            toValue: boundedX,
            duration: 16,
            useNativeDriver: false,
          }).start();
          
          Animated.timing(animatedNode.y, {
            toValue: boundedY,
            duration: 16,
            useNativeDriver: false,
          }).start();
        }
      }
    });
    
    // 링크 좌표 업데이트
    setLinkCoordinates(updatedCoordinates);
  };

  const handleNodePress = (node: NetworkNode) => {
    setSelectedNode(node);
    
    // 노드 강조 애니메이션
    const animatedNode = animatedNodes.get(node.id!);
    if (animatedNode) {
      Animated.sequence([
        Animated.timing(animatedNode.x, {
          toValue: (animatedNode.x as any)._value + 5,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(animatedNode.x, {
          toValue: (animatedNode.x as any)._value - 5,
          duration: 100,
          useNativeDriver: false,
        })
      ]).start();
    }

    Alert.alert(
      `${node.type === 'merchant' ? '거래처' : '카테고리'} 정보`,
      `이름: ${node.label}\n거래 횟수: ${node.transactions}회\n유형: ${node.type === 'merchant' ? '거래처' : '카테고리'}`,
      [{ text: '확인', style: 'default' }]
    );
  };

  const createPanResponder = (node: NetworkNode) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // 노드 드래그 모드 활성화
        setIsDraggingNode(true);
        
        // 드래그 시작 시 시뮬레이션 일시 정지
        if (simulationRef) {
          simulationRef.alphaTarget(0.3).restart();
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const animatedNode = animatedNodes.get(node.id!);
        if (animatedNode && node.x !== undefined && node.y !== undefined) {
          // 현재 줌과 팬을 고려한 상대적 위치 계산
          const scaleValue = gestureState.scale || 1;
          const newX = node.x + (gestureState.dx / scaleValue);
          const newY = node.y + (gestureState.dy / scaleValue);
          
          // 시뮬레이션의 노드 위치 업데이트
          node.fx = Math.max(node.radius, Math.min(svgWidth - node.radius, newX));
          node.fy = Math.max(node.radius, Math.min(svgHeight - node.radius, newY));
          
          animatedNode.x.setValue(node.fx);
          animatedNode.y.setValue(node.fy);
        }
      },
      onPanResponderRelease: () => {
        // 노드 드래그 모드 비활성화
        setIsDraggingNode(false);
        
        // 드래그 종료 시 고정 해제
        node.fx = undefined;
        node.fy = undefined;
        
        if (simulationRef) {
          simulationRef.alphaTarget(0);
        }
      },
    });
  };

  const renderNodes = () => {
    return nodes.map(node => {
      const animatedNode = animatedNodes.get(node.id!);
      if (!animatedNode) return null;

      return (
        <Animated.View
          key={node.id}
          style={[
            styles.nodeContainer,
            {
              left: animatedNode.x,
              top: animatedNode.y,
              width: node.radius * 2,
              height: node.radius * 2,
              marginLeft: -node.radius,
              marginTop: -node.radius,
            }
          ]}
          {...createPanResponder(node).panHandlers}
        >
          <TouchableOpacity
            style={[
              styles.node,
              {
                backgroundColor: node.color,
                width: node.radius * 2,
                height: node.radius * 2,
                borderRadius: node.radius,
                borderWidth: selectedNode?.id === node.id ? 3 : 0,
                borderColor: Colors.white,
              }
            ]}
            onPress={() => handleNodePress(node)}
          >
            <Text style={[styles.nodeText, { fontSize: Math.max(8, node.radius * 0.4) }]}>
              {node.label.length > 8 ? node.label.substring(0, 6) + '...' : node.label}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  const [linkCoordinates, setLinkCoordinates] = useState<{[key: string]: {x: number, y: number}}>({});

  const renderLinks = () => {
    return (
      <Svg style={styles.svg} width={svgWidth} height={svgHeight}>
        {links.map((link, index) => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          
          const sourceNode = nodes.find(n => n.id === sourceId);
          const targetNode = nodes.find(n => n.id === targetId);
          
          if (!sourceNode || !targetNode) {
            return null;
          }

          // 업데이트된 좌표 사용 (없으면 시뮬레이션 좌표 사용)
          const sourceCoord = linkCoordinates[sourceId] || { x: sourceNode.x || svgWidth / 2, y: sourceNode.y || svgHeight / 2 };
          const targetCoord = linkCoordinates[targetId] || { x: targetNode.x || svgWidth / 2, y: targetNode.y || svgHeight / 2 };
          
          const sourceX = sourceCoord.x;
          const sourceY = sourceCoord.y;
          const targetX = targetCoord.x;
          const targetY = targetCoord.y;

          return (
            <Line
              key={`link-${index}`}
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke="#2c3e50"
              strokeWidth={Math.max(2, link.strokeWidth)}
              strokeOpacity={0.9}
            />
          );
        })}
      </Svg>
    );
  };

  const restartSimulation = () => {
    if (simulationRef) {
      simulationRef.alpha(1).restart();
    }
  };

  // 제스처는 모바일에서만 사용 - useMemo로 최적화
  const composedGesture = useMemo(() => {
    if (Platform.OS === 'web' || !gestureHandlersAvailable || !Gesture) {
      console.log('🔍 Gesture disabled - Platform:', Platform.OS, 'Handlers available:', gestureHandlersAvailable);
      return null;
    }
    
    console.log('🔍 Setting up gestures for mobile platform');
    // 핀치 줌 제스처
    const pinchGesture = Gesture.Pinch()
      .onStart(() => {
        console.log('🤏 Pinch gesture started');
      })
      .onUpdate((event) => {
        console.log('🤏 Pinch update:', event.scale, 'Velocity:', event.velocity);
        const newScale = Math.max(0.5, Math.min(3, event.scale));
        if (gestureHandlersAvailable && useSharedValue && scale.value !== undefined) {
          scale.value = newScale;
          console.log('🤏 Setting scale.value to:', newScale);
        } else {
          scale.setValue(newScale);
          console.log('🤏 Setting scale (Animated) to:', newScale);
        }
      })
      .onEnd((event) => {
        console.log('🤏 Pinch end:', event.scale);
        const newScale = Math.max(0.5, Math.min(3, event.scale));
        
        if (runOnJS) {
          runOnJS(setGestureState)({ ...gestureState, scale: newScale });
        } else {
          setGestureState(prev => ({ ...prev, scale: newScale }));
        }
        
        console.log('🤏 Final scale value:', newScale);
      });

    // 팬 제스처 (한 손가락 이동) - 노드 드래그 중이 아닐 때만 활성화
    const panGesture = Gesture.Pan()
      .minPointers(1)
      .maxPointers(1)
      .onStart(() => {
        console.log('👆 Pan gesture started, isDraggingNode:', isDraggingNode);
      })
      .onUpdate((event) => {
        if (!isDraggingNode) {
          console.log('👆 Pan update:', event.translationX, event.translationY, 'isDraggingNode:', isDraggingNode);
          
          if (gestureHandlersAvailable && useSharedValue && translateX.value !== undefined) {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
            console.log('👆 Setting translate values to:', event.translationX, event.translationY);
          } else {
            translateX.setValue(event.translationX);
            translateY.setValue(event.translationY);
            console.log('👆 Setting translate (Animated) to:', event.translationX, event.translationY);
          }
        } else {
          console.log('👆 Pan blocked - node dragging active');
        }
      })
      .onEnd((event) => {
        if (!isDraggingNode) {
          console.log('👆 Pan end:', event.translationX, event.translationY);
          const newTranslateX = gestureState.translateX + event.translationX;
          const newTranslateY = gestureState.translateY + event.translationY;
          
          if (runOnJS) {
            runOnJS(setGestureState)({
              ...gestureState,
              translateX: newTranslateX,
              translateY: newTranslateY,
            });
          } else {
            setGestureState(prev => ({
              ...prev,
              translateX: newTranslateX,
              translateY: newTranslateY,
            }));
          }
          
          console.log('👆 Pan gesture ended, final position:', newTranslateX, newTranslateY);
        }
      });

    // 더블 탭 제스처는 일시적으로 비활성화 (크래시 이슈로 인해)
    // const doubleTapGesture = Gesture.Tap().numberOfTaps(2)...

    // 제스처 조합 (더블탭 제외)
    const combined = Gesture.Simultaneous(pinchGesture, panGesture);
    
    console.log('✅ All gestures configured successfully');
    return combined;
  }, [gestureState, isDraggingNode, gestureHandlersAvailable]);

  // 리셋 함수
  const resetZoomAndPan = () => {
    console.log('🏠 Resetting zoom and pan...');
    
    try {
      setGestureState({ scale: 1, translateX: 0, translateY: 0 });
      
      if (gestureHandlersAvailable && useSharedValue && scale.value !== undefined) {
        // Reanimated shared values
        console.log('🏠 Using Reanimated reset');
        scale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
      } else {
      // Regular React Native Animated
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
      console.log('🏠 Using React Native Animated reset');
      }
      
      console.log('🏠 Reset completed successfully');
    } catch (error) {
      console.error('🚨 Error in resetZoomAndPan:', error);
    }
  };
  
  // Reanimated 스타일 (shared values용)
  const animatedStyle = Platform.OS !== 'web' && gestureHandlersAvailable && useAnimatedStyle ? useAnimatedStyle(() => {
    console.log('🎨 Animated style update - scale:', scale.value, 'translateX:', translateX.value, 'translateY:', translateY.value);
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  }) : null;

  // 테스트용 터치 이벤트 핸들러
  const handleTestTouch = () => {
    console.log('🔥 TEST TOUCH DETECTED!');
  };

  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>키워드 네트워크</Text>
          <View style={styles.headerButtons}>
            {showSampleData && (
              <TouchableOpacity 
                style={styles.realDataButton}
                onPress={() => setShowSampleData(false)}
              >
                <Text style={styles.realDataButtonText}>실제 데이터</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={restartSimulation}
            >
              <Text style={styles.resetButtonText}>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetZoomAndPan}
            >
              <Text style={styles.resetButtonText}>🏠</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleTestTouch}
            >
              <Text style={styles.resetButtonText}>🔥</Text>
            </TouchableOpacity>
          </View>
        </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 {Platform.OS === 'web' ? '노드 드래그' : '노드 드래그 • 두 손가락 줌 • 한 손가락 이동 • 🏠버튼 리셋'}
          {showSampleData && ' (샘플 데이터 표시 중)'}
        </Text>
      </View>

      {/* Network Graph */}
      <View style={styles.graphContainer}>
        {(transactions.length > 0 || showSampleData) ? (
          Platform.OS === 'web' ? (
            <View style={styles.graphContent}>
              {renderLinks()}
              {renderNodes()}
            </View>
          ) : (
            gestureHandlersAvailable && GestureDetector && composedGesture ? (
              <GestureDetector gesture={composedGesture}>
                {ReanimatedView ? (
                  <ReanimatedView 
                    style={[
                      styles.graphContent,
                      animatedStyle
                    ]}
                    onTouchStart={() => console.log('👆 Touch started on graph')}
                  >
                    {renderLinks()}
                    {renderNodes()}
                  </ReanimatedView>
                ) : (
                  <Animated.View 
                    style={[
                      styles.graphContent,
                      {
                        transform: [
                          { scale },
                          { translateX },
                          { translateY },
                        ],
                      }
                    ]}
                    onTouchStart={() => console.log('👆 Touch started on graph')}
                  >
                    {renderLinks()}
                    {renderNodes()}
                  </Animated.View>
                )}
              </GestureDetector>
            ) : (
              <View style={styles.graphContent}>
                <Text style={[styles.infoText, { color: '#666', marginBottom: 10 }]}>
                  📱 제스처 기능 비활성화 (기본 터치 이벤트 사용)
                </Text>
                {renderLinks()}
                {renderNodes()}
              </View>
            )
          )
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>데이터가 없습니다</Text>
            <Text style={styles.emptyStateSubtext}>
              거래 데이터가 있으면 키워드 네트워크가 표시됩니다
            </Text>
            <TouchableOpacity 
              style={styles.sampleButton}
              onPress={() => setShowSampleData(true)}
            >
              <Text style={styles.sampleButtonText}>📊 샘플 보기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Controls Guide */}
      <View style={styles.controlsGuide}>
        <Text style={styles.controlsTitle}>조작 방법</Text>
        <View style={styles.controlsGrid}>
          <View style={styles.controlItem}>
            <Text style={styles.controlIcon}>👆</Text>
            <Text style={styles.controlText}>노드 드래그</Text>
          </View>
          {Platform.OS !== 'web' && (
            <>
              <View style={styles.controlItem}>
                <Text style={styles.controlIcon}>🤏</Text>
                <Text style={styles.controlText}>핀치 줌</Text>
              </View>
              <View style={styles.controlItem}>
                <Text style={styles.controlIcon}>👇</Text>
                <Text style={styles.controlText}>그래프 이동</Text>
              </View>
              <View style={styles.controlItem}>
                <Text style={styles.controlIcon}>🏠</Text>
                <Text style={styles.controlText}>버튼 리셋</Text>
              </View>
            </>
          )}
          {Platform.OS === 'web' && (
            <>
              <View style={styles.controlItem}>
                <Text style={styles.controlIcon}>🖱️</Text>
                <Text style={styles.controlText}>마우스 드래그</Text>
              </View>
              <View style={styles.controlItem}>
                <Text style={styles.controlIcon}>🔄</Text>
                <Text style={styles.controlText}>리셋 버튼</Text>
              </View>
              <View style={styles.controlItem}>
                <Text style={styles.controlIcon}>📊</Text>
                <Text style={styles.controlText}>샘플 보기</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.legendText}>거래처</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>카테고리</Text>
        </View>
        <Text style={styles.legendSubtext}>노드 크기 = 거래 빈도</Text>
      </View>

      {/* Selected Node Info */}
      {selectedNode && (
        <View style={styles.selectedNodeInfo}>
          <Text style={styles.selectedNodeTitle}>{selectedNode.label}</Text>
          <Text style={styles.selectedNodeDetails}>
            {selectedNode.type === 'merchant' ? '거래처' : '카테고리'} • {selectedNode.transactions}회 거래
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  resetButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resetButtonText: {
    fontSize: 18,
  },
  infoContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  graphContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f8f9fa',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  graphContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  nodeContainer: {
    position: 'absolute',
  },
  node: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nodeText: {
    color: Colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  legendSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 16,
  },
  selectedNodeInfo: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  selectedNodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  selectedNodeDetails: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  sampleButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sampleButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  realDataButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  realDataButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  controlsGuide: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  controlsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  controlsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlItem: {
    alignItems: 'center',
    flex: 1,
  },
  controlIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  controlText: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default KeywordNetworkScreen;