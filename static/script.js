const mobileToggle = document.querySelector(".mobile-toggle");
const navList = document.querySelector("nav ul");
const body = document.body;
const header = document.querySelector("header");
const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));

// Create backdrop overlay
const backdrop = document.createElement("div");
backdrop.className = "nav-backdrop";
document.body.appendChild(backdrop);

// Header scroll behavior: hide on scroll down, show on scroll up
let lastScrollY = window.scrollY;
let scrollThreshold = 100; // Minimum scroll distance before hiding header

function handleScroll() {
  const currentScrollY = window.scrollY;
  
  // Only hide/show if scrolled past threshold
  if (currentScrollY < scrollThreshold) {
    header.classList.remove("header-hidden");
    return;
  }
  
  // Scrolling down - hide header
  if (currentScrollY > lastScrollY) {
    header.classList.add("header-hidden");
  } 
  // Scrolling up - show header
  else if (currentScrollY < lastScrollY) {
    header.classList.remove("header-hidden");
  }
  
  lastScrollY = currentScrollY;
}

const navSections = navLinks
  .map((link) => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    return targetId ? document.getElementById(targetId) : null;
  })
  .filter(Boolean);

function setActiveNav(sectionId) {
  navLinks.forEach((link) => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    if (targetId === sectionId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function handleScrollSpy() {
  if (!navSections.length) return;
  const offset = (header?.offsetHeight || 0) + 6;
  const scrollPos = window.scrollY + offset;
  let currentId = navSections[0]?.id || null;

  navSections.forEach((section) => {
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      currentId = section.id;
    }
  });

  setActiveNav(currentId);
}

// Throttle scroll events for better performance
let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleScroll();
      handleScrollSpy();
      ticking = false;
    });
    ticking = true;
  }
});

function openMenu() {
  navList.classList.add("open");
  backdrop.classList.add("active");
  body.style.overflow = "hidden"; // Prevent body scroll when menu is open
}

function closeMenu() {
  navList.classList.remove("open");
  backdrop.classList.remove("active");
  body.style.overflow = ""; // Restore body scroll
}

mobileToggle.addEventListener("click", () => {
  if (navList.classList.contains("open")) {
    closeMenu();
  } else {
    openMenu();
  }
});

// Close menu when clicking backdrop
backdrop.addEventListener("click", closeMenu);

// Close menu when clicking nav links
navList.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    if (targetId) {
      setActiveNav(targetId);
    }
  });
});

const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
        entry.target.classList.add("animated");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealElements.forEach((el) => observer.observe(el));

// Add fade-in effect to section titles and intros
const fadeInElements = document.querySelectorAll(
  ".section-title, .section-intro, .section-subheading, .projects-tags, .projects-gallery, .clients-grid, .contact-section, .hero-content, .quick-links"
);

const fadeInObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-visible");
      } else {
        // Remove the class when element leaves viewport so it can fade in again
        entry.target.classList.remove("fade-in-visible");
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
);

fadeInElements.forEach((el) => {
  el.classList.add("fade-in");
  fadeInObserver.observe(el);
  
  // Check if element is already visible on page load
  const rect = el.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
  if (isVisible) {
    // Small delay to ensure smooth initial animation
    setTimeout(() => {
      el.classList.add("fade-in-visible");
    }, 100);
  }
});

function registerFadeIn(element) {
  element.classList.add("fade-in");
  fadeInObserver.observe(element);
}

handleScrollSpy();
window.addEventListener("resize", handleScrollSpy);

const contactForm = document.getElementById("contact-form");
const statusEl = contactForm?.querySelector(".form-status");
const projectsGrid = document.getElementById("projects-grid");
const projectFilterButtons = document.querySelectorAll(".project-filter");
const projectFilterMenu = document.querySelector(".project-filter-menu");
const projectFilterToggle = document.querySelector(".project-filter-toggle");
const projectFilterLabel = document.querySelector(".project-filter-label");

// Services counter for mobile horizontal scroll
const servicesGrid = document.querySelector(".services-grid");
const servicesCounter = document.querySelector(".services-counter");
const executivesGrid = document.querySelector(".executives-grid");
const execPrevBtn = document.querySelector(".executives-scroll-btn.exec-prev");
const execNextBtn = document.querySelector(".executives-scroll-btn.exec-next");

