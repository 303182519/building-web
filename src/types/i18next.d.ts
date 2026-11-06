import type common from '@/locales/zh-cn/common.json';
import type user from '@/locales/zh-cn/user.json';

/**
 * 给 t() 补上 key 的类型提示与校验。
 *
 * 原理：i18next 的类型定义会读取下面这个 CustomTypeOptions，
 * 用 resources 里声明的 JSON 结构反推出所有合法 key（含嵌套层级）。
 * 之后 t('loadin') 这种拼写错误会在编辑器里直接报红，写 t(' 时也会自动补全。
 *
 * 新增命名空间时，改三处：
 * 1. src/i18n/index.ts 的 NAMESPACES
 * 2. 本文件 resources 里补一行
 * 3. 各语言目录 index.ts 里 import 一行
 * （类型提示仍走静态 import type，与运行时的按需加载互不影响）
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      user: typeof user;
    };
  }
}
