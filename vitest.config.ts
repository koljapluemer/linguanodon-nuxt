import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environmentOptions: {
      nuxt: {
        mock: {
          indexedDb: true,
        }
      }
    }
  }
})