document.addEventListener("DOMContentLoaded", function () {

    // ==================================================
    // ELEMENTS
    // ==================================================

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const usernameInput = document.getElementById("username");
    const phoneInput = document.getElementById("phone");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");

    const nameMessage = document.getElementById("nameMessage");
    const emailMessage = document.getElementById("emailMessage");
    const usernameMessage = document.getElementById("usernameMessage");
    const phoneMessage = document.getElementById("phoneMessage");
    const passwordMessage = document.getElementById("passwordMessage");
    const confirmMessage = document.getElementById("confirmMessage");

    const signupMessage = document.getElementById("signupMessage");

    const createButton =
        document.getElementById("createAccountButton");

    const backButton =
        document.getElementById("backLoginButton");


    // ==================================================
    // AFFICHER UN MESSAGE
    // ==================================================

    function showMessage(element, text, success) {

        if (!element) return;

        element.textContent = text;

        if (success) {
            element.style.color = "#00ff9d";
        } else {
            element.style.color = "#ff5c5c";
        }
    }


    // ==================================================
    // NOM
    // ==================================================

    function checkName() {

        const value = nameInput.value.trim();

        if (value.length < 2) {

            showMessage(
                nameMessage,
                "⚠️ Entre au moins 2 caractères.",
                false
            );

            return false;
        }

        showMessage(
            nameMessage,
            "✓ Nom valide",
            true
        );

        return true;
    }


    // ==================================================
    // GMAIL
    // ==================================================

    function checkEmail() {

        const value =
            emailInput.value.trim().toLowerCase();

        if (value === "") {

            showMessage(
                emailMessage,
                "⚠️ Entre ton adresse Gmail.",
                false
            );

            return false;
        }

        if (!value.includes("@")) {

            showMessage(
                emailMessage,
                "⚠️ Il manque le @.",
                false
            );

            return false;
        }

        if (!value.endsWith("@gmail.com")) {

            showMessage(
                emailMessage,
                "⚠️ Utilise une adresse @gmail.com.",
                false
            );

            return false;
        }

        const gmailRegex =
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!gmailRegex.test(value)) {

            showMessage(
                emailMessage,
                "⚠️ Adresse Gmail incorrecte.",
                false
            );

            return false;
        }

        showMessage(
            emailMessage,
            "✓ Gmail valide",
            true
        );

        return true;
    }


    // ==================================================
    // PSEUDO
    // ==================================================

    function checkUsername() {

        let value = usernameInput.value;

        // Supprime les espaces
        value = value.replace(/\s/g, "");

        // Autorise seulement lettres, chiffres, _ et -
        value = value.replace(
            /[^a-zA-Z0-9_-]/g,
            ""
        );

        usernameInput.value = value;

        if (value.length < 3) {

            showMessage(
                usernameMessage,
                "⚠️ Minimum 3 caractères.",
                false
            );

            return false;
        }

        showMessage(
            usernameMessage,
            "✓ Pseudo valide",
            true
        );

        return true;
    }


    // ==================================================
    // TELEPHONE
    // ==================================================

    function checkPhone() {

        let value = phoneInput.value;

        // Garde uniquement les chiffres
        value = value.replace(/\D/g, "");

        phoneInput.value = value;

        if (value.length < 8) {

            showMessage(
                phoneMessage,
                "⚠️ Numéro trop court.",
                false
            );

            return false;
        }

        if (value.length > 15) {

            showMessage(
                phoneMessage,
                "⚠️ Numéro trop long.",
                false
            );

            return false;
        }

        showMessage(
            phoneMessage,
            "✓ Numéro valide",
            true
        );

        return true;
    }


    // ==================================================
    // MOT DE PASSE
    // ==================================================

    function checkPassword() {

        const value = passwordInput.value;

        if (value.length < 8) {

            showMessage(
                passwordMessage,
                "⚠️ Minimum 8 caractères.",
                false
            );

            return false;
        }

        if (!/[A-Z]/.test(value)) {

            showMessage(
                passwordMessage,
                "⚠️ Ajoute une majuscule.",
                false
            );

            return false;
        }

        if (!/[0-9]/.test(value)) {

            showMessage(
                passwordMessage,
                "⚠️ Ajoute au moins un chiffre.",
                false
            );

            return false;
        }

        showMessage(
            passwordMessage,
            "✓ Mot de passe valide",
            true
        );

        return true;
    }


    // ==================================================
    // CONFIRMATION
    // ==================================================

    function checkConfirm() {

        const password = passwordInput.value;
        const confirm = confirmInput.value;

        if (confirm === "") {

            showMessage(
                confirmMessage,
                "⚠️ Confirme ton mot de passe.",
                false
            );

            return false;
        }

        if (password !== confirm) {

            showMessage(
                confirmMessage,
                "⚠️ Les mots de passe sont différents.",
                false
            );

            return false;
        }

        showMessage(
            confirmMessage,
            "✓ Mots de passe identiques",
            true
        );

        return true;
    }


    // ==================================================
    // VALIDATION EN DIRECT
    // ==================================================

    nameInput.addEventListener(
        "input",
        checkName
    );

    emailInput.addEventListener(
        "input",
        checkEmail
    );

    usernameInput.addEventListener(
        "input",
        checkUsername
    );

    phoneInput.addEventListener(
        "input",
        checkPhone
    );

    passwordInput.addEventListener(
        "input",
        function () {
            checkPassword();
            checkConfirm();
        }
    );

    confirmInput.addEventListener(
        "input",
        checkConfirm
    );


    // ==================================================
    // CREATION DU COMPTE
    // ==================================================

    createButton.addEventListener(
        "click",
        function () {

            // Vérifie tout
            const validName = checkName();
            const validEmail = checkEmail();
            const validUsername = checkUsername();
            const validPhone = checkPhone();
            const validPassword = checkPassword();
            const validConfirm = checkConfirm();


            // Si quelque chose est incorrect
            if (
                !validName ||
                !validEmail ||
                !validUsername ||
                !validPhone ||
                !validPassword ||
                !validConfirm
            ) {

                showMessage(
                    signupMessage,
                    "❌ Corrige les informations en rouge.",
                    false
                );

                return;
            }


            // ==================================================
            // CREATION DU COMPTE
            // ==================================================

            const account = {

                name:
                    nameInput.value.trim(),

                email:
                    emailInput.value.trim().toLowerCase(),

                username:
                    usernameInput.value.trim(),

                phone:
                    phoneInput.value.trim(),

                password:
                    passwordInput.value
            };


            // ==================================================
            // SAUVEGARDE
            // ==================================================

            try {

                localStorage.setItem(
                    "gameZoneAccount",
                    JSON.stringify(account)
                );

            } catch (error) {

                console.error(
                    "Erreur localStorage :",
                    error
                );

                showMessage(
                    signupMessage,
                    "❌ Impossible de sauvegarder le compte.",
                    false
                );

                return;
            }


            // ==================================================
            // VERIFICATION DE LA SAUVEGARDE
            // ==================================================

            const savedAccount =
                localStorage.getItem("gameZoneAccount");

            if (!savedAccount) {

                showMessage(
                    signupMessage,
                    "❌ Le compte n'a pas pu être enregistré.",
                    false
                );

                return;
            }


            // ==================================================
            // SUCCÈS
            // ==================================================

            showMessage(
                signupMessage,
                "✅ Compte créé ! Bienvenue dans GAME ZONE 🎮",
                true
            );


            createButton.disabled = true;

            createButton.textContent =
                "🎮 CHARGEMENT...";


            // ==================================================
            // REDIRECTION
            // ==================================================

            setTimeout(
                function () {

                    window.location.replace(
                        "home.html"
                    );

                },
                800
            );

        }
    );


    // ==================================================
    // RETOUR CONNEXION
    // ==================================================

    backButton.addEventListener(
        "click",
        function () {

            window.location.replace(
                "index.html"
            );

        }
    );

});