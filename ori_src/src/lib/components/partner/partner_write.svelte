<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { checkAuth } from '$lib/utils/accessControl';
	import { showToast } from '$lib/stores/toast';
	import LeftMenu from '$lib/components/LeftMenu.svelte';
	import Toast from '$lib/components/Toast.svelte';


    
    let writePartnerInfo: string;
    let partnerUpperRate : string;
    
    let currentPage = 'Agency_write';

    let clientIP = ""; // 공인 IP
    //현재 로그인한 계정정보
    let classify = localStorage.getItem("classify");
    let user_rate = localStorage.getItem('user_rate');
    let editor_userId = localStorage.getItem("user_id");
    let user_id = localStorage.getItem("user_id");
    let user_name = localStorage.getItem("user_name");

    let bankListData:any = [];
    let selectedBank:any = null;

    let partnerData :any= []; // 파트너 리스트 데이터
    let distributorData:any = []; // 대행사 등록시 데이터

    var pageNumber = 1;
    var totalPages = '';
    var totalCount = '';
    var page_size = 10;     
    let page = 1;     

    function address(): void {
        
      document.getElementById("address_kakao").addEventListener("click", function () { //주소입력칸을 클릭하면
          //카카오 지도 발생
          new daum.Postcode({
              oncomplete: function (data) { //선택시 입력값 세팅
                  document.getElementById("coper_address").value = data.address; // 주소 넣기
                  document.querySelector("input[name=coper_address_details]").focus(); //상세입력 포커싱
              }
          }).open();
      });
      //사업장 주소 텍스트 칸
        document.getElementById("coper_address").addEventListener("click", function () { //주소입력칸을 클릭하면
            //카카오 지도 발생
            new daum.Postcode({
                oncomplete: function (data) { //선택시 입력값 세팅
                    document.getElementById("coper_address").value = data.address; // 주소 넣기
                    document.querySelector("input[name=coper_address_details]").focus(); //상세입력 포커싱
                }
            }).open();
        });
    }

     // 은행리스트 가져오기
    async function loadBankList() {
        try {
        const response = await fetch('/api/banks');
        const json = await response.json();
        if (json.success) {
            // bankListData = json.data;
          bankListData = json.data.map(bank => ({
          label: bank.bank_name,  // 또는 bank.bank_name 등 실제 필드명
          value: bank.bank_code   // 또는 bank.bank_code
        }));
        } else {
            console.error('서버 오류:', json.message);
        }

        console.log('은행 받은 데이터:', json);
        } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
        }
    }

    function closePopup() {
        document.getElementById("check_upper_modal").style.display="none";
    }

    function showModal(){   
        // document.getElementById("table_wrap_modal").innerHTML = xhr.responseText;
        document.getElementById("check_upper_modal").style.display="block";     
        partnerList(); // 파트너 리스트 가져오기          
    }


    //페이지네이션
    function search_page(i){
        page = i;  // 페이지 번호 갱신
        partnerList(); // 데이터 갱신
        pageNumber = i;
    }

    //파트너 리스트 가져오기
    async function partnerList() {
        try {
            const params = new URLSearchParams({
                currentpage: currentPage,
                page: page,  // 현재 페이지를 API에 전달
                page_size: page_size, // 페이지 크기
                partnerUpperRate : partnerUpperRate, //등록하려는 파트너의 상위레벨
                level_idx : writePartnerInfo.id //상위레벨의 아이디
            });

        const response = await fetch('/api/partner/writeOk/partnerListCheck/sr_23346?' + params.toString());
        const json = await response.json();
        if (json.success) {
            partnerData = json.data;

            totalCount = json.pagination.totalCount;
            totalPages = Math.ceil(totalCount / page_size);  // 총 페이지 수 계산
        } else {
            console.error('서버 오류:', json.message);
        }

        console.log('파트너 리스트 받은 데이터:', json);
        } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
        }
    }

     //대행사가 등록할때 데이터 가져오기
    async function distributorInfo() {
        try {
            const params = new URLSearchParams({
                rate : user_rate,
                userId : localStorage.getItem("user_id"),
            });

        const response = await fetch('/api/partner/writeOk/agencyWrite?' + params.toString());
        const json = await response.json();
        if (json.success) {
            distributorData = json.data;
        } else {
            console.error('서버 오류:', json.message);
        }

        console.log('대행사 받은 데이터:', json);
        } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
        }
    }

    //모달 파트너 데이터 넣기
    function inserttext(upper_name,upper_code,upper_id) {
        document.getElementById("upper_name").value = upper_name;
        document.getElementById("upper_id").value = upper_code;
        document.getElementById("upper_code").value = upper_id; 
        document.getElementById('check_upper_modal').style.display = "none";
    }

    //아이디 중복체크
    async function idCheck(){
        let partnerId = document.getElementById("user_id").value;
        if (!partnerId) {
        showToast("아이디를 입력해주세요!", "warning");
        return;
        }
        try {
            const response = await fetch(`/api/partner/writeOk/partnerIdCheck/${partnerId}`);
            const result = await response.json();

        if (response.ok) {
            if (result.isDuplicated) {
                showToast("이미 사용 중인 아이디입니다.");
                document.getElementById("user_id").focus();
            } else {
                showToast("사용 가능한 아이디입니다.");
                document.getElementById("user_id").setAttribute("readonly", true);
                document.getElementById("idCheckBtn").innerText = "확인완료"
            }
        } else {
            showToast("서버 오류가 발생했습니다.", "error");
            console.log("에러내용"+result.message);
        }
        } catch (error) {
            showToast("네트워크 오류가 발생했습니다.", "error");
            console.error("중복 체크 오류:", error);
        }
    }

    //파트너 등록 정보 전송
    async function partnerWrite(e){
        e.preventDefault();
        const idCheck = document.getElementById("idCheckBtn").innerText;
        const partnerId = document.getElementById("user_id");

        if(idCheck !=='확인완료' && !partnerId.hasAttribute('readonly')){
            showToast("ID 중복확인을 해주세요.");
            return;
        }

        const form = document.getElementById("agencyInfoForm");
        const userId = localStorage.getItem("user_id");
        const bank_code = form.bank_select.value;
        const memo = form.memo?.value ?? '';
        const partnerData = {
            partner_id : form.partner_id.value,
            pass : form.partner_pass.value,
            rate : writePartnerInfo.rate, //등록(추가) 하려는 등급 
            level_idx : writePartnerInfo.id,
            upper_name : form.upper_name.value,
            upper_id : form.upper_id.value,
            upper_code : form.upper_code?.value?? '',
            business_type : form.business_type.value,
            name : form.coper_name.value,
            ceo_name : form.ceo_name.value,
            contact : form.coper_contact.value,
            address : form.coper_address.value,
            address_detail : form.coper_address_details.value,
            memo : memo,
            business_number : form.business_number.value,
            corporate_number : form.corporate_number.value,
            business_condition : form.business_condition.value,
            business_subject : form.business_subject.value,
            login_state : form.login_state.value,
        }
        const partnerWalletData = {
            name : form.coper_name.value,
            account_num : form.account_num.value,
            account_name : form.account_name.value,
            rate : writePartnerInfo.rate,
        }

        const partnerCommissionData  = {
            partner_id : form.partner_id.value,
        }
        const editLogData = {
        ip : clientIP,
        browser : navigator.userAgent,
        userId : editor_userId
        // browser,
        };
        const classify = localStorage.getItem("classify")
        if(form.partner_pass ===""){
            showToast("비밀번호를 입력해주세요!");
            return;
        }else if(form.partner_pass.value !== form.partner_pass_check.value){
            showToast("비밀번호가 일치하지 않습니다.");
            return;
        }else if(form.coper_name ===""){
            showToast("업체명을 입력해주세요!");
            return;
        }else if(form.ceo_name ===""){
            showToast("대표자명을 입력해주세요!");
            return;
        }else if(form.coper_contact ===""){
            showToast("업체 전화번호를 입력해주세요!");
            return; 
        }
            const payload = {
            userId,
            bank_code,
            partnerData,
            partnerWalletData,
            partnerCommissionData,
            editLogData,
            classify,
            partnerUpperRate
            };

        try {
            const response = await fetch('/api/partner/writeOk/sr_23346', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
            });

            console.log("전송된 데이터:", payload);
            const result = await response.json();
            if (result.success) {
            showToast('파트너 등록 성공')
            setTimeout(() => {
                navigateTo('Partner_list', { id: writePartnerInfo.id, name: writePartnerInfo.name, rate: writePartnerInfo.rate })
            }, 1500); // 
            } else {
            // alert(`오류: ${result.message}`);
            console.error('서버 응답 오류:', result);
            alert(`오류: ${result.message}\n에러: ${result.error}`);
            }
        } catch (error) {
            console.error('등록 중 오류 발생:', error);
            console.log("등록 중 오류 발생:", error);
            alert('서버 오류 발생');
        }

    }
    

    onMount(() => {
        partnerUpperRate = sessionStorage.getItem("partnerUpperRate");
        console.log("partnerUpperRate",partnerUpperRate)
        adminDistributorAcess();
          // ✅ 공인 IP 조회 (백그라운드에서 비동기 처리)
        fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            clientIP = data.ip;
        })
        .catch(err => {
            console.error('IP 조회 실패:', err);
        });

        loadBankList();
        address();
        writePartnerInfo = JSON.parse(sessionStorage.getItem("writePartnerInfo") || '{}'); //등록하려는 정보
        partnerUpperRate = sessionStorage.getItem("partnerUpperRate");

        document.getElementById("user_id").addEventListener("click",function(){
            document.getElementById("user_id").removeAttribute("readonly");
            document.getElementById("idCheckBtn").innerText = "중복확인"
        })

        //대행사가 등록할 경우 
        if(classify == "1"){
            distributorInfo()
        }

    });
