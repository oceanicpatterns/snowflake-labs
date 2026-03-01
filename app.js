const loadData = async () => {
    if (typeof window !== "undefined" && window.__SF_CONTENT__) {
        if (typeof window.__SF_CONTENT__ === "string") {
            return JSON.parse(window.__SF_CONTENT__);
        }
        return window.__SF_CONTENT__;
    }

    const response = await fetch(`data/content-v3.json?v=${Date.now()}`);
    if (!response.ok) {
        throw new Error("Failed to load content");
    }
    return response.json();
};

const renderCertifications = (certifications) => {
    const grid = document.getElementById("certification-grid");
    grid.innerHTML = certifications
        .map(
            (cert) => `
            <article class="card" data-path-card="${cert.id}">
        <div class="badges">
          <span class="badge">${cert.level}</span>
          <span class="badge">${cert.duration}</span>
        </div>
        <h3>${cert.title}</h3>
        <p>${cert.summary}</p>
        <div>
          <strong>Focus:</strong>
          <p>${cert.focus.join(" • ")}</p>
        </div>
                <div class="card__actions">
                    <button class="ghost" data-path-select="${cert.id}">View details</button>
                    <button class="cta" data-scroll="#practice" data-exam="${cert.title}" data-path-select="${cert.id}">Practice this path</button>
                </div>
      </article>
    `
        )
        .join("");
};

const renderStudyPlan = (modules) => {
    const container = document.getElementById("study-plan");
    container.innerHTML = modules
        .map(
            (module) => `
            <div class="timeline__item" data-study-card="${module.title}">
        <div class="timeline__header">
            <span class="timeline__week">${module.week}</span>
            ${module.exam ? `<span class="badge badge--primary">${module.exam}</span>` : ""}
        </div>
        <h3>${module.title}</h3>
        <p>${module.summary}</p>
        <div class="badges">
            ${module.tags.map((tag) => `<span class="badge">${tag}</span>`).join("")}
        </div>
        <div class="card__actions">
            <button class="ghost" data-scroll="#resources" data-study-select="${module.title}">Find labs</button>
            <button class="cta" data-scroll="#practice" data-study-select="${module.title}">Checkpoint quiz</button>
        </div>
      </div>
    `
        )
        .join("");
};

const questionCarouselState = {
    items: []
};

const updateQuestionCarouselControls = () => {
    const status = document.getElementById("question-carousel-status");
    const prev = document.getElementById("question-prev");
    const next = document.getElementById("question-next");
    const controls = document.getElementById("question-carousel-controls");
    const grid = document.getElementById("question-grid");
    if (!status || !prev || !next || !controls || !grid) return;

    const total = questionCarouselState.items.length;
    if (!total) {
        controls.style.display = "none";
        return;
    }

    controls.style.display = "flex";
    const cards = Array.from(grid.querySelectorAll(".card"));
    const gridRect = grid.getBoundingClientRect();
    let firstVisible = 1;
    let lastVisible = Math.min(total, cards.length);

    const visibleIndexes = cards
        .map((card, index) => ({
            index: index + 1,
            rect: card.getBoundingClientRect()
        }))
        .filter(({ rect }) => rect.right > gridRect.left && rect.left < gridRect.right)
        .map(({ index }) => index);

    if (visibleIndexes.length) {
        firstVisible = Math.min(...visibleIndexes);
        lastVisible = Math.max(...visibleIndexes);
    }

    status.textContent = `Revision highlights ${firstVisible}-${lastVisible} of ${total}`;
    prev.disabled = grid.scrollLeft <= 10;
    next.disabled = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 10;
};

const setQuestionCarouselItems = (questions) => {
    questionCarouselState.items = Array.isArray(questions) ? [...questions] : [];
    renderQuestions();
};

const renderQuestions = () => {
    const grid = document.getElementById("question-grid");
    const questions = questionCarouselState.items;
    if (!questions.length) {
        grid.innerHTML = `
            <article class="card empty-state">
                <h3>No practice questions yet</h3>
                <p>Try a different exam or difficulty filter.</p>
            </article>
        `;
        updateQuestionCarouselControls();
        return;
    }

    grid.innerHTML = questions
        .map(
            (question) => `
      <article class="card">
        <div class="badges">
          <span class="badge">${question.exam}</span>
          <span class="badge">${question.difficulty}</span>
        </div>
        <h3>${question.title}</h3>
        <p>${question.prompt}</p>
        <div>
          <strong>Revision cue:</strong>
          <p>${question.takeaway}</p>
        </div>
      </article>
    `
        )
        .join("");
    requestAnimationFrame(updateQuestionCarouselControls);
};

