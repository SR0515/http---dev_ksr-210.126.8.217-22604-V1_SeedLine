
<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/auth';
    import {adminPartnerAccess} from "$lib/utils/accessControl";
    import LeftMenu from "$lib/components/LeftMenu.svelte";
    import {showToast} from "$lib/stores/toast.js";
    import Toast from "$lib/components/Toast.svelte";

    let classify = localStorage.getItem("classify");
    let user_id = localStorage.getItem("user_id");

    type AdminItem = {
        id : string;
        password : string;
        name : string;
        access_ip : string;
        transfer_tax : string;
        join_date : string;
        edit_date : string;
    }

    let InfoData: AdminItem = {
        id: '',
        password: '',
        name: '',
        access_ip: '',
        transfer_tax: '',
        join_date: '',
        edit_date: ''
    };

    // 로그 페이지로 이동
	function navigateToLogList() {
		goto('/log/APS_login_log');
	}

    // 페이지 재로드
	function navigateToMyInfo() {
		goto('/setting/admin');
	}

    $: formattedJoinDate = formatTime(InfoData.join_date);
    $: formattedEditDate = formatTime(InfoData.edit_date);

     function formatTime(datetimeStr:string) {
        if (!datetimeStr) return '';
        const date = new Date(datetimeStr);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        let hour = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        const ampm = hour >= 12 ? '오후' : '오전';
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;

        return `${year}-${month}-${day} ${ampm} ${hour}:${minutes}:${seconds}`;
    }

    // API로 데이터 가져오기
    async function fetchData() {
        try {
            const response = await fetch(`/api/InfoEdit?userId=${user_id}&classify=${classify}`);
            const json = await response.json();

            if (json.success) {
                InfoData = json.data;

            } else {
                console.error('서버 오류:', json.message);
            }

            console.log('받은 데이터:', json);
        } catch (err) {
            console.error('API 호출 중 오류 발생:', err);
        }
    }

    //정보수정
    async function InfoEdit(){
    const userId = user_id;
    const form = document.getElementById("infoForm") as HTMLFormElement;
    
    if(form.pass.value !== "" && form.pass_check.value == ""){
        showToast("비밀번호 확인을 입력해주세요.", "info")
        return;
    }else if(form.pass_check.value !== "" && form.pass.value == ""){
        showToast("새 비밀번호를 입력해주세요.", "info")
        return;
    }else if(form.pass.value !== form.pass_check.value){
        showToast("비밀번호와 비밀번호 확인이 다릅니다.", "info")
        return;
    }
    const adminInfo = {
        userId : userId,
        pass : form.pass_check.value,
        access_ip : form.access_ip.value,
        transfer_tax : form.transfer_tax.value
    }

    try {
        const response = await fetch(`/api/InfoEdit/Admin` ,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminInfo)
        });
        
        const result = await response.json();
        if(result.success){
            showToast("정보수정 완료", "info")
            setTimeout(() => {
            // navigateToMyInfo();
            fetchData();
        }, 1500); // 

        
        } else {
        console.error('서버 응답 오류:', result);
        alert(`오류: ${result.message}\n에러: ${result.error}`);
        }
        
    }catch(error){
    console.error('수정 중 오류 발생1:', error);
    console.log("수정 중 오류 발생2:", error);
    alert('서버 오류 발생');
    }
        
    }

    onMount(async () => {
        fetchData();
    });

</script>

<LeftMenu/>
<div id="page_contect" class="">
    <section class="contect_w top_contect_w">
        <div class="borderbox_table user_wrap_box">
            <div class="row">
                <div class="col-12 main_boxwh">
                    <div class=" contentbox userw_wrap">
                        <div class="user_info_wrap">
                            <div class="content_left">
                                <div class="user_img"><img src="../../img/noimage.png" alt="이미지"></div>
                                {#if InfoData.name !== "" }                       
                                    <h2 class="user_name">
                                        {InfoData.name}
                                    </h2>
                                {/if}
                                    <span>님, 안녕하세요.</span>
                            </div>
                            <div class="">
                                <a href="{'javascript:void(0);'}" on:click={navigateToLogList} class="btn_log">로그조회</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <section>
        <h5 style="float:left; margin-right:10px;" > 정보수정 </h5> 
        <span style="float:left; margin-right:10px;" > - </span>
        <h5> 관리자 </h5>
    </section>

    <section class="sub_box admin_seeting_wrap ">   
        <form id="infoForm" on:submit|preventDefault={InfoEdit}>
            <input type="hidden" name="current_agent" id="current_agent" />
            <!-- 기본정보 -->
            <h3>기본정보</h3>
            <div class="agency_form border-bottom">
                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>아이디</dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="id" bind:value={user_id}  readonly/></div>
                        </dd>
                    </dl>
                    <dl class="col-12 col-lg-6">
                        <dt>업체명</dt>
                        <dd>
                            <div class="form_input"><input type="text" readonly class="input" bind:value={InfoData.name} name="name"/></div>
                        </dd>
                    </dl>

                </div>

                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>새 비밀번호</dt>
                        <dd><div class="form_input"><input type="password" id="pass" class="input" name="pass"/></div>
                            </dd>
                    </dl>

                    <dl class="col-12 col-lg-6">
                        <dt>새 비밀번호 확인</dt>
                        <dd><div class="form_input"><input type="password" class="input" id="pass_check" name="pass_check"/></div>
                            </dd>
                    </dl>
                </div>
            </div>


            <h3 class="margin-top ">서비스 설정 </h3>
            <div class="agency_form ">
                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>접속 허용 IP<br>(최대 3개)</dt>
                        <dd><div class="form_input"><input type="text" class="input" name="access_ip" bind:value={InfoData.access_ip}/></div>
                        </dd>
                    </dl>
                    
                    <dl class="col-12 col-lg-6">
                        <dt>이체수수료</dt>
                        <dd><div class="form_input"><input type="text" class="input" name="transfer_tax" bind:value={InfoData.transfer_tax} /></div>
                        </dd>원
                    </dl>  
                </div>

                <div class="d-flex edit_date">
                    <dl class="col-12 col-lg-6">
                        <dt>등록날짜</dt>
                        <dd><div class="form_input"><input type="text" readonly class="input" bind:value={formattedJoinDate}/></div>
                        </dd>
                    </dl>
                    <dl class="col-12 col-lg-6 ">
                        <dt>수정날짜</dt>
                        <dd><div class="form_input"><input type="text" readonly class="input" bind:value={formattedEditDate}/></div>
                        </dd>
                    </dl>
                </div>

                <div class="btn_box margin-top">
                    <!-- <button type="button" on:click|preventDefault={() => } class="margin-right cancel_btn" >취소</button> -->
                     <button type="button" class="margin-right cancel_btn" >취소</button>
                    <button type="submit" class="submit edit_btn">수정</button>
                </div>
            </div>
        </form>
    </section>
</div>

<!-- 로딩 팝업창 -->
<div class="alert_mask" id="alert_mask"></div>
<div class="alert_popup qr_ok_popup loading_popup" id="loading_popup">
    <div class="qr_wrap">
        <div class="qrok_title">
            <div class=" loader"></div>
            <h5>처리중 입니다.<br>잠시만 기다려주세요.</h5>
        </div>
    </div>
</div>