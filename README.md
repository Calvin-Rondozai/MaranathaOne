# Maranatha One

![platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-blue)
![expo](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo)
![offline](https://img.shields.io/badge/offline--first-yes-brightgreen)

An offline-first companion app for Seventh-day Adventists — Bible, hymnal, Ellen G.
White's writings, Bible commentary, Sabbath School lessons, devotionals, prayer, notes,
and health tracking, all in one place, all available without a connection.

## Features

- **Bible** — five translations, cross-references, side-by-side comparison, verse
  highlighting and notes
- **Bible Commentary** — S.D.A. Bible Commentary, volumes 1–6, linked verse-by-verse
  to the Bible reader
- **Ellen G. White library** — ~40 titles, searchable, with page numbers and
  highlighting
- **Hymnal** — English, chiShona, isiNdebele, with a quick jump-to-number dial
- **Sabbath School** — current quarter's lesson, auto-downloaded when you're online;
  English or chiShona, standard or Easy Reading Edition
- **Fundamental Beliefs**, devotionals, and offertory readings with verse-tailored
  commentary
- **Prayer requests** and a **Notes** app with checklists and reminders
- **Health tracking** — water intake, exercise
- Reminders for prayer, Sabbath prep, chapter-a-day reading, and more — all
  individually controllable from Settings

## Getting started

```bash
npm install
npx expo start
```

Requires a dev client for notifications (`npx expo run:android` / `run:ios`) — Expo
Go alone covers everything else.

## Content

Bible translations, the EGW library, and the Fundamental Beliefs are public-domain or
used under a permissive license. Sabbath School lessons are synced from
[Adventech/sabbath-school-lessons](https://github.com/Adventech/sabbath-school-lessons)
for personal offline reading; the lesson text itself remains under the General
Conference's copyright. See `DEV_MODE.md` for the full sourcing and licensing
breakdown, plus the technical map of the codebase.

## License

Personal-use project. Bundled third-party content retains its own license — see
`DEV_MODE.md`.
