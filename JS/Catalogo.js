const menuBtn = document.getElementById("menuBtn");
const closeMenu = document.getElementById("closeMenu");
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");

menuBtn.addEventListener("click", () => {
  sideMenu.classList.add("active");
  menuOverlay.classList.add("active");
});

closeMenu.addEventListener("click", closeSideMenu);
menuOverlay.addEventListener("click", closeSideMenu);

function closeSideMenu() {
  sideMenu.classList.remove("active");
  menuOverlay.classList.remove("active");
}