const renderQuizzes = (quizzes) => {
    const grid = document.getElementById("quiz-grid");
    grid.innerHTML = quizzes
        .map(
            (quiz) => `
            <article class="quiz-card" data-quiz-card="${quiz.id}">
        <div class="badges">
          <span class="badge">${quiz.exam}</span>
          <span class="badge">${quiz.difficulty}</span>
        </div>
        <h3>${quiz.title}</h3>
        <p>${quiz.summary}</p>
        <div class="badges">
          ${quiz.topics.map((topic) => `<span class="badge">${topic}</span>`).join("")}
        </div>
        <p><strong>${quiz.questionIds.length}</strong> questions</p>
        <button class="cta secondary" data-quiz-id="${quiz.id}">Start quiz</button>
      </article>
    `
        )
        .join("");
};

const getXpState = () => {
    const stored = localStorage.getItem("sf_xp_state");
    return stored ? JSON.parse(stored) : { xp: 0, level: 1 };
};

const setXpState = (state) => {
    localStorage.setItem("sf_xp_state", JSON.stringify(state));
};

const calculateLevel = (xp, thresholds) => {
    let level = 1;
    for (let index = 0; index < thresholds.length; index += 1) {
        if (xp >= thresholds[index]) level = index + 1;
    }
    return level;
};

const updateXpBanner = (state, thresholds) => {
    const banner = document.getElementById("xp-banner");
    if (!banner) return;
    const nextThreshold = thresholds[state.level] ?? thresholds[thresholds.length - 1];
    banner.textContent = `Level ${state.level} • ${state.xp} XP / ${nextThreshold} XP`;
};

