/**
 * 全局事件总线
 * 基于 mitt 实现的类型安全事件系统，用于跨组件通信
 */
import mitt from 'mitt';

// 1. 定义事件类型映射
// Key 是事件名，Value 是该事件传递的数据类型
// eslint-disable-next-line ts/consistent-type-definitions
type Events = {
  /** test 事件 */
  test: {
    aaa: string;
  };
};

const emitter = mitt<Events>();

export { emitter };
