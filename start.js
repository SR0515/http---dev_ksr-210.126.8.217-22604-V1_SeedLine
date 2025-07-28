import { exec } from 'child_process';

const child = exec('npm run dev -- --port 23345', {
  cwd: process.cwd(),
  windowsHide: true
});

child.stdout.on('data', (data) => {
  console.log(data.toString());
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('error', (error) => {
  console.error('Error starting server:', error);
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});