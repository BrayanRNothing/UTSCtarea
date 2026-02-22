const { execSync } = require('child_process');
try {
    execSync('npx prisma db push', { stdio: 'pipe', encoding: 'utf-8' });
    console.log('Success');
} catch (e) {
    console.error(e.stdout);
    console.error(e.stderr);
}
