import type { i18n } from 'i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

/** 本地存储 key：跨页面保持用户选择的语言 */
const LANG_STORAGE_KEY = 'building-web-lang';

/** 支持的语言列表（和目录名、i18n-ally settings 三处必须一致） */
export const SUPPORTED_LNGS = ['zh-cn', 'en-us'] as const;
export type SupportedLng = (typeof SUPPORTED_LNGS)[number];

/** 兜底语言 */
export const FALLBACK_LNG: SupportedLng = 'zh-cn';

/** 默认命名空间（t('key') 直接取这个） */
export const DEFAULT_NS = 'common';

/** 业务命名空间：用户相关文案 */
export const USER_NS = 'user';

/** 可用命名空间列表（新增 namespace 只改这一处） */
export const NAMESPACES = [DEFAULT_NS, USER_NS] as const;
export type Namespace = (typeof NAMESPACES)[number];

/**
 * 构建期扫描各语言目录的 index.ts（每个入口静态 import 了该语言全部 JSON），
 * 'lazy' 模式下每种语言整体拆成一个异步 chunk，调用时才发请求，
 * 等价于文章里 glob('./locales/*\/index.ts') 的第一层懒加载。
 * 参数必须是字面量，Rspack 在编译期静态解析。
 */

// 概念等价物，并非真实生成代码
/*
  const langContext = (key) => ({
    './zh-cn/index.ts': () => import('./zh-cn/index.ts'),
    './en-us/index.ts': () => import('./en-us/index.ts'),
  }[key]());
*/
const langContext = require.context('../locales', true, /index\.ts$/, 'lazy');

/** 已加载注册过的语言，避免重复请求 */
const loadedLngs = new Set<string>();

/** 进行中的加载 Promise，并发/连点调用时去重 */
const inflightLoads = new Map<string, Promise<void>>();

/**
 * 按需加载并注册某个语言的全部资源（一种语言 = 一个 chunk = 一次请求）。
 * 已加载的直接返回；同一语言并发调用共享同一个 Promise。
 *
 * ⚠️ 内部不 await initI18n（init 流程自己也会调它，会造成死锁），
 *    外部调用前请确保 initI18n() 已完成。
 */
async function loadLanguage(lng: SupportedLng): Promise<void> {
  if (loadedLngs.has(lng)) {
    return;
  }

  let pending = inflightLoads.get(lng);
  if (!pending) {
    pending = langContext(`./${lng}/index.ts`)
      .then((mod) => {
        // 语言入口的 default 导出：{ common: {...}, user: {...} }
        const resources = ((mod as { default?: Record<string, unknown> }).default ?? mod) as Record<
          string,
          unknown
        >;
        // 逐命名空间注册；两个 true：deep 深度合并 + overwrite 覆盖已有翻译
        for (const [ns, resource] of Object.entries(resources)) {
          i18next.addResourceBundle(lng, ns, resource as Record<string, unknown>, true, true);
        }
        loadedLngs.add(lng);
      })
      .finally(() => {
        inflightLoads.delete(lng);
      });
    inflightLoads.set(lng, pending);
  }

  await pending;
}

/** 判断一个值是否是合法语言码 */
function isValidLng(value: string | null): value is SupportedLng {
  if (!value) {
    return false;
  }
  return (SUPPORTED_LNGS as readonly string[]).includes(value);
}

/** 把浏览器原生语言码 normalize 成我们的语言码（zh-Hans / en-US → zh-cn / en-us） */
function normalizeLng(raw: string | undefined | null): SupportedLng | null {
  if (!raw) {
    return null;
  }
  const lower = raw.toLowerCase();
  if (isValidLng(lower)) {
    return lower;
  }
  if (lower.startsWith('zh')) {
    return 'zh-cn';
  }
  if (lower.startsWith('en')) {
    return 'en-us';
  }
  return null;
}

/**
 * 检测最终使用的语言。检测优先级：
 * 1. querystring  ?lang=xx 或 ?lng=xx  （分享链接时最高优先）
 * 2. localStorage（用户主动选过的，跨页面保持）
 * 3. navigator.language（浏览器兜底）
 * 4. fallback
 */
