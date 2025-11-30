const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Commit messages
const messages = [
    "feat: add new feature",
    "fix: resolve issue",
    "docs: update docs",
    "refactor: improve code",
    "style: formatting",
    "perf: optimize performance",
    "test: add tests",
    "chore: cleanup"
];

// Tasks
const tasks = [
    "Improve UI",
    "Fix auth bug",
    "Optimize API",
    "Refactor logic",
    "Add validation",
    "Update README",
    "Enhance UX"
];

// Random item
function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate random time for a date
function getRandomDateTime(baseDate) {
    const date = new Date(baseDate);

    date.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60)
    );

    return date.toISOString();
}

// Ask input
function ask(question, def) {
    return new Promise(resolve => {
        rl.question(`${question} (default ${def}): `, ans => {
            resolve(ans.trim() || def);
        });
    });
}

// Make commit
function makeCommit(repoPath, useEmptyCommit, date) {
    const message = randomItem(messages);
    const commitDate = getRandomDateTime(date);

    console.log(`📝 ${message} | 📅 ${commitDate}`);

    if (!useEmptyCommit) {
        const file = path.join(repoPath, "activity.txt");
        const content = `✔ ${randomItem(tasks)} - ${new Date().toISOString()}\n`;

        fs.appendFileSync(file, content);
        execSync("git add .", { cwd: repoPath, stdio: "inherit" });
    }

    execSync(
        `git commit ${useEmptyCommit ? "--allow-empty" : ""} --date="${commitDate}" -m "${message}"`,
        { cwd: repoPath, stdio: "inherit" }
    );
}

// Get all dates between range
function getDateRange(startDate, endDate) {
    const dates = [];
    let current = new Date(startDate);
    const last = new Date(endDate);

    while (current <= last) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

// Main
async function main() {
    console.log("=".repeat(50));
    console.log("🚀 Date Range Contribution Generator");
    console.log("=".repeat(50));

    const repoPath = await ask("Repo path", ".");
    const startDate = await ask("Start date (YYYY-MM-DD)", "2025-01-01");
    const endDate = await ask("End date (YYYY-MM-DD)", "2025-01-10");
    const useEmpty = (await ask("Empty commits? (yes/no)", "no")) === "yes";

    const dates = getDateRange(startDate, endDate);

    console.log("\n⚡ Generating commits...\n");

    for (let d of dates) {
        // 1 or 2 commits per day
        const commitsToday = Math.floor(Math.random() * 2) + 1;

        console.log(`📅 ${d.toISOString().split("T")[0]} → ${commitsToday} commits`);

        for (let i = 0; i < commitsToday; i++) {
            makeCommit(repoPath, useEmpty, d);

            // small delay
            await sleep(Math.floor(Math.random() * 2000) + 1000);
        }
    }

    console.log("\n🚀 Pushing...");
    execSync("git push", { cwd: repoPath, stdio: "inherit" });

    console.log("✅ Done! Check GitHub graph after some time 😎");

    rl.close();
}

main();