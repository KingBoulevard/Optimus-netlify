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
  // New Categories Mapping
  const categoriesMap = {
    "school-infrastructure": "School Infrastructure",
    "wash-projects": "WASH Projects",
    "residential": "Residential",
    "renovations": "Renovations",
    "bio-gas-digestor": "Bio Gas Digestor"
  };

  const projectsData = [
    // Renovations (including former commercial items)
    {
      src: "Images/Lilayi sports junction.mp4",
      alt: "Commercial project walkthrough",
      caption: "Commercial Project Walkthrough",
      categories: ["renovations"],
      projectGroup: "Commercial Complex",
      type: "video"
    },
    {
      src: "Images/Renovations wide room.png",
      alt: "Renovated interior",
      caption: "Corporate Interior Fit-Out",
      categories: ["renovations"],
      projectGroup: "House Renovation",
      client: "Various Corporate Clients"
    },
    {
      src: "Images/Renovations stairs.png",
      alt: "Renovated stairs",
      caption: "Interior Renovation - Stairs",
      categories: ["renovations"],
      projectGroup: "House Renovation",
      client: "Various Corporate Clients"
    },

    // School Infrastructure – Kawama computer lab (PEAS)
    {
      src: "Images/comp lab out.jpg",
      alt: "Computer lab exterior at Kawama Secondary School",
      caption: "Computer lab exterior – Kawama Secondary School, Ndola",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of computer lab at Kawama secondary school, Ndola.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/comp lab out 2.jpg",
      alt: "Computer lab front elevation at Kawama Secondary School",
      caption: "Front elevation – Kawama Secondary School computer lab",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of computer lab at Kawama secondary school, Ndola.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/comp lab 2.jpg",
      alt: "Computer lab construction works at Kawama Secondary School",
      caption: "Construction progress – Kawama Secondary School computer lab",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of computer lab at Kawama secondary school, Ndola.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/comp lab 3.jpg",
      alt: "Completed computer lab at Kawama Secondary School",
      caption: "Completed computer lab – Kawama Secondary School, Ndola",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of computer lab at Kawama secondary school, Ndola.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/Comp lab kawama school.jpg",
      alt: "Computer lab block at Kawama Secondary School",
      caption: "Computer lab block – Kawama Secondary School, Ndola",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of computer lab at Kawama secondary school, Ndola.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/comp lab also.png",
      alt: "Interior of computer lab at Kawama Secondary School",
      caption: "Interior view – Kawama Secondary School computer lab",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of computer lab at Kawama secondary school, Ndola.",
      client: "PEAS Zambia Ltd"
    },

    // School Infrastructure – Kampinda boys dormitory (PEAS)
    {
      src: "Images/boys dorm.jpg",
      alt: "Boys dormitory at Kampinda Secondary School",
      caption: "Boys dormitory – Kampinda Secondary School, Kasama",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of boys dormitory at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/boys dorm 2.jpg",
      alt: "Boys dormitory side view at Kampinda Secondary School",
      caption: "Side elevation – Kampinda Secondary School boys dormitory",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of boys dormitory at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/boys dorm 3.jpg",
      alt: "Boys dormitory construction progress at Kampinda Secondary School",
      caption: "Construction progress – Kampinda Secondary School boys dormitory",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of boys dormitory at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/boys dorm 4.jpg",
      alt: "Completed boys dormitory at Kampinda Secondary School",
      caption: "Completed boys dormitory – Kampinda Secondary School, Kasama",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of boys dormitory at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/boys dorm 5.jpg",
      alt: "Boys dormitory exterior at Kampinda Secondary School",
      caption: "Exterior view – Kampinda boys dormitory",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of boys dormitory at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/boys dorm 6.jpg",
      alt: "Wide view of boys dormitory at Kampinda Secondary School",
      caption: "Wide view – Kampinda Secondary School boys dormitory",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of boys dormitory at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/boys dorm inside.jpg",
      alt: "Interior of boys dormitory at Kampinda Secondary School",
      caption: "Dormitory interior – Kampinda Secondary School",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of boys dormitory at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/boys dorm kampinda 1.jpg",
      alt: "Boys dormitory entrance at Kampinda Secondary School",
      caption: "Dormitory entrance – Kampinda Secondary School, Kasama",
      categories: ["school-infrastructure"],
      projectGroup: "Construction of boys dormitory at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },

    // WASH – Kampinda Secondary School ablutions (PEAS)
    {
      src: "Images/kamp ablution 2.jpg",
      alt: "Ablution block at Kampinda Secondary School",
      caption: "Ablution block – Kampinda Secondary School, Kasama",
      categories: ["wash-projects"],
      projectGroup: "Construction of staff & boys/girls ablution at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/kampinda ablution 1.jpg",
      alt: "Kampinda Secondary School ablution facility",
      caption: "Staff and learners’ ablution – Kampinda Secondary School, Kasama",
      categories: ["wash-projects"],
      projectGroup: "Construction of staff & boys/girls ablution at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/kamp ab 3.jpg",
      alt: "Kampinda Secondary School ablution under construction",
      caption: "Construction works – Kampinda Secondary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of staff & boys/girls ablution at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/kamp ab 4.jpg",
      alt: "Side elevation of Kampinda Secondary School ablution",
      caption: "Side elevation – Kampinda Secondary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of staff & boys/girls ablution at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/kamp ab 5.jpg",
      alt: "Completed ablution block at Kampinda Secondary School",
      caption: "Completed ablution block – Kampinda Secondary School, Kasama",
      categories: ["wash-projects"],
      projectGroup: "Construction of staff & boys/girls ablution at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },
    {
      src: "Images/kamp ab again.jpg",
      alt: "Alternate view of Kampinda Secondary School ablution block",
      caption: "Alternate view – Kampinda Secondary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of staff & boys/girls ablution at Kampinda secondary school, Kasama.",
      client: "PEAS Zambia Ltd"
    },

    // WASH – Kamanga Primary School ablutions (BORDA)
    {
      src: "Images/kamanga ablution.jpg",
      alt: "Ablution block at Kamanga Primary School",
      caption: "Ablution block – Kamanga Primary School",
      categories: ["wash-projects"],
      projectGroup: "Construction of ablution block at Kamanga primary school.",
      client: "BORDA Zambia"
    },
    {
      src: "Images/kamanga ab 1.jpg",
      alt: "Kamanga Primary School ablution side view",
      caption: "Side elevation – Kamanga Primary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of ablution block at Kamanga primary school.",
      client: "BORDA Zambia"
    },
    {
      src: "Images/kamanga ab 2.jpg",
      alt: "Kamanga Primary School ablution construction",
      caption: "Construction works – Kamanga Primary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of ablution block at Kamanga primary school.",
      client: "BORDA Zambia"
    },
    {
      src: "Images/kam ab 3.jpg",
      alt: "Kamanga Primary School ablution internal view",
      caption: "Internal finishes – Kamanga Primary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of ablution block at Kamanga primary school.",
      client: "BORDA Zambia"
    },
    {
      src: "Images/kam ab 4.jpg",
      alt: "Kamanga Primary School ablution external view",
      caption: "External view – Kamanga Primary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of ablution block at Kamanga primary school.",
      client: "BORDA Zambia"
    },
    {
      src: "Images/kam ab 5.jpg",
      alt: "Kamanga Primary School ablution block with surroundings",
      caption: "Site context – Kamanga Primary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of ablution block at Kamanga primary school.",
      client: "BORDA Zambia"
    },
    {
      src: "Images/kam ab 6.jpg",
      alt: "Kamanga Primary School ablution rear view",
      caption: "Rear elevation – Kamanga Primary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of ablution block at Kamanga primary school.",
      client: "BORDA Zambia"
    },

    // WASH – Chipata Primary School ablutions (BORDA)
    {
      src: "Images/chipata ab.jpg",
      alt: "Ablution block at Chipata Primary School",
      caption: "Ablution block – Chipata Primary School, Lusaka",
      categories: ["wash-projects"],
      projectGroup: "Construction of Ablution block for boys/girls and staff at Chipata primary school, Lusaka.",
      client: "BORDA Zambia"
    },
    {
      src: "Images/chip ab 2.jpg",
      alt: "Chipata Primary School ablution block side view",
      caption: "Side elevation – Chipata Primary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of Ablution block for boys/girls and staff at Chipata primary school, Lusaka.",
      client: "BORDA Zambia"
    },
    {
      src: "Images/chip ab 3.jpg",
      alt: "Chipata Primary School ablution construction",
      caption: "Construction works – Chipata Primary School ablution",
      categories: ["wash-projects"],
      projectGroup: "Construction of Ablution block for boys/girls and staff at Chipata primary school, Lusaka.",
      client: "BORDA Zambia"
    },

    // WASH – Water kiosks & water reticulation in Makululu (Habitat for Humanity)
    {
      src: "Images/Tank stand.jpg",
      alt: "Elevated tank stand for water kiosks in Makululu",
      caption: "Elevated tank stand – Makululu water kiosks project, Kabwe",
      categories: ["wash-projects"],
      projectGroup: "Construction of 5 water kiosks and water reticulation in Makululu compound, Kabwe.",
      client: "Habitat for Humanity Zambia"
    },
    {
      src: "Images/Tank stand room.jpg",
      alt: "Tank stand control room in Makululu",
      caption: "Tank stand control room – Makululu water kiosks project",
      categories: ["wash-projects"],
      projectGroup: "Construction of 5 water kiosks and water reticulation in Makululu compound, Kabwe.",
      client: "Habitat for Humanity Zambia"
    },
    {
      src: "Images/Regular tank stand.jpg",
      alt: "Water tank stand structure in Makululu",
      caption: "Water tank stand – Makululu water reticulation",
      categories: ["wash-projects"],
      projectGroup: "Construction of 5 water kiosks and water reticulation in Makululu compound, Kabwe.",
      client: "Habitat for Humanity Zambia"
    },
    {
      src: "Images/Regular tank stand with tanks.png",
      alt: "Tank stand with mounted water tanks in Makululu",
      caption: "Tank stand with tanks – Makululu water kiosks project",
      categories: ["wash-projects"],
      projectGroup: "Construction of 5 water kiosks and water reticulation in Makululu compound, Kabwe.",
      client: "Habitat for Humanity Zambia"
    },
    {
      src: "Images/Pipe work septic thing.jpg",
      alt: "Water and sewer reticulation pipework in Makululu",
      caption: "Water reticulation pipework – Makululu compound, Kabwe",
      categories: ["wash-projects"],
      projectGroup: "Construction of 5 water kiosks and water reticulation in Makululu compound, Kabwe.",
      client: "Habitat for Humanity Zambia"
    },
    {
      src: "Images/Pipework digging.jpg",
      alt: "Excavation for water reticulation pipelines in Makululu",
      caption: "Excavation works – Makululu water reticulation project",
      categories: ["wash-projects"],
      projectGroup: "Construction of 5 water kiosks and water reticulation in Makululu compound, Kabwe.",
      client: "Habitat for Humanity Zambia"
    },

    // Residential – 2 bedroom house, Shimabala, Lusaka
    {
      src: "Images/2 bed.jpg",
      alt: "2 bedroom house in Shimabala during construction",
      caption: "Construction of 2 bedroom house – Shimabala, Lusaka",
      categories: ["residential"],
      projectGroup: "Construction of 2 bedroom house in Shimabala, Lusaka"
    },
    {
      src: "Images/2 bed 2.jpg",
      alt: "Side view of 2 bedroom house in Shimabala",
      caption: "Side elevation – 2 bedroom house, Shimabala",
      categories: ["residential"],
      projectGroup: "Construction of 2 bedroom house in Shimabala, Lusaka"
    },
    {
      src: "Images/2 bed 3.jpg",
      alt: "Front view of 2 bedroom house in Shimabala",
      caption: "Front elevation – 2 bedroom house, Shimabala",
      categories: ["residential"],
      projectGroup: "Construction of 2 bedroom house in Shimabala, Lusaka"
    },
    {
      src: "Images/2 bed 4.jpg",
      alt: "2 bedroom house internal view in Shimabala",
      caption: "Internal finishes – 2 bedroom house, Shimabala",
      categories: ["residential"],
      projectGroup: "Construction of 2 bedroom house in Shimabala, Lusaka"
    },
    {
      src: "Images/2 bed 5.jpg",
      alt: "Progress shot of 2 bedroom house in Shimabala",
      caption: "Construction progress – 2 bedroom house, Shimabala",
      categories: ["residential"],
      projectGroup: "Construction of 2 bedroom house in Shimabala, Lusaka"
    },
    {
      src: "Images/2 bed 6.jpg",
      alt: "Roofing works on 2 bedroom house in Shimabala",
      caption: "Roofing works – 2 bedroom house, Shimabala",
      categories: ["residential"],
      projectGroup: "Construction of 2 bedroom house in Shimabala, Lusaka"
    },
    {
      src: "Images/2 bed 7.jpg",
      alt: "Completed 2 bedroom house in Shimabala",
      caption: "Completed 2 bedroom house – Shimabala, Lusaka",
      categories: ["residential"],
      projectGroup: "Construction of 2 bedroom house in Shimabala, Lusaka"
    },
    {
      src: "Images/2 bed house.jpg",
      alt: "Perspective of 2 bedroom house in Shimabala",
      caption: "Perspective view – 2 bedroom house, Shimabala, Lusaka",
      categories: ["residential"],
      projectGroup: "Construction of 2 bedroom house in Shimabala, Lusaka"
    },

    // Residential – 4 bedroom house, Ibex Hill
    {
      src: "Images/4 bed.jpg",
      alt: "4 bedroom house in Ibex Hill under construction",
      caption: "Construction of 4 bedroom house – Ibex Hill",
      categories: ["residential"],
      projectGroup: "Construction of 4 bedroom house in Ibex Hill"
    },
    {
      src: "Images/4 bed 1.jpg",
      alt: "Front view of 4 bedroom house in Ibex Hill",
      caption: "Front elevation – 4 bedroom house, Ibex Hill",
      categories: ["residential"],
      projectGroup: "Construction of 4 bedroom house in Ibex Hill"
    },
    {
      src: "Images/4 bed 2.jpg",
      alt: "Side view of 4 bedroom house in Ibex Hill",
      caption: "Side elevation – 4 bedroom house, Ibex Hill",
      categories: ["residential"],
      projectGroup: "Construction of 4 bedroom house in Ibex Hill"
    },
    {
      src: "Images/4 bed 3.jpg",
      alt: "4 bedroom house structure in Ibex Hill",
      caption: "Structural works – 4 bedroom house, Ibex Hill",
      categories: ["residential"],
      projectGroup: "Construction of 4 bedroom house in Ibex Hill"
    },
    {
      src: "Images/4 bed 4.jpg",
      alt: "Roofing works on 4 bedroom house in Ibex Hill",
      caption: "Roofing works – 4 bedroom house, Ibex Hill",
      categories: ["residential"],
      projectGroup: "Construction of 4 bedroom house in Ibex Hill"
    },
    {
      src: "Images/4 bed 5.jpg",
      alt: "Completed 4 bedroom house in Ibex Hill",
      caption: "Completed 4 bedroom house – Ibex Hill",
      categories: ["residential"],
      projectGroup: "Construction of 4 bedroom house in Ibex Hill"
    },
    {
      src: "Images/4 bed 6.jpg",
      alt: "4 bedroom house and landscaping in Ibex Hill",
      caption: "Exterior and landscaping – 4 bedroom house, Ibex Hill",
      categories: ["residential"],
      projectGroup: "Construction of 4 bedroom house in Ibex Hill"
    },
    {
      src: "Images/Unfinished house fence.jpg",
      alt: "Perimeter fence for residential project in Ibex Hill",
      caption: "Perimeter fence – 4 bedroom house, Ibex Hill",
      categories: ["residential"],
      projectGroup: "Construction of 4 bedroom house in Ibex Hill"
    },
    {
      src: "Images/Unfinished house garage side.jpg",
      alt: "Garage wing for residential project in Ibex Hill",
      caption: "Garage wing – 4 bedroom house, Ibex Hill",
      categories: ["residential"],
      projectGroup: "Construction of 4 bedroom house in Ibex Hill"
    },

    // Bio Gas Digestor – Njase Clinic, Choma
    {
      src: "Images/bio clinic.jpg",
      alt: "Biogas digester at Njase Clinic in Choma",
      caption: "Biogas digester – Njase Clinic, Choma",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 60m^3 bio gas digester at Njase clinic, Choma",
      client: "Njase Clinic"
    },
    {
      src: "Images/bio clin 1.jpg",
      alt: "Excavation works for biogas digester at Njase Clinic",
      caption: "Excavation – 60m^3 biogas digester, Njase Clinic",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 60m^3 bio gas digester at Njase clinic, Choma",
      client: "Njase Clinic"
    },
    {
      src: "Images/bio clin 2.jpg",
      alt: "Biogas digester chamber at Njase Clinic",
      caption: "Digester chamber – Njase Clinic, Choma",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 60m^3 bio gas digester at Njase clinic, Choma",
      client: "Njase Clinic"
    },
    {
      src: "Images/bio clin 3.jpg",
      alt: "Construction of biogas digester walls at Njase Clinic",
      caption: "Superstructure works – Njase Clinic biogas digester",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 60m^3 bio gas digester at Njase clinic, Choma",
      client: "Njase Clinic"
    },
    {
      src: "Images/bio clin 4.jpg",
      alt: "Biogas digester inspection chamber at Njase Clinic",
      caption: "Inspection and access chamber – Njase Clinic biogas system",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 60m^3 bio gas digester at Njase clinic, Choma",
      client: "Njase Clinic"
    },
    {
      src: "Images/bio clin 5.jpg",
      alt: "Completed biogas digester at Njase Clinic in Choma",
      caption: "Completed 60m^3 biogas digester – Njase Clinic, Choma",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 60m^3 bio gas digester at Njase clinic, Choma",
      client: "Njase Clinic"
    },
    {
      src: "Images/bio clin 6.jpg",
      alt: "Biogas digester system components at Njase Clinic",
      caption: "System details – Njase Clinic biogas digester",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 60m^3 bio gas digester at Njase clinic, Choma",
      client: "Njase Clinic"
    },

    // Bio Gas Digestor – Chainda Community School, Lusaka
    {
      src: "Images/bio chainda.jpg",
      alt: "Biogas digester at Chainda Community School",
      caption: "Biogas digester – Chainda Community School, Lusaka",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 80m^3 biogas dugester and ABR at Chainda Community School, Lusaka.",
      client: "Chainda Community School"
    },
    {
      src: "Images/bio chainda 1.jpg",
      alt: "Biogas digester construction at Chainda Community School",
      caption: "Construction works – Chainda Community School biogas digester",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 80m^3 biogas dugester and ABR at Chainda Community School, Lusaka.",
      client: "Chainda Community School"
    },
    {
      src: "Images/bio chainda 2.jpg",
      alt: "Biogas digester chamber at Chainda Community School",
      caption: "Digester chamber – Chainda Community School, Lusaka",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 80m^3 biogas dugester and ABR at Chainda Community School, Lusaka.",
      client: "Chainda Community School"
    },
    {
      src: "Images/bio chainda 3.jpg",
      alt: "Biogas digester works at Chainda Community School",
      caption: "Ongoing works – Chainda Community School biogas project",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 80m^3 biogas dugester and ABR at Chainda Community School, Lusaka.",
      client: "Chainda Community School"
    },
    {
      src: "Images/bio chainda 4.jpg",
      alt: "Biogas digester finishing at Chainda Community School",
      caption: "Finishing works – Chainda Community School biogas project",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 80m^3 biogas dugester and ABR at Chainda Community School, Lusaka.",
      client: "Chainda Community School"
    },
    {
      src: "Images/bio chan 7.jpg",
      alt: "Biogas digester and ABR at Chainda Community School",
      caption: "Biogas digester and ABR – Chainda Community School, Lusaka",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 80m^3 biogas dugester and ABR at Chainda Community School, Lusaka.",
      client: "Chainda Community School"
    },
    {
      src: "Images/bio ch 5.jpg",
      alt: "Biogas system components at Chainda Community School",
      caption: "System components – Chainda Community School biogas project",
      categories: ["bio-gas-digestor"],
      projectGroup: "Construction of 80m^3 biogas dugester and ABR at Chainda Community School, Lusaka.",
      client: "Chainda Community School"
    },
  ];

  const landingView = document.getElementById("projects-landing");
  const galleryView = document.getElementById("gallery-view");
  const galleryTitle = document.getElementById("gallery-title");
  const backBtn = document.getElementById("back-to-categories");
  const lightbox = document.getElementById("lightbox");

  // View Switching Logic
  function switchView(viewName, categoryKey = null) {
    if (viewName === "gallery" && categoryKey) {
      // Show Gallery
      landingView.classList.add("hidden");
      galleryView.classList.remove("hidden");

      // Update Content
      const title = categoriesMap[categoryKey] || "Projects Gallery";
      galleryTitle.textContent = title;
      document.title = `${title} - Optimus Building & Civil Contractors`;

      renderProjects(categoryKey);

      // Update URL
      const url = new URL(window.location);
      url.searchParams.set("type", categoryKey);
      window.history.pushState({ type: categoryKey }, "", url);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Show Landing
      landingView.classList.remove("hidden");
      galleryView.classList.add("hidden");
      document.title = "Projects Gallery - Optimus Building & Civil Contractors";

      // Clear URL param
      const url = new URL(window.location);
      url.searchParams.delete("type");
      window.history.pushState({}, "", url);

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Render Projects (Grouped by Project Section)
  function renderProjects(category) {
    projectsGrid.innerHTML = "";

    // 1. Filter items by category
    const filteredItems = projectsData.filter(item => item.categories.includes(category));

    if (filteredItems.length === 0) {
      projectsGrid.innerHTML = '<p class="no-projects">No projects found in this category yet.</p>';
      return;
    }

    // 2. Group items by projectGroup
    const groups = {};
    filteredItems.forEach((item) => {
      const groupName = item.projectGroup || "Other Projects";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    });

    // 3. Render Sections
    Object.keys(groups).forEach(groupName => {
      const groupItems = groups[groupName];
      const groupClient = groupItems[0]?.client;

      // Create Section Container
      const section = document.createElement("div");
      section.className = "project-section";

      // Create Section Header (title + client note)
      const header = document.createElement("div");
      header.className = "project-section-header";

      const title = document.createElement("h3");
      title.className = "project-section-title";
      title.textContent = groupName;
      header.appendChild(title);

      if (groupClient) {
        const clientNote = document.createElement("p");
        clientNote.className = "project-client-note";
        clientNote.textContent = `Client: ${groupClient}`;
        header.appendChild(clientNote);
      }

      section.appendChild(header);

      // Create Grid for this section
      const grid = document.createElement("div");
      grid.className = "project-grid";

      // Add Items to Grid
      groupItems.forEach((item) => {
        // Find index in filteredItems to maintain correct lightbox navigation index
        const uniqueIndex = filteredItems.indexOf(item);

        const card = document.createElement("div");
        card.className = "gallery-item";
        card.onclick = () => openLightbox(filteredItems, uniqueIndex);

        // --- Media ---
        let media;
        if (item.type === "video") {
          const videoWrapper = document.createElement("div");
          videoWrapper.className = "video-thumbnail";
          media = document.createElement("video");
          media.src = item.src;
          media.muted = true;
          media.playsInline = true;

          // Hover behavior
          media.onmouseover = () => media.play();
          media.onmouseout = () => {
            media.pause();
            media.currentTime = 0;
          };
        } else {
          media = document.createElement("img");
          media.src = item.src;
          media.alt = item.alt;
          media.loading = "lazy";
        }

        const contentWrapper = document.createElement("div");
        contentWrapper.className = "gallery-content-wrapper";

        contentWrapper.appendChild(media);

        if (item.caption) {
          const caption = document.createElement("p");
          caption.className = "gallery-caption";
          caption.textContent = item.caption;
          contentWrapper.appendChild(caption);
        }

        card.appendChild(contentWrapper);
        grid.appendChild(card);
      });

      section.appendChild(grid);
      projectsGrid.appendChild(section);
    });
  }

  // Event Listeners for Categories
  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      if (category) switchView("gallery", category);
    });

    // Keyboard accessibility
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const category = card.dataset.category;
        if (category) switchView("gallery", category);
      }
    });
  });

  // Back Button
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      switchView("landing");
    });
  }

  // Initial Load Handler
  function handleInitialLoad() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");

    if (type && categoriesMap[type]) {
      // If valid type in URL, load gallery directly
      // Start hidden to avoid flicker? CSS handles hidden class.
      // We manually override the hidden classes here.
      landingView.classList.add("hidden");
      galleryView.classList.remove("hidden");

      const title = categoriesMap[type];
      galleryTitle.textContent = title;
      document.title = `${title} - Optimus Building & Civil Contractors`;
      renderProjects(type);
    }
  }

  // Browser Back/Forward Handling
  window.addEventListener("popstate", (event) => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type && categoriesMap[type]) {
      switchView("gallery", type);
    } else {
      switchView("landing");
    }
  });

  // Lightbox Logic
  let currentLightboxItems = [];
  let currentLightboxIndex = 0;

  function openLightbox(items, index) {
    currentLightboxItems = items;
    currentLightboxIndex = index;
    updateLightboxContent();
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Stop video if playing
    const video = lightbox.querySelector("video");
    if (video) {
      video.pause();
      video.style.display = 'none';
    }
  }

  function updateLightboxContent() {
    const item = currentLightboxItems[currentLightboxIndex];
    const img = lightbox.querySelector(".lightbox-image");
    const video = lightbox.querySelector(".lightbox-video");
    const caption = lightbox.querySelector(".lightbox-caption");

    caption.textContent = item.caption;

    if (item.type === "video") {
      img.style.display = "none";
      video.style.display = "block";
      video.src = item.src;
      video.play().catch(e => console.log("Auto-play prevented", e));
    } else {
      video.style.display = "none";
      video.pause();
      img.style.display = "block";
      img.src = item.src;
      img.alt = item.alt;
    }
  }

  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);

  lightbox.querySelector(".lightbox-next").addEventListener("click", (e) => {
    e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxItems.length;
    updateLightboxContent();
  });

  lightbox.querySelector(".lightbox-prev").addEventListener("click", (e) => {
    e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxItems.length) % currentLightboxItems.length;
    updateLightboxContent();
  });

  // Close on backdrop click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation for lightbox
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") lightbox.querySelector(".lightbox-next").click();
    if (e.key === "ArrowLeft") lightbox.querySelector(".lightbox-prev").click();
  });

  // Initialize
  handleInitialLoad();
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

