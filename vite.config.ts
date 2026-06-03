import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    base: process.env.GITHUB_REPOSITORY
        ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
        : '/',
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'icons.svg'],
            manifest: {
                name: 'AWS Certification Study',
                short_name: 'AWS Study',
                description:
                    'Study flashcards and practice exams for AWS certifications',
                theme_color: '#232F3E',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'any',
                scope: '/aws-cert-study',
                start_url: '/aws-cert-study',
                categories: ['education', 'productivity'],
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
                shortcuts: [
                    {
                        name: 'AIF-C01 Flashcards',
                        short_name: 'AIF Flashcards',
                        description: 'Study AIF-C01 flashcards',
                        url: '/cert/aif-c01/flashcards',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
                    },
                    {
                        name: 'AIF-C01 Practice Exam',
                        short_name: 'AIF Exam',
                        description: 'Take AIF-C01 practice exam',
                        url: '/cert/aif-c01/exam',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
                    },
                    {
                        name: 'CLF-C02 Flashcards',
                        short_name: 'CLF Flashcards',
                        description: 'Study CLF-C02 flashcards',
                        url: '/cert/clf-c02/flashcards',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
                    },
                    {
                        name: 'CLF-C02 Practice Exam',
                        short_name: 'CLF Exam',
                        description: 'Take CLF-C02 practice exam',
                        url: '/cert/clf-c02/exam',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
                    },
                    {
                        name: 'Exam History',
                        short_name: 'History',
                        description: 'View exam results history',
                        url: '/history',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /.*\.json$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'json-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
        }),
    ],
});
