const mobileToggle = document.querySelector(".mobile-toggle");
const navList = document.querySelector("nav ul");
const body = document.body;

// Create backdrop overlay
const backdrop = document.createElement("div");
backdrop.className = "nav-backdrop";
document.body.appendChild(backdrop);

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
  ".section-title, .section-intro, .section-subheading, .projects-tags, .projects-gallery, .clients-grid, .contact-section, .hero-content, .quick-links, .gallery-item"
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

const contactForm = document.getElementById("contact-form");
const statusEl = contactForm?.querySelector(".form-status");

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
    const response = await fetch("/api/contact", {
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