const buildQuiz = (quiz, questions, gamification) => {
    const panel = document.getElementById("quiz-panel");
    panel.classList.add("is-visible");
    panel.innerHTML = `
    <div>
      <p class="eyebrow">${quiz.exam}</p>
      <h2>${quiz.title}</h2>
      <p>${quiz.summary}</p>
    </div>
    <div class="quiz-progress" id="quiz-progress">Answered 0 / ${questions.length}</div>
    <form id="quiz-form"></form>
    <div class="quiz-actions">
      <button class="cta" id="quiz-submit" type="button">Submit answers</button>
      <button class="ghost" id="quiz-reset" type="button">Reset</button>
      <button class="ghost" id="quiz-close" type="button">Close</button>
    </div>
    <div id="quiz-results"></div>
  `;

    const form = panel.querySelector("#quiz-form");
    const results = panel.querySelector("#quiz-results");
    const progress = panel.querySelector("#quiz-progress");

    form.innerHTML = questions
        .map(
            (question, index) => `
      <div class="quiz-question" data-question-id="${question.id}">
        <h3>Q${index + 1}. ${question.question}</h3>
        <div class="quiz-options">
          ${question.options
                    .map(
                        (option, optionIndex) => `
            <label class="quiz-option">
              <input type="radio" name="question-${question.id}" value="${optionIndex}" />
              <span>${option}</span>
            </label>
          `
                    )
                    .join("")}
        </div>
      </div>
    `
        )
        .join("");

    const updateProgress = () => {
        const answered = form.querySelectorAll("input[type=radio]:checked").length;
        progress.textContent = `Answered ${answered} / ${questions.length}`;
    };

    form.addEventListener("change", updateProgress);

    panel.querySelector("#quiz-submit").addEventListener("click", () => {
        const incorrect = [];
        let score = 0;

        form.querySelectorAll(".quiz-question").forEach((item) => {
            item.classList.remove("is-missing");
        });

        const unanswered = questions.filter((question) => {
            const selected = form.querySelector(
                `input[name="question-${question.id}"]:checked`
            );
            return !selected;
        });

        if (unanswered.length) {
            unanswered.forEach((question) => {
                const block = form.querySelector(
                    `[data-question-id="${question.id}"]`
                );
                if (block) {
                    block.classList.add("is-missing");
                }
            });
            results.innerHTML = `
      <div class="quiz-results">
        <h3>Almost there</h3>
        <p>Please answer all questions before submitting.</p>
      </div>
      `;
            results.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        questions.forEach((question) => {
            const selected = form.querySelector(
                `input[name="question-${question.id}"]:checked`
            );
            const chosen = selected ? Number(selected.value) : -1;
            if (chosen === question.correctIndex) {
                score += 1;
            } else {
                incorrect.push({
                    question: question.question,
                    correct: question.options[question.correctIndex],
                    explanation: question.explanation
                });
            }
        });

        results.innerHTML = `
      <div class="quiz-results">
        <h3>Your score: ${score} / ${questions.length}</h3>
        <p>${score === questions.length ? "Perfect score!" : "Review the explanations below."}</p>
        ${incorrect
                .map(
                    (item) => `
          <div class="answer-review">
            <strong>${item.question}</strong>
            <p>Correct answer: ${item.correct}</p>
            <p>${item.explanation}</p>
          </div>
        `
                )
                .join("")}
      </div>
    `;
        if (gamification) {
            const state = getXpState();
            const actionXp = score === questions.length ? gamification.actions.quizPerfect : gamification.actions.quizComplete;
            state.xp += actionXp;
            state.level = calculateLevel(state.xp, gamification.levelThresholds);
            setXpState(state);
            updateXpBanner(state, gamification.levelThresholds);
        }
        results.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    panel.querySelector("#quiz-reset").addEventListener("click", () => {
        form.reset();
        form.querySelectorAll(".quiz-question").forEach((item) => {
            item.classList.remove("is-missing");
        });
        results.innerHTML = "";
        updateProgress();
    });

    panel.querySelector("#quiz-close").addEventListener("click", () => {
        panel.classList.remove("is-visible");
        panel.innerHTML = "";
        const grid = document.getElementById("quiz-grid");
        if (grid) {
            grid.classList.remove("has-selection");
            grid.querySelectorAll(".quiz-card").forEach((card) => {
                card.classList.remove("is-dimmed", "is-selected");
            });
        }
    });

    updateProgress();
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
};

const setupNavigation = () => {
    const scrollToSection = (target) => {
        if (!target) return;
        const section = document.querySelector(target);
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const setActiveNav = (targetId) => {
        if (!targetId) return;
        document
            .querySelectorAll(".nav a[data-nav], #mobile-nav a[data-nav]")
            .forEach((link) => link.classList.remove("is-active"));
        document
            .querySelectorAll(`.nav a[href="#${targetId}"], #mobile-nav a[href="#${targetId}"]`)
            .forEach((link) => link.classList.add("is-active"));
    };

    document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-scroll]");
        if (trigger) {
            const target = trigger.getAttribute("data-scroll");
            scrollToSection(target);
        }

        const navLink = event.target.closest(".nav a[data-nav], #mobile-nav a[data-nav]");
        if (navLink) {
            event.preventDefault();
            const target = navLink.getAttribute("href");
            const targetId = target?.replace("#", "");
            scrollToSection(target);
            setActiveNav(targetId);
        }

        if (trigger) {
            const exam = trigger.getAttribute("data-exam");
            if (exam) {
                const examFilter = document.getElementById("exam-filter");
                if (examFilter) {
                    examFilter.value = exam;
                    examFilter.dispatchEvent(new Event("change"));
                }
            }
        }
    });
};

const setupMobileNav = () => {
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("mobile-nav");
    if (!toggle || !menu) return;

    const closeMenu = () => {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        menu.setAttribute("aria-hidden", "true");
    };

    toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        menu.classList.toggle("is-open", !isOpen);
        menu.setAttribute("aria-hidden", String(isOpen));
    });

    menu.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (!link) return;
        closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });
};

