/*PASSWORTSCHUTZ*/
function checkPassword(){
  const pw = document.getElementById("pwInput").value;
  if(pw === "PortfolioDemo2026!*"){
    document.getElementById("passwordOverlay").style.display = "none";
  } else {
    alert("Falsches Passwort");
  }
}

/*NAVIGATION - bei aktiver Sektion fokussiert */
const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".site-nav a");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");

        navLinks.forEach(link => {
          link.classList.remove("active");

          if (link.getAttribute("href") === "#" + id) {
            link.classList.add("active");
          }
        });
      }
    });
  }, {
    rootMargin: "-50% 0px -50% 0px",
    threshold: 0
  });

  sections.forEach(section => {
    observer.observe(section);
  });

/*VIDEO-MODAL*/
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  const source = modalVideo.querySelector("source");
  const closeBtn = document.getElementById("videoClose");

  document.querySelectorAll("[data-video]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const videoSrc = btn.getAttribute("data-video");
      const shouldLoop = btn.getAttribute("data-loop");

      source.src = videoSrc;
      modalVideo.load();

      // Loop nur setzen, wenn gewünscht
      if (shouldLoop === "true") {
        modalVideo.loop = true;
        modalVideo.muted = true; // wichtig für autoplay
      } else {
        modalVideo.loop = false;
        modalVideo.muted = false;
      }

      modal.style.display = "flex";
      modalVideo.play();
    });
  });

  function closeModal(){
    modal.style.display = "none";
    modalVideo.pause();
    source.src = "";
    modalVideo.load();
  }

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });



/*BILD-MODAL*/
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeImage = document.getElementById("imageClose");
const prevBtn = document.getElementById("prevImg");
const nextBtn = document.getElementById("nextImg");

let images = [];
let currentIndex = 0;

document.querySelectorAll("[data-images]").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();

    images = btn.getAttribute("data-images").split(",");
    currentIndex = 0;

    showImage();
    imageModal.style.display = "flex";
  });
});

function showImage(){
  modalImage.src = images[currentIndex];
}

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % images.length;
  showImage();
});

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  showImage();
});

function closeImageModal(){
  imageModal.style.display = "none";
}

closeImage.addEventListener("click", closeImageModal);

imageModal.addEventListener("click", e => {
  if(e.target === imageModal){
    closeImageModal();
  }
});
