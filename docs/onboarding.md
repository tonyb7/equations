# Getting started with Equations Online

You don't need to know how to code before starting. Your first goal is to run the game on your computer, understand one small part of it, and make a change that Tony can review.

## 1. Know what you're joining

- Play the game: https://equations-online.herokuapp.com/
- Find the code: https://github.com/tonyb7/equations
- GitHub stores the code and proposed changes.
- Heroku runs the public website.
- ChatGPT helps explain concepts and think through problems.
- Codex can work with project files, make changes, and run checks.

The project uses Python for the server, JavaScript for the game in your browser, and a database for accounts and saved games. You can learn these a little at a time.

## 2. Create your accounts

**GitHub:** Go to https://github.com/signup, create your own account, verify your email, and send Tony your username. He will invite you to the repository; accept the invitation. Choose an email you're comfortable using for coding and avoid putting personal details in your public profile. [GitHub invitation instructions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository).

GitHub's minimum age is 13, with potentially higher local requirements. [GitHub terms](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service).

**ChatGPT:** Create your own account at https://chatgpt.com. Since you're 16, get a parent or legal guardian's permission first. Use your real age. [OpenAI terms](https://openai.com/policies/terms-of-use/).

**Heroku:** Skip this for your first steps. Tony will manage the existing hosting account and deployments. You can develop and test the app locally without a Heroku account or payment card. Before setting up your own Heroku access, Tony should check the applicable account eligibility rules with you; Heroku's student offer explicitly requires age 18+. [Student offer eligibility](https://www.heroku.com/github-students/).

Ask Tony before buying an AI subscription or any hosting. Start with the access your account provides. Never share account passwords; use invitations for collaboration.

## 3. Install your tools

These commands are for a **Mac**. If you're on Windows, tell Tony before following this section; the project's shell scripts need a Linux-style environment such as WSL.

Install Homebrew using https://brew.sh, then open Terminal and run:

```bash
brew install git python@3.12 node
```

Terminal is a way to give your computer written instructions. Paste one command at a time and wait for it to finish. If something fails, stop and copy the error into ChatGPT or Codex rather than trying random commands.

An editor such as [Visual Studio Code](https://code.visualstudio.com/) is useful for viewing files. For AI help, follow the [official Codex quickstart](https://developers.openai.com/codex/quickstart), sign in with your own ChatGPT account, and choose the app or editor experience available for your computer. You only need one interface to start; you can learn the command-line interface later.

## 4. Download and run the project

In Terminal:

```bash
mkdir -p ~/code
cd ~/code
git clone https://github.com/tonyb7/equations.git
cd equations
python3.12 -m venv env
source env/bin/activate
python -m pip install -r requirements.txt
npm install
npm test
npm start
```

What these steps do:

- `git clone` downloads a working copy of the code.
- `cd` moves you into a folder.
- The virtual environment keeps this project's Python packages together.
- The install commands download the libraries the project needs.
- `npm test` builds the browser code and checks the app.
- `npm start` runs your local website.

Open **http://localhost:8000**. This is your own copy, separate from the public website. Local setup uses SQLite and creates its database automatically; you don't need to install Postgres or copy production credentials.

Create two local game accounts. Use a regular browser window for one and a private window for the other. Join the same room, send a chat message, and start a game with both players present.

Press **Control+C** in Terminal to stop the server. Next time, run:

```bash
cd ~/code/equations
source env/bin/activate
npm start
```

After changing JavaScript, run `npm run build` and refresh the browser. If the server needs restarting, stop it and run `npm start` again.

## 5. Learn with AI while you work

Open the `equations` folder in your coding tool. Start with this prompt:

> I'm 16 and new to coding. Read README.md, setup.py, package.json, and the project files. Explain how this app works in plain language. Give me a short tour of the main folders. Don't change anything yet. Ask me one question at a time to check my understanding.

When you're stuck:

> I ran [command] and expected [result], but got this error: [paste error]. Explain what it means, investigate the cause, and suggest the smallest fix. Explain commands before asking me to run them.

For your first change:

> Help me make [one specific change]. First show me the relevant files and explain the plan. Keep the change small, run the relevant checks, and explain the diff afterward. Work on a branch. Don't push to master or deploy to Heroku.

AI can be wrong. Check the result yourself. Ask: “How did you test this?” and “What could this break?” If it gives you code you can't explain, ask for a walkthrough. Never paste passwords, database connection strings, or real users' private information into a prompt.

## 6. Submit your first change

A **branch** is your workspace for a change. A **commit** saves a version. A **pull request** asks someone to review your branch before adding it to the main code.

Before editing:

```bash
git switch master
git pull --ff-only origin master
git switch -c improve-game-instructions
```

Try improving an instruction or button label first. Avoid starting with a whole mobile app or a new game engine.

After editing:

```bash
npm test
git diff
git status
```

Ask Codex to explain the changes and help you commit only the files you meant to change. Push your branch, then open a pull request on GitHub with **master** as the destination. Include what changed, why, and how you tested it. Ask Tony to review it. Tony handles merging and deploying while you're learning.

## 7. Pick a direction after your first contribution

- **On-Sets:** compare the advanced high-school restrictions in the official rules with what the app currently does. Write examples of missing behavior before implementing it.
- **Ling and WFF:** start with one playable interaction, using the exact rules and examples Tony provides.
- **Mobile:** first test the existing site on iPhone and Android and list the screens that are hard to use. Decide with Tony whether to improve the mobile website or build an app.
- **Users:** invite a few friends or Academic Games players to try it. Ask what they used, where they got stuck, and whether they'd return. Ask before recording or publishing anyone's feedback.

Your first-week checklist: accounts ready, repository invitation accepted, local app running, two-player game tested, one small pull request submitted, and a short explanation of what you learned.

## Tony's setup checklist

- Invite his GitHub username to `tonyb7/equations`.
- Help with the first installation session and confirm his operating system.
- Arrange parent or guardian permission for ChatGPT and agree on any paid usage.
- Pick a small first issue and review his pull request together.
- Keep hosting, production data, and deployments under your supervision while he learns.
