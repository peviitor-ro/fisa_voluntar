document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("sidebar-toggle");
  const closeBtn = document.getElementById("sidebar-close");
  const sidebar = document.getElementById("app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  function toggleSidebar() {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }

  if (toggleBtn) toggleBtn.addEventListener("click", toggleSidebar);
  if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);

  let jobsData = [];

  function getJobIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const jobParam = params.get("job");
    if (jobParam) return jobParam;

    const hash = window.location.hash.replace("#", "");
    if (hash) return hash;

    return "front_end_lead";
  }

  async function loadJobs() {
    try {
      const response = await fetch("jobs.json");
      if (!response.ok)
        throw new Error("A apărut o eroare la încărcarea datelor.");
      jobsData = await response.json();

      renderNavigation();
      const currentJobId = getJobIdFromUrl();
      renderJob(currentJobId);
    } catch (error) {
      console.error(error);
    }
  }

  function renderNavigation() {
    const navList = document.getElementById("nav-list");
    if (!navList) return;

    navList.innerHTML = "";

    const techJobs = jobsData
      .filter((j) => j.category === "Tech")
      .sort((a, b) => a.title.localeCompare(b.title, "ro", { sensitivity: "base" }));
    const nontechJobs = jobsData
      .filter((j) => j.category === "Nontech")
      .sort((a, b) => a.title.localeCompare(b.title, "ro", { sensitivity: "base" }));

    function appendHeader(text) {
      const li = document.createElement("li");
      li.className = "nav-group-header";
      li.textContent = text;
      navList.appendChild(li);
    }

    function appendJobs(jobs) {
      jobs.forEach((job) => {
        const li = document.createElement("li");
        li.className = "nav-item";
        li.dataset.jobId = job.id;

        const a = document.createElement("a");
        a.href = `?job=${job.id}`;
        a.textContent = job.title;

        a.addEventListener("click", (e) => {
          e.preventDefault();
          window.history.pushState(null, "", `?job=${job.id}`);
          renderJob(job.id);
          closeSidebar();
        });

        li.appendChild(a);
        navList.appendChild(li);
      });
    }

    if (techJobs.length > 0) {
      appendHeader("Fișe Tehnice");
      appendJobs(techJobs);
    }

    if (nontechJobs.length > 0) {
      appendHeader("Fișe Non-tehnice");
      appendJobs(nontechJobs);
    }
  }

  function renderJob(jobId) {
    const job = jobsData.find((j) => j.id === jobId) || jobsData[0];
    if (!job) return;

    document.title = `${job.badge || "Fișă de Voluntar"} - ${job.title} - Asociația Oportunități și Cariere`;

    const mainHeading = document.querySelector(".job-main-title");
    if (mainHeading) {
      mainHeading.textContent = job.badge || "Fișă de voluntar";
    }

    document.querySelectorAll(".nav-item").forEach((item) => {
      if (item.dataset.jobId === job.id) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    const metaGrid = document.getElementById("meta-grid");
    if (metaGrid) {
      let metaHtml = `
        <div class="meta-item role-title-item">
          <span class="meta-label">Denumire Rol</span>
          <span class="meta-value">${job.title}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Nivel</span>
          <span class="meta-value">${job.level}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Raportează către</span>
          <span class="meta-value">${job.reportsTo}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Timp săptămânal</span>
          <span class="meta-value">${job.weeklyTime}</span>
        </div>
      `;
      if (job.onetCode) {
        metaHtml += `
          <div class="meta-item">
            <span class="meta-label">Cod O*NET folosit</span>
            <span class="meta-value">${job.onetCode}</span>
          </div>
        `;
      }
      if (job.training) {
        metaHtml += `
          <div class="meta-item">
            <span class="meta-label">Formare</span>
            <span class="meta-value">${job.training}</span>
          </div>
        `;
      }
      if (job.location) {
        metaHtml += `
          <div class="meta-item">
            <span class="meta-label">Locul de desfășurare</span>
            <span class="meta-value">${job.location}</span>
          </div>
        `;
      }
      metaGrid.innerHTML = metaHtml;
    }

    const purposeHeading = document.getElementById("purpose-heading");
    if (purposeHeading) {
      purposeHeading.textContent =
        job.badge === "Fișă Voluntar" ? "Scopul poziției" : "Scopul rolului";
    }

    const purposeText = document.getElementById("purpose-text");
    if (purposeText) purposeText.textContent = job.purpose;

    const respList = document.getElementById("responsibilities-list");
    if (respList) {
      respList.innerHTML = job.responsibilities
        .map(
          (item) => `
          <li class="list-item">
            <div class="bullet-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="list-content">${item}</div>
          </li>
        `,
        )
        .join("");
    }

    const reqList = document.getElementById("required-skills-list");
    const requiredSkillsCol = document.getElementById("required-skills-col");
    if (reqList && requiredSkillsCol) {
      if (job.requiredSkills && job.requiredSkills.length > 0) {
        requiredSkillsCol.style.display = "block";
        reqList.innerHTML = job.requiredSkills
          .map(
            (item) => `
            <li class="list-item">
              <div class="bullet-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="list-content">${item}</div>
            </li>
          `,
          )
          .join("");
      } else {
        requiredSkillsCol.style.display = "none";
      }
    }

    const desList = document.getElementById("desirable-skills-list");
    const desirableSkillsCol = document.getElementById("desirable-skills-col");
    if (desList && desirableSkillsCol) {
      if (job.desirableSkills && job.desirableSkills.length > 0) {
        desirableSkillsCol.style.display = "block";
        desList.innerHTML = job.desirableSkills
          .map(
            (item) => `
            <li class="list-item">
              <div class="bullet-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="list-content">${item}</div>
            </li>
          `,
          )
          .join("");
      } else {
        desirableSkillsCol.style.display = "none";
      }
    }

    // Extra Details for Volunteers
    const extraSection = document.getElementById("section-extra-details");
    if (extraSection) {
      const hasExtra =
        (job.benefits && job.benefits.length > 0) ||
        (job.resources && job.resources.length > 0) ||
        (job.evaluation && job.evaluation.length > 0);

      if (hasExtra) {
        extraSection.style.display = "block";

        const benefitsBlock = document.getElementById("detail-benefits-block");
        const benefitsList = document.getElementById("benefits-list");
        if (job.benefits && job.benefits.length > 0) {
          benefitsBlock.style.display = "block";
          benefitsList.innerHTML = job.benefits
            .map(
              (item) => `
            <li class="list-item">
              <div class="bullet-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="list-content">${item}</div>
            </li>
          `,
            )
            .join("");
        } else {
          benefitsBlock.style.display = "none";
        }

        const resourcesBlock = document.getElementById(
          "detail-resources-block",
        );
        const resourcesList = document.getElementById("resources-list");
        if (job.resources && job.resources.length > 0) {
          resourcesBlock.style.display = "block";
          resourcesList.innerHTML = job.resources
            .map(
              (item) => `
            <li class="list-item">
              <div class="bullet-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="list-content">${item}</div>
            </li>
          `,
            )
            .join("");
        } else {
          resourcesBlock.style.display = "none";
        }

        const evaluationBlock = document.getElementById(
          "detail-evaluation-block",
        );
        const evaluationList = document.getElementById("evaluation-list");
        if (job.evaluation && job.evaluation.length > 0) {
          evaluationBlock.style.display = "block";
          evaluationList.innerHTML = job.evaluation
            .map(
              (item) => `
            <li class="list-item">
              <div class="bullet-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="list-content">${item}</div>
            </li>
          `,
            )
            .join("");
        } else {
          evaluationBlock.style.display = "none";
        }
      } else {
        extraSection.style.display = "none";
      }
    }

    const compSection = document.getElementById("section-competencies");
    if (compSection) {
      if (job.developedCompetencies && job.developedCompetencies.length > 0) {
        compSection.style.display = "block";
        const compGrid = document.getElementById("competencies-grid");
        if (compGrid) {
          compGrid.innerHTML = job.developedCompetencies
            .map(
              (item) => `
              <div class="competency-card">
                <div class="competency-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <div class="competency-text">${item}</div>
              </div>
            `,
            )
            .join("");
        }
      } else {
        compSection.style.display = "none";
      }
    }

    const noteSection = document.getElementById("section-note");
    if (noteSection) {
      if (job.note) {
        noteSection.style.display = "block";
        const noteText = document.getElementById("note-text");
        if (noteText) noteText.textContent = job.note;
      } else {
        noteSection.style.display = "none";
      }
    }
  }

  window.addEventListener("popstate", () => {
    const currentJobId = getJobIdFromUrl();
    renderJob(currentJobId);
  });

  loadJobs();
});
