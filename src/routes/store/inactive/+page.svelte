<script lang="ts">
    import { writable } from 'svelte/store';
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';
    import { authStore } from '$lib/stores/auth';
    import { showToast } from '$lib/stores/toast';
    import { getClientIP} from '$lib/utils/store/commissionUtils'; // 공인 IP 조회함수
    import LogsLoadingSpinner from '$lib/components/logs/LogsLoadingSpinner.svelte'; //로딩중
    import LogsErrorBoundary from '$lib/components/logs/LogsErrorBoundary.svelte';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import Layout from '$lib/components/store/terminal/Layout.svelte';
    import Search from '$lib/components/store/terminal/Search.svelte';
    import Pagenation from '$lib/components/store/terminal/Pagenation.svelte';
    import { loadMenuData } from '$lib/utils/menuUtils';
    import { STORE_INACTIVE_OPTIONS } from '$lib/constants/searchOptions';
    import { useListData } from '$lib/hooks/useTerminalData';
    import { getInactiveData } from '$lib/utils/store/terminalUtils';

    let auth = get(authStore);
    let classify = auth.classify;
    let rate = auth.rate;

    let clientIP = '';
    const rateStore = writable('');

    // 커스텀 훅 사용
    const listData = useListData( rateStore, getInactiveData, 'sw.T_catId');

    // 리액티브 스토어 구독
    $: ({ loading, error, data: Lists, pagination, searchParams } = $listData);

    // 검색 실행
    function handleSearch() {
        listData.search({
            searchSelect: searchParams.searchSelect,
            searchText: searchParams.searchText,
        });
    }
    
    // 검색 초기화
    function handleReset() {
        listData.reset();
    }
    
    // 페이지 크기 변경
    function handlePageSizeChange() {
        listData.changePageSize(pagination.pageSize);
    }
    
    // 페이지 이동
    function handlePageChange(page: number) {
        listData.changePage(page);
    }
    
    // 재시도 함수
    function handleRetry() {
        listData.loadData();
    }

    // 정지 처리 수정
    async function LoginStateEdit(dist: {
        id: string;
        name: string;
    }): Promise<void> {
        const userId: string = auth.userId;
        const store_name: string = dist.name;

        const EditData: {
            ip: string;
            rate: string;
            browser: string;
            url: string;
        } = {
            ip: clientIP,
            rate: rate,
            browser: navigator.userAgent,
            url: window.location.href
        };

        const StoreBasicData: {
            id: string;
            store_name: string;
        } = {
            id: dist.id,
            store_name
        };

        const payload: {
            classify: string;
            userId: string;
            StoreBasicData: typeof StoreBasicData;
            EditData: typeof EditData;
        } = {
            classify,
            userId,
            StoreBasicData,
            EditData
        };

        try {
            const res = await fetch(`/api/TerminalInactiveList/loginStateEdit/${dist.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log("payload", payload);

            const result: {
                success: boolean;
                message?: string;
                error?: string;
            } = await res.json();

            if (result.success) {
                showToast("정지 처리 완료", "info");
                setTimeout(async () => {
                    listData.loadData();
                    loadMenuData(); // LeftMenu count 갱신
                    goto('/store/inactive');
                }, 1500);
            } else {
                console.error('서버 응답 오류:', result);
                alert(`오류: ${result.message}\n에러: ${result.error}`);
            }

            console.log('받은 데이터:', result);
        } catch (err) {
            console.error('API 호출 중 오류 발생:', err);
        }
    }


    onMount(async () => {
        listData.loadData();
        try {
            clientIP = await getClientIP(); 
        } catch (err) {
            console.error('IP 조회 실패:', err);
            showToast('IP 정보를 불러올 수 없습니다.', 'error');
        }
    });
</script>

<LeftMenu />

<Layout>
    <Search 
        bind:searchSelect={searchParams.searchSelect}
        bind:searchText={searchParams.searchText}
        bind:pageSize={pagination.pageSize}
        onSearch={handleSearch}
        onReset={handleReset}
        onPageSizeChange={handlePageSizeChange}
        searchOptions={STORE_INACTIVE_OPTIONS}
    />

    <!-- 로딩 및 에러 상태 -->
    <LogsLoadingSpinner {loading} message="데이터를 불러오는 중..." />
    <LogsErrorBoundary {error} onRetry={handleRetry} />

    <section class="borderbox_table">        
        <div id="table_wrap" class="table_wrap">			
            <table class="table_list" width="100%">
                <caption>장기 미사용단말기 테이블</caption>

                <colgroup>                     
                    <col style="width: auto !important;"> <!-- no -->
                    <col style="width: auto !important;"> <!-- catID -->
                    <col style="width: auto !important;"> <!-- 상호명 -->
                    <col style="width: auto !important;"> <!-- 대표명 -->
                    <col style="width: auto !important;"> <!-- 단말기등록일자 -->
                    <col style="width: auto !important;"> <!-- 마지막거래일 -->
                    {#if classify === '0'}
                        <col style="width: auto !important;"> <!-- 처리 -->           
                    {/if}
                </colgroup>

                <thead>
                    <tr>  
                        <th scope="col">No</th>
                        <th scope="col">TID</th>
                        <th scope="col">상호명</th>
                        <th scope="col">대표명</th>
                        <th scope="col">단말기 등록일자</th>
                        <th scope="col">마지막거래일</th>
                        {#if classify === '0'}
                            <th scope="col">처리 </th>
                        {/if}
                    </tr> 

                </thead>

                <tbody>
                    {#if Lists.length === 0}               
                        <tr>
                            <td colspan="9">등록된 데이터가 없습니다.</td>  
                        </tr>  
                    
                    {:else}
                        {#each Lists as dist, index}
                        <tr>
                            <td> {pagination.totalCount - ((pagination.currentPage - 1) * pagination.pageSize) - index} </td>   <!-- no -->
                            <td> {dist.T_catId} </td>                                                                           <!-- CATID --> 
                            <td> {dist.name} </td>                                                                              <!-- 업체명 -->
                            <td> {dist.store_ceo_name} </td>                                                                    <!-- 대표명 -->
                            <td>                                                                                                <!-- 단말기 등록일자 -->  
                                {#if dist.T_catId_date === null}
                                    &nbsp; 
                                {:else}
                                    {dist.T_catId_date}
                                {/if}
                            </td>                                                                     
                            <td> 
                                {#if dist.lst_pt_date === null}
                                    -
                                {:else}
                                    {dist.lst_pt_date}
                                {/if} 
                            </td>                                                                                               <!-- 마지막 거래일 -->
                            {#if classify === '0'}
                                <td>
                                    <form on:submit|preventDefault={() => LoginStateEdit(dist)}>
                                        <input type="hidden" name="id" value="{dist.id}">
                                        <input type="hidden" name="name" value="{dist.name}">
                                        <input type="hidden" name="current_agent" id="current_agent" />
                                        <button type="submit">정지 처리</button>
                                    </form>
                                </td>
                            {/if}  
                        </tr>
                    {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </section>

    <!-- 페이지네이션 -->
    {#if Lists.length > 0}
        <Pagenation
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
        />
    {/if}
    
</Layout>
