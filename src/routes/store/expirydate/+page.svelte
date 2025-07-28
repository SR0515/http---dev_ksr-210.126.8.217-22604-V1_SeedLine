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
    import { STORE_EXPIRYDATE_OPTIONS } from '$lib/constants/searchOptions';
    import { useListData } from '$lib/hooks/useTerminalData';
    import { getExpirydateData } from '$lib/utils/store/terminalUtils';
    
    
    let auth = get(authStore);
    let classify = auth.classify;
    let rate = auth.rate;

    let clientIP = '';
    const rateStore = writable('');

    let tidInputs: string[] = [];

    function resetTidInputs() {
        tidInputs = Lists.map(() => '');
    }

    // Lists가 변경될 때마다 초기화 호출
    $: if (Lists) {
        resetTidInputs();
    }

    // 커스텀 훅 사용
    const listData = useListData( rateStore, getExpirydateData, 'T_catId');

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

    // 1년 경과 단말기 TID 수정 함수
    async function tidEdit(id: string, editTid: string): Promise<void> {
        const userId: string = auth.userId;
        const index = Lists.findIndex(t => t.id === id);
        const edit_Tid: string = tidInputs[index];

        const target = Lists.find(t => t.id === id);
        const oldTid: string | undefined = target?.StoreWallets?.T_catId;
        const store_name: string | undefined = target?.store_name;

        if (!oldTid || !store_name) {
            showToast("기존 TID 또는 가맹점명이 없습니다. 데이터를 다시 확인해주세요.", "error");
            return;
        }

        if (!edit_Tid || edit_Tid.trim() === "") {
            showToast("수정할 TID값을 넣어주세요.", "error");
            return;
        }

        const TidData: {
            id: string;
            name: string;
            edit_Tid: string;
        } = {
            id: userId,
            name: store_name,
            edit_Tid
        };

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
            id: target.id,
            store_name
        };

        const payload: {
            classify: string;
            userId: string;
            store_name: string;
            old_Tid: string;
            editTid: string;
            StoreBasicData: typeof StoreBasicData;
            EditData: typeof EditData;
        } = {
            classify,
            userId,
            store_name,
            old_Tid: oldTid,
            editTid: edit_Tid,
            StoreBasicData,
            EditData
        };

        try {
            const res = await fetch(`/api/TerminalExpirydateList/tidEdit/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

           const result = await res.json();

            console.log("payload", payload);

            if (result.success) {
                showToast('TID 수정 성공', "info");
                setTimeout(async () => {
                    listData.loadData();
                    loadMenuData(); // LeftMenu count 갱신
                    goto('/store/expirydate');
                }, 1500);
            } else {
                console.error('서버 응답 오류:', result);
                showToast(`${result.message}`, "error");
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
        searchOptions={STORE_EXPIRYDATE_OPTIONS}
    />

    <!-- 로딩 및 에러 상태 -->
    <LogsLoadingSpinner {loading} message="데이터를 불러오는 중..." />
    <LogsErrorBoundary {error} onRetry={handleRetry} />

    <!-- 테이블 영역 -->
    <section class="borderbox_table">
        <div id="table_wrap" class="table_wrap">			
            <table class="table_list terminal_table" width="100%">
                <caption>1년경과 단말기 테이블</caption>
                <colgroup>                     
                    <col style="width: 3% !important;"> <!-- no -->
                    <col style="width: 8% !important;"> <!-- catID -->
                    <col style="width: 8% !important;"> <!-- 상호명 -->
                    <col style="width: 6% !important;"> <!-- 대표명 -->
                    <col style="width: 8% !important;"> <!-- 단말기 수수료율 -->
                    <col style="width: 5% !important;"> <!-- 계약상태 -->
                    <col style="width: 6% !important;"> <!-- 아이디 -->
                    <col style="width: 8% !important;"> <!-- 등록일자 --> 
                    {#if classify === '0'}
                        <col style="width: 15% !important;"> <!-- 정보수정 -->        
                    {/if}  
                </colgroup>

                <thead>
                    <tr>  
                        <th scope="col">No</th>
                        <th scope="col">TID</th>
                        <th scope="col">상호명</th>
                        <th scope="col">대표명</th>
                        <th scope="col">단말기 수수료율</th>
                        <th scope="col">계약상태</th>
                        <th scope="col">연락처</th>
                        <th scope="col">단말기 등록일자</th>
                        {#if classify === '0'}
                            <th scope="col">신규 TID </th>
                        {/if}  
                    </tr> 

                </thead>

                <tbody>
                    {#if Lists.length === 0}
                        <tr>
                            {#if classify !== '0'}
                            <td colspan="8" class="no_data">등록된 데이터가 없습니다.</td>
                            {:else}
                            <td colspan="9" class="no_data">등록된 데이터가 없습니다.</td>
                            {/if}
                        </tr>
                    {:else}
                        {#each Lists as dist, index}
                            <tr>
                                <td> {pagination.totalCount - ((pagination.currentPage - 1) * pagination.pageSize) - index} </td>  <!--no-->
                                <td> {dist.StoreWallets?.T_catId}</td>                                                             <!--CATID--> 
                                <td> {dist.store_name}</td>                                                                        <!--상호명-->
                                <td> {dist.store_ceo_name}</td>                                                                    <!--대표명-->
                                <td style="mso-number-format:'\@'"> <span>{dist.StoreWallets?.terminal_commission}</span> %</td>   <!--수수료율-->
                                <td>                                                                                               <!--계약상태-->
                                    {#if dist.login_state === "0"}
                                        <p style="color: #000000;">정상</p>
                                    {:else if dist.login_state === "1"}
                                        <p style="color: #be0000;">정지</p>
                                    {:else if dist.login_state === "2"}
                                        <p style="color: #646464;">탈퇴</p>
                                    {:else}
                                        <p style="color: #be0000;">에러</p>
                                    {/if}
                                </td>                                                   
                                <td>{dist.id}</td>                                                                                 <!--아이디-->
                                <td class="terminal_date" style="mso-number-format:'\@'"> {dist.StoreWallets?.T_catId_date}</td>   <!--단말기 등록일자-->
                                {#if classify === '0'}
                                    <td class="input_width">                                                                       <!--정보수정-->
                                        <form on:submit|preventDefault={() => tidEdit(dist.id, tidInputs[index])}>
                                            <input type="hidden" name="id" value={dist.id} />
                                            <input type="hidden" name="store_name" value={dist.store_name} />
                                            <input type="hidden" name="old_Tid" value={dist.StoreWallets?.catId} />
                                            <input
                                                type="text"
                                                name="edit_Tid"
                                                maxlength="15"
                                                bind:value={tidInputs[index]}
                                                on:input={(e) => {
                                                    tidInputs[index] = (e.target as HTMLInputElement).value;
                                                }}
                                            />
                                            <button type="submit">수정</button>
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