const setupPathSelection = (certifications, gamification) => {
    const grid = document.getElementById("certification-grid");
    const detail = document.getElementById("path-detail");
    if (!grid || !detail) return;

    const getProgress = (certId) => {
        const stored = localStorage.getItem(`sf_progress_${certId}`);
        return stored ? JSON.parse(stored) : [];
    };

    const setProgress = (certId, progress) => {
        localStorage.setItem(`sf_progress_${certId}`, JSON.stringify(progress));
    };

    const renderDetail = (cert) => {
        const completed = getProgress(cert.id);
        const total = cert.checklist.length;
        const percent = Math.round((completed.length / total) * 100);
        detail.innerHTML = `
            <div>
                <p class="eyebrow">${cert.code}</p>
                <h3>${cert.title}</h3>
                <p>${cert.detailSummary}</p>
            </div>
            <div>
                <strong>Progress</strong>
                <p>${completed.length} / ${total} completed</p>
                <div class="progress-bar">
                    <div class="progress-bar__fill" style="width: ${percent}%;"></div>
                </div>
            </div>
            <div>
                <strong>What it validates</strong>
                <ul>${cert.validates.map((item) => `<li>${item}</li>`).join("")}</ul>
            </div>
            <div>
                <strong>Learning checklist</strong>
                <div class="checklist">
                    ${cert.checklist
                .map(
                    (item, index) => `
                            <label>
                                <input type="checkbox" data-check-index="${index}" ${completed.includes(index) ? "checked" : ""} />
                                <span>${item}</span>
                            </label>
                        `
                )
                .join("")}
                </div>
            </div>
            <div>
                <strong>Badges to earn</strong>
                <div class="badge-row">
                    ${cert.badges.map((badge) => `<span class="badge">${badge}</span>`).join("")}
                </div>
            </div>
            <div>
                <strong>Candidate profile</strong>
                <p>${cert.candidateProfile}</p>
            </div>
            <div class="card__actions">
                <a class="ghost" href="${cert.examPage}" target="_blank" rel="noreferrer">Official exam page</a>
                <button class="cta" data-scroll="#practice" data-exam="${cert.title}">Start practice</button>
                <button class="ghost" data-reset-progress="${cert.id}">Reset progress</button>
            </div>
        `;
        detail.classList.add("is-visible");

        detail.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
            checkbox.addEventListener("change", () => {
                const index = Number(checkbox.dataset.checkIndex);
                const prior = new Set(getProgress(cert.id));
                const updated = new Set(prior);
                if (checkbox.checked) {
                    updated.add(index);
                } else {
                    updated.delete(index);
                }
                setProgress(cert.id, Array.from(updated));
                if (gamification && checkbox.checked && !prior.has(index)) {
                    const state = getXpState();
                    state.xp += gamification.actions.checklistItem;
                    state.level = calculateLevel(state.xp, gamification.levelThresholds);
                    setXpState(state);
                    updateXpBanner(state, gamification.levelThresholds);
                }
                renderDetail(cert);
            });
        });

        const reset = detail.querySelector("[data-reset-progress]");
        if (reset) {
            reset.addEventListener("click", () => {
                setProgress(cert.id, []);
                renderDetail(cert);
            });
        }
    };

    const clearSelection = () => {
        grid.querySelectorAll(".card").forEach((card) => {
            card.classList.remove("is-selected", "is-dimmed");
        });
        detail.classList.remove("is-visible");
    };

    const selectPath = (cert) => {
        if (!cert) return;
        grid.querySelectorAll(".card").forEach((card) => {
            const isSelected = card.dataset.pathCard === cert.id;
            card.classList.toggle("is-selected", isSelected);
            card.classList.toggle("is-dimmed", !isSelected);
        });
        renderDetail(cert);
    };

    grid.addEventListener("click", (event) => {
        const action = event.target.closest("[data-path-select]");
        const card = event.target.closest("[data-path-card]");
        const id = action?.dataset.pathSelect ?? card?.dataset.pathCard;
        if (!id) return;
        const cert = certifications.find((item) => item.id === id);
        if (!cert) return;
        selectPath(cert);
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return {
        selectById: (id) => selectPath(certifications.find((item) => item.id === id)),
        selectByTitle: (title) => selectPath(certifications.find((item) => item.title === title)),
        clearSelection
    };
};

const setupStudySelection = () => {
    const container = document.getElementById("study-plan");
    if (!container) return;

    container.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-study-select]");
        if (!trigger) return;
        const key = trigger.dataset.studySelect;
        container.querySelectorAll(".timeline__item").forEach((card) => {
            const isSelected = card.dataset.studyCard === key;
            card.classList.toggle("is-selected", isSelected);
            card.classList.toggle("is-dimmed", !isSelected);
        });
    });
};

const setupActiveNav = () => {
    const sections = [
        { id: "paths", nav: "paths" },
        { id: "study", nav: "study" },
        { id: "practice", nav: "practice" },
        { id: "resources", nav: "resources" }
    ];

    const navLinks = new Map(
        sections.map((section) => [
            section.id,
            document.querySelector(`.nav a[data-nav="${section.nav}"]`)
        ])
    );

    const observer = new IntersectionObserver(
        (entries) => {
            const bestEntry = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!bestEntry) return;

            navLinks.forEach((link) => link?.classList.remove("is-active"));
            navLinks.get(bestEntry.target.id)?.classList.add("is-active");
        },
        { rootMargin: "-30% 0px -55% 0px", threshold: [0.2, 0.4, 0.6] }
    );

    sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) observer.observe(element);
    });
};

