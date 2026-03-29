/* ======================
   🎯 GLOBAL VARIABLE
====================== */
let currentIndex = 0;
let images = [];
let sliderInterval;
let index = 0;
let allUcapan = [];
let visibleCount = 20;
let increment = 10;
let lastTotal = 0;

const SCRIPT_URL = DATA.config.scriptURL;

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
   🎯 LOAD UCAPAN
====================== */
async function loadUcapan(){
  try{
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();

    data.reverse();

    // jika pertama kali load
    if(allUcapan.length === 0){
      allUcapan = data;
      lastTotal = data.length;
      renderUcapan();
      return;
    }

    // cek apakah ada data baru
    if(data.length > lastTotal){

      const newItems = data.slice(0, data.length - lastTotal);

      allUcapan = data;
      lastTotal = data.length;

      appendUcapan(newItems);
    }

  } catch(err){
    console.log("Gagal load ucapan", err);
  }
}

/* ======================
   🎯 APPEND UCAPAN
====================== */
function appendUcapan(newItems){
  const container = document.getElementById("ucapan-list");

  newItems.forEach(item => {

    if(!item.nama || !item.ucapan) return;

    const el = document.createElement("div");
    el.classList.add("ucapan-item", "new-item");

    el.innerHTML = `
      <b>${item.nama}</b> (${item.status} - ${item.jumlah} orang)
      <br>${item.ucapan}
    `;

    // MASUK KE ATAS (tanpa reset)
    container.prepend(el);
  });
}

/* ======================
   🎯 RENDER UCAPAN
====================== */
function renderUcapan(){
  const container = document.getElementById("ucapan-list");
  container.innerHTML = "";

  const showData = allUcapan.slice(0, visibleCount);

  showData.forEach(item => {
    if(!item.nama || !item.ucapan) return;

    const el = document.createElement("div");
    el.classList.add("ucapan-item");

    el.innerHTML = `
      <b>${item.nama}</b> (${item.status} - ${item.jumlah} orang)
      <br>${item.ucapan}
    `;

    container.appendChild(el);
  });

  updateLoadMoreButton();
}

/* ======================
    🎯 UPDATE TOMBOL LOAD MORE
====================== */
function updateLoadMoreButton(){
  const btn = document.getElementById("loadMoreBtn");

  // tampilkan hanya jika lebih dari 20
  if(allUcapan.length > 20 && visibleCount < allUcapan.length){
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
}

function loadMoreUcapan(){
  visibleCount += increment;

  if(visibleCount > allUcapan.length){
    visibleCount = allUcapan.length;
  }

  renderUcapan();
}

/* ======================
   🎯 LOADING UCAPAN
====================== */
function showLoadingUcapan(nama, status, jumlah){
  const container = document.getElementById("ucapan-list");

  const el = document.createElement("div");
  el.classList.add("ucapan-item", "loading-item");
  el.id = "temp-ucapan";

  el.innerHTML = `
    <b>${nama}</b> (${status} - ${jumlah} orang)
    <br>⏳ Mengirim ucapan...
  `;

  container.prepend(el);
}

function removeLoadingUcapan(){
  const temp = document.getElementById("temp-ucapan");
  if(temp) temp.remove();
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

  /* NAMA TAMU */
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("to");

  if(guest){
    document.getElementById("guest-name").innerText =
      "Yang Terhormat " + guest;
  }

  /* ACARA */
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

  /* GALERI */
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

  slides.addEventListener("mousedown", () => {
    clearInterval(sliderInterval);
  });

  slides.addEventListener("click", function(e){
    if(e.target.tagName === "IMG"){
      clearInterval(sliderInterval);
      const i = parseInt(e.target.dataset.index);
      setTimeout(() => openLightbox(i), 50);
    }
  });

  startSlider();

  /* AMPLOP */
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
     🎯 RSVP + UCAPAN
  ====================== */
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

    // tampil loading dulu
    showLoadingUcapan(nama, status, jumlah);

    document.getElementById("ucapan-list").scrollTop = 0;

    const notif = document.getElementById("notif");
    notif.classList.add("show");

    setTimeout(() => {
      notif.classList.remove("show");
    }, 3000);


    this.reset();

    // kirim ke server
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ nama, jumlah, status, ucapan })
      });

      // refresh data setelah kirim
      setTimeout(() => {
      removeLoadingUcapan();
      loadUcapan();
      }, 1000);

    } catch (err) {
      console.log("Gagal kirim");
    }

  });

  /* LOAD AWAL + AUTO REFRESH */
  loadUcapan();
  setInterval(loadUcapan, DATA.config.refreshInterval);

});

/* ======================
   🎯 COUNTDOWN
====================== */
const targetDate = new Date(
  DATA.countdown.tanggal + " " + DATA.countdown.waktu
).getTime();

setInterval(() => {

  const now = new Date().getTime();
  const distance = targetDate - now;

  if(distance < 0){
    document.getElementById("countdown").innerHTML = "Acara sedang berlangsung 🎉";
    return;
  }

  document.getElementById("days").innerText =
    Math.floor(distance / (1000 * 60 * 60 * 24));

  document.getElementById("hours").innerText =
    Math.floor((distance / (1000 * 60 * 60)) % 24);

  document.getElementById("minutes").innerText =
    Math.floor((distance / (1000 * 60)) % 60);

  document.getElementById("seconds").innerText =
    Math.floor((distance / 1000) % 60);

}, 1000);