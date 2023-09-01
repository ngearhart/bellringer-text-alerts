/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'


// Composables
import { createApp } from 'vue'

import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput'
import 'maz-ui/css/main.css'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)
app.component('MazPhoneNumberInput', MazPhoneNumberInput)

registerPlugins(app)

app.mount('#app')
