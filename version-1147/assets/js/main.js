(function () {
    const mobileToggle = document.querySelector("[data-mobile-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
        const next = document.querySelector("[data-hero-next]");
        const prev = document.querySelector("[data-hero-prev]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        show(0);
        play();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        const cards = Array.from(scope.querySelectorAll("[data-card]"));
        const input = scope.querySelector("[data-search-input]");
        const count = scope.querySelector("[data-result-count]");
        const empty = scope.querySelector("[data-empty-state]");
        const buttons = Array.from(scope.querySelectorAll("[data-filter-value]"));
        let active = "all";

        function apply() {
            const query = input ? input.value.trim().toLowerCase() : "";
            let visible = 0;

            cards.forEach(function (card) {
                const category = card.getAttribute("data-category") || "";
                const searchable = (card.getAttribute("data-search") || "").toLowerCase();
                const matchesCategory = active === "all" || category === active;
                const matchesQuery = !query || searchable.indexOf(query) !== -1;
                const shouldShow = matchesCategory && matchesQuery;

                card.classList.toggle("card-hidden", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + " 部影片";
            }

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                active = button.getAttribute("data-filter-value") || "all";
                buttons.forEach(function (other) {
                    other.classList.toggle("is-active", other === button);
                });
                apply();
            });
        });

        if (input) {
            input.addEventListener("input", apply);
        }

        apply();
    });

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            const input = form.querySelector("input[name='q']");
            if (!input || !input.value.trim()) {
                event.preventDefault();
            }
        });
    });
})();
