import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    watch: {
      usePolling: true, // অনেক কম্পিউটারে ফাইল চেঞ্জ ডিটেক্ট করতে এটি লাগে
    },
  },
})