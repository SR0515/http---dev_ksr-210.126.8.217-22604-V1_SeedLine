import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 23345,
		host: '0.0.0.0',
		proxy: {
			// 기존 시스템과 동일한 API 프록시 설정
			'/api': {
				target: 'http://210.126.8.217:22909',
				changeOrigin: true,
				secure: false,
				timeout: 30000, // 30초 타임아웃
				configure: (proxy, options) => {
					proxy.on('proxyReq', (proxyReq, req, res) => {
						console.log('프록시 요청:', req.url, '→', proxyReq.path);
						proxyReq.setHeader('Accept', 'application/json');
						proxyReq.setHeader('Content-Type', 'application/json');
						// 타임아웃 설정
						proxyReq.setTimeout(30000);
					});
					proxy.on('error', (err, req, res) => {
						console.error('프록시 오류:', err.message);
						// 에러 응답 반환
						if (res && !res.headersSent) {
							res.writeHead(500, { 'Content-Type': 'application/json' });
							res.end(JSON.stringify({ 
								success: false, 
								message: '서버 연결 실패. 잠시 후 다시 시도해주세요.' 
							}));
						}
					});
				}
			}
		}
	}
});
