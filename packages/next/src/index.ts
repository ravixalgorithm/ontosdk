// We cannot use Webpack plugins reliably in Next.js Turbopack due to WorkerError restrictions.
// Users must instead run `npx onto-next` as a postbuild script.
export { extractContent } from './extractor';
export { OntoConfig, OntoRoute, generateLlmsTxt } from './config';
export type { OntoConfig as OntoConfigType, OntoRoute as OntoRouteType, PageType } from './config';
export {
  generateAIOMethodologySchema,
  generateOrganizationSchema,
  generateAboutPageSchema,
  generateSchemaForPageType,
  serializeSchema
} from './schemas';
export type {
  AIOMethodologySchema,
  OrganizationSchema,
  AboutPageSchema
} from './schemas';