export function detectLng(): SupportedLng {
  const params = new URLSearchParams(window.location.search);
  const qsNormalized = normalizeLng(params.get('lang') ?? params.get('lng'));
  if (qsNormalized) {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, qsNormalized);
    }
    catch {
      /* 隐私模式下可能失败，忽略 */
    }
    return qsNormalized;
  }

  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (isValidLng(stored)) {
      return stored;
    }
  }
  catch {
    /* 忽略 */
  }

  const navNormalized = normalizeLng(window.navigator.language);
  if (navNormalized) {
    return navNormalized;
  }

  return FALLBACK_LNG;
}

/** 缓存 init 结果，让 initI18n 幂等 */
let initPromise: Promise<i18n> | null = null;

/**
 * 初始化 i18next。MPA 每个页面 mount 前 await 一次即可，多次调用安全。
 *
 * 资源不再内置进 bundle：init 时传空 resources，随后按需加载当前语言的
 * JSON chunk 并通过 addResourceBundle 注册。加载完成才放行渲染，
 * 保证页面首次 render 时 t() 已经能拿到正确文案。
 */
export function initI18n(): Promise<i18n> {
  if (initPromise) {
    return initPromise;
  }

  const lng = detectLng();

  initPromise = i18next
    .use(initReactI18next)
    .init({
      lng,
      fallbackLng: FALLBACK_LNG,
      defaultNS: DEFAULT_NS,
      ns: [...NAMESPACES],

      // 【语言白名单】只有写在这里的语言码，i18next 才会接受并使用。
      // 列表之外的语言（比如浏览器给的是 fr-FR、ja-JP）会被直接忽略，
      // 最终回退到 fallbackLng（这里兜底是 zh-cn）。
      //
      // 为什么要展开 [...SUPPORTED_LNGS]：
      //   SUPPORTED_LNGS 是 `as const` 出来的只读元组（readonly ['zh-cn', 'en-us']），
      //   而 i18next 的类型要求可变的 string[]，直接传只读元组会类型报错，
      //   展开后就是普通的 ['zh-cn', 'en-us'] 数组。
      //
      // ⚠️ 大小写必须与 lowerCaseLng（下面那项）、src/locales 目录名完全一致。
      supportedLngs: [...SUPPORTED_LNGS],

      // ⚠️ 必须开启：i18next 默认会把 'zh-cn' 格式化成 'zh-CN'（区域码首字母大写），
      // 与 supportedLngs / 资源目录里的小写 'zh-cn' 大小写不匹配，
      // 会导致语言被拒绝（i18n.languages 变空），所有 t() 直接返回 key。
      // 开启后语言码全程小写，与目录名、URL 参数、i18n-ally 配置保持一致。
      lowerCaseLng: true,

      // 只按完整语言码解析（zh-cn / en-us），不再向上回退到 'zh' / 'en'。
      // 避免出现 "rejecting language code not found in supportedLngs: en" 这类无用告警。
      load: 'currentOnly',

      // 【按需加载】init 时不内置任何翻译资源，语言包在下面 init 完成后
      // 通过 require.context('lazy') 拆出的异步 chunk 按需加载，
      // 再用 addResourceBundle 注册进 i18next。
      // 注意：fallbackLng（zh-cn）的包不会为非中文用户预载，
      // 运行时 fallback 依赖各语言 key 对齐（开发期由 i18n-ally 保证）。
      resources: {},

      keySeparator: '.',
      nsSeparator: ':',

      debug: import.meta.env.PUBLIC_ENV !== 'production',

      interpolation: {
        escapeValue: false, // React 会自动转义 XSS
      },
    })
    .then(async () => {
      // 先加载当前语言资源再放行渲染
      await loadLanguage(lng);
      return i18next;
    });

  return initPromise;
}

/** 切换语言。先加载资源再切换，同时写入 localStorage 跨页面保持选择。 */
export async function changeLng(nextLng: SupportedLng): Promise<void> {
  await initI18n();
  await loadLanguage(nextLng);
  await i18next.changeLanguage(nextLng);
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, nextLng);
  }
  catch {
    /* 忽略 */
  }
}