if (servicesGrid && servicesCounter) {
  const serviceCards = servicesGrid.querySelectorAll(".card");
  const totalServices = serviceCards.length;

  function updateServicesCounter() {
    // Only update on mobile (when services-grid is in flex mode)
    if (window.innerWidth <= 900 && totalServices > 0) {
      const gridRect = servicesGrid.getBoundingClientRect();
      const gridCenter = gridRect.left + gridRect.width / 2;
      
      let closestCard = null;
      let closestDistance = Infinity;
      
      serviceCards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - gridCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestCard = index + 1;
        }
      });
      
      if (closestCard) {
        servicesCounter.textContent = `${closestCard}/${totalServices}`;
      }
    }
  }

  // Update counter on scroll
  let scrollTimeout;
  servicesGrid.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateServicesCounter, 50);
  });

  // Update counter on resize
  window.addEventListener("resize", () => {
    updateServicesCounter();
  });

  // Initial update
  updateServicesCounter();
  
  // Update when cards become visible
  const servicesObserver = new IntersectionObserver(() => {
    updateServicesCounter();
  }, { root: servicesGrid, threshold: 0.5 });
  
  serviceCards.forEach(card => servicesObserver.observe(card));
}

if (executivesGrid && execPrevBtn && execNextBtn) {
  const getExecutiveStep = () => {
    const card = executivesGrid.querySelector(".card");
    const styles = window.getComputedStyle(executivesGrid);
    const gapValue = parseInt(styles.columnGap || styles.gap || "0", 10);
    return (card?.offsetWidth || 280) + gapValue;
  };

  const scrollExecutives = (direction) => {
    executivesGrid.scrollBy({
      left: direction * getExecutiveStep(),
      behavior: "smooth",
    });
  };

  execPrevBtn.addEventListener("click", () => scrollExecutives(-1));
  execNextBtn.addEventListener("click", () => scrollExecutives(1));

  function updateExecutiveButtons() {
    const isLaptop = window.innerWidth > 900 && window.innerWidth <= 1400;
    const maxScrollLeft = executivesGrid.scrollWidth - executivesGrid.clientWidth;
    const atStart = executivesGrid.scrollLeft <= 5;
    const atEnd = executivesGrid.scrollLeft >= maxScrollLeft - 5;

    execPrevBtn.style.display = isLaptop ? "flex" : "none";
    execNextBtn.style.display = isLaptop ? "flex" : "none";
    execPrevBtn.disabled = !isLaptop || atStart;
    execNextBtn.disabled = !isLaptop || atEnd;
  }

  executivesGrid.addEventListener("scroll", updateExecutiveButtons);
  window.addEventListener("resize", updateExecutiveButtons);
  updateExecutiveButtons();
}

