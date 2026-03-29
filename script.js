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
let lastSubmitTime = 0;

const SUBMIT_DELAY = 5000;
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

    if(allUcapan.length === 0){
      allUcapan = data;
      lastTotal = data.length;
      renderUcapan();
      return;
    }

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
   🎯 APPEND UCAPAN (MORPH)
====================== */
function appendUcapan(newItems){
  const container = document.getElementById("ucapan-list");

  newItems.forEach(item => {

    if(!item.nama || !item.ucapan) return;

    // 🔥 cari optimistic item
    const existing = document.querySelectorAll(".sending-item");

    let matched = null;

    existing.forEach(el => {
      if(
        el.dataset.nama === item.nama &&
        el.dataset.ucapan === item.ucapan
      ){
        matched = el;
      }
    });

    if(matched){
      const statusEl = matched.querySelector(".status");

      if(statusEl){
        statusEl.innerHTML = "✅ Terkirim";
        statusEl.classList.add("sent");

        setTimeout(() => {
          statusEl.style.opacity = "0";
          setTimeout(() => {
            statusEl.style.display = "none";
          }, 300);
        }, 2000);
      }

      matched.classList.remove("sending-item");
      matched.classList.add("sent-item");

    } else {

      // 🔥 anti duplikat
      const existingText = container.innerText;
      if(existingText.includes(item.nama) && existingText.includes(item.ucapan)){
        return;
      }

      const el = document.createElement("div");
      el.classList.add("ucapan-item", "new-item");

      el.innerHTML = `
        <b>${item.nama}</b> (${item.status} - ${item.jumlah} orang)
        <br>${item.ucapan}
      `;

      container.prepend(el);
    }

  });
}

/* ======================
   🎯 RENDER
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
   🎯 LOAD MORE
====================== */
function updateLoadMoreButton(){
  const btn = document.getElementById("loadMoreBtn");

  if(allUcapan.length > visibleCount){
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
   🎯 OPTIMISTIC UI
====================== */
function addOptimisticUcapan(nama, status, jumlah, finalText){
  const container = document.getElementById("ucapan-list");

  const el = document.createElement("div");
  el.classList.add("ucapan-item", "sending-item");

  el.dataset.nama = nama;
  el.dataset.ucapan = finalText; // ✅ FIX

  el.innerHTML = `
    <b>${nama}</b> (${status} - ${jumlah} orang)
    <br>${finalText}
    <div class="status sending">⏳ Mengirim...</div>
  `;

  container.prepend(el);

  return el;
}

/* ======================
   🎯 NORMALIZE
====================== */
function normalize(text){
  return text
    .toLowerCase()
    .replace(/[4@]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5]/g, "s")
    .replace(/[^a-z0-9]/g, "");
}

/* ======================
   🎯 SIMPLIFY
====================== */
function simplify(text){
  return text
    .replace(/(.)\1+/g, "$1") // huruf berulang → 1
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

    // 🔥 VALIDASI
    if(!nama || !jumlah || !status || !ucapan){
      alert("Mohon isi semua data 🙏");
      return;
    }

    if(nama.length < 2){
      alert("Nama terlalu pendek 🙏");
      return;
    }

    if(ucapan.length < 5){
      alert("Ucapan terlalu pendek 🙏");
      return;
    }

    if(ucapan.length > 200){
      alert("Ucapan terlalu panjang 🙏");
      return;
    }

    // 🔥 ANTI SPAM DELAY
    const now = Date.now();
    if(now - lastSubmitTime < SUBMIT_DELAY){
      alert("Tunggu beberapa detik 🙏");
      return;
    }
    lastSubmitTime = now;

    // 🔥 ANTI DUPLIKAT
    const recent = allUcapan.slice(0, 5);
    const spamCheck = recent.some(item =>
      item.nama === nama && item.ucapan === ucapan
    );
    if(spamCheck){
      alert("Ucapan sudah pernah dikirim 🙏");
      return;
    }

    const bannedHard = [
          "anjing","anying","anjg","anj","anjir","anjay",
          "bangsat","bngst","bngsat","bgst","bgstt","bngsd","bgsd",
          "kontol","kontl","kntl","kntol",
          "memek","memk","mmk",
          "ngentot","ngentd","ngntt",
          "ngewe","ngwe","ngweh",
          "jancok","jembut","itil",
          "puki","pepek","titit","toket",
          "babi","asu",
          "tai","bangke","bangkai",
          "lonte","pelacur",
          "coli","colmek","coly","colay","coliing",
          "ewe","ewek",
          "ngocok","masturbasi",
          "bokep","porn","porno","mesum"
    ];

    const bannedSoft = [
          "goblok","tolol","bodoh","dungu","idiot","bego",
          "kampret","brengsek","bajingan","keparat","laknat",
          "setan","sialan",
          "monyet","kunyuk",
          "sampah","gembel","murahan","pecundang",
          "busuk","jorok","dekil","burik",
          "kampungan","norak","alay","lebay",
          "sok","songong","angkuh",
          "bacot","gajelas",
          "sarap","ghendeng","geblek",
          "banci","bencong",
          "pantat","silit",
          "jelek"
    ];
    
    const cleanText = simplify(normalize(ucapan));

    let finalText = ucapan;

    for(let word of bannedHard){
      if(cleanText.includes(word)){
        alert("Mohon gunakan kata yang sopan 🙏");
      return;
      }
    }

    function censorWord(word){
    return `<span class="censored">${"*".repeat(word.length)}</span>`;
    }

    bannedSoft.forEach(word => {
    const regex = new RegExp(word, "gi");
    finalText = finalText.replace(regex, censorWord(word));
    });

    // tampil loading dulu
    const tempEl = addOptimisticUcapan(nama, status, jumlah, finalText);

    const btn = this.querySelector("button");
    btn.disabled = true;
    btn.innerText = "Mengirim...";

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
        body: JSON.stringify({ 
        nama, 
        jumlah, 
        status, 
        ucapan: finalText 
        }),
      });
      btn.disabled = false;
      btn.innerText = "Kirim Ucapan";

    
    } catch (err) {
      console.log("Gagal kirim");
      btn.disabled = false;
      btn.innerText = "Kirim Ucapan";
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