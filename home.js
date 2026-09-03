/* =========================================================
   GAME ZONE — HOME.JS
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       VÉRIFICATION DU COMPTE
       ===================================================== */

    const savedAccount =
        localStorage.getItem("gameZoneAccount");

    if (!savedAccount) {
        window.location.href = "index.html";
        return;
    }

    let account = {};

    try {
        account = JSON.parse(savedAccount);
    } catch (error) {
        account = {};
    }

    /* =====================================================
       ÉLÉMENTS
       ===================================================== */

    const loadingScreen =
        document.getElementById("loadingScreen");

    const loadingFill =
        document.getElementById("loadingFill");

    const loadingText =
        document.getElementById("loadingText");

    const mainContent =
        document.getElementById("mainContent");

    const profileButton =
        document.getElementById("profileButton");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const profileUsername =
        document.getElementById("profileUsername");

    const profilePopup =
        document.getElementById("profilePopup");

    const closeProfile =
        document.getElementById("closeProfile");

    const popupUsername =
        document.getElementById("popupUsername");

    const popupEmail =
        document.getElementById("popupEmail");

    const logoutButton =
        document.getElementById("logoutButton");

    const gameSearch =
        document.getElementById("gameSearch");

    const categoryButtons =
        document.querySelectorAll(".categoryButton");

    const gameCards =
        document.querySelectorAll(".gameCard");

    const noResults =
        document.getElementById("noResults");

    /* =====================================================
       PROFIL
       ===================================================== */

    const username =
        account.username ||
        account.pseudo ||
        account.name ||
        "JOUEUR";

    const email =
        account.email ||
        "Adresse e-mail non disponible";

    if (profileUsername) {
        profileUsername.textContent = username;
    }

    if (popupUsername) {
        popupUsername.textContent = username;
    }

    if (popupEmail) {
        popupEmail.textContent = email;
    }

    if (profileAvatar) {
        profileAvatar.textContent = "👤";
    }

    /* =====================================================
       CHARGEMENT 0% → 100%
       ===================================================== */

    let progress = 0;

    const loadingMessages = [
        "INITIALISATION...",
        "CHARGEMENT DES JEUX...",
        "PRÉPARATION DE GAME ZONE...",
        "CHARGEMENT DES RESSOURCES...",
        "VÉRIFICATION DU SYSTÈME...",
        "PRESQUE TERMINÉ...",
        "GAME ZONE PRÊT !"
    ];

    function updateLoading() {

        if (loadingFill) {
            loadingFill.style.width = progress + "%";
        }

        if (loadingText) {

            let index =
                Math.floor(
                    progress /
                    (100 / loadingMessages.length)
                );

            if (index >= loadingMessages.length) {
                index = loadingMessages.length - 1;
            }

            loadingText.textContent =
                loadingMessages[index]
                + " "
                + progress
                + "%";
        }
    }

    updateLoading();

    const loadingInterval =
        setInterval(function () {

            /*
             * Progression progressive.
             * On ralentit légèrement vers 100 %
             * pour donner un vrai effet d'initialisation.
             */

            if (progress < 60) {

                progress +=
                    Math.floor(Math.random() * 4) + 2;

            } else if (progress < 85) {

                progress +=
                    Math.floor(Math.random() * 3) + 1;

            } else {

                progress += 1;
            }

            if (progress > 100) {
                progress = 100;
            }

            updateLoading();

            if (progress >= 100) {

                clearInterval(loadingInterval);

                if (loadingText) {
                    loadingText.textContent =
                        "GAME ZONE PRÊT ! 100%";
                }

                setTimeout(function () {

                    if (mainContent) {
                        mainContent.classList.add("visible");
                    }

                    if (loadingScreen) {
                        loadingScreen.classList.add(
                            "loadingFinished"
                        );
                    }

                }, 500);
            }

        }, 55);

    /* =====================================================
       OUVRIR LE PROFIL
       ===================================================== */

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            function () {

                if (profilePopup) {
                    profilePopup.classList.add("show");
                }

            }
        );

    }

    /* =====================================================
       FERMER LE PROFIL
       ===================================================== */

    function closeProfilePopup() {

        if (profilePopup) {
            profilePopup.classList.remove("show");
        }

    }

    if (closeProfile) {

        closeProfile.addEventListener(
            "click",
            closeProfilePopup
        );

    }

    /* Cliquer en dehors de la fenêtre */

    if (profilePopup) {

        profilePopup.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === profilePopup
                ) {
                    closeProfilePopup();
                }

            }
        );

    }

    /* =====================================================
       TOUCHE ESC
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeProfilePopup();
            }

        }
    );

    /* =====================================================
       DÉCONNEXION
       ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "gameZoneAccount"
                );

                window.location.href =
                    "index.html";

            }
        );

    }

    /* =====================================================
       RECHERCHE + CATÉGORIES
       ===================================================== */

    let selectedCategory = "ALL";

    function filterGames() {

        const search =
            gameSearch
                ? gameSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        let visibleCount = 0;

        gameCards.forEach(
            function (card) {

                const title =
                    (
                        card.dataset.title ||
                        ""
                    ).toLowerCase();

                const category =
                    (
                        card.dataset.category ||
                        ""
                    ).toUpperCase();

                const searchMatch =
                    title.includes(search);

                const categoryMatch =
                    selectedCategory === "ALL" ||
                    category === selectedCategory;

                if (
                    searchMatch &&
                    categoryMatch
                ) {

                    card.style.display = "";

                    visibleCount++;

                } else {

                    card.style.display = "none";

                }

            }
        );

        if (noResults) {

            if (visibleCount === 0) {
                noResults.style.display = "block";
            } else {
                noResults.style.display = "none";
            }

        }

    }

    /* =====================================================
       RECHERCHE EN DIRECT
       ===================================================== */

    if (gameSearch) {

        gameSearch.addEventListener(
            "input",
            function () {

                filterGames();

            }
        );

    }

    /* =====================================================
       BOUTONS CATÉGORIES
       ===================================================== */

    categoryButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    categoryButtons.forEach(
                        function (btn) {
                            btn.classList.remove(
                                "active"
                            );
                        }
                    );

                    button.classList.add("active");

                    selectedCategory =
                        (
                            button.dataset.category ||
                            "ALL"
                        ).toUpperCase();

                    filterGames();

                }
            );

        }
    );

    /* =====================================================
       BOUTONS "BIENTÔT"
       ===================================================== */

    const disabledButtons =
        document.querySelectorAll(
            ".disabledButton"
        );

    disabledButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                }
            );

        }
    );

    /* =====================================================
       FILTRAGE INITIAL
       ===================================================== */

    filterGames();

});