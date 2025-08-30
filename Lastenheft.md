# Lastenheft: Persönliche Videoplattform (Version 2.1)

---

## 1. Einleitung und Projektübersicht

* **Projektbezeichnung:** Persönliche Videoplattform
* **Ausgangssituation:** Es wird ein neues System geschaffen, um eine private Videosammlung zu verwalten und zugänglich zu machen.
* **Projektziele:**
    * Zentrales Hochladen und Speichern von privaten Videos.
    * Weltweiter Zugriff auf die eigene Videosammlung über einen Webbrowser.
    * Effiziente Organisation und schnelles Wiederfinden von Videos durch Kategorien, Tags und eine Suchfunktion.
* **Zielgruppe:** Einzelner Anwender (Single-User).

---

## 2. Ist-Zustand

Da es sich um ein neues Projekt handelt, gibt es keinen Ist-Zustand, der abgelöst werden soll.

---

## 3. Soll-Konzept

### 3.1 Designvorgaben

* **Farbkonzept:** Die gesamte Plattform wird ausschließlich in einem **Darkmode** umgesetzt.
    * **Hauptfarbe:** Anthrazit
    * **Akzentfarbe:** Jaguargrün

### 3.2 Funktionale Anforderungen

#### A. Benutzerauthentifizierung

* **Single-User-Login:** Die Plattform ist nur für einen Benutzer zugänglich.
* **Anmeldedaten:** Der Login erfolgt über einen Benutzernamen und ein Passwort.
* **Konfiguration:** Die Anmeldedaten werden statisch über eine `.env`-Datei auf dem Server festgelegt.
* **Weiterleitung:** Nach erfolgreichem Login wird der Benutzer direkt auf die Videoliste weitergeleitet.

#### B. Navigation (Sidebar)

* Eine permanent sichtbare Sidebar dient zur Hauptnavigation.
* **Speicherplatzanzeige:** Die Sidebar zeigt den belegten Speicherplatz an (z. B. "1.5 von 5 TB belegt").
* **Oben fixierte Elemente:**
    * `Videos`: Link zur Videolisten-Ansicht.
    * `Favoriten`: Link zur gefilterten Favoriten-Ansicht.
* **Unten fixierte Elemente:**
    * `Einstellungen`: Link zur Verwaltungsseite für Kategorien und Tags.
    * `Logout`: Meldet den Benutzer ab.

#### C. Videoverwaltung

* **Video-Upload:**
    * Eine dedizierte Upload-Seite mit einer Drag-and-Drop-Funktionalität.
    * Maximal-Uploadgröße pro Video: **10 GB**.
    * Neben der Videodatei müssen ein **Coverbild** (Hochkant) und ein **Previewbild** hochgeladen werden.
    * Der Titel des Videos muss angegeben werden.
    * Dem Video müssen existierende "Tags" zugewiesen werden.
    * Die **Videolänge** wird automatisch aus den Metadaten der Datei extrahiert.
    * Die Upload-Dauer wird dem User angezeigt. Die Messung der Zeit erfolgt serverseitig.
    * **Fortschrittsanzeige:** Der Upload-Fortschritt wird durch zwei separate Balken visualisiert:
        1.  Upload vom Frontend zum Backend.
        2.  Verarbeitung vom Backend zum finalen Speicherort auf dem Server.
    * **Verifizierung:** Die Erfolgsmeldung für den Upload darf erst angezeigt werden, nachdem das Backend verifiziert hat, dass die Datei vollständig und korrekt auf dem Server gespeichert wurde.
* **Video löschen:**
    * Ein Löschen-Button in der Detailansicht eines Videos.
    * Vor dem endgültigen Löschen wird eine **Sicherheitsabfrage** angezeigt.
    * Der Löschprozess auf dem Server läuft in einer definierten Reihenfolge ab: 1. Cover- & Previewbild löschen, 2. Videodatei löschen, 3. Datenbankeintrag entfernen.
* **Video bearbeiten:**
    * Ein Bearbeiten-Button in der Detailansicht.
    * Folgende Felder können nachträglich geändert werden: Titel, zugewiesene Kategorien/Tags, Coverbild, Previewbild.

#### D. Videoliste & Anzeige (Desktop-Ansicht)

* **Standardansicht:** Standardmäßig werden die **25 neusten Videos** angezeigt.
* **Sortierung:** Die Videos sind chronologisch absteigend sortiert (neueste zuerst).
* **Paginierung/Anzahl:** Der Nutzer kann auswählen, wie viele Videos pro Seite angezeigt werden sollen (Optionen: 25, 50, Alle).
* **Darstellung:** Videos werden in einer Übersicht mit ihrem hochkanten Coverbild dargestellt.
* **Informationen pro Video:**
    * Titel des Videos (unter dem Cover).
    * Videolänge.
    * Ein **gelber Stern** wird auf dem Cover angezeigt, wenn das Video als Favorit markiert ist.
