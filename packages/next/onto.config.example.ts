import { OntoConfig } from './src/config';

/**
 * Example onto.config.ts file
 *
 * Place this file in your project root as `onto.config.ts` to enable
 * dynamic llms.txt generation.
 *
 * The middleware will automatically read this config and generate
 * /llms.txt on the fly when AI agents request it.
 */
const config: OntoConfig = {
  // Required: The name of your project/site
  name: 'My Awesome Project',

  // Required: A concise summary for AI agents
  summary: 'A modern web application for managing tasks and projects. Built with Next.js, TypeScript, and React. Provides a RESTful API and interactive UI.',

  // Required: Base URL of your site
  baseUrl: 'https://example.com',

  // Optional: Key routes that AI agents should know about
  routes: [
    {
      path: '/',
      description: 'Homepage with product overview and key features',
      pageType: 'default'
    },
    {
      path: '/score',
      description: 'AIO Score Calculator - check your AI optimization score',
      pageType: 'scoring' // Automatically injects Methodology JSON-LD schema
    },
    {
      path: '/about',
      description: 'About our company and mission',
      pageType: 'about' // Automatically injects Organization/AboutPage JSON-LD schema
    },
    {
      path: '/docs',
      description: 'Complete API documentation and integration guides'
    },
    {
      path: '/docs/getting-started',
      description: 'Quick start guide for new users'
    },
    {
      path: '/api/reference',
      description: 'REST API reference with all endpoints and schemas'
    },
    {
      path: '/blog',
      description: 'Technical blog posts and product updates'
    },
    {
      path: '/pricing',
      description: 'Pricing plans and feature comparison'
    }
  ],

  // Optional: External resources
  externalLinks: [
    {
      title: 'GitHub Repository',
      url: 'https://github.com/example/project',
      description: 'Open-source code and issue tracker'
    },
    {
      title: 'API Status',
      url: 'https://status.example.com',
      description: 'Real-time API status and incident reports'
    }
  ],

  // Optional: Organization info for JSON-LD schemas (used on 'about' pages)
  organization: {
    name: 'Example Corp',
    description: 'Building the future of AI-optimized web applications',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png',
    foundingDate: '2024-01-01'
  },

  // Optional: Custom sections with any markdown content
  sections: [
    {
      heading: 'About',
      content: `This project helps teams collaborate more effectively by providing
a unified workspace for tasks, projects, and documentation. It integrates with
popular tools like GitHub, Slack, and Jira.`
    },
    {
      heading: 'Key Features',
      content: `- **Task Management**: Create, assign, and track tasks across teams
- **Real-time Collaboration**: WebSocket-based updates for instant sync
- **Rich API**: RESTful API with comprehensive documentation
- **Integrations**: Connect with 50+ external services
- **Security**: SOC 2 Type II certified with end-to-end encryption`
    },
    {
      heading: 'Use Cases',
      content: `**For Development Teams**: Track sprints, manage backlogs, and integrate with CI/CD pipelines.

**For Content Teams**: Plan editorial calendars, collaborate on drafts, and publish content.

**For Product Teams**: Gather feedback, prioritize features, and communicate roadmaps.`
    }
  ]
};

export default config;
