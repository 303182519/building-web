/**
 * 存储项配置选项
 */
interface SetItemOptions {
  /** 从当前时间往后多长时间过期（毫秒） */
  maxAge?: number;
}

/**
 * localStorage 中存储的数据结构
 */
interface StorageData<T> {
  /** 存储的值 */
  value: T;
  /** 存储的起始时间戳 */
  start: number;
  /** 过期时间戳，不存在时表示永不过期 */
  expired?: number;
}

/**
 * 带过期时间的 localStorage 封装类
 * 提供自动过期管理功能，支持设置过期时间或永久存储
 */
class LocalExpiredStorage {
  /** 用于区分带过期时间的 key，避免与普通 localStorage key 冲突 */
  private prefix = 'local-expired-';

  /**
   * 创建 LocalExpiredStorage 实例
   * @param prefix - 可选的 key 前缀，用于命名空间隔离
   */
  constructor(prefix?: string) {
    if (prefix) {
      this.prefix = prefix;
    }
  }

  /**
   * 设置数据
   * @param key - 存储的键名
   * @param value - 存储的值（会被 JSON 序列化）
   * @param options - 配置选项，不传 maxAge 则永久存储
   * @returns 是否设置成功
   */
  setItem<T>(key: string, value: T, options?: SetItemOptions): boolean {
    const now = Date.now();

    try {
      const data: StorageData<T> = {
        value,
        start: now,
        // 未传 maxAge 时不写入 expired 字段，表示永不过期
        ...(options?.maxAge !== undefined && { expired: now + options.maxAge }),
      };
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(data));
      return true;
    }
    catch (err) {
      console.error(`[LocalExpiredStorage] setItem 失败:`, err);
      return false;
    }
  }

  /**
   * 获取存储的数据
   * @param key - 存储的键名
   * @returns 存储的值，如果不存在或已过期则返回 null
   */
  getItem<T>(key: string): T | null {
    try {
      const result = localStorage.getItem(`${this.prefix}${key}`);
      if (!result) {
        // key 不存在，直接返回 null
        return null;
      }

      const data = JSON.parse(result) as StorageData<T>;

      // 检查数据结构完整性，防止存储了非本类写入的数据
      if (!data || (data.expired !== undefined && typeof data.expired !== 'number')) {
        console.warn(`[LocalExpiredStorage] 数据格式异常，已清除: ${key}`);
        this.removeItem(key);
        return null;
      }

      // expired 不存在表示永不过期；存在时判断是否已过期
      if (data.expired === undefined || Date.now() <= data.expired) {
        // 未过期或永久存储，返回存储的值
        return data.value;
      }

      // 已过期，删除该 key 并返回 null
      this.removeItem(key);
      return null;
    }
    catch (err) {
      console.error(`[LocalExpiredStorage] getItem 失败:`, err);
      return null;
    }
  }

  /**
   * 删除指定的 key
   * @param key - 要删除的键名
   */
  removeItem(key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  /**
   * 检查 key 是否存在且未过期
   * @param key - 要检查的键名
   * @returns 是否存在且未过期
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }
}

/**
 * 默认的 LocalExpiredStorage 实例，使用默认前缀 'local-expired-'
 */
const localExpiredStorage = new LocalExpiredStorage();

export default localExpiredStorage;
