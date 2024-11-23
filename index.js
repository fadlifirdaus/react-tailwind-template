#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const templateDir = path.join(path.dirname(__filename), 'template');

async function createProject() {
    // Validasi argumen project name
    const projectName = process.argv[2];

    if (!projectName) {
        console.error(chalk.red('❌ Please specify the project name:'));
        console.log(
            `  ${chalk.cyan('npx')} ${chalk.green('react-tailwind-template')} ${chalk.yellow('<project-name>')}\n`
        );
        process.exit(1);
    }

    // Validasi nama proyek
    if (!/^[a-z0-9-]+$/.test(projectName)) {
        console.error(chalk.red('❌ Project name can only contain lowercase letters, numbers, and hyphens'));
        process.exit(1);
    }

    // Validasi panjang nama
    if (projectName.length > 50) {
        console.error(chalk.red('❌ Project name is too long (max 50 characters)'));
        process.exit(1);
    }

    // Cek apakah direktori sudah ada
    if (fs.existsSync(projectName)) {
        console.error(chalk.red(`❌ Directory ${projectName} already exists`));
        process.exit(1);
    }

    try {
        console.log(chalk.blue(`Creating new React+Tailwind project: ${projectName}...`));

        // Membuat proyek Vite
        execSync(`npm create vite@latest ${projectName} -- --template react`, {
            stdio: 'inherit',
            shell: true
        });

        // Pindah ke direktori proyek
        process.chdir(projectName);

        console.log(chalk.blue('\nInstalling dependencies...'));
        // Install dependencies
        execSync('npm install', { stdio: 'inherit' });
        execSync('npm install -D tailwindcss postcss autoprefixer', { stdio: 'inherit' });

        console.log(chalk.blue('\nConfiguring Tailwind...'));
        // Inisialisasi Tailwind
        execSync('npx tailwindcss init -p', { stdio: 'inherit' });

        // Update tailwind.config.js
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

        fs.writeFileSync('tailwind.config.js', tailwindConfig);

        // Update index.css
        const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

        fs.writeFileSync('src/index.css', cssContent);

        // Buat contoh komponen
        const exampleComponent = `import React from 'react'

export default function Example() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to React + Tailwind
        </h1>
        <p className="text-gray-600 mb-4">
          Your project is ready! Start editing this component at:
        </p>
        <code className="block bg-gray-100 p-3 rounded text-sm">
          src/components/Example.jsx
        </code>
      </div>
    </div>
  )
}`;

        // Buat direktori components
        if (!fs.existsSync('src/components')) {
            fs.mkdirSync('src/components');
        }
        fs.writeFileSync('src/components/Example.jsx', exampleComponent);

        // Update App.jsx
        const appContent = `import Example from './components/Example'

function App() {
  return (
    <Example />
  )
}

export default App`;

        fs.writeFileSync('src/App.jsx', appContent);

        console.log(chalk.green('\n✨ Project created successfully!'));
        console.log(chalk.cyan('\nNext steps:'));
        console.log(chalk.yellow(`  cd ${projectName}`));
        console.log(chalk.yellow('  npm run dev\n'));

    } catch (error) {
        console.error(chalk.red('❌ Error creating project:'));
        console.error(error);
        process.exit(1);
    }
}

createProject().catch((err) => {
    console.error(chalk.red('❌ Unexpected error:'));
    console.error(err);
    process.exit(1);
});