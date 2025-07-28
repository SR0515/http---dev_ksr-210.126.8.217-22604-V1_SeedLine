<script lang="ts">
    import { addLevel} from '$lib/utils/partner/partnerSystem';

    
</script>

<!-- 파트너 추가 섹션 -->
<section class="partner-structure">
    <div class="section-header">
        <h3>파트너 추가</h3>
        <button type="button" class="abt patner_add_btn" on:click={addLevel}>파트너 추가</button>
    </div>
    <div class="structure-grid">
        <!-- 동적으로 생성될 레벨 카드들 -->
        <div id="dynamic-levels"></div>
    </div>
</section>