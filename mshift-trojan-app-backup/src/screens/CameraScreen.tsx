import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useAppDispatch } from '../store/hooks';
import { uploadReceipt } from '../store/slices/receiptSlice';

export default function CameraScreen({ navigation }: any) {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const dispatch = useAppDispatch();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>카메라 권한이 필요합니다</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
      } catch (error) {
        Alert.alert('오류', '사진 촬영에 실패했습니다.');
      }
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const processReceipt = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      // Upload and process receipt
      const result = await dispatch(uploadReceipt({
        imageUri: capturedImage,
        userId: 'current_user_id', // TODO: Get from auth state
      })).unwrap();

      Alert.alert(
        '처리 완료!',
        `영수증이 성공적으로 처리되었습니다.\n금액: ₩${result.amount.toLocaleString()}\n가맹점: ${result.merchantName}`,
        [
          {
            text: '확인',
            onPress: () => {
              setCapturedImage(null);
              navigation.navigate('Transactions');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('오류', '영수증 처리에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.retakeButton]} 
              onPress={retakePhoto}
            >
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.actionButtonText}>다시 촬영</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.processButton]}
              onPress={processReceipt}
              disabled={isProcessing}
            >
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.actionButtonText}>
                {isProcessing ? '처리 중...' : '영수증 처리'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>영수증 촬영</Text>
        <TouchableOpacity onPress={() => setType(
          type === CameraType.back ? CameraType.front : CameraType.back
        )}>
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <View style={styles.focusArea}>
            <Text style={styles.instructionText}>
              영수증을 프레임 안에 맞춰주세요
            </Text>
          </View>
        </View>
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.galleryButton} 
          onPress={pickImageFromGallery}
        >
          <Ionicons name="images" size={32} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>📸 촬영 팁</Text>
        <Text style={styles.tipsText}>
          • 충분한 조명 확보{'\n'}
          • 영수증 전체가 보이도록{'\n'}
          • 흔들림 없이 촬영
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusArea: {
    width: 300,
    height: 400,
    borderWidth: 2,
    borderColor: 'white',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  galleryButton: {
    padding: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
  },
  placeholder: {
    width: 52,
  },
  tips: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  tipsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipsText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: '#FF6B6B',
  },
  processButton: {
    backgroundColor: '#4ECDC4',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});