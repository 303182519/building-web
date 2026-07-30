import { defineConfig } from '@rsbuild/core';
import { pluginBasicSsl } from '@rsbuild/plugin-basic-ssl';
import { pluginCheckSyntax } from '@rsbuild/plugin-check-syntax';
import { pluginImageCompress } from '@rsbuild/plugin-image-compress';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';
// import mobileforever from 'postcss-mobile-forever';
import { pluginHtmlMinifierTerser } from 'rsbuild-plugin-html-minifier-terser';
// 页面名称数组
const pages = [
  { name: 'index', title: '首页', template: './static/index.html' },
  // { name: 'about', title: '关于' },
];

// 预处理页面配置映射
const pageConfig = pages.reduce((acc, page) => {
  acc.entries[page.name] = `./src/pages/${page.name}/index.tsx`;
  acc.templates[page.name] = page.template;
  acc.titles[page.name] = page.title;
  return acc;
}, { entries: {} as Record<string, string>, templates: {} as Record<string, string>, titles: {} as Record<string, string> });

const mode = import.meta.env.PUBLIC_ENV;
console.log('PUBLIC_ENV', mode);

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  source: {
    entry: pageConfig.entries,
    // 在正则表达式的例子中，我们使用 [\\/] 来匹配路径分隔符，这是
    // 因为不同的操作系统使用了不同的路径分隔符，使用 [\\/] 可以保证 macOS、Linux 和 Windows 的路径都被匹配到。
    include: [
      /node_modules[\\/]@tanstack[\\/]/,
    ],
  },
  html: {
    template({ entryName }) {
      return pageConfig.templates[entryName] || './static/index.html';
    },
    title({ entryName }) {
      return pageConfig.titles[entryName] || '首页';
    },
  },
  performance: {
    // preconnect: ['https://xx.msstatic.com'],
    chunkSplit: {
      override: {
        cacheGroups: {
          // 将 mitt、ahooks、classnames 合并为一个公共 vendor chunk
          'common-vendor': {
            test: /[\\/]node_modules[\\/](mitt|ahooks|classnames|nice-modal-react)[\\/]/,
            name: 'common-vendor',
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      },
    },
  },
  output: {
    minify: true,
    polyfill: 'usage',
    sourceMap: {
      js: 'source-map', // build平台会删除的*.map文件的
      css: false,
    },
    legalComments: 'none', // 删除注释
  },
  tools: {
    // postcss: (config, { addPlugins }) => {
    //   const viewportPlugin = mobileforever({
    //     viewportWidth: 375,
    //     appSelector: '#root',
    //     maxDisplayWidth: 600,
    //   });
    //   addPlugins(viewportPlugin);
    // },
    rspack: {
      plugins: [
        // index 页面路由：监听 src/routes/index 目录，生成对应的路由树
        tanstackRouter({
          target: 'react',
          autoCodeSplitting: true,
          routesDirectory: './src/routes/index',
          generatedRouteTree: './src/pages/index/routeTree.gen.ts',
        }),
        // add-desktop 页面路由：监听 src/routes/add-desktop 目录，生成对应的路由树
        // tanstackRouter({
        //   target: 'react',
        //   autoCodeSplitting: true,
        //   routesDirectory: './src/routes/add-desktop',
        //   generatedRouteTree: './src/pages/add-desktop/routeTree.gen.ts',
        // }),

        // process.env.RSDOCTOR === 'true'
        // && new RsdoctorRspackPlugin({
        //   disableClientServer: true, // 必需：防止启动本地服务器
        //   output: {
        //     mode: 'brief', // 必需：使用简要模式
        //     options: {
        //       type: ['json'], // 必需：仅生成 JSON 数据
        //     },
        //   },
        // }),
      ],
    },
  },
  plugins: [
    pluginReact({
      reactCompiler: true,
    }),
    pluginBasicSsl(),
    pluginSass(),
    pluginImageCompress([
      { use: 'png', minQuality: 50 },
      { use: 'webp', quality: 80 },
    ]),
    pluginCheckSyntax(),
    pluginHtmlMinifierTerser(),
  ],
});
