import common from './common.json';
import user from './user.json';

/**
 * 该语言的全部资源入口。
 * 静态 import 让 Rspack 把这些 JSON 和本模块打成一个异步 chunk，
 * 实现"一种语言 = 一个 chunk = 一次请求"。
 * 新增 namespace 时这里要补一行 import。
 */
export default { common, user };
