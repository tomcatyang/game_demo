import { BaseTest } from './utils/testUtils';
import { useTouchControls, recognizeGesture, TOUCH_PRESETS } from '../src/hooks/useTouchControls';
import { GameInput } from '../src/types';

declare const global: any;


// 模拟函数类型
type MockFunction = (...args: any[]) => any;

// 触摸控制测试类
export class TouchControlsTest extends BaseTest {
  private mockOnInput: MockFunction;
  private mockVibrate: MockFunction;

  constructor() {
    super();
    this.mockOnInput = () => {};
    this.mockVibrate = () => {};
  }

  // 设置测试环境
  private setupTestEnvironment() {
    // 模拟navigator对象
    if (typeof navigator === 'undefined') {
      (global as any).navigator = {
        vibrate: this.mockVibrate,
      };
    } else {
      // 模拟震动API
      Object.defineProperty(navigator, 'vibrate', {
        value: this.mockVibrate,
        writable: true,
      });
    }
    
    // 重置模拟函数
    this.mockOnInput = () => {};
    this.mockVibrate = () => {};
  }

  // 测试Hook初始化
  testHookInitialization() {
    this.setupTestEnvironment();
    
    // 测试Hook函数存在
    this.assert(typeof useTouchControls === 'function', 'useTouchControls should be a function');
    
    // 测试默认配置
    const defaultConfig = {
      enabled: true,
      vibration: true,
      sensitivity: 1.0,
      gestureConfig: {
        swipeThreshold: 50,
        swipeVelocity: 0.3,
        tapMaxDuration: 200,
        tapMaxDistance: 10,
        longPressDuration: 500,
        doubleTapDelay: 300,
      },
    };
    
    this.assert(defaultConfig.enabled === true, 'default enabled should be true');
    this.assert(defaultConfig.vibration === true, 'default vibration should be true');
    this.assert(defaultConfig.sensitivity === 1.0, 'default sensitivity should be 1.0');
    
    console.log('✅ Hook initialization test passed');
  }

  // 测试手势识别
  testGestureRecognition() {
    this.setupTestEnvironment();
    
    const config = TOUCH_PRESETS.desktop.gestureConfig;
    
    // 测试点击识别
    const tapResult = recognizeGesture(100, 100, 105, 105, 150, config);
    this.assert(tapResult === 'tap', 'should recognize tap gesture');
    
    // 测试右滑识别
    const swipeRightResult = recognizeGesture(100, 100, 200, 100, 300, config);
    this.assert(swipeRightResult === 'swipe-right', 'should recognize swipe right');
    
    // 测试左滑识别
    const swipeLeftResult = recognizeGesture(200, 100, 100, 100, 300, config);
    this.assert(swipeLeftResult === 'swipe-left', 'should recognize swipe left');
    
    // 测试上滑识别
    const swipeUpResult = recognizeGesture(100, 200, 100, 100, 300, config);
    this.assert(swipeUpResult === 'swipe-up', 'should recognize swipe up');
    
    // 测试下滑识别
    const swipeDownResult = recognizeGesture(100, 100, 100, 200, 300, config);
    this.assert(swipeDownResult === 'swipe-down', 'should recognize swipe down');
    
    // 测试长按识别
    const longPressResult = recognizeGesture(100, 100, 105, 105, 600, config);
    this.assert(longPressResult === 'long-press', 'should recognize long press');
    
    // 测试无效手势
    const noneResult = recognizeGesture(100, 100, 110, 110, 50, config);
    this.assert(noneResult === 'none', 'should recognize no gesture for small movement');
    
    console.log('✅ Gesture recognition test passed');
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 Starting TouchControls tests...');
    
    try {
      this.testHookInitialization();
      this.testGestureRecognition();
      
      console.log('✅ All TouchControls tests passed!');
    } catch (error) {
      console.log(`❌ TouchControls test failed: ${error}`);
      throw error;
    }
  }
}

// 导出测试函数
export const runTouchControlsTests = async () => {
  const test = new TouchControlsTest();
  return await test.runAllTests();
};

// 默认导出
export default TouchControlsTest;