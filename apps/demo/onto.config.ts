import type { OntoConfig } from '@ontosdk/next';

/**
 * Onto configuration for the demo app
 * This file is used to dynamically generate /llms.txt
 */
const config: OntoConfig = {
  name: 'Onto SDK Demo',

  summary: 'Demo application showcasing the @ontosdk/next package. Demonstrates AI-optimized content delivery, automatic markdown conversion, and intelligent bot routing for Next.js applications.',

  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',

  routes: [
    {
      path: '/',
      description: 'Homepage demonstrating Onto SDK features and capabilities',
      pageType: 'default'
    },
    {
      path: '/about',
      description: 'About the Onto SDK project',
      pageType: 'about'
    }
  ],

  externalLinks: [
    {
      title: 'Onto SDK on GitHub',
      url: 'https://github.com/anthropics/onto-sdk',
      description: 'Open-source repository with full source code'
    },
    {
      title: 'Documentation',
      url: 'https://buildonto.dev/docs',
      description: 'Complete integration guides and API reference'
    }
  ],

  organization: {
    name: 'Onto',
    description: 'Next.js infrastructure for AI-optimized websites',
    url: 'https://buildonto.dev',
    foundingDate: '2024-01-01'
  },

  sections: [
    {
      heading: 'About Onto SDK',
      content: `The Onto SDK (@ontosdk/next) is a Next.js library that optimizes websites for AI agents. It automatically:

- Converts React/HTML pages to clean Markdown
- Routes AI bot traffic to optimized endpoints
- Generates AI discovery metadata (llms.txt, link tags)
- Reduces token usage by 95% for AI crawlers`
    },
    {
      heading: 'Key Features',
      content: `- **Automatic Extraction**: CLI tool converts Next.js pages to semantic Markdown
- **Intelligent Routing**: Edge middleware detects and routes AI bot traffic
- **Zero Configuration**: Works out-of-the-box with sensible defaults
- **Bot Detection**: Recognizes 21+ AI crawlers (GPTBot, ClaudeBot, etc.)
- **Control Plane**: Optional analytics and dynamic context injection`
    }
  ]
};

export default config;