if (projectsGrid) {
  const projectsData = [
    // WASH projects
    {
      src: "Images/Lilayi sports junction.mp4",
      alt: "Commercial project walkthrough",
      caption: "Commercial Project Walkthrough",
      categories: ["commercial"],
      type: "video"
    },
    { src: "Images/School ablution view.jpg", alt: "School ablution construction", caption: "School Ablution Construction", categories: ["wash"] },
    { src: "Images/School smaller ab.jpg", alt: "School ablution facility", caption: "School Ablution Facility", categories: ["wash"] },
    { src: "Images/Other school ab door side view.jpg", alt: "School ablution door side view", caption: "School Ablution - Door Side View", categories: ["wash"] },
    { src: "Images/Other school ab office.jpg", alt: "School ablution office", caption: "School Ablution Office", categories: ["wash"] },
    { src: "Images/Other school inside ab.jpg", alt: "School ablution interior", caption: "School Ablution Interior", categories: ["wash"] },
    { src: "Images/Tank stand.jpg", alt: "Tank stand fitting", caption: "Tank Stand Installation", categories: ["wash"] },
    { src: "Images/Tank stand room.jpg", alt: "Tank stand room", caption: "Tank Stand Room", categories: ["wash"] },
    { src: "Images/Regular tank stand.jpg", alt: "Regular tank stand", caption: "Regular Tank Stand", categories: ["wash"] },
    { src: "Images/Regular tank stand with tanks.png", alt: "Tank stand with tanks", caption: "Tank Stand with Tanks", categories: ["wash"] },
    { src: "Images/Pipe work septic thing.jpg", alt: "Water reticulation pipes", caption: "Water & Sewer Reticulation", categories: ["wash"] },
    { src: "Images/Pipework digging.jpg", alt: "Pipework excavation", caption: "Pipework Excavation", categories: ["wash"] },
    // School projects
    { src: "Images/School construction side view.jpg", alt: "School construction side view", caption: "School Construction - Side View", categories: ["school"] },
    { src: "Images/Yellow school front.png", alt: "Yellow school building front", caption: "School Building - Front View", categories: ["school"] },
    { src: "Images/Yellow school inside.png", alt: "Yellow school interior", caption: "School Building - Interior", categories: ["school"] },
    // Biogas
    { src: "Images/Biodigester.jpg", alt: "Biodigester installation", caption: "Biodigester Installation", categories: ["biogas"] },
    // Renovations / Commercial
    
    { src: "Images/Renovations wide room.png", alt: "Renovated interior", caption: "Corporate Interior Fit-Out", categories: ["renovations", "commercial"] },
    { src: "Images/Renovations stairs.png", alt: "Renovated stairs", caption: "Interior Renovation - Stairs", categories: ["renovations", "commercial"] },
    
    // Residential
    { src: "Images/Unfinished house fence.jpg", alt: "House construction fence", caption: "Residential Construction - Fence", categories: ["residential"] },
    { src: "Images/Unfinished house garage side.jpg", alt: "House garage construction", caption: "Residential Construction - Garage", categories: ["residential"] },
    { src: "Images/Unfinished house tank side.jpg", alt: "House tank installation", caption: "Residential Construction - Tank Side", categories: ["residential"] },
  ];

  function renderProjects(filter = "all") {
    projectsGrid.innerHTML = "";

    const fragment = document.createDocumentFragment();
    projectsData
      .filter((item) => filter === "all" || item.categories.includes(filter))
      .forEach((item) => {
        const card = document.createElement("div");
        card.className = "gallery-item";

        let media;

        if (item.type === "video") {
          media = document.createElement("video");
          media.src = item.src;
        
          media.autoplay = true;
          media.loop = true;
        
          media.muted = true;
          media.playsInline = true;
        }
         else {
      media = document.createElement("img");
      media.src = item.src;
      media.alt = item.alt;
    }

media.style.width = "100%";


        const overlay = document.createElement("div");
        overlay.className = "gallery-overlay";

        const caption = document.createElement("p");
        caption.className = "gallery-caption";
        caption.textContent = item.caption;

        overlay.appendChild(caption);
        card.appendChild(media);
        card.appendChild(overlay);

        fragment.appendChild(card);
      });

    projectsGrid.appendChild(fragment);
  }

  projectFilterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      projectFilterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const selected = btn.getAttribute("data-filter") || "all";
      if (projectFilterLabel) {
        projectFilterLabel.textContent = btn.textContent.trim();
      }
      renderProjects(selected);
      projectFilterMenu?.classList.remove("open");
      if (projectFilterToggle) {
        projectFilterToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  if (projectFilterToggle && projectFilterMenu) {
    projectFilterToggle.addEventListener("click", () => {
      const isOpen = projectFilterMenu.classList.toggle("open");
      projectFilterToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (!projectFilterMenu.contains(e.target) && !projectFilterToggle.contains(e.target)) {
        projectFilterMenu.classList.remove("open");
        projectFilterToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        projectFilterMenu.classList.remove("open");
        projectFilterToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  renderProjects("all");
}

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!statusEl) return;

  statusEl.textContent = "Sending...";
  statusEl.className = "form-status";

  const formData = {
    name: contactForm.name.value.trim(),
    email: contactForm.email.value.trim(),
    subject: contactForm.subject.value.trim(),
    message: contactForm.message.value.trim(),
  };

  try {
    const response = await fetch("/.netlify/functions/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    contactForm.reset();
    statusEl.textContent = "Thank you! Your message has been sent.";
    statusEl.classList.add("success");
  } catch (error) {
    console.error("Contact form error:", error);
    statusEl.textContent =
      "Sorry, we couldn't send your message. Please try again.";
    statusEl.classList.add("error");
  }
});

