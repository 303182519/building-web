# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 React 19 + TypeScript 的移动端 H5 构建工具项目，使用 Rsbuild 作为构建工具，TanStack Router 进行文件路由，TanStack Query 进行数据请求管理。

## 开发命令

```bash
# 开发环境启动（自动打开浏览器）
pnpm dev

# 生产环境构建
pnpm build

# 测试环境构建
pnpm build:test

# 代码检查
pnpm lint

# 代码检查并自动修复
pnpm lint:fix
```

## 项目架构

### 核心结构

```
src/
├── components/          # 共享组件
│   ├── create-entry/    # 应用入口工厂函数
│   └── query-provider/  # TanStack Query 全局 Provider
├── pages/               # 页面入口（每个页面是独立的 MPA）
│   └── index/           # 首页
│       ├── index.tsx    # 入口文件（调用 createEntry）
│       ├── App.tsx      # 页面根组件（配置路由）
│       └── routeTree.gen.ts  # 路由树（自动生成）
├── routes/              # TanStack Router 文件路由
│   └── index/           # 首页路由目录
│       ├── __root.tsx   # 根布局路由
│       ├── index.tsx    # 首页路由
│       └── about/       # 关于页路由
├── utils/               # 工具函数
│   ├── emitter.ts       # mitt 事件总线
│   └── local-expired-storage.ts  # 带过期时间的本地存储
├── constants/           # 常量定义
├── types/               # 全局类型声明
└── global.scss          # 全局样式
```

### 多页面架构（MPA）

项目采用多页面应用架构，每个页面在 `src/pages/` 下独立存在：

1. **入口文件** (`pages/{name}/index.tsx`)：调用 `createEntry(App)` 挂载应用
2. **路由配置** (`pages/{name}/App.tsx`)：创建独立的 Router 实例
3. **路由定义** (`routes/{name}/`)：文件路由目录，由 TanStack Router 插件自动生成路由树

**添加新页面步骤：**

1. 在 `rsbuild.config.ts` 的 `pages` 数组中添加页面配置
2. 创建 `src/pages/{name}/index.tsx` 和 `src/pages/{name}/App.tsx`
3. 创建 `src/routes/{name}/` 目录并添加路由文件
4. 在 `rsbuild.config.ts` 的 `tanstackRouter` 插件中添加对应配置

### 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript 6 | 类型安全 |
| Rsbuild | 构建工具（基于 Rspack） |
| TanStack Router | 文件路由（Hash 模式） |
| TanStack Query | 服务端状态管理 |
| Zustand | 客户端状态管理 |
| mitt | 事件总线 |
| SCSS | 样式方案 |
| ESLint + Stylelint | 代码检查 |

## 关键配置

### 构建配置 (rsbuild.config.ts)

- **入口配置**：通过 `pages` 数组动态生成多页面入口
- **代码分割**：`common-vendor` chunk 包含 mitt、ahooks、classnames、nice-modal-react
- **React Compiler**：已启用 `reactCompiler: true`
- **图片压缩**：PNG 最小质量 50，WebP 质量 80
- **Polyfill**：按需引入（`usage` 模式）

### 代码风格

- **缩进**：2 空格
- **引号**：单引号
- **分号**：必须
- **括号风格**：1tbs（一行括号）
- **箭头函数**：始终使用括号

### ESLint 特殊规则

- `try-catch-failsafe/json-parse`：JSON.parse 必须包裹在 try-catch 中
- 路由文件 (`src/routes/**/*.tsx`) 允许同时导出 Route 和组件

## 全局状态管理

### TanStack Query (服务端状态)

配置在 `src/components/query-provider/query-client.ts`：
- `staleTime: 0` - 数据立即过期，每次挂载重新请求
- `gcTime: 5min` - 非活跃查询 5 分钟后清除
- `retry: 1` - 失败后重试 1 次
- `refetchOnWindowFocus: false` - 禁用窗口聚焦时重新请求

### mitt 事件总线

类型安全的事件系统定义在 `src/utils/emitter.ts`，新增事件需在 `Events` 类型中添加映射。

## 路径别名

使用 `@/` 指向 `src/` 目录，配置在 `tsconfig.json` 的 `paths` 中。
