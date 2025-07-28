export function closeModal() {
    const modal = document.getElementById("check_upper_modal");
    if (modal) {
        modal.style.display = "none";
    } else {
        console.warn("check_upper_modal 요소를 찾을 수 없습니다.");
    }
}

export function showModal(){   
    const modal = document.getElementById("check_upper_modal");
    if (modal) {
        modal.style.display = "block";
    } else {
        console.warn("check_upper_modal 요소를 찾을 수 없습니다.");
    }          
}

export function inserttext(
  upper_path: string, 
  upper_code: string, 
  upper_id: string, 
  upper_rate: string
): void {
  const upperPathInput = document.getElementById("upper_path") as HTMLInputElement | null;
  const upperCodeInput = document.getElementById("upper_code") as HTMLInputElement | null;
  const upperIdInput = document.getElementById("upper_id") as HTMLInputElement | null;
  const upperRateInput = document.getElementById("upper_rate") as HTMLInputElement | null;
  const modal = document.getElementById('check_upper_modal');

  if (upperPathInput) upperPathInput.value = upper_path;
  if (upperCodeInput) upperCodeInput.value = upper_code;
  if (upperIdInput) upperIdInput.value = upper_id;
  if (upperRateInput) upperRateInput.value = upper_rate;

  if (modal) modal.style.display = "none";
}