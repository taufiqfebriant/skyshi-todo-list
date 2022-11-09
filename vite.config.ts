import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePluginFonts } from 'vite-plugin-fonts';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePluginFonts({
			google: {
				families: [
					{
						name: 'Poppins',
						styles: 'wght@400;500;600;700'
					}
				]
			}
		}),
		createSvgIconsPlugin({
			iconDirs: [path.resolve(process.cwd(), 'src/images/icons')]
		})
	]
});
