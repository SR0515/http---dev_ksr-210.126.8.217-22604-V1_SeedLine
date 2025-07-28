import type { PageServerLoad, Actions } from './$types';
import type { SettlementSearchData, TransferData } from '$lib/types/settlement';
import { fail, redirect } from '@sveltejs/kit';

// 더미 데이터 (실제로는 데이터베이스에서 가져옴)
const getDummyTransferData = (): TransferData[] => [
    {
        id: '1',
        senderId: 'admin001',
        bankName: '우리은행',
        accountNumber: '123-456-789012',
        accountHolder: '홍길동',
        amount: '1,000,000',
        fee: '500',
        transferDate: '2023-03-21'
    }
];

export const load: PageServerLoad = async ({ url }) => {
    const searchParams: SettlementSearchData = {
        startDate: url.searchParams.get('startDate') || '',
        endDate: url.searchParams.get('endDate') || '',
        searchSelect: url.searchParams.get('searchSelect') || '',
        searchText: url.searchParams.get('searchText') || '',
        pageSize: Number(url.searchParams.get('pageSize')) || 10
    };

    const currentPage = Number(url.searchParams.get('page')) || 1;

    // 검색 조건에 따른 데이터 필터링 (실제로는 DB 쿼리)
    let transfers = getDummyTransferData();
    
    // 날짜 필터링
    if (searchParams.startDate && searchParams.endDate) {
        transfers = transfers.filter(transfer => {
            const transferDate = new Date(transfer.transferDate);
            const startDate = new Date(searchParams.startDate);
            const endDate = new Date(searchParams.endDate);
            return transferDate >= startDate && transferDate <= endDate;
        });
    }

    // 검색 조건 필터링
    if (searchParams.searchSelect && searchParams.searchText) {
        transfers = transfers.filter(transfer => {
            const value = transfer[searchParams.searchSelect as keyof TransferData];
            return value && value.toString().toLowerCase().includes(searchParams.searchText.toLowerCase());
        });
    }

    // 페이지네이션 계산
    const totalCount = transfers.length;
    const totalPages = Math.ceil(totalCount / searchParams.pageSize);
    const startIndex = (currentPage - 1) * searchParams.pageSize;
    const endIndex = startIndex + searchParams.pageSize;
    const paginatedTransfers = transfers.slice(startIndex, endIndex);

    return {
        transfers: paginatedTransfers,
        searchParams,
        pagination: {
            currentPage,
            totalPages,
            totalCount,
            pageSize: searchParams.pageSize
        }
    };
};

export const actions: Actions = {
    search: async ({ request, url }) => {
        const data = await request.formData();
        
        const searchParams = {
            startDate: data.get('startDate')?.toString() || '',
            endDate: data.get('endDate')?.toString() || '',
            searchSelect: data.get('searchSelect')?.toString() || '',
            searchText: data.get('searchText')?.toString() || '',
            pageSize: Number(data.get('pageSize')) || 10
        };

        // 검증
        if (searchParams.startDate && searchParams.endDate) {
            if (new Date(searchParams.startDate) > new Date(searchParams.endDate)) {
                return fail(400, { error: '시작일이 종료일보다 늦을 수 없습니다.' });
            }
        }

        // URL 파라미터 업데이트를 위한 리다이렉트
        const searchString = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) searchString.set(key, value.toString());
        });

        throw redirect(302, `${url.pathname}?${searchString.toString()}`);
    },

    reset: async ({ url }) => {
        throw redirect(302, url.pathname);
    }
};