</script>

<LeftMenu/>
<div id="page_contect" class="">
    <section>
        <h5 style="float:left; margin-right:10px;" > 정보등록 </h5> 
        <span style="float:left; margin-right:10px;" > - </span>
        <h5> 파트너</h5>   
    </section>
      
    <form id="agencyInfoForm" method="post" on:submit|preventDefault={partnerWrite}>    
        <section class="sub_box">   
            <!-- 기본정보 -->
            <h3>기본정보</h3>
            <div class="agency_form border-bottom">
                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>상위 파트너명</dt>
                        <dd>
                            {#if classify === "0"}
                                {#if partnerUpperRate === "p0"} <!--대행사등록-->
                                    <div class="form_input"><input type="text" class="input" id="upper_name" name="upper_name" bind:value={user_name} readonly/></div>
                                {:else}
                                    <div class="form_input"><input type="text" class="input" id="upper_name" name="upper_name" readonly/></div>
                                {/if}
                            {:else}
                              <div class="form_input"><input type="text" class="input" id="upper_name" bind:value="{distributorData.upper_name}" name="upper_name" readonly/></div>
                            {/if}
                        </dd>
                    </dl>
            
                    <dl class="col-12 col-lg-6">
                        <dt>상위 파트너 아이디</dt>
                        <dd class="upper_code_box">
                            <div class="form_input">
                                {#if classify === "0"}
                                    {#if partnerUpperRate === "p0"}  <!--대행사등록-->
                                        <input type="text" class="input" name="upper_id" id="upper_id" bind:value={user_id} placeholder="상위파트너아이디" style="outline: none;" readonly required/>
                                        <!-- <input type="hidden" name="upper_code" id="upper_code" /> -->
                                    {:else}
                                        <input type="text" class="input" name="upper_id" id="upper_id" placeholder="상위파트너아이디" style="outline: none;" readonly required/>
                                        <input type="hidden" name="upper_code" id="upper_code" />
                                        <button class="" id="checke_upper" type="button" on:click|preventDefault={() => showModal()}>파트너 확인</button>
                                    {/if}
                                {:else}
                                <!-- 관리자 외에 등급이 등록할떄 -->
                                    <input type="text" class="input" name="upper_id" id="upper_id" placeholder="상위파트너코드" bind:value={user_id} style="outline: none;" readonly required/>
                                    <input type="hidden" name="upper_code" id="upper_code" bind:value="{distributorData.code}"/>
                                {/if}
                            </div>    
                        </dd>                                    
                    </dl>
                </div>
              
                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>아이디</dt>
                        <dd>
                            <div class="form_input form_input d-flex ">
                                <input type="text" id="user_id" class="input" name="partner_id" required/>
                                <button class="" type="button" id="idCheckBtn" on:click|preventDefault={idCheck}>중복확인</button>                        
                            </div>
                        </dd>
                    </dl>
                </div>

                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>비밀번호</dt>
                        <dd>
                            <div class="form_input"><input type="password" class="input" value="" name="partner_pass" required/></div>
                        </dd>
                    </dl>
            
                    <dl class="col-12 col-lg-6">
                        <dt>비밀번호 확인</dt>
                        <dd>
                            <div class="form_input"><input type="password" class="input" value="" name="partner_pass_check" required/></div>
                        </dd>
                    </dl>
                </div>
              
                <div class="d-flex">
                    <dl class="col-12 col-lg-6 radio_wrap">
                        <dt>사업자구분</dt>
                        <dd class="d-flex">
                            <label><input type="radio" name="business_type" value="0" id="businessType_0" checked>비사업자</label>
                            <label><input type="radio" name="business_type" value="1" id="businessType_1">개인사업자</label>
                            <label><input type="radio" name="business_type" value="2" id="businessType_2">법인사업자</label>
                        </dd>
                    </dl>
            
                    <dl class="col-12 col-lg-6">
                        <dt>대표자명</dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="ceo_name" value="" required/>
                            </div>
                        </dd>
                    </dl>
                </div>
        
                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>업체명</dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="coper_name" value=""  required/>
                            </div>
                        </dd>
                    </dl>
            
                    <dl class="col-12 col-lg-6">
                        <dt>업체 전화번호 </dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="coper_contact" oninput="this.value=this.value.replace(/[^0-9]/g,'')" placeholder="'-'를 제외한 숫자만 입력해주세요." value="" /></div>
                        </dd>
                    </dl>
                </div>

                <div class="row formbank_wrap">   
                    <dl class="col-12 col-md-6 col-lg-4">
                        <dt class="dt_width">입금은행명</dt>
                        <dd> 
                              <Select items={bankListData} required bind:value={selectedBank} placeholder="은행 검색" clearable={false}/>
                              <input type="hidden" name="bank_select" value={selectedBank?.value || ''} />
                        </dd>
                    </dl>            
                   
                    <dl class="col-12 col-md-6 col-lg-5">
                        <dt>계좌번호</dt>
                        <dd>
                            <div class="form_input">
                                <input type="text" class="input" name="account_num" value=""  required/>
                            </div>
                        </dd>
                    </dl>
      
                    <dl class="col-12 col-md-6 col-lg-3">
                        <dt class="pl_5">예금주</dt>
                        <dd>
                            <div class="form_input">
                                <input type="text" class="input" name="account_name" value="" required/>
                            </div>
                        </dd>
                    </dl>
                </div>  
                  
                <div class="d-flex">                
                    <dl class="col-12">
                        <dt>사업장 주소</dt>
                        <dd>
                          <div class="cd-flexa">
                              <div class="form_input">
                                  <input type="text" class="input" id="coper_address" readonly name="coper_address" value=""  />
                              </div>
                              <div class="search_address">
                                  <div class="address_btn_box">
                                      <button type="button" id="address_kakao">검색</button>
                                  </div>
                              </div>
                          </div>  
                        </dd>
                    </dl>   
                </div>

                <div class="d-flex">                
                    <dl class="col-12 mb_20px">
                        <dt>상세주소</dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="coper_address_details" value="" /></div>
                        </dd>
                    </dl>        
                </div>

                {#if classify === "0"}
                    <dl class="mb_20px">
                        <dt class="dt_width">메모</dt>
                        <dd class="">
                            <div class="textarea_margin">
                                <textarea name="memo"></textarea>
                            </div>
                        </dd>
                    </dl>
                {/if}             
            </div>
              
              
            <div class="info_text">
                <h3>사업자정보</h3>
                <span class="">*사업자 회원만 해당</span>
            </div>
              
            <div class="agency_form border-bottom">        
                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>사업자번호</dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="business_number" value=""/></div>
                        </dd>
                    </dl>
            
                    <dl class="col-12 col-lg-6">
                        <dt>법인번호</dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="corporate_number" value="" /></div>
                        </dd>
                    </dl>
                </div>
            
                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>업태</dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="business_condition" value="" /></div>
                        </dd>
                    </dl>
                    <dl class="col-12 col-lg-6">
                        <dt>종목</dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="business_subject" value=""/></div>
                        </dd>
                    </dl>
                </div>
            </div>
              
              
            <h3>서비스 설정</h3>
            <div class="agency_form ">
                <div class="d-flex">
                    <dl class="col-12 col-lg-6 radio_wrap">
                        <dt>계약상태</dt>
                        <dd class="d-flex">
                            <label><input type="radio" name="login_state" value="0" id="loginState_0" checked>허용</label>
                            <label><input type="radio" name="login_state" value="1" id="loginState_1">차단</label>
                            <label><input type="radio" name="login_state" value="2" id="loginState_2">대기</label>
                        </dd>
                    </dl>
                </div> 
            </div>
            <!--정산 수수료 설정-->
            <!-- <h3>정산 수수료 설정</h3>
            <div class="agency_form ">    
                <div class="d-flex">
                    <dl class="col-12 col-lg-6 radio_wrap">
                        <dt>단말기 수수료</dt>
                        <dd>
                            <input type="text" class="input" name="terminal_commission" value="" required/> %
                        </dd>
                    </dl>
                </div>
        
                <div class="d-flex">
                    <dl class="col-12 col-lg-6 radio_wrap">
                        <dt>인증결제 수수료</dt>
                        <dd>
                            <input type="text" class="input" name="keyin_commission" value="" required/> %
                        </dd>
                    </dl>
                </div>  
            </div> -->
          <!--정산수수료 설정 끝-->

            <input type="hidden" name="current_agent" id="current_agent" />
            <div class="sub_box">
                <div class="btn_box">
                    <button class="cancel_bt" on:click|preventDefault={() => navigateTo('Partner_list', { id: writePartnerInfo.id, name: writePartnerInfo.name, rate: writePartnerInfo.rate })}>취소</button>

                    <button class="edit_bt" type="submit">등록</button>
                </div>
            </div>
        </section>
    </form>
</div>

<!-- 모달 창 HTML -->
<div class="CK_modal" id="check_upper_modal" >
    <div class="modal-content">
        <span class="close_bt" id="close_modal" on:click={closePopup}  on:keydown={closePopup}><span class="btn__close" alt="닫기" title="닫기"></span></span>

        <div id="modalBody" style="margin-top: 1.5rem;">          
            <!-- 보더박스_테이블 시작 -->
            <section class="borderbox_table">                    
                <div id="table_wrap" class="table_wrap">			
                    <table class="table_list upper_member_table" width="100%">
                        <caption>상위업체 검색 테이블</caption>
                    
                        <colgroup>                                                      
                            <col width="5%">
                            <col width="12%">
                            <col width="12%">
                            <col width="20%">
                            <col width="15%">
                            <col width="15%">
                            <col width="15%">
                            <col width="6%">
                        </colgroup>

                        <thead>
                            <tr>                                                                 
                                <th>No</th>
                                <th scope="col">업체코드</th>
                                <th scope="col">아이디</th>
                                <th scope="col">업체경로</th>
                                <th scope="col">업체명</th>
                                <th scope="col">대표자명</th>
                                <th scope="col">전화번호</th>
                                <th scope="col">선택</th>
                            </tr>
                        </thead>

                        <tbody>
                            {#each partnerData as dist, index}
                            <tr>
                                <td>{totalCount - ((page - 1) * page_size) - index}</td>
                                <td>{dist.code}</td>
                                <td>{dist.id}</td> 
                                <td>{dist.upper_name}</td>  
                                <td>{dist.name}</td>                        
                                <td>{dist.ceo_name}</td> 
                                <td>{dist.contact}</td> 
                                <td><button class="t_btn" on:click|preventDefault={() => inserttext(dist.upper_name, dist.id, dist.code)}>입력하기</button></td>
                            </tr>   
                            {/each}
                        </tbody>
                    </table>
                </div>

            </section>
            <!-- 보더박스_테이블 끝 -->       

            <!-- 페이지네이션 -->
            <section class="borderbox_pageing">
                <div class="pageing">
                    <div class="page_navgation">
                        <!-- 첫 페이지 이동 -->
                        {#if page > 1}
                            <a href="{'a'}" on:click|preventDefault={() => search_page(1)} class="on arrow_bt">
                                <img class="arrow_icon chevron-double-left" src="../img/icon/chevron-double-left.svg" alt="첫 페이지">
                            </a>
                        {/if}

                        <!-- 10페이지 뒤로 이동 -->
                        {#if totalPages > 10}
                            <a href="{'a'}" on:click|preventDefault={() => search_page(1)} class="on arrow_bt">
                                <img class="arrow_icon chevron-left" src="../img/icon/chevron-left.svg" alt="10페이지 뒤로">
                            </a>
                        {/if}

                        <!-- 페이지 번호 렌더링 -->
                        {#each Array(Math.min(totalPages, 10)).fill(0).map((_, i) => i + 1) as page}
                            {#if pageNumber == page}
                                <a href="{'a'}" class="on" on:click|preventDefault={() => search_page(page)}>{page}</a>
                            {:else}
                                <a href="{'a'}" on:click|preventDefault={() => search_page(page)}>{page}</a>
                            {/if}
                        {/each}

                        <!-- 10페이지 앞으로 이동 -->
                        {#if totalPages-10 >= page}
                            <a href="{'a'}" on:click|preventDefault={() => search_page(10)} class="on arrow_bt">
                                <img class="arrow_icon chevron-right" src="../img/icon/chevron-right.svg" alt="10페이지 앞으로">
                            </a>
                        {/if}

                        <!-- 마지막 페이지 이동 -->
                        {#if page < totalPages}
                            <a href="{'a'}" on:click|preventDefault={() => search_page(totalPages)} class="on arrow_bt">
                                <img class="arrow_icon chevron-double-right" src="../img/icon/chevron-double-right.svg" alt="마지막 페이지">
                            </a>
                        {/if}
                    </div>
                </div>
            </section>
        </div>
    </div>
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