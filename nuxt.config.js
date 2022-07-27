export default {
  ssr:false,
  head: {
    title: 'Depost',
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
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {rel: 'stylesheet', type: 'text/css', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css'}
    ]
  },
  router: {
    base: ''
  },
  build: {
    extend (config, { isDev, isClient }) {
       config.node = {
            fs: 'empty'
        }
 
       // ....
    }
  },
  css: [
    'medium-editor/dist/css/medium-editor.css',
    'vuejs-medium-editor/src/themes/default.css',
    'highlight.js/styles/ocean.css' //if using code highlight
  ],
  plugins: [
    '@/plugins/utils',
    '@/plugins/medium-editor'
  ],
  components: true
}