const renderResources = (resources) => {
    const grid = document.getElementById("resource-grid");
    grid.innerHTML = resources
        .map(
            (resource) => `
      <article class="resource" data-resource-card="${resource.title}">
        <span>${resource.type}</span>
        <h3>${resource.title}</h3>
        <p>${resource.summary}</p>
        <a href="${resource.link}" target="_blank" rel="noreferrer">Explore →</a>
      </article>
    `
        )
        .join("");
};

const setupResourceSelection = () => {
    const container = document.getElementById("resource-grid");
    if (!container) return;

    container.addEventListener("click", (event) => {
        const card = event.target.closest(".resource");
        if (!card) return;
        const key = card.dataset.resourceCard;
        container.querySelectorAll(".resource").forEach((item) => {
            const isSelected = item.dataset.resourceCard === key;
            item.classList.toggle("is-selected", isSelected);
            item.classList.toggle("is-dimmed", !isSelected);
        });
    });
};

const populateExamFilter = (certifications) => {
    const examFilter = document.getElementById("exam-filter");
    certifications.forEach((cert) => {
        const option = document.createElement("option");
        option.value = cert.title;
        option.textContent = cert.title;
        examFilter.appendChild(option);
    });
};

const populateStudyExamFilter = (certifications) => {
    const examFilter = document.getElementById("study-exam-filter");
    if (!examFilter) return;
    certifications.forEach((cert) => {
        const option = document.createElement("option");
        option.value = cert.title;
        option.textContent = cert.title;
        examFilter.appendChild(option);
    });
};

const applyFilters = (questions, exam, difficulty) =>
    questions.filter((question) => {
        const matchesExam = exam === "all" || question.exam === exam;
        const matchesDifficulty =
            difficulty === "all" || question.difficulty === difficulty;
        return matchesExam && matchesDifficulty;
    });

const applyQuizFilters = (quizzes, exam, difficulty) =>
    quizzes.filter((quiz) => {
        const matchesExam = exam === "all" || quiz.exam === exam;
        const matchesDifficulty =
            difficulty === "all" || quiz.difficulty === difficulty;
        return matchesExam && matchesDifficulty;
    });

const applyStudyFilters = (modules, exam) =>
    modules.filter((module) => exam === "all" || module.exam === exam);

