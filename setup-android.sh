#!/bin/bash

# Android 개발 환경 설정 스크립트
echo "🤖 Android 개발 환경 설정"
echo "=========================="
echo ""

# Android Studio 설치 확인
echo "1️⃣ Android Studio 설치 확인 중..."
if [ -d "/Applications/Android Studio.app" ]; then
    echo "   ✅ Android Studio가 설치되어 있습니다"
    ANDROID_STUDIO_INSTALLED=true
else
    echo "   ❌ Android Studio가 설치되지 않았습니다"
    ANDROID_STUDIO_INSTALLED=false
fi
echo ""

# Android SDK 경로 확인
echo "2️⃣ Android SDK 경로 확인 중..."
POSSIBLE_SDK_PATHS=(
    "$HOME/Library/Android/sdk"
    "$HOME/Android/Sdk" 
    "/opt/android-sdk"
    "/usr/local/android-sdk"
)

SDK_FOUND=false
for path in "${POSSIBLE_SDK_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "   ✅ Android SDK 발견: $path"
        ANDROID_SDK_ROOT="$path"
        SDK_FOUND=true
        break
    fi
done

if [ "$SDK_FOUND" = false ]; then
    echo "   ❌ Android SDK를 찾을 수 없습니다"
    
    if [ "$ANDROID_STUDIO_INSTALLED" = true ]; then
        echo ""
        echo "🔧 Android Studio가 설치되어 있지만 SDK 경로가 설정되지 않았습니다."
        echo "   다음 단계를 수행하세요:"
        echo "   1. Android Studio 실행"
        echo "   2. Configure → SDK Manager"
        echo "   3. Android SDK Location 확인"
        echo "   4. 일반적으로 ~/Library/Android/sdk에 설치됩니다"
        echo ""
    else
        echo ""
        echo "📱 Android Studio 및 SDK 설치가 필요합니다:"
        echo "   1. Android Studio 다운로드: https://developer.android.com/studio"
        echo "   2. 설치 후 SDK 설정"
        echo ""
    fi
else
    echo ""
    echo "3️⃣ 환경 변수 설정 중..."
    
    # 환경 변수 설정
    export ANDROID_HOME="$ANDROID_SDK_ROOT"
    export ANDROID_SDK_ROOT="$ANDROID_SDK_ROOT"
    export PATH="$PATH:$ANDROID_HOME/emulator"
    export PATH="$PATH:$ANDROID_HOME/tools"
    export PATH="$PATH:$ANDROID_HOME/tools/bin" 
    export PATH="$PATH:$ANDROID_HOME/platform-tools"
    
    echo "   ✅ 환경 변수 설정 완료"
    echo "   ANDROID_HOME=$ANDROID_HOME"
    echo ""
    
    # ADB 확인
    echo "4️⃣ ADB 도구 확인 중..."
    if [ -f "$ANDROID_HOME/platform-tools/adb" ]; then
        echo "   ✅ ADB 도구 발견"
        ADB_VERSION=$($ANDROID_HOME/platform-tools/adb version 2>/dev/null | head -1)
        echo "   📋 $ADB_VERSION"
    else
        echo "   ❌ ADB 도구를 찾을 수 없습니다"
        echo "   💡 Android Studio에서 SDK Tools를 설치하세요"
    fi
    echo ""
    
    # 에뮬레이터 확인
    echo "5️⃣ Android 에뮬레이터 확인 중..."
    if [ -f "$ANDROID_HOME/emulator/emulator" ]; then
        echo "   ✅ 에뮬레이터 도구 발견"
        
        # AVD 목록 확인
        AVD_LIST=$($ANDROID_HOME/emulator/emulator -list-avds 2>/dev/null)
        if [ ! -z "$AVD_LIST" ]; then
            echo "   📱 설치된 가상 기기 (AVD):"
            echo "$AVD_LIST" | sed 's/^/      - /'
        else
            echo "   ⚠️  설정된 가상 기기가 없습니다"
            echo "   💡 Android Studio에서 AVD Manager로 가상 기기를 만드세요"
        fi
    else
        echo "   ❌ 에뮬레이터를 찾을 수 없습니다"
    fi
    echo ""
    
    # 연결된 기기 확인  
    echo "6️⃣ 연결된 Android 기기 확인 중..."
    if [ -f "$ANDROID_HOME/platform-tools/adb" ]; then
        DEVICES=$($ANDROID_HOME/platform-tools/adb devices 2>/dev/null | grep -v "List of devices" | grep -v "^$")
        if [ ! -z "$DEVICES" ]; then
            echo "   📱 연결된 기기:"
            echo "$DEVICES" | sed 's/^/      /'
        else
            echo "   ⚠️  연결된 기기가 없습니다"
        fi
    fi
    echo ""
fi

# 영구 환경 변수 설정 제안
echo "7️⃣ 환경 변수 영구 설정"
echo "======================="

SHELL_CONFIG=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

if [ "$SDK_FOUND" = true ] && [ ! -z "$SHELL_CONFIG" ]; then
    echo "다음 내용을 $SHELL_CONFIG 파일에 추가하세요:"
    echo ""
    echo "# Android SDK 환경 변수"
    echo "export ANDROID_HOME=\"$ANDROID_SDK_ROOT\""
    echo "export ANDROID_SDK_ROOT=\"$ANDROID_SDK_ROOT\""
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/emulator\""
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools\""
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools/bin\""
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/platform-tools\""
    echo ""
    
    read -p "지금 자동으로 추가하시겠습니까? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "" >> "$SHELL_CONFIG"
        echo "# Android SDK 환경 변수" >> "$SHELL_CONFIG"
        echo "export ANDROID_HOME=\"$ANDROID_SDK_ROOT\"" >> "$SHELL_CONFIG"
        echo "export ANDROID_SDK_ROOT=\"$ANDROID_SDK_ROOT\"" >> "$SHELL_CONFIG"
        echo "export PATH=\"\$PATH:\$ANDROID_HOME/emulator\"" >> "$SHELL_CONFIG"
        echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools\"" >> "$SHELL_CONFIG"
        echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools/bin\"" >> "$SHELL_CONFIG"
        echo "export PATH=\"\$PATH:\$ANDROID_HOME/platform-tools\"" >> "$SHELL_CONFIG"
        echo "   ✅ $SHELL_CONFIG에 환경 변수가 추가되었습니다"
        echo "   🔄 새 터미널을 열거나 'source $SHELL_CONFIG'를 실행하세요"
    fi
fi

echo ""
echo "🚀 다음 단계"
echo "============"
if [ "$SDK_FOUND" = true ]; then
    echo "1. 새 터미널 열기 또는 'source ~/.zshrc' 실행"
    echo "2. Android 에뮬레이터 실행:"
    echo "   - Android Studio → AVD Manager → 가상 기기 실행"
    echo "   - 또는 터미널에서: \$ANDROID_HOME/emulator/emulator -avd [AVD_이름]"
    echo "3. 트로이 앱 실행:"
    echo "   - ./start-tj-app.sh"
    echo "   - 터미널에서 'a' 키를 눌러 Android 에뮬레이터로 실행"
else
    echo "1. Android Studio 설치: https://developer.android.com/studio"
    echo "2. 설치 완료 후 이 스크립트를 다시 실행"
    echo "3. SDK 및 가상 기기 설정"
fi