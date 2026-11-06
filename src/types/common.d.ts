/**
 * Rspack/webpack 的 require.context 类型声明。
 *
 * 项目没装 @types/webpack-env；@types/node v24 的全局 require 类型是
 * NodeJS.Require（不是旧的 NodeRequire 接口），这里按命名空间合并补上 context。
 *
 * 当前唯一用途：src/i18n/index.ts 用 'lazy' 模式扫描语言包，实现按需加载。
 * 注意声明的调用签名返回 Promise，只在 'lazy' 模式下成立；
 * 其他 mode 返回的是模块本身，用到时需要另行收窄类型。
 */
declare namespace NodeJS {
  interface Require {
    context: (
      directory: string,
      useSubdirectories: boolean,
      filter: RegExp,
      mode?: 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once',
    ) => {
      (id: string): Promise<unknown>;
      keys: () => string[];
      resolve: (id: string) => string;
    };
  }
}