const init = async () => {
    try {
        const data = await loadData();
        renderCertifications(data.certifications);
        renderStudyPlan(data.studyPlan);
        renderQuizzes(data.examQuizzes);
        setQuestionCarouselItems(data.practiceQuestions);
        renderResources(data.resources);
        populateExamFilter(data.certifications);
        populateStudyExamFilter(data.certifications);
        const xpState = getXpState();
        if (data.gamification) {
            xpState.level = calculateLevel(xpState.xp, data.gamification.levelThresholds);
            setXpState(xpState);
            updateXpBanner(xpState, data.gamification.levelThresholds);
        }
        setupNavigation();
        setupActiveNav();
        setupMobileNav();
        const pathSelection = setupPathSelection(data.certifications, data.gamification);
        setupStudySelection();
        setupResourceSelection();

        const carouselControls = document.getElementById("question-carousel-controls");
        const grid = document.getElementById("question-grid");

        const changeQuestionPage = (direction) => {
            if (!grid) return;
            const scrollAmount = Math.max(240, grid.clientWidth * 0.9);
            grid.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
        };

        if (carouselControls) {
            carouselControls.addEventListener("click", (event) => {
                const action = event.target.closest("#question-prev, #question-next");
                if (!action) return;
                event.preventDefault();
                changeQuestionPage(action.id === "question-prev" ? -1 : 1);
            });
        }

        if (grid) {
            grid.addEventListener("scroll", () => {
                updateQuestionCarouselControls();
            });
        }

        window.addEventListener("resize", () => {
            updateQuestionCarouselControls();
        });

        const examFilter = document.getElementById("exam-filter");
        const difficultyFilter = document.getElementById("difficulty-filter");
        const filterSummary = document.getElementById("filter-summary");
        const studyExamFilter = document.getElementById("study-exam-filter");
        const studyFilterSummary = document.getElementById("study-filter-summary");

        const updateFilterSummary = () => {
            if (!filterSummary) return;
            const examLabel =
                examFilter.value === "all" ? "all exams" : examFilter.value;
            const difficultyLabel =
                difficultyFilter.value === "all" ? "All difficulty" : difficultyFilter.value;
            filterSummary.textContent = `Showing ${examLabel} • ${difficultyLabel}`;
        };

        let isSyncingFilters = false;

        const setSelectedCertification = (title) => {
            if (!pathSelection || !studyExamFilter) return;
            if (title === "all") {
                pathSelection.clearSelection();
                if (studyExamFilter.value !== "all") {
                    studyExamFilter.value = "all";
                }
                return;
            }
            pathSelection.selectByTitle(title);
            if (studyExamFilter.value !== title) {
                studyExamFilter.value = title;
            }
        };

        const updateFilters = () => {
            const filtered = applyFilters(
                data.practiceQuestions,
                examFilter.value,
                difficultyFilter.value
            );
            setQuestionCarouselItems(filtered);
            const filteredQuizzes = applyQuizFilters(
                data.examQuizzes,
                examFilter.value,
                difficultyFilter.value
            );
            renderQuizzes(filteredQuizzes);
            const panel = document.getElementById("quiz-panel");
            if (panel) {
                panel.classList.remove("is-visible");
                panel.innerHTML = "";
            }
            const grid = document.getElementById("quiz-grid");
            if (grid) {
                grid.classList.remove("has-selection");
                grid.querySelectorAll(".quiz-card").forEach((card) => {
                    card.classList.remove("is-dimmed", "is-selected");
                });
            }
            updateFilterSummary();
        };

        const updateStudyFilters = () => {
            if (!studyExamFilter) return;
            const filtered = applyStudyFilters(data.studyPlan, studyExamFilter.value);
            renderStudyPlan(filtered);
            if (studyFilterSummary) {
                const examLabel =
                    studyExamFilter.value === "all" ? "all exams" : studyExamFilter.value;
                studyFilterSummary.textContent = `Showing ${examLabel}`;
            }
        };

        if (studyExamFilter) {
            studyExamFilter.value = "all";
        }

        examFilter.addEventListener("change", updateFilters);
        examFilter.addEventListener("input", updateFilters);
        difficultyFilter.addEventListener("change", updateFilters);
        difficultyFilter.addEventListener("input", updateFilters);
        updateFilters();

        if (studyExamFilter) {
            const handleStudyChange = () => {
                if (isSyncingFilters) return;
                isSyncingFilters = true;
                setSelectedCertification(studyExamFilter.value);
                updateStudyFilters();
                isSyncingFilters = false;
            };
            studyExamFilter.addEventListener("change", handleStudyChange);
            studyExamFilter.addEventListener("input", handleStudyChange);
            handleStudyChange();
        }

        if (pathSelection && studyExamFilter) {
            document.getElementById("certification-grid").addEventListener("click", (event) => {
                const trigger = event.target.closest("[data-path-select], [data-path-card]");
                if (!trigger) return;
                const certId = trigger.dataset.pathSelect ?? trigger.dataset.pathCard;
                const cert = data.certifications.find((item) => item.id === certId);
                if (!cert) return;
                if (isSyncingFilters) return;
                isSyncingFilters = true;
                setSelectedCertification(cert.title);
                updateStudyFilters();
                isSyncingFilters = false;
            });
        }

        document.getElementById("quiz-grid").addEventListener("click", (event) => {
            const target = event.target.closest("button[data-quiz-id]");
            if (!target) return;
            const quizId = target.dataset.quizId;
            const quiz = data.examQuizzes.find((item) => item.id === quizId);
            if (!quiz) return;
            const questions = data.quizQuestions.filter((question) =>
                quiz.questionIds.includes(question.id)
            );
            const grid = document.getElementById("quiz-grid");
            if (grid) {
                grid.classList.add("has-selection");
                grid.querySelectorAll(".quiz-card").forEach((card) => {
                    const isSelected = card.dataset.quizCard === quizId;
                    card.classList.toggle("is-selected", isSelected);
                    card.classList.toggle("is-dimmed", !isSelected);
                });
            }
            buildQuiz(quiz, questions, data.gamification);
        });
    } catch (error) {
        console.error(error);
    }
};

init();
