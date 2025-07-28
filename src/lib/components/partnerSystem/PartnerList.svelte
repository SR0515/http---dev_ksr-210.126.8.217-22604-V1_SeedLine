<script lang="ts">

</script>

<!-- 파트너 구조 목록 섹션 -->
<section class="partner-list">
    <h3>파트너 구조 목록</h3>
    <div class="partner-table-wrapper">
        <table class="partner-table">
            <colgroup>      
                <col style="width: 5%">               
                <col style="width: 20%">  
                <col style="width: 10%"> 
                <col style="width: 50%"> 
                <col style="width: 15%"> 
            </colgroup>

            <thead>
                <tr>
                    <th class="col-no">NO</th>
                    <th class="col-name">파트너명</th>
                    <th class="col-permission">권한</th>
                    <th class="col-path">특정 패스</th>
                    <th class="col-action">관리</th>
                </tr>
            </thead>
            <tbody id="partnerTableBody">
                <!-- 동적으로 생성될 파트너 목록 -->
            </tbody>
        </table>
    </div>
</section>