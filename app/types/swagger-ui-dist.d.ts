// swagger-ui-dist 的 ES bundle 沒有型別宣告，沿用 @types/swagger-ui-dist 的定義
declare module 'swagger-ui-dist/swagger-ui-es-bundle.js' {
  import type { SwaggerUIBundle } from 'swagger-ui-dist'

  const SwaggerUI: SwaggerUIBundle
  export default SwaggerUI
}
