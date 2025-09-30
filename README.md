# japanolearn-opensource

The Open-Source Version of Japanolearn, use it, improve it and have fun!

I am updating the project everyday and I am hoping that I will be able to make the alpha version of this project by the end of October 2025 with a demo ready

<img width="1201" alt="image" src="https://github.com/user-attachments/assets/6ec87cdb-44c5-42fd-b6e2-b4e9f40bf999" />

# japanolearn-opensource

Japanolearn-Opensource is an open-source Japanese learning Application which is made with a goal of acccessibility to learn Japanese in Mind. The software is free and the source code is available for anyone to see and critique.

The app is work in progress and it will take some time for the app's V0.5 Alpha to come up. We are thinking of releasing it by the end of May 2025!

## Current Progress Status

As of May 20, We were able to create a stable version and were able to push it on Github
Currently we are working on
1-Creating Auto Update
2-Making Demo Lessons
3-Create Proper Lesson and exercise structure

##Features

The program has the following features

###Lessons

The application has a lesson feature where different aspects of the Japanese Language (Grammar, reading, learing Hiragana, etc) are incorporated into bite-size lessons

###Exercises

The exercise section has lots of exercises which are based on lessons, these can range from Kanji quizzes, grammar practice and also reading and comprehension practice.

###Dictionary

The Dictionary has a interactive easy to search dictionary which can be used for searching words when you feel like it!
(This is quasi finished)

### ‼️Just a Disclaimer that the application is not perfect and it has been my first app, I will continuously try to improve on it‼️

### No Warranty is covered with this application

## Recommended IDE Setup

The Japanolearn app is made through Electron and is run with Typecript and Javascript and therefore having some experience with Javascript and React will definitely help with working on the Japanolearn's Application development.

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## The current project setup looks like this!

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

This may or may not work, still a WIP

```bash
# For windows
$ npx electron-vite build && npx electron-builder --win -x64

# For macOS
$ npx electron-vite build && npx electron-builder --mac --universal

# For Linux (Not yet tested)
$ npx electron-vite build && npx electron-builder --linux
```

If you want to have the executable file, please let me know.

### Git Commit Style Rules (Recommendations)

Use the following things at the start of the commit so it is easy to under what it was doing :D

1. chore
2. docs
3. style
4. feature
5. fix
6. refactor
7. test
