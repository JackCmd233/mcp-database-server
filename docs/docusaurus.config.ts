import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// 此代码在 Node.js 中运行 - 不要在此使用客户端代码（浏览器 API、JSX...）

const config: Config = {
  title: 'MCP Database Server',
  tagline: 'Fastest way to interact with your Database such as SQL Server, SQLite and PostgreSQL',
  favicon: 'img/favicon.ico',

  // 在此设置您网站的生产环境 URL
  url: 'https://executeautomation.github.io/',
  // 设置服务您网站的 /<baseUrl>/ 路径名
  // 对于 GitHub pages 部署，通常是 '/<projectName>/'
  baseUrl: '/mcp-database-server',

  // GitHub pages 部署配置
  // 如果您不使用 GitHub pages，则不需要这些
  organizationName: 'executeautomation', // 通常是您的 GitHub 组织/用户名
  projectName: 'mcp-database-server', // 通常是您的仓库名称

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  // 即使您不使用国际化，也可以使用此字段设置
  // 有用的元数据，如 html lang。例如，如果您的站点是中文，您
  // 可能希望将 "en" 替换为 "zh-Hans"。
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  trailingSlash: false,
  deploymentBranch: 'gh-pages',
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // 请将其更改为您的仓库
          // 删除此项以移除"编辑此页面"链接
          editUrl:
            'https://github.com/executeautomation/mcp-database-server/tree/main/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // 替换为您项目的社会化卡片
    image: 'img/EA-Icon.svg',
    navbar: {
      title: 'MCP Database Server',
      logo: {
        alt: 'MCP Database Server',
        src: 'img/EA-Icon.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/executeautomation/mcp-database-server',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started',
            },
            {
              label: 'SQLite Setup',
              to: '/docs/sqlite-setup',
            },
            {
              label: 'SQL Server Setup',
              to: '/docs/sql-server-setup',
            },
            {
              label: 'PostgreSQL Setup',
              to: '/docs/postgresql-setup',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Youtube',
              href: 'https://youtube.com/executeautomation',
            },
            {
              label: 'Udemy',
              href: 'https://www.udemy.com/user/karthik-kk',
            },
            {
              label: 'X',
              href: 'http://x.com/ExecuteAuto',
            },
          ],
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ExecuteAutomation Pvt Ltd.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
