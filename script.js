/* ======================
   🎯 GLOBAL VARIABLE
====================== */
let currentIndex = 0;
let images = [];
let sliderInterval;
let index = 0;

/* ======================
   🎯 OPEN INVITATION
====================== */
function openInvitation(){
  document.getElementById("opening").style.display = "none";
  document.getElementById("music").play();
}

/* ======================
   🎯 COPY REKENING
====================== */
function copyRekening(nomor){
  navigator.clipboard.writeText(nomor);
  alert("Nomor berhasil disalin");
}

/* ======================
   🎯 LIGHTBOX
====================== */
function openLightbox(i){
  currentIndex = i;

  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");

  lightbox.style.display = "flex";
  img.src = images[i];

  // efek halus
  document.querySelector(".slides").style.opacity = "0.4";

  clearInterval(sliderInterval);
}

function closeLightbox(){
  document.getElementById("lightbox").style.display = "none";

  document.querySelector(".slides").style.opacity = "1";

  startSlider();
}

function nextSlide(){
  currentIndex = (currentIndex + 1) % images.length;
  document.getElementById("lightbox-img").src = images[currentIndex];
}

function prevSlide(){
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  document.getElementById("lightbox-img").src = images[currentIndex];
}

/* ======================
   🎯 SLIDER
====================== */
function startSlider(){
  const slides = document.querySelector(".slides");

  clearInterval(sliderInterval);

  sliderInterval = setInterval(() => {
    index++;

    slides.style.transition = "0.6s ease";
    slides.style.transform = `translateX(-${index * 220}px)`;

    if(index >= images.length * 2){
      setTimeout(() => {
        slides.style.transition = "none";
        index = images.length;
        slides.style.transform = `translateX(-${index * 220}px)`;
      }, 600);
    }

  }, 2500);
}

/* ======================
   🎯 MAIN LOAD
====================== */
document.addEventListener("DOMContentLoaded", () => {

  /* THEME */
  document.documentElement.style.setProperty('--primary', DATA.theme.primary);
  document.documentElement.style.setProperty('--secondary', DATA.theme.secondary);
  document.documentElement.style.setProperty('--bg', DATA.theme.background);
  document.documentElement.style.setProperty('--text', DATA.theme.text);

  /* MUSIC */
  document.getElementById("music").src = DATA.media.musik;

  /* HERO */
  document.querySelector(".hero").style.background =
    `url(${DATA.media.hero}) center/cover`;

  /* NAMA */
  document.getElementById("nama-opening").innerText =
    DATA.pasangan.pria + " & " + DATA.pasangan.wanita;

  document.getElementById("nama-pria").innerText = DATA.pasangan.pria;
  document.getElementById("nama-wanita").innerText = DATA.pasangan.wanita;

  document.getElementById("nama-closing").innerText =
    DATA.pasangan.pria + " & " + DATA.pasangan.wanita;

  document.querySelector(".date").innerText = DATA.tanggal;

  /* ======================
     🎯 NAMA TAMU
  ====================== */
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("to");

  if(guest){
    document.getElementById("guest-name").innerText =
      "Yang Terhormat " + guest;
  }

  /* ======================
     🎯 ACARA
  ====================== */
  document.getElementById("akad").innerHTML = `
    <h3>🕌 Akad Nikah</h3>
    <p>${DATA.acara.akad.tanggal}</p>
    <p>${DATA.acara.akad.waktu}</p>
    <p>${DATA.acara.akad.tempat}</p>
    <a href="${DATA.acara.akad.maps}" target="_blank">Buka Maps</a>
  `;

  document.getElementById("resepsi").innerHTML = `
    <h3>🎉 Resepsi</h3>
    <p>${DATA.acara.resepsi.tanggal}</p>
    <p>${DATA.acara.resepsi.waktu}</p>
    <p>${DATA.acara.resepsi.tempat}</p>
    <a href="${DATA.acara.resepsi.maps}" target="_blank">Buka Maps</a>
  `;

  /* ======================
     🎯 GALERI
  ====================== */
  const slides = document.querySelector(".slides");
  images = DATA.media.galeri;

  let loopImages = [...images, ...images, ...images];

  loopImages.forEach((img, i) => {
    slides.innerHTML += `
      <img src="${img}" data-index="${i % images.length}" draggable="false">
    `;
  });

  index = images.length;
  slides.style.transform = `translateX(-${index * 220}px)`;

  /* 🔥 FIX CLICK (ANTI MISS) */
  slides.addEventListener("mousedown", () => {
    clearInterval(sliderInterval);
  });

  slides.addEventListener("click", function(e){

    if(e.target.tagName === "IMG"){

      clearInterval(sliderInterval);

      const i = parseInt(e.target.dataset.index);

      setTimeout(() => {
        openLightbox(i);
      }, 50);

    }

  });

  startSlider();

  /* ======================
     🎯 AMPLOP
  ====================== */
  const amplop = document.getElementById("amplop");

  DATA.amplop.forEach(item => {
    amplop.innerHTML += `
      <div class="amplop-card">
        <h3>${item.bank}</h3>
        <p>${item.nomor}</p>
        <p>a.n ${item.nama}</p>
        <button onclick="copyRekening('${item.nomor}')">Copy</button>
      </div>
    `;
  });

  /* ======================
     🎯 UCAPAN
  ====================== */
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwAIqswY8smT8q7yUZ1S1D6XZjKqrcG_5C6U6gn-C79yU01OhDeFhNhcv29xXbSOHKJ5A/exec";

document.querySelector(".rsvp-form").addEventListener("submit", async function(e){
  e.preventDefault();

  const nama = this.nama.value.trim();
  const jumlah = this.jumlah.value;
  const status = this.status.value;
  const ucapan = this.ucapan.value.trim();

  if(!nama || !jumlah || !status || !ucapan){
    alert("Mohon isi semua data 🙏");
    return;
  }

  // 🔥 TAMPILKAN LANGSUNG (TANPA DELAY)
  const item = document.createElement("div");
  item.classList.add("ucapan-item");

  item.innerHTML = `
    <b>${nama}</b> (${status} - ${jumlah} orang)
    <br>${ucapan}
  `;

  document.getElementById("ucapan-list").prepend(item);

  // 🔥 NOTIF CEPAT
  const notif = document.getElementById("notif");
  notif.classList.add("show");

  setTimeout(() => {
    notif.classList.remove("show");
  }, 2000);

  this.reset();

  // 🔥 KIRIM DATA DI BELAKANG (ASYNC)
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ nama, jumlah, status, ucapan })
    });
  } catch (err) {
    console.log("Gagal kirim ke server, tapi UI tetap jalan");
  }

});

    /* ======================
         🎯 COUNTDOWN
    ====================== */

const targetDate = new Date(DATA.tanggal + " 08:00:00").getTime();

setInterval(() => {

  const now = new Date().getTime();
  const distance = targetDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  document.getElementById("days").innerText = days;
  document.getElementById("hours").innerText = hours;
  document.getElementById("minutes").innerText = minutes;
  document.getElementById("seconds").innerText = seconds;

}, 1000);

});