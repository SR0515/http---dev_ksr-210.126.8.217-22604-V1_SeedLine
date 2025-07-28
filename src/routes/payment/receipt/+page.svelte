<script lang="ts">
    import { onMount } from 'svelte';
    import '$lib/styles/receipt.css';
    import { authStore, initAuth } from '$lib/stores/auth';

    export const prerender = true;
    // 샘플 데이터 (서버나 이전 페이지에서 전달 받아야 함)
    const result_type = "0"; // 0: 코페이, 1: 갤컴, 2: KSNET, 3: Kwon
    const cancelYN = "N";
    const lastpay_cancelYN = "N";
    const isCanceled = !(cancelYN === "N" && lastpay_cancelYN === "N");

    const isAuthenticated = initAuth();

    const logoMap = {
        "": "/img/logo/korpay.png",
        "0": "/img/logo/korpay.png",
        "1": "/img/logo/galaxia.png",
        "2": "/img/logo/ksnet.png",
        "3": "/img/logo/kwon.png"
    };

    const pgInfoMap = {
        "" : {
            name: "주식회사 코페이",
            ceo: "채수철",
            biznum: "2068190716",
            addr: "서울특별시 성동구 성수일로77<br>서울숲 IT 밸리 609호"
        },
        "0": {
            name: "주식회사 코페이",
            ceo: "채수철",
            biznum: "2068190716",
            addr: "서울특별시 성동구 성수일로77<br>서울숲 IT 밸리 609호"
        },
        "1": {
            name: "갤럭시아 머니트리(주)",
            ceo: "신동훈",
            biznum: "120–81–60844",
            addr: "서울특별시 강남구 광평로 281<br>수서오피스빌딩 15층(수서동)"
        },
        "2": {
            name: "(주)케이에스넷",
            ceo: "김명석/박한국",
            biznum: "1208197322",
            addr: "서울특별시 서초구 반포대로 95,<br>2층(서초동)"
        },
        "3": {
            name: "케이원피에스",
            ceo: "강승구",
            biznum: "419-88-00046",
            addr: "서울특별시 구로구 디지털로33길 27,<br>5층 513호, 514호(구로동, 삼성IT밸리)"
        }
    };

    onMount(() => { 
        console.log('initAuth()', initAuth());
    })

</script>

<div id="receiptModal" class="receipt_pop">
    <div class="receipt_wrap_scroll  receipt_cancellation={isCanceled}">
        <div>
            <h3>결제정보</h3>
            <dl>
                <dt>상품명</dt>
                <dd>개춘식</dd>
            </dl>
            <dl>
                <dt>결제금액</dt>
                <dd>1,000</dd>
            </dl>
            <dl>
                <dt>할부개월</dt>
                <dd>일시불</dd>
            </dl>
            <dl>
                <dt>매입사</dt>
                <dd>국민</dd>
            </dl>
            <dl>
                <dt>승인번호</dt>
                <dd>11112222</dd>
            </dl>
            <dl>
                <!-- <dt>{isCanceled ? "취소일시" : "거래일시"}</dt> -->
                <!-- <dd>{isCanceled ? "202503265160200" : "20250326155500"}</dd> -->
                <dt>"거래일시"</dt>
                <dd>"20250326155500"</dd>
            </dl>
        </div>

        <div>
            <h3>공급자 정보</h3>
            <dl>
                <dt>상호명</dt>
                <dd>(주)어픽스인컴</dd>
            </dl>
            <dl>
                <dt>대표자명</dt>
                <dd>임재한</dd>
            </dl>
            <dl>
                <dt>사업자번호</dt>
                <dd>170-88-03395</dd>
            </dl>
            <dl>
                <dt>주소</dt>
                <dd>서울특별시 구로구 디지털로 26길 43,<br>대륭포스트타워 8차 L1412호</dd>
            </dl>
        </div>

        <div>
            <h3>결제대행업체정보</h3>
            <dl>
                <dt>상호명</dt>
                <!-- <dd>${pgInfoMap[result_type].name}</dd> -->
                 <dd>테스트 상호</dd>
            </dl>
            <dl>
                <dt>대표자명</dt>
                <!-- <dd>${pgInfoMap[result_type].ceo}</dd> -->
                 <dd>테스트 대표</dd>
            </dl>
            <dl>
                <dt>사업자번호</dt>
                <!-- <dd>${pgInfoMap[result_type].biznum}</dd> -->
                 <dd>0123456789</dd>
            </dl>
            <dl>
                <dt>주소</dt>
                <!-- <dd>${pgInfoMap[result_type].addr}</dd> -->
                 <dd>서울시 구로구</dd>
            </dl>
        </div>
    </div>
</div>