* **Interaktion:** Bei Hover über ein Coverbild wird das zugehörige Previewbild angezeigt.
* **Suche & Filter:**
    * Eine prominente Suchleiste ermöglicht eine **Live-Suche**.
    * Darunter befinden sich Dropdown-Menüs für Kategorien und Tags.
    * Die gesamte Such- und Filterleiste ist oben fixiert und scrollt mit der Seite mit.

#### E. Favoriten

* **Markierung:** Jedes Video kann als Favorit markiert/demarkiert werden.
* **Anzeige:** Die Ansicht "Favoriten" (erreichbar über die Sidebar) ist eine gefilterte Ansicht der Videoliste, die nur favorisierte Videos anzeigt.

#### F. Einstellungen

* Der Nutzer kann eigene **Kategorien** erstellen (Beispiel: "Haarfarbe").
* Zu jeder Kategorie können beliebig viele **Tags** hinzugefügt werden (Beispiel: Zur Kategorie "Haarfarbe" wird der Tag "Blond" hinzugefügt).

#### G. Video-Player-Ansicht

* **Player-Funktionen:** Standardsteuerelemente wie Play/Pause und ein Vollbildmodus müssen vorhanden sein.
* **Aktionen:** In dieser Ansicht befinden sich die Buttons zum Favorisieren, Bearbeiten und Löschen des Videos.

---

## 4. Nicht-funktionale Anforderungen

* **Performance:**
    * Die Live-Suche soll Ergebnisse in unter 500 ms liefern.
    * Das Laden der Videoliste (Standardansicht, 25 Videos) soll unter 2 Sekunden dauern.
* **Benutzerfreundlichkeit (Usability):**
    * **Fehlerbehandlung:** Wenn ein Upload fehlschlägt, muss eine klare Fehlermeldung mit einer "Erneut versuchen"-Option angezeigt werden.
* **Kompatibilität:**
    * **Primärplattform:** Die Anwendung ist für die Nutzung auf einem **PC** optimiert.
    * **Unterstützte Browser:** Google Chrome in der jeweils aktuellen Version.
    * **Mobile Ansicht (Responsive Design):** Auf mobilen Geräten ist der Funktionsumfang bewusst reduziert:
        * Es wird ausschließlich die Video-Listenansicht (inkl. Suche und Filter) angezeigt.
        * Die Darstellung zeigt nur ein Videocover pro Reihe.
        * Durch Scrollen nach unten werden die nächsten Videos nachgeladen (Infinite Scrolling).
    * **(Optional) PWA-Unterstützung:** Die Anwendung soll als Progressive Web App (PWA) installierbar sein, um einen App-ähnlichen Start von Desktop oder Homescreen zu ermöglichen.
* **Sicherheit:**
    * Auf eine Verschlüsselung (Hashing) des Passworts in der Datenbank kann verzichtet werden, da der Zugriff auf die Anwendung bereits auf Netzwerkebene durch IP- und Port-Beschränkungen gesichert ist.

---

## 5. Technische Rahmenbedingungen & Vorgaben

### 5.1. Vorgegebener Technologie-Stack (TechStack)

* **Frontend:** Vite, React, TypeScript, ShadCN/UI
* **Backend:** Node.js mit Express.js
* **Datenbank:** PostgreSQL
* **Deployment:** Die gesamte Anwendung muss über Docker containerisiert werden.

### 5.2. Vorgegebene Dateistruktur

* **Video-Uploads:** Dateien werden auf dem Server in einem Root-Verzeichnis `/uploads/` gespeichert. Für jedes Video wird ein eigener Ordner basierend auf dem Videotitel angelegt.
    * *Struktur:* `/uploads/{videotitel}/`
    * *Beispiel Video:* `/uploads/Harry_Potter_1/Harry_Potter_1.mp4`
    * *Beispiel Cover:* `/uploads/Harry_Potter_1/Harry_Potter_1_Cover.jpg`
    * *Beispiel Preview:* `/uploads/Harry_Potter_1/Harry_Potter_1_Preview.jpg`
* **Backend API-Pfade:**
    * *Struktur:* `/api/{kategorie}/`
    * *Beispiel:* `/api/auth/login.js`
* **Frontend Seiten-Pfade:**
    * *Struktur:* `/src/pages/{kategorie}/`
    * *Beispiel 1:* `/src/pages/login/index.tsx`
    * *Beispiel 2:* `/src/pages/login/components/loginForm.tsx`
