export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29'),
	() => import('./nodes/30'),
	() => import('./nodes/31'),
	() => import('./nodes/32')
];

export const server_loads = [];

export const dictionary = {
		"/": [5],
		"/dashboard": [6],
		"/edit/partner": [7],
		"/edit/store": [8],
		"/list/partner": [9],
		"/list/store": [10],
		"/login": [11],
		"/partnerSystem": [12],
		"/payment/duplicateList": [13],
		"/payment/paymentList": [14],
		"/payment/receipt": [15],
		"/payment/salesList": [16],
		"/settings/admin": [17],
		"/settings/logs": [18,[2]],
		"/settings/logs/commission": [19,[2]],
		"/settings/logs/edit": [20,[2]],
		"/settings/logs/settlement": [21,[2]],
		"/settings/partner": [22],
		"/settings/store": [23,[3]],
		"/settlement/partner": [~24,[4]],
		"/settlement/partner/detail": [25,[4]],
		"/settlement/store": [~26,[4]],
		"/settlement/transfer": [~27,[4]],
		"/store/commission": [28],
		"/store/expirydate": [29],
		"/store/inactive": [30],
		"/write/partner": [31],
		"/write/store": [32]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';