# Firebase: login og synkronisering

Sådan sættes Firebase op til TeoriBoost. Det tager ca. 10 minutter i
[Firebase-konsollen](https://console.firebase.google.com). Konsollen er på engelsk; knapperne står
herunder, som de hedder dér.

## 1. Projekt og web-app

1. **Add project** (eller vælg et eksisterende) og kald det fx `teoriboost`.
   Google Analytics behøver du ikke; du kan slå det fra.
2. På projektets forside: klik **`</>`** (Add app → Web).
   - App nickname: `TeoriBoost web`
   - Lad **Firebase Hosting** være slået fra (appen ligger på Vercel).
   - **Register app**.
3. Kopiér objektet `const firebaseConfig = { ... }` og send det til mig (eller indsæt det i
   `dist/firebase-config.js`). Det er ikke en hemmelighed: det fortæller bare appen, hvilket
   projekt den hører til. Adgangen styres af reglerne i punkt 3.

## 2. Login (Authentication)

**Build → Authentication → Get started**, derefter fanen **Sign-in method**:

| Udbyder | Hvad du gør |
|---|---|
| **Anonymous** | Enable → Save |
| **Google** | Enable → vælg *Project support email* → Save |
| **Email/Password** | Enable den første kontakt **og** **Email link (passwordless sign-in)** → Save |

Fanen **Settings → Authorized domains → Add domain**:

- `teoriboost.vercel.app`
- `localhost` (nyere projekter har det ikke med fra start; det skal bruges, når appen testes lokalt)

Valgfrit: **Templates** → blyanten ud for *Template language* → **Danish**, så login-mailen er på dansk.

## 3. Database (Firestore) i EU

**Build → Firestore Database → Create database**:

1. Location: **`eur3 (europe)`** (eller `europe-west1`, Belgien). **Kan ikke ændres bagefter.**
2. Start in **production mode** → **Create**.
3. Fanen **Rules**: slet det, der står, indsæt hele indholdet af `firebase/firestore.rules` → **Publish**.

## 4. Udgiftsgrænse (anbefalet)

Tandhjulet → **Usage and billing** → **Details & settings** → budget-alarm, fx 25 kr. om måneden.
Forbruget for denne app er meget lille (ét dokument pr. bruger), men en alarm er gratis.

## Hvad appen gør

- Alle får en **anonym** session, og fremgangen gemmes **kun på enheden**, ligesom før.
- Under **Din profil → Gem din fremgang** kan man logge ind med **Google** eller få et
  **login-link på e-mail**. Fremgangen på enheden flettes ind i kontoen (intet går tabt), og fra da af
  synkroniseres den til Firestore, så man kan fortsætte på en anden enhed.
- Synkroniseret: fremgang og lektioner, prøvedato og mål, Min bil og rækkefølge-øvelser.
  Ikke synkroniseret: chatten med Sneglen og valg af lyst/mørkt tema (de bliver på enheden).
- **Log ud** fjerner fremgangen fra enheden (den ligger i kontoen). **Slet konto** sletter dokumentet
  i Firestore og selve login-kontoen.
