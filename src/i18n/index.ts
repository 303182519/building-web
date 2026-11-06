import type { i18n } from 'i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUSCommon from '@/locales/en-us/common.json';
import enUSUser from '@/locales/en-us/user.json';
import zhCNCommon from '@/locales/zh-cn/common.json';
import zhCNUser from '@/locales/zh-cn/user.json';

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

/** 把 import 进来的 JSON 组织成 i18next init.resources 需要的结构 */
const RESOURCES = {
  'zh-cn': {
    [DEFAULT_NS]: zhCNCommon,
    [USER_NS]: zhCNUser,
  },
  'en-us': {
    [DEFAULT_NS]: enUSCommon,
    [USER_NS]: enUSUser,
  },
};

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
 * 资源通过构建期 import 直接塞进 init.resources，init 时会同步进
 * translator.resourceStore（t() 真正读取的地方），无需运行时请求。
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
      // ⚠️ 大小写必须与 lowerCaseLng（下面那项）、src/locales 目录名、resources 的 key 完全一致。
      //    i18next 默认会把 'zh-cn' 转成 'zh-CN'，若此处写小写且不开 lowerCaseLng，
      //    就会匹配失败导致所有 t() 返回 key（之前踩过的坑）。
      supportedLngs: [...SUPPORTED_LNGS],

      // ⚠️ 必须开启：i18next 默认会把 'zh-cn' 格式化成 'zh-CN'（区域码首字母大写），
      // 与 supportedLngs / resources 里的小写 'zh-cn' 大小写不匹配，
      // 会导致语言被拒绝（i18n.languages 变空），所有 t() 直接返回 key。
      // 开启后语言码全程小写，与目录名、URL 参数、i18n-ally 配置保持一致。
      lowerCaseLng: true,

      // 只按完整语言码解析（zh-cn / en-us），不再向上回退到 'zh' / 'en'。
      // 避免出现 "rejecting language code not found in supportedLngs: en" 这类无用告警。
      load: 'currentOnly',

      // 【内置翻译资源】init 时一次性把全部字典塞给 i18next，无需运行时再发请求。
      // 结构是三层嵌套：语言码 → 命名空间 → 具体 key。
      //    {
      //      'zh-cn': { common: { loading: '加载中...' }, user: { title: '用户信息' } },
      //      'en-us': { common: { loading: 'Loading...' }, user: { title: 'User Info' } },
      //    }
      // 对应的取值方式：
      //   t('loading')              → 默认命名空间 common（defaultNS）
      //   t('common:loading')       → 显式指定 common
      //   t('user:title')           → 跨命名空间取 user
      // 代价是所有语言都会被打进 bundle；只有 2~3 种语言的 H5 完全可接受。
      resources: RESOURCES,

      keySeparator: '.',
      nsSeparator: ':',

      debug: import.meta.env.PUBLIC_ENV !== 'production',

      interpolation: {
        escapeValue: false, // React 会自动转义 XSS
      },
    })
    .then(() => i18next);

  return initPromise;
}

/** 切换语言。同时写入 localStorage，跨页面保持选择。 */
export async function changeLng(nextLng: SupportedLng): Promise<void> {
  await initI18n();
  await i18next.changeLanguage(nextLng);
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, nextLng);
  }
  catch {
    /* 忽略 */
  }
}
