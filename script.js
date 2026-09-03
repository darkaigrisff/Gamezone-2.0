document.addEventListener("DOMContentLoaded", function () {

    const loginButton =
        document.getElementById("loginButton");

    const signupButton =
        document.getElementById("signupButton");

    const email =
        document.getElementById("loginEmail");

    const password =
        document.getElementById("loginPassword");

    const message =
        document.getElementById("loginMessage");


    /* =================================
       ALLER À SIGNUP
    ================================= */

    if (signupButton) {

        signupButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "signup.html";

            }
        );

    }


    /* =================================
       CONNEXION
    ================================= */

    if (loginButton) {

        loginButton.addEventListener(
            "click",
            function () {

                const emailValue =
                    email.value.trim().toLowerCase();

                const passwordValue =
                    password.value;


                /* CHAMPS VIDES */

                if (!emailValue) {

                    message.textContent =
                        "⚠️ L'adresse Gmail est obligatoire. Entre l'adresse Gmail que tu as utilisée lors de la création de ton compte.";

                    message.style.color =
                        "#ff6b6b";

                    return;

                }


                if (!passwordValue) {

                    message.textContent =
                        "⚠️ Le mot de passe est obligatoire. Entre le mot de passe associé à ton compte GAME ZONE.";

                    message.style.color =
                        "#ff6b6b";

                    return;

                }


                /* GMAIL */

                if (!emailValue.endsWith("@gmail.com")) {

                    message.textContent =
                        "⚠️ Cette adresse n'est pas une adresse Gmail valide. Ton adresse doit obligatoirement se terminer par « @gmail.com », par exemple : exemple@gmail.com.";

                    message.style.color =
                        "#ff6b6b";

                    return;

                }


                /* COMPTE */

                const saved =
                    localStorage.getItem(
                        "gameZoneAccount"
                    );


                if (!saved) {

                    message.textContent =
                        "⚠️ Aucun compte GAME ZONE n'a été trouvé sur cet appareil. Tu dois d'abord créer un compte avec le bouton « CRÉER UN COMPTE ».";

                    message.style.color =
                        "#ff6b6b";

                    return;

                }


                try {

                    const account =
                        JSON.parse(saved);


                    if (
                        emailValue ===
                            account.email.toLowerCase()
                        &&
                        passwordValue ===
                            account.password
                    ) {

                        message.textContent =
                            "✅ Connexion réussie ! Préparation de ton espace GAME ZONE...";

                        message.style.color =
                            "#00ff9d";


                        setTimeout(
                            function () {

                                /*
                                DIRECTEMENT À HOME
                                */

                                window.location.replace(
                                    "home.html"
                                );

                            },
                            700
                        );


                    } else {

                        message.textContent =
                            "❌ Adresse Gmail ou mot de passe incorrect. Vérifie attentivement les informations que tu as saisies puis réessaie.";

                        message.style.color =
                            "#ff6b6b";

                    }


                } catch (error) {

                    console.error(error);

                    message.textContent =
                        "❌ Une erreur est survenue pendant la lecture de ton compte. Essaie de créer à nouveau ton compte.";

                    message.style.color =
                        "#ff6b6b";

                }

            }
        );

    }

});