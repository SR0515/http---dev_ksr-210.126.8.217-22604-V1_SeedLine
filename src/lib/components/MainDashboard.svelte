<script>
    import { onMount } from "svelte";
    import { authStore } from '$lib/stores/auth';

    // SvelteKit 반응형 상태 관리
    let mainData = {
        terminal_commission: '0',
        store_name: '',
        yesterday_amount: '0',
        today_amount: '0',
        monthly_amount: '0'
    };

    // 반응형으로 사용자 정보 가져오기
    $: classify = $authStore.classify;
    $: userId = $authStore.userId;
    $: userName = $authStore.userName;

    // SvelteKit 방식: 반응형 API 호출
    async function loadDashboardData() {
        if (!userId || !classify) {
            console.error('사용자 정보가 없습니다.');
            return;
        }

        try {
            const response = await fetch(`/api/main_view?UserId=${encodeURIComponent(userId)}&classify=${encodeURIComponent(classify)}`);
            const json = await response.json();

            if (json.success) {
                mainData = {
                    ...mainData,
                    ...json.data,
                    terminal_commission: json.terminal_commission || json.data?.terminal_commission || '0',
                    store_name: json.store_name || json.data?.store_name || ''
                };
            } else {
                console.error('서버 오류:', json.message);
            }
        } catch (err) {
            console.error('API 호출 중 오류 발생:', err);
        }
    }

    // 반응형으로 사용자 정보 변경 시 데이터 다시 로드
    $: if (userId && classify) {
        loadDashboardData();
    }

    // 카운터 애니메이션 함수
    function animateCounter(element, targetValue) {
        const startValue = 0;
        const duration = 1000; // 1초
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(progress * targetValue);
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    onMount(async () => {
        // 인증된 사용자인 경우에만 데이터 로드
        if ($authStore.isAuthenticated) {
            await loadDashboardData();
        }
        
        // 달력 초기화 (SvelteKit 환경에서 안전하게)
        if (typeof window !== 'undefined') {
            try {
                const { Calendar } = await import('$lib/js/main_calendar.js');
                // DOM이 완전히 렌더링된 후 달력 초기화
                setTimeout(() => {
                    const dateBoard = document.querySelector('.dateBoard');
                    if (dateBoard) {
                        Calendar();
                    } else {
                        console.warn('달력 DOM이 아직 준비되지 않았습니다.');
                        setTimeout(() => Calendar(), 200);
                    }
                }, 300);
            } catch (err) {
                console.error('달력 초기화 실패:', err);
            }
        }
        
        // 카운터 애니메이션 비활성화 (안정성을 위해)
    });
</script>

<style>
  @import '$lib/styles/dashboard.css';
</style>

<div id="page_contect" class="">
    <div id="main_cwrap" class="">
        <section class="contect_w top_contect_w">
            <div class="borderbox_table">
                <div class="row">
                    <div class="col-12 main_boxwh">                
                        <div class="contentbox userw_wrap">
                            <div class="user_info_wrap">
                                <div class="content_left">
                                    <div class="user_img"><img src="/img/noimage.png" alt="이미지" class="" /></div>
                                    {#if classify == "2"}
                                        <h2 class="user_name">{mainData.store_name}</h2>
                                    {:else}
                                        <h2 class="user_name">{userName}</h2>
                                    {/if}
                                    <span>님, 안녕하세요.2</span>
                                </div>
                                <div class="content_right">
                                    {#if classify == "2"}
                                        <p>정산 수수료 : <span>{mainData.terminal_commission}</span> % </p>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row calendar_wh">
                    <div class="col-12 col-lg-3">
                        <div class="row">
                            <div class="col-12">
                                <div class="main_boxwh">
                                    <div class="contentbox box_height1">
                                        <div class="content_icon">
                                            <img src="/img/icon/bill.svg" alt="어제승인금액" class="" />
                                            <p>어제 승인 금액</p>
                                        </div>
                                        <div class="content_listw_wrap member_list2">                    
                                            <div class="content_text">
                                                <p>                                            
                                                    <span class="counter">{mainData.yesterday_amount || '0'}</span><span class="unit_t">원</span> <br/>                                                    
                                                    <span class="counter uiit_total_t">0</span> <span class="unit_t">건</span>                                                    
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {#if classify == "0"}
                            <div class="row mt_4">
                                <div class="col-12">
                                    <div class="main_boxwh">
                                        <div class="contentbox box_height1">
                                            <div class="content_icon">
                                                <img src="/img/icon/point_i1.svg" alt="오늘정산금액" class="" />
                                                <p>오늘 정산예정 금액(PG)</p>
                                            </div>

                                            <div class="content_listw_wrap member_list2">
                                                <div class="content_text">
                                                    <p>                                                
                                                        <span class="counter">0</span> <span class="unit_t">원</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <div class="row mt_4">
                            <div class="col-12">
                                <div class="main_boxwh">
                                    <div class="contentbox box_height1">
                                        <div class="content_icon">
                                            <img src="/img/icon/point_i1.svg" alt="정산예정금액" class="" />
                                            {#if classify == "1"}
                                                <p>정산예정 금액</p>
                                            {:else}
                                                <p>오늘 정산예정 금액(가맹점)</p>
                                            {/if}
                                        </div>
                                        <div class="content_listw_wrap member_list2">
                                            <div class="content_text">
                                                <p>
                                                    <span class="counter">0</span> <span class="unit_t">원</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                      
                    </div>
                                    
                    <div class="col-12 col-lg-9">
                        <!-- 정산 달력 -->
                        <div class="borderbox_table">
                            <div class="main_boxwh contentbox">
                                <div class="calendar_wrap">
                                    <div class='rap'>
                                        <div class="header">
                                            <div class="btnc prevDay"></div>
                                            <h2 class='dateTitle'>{new Date().getFullYear()}년 {new Date().getMonth() + 1}월</h2>
                                            <div class="btnc nextDay"></div>
                                        </div>
                        
                                        <div class="calendar_list_t">
                                            <ul class="calendar_pcircle">
                                                <li class="black_circle"><span class="black_bg"></span>결제 금액</li> <!--상태0-->
                                                <li class="green_circle"><span class="green_bg"></span>정산 금액</li> <!--상태1-->
                                                <li class="red_circle"><span class="red_bg"></span>보류 금액</li> <!--상태2-->
                                            </ul>
                                        </div>
                                        <div class="claendalwrap">
                                            <div class="claendal_table">
                                                <div class="grid dateHead">
                                                    <div class="red_t">일</div>
                                                    <div>월</div>
                                                    <div>화</div>
                                                    <div>수</div>
                                                    <div>목</div>
                                                    <div>금</div>
                                                    <div class="blue_t">토</div>
                                                </div>
                                                <div class="grid dateBoard"></div>
                                            </div>
                                        </div>
                                    </div>                     
                                </div>
                            </div>
                        </div>
                    </div>                               
                </div>
            </div>
        </section>
    </div>
</div>