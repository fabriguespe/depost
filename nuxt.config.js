export default {
  ssr:false,
  head: {
    title: 'depost',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  router: {
    base: ''
  },

  css: [
  ],
  plugins: [
    '@/plugins/utils',
    '@/plugins/bootstrap-vue',
  ],
  components: true,

  buildModules: [
  ],
  modules: [
  ]
}
