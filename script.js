/* ======================
   🎯 GLOBAL VARIABLE
====================== */
let currentIndex = 0;
let images = [];
let sliderInterval;
let index = 0;
let allUcapan = [];
let lastSubmitTime = 0;
let isLoading = false;
let refreshInterval;
let offset = 0;
const LIMIT = 20;
let hasMore = true;
let lastLoadTime = 0;
let scrollTimeout;
let isSubmitting = false;

const renderedIds = new Set();
const SUBMIT_DELAY = 5000;
const SCRIPT_URL = DATA.config.scriptURL;
const allowedOrigin = DATA.config.origin;
const isMobile = /Mobi|Android/i.test(navigator.userAgent);


/* ======================
   🎯 ERROR HANDLER
====================== */
window.addEventListener("error", function(e){
  console.log("JS Error:", e.message);
});

/* ======================
   🔒 VALIDASI CONFIG
====================== */
if(typeof DATA === "undefined"){
  showToast("Config tidak ditemukan❌", "error");
  throw new Error("DATA undefined");
}

if(!DATA.config || !DATA.config.scriptURL){
  showToast("Config tidak lengkap ❌", "error");
  throw new Error("Config invalid");
}

/* ======================
   🎯 OPEN INVITATION
====================== */
function openInvitation(){
  const opening = document.getElementById("opening");

  opening.classList.add("fade-out");

  setTimeout(() => {
    opening.style.display = "none";

    const music = document.getElementById("music");
    music.play().catch(() => {});
  }, 800);
}

/* ======================
   🎯 COPY REKENING
====================== */
function copyRekening(nomor){
  navigator.clipboard.writeText(nomor);
  showToast("Nomor berhasil disalin", "success");
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
    const slideWidth = slides.querySelector("img").offsetWidth + 15;
    slides.style.transform = `translateX(-${index * slideWidth}px)`;

    if(index >= loopImages.length - images.length){
      setTimeout(() => {
        slides.style.transition = "none";
        index = images.length;
        const slideWidth = slides.querySelector("img").offsetWidth + 15;
        slides.style.transform = `translateX(-${index * slideWidth}px)`;
      }, 600);
    }

 }, isMobile ? 4000 : 2500);
}

/* ======================
   🎯 LOAD UCAPAN
====================== */
async function loadUcapan(){

  // 🔥 CEGAH TABRAKAN REQUEST
  if(isLoading) return;
  isLoading = true;

  const loader = document.getElementById("loading-more");

  if(loader){
  loader.innerText = "⏳ Memuat data...";
  }

  let localTimeout;

  try{
    const controller = new AbortController();
    localTimeout = setTimeout(() => controller.abort(), 7000);

    if(loader) loader.style.display = "block";

    const res = await fetch(`${SCRIPT_URL}?limit=${LIMIT}&offset=${offset}`, {
      signal: controller.signal,
    });

    if(!res.ok){
      throw new Error("HTTP error");
    }

    clearTimeout(localTimeout);

    let data = await res.json();

    if(!Array.isArray(data)){
      console.log("Format data salah:", data);
      return;
    }

    data = data.map(item => ({
      nama: item.nama || item.Nama,
      jumlah: item.jumlah || item["Jumlah Tamu"],
      status: item.status || item.Kehadiran,
      ucapan: item.ucapan || item.Ucapan
    }));

    data = data.filter(item => item.nama && item.ucapan);

    if(offset === 0){
      renderedIds.clear();
      }

    offset += data.length;

    if(data.length < LIMIT){
      hasMore = false;
    }

    if(!hasMore){
    if(loader){
      loader.style.display = "block";
      loader.innerText = "Semua ucapan sudah ditampilkan 🎉";
      }
    }

    allUcapan = [...allUcapan, ...data];

    if(allUcapan.length > (isMobile ? 50 : 100)){
      allUcapan = allUcapan.slice(allUcapan.length - (isMobile ? 50 : 100));
    }
    
    renderUcapan();

  } catch(err){
    if(err.name === "AbortError"){
      console.log("Request timeout");
    } else {
      showToast("Gagal memuat ucapan", "warning");
    }
  } finally {
    if(loader && hasMore){
      loader.style.display = "none";
      loader.innerText = "⏳ Memuat data...";
    }
    clearTimeout(localTimeout);
    isLoading = false;
  }
}

/* ======================
   🎯 RENDER
====================== */
function renderUcapan(){
  const container = document.getElementById("ucapan-list");
  if(!container) return;

  const existing = container.querySelectorAll(".ucapan-item").length;

  allUcapan.slice(existing).forEach(item => {
    if(!item.nama || !item.ucapan) return;
  
    const id = generateId(item.nama, item.ucapan, item.jumlah);

    if(renderedIds.has(id)) return;
    renderedIds.add(id);

    const el = document.createElement("div");
    el.classList.add("ucapan-item", "new-item");
    el.style.borderLeft = "3px solid #60a5fa";
    el.style.transition = "border-left 0.5s ease";
    setTimeout(() => {
      el.style.borderLeft = "3px solid transparent";
    }, 3000);

    el.innerHTML = `
      <b>${escapeHTML(item.nama)}</b> 
      (${escapeHTML(item.status)} - ${escapeHTML(item.jumlah)} orang)
      <br>${escapeHTML(item.ucapan)}
    `;

    container.appendChild(el);
  });
}

/* ======================
   🎯 OPTIMISTIC UI
====================== */
function addOptimisticUcapan(nama, status, jumlah, finalText){
  const container = document.getElementById("ucapan-list");
  if(!container) return;

  const el = document.createElement("div");
  el.classList.add("ucapan-item", "sending-item");

  const id = generateId(nama, finalText, jumlah);
  renderedIds.add(id);

  el.dataset.nama = nama;
  el.dataset.ucapan = finalText; // ✅ FIX

  el.innerHTML = `
  <b>${escapeHTML(nama)}</b> (${escapeHTML(status)} - ${escapeHTML(jumlah)} orang)
  <br>${escapeHTML(finalText)}
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
    .replace(/(.)\1+/g, "$1")
}

/* ======================
   🎯 ESCAPE HTML
====================== */
function escapeHTML(str){
  if(!str) return "";
  return String(str).replace(/[&<>"']/g, function(m){
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

/* ======================
   🎯 GENERATE ID
====================== */
function generateId(nama, ucapan, jumlah){
  const raw = `${nama}_${ucapan}_${jumlah}`;
  
  let hash = 0;
  for(let i = 0; i < raw.length; i++){
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }

  return hash.toString();
}

/* ======================
   🎯 TOGGLE MUSIC
====================== */
function toggleMusic(){
  const music = document.getElementById("music");
  const btn = document.getElementById("music-control");

  if(music.paused){
    music.play();
    btn.innerHTML = "⏸️";
    btn.classList.add("playing");
  } else {
    music.pause();
    btn.innerHTML = "▶️";
    btn.classList.remove("playing");
  }
}

/* ======================
   🎯 LOAD MORE
====================== */
function startAutoRefresh(){
  if(refreshInterval !== null) return;

  refreshInterval = setInterval(() => {

    loadUcapan();

  }, DATA.config.refreshInterval);
}

function stopAutoRefresh(){
  clearInterval(refreshInterval);
  refreshInterval = null;
}

document.addEventListener("visibilitychange", () => {
  if(document.hidden){
    stopAutoRefresh();
  } else {
    startAutoRefresh();
  }
});

/* ======================
   🎯 TOAST NOTIFICATION
====================== */
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if(!container) return;

  const maxToast = 3;
  if(container.children.length >= maxToast){
    container.removeChild(container.firstChild);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ======================
   🎯 RESET SUBMIT
====================== */
function resetSubmit(btn){
  btn.disabled = false;
  btn.innerText = "Kirim Ucapan";
  isSubmitting = false;
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

  /* TITLE */
  document.title = DATA.pasangan.pria + " & " + DATA.pasangan.wanita + " Wedding";

  /* META */
  document.getElementById("meta-desc").setAttribute(
  "content",
  "Undangan pernikahan " + DATA.pasangan.pria + " & " + DATA.pasangan.wanita
  );

  /* MUSIC */
  document.getElementById("music").src = DATA.media.musik;

  /* HERO */
  const heroImage = DATA.media.hero;

  document.querySelector(".hero").style.background =
    `url(${heroImage}) center/cover`;

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
  
  // 🎯 MODE ADAPTIVE (MOBILE vs DESKTOP)
  images = isMobile 
    ? DATA.media.galeri.slice(0, 5) // mobile cuma 8 gambar
    : DATA.media.galeri;

  // 🔥 SLIDER LEBIH RINGAN
  window.loopImages = isMobile
  ? [...images]
  : [...images, ...images];

  loopImages.forEach((img, i) => {
    slides.innerHTML += `
      <img 
        src="${img}" 
        loading="lazy"
        data-index="${i % images.length}" 
        draggable="false">
    `;
   });

  index = images.length;
  const slideWidth = slides.querySelector("img").offsetWidth + 15;
  slides.style.transform = `translateX(-${index * slideWidth}px)`;

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

    if(isSubmitting){
      showToast("Sedang diproses...", "warning");
    return;
    }
    isSubmitting = true;

    // 🔒 VALIDASI ORIGIN
    if(!window.location.origin.includes("k-anwar.github.io")){
    showToast("Akses tidak valid ❌", "error");
    isSubmitting = false;
    return;
    }

    // 🔥 VALIDASI
    if(!nama || !jumlah || !status || !ucapan){
      showToast("Mohon isi semua data 🙏", "warning");
      isSubmitting = false;
      return;
    }

    if(nama.length < 2){
      showToast("Nama terlalu pendek 🙏", "warning");
      isSubmitting = false;
      return;
    }

    if(nama.length > 30){
      showToast("Nama terlalu panjang 🙏", "warning");
      isSubmitting = false;
      return;
    }

    if(ucapan.length < 5){
      showToast("Ucapan terlalu pendek 🙏", "warning");
      isSubmitting = false;
      return;
    }

    if(ucapan.length > 200){
      showToast("Ucapan terlalu panjang 🙏", "warning");
      isSubmitting = false;
      return;
    }

    // 🔒 ANTI LINK SPAM
    if(/http|www|\.com/i.test(ucapan)){
      showToast("Tidak boleh mengandung link 🙏", "warning");
      isSubmitting = false;
      return;
    }

    // 🔥 ANTI SPAM DELAY
    const now = Date.now();
    if(now - lastSubmitTime < SUBMIT_DELAY){
      showToast("Tunggu beberapa detik 🙏", "warning");
      isSubmitting = false;
      return;
    }
    lastSubmitTime = now;

      // 🔥 ANTI DUPLIKAT
    const recent = allUcapan.slice(0, 5);
    const spamCheck = recent.some(item =>
      item.nama === nama && item.ucapan === ucapan
    );
    if(spamCheck){
      showToast("Ucapan sudah pernah dikirim 🙏", "warning");
      isSubmitting = false;
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
        showToast("Mohon gunakan kata yang sopan 🙏", "warning");
        isSubmitting = false;
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
    if(!tempEl) return;

    const btn = this.querySelector("button");
    btn.disabled = true;
    btn.innerText = "Mengirim...";

    const list = document.getElementById("ucapan-list");
    if(list){
      list.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    const notif = document.getElementById("notif");
    notif.classList.add("show");

    setTimeout(() => {
      notif.classList.remove("show");
    }, 3000);


    this.reset();

    // kirim ke server
    try {
      const res = await fetch(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({ 
          nama, 
          jumlah, 
          status, 
          ucapan: finalText,
          ip: nama + "_" + Date.now(),
          origin: window.location.origin
        }),   
    });

    if(!res.ok){
      throw new Error("HTTP error submit");
     }

    let result = {};

    try {
      result = await res.json();
    } catch {
      tempEl.remove();
      showToast("Server tidak merespon ❌", "error");

      resetSubmit(btn);
      return;
    }

  // 🔥 CEK RESPONSE BACKEND
  if(result.result === "spam"){
    tempEl.remove();
    showToast("Terlalu cepat mengirim 🙏", "warning");
    resetSubmit(btn);
    return;
  }

  if(result.result === "forbidden"){
    tempEl.remove();
    showToast("Akses ditolak ❌", "error");
    resetSubmit(btn);
    return;
  }

  if(result.result && result.result !== "success"){
    tempEl.remove();
    showToast("Gagal mengirim ❌", "error");
    resetSubmit(btn);
    return;
  }

  // ✅ sukses

  setTimeout(() => {
  if(tempEl){
    tempEl.classList.remove("sending-item");
    tempEl.classList.add("sent-item");

    const status = tempEl.querySelector(".status");
    if(status){
      status.innerText = "✔ Terkirim";
      status.classList.remove("sending");
      status.classList.add("sent");
    }
  }
}, 500);

  resetSubmit(btn);

} catch (err) {
  tempEl.remove();
  showToast("Gagal mengirim, cek koneksi atau coba lagi 🙏", "warning");
  console.log(err);

  resetSubmit(btn);
}

  });

  loadUcapan();
  startAutoRefresh();

  /* ======================
   🎯 SCROLL REVEAL
====================== */
function initReveal(){

  const elements = document.querySelectorAll(".section");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("active");
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -80px 0px"
  });

  elements.forEach(el => {
    el.classList.add("reveal");
    observer.observe(el);
  });

}
initReveal();

/* ======================
   🎯 PARALLAX MOUSE (3D EFFECT)
====================== */
if(!isMobile){
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;

    document.querySelectorAll(".dark").forEach(el => {
      el.style.transform = `rotateX(${ -y }deg) rotateY(${ x }deg)`;
    });
  });
}

/* ======================
   🎯 SPARKLE EFFECT
====================== */
function createSparkle(){
  const container = document.getElementById("sparkle-container");

  const el = document.createElement("div");
  el.classList.add("sparkle");

  el.style.left = Math.random() * 100 + "vw";
  el.style.animationDuration = (Math.random() * 3 + 2) + "s";
  el.style.width = el.style.height = (Math.random() * 4 + 3) + "px";
  el.style.opacity = Math.random();
  el.style.background = "rgba(255,255,255,0.8)";

  container.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 5000);
}

/* NOTE: efek ini cukup berat, jadi hanya aktif di desktop dengan interval agak lama */ 
/*if(window.innerWidth > 768){
setInterval(createSparkle, 300);
} */ // untuk mengaktifkan sparkle, bisa di-uncomment

/* ======================
    🎯 PETAL EFFECT
====================== */
function createPetal(){
  const container = document.getElementById("sparkle-container");

  const petal = document.createElement("div");
  petal.classList.add("petal");

  petal.style.left = Math.random() * 100 + "vw";
  petal.style.animationDuration = (Math.random() * 5 + 5) + "s";
  petal.style.opacity = Math.random();

  container.appendChild(petal);

  setTimeout(() => {
    petal.remove();
  }, 10000);
}

if(!isMobile){
  setInterval(createPetal, 1200); // lebih ringan
} // untuk mengaktifkan petal, bisa di-uncomment


window.addEventListener("load", () => {
  const loader = document.getElementById("loading-screen");

  setTimeout(() => {
    loader.classList.add("fade-out");

    setTimeout(() => {
      loader.style.display = "none";
    }, 1000);

  }, 1500);
});

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

  const elDays = document.getElementById("days");
  const elHours = document.getElementById("hours");
  const elMinutes = document.getElementById("minutes");
  const elSeconds = document.getElementById("seconds");

  if(!elDays || !elHours || !elMinutes || !elSeconds) return;

  elDays.innerText =
    Math.floor(distance / (1000 * 60 * 60 * 24));

  elHours.innerText =
    Math.floor((distance / (1000 * 60 * 60)) % 24);

  elMinutes.innerText =
    Math.floor((distance / (1000 * 60)) % 60);

  elSeconds.innerText =
    Math.floor((distance / 1000) % 60);

  }, 1000);

/* ======================
   🎯 INFINITE SCROLL
====================== */
window.addEventListener("scroll", () => {

  if(scrollTimeout) return;

  scrollTimeout = setTimeout(() => {

    const scrollY = window.scrollY;
    const hero = document.querySelector(".hero");
    if(hero){
      hero.style.backgroundPositionY = scrollY * 0.5 + "px";
    }

    if(!hasMore || isLoading){
      scrollTimeout = null;
      return;
    }

    const now = Date.now();
    if(now - lastLoadTime < 1000) return;
    lastLoadTime = now;

    const scrollPosition = window.innerHeight + window.scrollY;
    const triggerPoint = document.body.offsetHeight - 200;

    if(scrollPosition >= triggerPoint){
      loadUcapan();
    }

    scrollTimeout = null;

  }, 100); 

}, { passive: true });